import test from "node:test";
import assert from "node:assert/strict";
import { slugifyBranchName, validateBranch, validBranchRecordId } from "../src/lib/branch-values.mjs";

const valid = { branchId: "AG-BLR-01", name: "Aryan Gold", area: "Jayanagar", city: "Bengaluru",
  state: "Karnataka", pincode: "560041", timings: "9:30 AM – 6:30 PM", address: "Example address",
  status: "active", latitude: "", longitude: "", url: "" };
function form(values = {}) { const form = new FormData(); for (const [key, value] of Object.entries({ ...valid, ...values })) form.set(key, value); return form; }

test("valid branch trims text and allows optional coordinates and URL", () => {
  const branch = validateBranch(form({ name: " Aryan Gold " }));
  assert.equal(branch.name, "Aryan Gold"); assert.equal(branch.latitude, null); assert.equal(branch.longitude, null);
  assert.equal(branch.branchId, "AG-BLR-01"); assert.equal(branch.slug, "aryan-gold");
});
test("every required field is checked", () => {
  for (const key of ["branchId", "name", "area", "city", "state", "pincode", "timings", "address", "status"]) {
    assert.throws(() => validateBranch(form({ [key]: "" })), { status: 400 });
  }
});
test("slug is separate from the submitted Branch ID", () => {
  assert.equal(slugifyBranchName("  ARYAN Gold  Jayanagar  "), "aryan-gold-jayanagar");
  assert.equal(slugifyBranchName("Gold & Silver / Bengaluru"), "gold-silver-bengaluru");
  assert.equal(slugifyBranchName("Café Gold"), "cafe-gold");
  const branch = validateBranch(form({ branchId: "AG-01", name: "Main Branch" }));
  assert.equal(branch.branchId, "AG-01"); assert.equal(branch.slug, "main-branch");
  assert.throws(() => validateBranch(form({ branchId: "../unsafe" })), { status: 400 });
  assert.throws(() => validateBranch(form({ name: "!!!" })), { status: 400 });
  assert.equal(slugifyBranchName("A".repeat(100)).length, 64);
});
test("coordinates require a pair and valid bounds", () => {
  for (const values of [{ latitude: "12" }, { latitude: "91", longitude: "0" }, { latitude: "0", longitude: "-181" }, { latitude: "NaN", longitude: "1" }, { latitude: "12.12345678", longitude: "1" }]) assert.throws(() => validateBranch(form(values)));
  assert.equal(validateBranch(form({ latitude: "0", longitude: "0" })).latitude, 0);
  assert.equal(validateBranch(form({ latitude: "-90", longitude: "180" })).longitude, 180);
});
test("URL protocols and credentials are restricted", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "/relative", "ftp://example.com", "https://user:pass@example.com"]) assert.throws(() => validateBranch(form({ url })));
  assert.equal(validateBranch(form({ url: "https://example.com/location" })).url, "https://example.com/location");
});
test("pincode and status are validated", () => {
  for (const pincode of ["000000", "5600", "5600411", "ABCDEF"]) assert.throws(() => validateBranch(form({ pincode })));
  assert.throws(() => validateBranch(form({ status: "published" })));
  assert.equal(validateBranch(form({ status: "inactive" })).status, "inactive");
});
test("text fields have server-side length limits", () => {
  assert.throws(() => validateBranch(form({ address: "a".repeat(2001) })));
  assert.throws(() => validateBranch(form({ city: "a".repeat(121) })));
});
test("record IDs accept only positive MySQL unsigned integers", () => {
  for (const id of ["0", "-1", "1 OR 1=1", "1.1", "4294967296", "../"]) assert.equal(validBranchRecordId(id), false);
  assert.equal(validBranchRecordId("1"), true);
});
