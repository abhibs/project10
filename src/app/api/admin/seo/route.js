import { authorizeAdminRequest } from "@/lib/admin-auth";
import { getSeoPages, saveSeoPage, deleteSeoPage } from "@/lib/admin-db";
import { validateSeo } from "@/lib/seo-fields.mjs";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function errorResponse(error) {
  if (error.code === "ER_DUP_ENTRY") return Response.json({ message: "This route already has an SEO record." }, { status: 409 });
  return Response.json({ message: error.status ? error.message : "Unable to complete the SEO request." }, { status: error.status || 500 });
}

export async function GET(request) {
  try {
    await authorizeAdminRequest(request, "seo");
    return Response.json({ pages: await getSeoPages() });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request) {
  try {
    await authorizeAdminRequest(request, "seo");
    const body = await request.json();
    let values;
    try { values = validateSeo(body); } catch (error) { return Response.json({ message: error.message }, { status: 400 }); }
    const id = body.id == null ? null : Number(body.id);
    if (id !== null && (!Number.isSafeInteger(id) || id < 1)) return Response.json({ message: "Invalid SEO record." }, { status: 400 });
    await saveSeoPage(id, values);
    revalidatePath("/", "layout");
    return Response.json({ pages: await getSeoPages(), route: values.route_path, message: "SEO saved successfully." });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request) {
  try {
    await authorizeAdminRequest(request, "seo");
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return Response.json({ message: "Invalid SEO record." }, { status: 400 });
    await deleteSeoPage(id);
    revalidatePath("/", "layout");
    return Response.json({ pages: await getSeoPages(), message: "SEO record removed. Code defaults will be used." });
  } catch (error) { return errorResponse(error); }
}
