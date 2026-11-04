import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { AdminAccessError } from "@/lib/admin-access.mjs";
import { findBlog } from "@/lib/blogs";
import { saveBlogImage, discardBlogImage } from "@/lib/blog-images";
import { updateBlogImage } from "@/lib/admin-db";
import { readBranchForm } from "@/lib/branch-api";
import { BranchError } from "@/lib/branch-values.mjs";

export const runtime = "nodejs";
export async function POST(request, { params }) {
  let filename;
  try {
    await authorizeAdminRequest(request, "blogs");
    const { slug } = await params;
    if (!await findBlog(slug)) throw new AdminAccessError("Article not found.", 404);
    const form = await readBranchForm(request);
    if ([...form.keys()].some(key => key !== "image") || form.getAll("image").length !== 1) throw new AdminAccessError("Only one blog image can be updated.");
    filename = await saveBlogImage(form.get("image"));
    await updateBlogImage(slug, filename);
    // Previous immutable image URLs remain valid for cached pages.
    return Response.json({ message: "Blog image updated.", image: `/api/blog-images/${filename}` }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (filename) await discardBlogImage(filename);
    if (error instanceof BranchError) return Response.json({ message: error.message }, { status: error.status });
    return adminApiError(error);
  }
}
