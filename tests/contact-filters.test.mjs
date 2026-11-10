import assert from "node:assert/strict";
import test from "node:test";
import { buildContactDateFilter, resolveContactFilters } from "../src/lib/contact-filters.mjs";

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

test("date queries include enquiries scheduled for a call back in the selected range", () => {
  const filter = buildContactDateFilter("2026-10-24", "2026-10-24");
  assert.match(filter.condition, /created_at >= \?/);
  assert.match(filter.condition, /status = 'pending_callback'/);
  assert.match(filter.condition, /callback_date >= \?/);
  assert.match(filter.condition, /callback_date <= \?/);
  assert.deepEqual(filter.values, ["2026-10-24 00:00:00", "2026-10-24", "2026-10-24", "2026-10-24"]);
  assert.deepEqual(buildContactDateFilter(), { condition: "", values: [] });
});

test("status pages ignore date ranges and include all dates for each status", () => {
  for (const status of ["inactive", "pending_callback", "visiting_branch", "active"]) {
    assert.deepEqual(resolveContactFilters({ status, fromDate: "2026-01-01", toDate: "2026-01-02", businessType: "Banner Form" }), {
      fromDate: "", toDate: "", businessType: "Banner Form", status,
    });
  }
});

test("quick date ranges use Kolkata dates and handle month and week boundaries", async () => {
  const { contactDatePreset } = await import("../src/lib/contact-filters.mjs");
  const now = new Date("2026-11-09T20:00:00Z");
  const range = (fromDate, toDate) => ({ fromDate, toDate, allDates: false });
  assert.deepEqual(contactDatePreset("yesterday", now), range("2026-11-09", "2026-11-09"));
  assert.deepEqual(contactDatePreset("7", now), range("2026-11-04", "2026-11-10"));
  assert.deepEqual(contactDatePreset("last-week", now), range("2026-11-02", "2026-11-08"));
  assert.deepEqual(contactDatePreset("last-month", now), range("2026-10-01", "2026-10-31"));
  assert.deepEqual(resolveContactFilters({ ...contactDatePreset("maximum", now), businessType: "Banner Form" }), {
    fromDate: "", toDate: "", businessType: "Banner Form", allDates: true,
  });
});
