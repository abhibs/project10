import { SITE_URL } from "@/lib/site-seo.mjs";
export default function robots() { return {rules:{userAgent:"*",allow:["/", "/api/blog-images/", "/api/branch-images/"],disallow:["/admin/","/api/"]},sitemap: SITE_URL + "/sitemap.xml"}; }
