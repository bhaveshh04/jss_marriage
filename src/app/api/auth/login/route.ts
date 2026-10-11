import { NextResponse } from "next/server";
import { COOKIE, signSession } from "@/lib/auth";
import { checkCredentials } from "@/lib/credentials";

export async function POST(req: Request) {
  const { username = "", password = "" } = await req.json().catch(() => ({}));
  if (!checkCredentials(String(username), String(password))) {
    return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession(String(username)), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12,
  });
  return res;
}
