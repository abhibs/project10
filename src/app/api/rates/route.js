import { getRates } from "@/lib/admin-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rate = await getRates();
    if (!rate) return Response.json({ message: "Rates have not been published yet." }, { status: 404 });
    return Response.json(rate, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public rate loading failed:", error);
    return Response.json({ message: "Rates are temporarily unavailable." }, { status: 503 });
  }
}
