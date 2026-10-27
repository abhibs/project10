import assert from "node:assert/strict";
import test from "node:test";
import { buildBranchVisitNotification } from "../src/lib/branch-visit-notification.mjs";

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
