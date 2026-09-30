import { getBranches } from "@/lib/admin-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ branches: await getBranches(true) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public branch loading failed:", error);
    return Response.json({ message: "Branch locations are temporarily unavailable." }, { status: 503 });
  }
}
