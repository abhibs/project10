import test from "node:test";
import assert from "node:assert/strict";
import { completeSocialMetadata } from "../src/lib/social-metadata.mjs";
import { articleDates } from "../src/lib/article-dates.mjs";

test("social fallbacks include route identity without dropping article fields", () => {
  const result = completeSocialMetadata({ title: "Guide", description: "Description", alternates: { canonical: "https://aryangoldbuyers.com/blogs/guide" }, openGraph: { type: "article", publishedTime: "2026-01-01", images: ["/guide.webp"] } });
  assert.equal(result.openGraph.url, "https://aryangoldbuyers.com/blogs/guide");
  assert.equal(result.openGraph.title, "Guide");
  assert.equal(result.openGraph.publishedTime, "2026-01-01");
  assert.deepEqual(result.twitter.images, ["/guide.webp"]);
  assert.ok(completeSocialMetadata({ title: "Privacy", description: "Policy" }).openGraph.images.length);
});

test("article dates exclude source-site dates and invalid editorial chronology", () => {
  assert.deepEqual(articleDates({ source: { publishedAt: "2026-01-01" } }), { publishedTime: undefined, modifiedTime: undefined });
  assert.equal(articleDates({ publishedAt: "invalid" }).publishedTime, undefined);
  assert.equal(articleDates({ publishedAt: "2999-01-01" }).publishedTime, undefined);
  assert.equal(articleDates({ publishedAt: "2026-02-01", modifiedAt: "2026-01-01" }).modifiedTime, undefined);
  assert.equal(articleDates({ publishedAt: "2026-01-01", modifiedAt: "2026-02-01" }).modifiedTime, "2026-02-01");
});
