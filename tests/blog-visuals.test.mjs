import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { selectBlogVisual } from "../src/lib/blog-visuals.mjs";

test("cover imagery follows the subject rather than unrelated description keywords", () => {
  const examples = [
    ["How to Check Gold Purity", "purity"],
    ["How Much Is 1 Pavan Gold in Grams", "weight"],
    ["107 Gram Gold Price Today: Live Rate and Exact Cash Value", "weight"],
    ["Selling Gold for Medical Bills", "cash"],
    ["Gold Loan Interest Rate", "cash"],
    ["Sell Gold in Bangalore", "people"],
    ["Sell Gold in Bangalore: Live Rate & Cash Process", "people"],
    ["Gold Bangle Resale", "bangles"],
    ["Gold Bangle Weight and Cash Value", "bangles"],
    ["Gold Earrings Resale", "earrings"],
    ["Gold Ring Resale", "rings"],
    ["Gold Necklace Resale", "necklaces"],
    ["Gold Bracelet Resale", "bracelets"],
    ["Gold Coins Value", "coins"],
    ["Gold Bars Investment", "bullion"],
    ["Documents Needed to Sell Gold", "documents"],
  ];
  for (const [title, theme] of examples) assert.equal(selectBlogVisual({ title, description: "Gold, cash, people and jewellery." }).theme, theme, title);
});

test("every blog has a local topic photo and a versioned finished cover", async () => {
  const manifest = JSON.parse(await readFile(new URL("../data/blogs/cover-manifest.json", import.meta.url), "utf8"));
  const posts = JSON.parse(await readFile(new URL("../data/blogs/website-posts.json", import.meta.url), "utf8"));
  for (const post of posts) {
    const cover = manifest[post.slug];
    assert.ok(cover, post.slug);
    assert.match(cover.image, /\?v=photo-v2$/);
    assert.notEqual(cover.asset, post.source.image);
    await access(new URL(`../public${cover.asset}`, import.meta.url));
    await access(new URL(`../public${cover.image.split("?")[0]}`, import.meta.url));
  }
});

test("description supplies visual context for articles with generic titles", () => {
  assert.equal(selectBlogVisual({ title: "Your Next Step", description: "Understanding cash payment for your gold." }).theme, "cash");
  assert.equal(selectBlogVisual({ title: "A Helpful Guide", description: "Check the weight in grams." }).theme, "weight");
});
