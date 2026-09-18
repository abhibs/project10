import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { findAdminByEmail } from "@/lib/admin-db";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  sessionCookieOptions,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || typeof password !== "string") {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const admin = await findAdminByEmail(normalizedEmail);
    const hash = admin?.password?.replace(/^\$2y\$/, "$2a$");
    const passwordMatches = hash ? await bcrypt.compare(password, hash) : false;

    if (!admin || !passwordMatches) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const response = NextResponse.json({ admin: { id: admin.id, name: admin.name, email: admin.email } });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(admin), sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json(
      { message: "Unable to sign in right now. Check the database configuration and try again." },
      { status: 500 }
    );
  }
}
