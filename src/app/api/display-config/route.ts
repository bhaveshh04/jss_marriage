
import { NextResponse } from "next/server";
import { COOKIE, verifySession, isAdmin } from "@/lib/auth";
import { getDisplayConfig, updateDisplayConfig } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getDisplayConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("GET /api/display-config error:", error);

    return NextResponse.json(
      { error: "Failed to fetch display configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await verifySession(
      cookies().get(COOKIE)?.value
    );

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: "Admin only" },
        { status: 403 }
      );
    }

    const rows = await req.json().catch(() => []);

    await updateDisplayConfig(rows);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/display-config error:", error);

    return NextResponse.json(
      { error: "Failed to update display configuration" },
      { status: 500 }
    );
  }
}
