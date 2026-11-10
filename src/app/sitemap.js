import { getBranches, getSeoPages } from "@/lib/admin-db";
import { branchPath } from "@/lib/branch-links.mjs";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/site-seo.mjs";
import { blogArchiveRoutes, isSitemapIndexable } from "@/lib/seo-indexing.mjs";
import { publishedBlogs } from "@/lib/blogs";

export const dynamic = "force-dynamic";
export default async function sitemap() {
  const [branches, overrides, blogs] = await Promise.all([getBranches(true), getSeoPages(), publishedBlogs()]);
  const routes = [...PUBLIC_ROUTES, ...blogArchiveRoutes(blogs.length), ...blogs.map(post => "/blogs/" + post.slug), ...branches.map(branchPath)];
  return [...new Set(routes)].filter(route => isSitemapIndexable(route, overrides))
    .map(route => ({ url: new URL(route, SITE_URL).href }));
}
