import { createHash, timingSafeEqual } from "node:crypto";

const h = (s: string) => createHash("sha256").update(s).digest();

/** Server-only (Node runtime). Constant-time comparison against the env credentials. */
export function checkCredentials(user: string, pass: string) {
  const u = process.env.ADMIN_USERNAME || "admin";
  const p = process.env.ADMIN_PASSWORD || "admin123";
  return timingSafeEqual(h(user), h(u)) && timingSafeEqual(h(pass), h(p));
}
