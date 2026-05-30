/**
 * Rate limiter for public API routes.
 *
 * Two backends:
 *  1. Upstash Redis (shared across all serverless instances) — used when
 *     UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set. This is the
 *     real, hard limit and survives cold starts.
 *  2. In-memory fallback — per-instance, resets on cold start. Used in local
 *     dev and whenever Redis isn't configured or is unreachable. Combined with
 *     the form honeypots it stops casual spam.
 *
 * Callers should use the async `rateLimitAsync`. The sync `rateLimit` (memory
 * only) is kept for any non-async call sites.
 */

// ── In-memory backend ────────────────────────────────────────────────────────
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now > rec.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (rec.count >= limit) return false;
  rec.count++;
  return true;
}

// ── Upstash Redis backend (REST API, no SDK needed) ──────────────────────────
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Fixed-window counter in Redis: INCR the key, and on the first hit set the
 * window's expiry (PEXPIRE ... NX only sets it when no TTL exists yet, so the
 * window doesn't keep sliding). Returns the new count, or null on any failure
 * so the caller can fall back to the in-memory limiter.
 */
async function redisIncr(key: string, windowMs: number): Promise<number | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["PEXPIRE", key, windowMs, "NX"],
      ]),
      // Don't let a slow Redis stall the request indefinitely.
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Pipeline returns [{ result: <count> }, { result: <0|1> }]
    const count = Array.isArray(data) ? data[0]?.result : null;
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the action is ALLOWED, false if the limit is exceeded.
 * Uses Redis when available, otherwise the in-memory limiter.
 */
export async function rateLimitAsync(
  key: string,
  limit = 5,
  windowMs = 60_000,
): Promise<boolean> {
  const count = await redisIncr(key, windowMs);
  if (count === null) {
    // Redis not configured or unreachable → in-memory fallback.
    return rateLimit(key, limit, windowMs);
  }
  return count <= limit;
}

/** Pull a best-guess client IP from request headers. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
