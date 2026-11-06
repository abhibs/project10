import { parseHTML } from "linkedom";
import { prepareArticle, plainText, categoryFor } from "./blog-content.mjs";

export const WEBSITE_BLOG_SOURCE = "https://www.atticagoldcompany.com/blogs/";

export function prepareWebsitePost(html, url) {
  const { document } = parseHTML(html);
  const article = document.querySelector("article");
  const content = article?.querySelector(".payload-richtext.blog-richtext, .entry-content");
  const title = article?.querySelector("h1")?.textContent.trim();
  if (!content || !title) throw new Error("Article title or rich text is missing");
  const schema = [...article.querySelectorAll('script[type="application/ld+json"]')].flatMap(node => {
    try { const value = JSON.parse(node.textContent); return value["@graph"] || [value]; } catch { return []; }
  }).find(value => ["BlogPosting", "Article"].includes(value["@type"]));
  // Remove source promotions as complete blocks so their branch counts and promises
  // cannot be accidentally attributed to Aryan Gold.
  content.querySelectorAll("[class*='bg-gradient'], script, style, form, iframe").forEach(node => node.remove());
  content.querySelectorAll("h2,h3,h4").forEach(node => {
    if (!/attica|why (?:choose|sell.*to)|ready to sell/i.test(node.textContent)) return;
    let following = node.nextElementSibling;
    while (following && !/^H[1-4]$/.test(following.tagName)) {
      const next = following.nextElementSibling;
      following.remove();
      following = next;
    }
    node.remove();
  });
  content.querySelectorAll("a[href]").forEach(node => {
    try {
      const href = node.getAttribute("href");
      if ((href.match(/https?:\/\//g) || []).length > 1) {
        node.removeAttribute("href");
        return;
      }
      const target = new URL(href, url);
      if (/attica/i.test(href) && !/^(www\.)?atticagoldcompany\.com$/.test(target.hostname)) {
        node.removeAttribute("href");
        return;
      }
      if (/^(www\.)?atticagoldcompany\.com$/.test(target.hostname)) {
        const destination = /^\/blogs\/[^/]+\/?$/.test(target.pathname) ? target.pathname.replace(/\/$/, "")
          : /branch/.test(target.pathname) ? "/branches" : /gold-rate|gold-price/.test(target.pathname) ? "/gold-rate" : "/contact-us";
        node.setAttribute("href", destination);
      }
    } catch { node.removeAttribute("href"); }
  });
  // Rewrite recurring editorial wording without changing measurements or figures.
  const rewrite = value => value
    .replace(/Attica Gold Company|Attica Gold|Attica/gi, "Aryan Gold Buyers")
    .replace(/In this (?:comprehensive )?guide,? (?:we will|we'll) /gi, "This guide will ")
    .replace(/It is important to note that /gi, "Keep in mind that ")
    .replace(/Whether you are|Whether you're/gi, "If you are")
    .replace(/When it comes to /gi, "When considering ")
    .replace(/In conclusion,? /gi, "To sum up, ")
    .replace(/Let's (?:take a closer look at|explore|dive into) /gi, "Here is a look at ");
  // Existing sanitizer removes unsupported identity and certification assertions.
  const prepared = prepareArticle(parseHTML(`<html><body>${content.innerHTML}</body></html>`).document);
  const cleaned = parseHTML(`<html><body>${prepared.html}</body></html>`).document;
  const walk = node => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) child.textContent = rewrite(child.textContent);
      else walk(child);
    }
  };
  walk(cleaned.body);
  const edited = prepareArticle(cleaned);
  if (plainText(edited.html).split(/\s+/).length < 80) throw new Error("Insufficient article content after cleanup");
  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
  const neutralTitles = {
    "how-long-to-sell-gold": "How Long Does It Take to Sell Gold? Process and Timing",
    "gold-acid-test-explained": "Gold Acid Test vs XRF: How Gold Purity Is Tested",
    "best-gold-buyers-in-bangalore-attica": "Choosing Trusted Gold Buyers in Bangalore",
    "sell-gold-with-aadhaar": "Selling Gold with Aadhaar: Identity Checks and Payment",
  };
  const editedTitle = neutralTitles[slug] || rewrite(title);
  const sourceId = Number(article.querySelector('script[id^="article-structured-data-"]')?.id.match(/(\d+)$/)?.[1]);
  if (!Number.isSafeInteger(sourceId) || sourceId < 1) throw new Error("Missing stable source article ID");
  let image = article.querySelector("img")?.getAttribute("src");
  if (image) {
    const target = new URL(image, url);
    image = target.pathname.startsWith("/_next/image") ? new URL(target.searchParams.get("url"), url).href : target.href;
  }
  return {
    id: 1000000 + sourceId, slug, title: editedTitle, metaTitle: `${editedTitle} | Aryan Gold Buyers`,
    description: edited.excerpt, category: categoryFor(title), status: "published", ...edited,
    source: { website: WEBSITE_BLOG_SOURCE, url, originalId: sourceId, image, keywords: [],
      publishedAt: schema?.datePublished || null, contentRevision: "Brand cleanup and editorial wording; not a full original rewrite" },
  };
}

export function mergeWebsiteBlogs(sheetPosts, websitePosts) {
  const used = new Set(sheetPosts.map(post => post.slug));
  return [...sheetPosts, ...websitePosts.filter(post => post.source?.website === WEBSITE_BLOG_SOURCE && !used.has(post.slug))];
}
