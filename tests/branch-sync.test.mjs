import assert from "node:assert/strict";
import test from "node:test";
import {
  BranchSyncError,
  buildBranchUpsertPayload,
  buildBranchUpsertRequest,
  requireBranchDeactivation,
  requireBranchUpsert,
  sendBranchUpsert,
} from "../src/lib/branch-sync.mjs";

const branch = {
  id: 7,
  branchId: "AGPL003",
  name: "Jayanagar Branch",
  slug: "jayanagar-branch",
  image: "local.webp",
  area: "Jayanagar",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560041",
  timings: "Monday to Saturday, 10 AM to 7 PM",
  address: "123 Main Road, Jayanagar",
  status: "active",
  latitude: 12.925,
  longitude: 77.5938,
  url: "https://example.com/branches/jayanagar",
};

test("builds the branch API payload without local-only fields", () => {
  assert.deepEqual(buildBranchUpsertPayload(branch), {
    branchId: "AGPL003",
    name: "Jayanagar Branch",
    area: "Jayanagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560041",
    timings: "Monday to Saturday, 10 AM to 7 PM",
    address: "123 Main Road, Jayanagar",
    status: "active",
    latitude: 12.925,
    longitude: 77.5938,
    url: "https://example.com/branches/jayanagar",
  });
});

test("builds an authenticated JSON POST request", () => {
  const request = buildBranchUpsertRequest(branch, "https://sync.example/api/admin/branches", "secret-token");
  assert.equal(request.url, "https://sync.example/api/admin/branches");
  assert.equal(request.options.method, "POST");
  assert.deepEqual(request.options.headers, {
    Authorization: "Bearer secret-token",
    "Content-Type": "application/json",
  });
  assert.equal(request.options.body, JSON.stringify(buildBranchUpsertPayload(branch)));
  assert.equal(request.options.cache, "no-store");
  assert.ok(request.options.signal instanceof AbortSignal);
});

test("requires a valid endpoint and token", () => {
  assert.throws(() => buildBranchUpsertRequest(branch, "", "token"), /BRANCH_ADMIN_API_URL/);
  assert.throws(() => buildBranchUpsertRequest(branch, "not a url", "token"), /valid URL/);
  assert.throws(() => buildBranchUpsertRequest(branch, "https://sync.example/api/admin/branches", ""), /BRANCH_ADMIN_API_TOKEN/);
});

test("accepts create and update responses and rejects other statuses", async (context) => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.BRANCH_ADMIN_API_URL;
  const originalToken = process.env.BRANCH_ADMIN_API_TOKEN;
  context.after(() => {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.BRANCH_ADMIN_API_URL;
    else process.env.BRANCH_ADMIN_API_URL = originalUrl;
    if (originalToken === undefined) delete process.env.BRANCH_ADMIN_API_TOKEN;
    else process.env.BRANCH_ADMIN_API_TOKEN = originalToken;
  });

  process.env.BRANCH_ADMIN_API_URL = "https://sync.example/api/admin/branches";
  process.env.BRANCH_ADMIN_API_TOKEN = "secret-token";
  for (const status of [200, 201]) {
    globalThis.fetch = async () => ({ status });
    await sendBranchUpsert(branch);
  }
  globalThis.fetch = async () => ({ status: 401 });
  await assert.rejects(sendBranchUpsert(branch), /HTTP 401/);
});

test("requires a successful push before the caller can continue", async () => {
  let pushed = false;
  await requireBranchUpsert(branch, async () => { pushed = true; });
  assert.equal(pushed, true);

  const failure = new Error("network unavailable");
  await assert.rejects(
    requireBranchUpsert(branch, async () => { throw failure; }),
    (error) => error instanceof BranchSyncError && error.status === 502 && error.cause === failure,
  );
});

test("deactivates the remote branch before local deletion can continue", async () => {
  let pushedBranch;
  await requireBranchDeactivation(branch, async (value) => { pushedBranch = value; });
  assert.deepEqual(pushedBranch, { ...branch, status: "inactive" });
  assert.equal(branch.status, "active");

  await assert.rejects(
    requireBranchDeactivation(branch, async () => { throw new Error("remote delete update failed"); }),
    (error) => error instanceof BranchSyncError && error.status === 502,
  );
});
