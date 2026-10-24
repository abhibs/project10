import test from "node:test";
import assert from "node:assert/strict";
import {
  DAILY_CONTACT_DUPLICATE_CODE,
  DAILY_CONTACT_DUPLICATE_MESSAGE,
  runOncePerContactDay,
  uniqueDailyContacts,
} from "../src/lib/contact-leads.mjs";

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

test("retains every manually entered incoming call", () => {
  const contacts = [
    { id: 3, mobile: "9481187122", submittedDate: "2026-10-23", businessType: "Incoming Calls" },
    { id: 2, mobile: "9481187122", submittedDate: "2026-10-23", businessType: "Incoming Calls" },
    { id: 1, mobile: "9481187122", submittedDate: "2026-10-23", businessType: "Quick Contact" },
  ];
  assert.deepEqual(uniqueDailyContacts(contacts).map((row) => row.id), [3, 2, 1]);
});

function connectionWith(existingRows = []) {
  const calls = [];
  return {
    calls,
    async execute(sql, values) {
      calls.push({ sql, values });
      if (sql.includes("GET_LOCK")) return [[{ acquired: 1 }]];
      if (sql.includes("FROM contacts")) return [existingRows];
      if (sql.includes("RELEASE_LOCK")) return [[{ released: 1 }]];
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
}

test("inserts once when the mobile number has no lead today", async () => {
  const connection = connectionWith();
  let inserts = 0;
  const result = await runOncePerContactDay(connection, "9481187122", async () => {
    inserts++;
    return 42;
  });
  assert.equal(result, 42);
  assert.equal(inserts, 1);
  assert.equal(connection.calls.at(-1).values[0], "contact-lead:9481187122");
});

test("rejects a second lead for the same mobile number on the current IST date", async () => {
  const connection = connectionWith([{ id: 42 }]);
  let inserts = 0;
  await assert.rejects(
    runOncePerContactDay(connection, "9481187122", async () => { inserts++; }),
    (error) => error.code === DAILY_CONTACT_DUPLICATE_CODE && error.message === DAILY_CONTACT_DUPLICATE_MESSAGE,
  );
  assert.equal(inserts, 0);
  assert.match(connection.calls[1].sql, /created_at >= CURDATE\(\)/);
  assert.match(connection.calls[1].sql, /DATE_ADD\(CURDATE\(\), INTERVAL 1 DAY\)/);
  assert.match(connection.calls.at(-1).sql, /RELEASE_LOCK/);
});
