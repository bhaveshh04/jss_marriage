import { NextResponse } from "next/server";
import { COOKIE, verifySession, isAdmin } from "@/lib/auth";
import { listUsers, createUser } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  const session = await verifySession(cookies().get(COOKIE)?.value);
  if (!isAdmin(session)) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const users = await listUsers();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await verifySession(cookies().get(COOKIE)?.value);
  if (!isAdmin(session)) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { username, password, display_name, role } = await req.json().catch(() => ({}));
  if (!username || !password) return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  try {
    await createUser(username, password, display_name || username, role || "operator");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Could not create user" }, { status: 400 });
  }
}
