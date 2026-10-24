import assert from "node:assert/strict";
import test from "node:test";
import { validateManualContact } from "../src/lib/manual-contact.mjs";

const valid = {
  name: "  Asha Rao  ",
  mobile: "9876543210",
  city: " Bengaluru ",
  weight: "25.5",
  services: " Gold valuation ",
  details: " Customer called from Malleshwaram. ",
  status: "inactive",
  callbackDate: "",
  comment: " Call after 4 PM. ",
};

test("normalizes a valid manual incoming-call enquiry", () => {
  assert.deepEqual(validateManualContact(valid), {
    name: "Asha Rao",
    mobile: "9876543210",
    city: "Bengaluru",
    weight: 25.5,
    services: "Gold valuation",
    details: "Customer called from Malleshwaram.",
    status: "inactive",
    callbackDate: "",
    comment: "Call after 4 PM.",
    businessType: "Incoming Calls",
  });
});

test("requires name, mobile, city, weight, service and status", () => {
  for (const field of ["name", "mobile", "city", "weight", "services", "status"]) {
    assert.throws(() => validateManualContact({ ...valid, [field]: "" }), Error, field);
  }
});

test("rejects invalid required values and trims optional text", () => {
  assert.throws(() => validateManualContact({ ...valid, mobile: "123" }), /10-digit/);
  assert.throws(() => validateManualContact({ ...valid, weight: "100001" }), /weight/);
  assert.throws(() => validateManualContact({ ...valid, status: "new" }), /status/);
  assert.throws(() => validateManualContact({ ...valid, status: "pending_callback", callbackDate: "" }), /call-back date/);
  assert.equal(validateManualContact({ ...valid, status: "pending_callback", callbackDate: "2026-11-01" }).callbackDate, "2026-11-01");
  const contact = validateManualContact({ ...valid, details: "", comment: "" });
  assert.equal(contact.details, "");
  assert.equal(contact.comment, "");
});
