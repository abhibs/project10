import { copyFile, mkdir, readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";
import { selectBlogVisual } from "../src/lib/blog-visuals.mjs";
import { renderBlogCover } from "./lib/blog-cover-renderer.mjs";

const branded = process.argv.includes("--cover");
const slugs = process.argv.slice(2).filter(value => value !== "--cover");
if (!slugs.length) throw new Error("Provide blog slugs whose uploaded image should be replaced with a topic photo.");
const website = JSON.parse(await readFile("data/blogs/website-posts.json", "utf8"));
const sheet = JSON.parse(await readFile("data/blogs/posts.json", "utf8"));
const posts = new Map([...website, ...sheet].map(post => [post.slug, post]));
for (const slug of slugs) if (!posts.has(slug)) throw new Error(`Unknown blog: ${slug}`);
nextEnv.loadEnvConfig(process.cwd());
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "project10", connectTimeout: 5000,
});
try {
  await mkdir("uploads/blogs", { recursive: true });
  await connection.beginTransaction();
  for (const slug of slugs) {
    const selected = selectBlogVisual(posts.get(slug));
    const filename = `${randomUUID()}.webp`;
    if (branded) await renderBlogCover(posts.get(slug), path.join("uploads/blogs", filename));
    else await copyFile(path.join("public", selected.asset), path.join("uploads/blogs", filename));
    await connection.execute("INSERT INTO blog_images (slug, filename) VALUES (?, ?) ON DUPLICATE KEY UPDATE filename = VALUES(filename)", [slug, filename]);
    console.log(`${slug}: ${selected.theme} ${branded ? "branded cover" : "photo"} (${filename})`);
  }
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
