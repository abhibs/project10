import sanitizeHtml from "sanitize-html";

export const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function plainText(html) { return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
export function categoryFor(title) {
  if (/loan|pledge|nbfc|bank|interest|emi|auction/i.test(title)) return "Gold loans";
  if (/karat|carat|purity|hallmark|kdm|bis|fake/i.test(title)) return "Gold purity";
  if (/gram|tola|sovereign|weight|bhori|ana|ounce|pavan/i.test(title)) return "Gold weights";
  if (/invest|mutual|fixed deposit|real estate|etf|bond|futures/i.test(title)) return "Gold investment";
  if (/rate|price|market|forecast|predict/i.test(title)) return "Gold rates";
  return "Selling gold";
}

export function safeArticleHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "h4", "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "td", "th", "blockquote", "hr", "sup", "sub"],
    allowedAttributes: { a: ["href", "title", "rel"], h2: ["id"], h3: ["id"], th: ["scope", "colspan", "rowspan"], td: ["colspan", "rowspan"] },
    allowedSchemes: ["https", "http", "mailto", "tel"], allowProtocolRelative: false,
    transformTags: { a: (tagName, attrs) => {
      let href = attrs.href || "";
      try { if (href.startsWith("https://www.google.com/url?")) href = new URL(href).searchParams.get("q") || href; } catch { href = ""; }
      if (/atticagoldcompany\.com/i.test(href)) {
        let pathname = "/";
        try { pathname = new URL(href).pathname; } catch { /* Invalid source URLs become a safe internal link. */ }
        href = /branch/i.test(pathname) ? "/branches" : /contact/i.test(pathname) ? "/contact-us" : /gold-rate|gold-price/.test(pathname) ? "/gold-rate" : /sell-gold/.test(pathname) ? "/services/sell-gold" : "/blogs";
      }
      // Source-company telephone, email and WhatsApp links must not become Aryan contacts.
      if (/^(tel:|mailto:)|wa\.me|whatsapp\.com/i.test(href)) href = "/contact-us";
      return { tagName, attribs: { href, rel: "noopener noreferrer" } };
    } },
  });
}

export function prepareArticle(document) {
  const body = document.querySelector("body");
  if (!body) return { html: "", headings: [], excerpt: "", readMinutes: 0 };
  body.querySelectorAll("script,style,iframe,form,object,svg,img").forEach(node => node.remove());
  const firstTitle = [...body.children].find(node => node.tagName === "H1");
  if (firstTitle) {
    // The source documents put a private editorial metadata table before the article title.
    for (const node of [...body.children]) { if (node === firstTitle) break; node.remove(); }
  }
  let editorialTail = false;
  for (const node of [...body.children]) {
    if (/^(INTERNAL LINKS|JSON-LD SCHEMA MARKUP|SCHEMA MARKUP)\s*[-–—]|FOR DEV TEAM|NOT FOR PAGE BODY/i.test(node.textContent.trim())) editorialTail = true;
    if (editorialTail) node.remove();
    else if (/LIVE RATE WIDGET|WIDGET PLACEHOLDER|Embed.*widget|check the live widget|use the live ticker|widget below|\[INSERT|\{\{[^}]+\}\}/i.test(node.textContent)) node.remove();
  }
  // Remove source-business promotional sections and their assertions, preserving the educational article.
  let marketing = false;
  for (const node of [...body.children]) {
    const value = node.textContent.trim();
    if (/^H[1-4]$/.test(node.tagName)) marketing = /why (choose|sell.*to)|about attica|ready to sell|visit.*attica|why attica|contact attica/i.test(value);
    if (marketing) node.remove();
  }
  body.querySelectorAll("p,li,h1,h2,h3,h4,tr").forEach(node => {
    const value = node.textContent.trim();
    if (/attica|ISO\s*9001|200\+?\s*branch|8880\s*300\s*300|zero hidden|guaranteed.*price/i.test(value) || /^(table of contents|toggle|meta title|meta description|canonical|url slug|schema types?)\s*:?.*$/i.test(value)) node.remove();
  });
  body.querySelectorAll("h1").forEach(node => node.remove());
  const headings = [], ids = new Set();
  body.querySelectorAll("h2,h3").forEach(node => {
    const title = node.textContent.trim();
    if (!title) { node.remove(); return; }
    const base = slugify(title) || "section";
    let id = base, count = 2;
    while (ids.has(id)) id = `${base}-${count++}`;
    ids.add(id); node.setAttribute("id", id); headings.push({ id, title, level: node.tagName === "H2" ? 2 : 3 });
  });
  const html = safeArticleHtml(body.innerHTML);
  const paragraphs = [...body.querySelectorAll("p")].map(node => node.textContent.replace(/\s+/g, " ").trim()).filter(value => value.length > 70 && !/^\s*(last updated|published|at a glance|blog \d+)/i.test(value));
  const excerpt = (paragraphs[0] || plainText(html)).slice(0, 185).replace(/\s+\S*$/, "") + "…";
  return { html, headings, excerpt, readMinutes: Math.max(1, Math.ceil(plainText(html).split(/\s+/).length / 220)) };
}
