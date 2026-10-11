import { NextResponse } from "next/server";
import { candidateSchema } from "@/lib/schema";
import { getCandidate, softDelete, toggleActive, updateCandidate } from "@/lib/db";

type Ctx = { params: { id: string } };

export async function GET(_: Request, { params }: Ctx) {
  const c = await getCandidate(Number(params.id));
  return c ? NextResponse.json(c) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: Request, { params }: Ctx) {
  const parsed = candidateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  try {
    await updateCandidate(Number(params.id), parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[save candidate]", e);
    const dup = String(e?.message).includes("candidates_registration_no_key");
    return NextResponse.json({ error: dup ? "This registration number already exists" : "Could not save. Please try again." }, { status: dup ? 409 : 500 });
  }
}

// PATCH { is_active: boolean } — show / hide on the big screen
export async function PATCH(req: Request, { params }: Ctx) {
  const body = await req.json().catch(() => ({}));
  if (typeof body.is_active !== "boolean") return NextResponse.json({ error: "is_active required" }, { status: 400 });
  await toggleActive(Number(params.id), body.is_active);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  await softDelete(Number(params.id));
  return NextResponse.json({ ok: true });
}
