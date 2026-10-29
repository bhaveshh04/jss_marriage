import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "mvm_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-secret-change-me-please-32chars");

export type SessionPayload = { user: string; role?: string; userId?: number };

export async function signSession(user: string, role = "admin", userId?: number) {
  return new SignJWT({ user, role, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret())).payload as SessionPayload;
  } catch {
    return null;
  }
}

export function isAdmin(session: SessionPayload | null) {
  return session?.role === "admin";
}
