import { mkdir, readFile, writeFile, rename, access } from "node:fs/promises";
import path from "node:path";
import { renderBlogCover } from "./lib/blog-cover-renderer.mjs";
import { WEBSITE_BLOG_SOURCE, prepareWebsitePost } from "../src/lib/website-blog-import.mjs";

const root = path.join(process.cwd(), "data/blogs");
const cache = path.join(root, "source/website");
const images = path.join(process.cwd(), "public/blog-import");
await mkdir(cache, { recursive: true });
await mkdir(images, { recursive: true });
async function download(url, binary = false) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !/^(www\.)?atticagoldcompany\.com$/.test(parsed.hostname)) throw new Error("Unexpected source host");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return binary ? Buffer.from(await response.arrayBuffer()) : await response.text();
    } catch (error) { if (attempt === 2) throw error; }
  }
}
const xml = await download("https://www.atticagoldcompany.com/posts-sitemap.xml");
const urls = [...new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]).filter(url => /\/blogs\/[^/]+\/?$/.test(new URL(url).pathname)))];
await writeFile(path.join(cache, "sitemap.xml"), xml);
const posts = [], errors = [];
let cursor = 0, finished = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
    try {
      const htmlFile = path.join(cache, `${slug}.html`);
      let html = await readFile(htmlFile, "utf8").catch(() => null);
      if (!html || process.argv.includes("--refresh")) { html = await download(url); await writeFile(htmlFile, html); }
      const post = prepareWebsitePost(html, url);
      if (!post.source.image) throw new Error("Missing cover image");
      const original = path.join(cache, `${slug}.image`);
      let buffer = await readFile(original).catch(() => null);
      if (!buffer) { buffer = await download(post.source.image, true); await writeFile(original, buffer); }
      const cover = path.join(images, `${slug}.webp`);
      if (process.argv.includes("--rebrand") || !await access(cover).then(() => true).catch(() => false)) await renderBlogCover(post, cover);
      post.image = `/blog-import/${slug}.webp`;
      posts.push(post);
    } catch (error) { errors.push({ url, error: error.message }); }
    finished++;
    if (finished % 20 === 0 || finished === urls.length) console.log(`Processed ${finished}/${urls.length}; imported ${posts.length}; errors ${errors.length}`);
  }
}));
posts.sort((a, b) => urls.indexOf(a.source.url) - urls.indexOf(b.source.url));
const report = { website: WEBSITE_BLOG_SOURCE, importedAt: new Date().toISOString(), discovered: urls.length, total: posts.length, images: posts.filter(post => post.image).length, errors };
await writeFile(path.join(root, "website-import-report.json"), JSON.stringify(report, null, 2));
if (errors.length) throw new Error(`Import incomplete (${errors.length} failures). Existing dataset retained; see website-import-report.json. Rerun to retry using the cache.`);
if (new Set(posts.map(post => post.id)).size !== posts.length || new Set(posts.map(post => post.slug)).size !== posts.length) throw new Error("Duplicate source IDs or slugs");
await writeFile(path.join(root, "website-posts.json.tmp"), JSON.stringify(posts));
await rename(path.join(root, "website-posts.json.tmp"), path.join(root, "website-posts.json"));
console.log(`Imported ${posts.length} articles and branded covers. Google Sheet entries are preserved.`);
