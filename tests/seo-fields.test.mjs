import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSeo } from "../src/lib/seo-fields.mjs";

test("SEO validates routes, defaults and robots inheritance", () => {
  assert.equal(validateSeo({ page_label: "Home", route_path: "/", robots_index: "0" }).robots_index, 0);
  assert.equal(validateSeo({ page_label: "Defaults", route_path: "*" }).robots_index, null);
  assert.equal(validateSeo({ page_label: "Contact", route_path: "/contact-us/" }).route_path, "/contact-us");
  for (const route_path of ["//evil.example", "/?query=1", "relative", "/has space"]) {
    assert.throws(() => validateSeo({ page_label: "Page", route_path }));
  }
});

test("SEO rejects unsafe URLs and invalid structured data", () => {
  const base = { page_label: "Home", route_path: "/" };
  assert.throws(() => validateSeo({ ...base, canonical_url: "javascript:alert(1)" }));
  assert.throws(() => validateSeo({ ...base, structured_data: "invalid" }));
  assert.throws(() => validateSeo({ ...base, structured_data: "null" }));
  assert.throws(() => validateSeo({ ...base, twitter_card: "unknown" }));
  assert.equal(validateSeo({ ...base, structured_data: '{"@type":"Organization"}' }).structured_data, '{"@type":"Organization"}');
});
