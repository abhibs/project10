import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { findAdminById, updateAdminPassword } from "@/lib/admin-db";
import { ADMIN_SESSION_COOKIE, createAdminSession, sessionCookieOptions } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const admin = await authorizeAdminRequest(request);

    const { currentPassword, newPassword } = await request.json();
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ message: "Both password fields are required." }, { status: 400 });
    }
    if (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
      return NextResponse.json({ message: "New password must contain at least 8 characters and at most 72 UTF-8 bytes." }, { status: 400 });
    }

    const hash = admin?.password?.replace(/^\$2y\$/, "$2a$");
    if (!admin || !hash || !(await bcrypt.compare(currentPassword, hash))) {
      return NextResponse.json({ message: "Your current password is incorrect." }, { status: 400 });
    }

    await updateAdminPassword(admin.id, await bcrypt.hash(newPassword, 10), newPassword);
    const response = NextResponse.json({ message: "Password changed successfully." });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(await findAdminById(admin.id)), sessionCookieOptions);
    return response;
  } catch (error) {
    return adminApiError(error);
  }
}
