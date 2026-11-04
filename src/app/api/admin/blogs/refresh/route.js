import { revalidatePath } from "next/cache";
import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { importBlogContent } from "@/lib/blog-import.mjs";

export const runtime = "nodejs";
export const maxDuration = 300;
let refreshing = false;

export async function POST(request) {
  try {
    await authorizeAdminRequest(request, "blogs");
  } catch (error) { return adminApiError(error); }
  if (refreshing) return Response.json({ message: "A refresh is already running. Please try again shortly." }, { status: 409 });
  refreshing = true;
  try {
    const result = await importBlogContent({ refreshSheet: true, refreshArticles: true, strict: true });
    revalidatePath("/blogs", "layout");
    revalidatePath("/admin/blogs");
    revalidatePath("/sitemap.xml");
    return Response.json({ ...result, message: `Updated ${result.total} blog(s) from Google Sheet. Website content is up to date.` }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Blog refresh failed:", error.message);
    return Response.json({ message: "Unable to refresh. Check that the sheet and linked Google Docs are shared for reading, then try again. Existing articles have been kept." }, { status: 502 });
  } finally { refreshing = false; }
}
