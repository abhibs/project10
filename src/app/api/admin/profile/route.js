import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { adminProfile } from "@/lib/admin-access.mjs";
import { updateAdminProfile } from "@/lib/admin-db";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  sessionCookieOptions,
} from "@/lib/admin-session";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function imagePath(filename) {
  if (!filename || path.basename(filename) !== filename) return null;
  return path.join(process.cwd(), "public", "admin", filename);
}

export async function POST(request) {
  let newImagePath = null;

  try {
    const currentAdmin = await authorizeAdminRequest(request);

    const form = await request.formData();
    const name = clean(form.get("name"));
    const email = clean(form.get("email")).toLowerCase();
    const phone = clean(form.get("phone")).replace(/[\s()-]/g, "");
    const address = clean(form.get("address"));
    const image = form.get("image");

    if (!name || name.length > 255) {
      return NextResponse.json({ message: "Enter a valid name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (phone && !/^\d{7,15}$/.test(phone)) {
      return NextResponse.json({ message: "Enter a valid phone number using 7 to 15 digits." }, { status: 400 });
    }
    if (address.length > 5000) {
      return NextResponse.json({ message: "Address is too long." }, { status: 400 });
    }

    let imageName = currentAdmin.image || null;
    if (image instanceof File && image.size > 0) {
      const extension = IMAGE_EXTENSIONS.get(image.type);
      if (!extension) {
        return NextResponse.json({ message: "Profile image must be a JPG, PNG, or WebP file." }, { status: 400 });
      }
      if (image.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ message: "Profile image must be 5 MB or smaller." }, { status: 400 });
      }

      const uploadDirectory = path.join(process.cwd(), "public", "admin");
      await mkdir(uploadDirectory, { recursive: true });
      imageName = `admin-${currentAdmin.id}-${randomUUID()}${extension}`;
      newImagePath = path.join(uploadDirectory, imageName);
      await writeFile(newImagePath, Buffer.from(await image.arrayBuffer()), { flag: "wx" });
    }

    await updateAdminProfile(currentAdmin.id, { name, email, phone, address, image: imageName });

    if (newImagePath && currentAdmin.image && currentAdmin.image !== imageName) {
      const oldImagePath = imagePath(currentAdmin.image);
      if (oldImagePath) await unlink(oldImagePath).catch((error) => {
        if (error.code !== "ENOENT") console.error("Old profile image cleanup failed:", error);
      });
    }

    const admin = { ...currentAdmin, name, email, phone, address, image: imageName || "" };
    const response = NextResponse.json({ message: "Profile updated successfully.", admin: adminProfile(admin) });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(admin), sessionCookieOptions);
    return response;
  } catch (error) {
    if (newImagePath) await unlink(newImagePath).catch(() => {});
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ message: "That email address is already in use." }, { status: 409 });
    }
    return adminApiError(error);
  }
}
