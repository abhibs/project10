import { getSeoPages } from "./admin-db";

export async function getPageSeoMetadata(route, fallback) {
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
  if (value("meta_title")) result.title = value("meta_title");
  if (value("meta_description")) result.description = value("meta_description");
  if (value("focus_keywords")) result.keywords = value("focus_keywords");
  if (value("canonical_url")) result.alternates = { ...fallback.alternates, canonical: value("canonical_url") };
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
