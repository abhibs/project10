import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_SECTIONS, adminPermissions, hasAdminPermission, adminHome, adminProfile,
  canManageAdmin, validateAdminUser, assertAdminUserChange,
} from "../src/lib/admin-access.mjs";

const admin = { id: 1, role: "admin", permissions: [] };
const manager = { id: 2, role: "custom", permissions: ["admins", "dashboard", "contact"] };
const contactUser = { id: 3, role: "custom", permissions: ["contact"] };
const valid = { name: "Test User", email: "TEST@example.com", password: "TestPassword123!", role: "custom", permissions: ["contact"] };

test("full administrators access every known section; unknown roles and permissions fail closed", () => {
  for (const { key } of ADMIN_SECTIONS) assert.equal(hasAdminPermission(admin, key), true);
  assert.equal(hasAdminPermission(admin, "unknown"), false);
  for (const role of [undefined, "superuser", "", null]) assert.equal(hasAdminPermission({ role, permissions: ["contact"] }, "contact"), false);
  assert.equal(hasAdminPermission(null, "contact"), false);
});

test("custom permissions accept database JSON, reject corruption and deduplicate", () => {
  assert.deepEqual(adminPermissions('["contact","contact","unknown"]'), ["contact"]);
  for (const value of ["invalid", "{}", null, 42]) assert.deepEqual(adminPermissions(value), []);
  assert.equal(hasAdminPermission(contactUser, "contact"), true);
  assert.equal(hasAdminPermission(contactUser, "admins"), false);
  assert.equal(adminHome(contactUser), "/admin/contact/index");
  assert.equal(adminHome({ role: "custom", permissions: [] }), "/admin/no-access");
});

test("profile data never includes password hashes, original passwords or session version", () => {
  const profile = adminProfile({ ...admin, name: "Admin", email: "a@example.com", password: "hash", password_hint: "secret", session_version: 7 });
  assert.equal(profile.role, "admin");
  for (const field of ["password", "password_hint", "session_version"]) assert.equal(field in profile, false);
});

test("account validation trims identity but preserves password whitespace and requires safe bcrypt length", () => {
  assert.deepEqual(validateAdminUser({ ...valid, name: " Test User ", email: " TEST@example.com ", password: "  TestPassword  " }, true), { ...valid, email: "test@example.com", password: "  TestPassword  " });
  assert.equal(validateAdminUser({ ...valid, password: "" }).password, "");
  assert.throws(() => validateAdminUser({ ...valid, password: "" }, true), { status: 400 });
  assert.throws(() => validateAdminUser({ ...valid, password: "é".repeat(37) }), { status: 400 });
  assert.throws(() => validateAdminUser({ ...valid, password: 12345678 }), { status: 400 });
  for (const body of [null, [], { ...valid, name: "" }, { ...valid, email: "bad" }, { ...valid, role: "superuser" }, { ...valid, permissions: ["unknown"] }, { ...valid, permissions: "contact" }]) {
    assert.throws(() => validateAdminUser(body), { status: 400 });
  }
});

test("delegated account managers cannot manage full admins or grant access they lack", () => {
  assert.equal(canManageAdmin(manager, contactUser), true);
  assert.equal(canManageAdmin(manager, admin), false);
  assert.equal(canManageAdmin(manager, { role: "custom", permissions: ["seo"] }), false);
  assert.doesNotThrow(() => assertAdminUserChange(manager, contactUser, validateAdminUser(valid)));
  assert.throws(() => assertAdminUserChange(manager, null, { ...valid, role: "admin", permissions: [] }), { status: 403 });
  assert.throws(() => assertAdminUserChange(manager, null, { ...valid, permissions: ["seo"] }), { status: 403 });
  assert.throws(() => assertAdminUserChange(manager, admin, null, true), { status: 403 });
  assert.throws(() => assertAdminUserChange(contactUser, contactUser, valid), { status: 403 });
});

test("self deletion and changing one's own access are blocked; other account changes are permitted", () => {
  assert.throws(() => assertAdminUserChange(admin, admin, null, true), { status: 409 });
  assert.throws(() => assertAdminUserChange(admin, admin, { role: "custom", permissions: [] }), { status: 409 });
  assert.throws(() => assertAdminUserChange(manager, manager, { role: "custom", permissions: ["admins"] }), { status: 409 });
  assert.doesNotThrow(() => assertAdminUserChange(manager, manager, { role: "custom", permissions: [...manager.permissions].reverse() }));
  assert.doesNotThrow(() => assertAdminUserChange(admin, contactUser, { ...valid, role: "admin", permissions: [] }));
  assert.doesNotThrow(() => assertAdminUserChange(admin, { ...admin, id: 8 }, null, true));
});
