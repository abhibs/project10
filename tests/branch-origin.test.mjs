import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedBranchOrigin } from "../src/lib/branch-origin.mjs";

const request = (headers, url = "http://internal:3000/api/admin/branches") => ({
  url,
  headers: new Headers(headers),
});

test("accepts a same-origin browser request behind a reverse proxy", () => {
  assert.equal(isAllowedBranchOrigin(request({
    origin: "https://example.com",
    "sec-fetch-site": "same-origin",
  })), true);
});

test("rejects cross-site and sibling-subdomain browser requests", () => {
  for (const fetchSite of ["cross-site", "same-site"]) {
    assert.equal(isAllowedBranchOrigin(request({
      origin: "https://attacker.example.com",
      "sec-fetch-site": fetchSite,
    })), false);
  }
});

test("uses the public host and proxy protocol when fetch metadata is absent", () => {
  const headers = {
    host: "example.com",
    "x-forwarded-proto": "https",
    origin: "https://example.com",
  };
  assert.equal(isAllowedBranchOrigin(request(headers)), true);
  assert.equal(isAllowedBranchOrigin(request({ ...headers, origin: "https://attacker.example.com" })), false);
  assert.equal(isAllowedBranchOrigin(request({ ...headers, origin: "http://example.com" })), false);
});

test("accepts direct same-origin requests and rejects another origin", () => {
  assert.equal(isAllowedBranchOrigin(request({ origin: "http://internal:3000" })), true);
  assert.equal(isAllowedBranchOrigin(request({ origin: "http://other:3000" })), false);
});
