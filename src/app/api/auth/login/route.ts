import { NextResponse } from "next/server";
import { COOKIE, signSession } from "@/lib/auth";
import { verifyDbUser } from "@/lib/db";

export async function POST(req: Request) {
  const { username = "", password = "" } = await req.json().catch(() => ({}));
  const user = await verifyDbUser(String(username), String(password));
  if (!user) {
    return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(COOKIE, await signSession(user.username, user.role, user.id), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12,
  });
  return res;
}
