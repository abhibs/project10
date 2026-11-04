import assert from "node:assert/strict";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";
import sharp from "sharp";
import { createAdminSession, ADMIN_SESSION_COOKIE } from "../src/lib/admin-session.js";
import { hasAdminPermission } from "../src/lib/admin-access.mjs";
import { activeBlogEntries, BLOG_SPREADSHEET } from "../src/lib/blog-source.mjs";

nextEnv.loadEnvConfig(process.cwd());
const base = process.env.BLOG_TEST_URL || "http://localhost:3102";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "Use a local test server.");
const importedPosts = JSON.parse(await readFile("data/blogs/posts.json", "utf8"));
const report = JSON.parse(await readFile("data/blogs/import-report.json", "utf8"));
const posts = activeBlogEntries(importedPosts, report.spreadsheet);
const post = posts.find(post => post.status === "published") || importedPosts[0] || { slug: "test-missing-article" };
const connection = await mysql.createConnection({ host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", database: process.env.DB_NAME || "project10" });
let original, uploaded;
const endpoint = `/api/admin/blogs/${post.slug}/image`;
try {
  const [admins] = await connection.execute("SELECT id, name, email, session_version FROM admins WHERE role = 'admin' ORDER BY id LIMIT 1");
  assert.ok(admins[0], "An existing local administrator is required.");
  const cookie = `${ADMIN_SESSION_COOKIE}=${createAdminSession(admins[0])}`;
  const headers = { Cookie: cookie, Origin: base };
  assert.equal(hasAdminPermission({ role: "custom", permissions: ["contact"] }, "blogs"), false);
  assert.equal(hasAdminPermission({ role: "custom", permissions: ["blogs"] }, "blogs"), true);
  assert.equal((await fetch(`${base}/api/admin/blogs`)).status, 401);
  assert.equal((await fetch(base + endpoint, { method: "POST", body: new FormData() })).status, 401);
  assert.equal((await fetch(base + endpoint, { method: "POST", headers: { ...headers, Origin: "https://example.invalid" }, body: new FormData() })).status, 403);
  const forbidden = new FormData(); forbidden.set("title", "Must not be editable");
  assert.equal((await fetch(base + endpoint, { method: "POST", headers, body: forbidden })).status, posts.length ? 400 : 404);
  const invalid = new FormData(); invalid.set("image", new File(["<script>not an image</script>"], "fake.png", { type: "image/png" }));
  assert.equal((await fetch(base + endpoint, { method: "POST", headers, body: invalid })).status, posts.length ? 400 : 404);
  const response = await fetch(`${base}/api/admin/blogs`, { headers });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.posts.length, posts.length);
  assert.ok(data.posts.every(post => !("html" in post) && !("source" in post)));
  assert.equal(data.source.url, BLOG_SPREADSHEET);
  if (!posts.length) {
    assert.equal(data.source.status, "awaiting-import");
    const listing = await (await fetch(`${base}/blogs`)).text();
    assert.ok(listing.includes("Articles coming soon"));
    const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
    for (const old of importedPosts) assert.ok(!sitemap.includes(`/blogs/${old.slug}</loc>`));
    assert.equal((await fetch(`${base}/blogs/${post.slug}`)).status, 404);
    console.log("PASS: old-source blogs excluded from admin, frontend, sitemap, detail pages and image updates; new-source empty state and access guards verified.");
  } else {
  const [rows] = await connection.execute("SELECT filename FROM blog_images WHERE slug = ?", [post.slug]);
  original = rows[0]?.filename ?? null;
  const buffer = await sharp({ create: { width: 32, height: 20, channels: 3, background: "#22584d" } }).png().toBuffer();
  const form = new FormData(); form.set("image", new File([buffer], "local-verification.png", { type: "image/png" }));
  const saved = await fetch(base + endpoint, { method: "POST", headers, body: form });
  assert.equal(saved.status, 200, await saved.clone().text());
  uploaded = (await saved.json()).image.split("/").at(-1);
  const image = await fetch(`${base}/api/blog-images/${uploaded}`);
  assert.equal(image.status, 200); assert.match(image.headers.get("content-type"), /image\/webp/);
  const imageMetadata = await sharp(Buffer.from(await image.arrayBuffer())).metadata(); assert.equal(imageMetadata.format, "webp");
  const detail = await (await fetch(`${base}/blogs/${post.slug}`)).text();
  assert.ok(detail.includes(uploaded), "Article should use the updated image immediately.");
  const listing = await (await fetch(`${base}/blogs`)).text();
  assert.ok(listing.includes(uploaded), "Listing should use the updated image immediately.");
  console.log("PASS: permission checks, anonymous denial, origin checks, image-only mutations, invalid-file rejection, WebP persistence and immediate public-page updates.");
  }
} finally {
  if (original !== undefined) {
    if (original === null) await connection.execute("DELETE FROM blog_images WHERE slug = ?", [post.slug]);
    else await connection.execute("UPDATE blog_images SET filename = ? WHERE slug = ?", [original, post.slug]);
  }
  if (uploaded && /^[0-9a-f-]{36}\.webp$/.test(uploaded)) await unlink(path.join(process.cwd(), "uploads", "blogs", uploaded));
  await connection.end();
  if (uploaded) console.log("Local test image removed and original image restored.");
}
