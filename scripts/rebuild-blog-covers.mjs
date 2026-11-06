import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderBlogCover } from "./lib/blog-cover-renderer.mjs";
import { selectBlogVisual } from "../src/lib/blog-visuals.mjs";

const website = JSON.parse(await readFile("data/blogs/website-posts.json", "utf8"));
const sheet = JSON.parse(await readFile("data/blogs/posts.json", "utf8"));
const posts = new Map([...website, ...sheet].map(post => [post.slug, post]));
const manifest = {};
const previous = await readFile("data/blogs/cover-manifest.json", "utf8").then(JSON.parse).catch(error => {
  if (error.code === "ENOENT") return {};
  throw error;
});
const counts = {};
let cursor = 0;
const entries = [...posts.values()];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < entries.length) {
    const post = entries[cursor++];
    const image = `/blog-import/${post.slug}.webp`;
    let selected = selectBlogVisual(post);
    if (!process.argv.includes("--changed") || previous[post.slug]?.asset !== selected.asset) {
      selected = await renderBlogCover(post, path.join("public", image));
    }
    manifest[post.slug] = { image: `${image}?v=photo-v2`, ...selected };
    counts[selected.theme] = (counts[selected.theme] || 0) + 1;
  }
}));
await writeFile("data/blogs/cover-manifest.json", JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ total: entries.length, themes: counts }, null, 2));
