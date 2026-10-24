import test from "node:test";
import assert from "node:assert/strict";
import { createContactSubmitter } from "../src/lib/submit-contact.mjs";

test("concurrent identical submissions share one request but completed attempts reach the server", async () => {
  let calls = 0;
  const submit = createContactSubmitter(async () => {
    calls++;
    return { ok: true, json: async () => ({ id: calls }) };
  });
  const first = submit({ name: "Test", mobile: "1234567890" });
  const second = submit({ mobile: "1234567890", name: "Test" });
  assert.equal(first, second);
  await first;
  await submit({ name: "Test", mobile: "1234567890" });
  assert.equal(calls, 2);
});

test("a completed retry surfaces the server's daily duplicate message", async () => {
  let calls = 0;
  const message = "Your query has already been received. Please allow us some time to get back to you!";
  const submit = createContactSubmitter(async () => {
    calls++;
    return calls === 1
      ? { ok: true, json: async () => ({ id: 1 }) }
      : { ok: false, json: async () => ({ message }) };
  });
  await submit({ name: "Test", mobile: "1234567890" });
  await assert.rejects(submit({ name: "Test", mobile: "1234567890" }), new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
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
