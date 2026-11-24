import assert from "node:assert/strict";
import test from "node:test";

import { floorRateToHundreds } from "../src/lib/rate-rounding.mjs";

test("rounds gold rates down to the nearest hundred", () => {
  assert.equal(floorRateToHundreds(7349), 7300);
  assert.equal(floorRateToHundreds(7300), 7300);
  assert.equal(floorRateToHundreds(7299.99), 7200);
});
