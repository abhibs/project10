import assert from "node:assert/strict";
import test from "node:test";
import { resolveContactFilters } from "../src/lib/contact-filters.mjs";

test("defaults to today in India across the UTC date boundary", () => {
  assert.deepEqual(resolveContactFilters({}, new Date("2026-10-15T18:29:59Z")), {
    fromDate: "2026-10-15", toDate: "2026-10-15", businessType: "",
  });
  assert.deepEqual(resolveContactFilters({}, new Date("2026-10-15T18:30:00Z")), {
    fromDate: "2026-10-16", toDate: "2026-10-16", businessType: "",
  });
});

test("form-type filtering without dates stays on today", () => {
  assert.deepEqual(resolveContactFilters({ businessType: "Banner Form" }, new Date("2026-10-16T06:00:00Z")), {
    fromDate: "2026-10-16", toDate: "2026-10-16", businessType: "Banner Form",
  });
});

test("explicit historical and open-ended date filters are preserved", () => {
  for (const dates of [
    { fromDate: "2026-10-01", toDate: "2026-10-15" },
    { fromDate: "", toDate: "2026-10-15" },
    { fromDate: "2026-10-01", toDate: "" },
  ]) {
    assert.deepEqual(resolveContactFilters(dates), { ...dates, businessType: "" });
  }
});
