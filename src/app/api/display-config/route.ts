import { NextResponse } from "next/server";
import { COOKIE, verifySession, isAdmin } from "@/lib/auth";
import { getDisplayConfig, updateDisplayConfig } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  const config = await getDisplayConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const session = await verifySession(cookies().get(COOKIE)?.value);
  if (!isAdmin(session)) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const rows = await req.json().catch(() => []);
  await updateDisplayConfig(rows);
  return NextResponse.json({ ok: true });
}
