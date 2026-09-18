import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findAdminById, updateAdminPassword } from "@/lib/admin-db";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
    if (!session) {
      return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ message: "Both password fields are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: "New password must contain at least 8 characters." }, { status: 400 });
    }

    const admin = await findAdminById(session.id);
    const hash = admin?.password?.replace(/^\$2y\$/, "$2a$");
    if (!admin || !hash || !(await bcrypt.compare(currentPassword, hash))) {
      return NextResponse.json({ message: "Your current password is incorrect." }, { status: 400 });
    }

    await updateAdminPassword(admin.id, await bcrypt.hash(newPassword, 10));
    return NextResponse.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Password change failed:", error);
    return NextResponse.json({ message: "Unable to change password right now." }, { status: 500 });
  }
}
