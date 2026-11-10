import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { AdminAccessError, canAccessContactStatus } from "../src/lib/admin-access.mjs";
import { CONTACT_STATUS_OPTIONS, normalizeBranchVisit, normalizeContactStatus } from "../src/lib/contact-status.mjs";
import { resolveContactFilters } from "../src/lib/contact-filters.mjs";

async function handlers(admin, status = "inactive") {
  const source = (await readFile(new URL("../src/app/api/admin/contacts/route.js", import.meta.url), "utf8"))
    .replace(/^import .*;\r?\n/gm, "").replaceAll("export async function", "async function");
  const updates = [];
  const deps = {
    AdminAccessError, canAccessContactStatus, CONTACT_STATUS_OPTIONS, normalizeBranchVisit, normalizeContactStatus, resolveContactFilters,
    CONTACT_FORM_TYPES: [], VISITING_BRANCH_STATUS: "visiting_branch",
    authorizeAdminRequest: async () => admin,
    adminApiError: error => Response.json({ message: error.message }, { status: error.status || 500 }),
    normalizeBranchVisit,
    findBranchByCode: async () => ({ branchId: "TEST", name: "Test branch", status: "active" }),
    buildBranchVisitNotification: () => ({ event: "contact.visiting_branch" }),
    sendBranchVisitNotification: async () => {},
    findContactById: async () => ({ id: 1, status }),
    updateContact: async (id, changes) => { updates.push({ id, changes }); return true; },
    getContacts: async filters => [{ id: 1, status: filters.status }],
    countContactTypes: () => ({}), sumContactWeights: () => ({}),
  };
  return { ...new Function(...Object.keys(deps), source + "\nreturn { PATCH, GET };")(...Object.values(deps)), updates };
}
const request = changes => new Request("https://example.com/api/admin/contacts", {
  method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: 1, ...changes }),
});
test("callback status and comments save using the authenticated administrator", async () => {
  const { PATCH, updates } = await handlers({ role: "admin" });
  const response = await PATCH(request({ status: "pending_callback", callbackDate: "2026-11-18" }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).changes.callbackDate, "2026-11-18");
  assert.equal(updates[0].changes.callback_date, "2026-11-18");
  assert.equal((await PATCH(request({ comment: "RNR" }))).status, 200);
});
test("status-only users can load and update their contacts but cannot access other statuses", async () => {
  const admin = { role: "custom", permissions: ["contact_callback"] };
  const { PATCH, GET } = await handlers(admin, "pending_callback");
  assert.equal((await PATCH(request({ status: "active" }))).status, 200);
  assert.equal((await GET(new Request("https://example.com/api/admin/contacts?status=pending_callback"))).status, 200);
  assert.equal((await GET(new Request("https://example.com/api/admin/contacts?status=active"))).status, 403);
  assert.equal((await GET(new Request("https://example.com/api/admin/contacts"))).status, 403);
  const denied = await handlers(admin, "inactive");
  assert.equal((await denied.PATCH(request({ comment: "RNR" }))).status, 403);
  assert.equal(denied.updates.length, 0);
});

for (const [status, label] of CONTACT_STATUS_OPTIONS) {
  test(label + " status saves all required fields", async () => {
    const { PATCH, updates } = await handlers({ role: "admin" }, status === "inactive" ? "active" : "inactive");
    const changes = { status, callbackDate: status === "pending_callback" ? "2026-11-18" : "", visitBranchId: "TEST", visitDate: "2026-11-18", visitTime: "14:30" };
    const response = await PATCH(request(changes));
    const data = await response.json();
    assert.equal(response.status, 200, data.message);
    assert.equal(data.changes.status, status);
    assert.equal(updates[0].changes.status, status);
    assert.equal(updates[0].changes.callback_date, status === "pending_callback" ? "2026-11-18" : null);
    assert.equal(updates[0].changes.visit_branch_id, status === "visiting_branch" ? "TEST" : null);
    if (status === "visiting_branch") assert.equal(data.notificationDelivered, true);
  });
}
