import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseHTML } from "linkedom";
import { prepareArticle, safeArticleHtml } from "../src/lib/blog-content.mjs";
import { activeBlogEntries, BLOG_SPREADSHEET } from "../src/lib/blog-source.mjs";

test("only the selected spreadsheet can supply public or admin blog entries", () => {
  const old = "https://docs.google.com/spreadsheets/d/previous-sheet";
  const current = { slug: "current", source: { spreadsheet: BLOG_SPREADSHEET } };
  const previous = { slug: "old", source: { spreadsheet: old } };
  const legacy = { slug: "legacy", source: {} };
  assert.deepEqual(activeBlogEntries([current, previous, legacy], old), []);
  assert.deepEqual(activeBlogEntries([current, previous, legacy], BLOG_SPREADSHEET), [current]);
});

test("article sanitizer removes executable HTML while retaining article structure", () => {
  const html = safeArticleHtml('<h2 id="heading" onclick="alert(1)">A heading</h2><p>Text <a href="javascript:alert(1)">bad link</a></p><script>alert(1)</script><iframe src="https://example.com"></iframe><table><tr><td>Data</td></tr></table>');
  assert.doesNotMatch(html, /onclick|javascript:|<script|<iframe/);
  assert.match(html, /<h2 id="heading">/);
  assert.match(html, /<table>/);
});
test("import strips editorial instructions and unsupported company claims, and creates unique contents anchors", () => {
  const { document } = parseHTML('<html><body><p>META BLOCK — NOT FOR PAGE BODY</p><table><tr><td>Private metadata</td></tr></table><h1>Article title</h1><h2>Helpful section</h2><p>An educational paragraph about weighing gold and understanding the offer before deciding whether to sell it.</p><h2>Helpful section</h2><p>Attica has 200+ branches.</p><table><tr><td>LIVE RATE WIDGET PLACEHOLDER</td></tr></table><h2>More information</h2><p>Another paragraph.</p><p>INTERNAL LINKS - FOR DEV TEAM</p><p>Do not publish this instruction.</p></body></html>');
  const article = prepareArticle(document);
  assert.doesNotMatch(article.html, /META BLOCK|Private metadata|FOR DEV TEAM|Attica|PLACEHOLDER|Do not publish|<h1/);
  assert.match(article.html, /educational paragraph/);
  assert.deepEqual(article.headings.map(h => h.id), ["helpful-section", "helpful-section-2", "more-information"]);
});
test("source business contact links cannot send readers to the source business", () => {
  const html = safeArticleHtml('<a href="https://www.atticagoldcompany.com/branches/">Branch</a><a href="tel:8880300300">Phone</a><a href="https://wa.me/918880300300">WhatsApp</a>');
  assert.doesNotMatch(html, /attica|8880300300/);
  assert.match(html, /href="\/branches"/);
  assert.match(html, /href="\/contact-us"/);
});
test("all imported entries have unique paths; published articles have usable content and matching anchors", async () => {
  const posts = JSON.parse(await readFile(new URL("../data/blogs/posts.json", import.meta.url), "utf8"));
  const report = JSON.parse(await readFile(new URL("../data/blogs/import-report.json", import.meta.url), "utf8"));
  assert.equal(posts.length, report.total);
  assert.equal(new Set(posts.map(p => p.slug)).size, posts.length);
  assert.equal(posts.filter(p => p.status === "published").length, report.published);
  for (const post of posts.filter(p => p.status === "published")) {
    assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(post.html.length > 100);
    assert.doesNotMatch(post.html, /<script|<iframe|onerror=|META BLOCK|FOR DEV TEAM|WIDGET PLACEHOLDER|attica/i);
    for (const heading of post.headings) assert.ok(post.html.includes(`id="${heading.id}"`));
  }
});
