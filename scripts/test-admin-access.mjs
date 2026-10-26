// Run against a local running app after migrate-admin-access.mjs.
// Creates isolated test accounts and removes only those accounts in finally.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { createAdminSession, ADMIN_SESSION_COOKIE } from "../src/lib/admin-session.js";

nextEnv.loadEnvConfig(process.cwd());
const baseUrl = process.env.ADMIN_TEST_URL || "http://localhost:3000";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseUrl).hostname), "Use a local test server.");
const marker = randomUUID();
const password = `Test-${marker}!`;
const createdIds = [];
let connection;

async function api(path, cookie, method = "GET", body, origin) {
  const headers = { ...(cookie ? { Cookie: cookie } : {}), ...(origin ? { Origin: origin } : {}) };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${baseUrl}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: "manual" });
  return { response, data: (response.headers.get("content-type") || "").includes("application/json") ? await response.json() : null };
}
function status(result, expected) { assert.equal(result.response.status, expected, `Expected ${expected}, received ${result.response.status}: ${result.data?.message || result.response.url}`); }
function cookie(result) { const value = result.response.headers.get("set-cookie"); assert.ok(value); return value.split(";")[0]; }
function values(suffix, role = "custom", permissions = ["contact"]) {
  return { name: `Access Test ${suffix}`, email: `access-${marker}-${suffix}@example.invalid`, password, role, permissions };
}
async function create(actorCookie, details) {
  const result = await api("/api/admin/users", actorCookie, "POST", details);
  status(result, 201);
  createdIds.push(result.data.id);
  return result.data.id;
}
async function login(details, expectedRedirect) {
  const result = await api("/api/admin/login", null, "POST", { email: details.email, password: details.password });
  status(result, 200);
  if (expectedRedirect) assert.equal(result.data.redirectTo, expectedRedirect);
  return cookie(result);
}

try {
  connection = await mysql.createConnection({ host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", database: process.env.DB_NAME || "project10" });
  const [admins] = await connection.execute("SELECT id, name, email, role, session_version FROM admins WHERE role = 'admin' ORDER BY id LIMIT 1");
  assert.ok(admins[0], "An existing administrator is required.");
  const ownerCookie = `${ADMIN_SESSION_COOKIE}=${createAdminSession(admins[0])}`;
  const full = values("full", "admin", []);
  const fullId = await create(ownerCookie, full);
  const fullCookie = await login(full, "/admin/dashboard");

  for (const path of ["users", "contacts", "branches", "rates", "seo"]) status(await api(`/api/admin/${path}`), 401);
  const listed = await api("/api/admin/users", fullCookie);
  status(listed, 200);
  assert.ok(listed.data.users.every((user) => !("password" in user) && !("session_version" in user)));
  status(await api(`/api/admin/users/${fullId}`, fullCookie, "DELETE"), 409);
  status(await api(`/api/admin/users/${fullId}`, fullCookie, "PUT", { ...full, password: "", role: "custom", permissions: [] }), 409);
  status(await api("/api/admin/users", fullCookie, "POST", { ...values("invalid"), permissions: ["unknown"] }), 400);
  status(await api("/api/admin/users", fullCookie, "POST", values("origin"), "https://example.invalid"), 403);
  console.log("PASS: authentication, private fields, validation, origin and self-access guards");

  const restricted = values("restricted");
  const restrictedId = await create(fullCookie, restricted);
  const restrictedCookie = await login(restricted, "/admin/contact/index");
  status(await api("/api/admin/contacts", restrictedCookie), 200);
  for (const path of ["users", "branches", "rates", "seo"]) status(await api(`/api/admin/${path}`, restrictedCookie), 403);
  for (const [path, method] of [["users", "POST"], [`users/${fullId}`, "PUT"], [`users/${fullId}`, "DELETE"], ["rates", "PUT"], ["seo", "POST"], ["seo?id=1", "DELETE"], ["branches", "POST"], ["branches/1", "PUT"], ["branches/1", "DELETE"]]) {
    status(await api(`/api/admin/${path}`, restrictedCookie, method, {}), 403);
  }
  const deniedPage = await api("/admin/users", restrictedCookie);
  status(deniedPage, 307);
  assert.equal(new URL(deniedPage.response.headers.get("location"), baseUrl).pathname, "/admin/contact/index");
  status(await api("/api/admin/users", fullCookie, "POST", restricted), 409);
  console.log("PASS: restricted login, direct page access and all denied API mutations");

  status(await api(`/api/admin/users/${restrictedId}`, fullCookie, "PUT", { ...restricted, password: "", permissions: ["rate"] }), 200);
  status(await api("/api/admin/contacts", restrictedCookie), 403);
  status(await api("/api/admin/rates", restrictedCookie), 200);
  const [stored] = await connection.execute("SELECT password, password_hint FROM admins WHERE id = ?", [restrictedId]);
  assert.equal(stored[0].password_hint, password);
  assert.notEqual(stored[0].password, password);
  assert.ok(await bcrypt.compare(password, stored[0].password));
  console.log("PASS: live permission changes, bcrypt storage and unchanged password retention");

  const manager = values("manager", "custom", ["admins", "contact"]);
  const managerId = await create(fullCookie, manager);
  const managerCookie = await login(manager, "/admin/users");
  const managed = await api("/api/admin/users", managerCookie);
  status(managed, 200);
  assert.ok(managed.data.users.every((user) => user.role === "custom" && user.permissions.every((key) => manager.permissions.includes(key))));
  assert.ok(!managed.data.users.some(({ id }) => id === restrictedId || id === fullId));
  status(await api("/api/admin/users", managerCookie, "POST", values("escalate", "admin", [])), 403);
  status(await api("/api/admin/users", managerCookie, "POST", values("escalate-seo", "custom", ["seo"])), 403);
  status(await api(`/api/admin/users/${fullId}`, managerCookie, "DELETE"), 403);
  status(await api(`/api/admin/users/${restrictedId}`, managerCookie, "PUT", { ...restricted, password: "", permissions: ["contact"] }), 403);
  status(await api(`/api/admin/users/${managerId}`, managerCookie, "PUT", { ...manager, password: "", permissions: ["admins"] }), 409);
  const childId = await create(managerCookie, values("child"));
  status(await api(`/api/admin/users/${childId}`, managerCookie, "DELETE"), 200);
  console.log("PASS: delegated account CRUD without privilege escalation");

  const changedPassword = `Changed-${marker}!`;
  const changed = await api("/api/admin/change-password", restrictedCookie, "POST", { currentPassword: password, newPassword: changedPassword });
  status(changed, 200);
  const changedCookie = cookie(changed);
  status(await api("/api/admin/rates", restrictedCookie), 401);
  status(await api("/api/admin/rates", changedCookie), 200);
  const [changedRows] = await connection.execute("SELECT password, password_hint FROM admins WHERE id = ?", [restrictedId]);
  assert.equal(changedRows[0].password_hint, changedPassword);
  assert.ok(await bcrypt.compare(changedPassword, changedRows[0].password));
  status(await api(`/api/admin/users/${restrictedId}`, fullCookie, "PUT", { ...restricted, permissions: ["rate"] }), 200);
  status(await api("/api/admin/rates", changedCookie), 401);
  const resetCookie = await login(restricted, "/admin/rate");
  status(await api(`/api/admin/users/${restrictedId}`, fullCookie, "DELETE"), 200);
  status(await api("/api/admin/rates", resetCookie), 401);
  console.log("PASS: password changes, admin resets and deletion revoke old sessions");

  const noAccess = values("no-access", "custom", []);
  await create(fullCookie, noAccess);
  const noAccessCookie = await login(noAccess, "/admin/no-access");
  status(await api("/admin/no-access", noAccessCookie), 200);
  status(await api("/admin/dashboard", noAccessCookie), 307);
  status(await api("/api/admin/contacts", noAccessCookie), 403);
  console.log("PASS: accounts with no assigned sections have a working account page");
} finally {
  if (connection) {
    if (createdIds.length) await connection.execute(`DELETE FROM admins WHERE id IN (${createdIds.map(() => "?").join(",")}) AND email LIKE ?`, [...createdIds, `access-${marker}-%@example.invalid`]);
    await connection.end();
    console.log("Temporary test accounts removed.");
  }
}
