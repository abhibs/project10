import { SITE_URL } from "@/lib/site-seo.mjs";
export default function robots() { return {rules:{userAgent:"*",allow:"/",disallow:["/admin/","/api/"]},sitemap: SITE_URL + "/sitemap.xml"}; }
