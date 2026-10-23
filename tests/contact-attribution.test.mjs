import { test } from "node:test";
import assert from "node:assert/strict";
import { getContactAttribution, readAttribution, readTrackingData, sanitizeTrackingData } from "../src/lib/contact-attribution.mjs";

test("reads campaign parameters and common ad aliases", () => {
  assert.deepEqual(readAttribution("?gclid=click&utm_source=google&utm_campaign=gold&utm_term=sell+gold&adgroupid=123"), {
    gclid: "click", utmSource: "google", utmCampaign: "gold", keyword: "sell gold", adgroupId: "123",
  });
  assert.equal(readAttribution("?keyword=gold&adgroup_id=456").adgroupId, "456");
});

test("captures common advertising parameters without accepting unrelated query data", () => {
  assert.deepEqual(readTrackingData("?gclid=click&utm_source=google&utm_medium=cpc&utm_content=hero&campaignid=42&device=m&email=private"), {
    gclid: "click", utm_source: "google", utm_medium: "cpc", utm_content: "hero", campaignid: "42", device: "m",
  });
  assert.deepEqual(sanitizeTrackingData({ utm_campaign: " gold ", unsafe: "ignore", placement: "search" }), {
    utm_campaign: "gold", placement: "search",
  });
});

test("retains campaign details across pages and replaces them for a new campaign", () => {
  const storage = new Map();
  globalThis.window = {
    location: { search: "?gclid=first&utm_source=google" },
    sessionStorage: { setItem: (key, value) => storage.set(key, value), getItem: (key) => storage.get(key) },
  };
  try {
    assert.equal(getContactAttribution().gclid, "first");
    window.location.search = "";
    assert.equal(getContactAttribution().gclid, "first");
    window.location.search = "?utm_source=bing";
    assert.equal(getContactAttribution().gclid, "");
    assert.equal(getContactAttribution().utmSource, "bing");
    storage.set("contact-attribution", "invalid-json");
    window.location.search = "";
    assert.equal(getContactAttribution().gclid, "");
  } finally {
    delete globalThis.window;
  }
});
