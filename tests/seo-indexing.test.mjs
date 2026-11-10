import test from "node:test";
import assert from "node:assert/strict";
import { canonicalUrl, isSitemapIndexable, blogArchiveRoutes } from "../src/lib/seo-indexing.mjs";

test("canonical URLs match the site's host and slash redirects", () => {
  assert.equal(canonicalUrl("http://www.aryangoldbuyers.com/blogs/example/"), "https://aryangoldbuyers.com/blogs/example");
  assert.equal(canonicalUrl("/blogs?page=2"), "https://aryangoldbuyers.com/blogs?page=2");
  assert.equal(canonicalUrl("https://example.com/story/"), "https://example.com/story/");
});
test("sitemap respects page and inherited indexing directives", () => {
  const site = { route_path: "*", is_active: 1, robots_index: 0 };
  assert.equal(isSitemapIndexable("/blogs?page=2", [site]), false);
  assert.equal(isSitemapIndexable("/blogs?page=2", [site, { route_path: "/blogs", is_active: 1, robots_index: 1 }]), true);
  for (const robots_extra of ["noindex, follow", "none"]) assert.equal(isSitemapIndexable("/blogs", [{ route_path: "*", is_active: 1, robots_extra }]), false);
  assert.equal(isSitemapIndexable("/blogs/example", [{ route_path: "/blogs/example", is_active: 1, canonical_url: "http://www.aryangoldbuyers.com/blogs/example/" }]), true);
  assert.equal(isSitemapIndexable("/blogs/example", [{ route_path: "/blogs/example", is_active: 1, canonical_url: "https://example.com/other" }]), false);
});
test("blog archive discovery includes every valid pagination page", () => {
  assert.deepEqual(blogArchiveRoutes(25), ["/blogs", "/blogs?page=2", "/blogs?page=3"]);
  assert.deepEqual(blogArchiveRoutes(12), ["/blogs"]);
});
