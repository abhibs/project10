import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "./admin-session";
import { findAdminById } from "./admin-db";
import { AdminAccessError, adminHome, adminProfile, hasAdminPermission } from "./admin-access.mjs";
import { isAllowedBranchOrigin } from "./branch-origin.mjs";

export async function currentAdmin() {
  const session = readAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) return null;
  const admin = await findAdminById(session.id);
  if (!admin || Number(admin.session_version || 0) !== Number(session.version || 0)) return null;
  return admin;
}

export async function requireAdminPage(permission) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  if (permission && !hasAdminPermission(admin, permission)) redirect(adminHome(admin));
  return adminProfile(admin);
}

export async function authorizeAdminRequest(request, permission) {
  const admin = await currentAdmin();
  if (!admin) throw new AdminAccessError("Please sign in again.", 401);
  if (permission && !hasAdminPermission(admin, permission)) throw new AdminAccessError("You do not have access to this section.", 403);
  if (request && !["GET", "HEAD"].includes(request.method) && !isAllowedBranchOrigin(request)) {
    throw new AdminAccessError("Request origin is not allowed.", 403);
  }
  return admin;
}

export function adminApiError(error) {
  if (error instanceof AdminAccessError) return Response.json({ message: error.message }, { status: error.status });
  if (error?.code === "ER_DUP_ENTRY") return Response.json({ message: "That email address is already in use." }, { status: 409 });
  if (error instanceof SyntaxError) return Response.json({ message: "Invalid request data." }, { status: 400 });
  console.error("Admin request failed:", error.code || error.message);
  return Response.json({ message: "Unable to complete the request. Please try again." }, { status: 500 });
}
