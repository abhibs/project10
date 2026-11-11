import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { syncMetaLeadsFromSheet } from "@/lib/meta-lead-sync";

export async function POST(request) {
  try { await authorizeAdminRequest(request, "contact"); } catch (error) { return adminApiError(error); }
  try {
    const result = await syncMetaLeadsFromSheet();
    return Response.json({ ...result, message: `Meta leads synced: ${result.inserted} new, ${result.updated} updated, ${result.skipped} skipped.` });
  } catch (error) {
    console.error("Unable to sync Meta leads:", error);
    return Response.json({ message: "Unable to sync Meta leads. Check the spreadsheet access and database migration." }, { status: 502 });
  }
}
