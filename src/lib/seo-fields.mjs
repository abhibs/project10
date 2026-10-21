export const SEO_GROUPS = {
  Search: ["meta_title", "meta_description", "focus_keywords", "canonical_url"],
  Social: ["og_title", "og_description", "og_image", "og_type", "og_site_name", "og_locale", "twitter_card", "twitter_title", "twitter_description", "twitter_image", "twitter_site"],
  Advanced: ["robots_index", "robots_follow", "robots_extra", "structured_data"],
  Scripts: ["head_scripts", "body_start_scripts", "body_end_scripts"],
};
export const SEO_FIELDS = Object.values(SEO_GROUPS).flat();

export function validateSeo(body) {
  const result = {};
  for (const field of ["page_label", "route_path", ...SEO_FIELDS]) {
    const value = body[field];
    if (field === "robots_index" || field === "robots_follow") {
      if (value !== "" && value != null && ![0, 1, "0", "1"].includes(value)) throw new Error("Invalid robots setting.");
      result[field] = value === "" || value == null ? null : Number(value);
    } else {
      if (value != null && typeof value !== "string") throw new Error("Invalid field: " + field);
      result[field] = value?.trim() || null;
      const limit = field.includes("scripts") ? 100000 : field === "structured_data" ? 60000 : field.includes("description") || field === "focus_keywords" ? 10000 : field.includes("url") || field.includes("image") ? 2048 : 255;
      if (result[field]?.length > limit) throw new Error("Value too long: " + field);
    }
  }
  if (!result.page_label || !result.route_path || !/^(\*|\/(?!\/)[^?#\s]*)$/.test(result.route_path)) throw new Error("Enter a page label and a route such as /contact-us, or * for defaults.");
  if (result.route_path !== "/" && result.route_path !== "*") result.route_path = result.route_path.replace(/\/+$/, "");
  for (const field of ["canonical_url", "og_image", "twitter_image"]) {
    if (result[field]) {
      let url;
      try { url = new URL(result[field]); } catch { throw new Error("Enter a full https:// URL for " + field); }
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid URL for " + field);
    }
  }
  if (result.twitter_card && !["summary", "summary_large_image", "app", "player"].includes(result.twitter_card)) throw new Error("Invalid Twitter card.");
  if (result.structured_data) {
    let parsed;
    try { parsed = JSON.parse(result.structured_data); } catch { throw new Error("Structured data must be valid JSON."); }
    if (!parsed || typeof parsed !== "object") throw new Error("Structured data must be a JSON object or array.");
  }
  return result;
}
