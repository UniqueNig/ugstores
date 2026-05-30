import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route gate for /admin/* and /dashboard/*.
 *
 * WHY this lives at the PROJECT ROOT: Next.js only runs `middleware.ts` from the
 * repo root (or src/). The old copy was at `app/middleware.ts`, which Next
 * silently ignores — so admin routes had no server-side gate at all.
 *
 * WHY we DON'T use `jsonwebtoken` here: middleware runs on the Edge runtime,
 * which has no Node `crypto`, so `jwt.verify` throws. Instead we do a cheap,
 * Edge-safe check — decode the JWT payload (base64url) and confirm the role and
 * expiry. This is only a UX gate (redirect unauthenticated users to login).
 * The REAL cryptographic verification still happens server-side in the GraphQL
 * context (app/api/graphql/route.ts), which is what actually guards the data.
 */

type Payload = { role?: string; exp?: number };

function decodeJwt(token: string): Payload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    // base64url → base64, then atob (available on the Edge runtime).
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Payload;
  } catch {
    return null;
  }
}

function isValid(token: string | undefined, roles: string[]): boolean {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  if (roles.length && !roles.includes(payload.role ?? "")) return false;
  return true;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The admin login page must stay public, or you can never get in.
  if (pathname === "/admin/login") return NextResponse.next();

  // 🔒 Admin area — requires an admin/superadmin token.
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value;
    if (!isValid(token, ["admin", "superadmin"])) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // 🔒 Customer dashboard — requires any logged-in user token.
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("user_token")?.value;
    if (!isValid(token, [])) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
