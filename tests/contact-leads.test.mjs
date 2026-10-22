import test from "node:test";
import assert from "node:assert/strict";
import { uniqueDailyContacts } from "../src/lib/contact-leads.mjs";

test("keeps the latest lead across form types for each number on each date", () => {
  const contacts = [
    { id: 5, mobile: "9481187122", submittedDate: "2026-10-23", businessType: "Banner Form" },
    { id: 4, mobile: "9481187122", submittedDate: "2026-10-22", businessType: "Branch Visit" },
    { id: 3, mobile: "94811 87122", submittedDate: "2026-10-22", businessType: "Banner Form" },
    { id: 2, mobile: "9481187000", submittedDate: "2026-10-22" },
    { id: 1, mobile: "9481187122", submittedDate: "2026-10-21" },
  ];
  assert.deepEqual(uniqueDailyContacts(contacts).map((row) => row.id), [5, 4, 2, 1]);
  assert.equal(contacts.length, 5);
});

test("empty results and contacts without a mobile number are retained correctly", () => {
  assert.deepEqual(uniqueDailyContacts([]), []);
  assert.equal(uniqueDailyContacts([{ id: 1 }, { id: 2 }]).length, 2);
});
