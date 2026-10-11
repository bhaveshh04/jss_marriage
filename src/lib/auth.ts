import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "mvm_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-secret-change-me-please-32chars");

export async function signSession(user: string) {
  return new SignJWT({ user }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("12h").sign(secret());
}
export async function verifySession(token?: string) {
  if (!token) return null;
  try { return (await jwtVerify(token, secret())).payload as { user: string }; } catch { return null; }
}
