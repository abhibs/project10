import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBranchVisitNotification,
  buildContactVisitHeaders,
  CONTACT_VISIT_ENDPOINT,
  sendBranchVisitNotification,
} from "../src/lib/branch-visit-notification.mjs";

test("builds the branch notification API payload", () => {
  assert.deepEqual(buildBranchVisitNotification(
    { id: 42, name: "Asha Rao", mobile: "9876543210", city: "Bengaluru" },
    { branchId: "BLR-01", name: "Malleshwaram", area: "Malleshwaram", city: "Bengaluru", address: "1 Main Road" },
    { visitDate: "2026-10-27", visitTime: "14:35" },
  ), {
    event: "contact.visiting_branch",
    status: "visiting_branch",
    contact: { id: 42, name: "Asha Rao", mobile: "9876543210", city: "Bengaluru" },
    branch: { id: "BLR-01", name: "Malleshwaram", area: "Malleshwaram", city: "Bengaluru", address: "1 Main Road" },
    visit: { date: "2026-10-27", time: "14:35", timezone: "Asia/Kolkata" },
  });
});

test("uses the authenticated contact-visit integration endpoint", () => {
  assert.equal(CONTACT_VISIT_ENDPOINT, "https://aryangold.in/api/integrations/contact-visits");
  assert.deepEqual(buildContactVisitHeaders("webhook-secret"), {
    Authorization: "Bearer webhook-secret",
    "Content-Type": "application/json",
  });
  assert.throws(() => buildContactVisitHeaders(""), /CONTACT_VISIT_WEBHOOK_SECRET/);
});

test("posts branch visits with the required authorization headers", async (context) => {
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.CONTACT_VISIT_WEBHOOK_SECRET;
  context.after(() => {
    globalThis.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.CONTACT_VISIT_WEBHOOK_SECRET;
    else process.env.CONTACT_VISIT_WEBHOOK_SECRET = originalSecret;
  });

  process.env.CONTACT_VISIT_WEBHOOK_SECRET = "live-secret";
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200 };
  };

  const payload = { event: "contact.visiting_branch" };
  await sendBranchVisitNotification(payload);
  assert.equal(request.url, CONTACT_VISIT_ENDPOINT);
  assert.equal(request.options.method, "POST");
  assert.deepEqual(request.options.headers, {
    Authorization: "Bearer live-secret",
    "Content-Type": "application/json",
  });
  assert.equal(request.options.body, JSON.stringify(payload));
  assert.equal(request.options.cache, "no-store");
});
