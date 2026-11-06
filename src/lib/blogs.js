import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { getBlogImages } from "./admin-db";
import { BLOG_SPREADSHEET, activeBlogEntries } from "./blog-source.mjs";
import { mergeWebsiteBlogs } from "./website-blog-import.mjs";

export const blogDataset = cache(async () => {
  const report = JSON.parse(await readFile(path.join(process.cwd(), "data/blogs/import-report.json"), "utf8"));
  const sheetPosts = activeBlogEntries(JSON.parse(await readFile(path.join(process.cwd(), "data/blogs/posts.json"), "utf8")), report.spreadsheet);
  const websitePosts = await readFile(path.join(process.cwd(), "data/blogs/website-posts.json"), "utf8").then(JSON.parse).catch(error => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const covers = await readFile(path.join(process.cwd(), "data/blogs/cover-manifest.json"), "utf8").then(JSON.parse).catch(error => {
    if (error.code === "ENOENT") return {};
    throw error;
  });
  const posts = mergeWebsiteBlogs(sheetPosts, websitePosts).map(post => ({ ...post, image: covers[post.slug]?.image || post.image }));
  return { posts, source: { url: BLOG_SPREADSHEET, status: posts.length ? "imported" : "awaiting-import" } };
});
export async function allBlogs() { return (await blogDataset()).posts; }
export const blogImages = cache(async () => {
  try { return new Map((await getBlogImages()).map(row => [row.slug, row.filename])); }
  catch (error) { console.warn("Blog images unavailable:", error.code || error.message); return new Map(); }
});
export async function publishedBlogs() { return (await allBlogs()).filter(post => post.status === "published"); }
export async function findBlog(slug) { return (await allBlogs()).find(post => post.slug === slug); }
const defaults = { "Gold loans": "/service-pledged-gold.webp", "Gold purity": "/buy-gold-jewellery.webp", "Gold weights": "/buy-gold-coins.webp", "Gold investment": "/buy-gold-bars.webp", "Gold rates": "/buy-gold-bars.webp", "Selling gold": "/buy-old-gold.webp" };
export function blogImage(post, images) { return images.get(post.slug) ? `/api/blog-images/${images.get(post.slug)}` : post.image || defaults[post.category] || "/buy-gold-bars.webp"; }
export function blogSummary(post) {
  return { id: post.id, slug: post.slug, title: post.title, category: post.category, excerpt: post.excerpt, readMinutes: post.readMinutes, status: post.status };
}
