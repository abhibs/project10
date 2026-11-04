import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { blogDataset, blogImages, blogSummary, blogImage } from "@/lib/blogs";
export const dynamic = "force-dynamic";
export async function GET(request) {
  try {
    await authorizeAdminRequest(request, "blogs");
    const [{ posts, source }, images] = await Promise.all([blogDataset(), blogImages()]);
    return Response.json({ posts: posts.map(post => ({ ...blogSummary(post), image: blogImage(post, images) })), source }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return adminApiError(error); }
}
