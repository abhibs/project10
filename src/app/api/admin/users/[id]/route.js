import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { AdminAccessError, validateAdminUser } from "@/lib/admin-access.mjs";
import { findAdminById, saveAdminUser } from "@/lib/admin-db";
import { ADMIN_SESSION_COOKIE, createAdminSession, sessionCookieOptions } from "@/lib/admin-session";

export const runtime = "nodejs";

async function recordId(params) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new AdminAccessError("Account not found.", 404);
  return Number(id);
}

export async function PUT(request, { params }) {
  try {
    const actor = await authorizeAdminRequest(request, "admins");
    const id = await recordId(params);
    const values = validateAdminUser(await request.json());
    const hash = values.password ? await bcrypt.hash(values.password, 10) : null;
    await saveAdminUser(actor, id, values, hash);
    const response = NextResponse.json({ message: "Account updated successfully." });
    if (String(actor.id) === String(id)) {
      response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(await findAdminById(id)), sessionCookieOptions);
    }
    return response;
  } catch (error) { return adminApiError(error); }
}

export async function DELETE(request, { params }) {
  try {
    const actor = await authorizeAdminRequest(request, "admins");
    await saveAdminUser(actor, await recordId(params), null, null, true);
    return Response.json({ message: "Account deleted successfully." });
  } catch (error) { return adminApiError(error); }
}
