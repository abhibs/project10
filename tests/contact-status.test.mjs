import assert from "node:assert/strict";
import test from "node:test";
import { CALLBACK_STATUS, getContactStatusLabel, normalizeContactStatus } from "../src/lib/contact-status.mjs";

test("requires a real date for Pending Call Back", () => {
  assert.deepEqual(normalizeContactStatus(CALLBACK_STATUS, "2026-10-31"), {
    status: CALLBACK_STATUS,
    callbackDate: "2026-10-31",
  });
  assert.throws(() => normalizeContactStatus(CALLBACK_STATUS, ""), /call-back date/);
  assert.throws(() => normalizeContactStatus(CALLBACK_STATUS, "2026-02-31"), /call-back date/);
});

test("clears callback dates for Pending and Completed", () => {
  assert.deepEqual(normalizeContactStatus("inactive", "2026-10-31"), { status: "inactive", callbackDate: "" });
  assert.deepEqual(normalizeContactStatus("active", "2026-10-31"), { status: "active", callbackDate: "" });
  assert.equal(getContactStatusLabel(CALLBACK_STATUS), "Pending Call Back");
  assert.throws(() => normalizeContactStatus("unknown"), /Select Pending/);
});
