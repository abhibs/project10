import { readBlogImage } from "@/lib/blog-images";
export const runtime = "nodejs";
export async function GET(_request, { params }) {
  const image = await readBlogImage((await params).filename);
  if (!image) return new Response("Image not found", { status: 404 });
  return new Response(image, { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
}
