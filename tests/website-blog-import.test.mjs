import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { prepareWebsitePost, mergeWebsiteBlogs, WEBSITE_BLOG_SOURCE } from "../src/lib/website-blog-import.mjs";

test("website import extracts the article and excludes source promotions and surrounding UI", () => {
  const paragraph = "Whether you are comparing jewellery or coins, check the purity and weight before you agree to a valuation. ";
  const html = `<html><body><nav>Source navigation</nav><article><script id="article-structured-data-42" type="application/ld+json">{"@type":"BlogPosting","datePublished":"2026-01-01"}</script><h1>A guide to gold</h1><img src="/_next/image/?url=%2Fapi%2Fmedia%2Ffile%2Fgold.png&amp;w=1200"/><div class="payload-richtext blog-richtext"><h2>Compare your options</h2><p>${paragraph.repeat(8)}</p><div class="bg-gradient-to-br"><p>Attica has 200+ branches.</p><p>Guaranteed best price</p></div><p><a href="https://www.atticagoldcompany.com/blogs/another-guide/">Another guide</a></p></div><section>Unrelated recommendations</section></article></body></html>`;
  const post = prepareWebsitePost(html, `${WEBSITE_BLOG_SOURCE}gold-guide/`);
  assert.equal(post.id, 1000042);
  assert.equal(post.slug, "gold-guide");
  assert.equal(post.source.image, "https://www.atticagoldcompany.com/api/media/file/gold.png");
  assert.match(post.html, /If you are comparing/);
  assert.match(post.html, /href="\/blogs\/another-guide"/);
  assert.doesNotMatch(post.html, /Attica|200\+|Guaranteed|navigation|recommendations|<script|<img/i);
  assert.equal(post.headings[0].id, "compare-your-options");
});

test("website imports preserve sheet articles and their IDs when slugs overlap", () => {
  const sheet = { id: 1, slug: "gold-guide" };
  const duplicate = { id: 1000001, slug: "gold-guide", source: { website: WEBSITE_BLOG_SOURCE } };
  const imported = { id: 1000002, slug: "other-guide", source: { website: WEBSITE_BLOG_SOURCE } };
  assert.deepEqual(mergeWebsiteBlogs([sheet], [duplicate, imported, { slug: "untrusted", source: {} }]), [sheet, imported]);
});

test("missing article content fails instead of importing a skeleton or error page", () => {
  assert.throws(() => prepareWebsitePost("<html><body>Not found</body></html>", `${WEBSITE_BLOG_SOURCE}missing/`), /missing/);
});

test("source-specific FAQ answers are removed together with their question", () => {
  const html = `<article><script id="article-structured-data-9"></script><h1>Gold guide</h1><div class="payload-richtext blog-richtext"><h2>Useful advice</h2><p>${"Compare the weight and purity of gold before selling. ".repeat(12)}</p><h3>Does Attica use the current rate?</h3><p>We promise the highest payout.</p><h3>How is weight checked?</h3><p>A calibrated scale measures the weight.</p></div></article>`;
  const post = prepareWebsitePost(html, `${WEBSITE_BLOG_SOURCE}gold-guide/`);
  assert.doesNotMatch(post.html, /highest payout|Attica/);
  assert.match(post.html, /calibrated scale/);
});

test("imported website library has complete local covers, unique IDs and safe article HTML", async () => {
  const posts = JSON.parse(await readFile(new URL("../data/blogs/website-posts.json", import.meta.url), "utf8"));
  const report = JSON.parse(await readFile(new URL("../data/blogs/website-import-report.json", import.meta.url), "utf8"));
  assert.equal(posts.length, report.discovered);
  assert.equal(report.errors.length, 0);
  assert.equal(new Set(posts.map(post => post.id)).size, posts.length);
  assert.equal(new Set(posts.map(post => post.slug)).size, posts.length);
  await Promise.all(posts.map(async post => {
    assert.equal(post.source.website, WEBSITE_BLOG_SOURCE);
    assert.ok(post.id > 1000000);
    assert.match(post.image, /^\/blog-import\/[a-z0-9-]+\.webp$/);
    await access(new URL(`../public${post.image}`, import.meta.url));
    assert.doesNotMatch(post.html, /attica|<script|<iframe|onerror=|8880\s*300\s*300/i);
    for (const heading of post.headings) assert.ok(post.html.includes(`id="${heading.id}"`));
  }));
});
