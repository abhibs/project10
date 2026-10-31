import { getSeoPages } from "./admin-db";
import { PAGE_DEFAULTS } from "./site-seo.mjs";

export async function getPageSeoMetadata(route, fallback) {
  fallback = { ...fallback, ...PAGE_DEFAULTS[route], alternates: { ...fallback.alternates, canonical: route } };
  let pages;
  try {
    pages = await getSeoPages();
  } catch (error) {
    // Database SEO overrides are optional; keep serving the page's defaults.
    // console.error surfaces even handled failures in the Next.js dev overlay.
    console.warn("SEO database unavailable; using default metadata:", error.code || error.message);
    return fallback;
  }
  const site = pages.find((page) => page.route_path === "*" && page.is_active);
  const page = pages.find((page) => page.route_path === route && page.is_active);
  const value = (field) => page?.[field] ?? site?.[field];
  const result = { ...fallback };
  const legacyTitles = ["Aryan Gold Buyers", "Aryan Gold | Sell Gold for Instant Cash", "Branches | Aryan Gold Buyers", "About Us | Aryan Gold Buyers", "Services | Aryan Gold Buyers", "Gold Rate | Aryan Gold Buyers"];
  if (page?.meta_title && !legacyTitles.includes(page.meta_title)) result.title = page.meta_title;
  if (page?.meta_description && page.meta_description !== "Aryan Gold Buyers offers gold valuation, cash for gold and pledged gold release services." && !/^Aryan Gold . cash for gold, pledged gold release and doorstep valuation services\.$/.test(page.meta_description)) result.description = page.meta_description;
  if (value("focus_keywords")) result.keywords = value("focus_keywords");
  if (page?.canonical_url) result.alternates = { ...fallback.alternates, canonical: page.canonical_url };
  const og = {};
  for (const [field, key] of [["og_title", "title"], ["og_description", "description"], ["og_site_name", "siteName"], ["og_locale", "locale"]]) {
    if (value(field)) og[key] = value(field);
  }
  if (["website", "article", "profile", "book", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"].includes(value("og_type"))) og.type = value("og_type");
  if (value("og_image")) og.images = [value("og_image")];
  if (Object.keys(og).length) result.openGraph = { title: result.title, description: result.description, ...fallback.openGraph, ...og };
  const twitter = {};
  for (const [field, key] of [["twitter_card", "card"], ["twitter_title", "title"], ["twitter_description", "description"], ["twitter_site", "site"]]) {
    if (value(field)) twitter[key] = value(field);
  }
  if (value("twitter_image")) twitter.images = [value("twitter_image")];
  if (Object.keys(twitter).length) result.twitter = { title: result.title, description: result.description, ...fallback.twitter, ...twitter };
  if (value("robots_index") != null || value("robots_follow") != null || value("robots_extra")) {
    const directives = [value("robots_index") == null ? "" : value("robots_index") ? "index" : "noindex", value("robots_follow") == null ? "" : value("robots_follow") ? "follow" : "nofollow", value("robots_extra")].filter(Boolean);
    result.robots = directives.join(", ");
  }
  return result;
}
