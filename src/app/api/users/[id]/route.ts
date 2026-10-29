import { NextResponse } from "next/server";
import { COOKIE, verifySession, isAdmin } from "@/lib/auth";
import { updateUser, deleteUser } from "@/lib/db";
import { cookies } from "next/headers";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await verifySession(cookies().get(COOKIE)?.value);
  if (!isAdmin(session)) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const data = await req.json().catch(() => ({}));
  await updateUser(Number(params.id), data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await verifySession(cookies().get(COOKIE)?.value);
  if (!isAdmin(session)) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  await deleteUser(Number(params.id));
  return NextResponse.json({ ok: true });
}
