/**
 * Returns the right Authorization header value for raw fetch() calls to
 * /api/graphql from the browser.
 *
 * This mirrors the Apollo client's logic: admin pages act with the admin
 * token, everything else with the user token. Sending it EXPLICITLY (instead
 * of relying on cookies) is what lets an admin and a normal user stay logged
 * in on the same browser at once without their identities colliding — the
 * server's cookie fallback would otherwise always prefer the admin token.
 */
export function authHeaderValue(): string {
  if (typeof document === "undefined") return "";
  const isAdmin = window.location.pathname.startsWith("/admin");
  const name = isAdmin ? "admin_token" : "user_token";
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
  return token ? `Bearer ${token}` : "";
}
