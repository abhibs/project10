import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "project10_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }
  return value;
}

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function signature(value) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createAdminSession(admin) {
  const payload = encode(JSON.stringify({
    id: admin.id,
    name: admin.name || "Administrator",
    email: admin.email,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  }));

  return `${payload}.${signature(payload)}`;
}

export function readAdminSession(token) {
  if (!token || typeof token !== "string") return null;

  const [payload, providedSignature, ...extra] = token.split(".");
  if (!payload || !providedSignature || extra.length) return null;

  const expectedSignature = signature(payload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.id || !session.email || !session.expiresAt || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
