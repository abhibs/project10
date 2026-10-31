import { getBranches, getSeoPages } from "@/lib/admin-db";
import { branchPath } from "@/lib/branch-links.mjs";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/site-seo.mjs";
export const dynamic = "force-dynamic";
export default async function sitemap() {
 const [branches, overrides] = await Promise.all([getBranches(true), getSeoPages()]);
 const site = overrides.find(p => p.route_path === "*" && p.is_active);
 return [...new Set([...PUBLIC_ROUTES,...branches.map(branchPath)])].filter(route => {
 const page = overrides.find(p => p.route_path === route && p.is_active);
 return (page?.robots_index ?? site?.robots_index) !== 0 && !/noindex/i.test(page?.robots_extra ?? site?.robots_extra ?? "") && (!page?.canonical_url || new URL(page.canonical_url, SITE_URL).href === new URL(route,SITE_URL).href);
 }).map(route => ({url:new URL(route,SITE_URL).href}));
}
