import { SITE_URL } from "./site-seo.mjs";

// Keep same-site canonicals consistent with the permanent host/trailing-slash redirects.
export function canonicalUrl(value) {
  const url = new URL(value, SITE_URL);
  if (["aryangoldbuyers.com", "www.aryangoldbuyers.com"].includes(url.hostname)) {
    url.protocol = "https:";
    url.host = new URL(SITE_URL).host;
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  }
  return url.href;
}

export function isSitemapIndexable(route, overrides) {
  const site = overrides.find(page => page.route_path === "*" && page.is_active);
  const pathname = new URL(route, SITE_URL).pathname;
  const page = overrides.find(page => page.route_path === pathname && page.is_active);
  const index = page?.robots_index ?? site?.robots_index;
  const extra = page?.robots_extra ?? site?.robots_extra ?? "";
  if (Number(index) === 0 && index != null || /(?:^|[\s,])(noindex|none)(?:$|[\s,])/i.test(extra)) return false;
  return !page?.canonical_url || canonicalUrl(page.canonical_url) === canonicalUrl(route);
}

export const BLOG_PAGE_SIZE = 12;
export function blogArchiveRoutes(postCount) {
  return Array.from({ length: Math.max(1, Math.ceil(postCount / BLOG_PAGE_SIZE)) }, (_, index) => index ? "/blogs?page=" + (index + 1) : "/blogs");
}
