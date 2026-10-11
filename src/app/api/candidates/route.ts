import { NextResponse } from "next/server";
import { candidateSchema } from "@/lib/schema";
import { createCandidate, listCandidates } from "@/lib/db";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const data = await listCandidates({
    q: sp.get("q") ?? undefined, gender: sp.get("gender") ?? undefined, status: sp.get("status") ?? undefined,
    page: Number(sp.get("page") ?? 1),
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const parsed = candidateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  try {
    const id = await createCandidate(parsed.data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    console.error("[save candidate]", e);
    const dup = String(e?.message).includes("candidates_registration_no_key");
    return NextResponse.json({ error: dup ? "This registration number already exists" : "Could not save. Please try again." }, { status: dup ? 409 : 500 });
  }
}
