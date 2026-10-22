import test from "node:test";
import assert from "node:assert/strict";
import { CONTACT_FORM_TYPES, countContactTypes, sumContactWeights } from "../src/lib/contact-summary.mjs";
import { uniqueDailyContacts } from "../src/lib/contact-leads.mjs";

test("counts every form type including zero counts after daily deduplication", () => {
  const rows = uniqueDailyContacts([
    { mobile: "1234567890", submittedDate: "2026-10-22", businessType: "Sell Gold" },
    { mobile: "1234567890", submittedDate: "2026-10-22", businessType: "Banner Form" },
    { mobile: "1234567890", submittedDate: "2026-10-21", businessType: "Banner Form" },
  ]);
  const counts = countContactTypes(rows);
  assert.equal(counts["Sell Gold"], 1);
  assert.equal(counts["Banner Form"], 1);
  assert.equal(counts["Contact Page"], 0);
  assert.equal(Object.keys(counts).length, CONTACT_FORM_TYPES.length);
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), rows.length);
  assert.ok(Object.values(countContactTypes([])).every((count) => count === 0));
});

test("weight totals use daily unique leads and handle decimal and missing weights", () => {
  const rows = uniqueDailyContacts([
    { mobile: "1234567890", submittedDate: "2026-10-22", businessType: "Sell Gold", weight: "12.97" },
    { mobile: "1234567890", submittedDate: "2026-10-22", businessType: "Banner Form", weight: 50 },
    { mobile: "1234567890", submittedDate: "2026-10-21", businessType: "Sell Gold", weight: .1 },
    { mobile: "1234567891", submittedDate: "2026-10-22", businessType: "Banner Form", weight: .2 },
    { mobile: "1234567892", submittedDate: "2026-10-22", businessType: "Contact Page", weight: null },
    { mobile: "1234567893", submittedDate: "2026-10-22", businessType: "Quick Contact", weight: "invalid" },
  ]);
  const result = sumContactWeights(rows);
  assert.equal(result.totalWeight, 13.27);
  assert.equal(result.weights["Sell Gold"], 13.07);
  assert.equal(result.weights["Banner Form"], .2);
  assert.equal(result.weights["Contact Page"], 0);
  assert.equal(sumContactWeights([]).totalWeight, 0);
});
