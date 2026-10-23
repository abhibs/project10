import test from "node:test";
import assert from "node:assert/strict";
import { branchPath, matchesBranchRoute, branchMapQuery, branchDirections } from "../src/lib/branch-links.mjs";

const branch = { state: "Tamil Nadu", city: "Chennai", slug: "t-nagar", name: "T Nagar", status: "active", latitude: 13.04, longitude: 80.23 };

test("branch links and route matching agree on state, city and stored slug", () => {
  assert.equal(branchPath(branch), "/branches/tamil-nadu/chennai/t-nagar");
  const route = { state: "tamil-nadu", city: "chennai", slug: "t-nagar" };
  assert.equal(matchesBranchRoute(branch, route), true);
  assert.equal(matchesBranchRoute(branch, { ...route, city: "bengaluru" }), false);
  assert.equal(matchesBranchRoute(branch, { ...route, state: "karnataka" }), false);
  assert.equal(matchesBranchRoute(branch, { ...route, slug: "other" }), false);
  assert.equal(matchesBranchRoute({ ...branch, status: "inactive" }, route), false);
});

test("map directions use coordinates, including zero, with an encoded address fallback", () => {
  assert.equal(branchMapQuery(branch), "13.04,80.23");
  assert.equal(branchMapQuery({ ...branch, latitude: 0, longitude: 0 }), "0,0");
  const withoutCoordinates = { ...branch, latitude: null, longitude: null, address: "1, Main Road", pincode: "600017" };
  const query = branchMapQuery(withoutCoordinates);
  assert.ok(query.includes("T Nagar, 1, Main Road, Chennai, Tamil Nadu, 600017"));
  const directions = new URL(branchDirections(withoutCoordinates));
  assert.equal(directions.hostname, "www.google.com");
  assert.equal(directions.searchParams.get("destination"), query);
});
