import { readBranchImage } from "@/lib/branch-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { filename } = await params;
    const image = await readBranchImage(filename);
    if (!image) return new Response("Image not found", { status: 404 });
    return new Response(image, { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Image unavailable", { status: 503 }); }
}
