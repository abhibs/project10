import test from "node:test";
import assert from "node:assert/strict";
import { createContactSubmitter } from "../src/lib/submit-contact.mjs";

test("concurrent and recent identical submissions send only one request", async () => {
  let calls = 0;
  let time = 0;
  const submit = createContactSubmitter(async () => {
    calls++;
    return { ok: true, json: async () => ({ id: calls }) };
  }, () => time);
  const first = submit({ name: "Test", mobile: "1234567890" });
  const second = submit({ mobile: "1234567890", name: "Test" });
  assert.equal(first, second);
  await first;
  await submit({ name: "Test", mobile: "1234567890" });
  assert.equal(calls, 1);
  time = 60001;
  await submit({ name: "Test", mobile: "1234567890" });
  assert.equal(calls, 2);
});

test("failed requests can be retried and changed details are submitted", async () => {
  let calls = 0;
  const submit = createContactSubmitter(async () => {
    calls++;
    return { ok: calls !== 1, json: async () => ({ message: "Try again" }) };
  });
  await assert.rejects(submit({ name: "Test" }), /Try again/);
  await submit({ name: "Test" });
  await submit({ name: "Other" });
  assert.equal(calls, 3);
});
