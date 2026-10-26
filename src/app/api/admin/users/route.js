import bcrypt from "bcryptjs";
import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { validateAdminUser, assertAdminUserChange } from "@/lib/admin-access.mjs";
import { getAdminUsers, saveAdminUser } from "@/lib/admin-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const actor = await authorizeAdminRequest(request, "admins");
    return Response.json({ users: await getAdminUsers(actor) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return adminApiError(error); }
}

export async function POST(request) {
  try {
    const actor = await authorizeAdminRequest(request, "admins");
    const values = validateAdminUser(await request.json(), true);
    assertAdminUserChange(actor, null, values);
    const id = await saveAdminUser(actor, null, values, await bcrypt.hash(values.password, 10));
    return Response.json({ id, message: "Account created successfully." }, { status: 201 });
  } catch (error) { return adminApiError(error); }
}
