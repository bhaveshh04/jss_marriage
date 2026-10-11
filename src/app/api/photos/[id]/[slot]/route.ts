import { getPhoto } from "@/lib/db";

// Always hit the database; never let Next.js cache this route or the Neon fetch calls inside it.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string; slot: string } }) {
  try {
    const p = await getPhoto(Number(params.id), Number(params.slot));
    if (!p) return new Response("Photo not found", { status: 404, headers: { "Cache-Control": "no-store" } });
    const bytes = new Uint8Array(Buffer.from(p.data_b64, "base64"));
    return new Response(bytes, {
      headers: {
        "Content-Type": p.mime || "image/jpeg",
        "Content-Length": String(bytes.length),
        // URL carries ?v=<updated>, so it is safe to cache in the browser — makes the slideshow instant
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("[photo]", e);
    return new Response("Could not load photo", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
