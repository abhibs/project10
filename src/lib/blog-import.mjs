import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ExcelJS from "exceljs";
import { parseHTML } from "linkedom";
import { prepareArticle, plainText, slugify, categoryFor } from "./blog-content.mjs";
import { BLOG_SPREADSHEET } from "./blog-source.mjs";
import { SITE_URL } from "./site-seo.mjs";

export async function importBlogContent({ refreshSheet = false, refreshArticles = false, strict = false, root = pathToFileURL(path.join(process.cwd(), "data", "blogs") + path.sep) } = {}) {
const spreadsheet = BLOG_SPREADSHEET;
await mkdir(new URL("source/articles/", root), { recursive: true });
if (refreshSheet) {
  const response = await fetch(`${spreadsheet}/export?format=xlsx`, { cache: "no-store", signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Spreadsheet download failed: ${response.status}`);
  await writeFile(new URL("source/content-plan.xlsx", root), Buffer.from(await response.arrayBuffer()));
  await writeFile(new URL("source/workbook-source.json", root), JSON.stringify({ spreadsheet }, null, 2));
} else {
  const cached = await readFile(new URL("source/workbook-source.json", root), "utf8").then(JSON.parse)
    .catch(() => readFile(new URL("import-report.json", root), "utf8").then(JSON.parse));
  if (cached.spreadsheet !== spreadsheet) throw new Error("The cached workbook belongs to the previous Google Sheet. Run npm run import:blogs -- --refresh-sheet after granting read access to the new sheet. Existing published articles have not been changed.");
}
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(fileURLToPath(new URL("source/content-plan.xlsx", root)));
const sheets = workbook.worksheets.map(sheet => ({ name: sheet.name, rows: sheet.getSheetValues() }));
await writeFile(new URL("source/workbook.json", root), JSON.stringify(sheets));
const text = value => typeof value === "object" && value ? value.text || value.richText?.map(x => x.text).join("") || String(value.result ?? "") : String(value ?? "");
const sheet = sheets.find(sheet => sheet.name === "Blog Pages Content")
  || sheets.find(sheet => sheet.rows.some(row => row && /^BLOG\s+\d+(?:\s*\([^)]*\))?:/i.test(text(row[1]))));
if (!sheet && sheets.some(sheet => sheet.rows.some(row => row?.some(value => text(value).trim())))) throw new Error("The workbook must contain blog topic rows. Existing published articles have not been changed.");
const groups = [];
for (const row of sheet?.rows || []) {
  if (!row) continue;
  const heading = text(row[1]).match(/^BLOG\s+(\d+)(?:\s*\([^)]*\))?:\s*(.*)/i);
  if (heading) groups.push({ id: Number(heading[1]), label: heading[2], rows: [] });
  else if (groups.length) groups.at(-1).rows.push(row);
}
const posts = groups.map(group => {
  const metadata = group.rows.find(row => /^\/blogs\//.test(text(row[4]))) || [];
  const contentCell = group.rows.map(row => row[10]).find(value => value?.hyperlink?.includes("docs.google.com"));
  const sourceSlug = text(metadata[4]);
  const slug = slugify(sourceSlug.replace(/^\/blogs\//, "").replace(/\/+$/, "") || group.label);
  return {
    id: group.id, slug, title: text(metadata[5]).trim() || group.label,
    metaTitle: text(metadata[6]).trim() || group.label,
    description: text(metadata[7]).trim(), category: categoryFor(group.label),
    source: { spreadsheet, title: group.label, slug: sourceSlug, canonical: text(metadata[8]), schemas: text(metadata[9]), documentUrl: contentCell?.hyperlink || null,
      intent: text(group.rows.find(row => text(row[1]) === "User Intent")?.[4]),
      keywords: group.rows.filter(row => /^(primary|secondary)$/i.test(text(row[3]))).map(row => ({ keyword: text(row[1]), volume: row[2] ?? null, role: text(row[3]) })) },
    status: "draft", html: "", headings: [], excerpt: "", readMinutes: 0,
  };
});
const used = new Set();
for (const post of posts) {
  if (used.has(post.slug)) { post.source.duplicateSlug = post.slug; post.slug += `-guide-${post.id}`; }
  used.add(post.slug);
}
let index = 0, complete = 0;
const errors = [];
async function worker() {
  while (index < posts.length) {
    const post = posts[index++];
    const id = post.source.documentUrl?.match(/\/d\/([\w-]+)/)?.[1];
    if (id) {
      const file = new URL(`source/articles/${id}.html`, root);
      try {
        let html = refreshArticles ? null : await readFile(file, "utf8").catch(() => null);
        if (!html) {
          let response;
          for (let attempt = 0; attempt < 3; attempt++) {
            response = await fetch(`https://docs.google.com/document/d/${id}/export?format=html`, { cache: "no-store", signal: AbortSignal.timeout(30000) });
            if (response.ok || ![429, 500, 502, 503].includes(response.status)) break;
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
          if (!response.ok) throw new Error(`Document export returned HTTP ${response.status}`);
          html = await response.text();
          if (!/<body/i.test(html)) throw new Error("Export did not contain article HTML");
          await writeFile(file, html);
        }
        const { document } = parseHTML(html);
        const prepared = prepareArticle(document);
        Object.assign(post, prepared);
        if (plainText(post.html).split(/\s+/).length >= 80) post.status = "published";
        else errors.push({ id: post.id, error: "Article too short after removing source business claims" });
      } catch (error) { errors.push({ id: post.id, error: error.message }); }
    } else errors.push({ id: post.id, error: "No linked article document in spreadsheet" });
    const rewrite = value => value.replace(/Attica Gold Company|Attica Gold|Attica/gi, "Aryan Gold Buyers").replace(/\s*\|\s*Aryan Gold Buyers(?:\s*\|\s*Aryan Gold Buyers)+/g, " | Aryan Gold Buyers");
    post.title = rewrite(post.title);
    post.metaTitle = rewrite(post.metaTitle);
    post.source.title = rewrite(post.source.title);
    post.source.canonical = new URL(`/blogs/${post.slug}/`, SITE_URL).href;
    // Excerpts describe the actual imported article, not source-company marketing claims.
    post.description = post.excerpt || rewrite(post.description);
    complete++;
    if (complete % 25 === 0) console.log(`Processed ${complete}/${posts.length}; unavailable ${errors.length}`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
if (strict && errors.length) throw new Error(`Refresh failed for ${errors.length} article(s): ${errors.map(item => item.error).join("; ")}. Existing articles have been kept. Check sharing access to the linked Google Docs.`);
// Keep the last published version of unavailable rows while refreshing healthy ones.
const previousPosts = await readFile(new URL("posts.json", root), "utf8").then(JSON.parse).catch(error => {
  if (error.code === "ENOENT") return [];
  throw error;
});
let preserved = 0;
for (const error of errors) {
  const position = posts.findIndex(post => post.id === error.id);
  const post = posts[position];
  error.title = post.title;
  error.documentUrl = post.source.documentUrl;
  const previous = previousPosts.find(item => item.id === post.id && item.source?.spreadsheet === spreadsheet && item.status === "published");
  error.preserved = Boolean(previous);
  if (previous) { posts[position] = previous; preserved++; }
}
const updated = posts.filter(post => post.status === "published").length - preserved;
await writeFile(new URL("posts.json.tmp", root), JSON.stringify(posts));
await rename(new URL("posts.json.tmp", root), new URL("posts.json", root));
await writeFile(new URL("import-report.json", root), JSON.stringify({ spreadsheet, tabs: sheets.map(s => s.name), total: posts.length, published: posts.filter(p => p.status === "published").length, duplicateSlugs: posts.filter(p => p.source.duplicateSlug).map(p => ({ id: p.id, sourceSlug: p.source.duplicateSlug, importedSlug: p.slug })), errors }, null, 2));
console.log(`Imported ${posts.length} entries; ${posts.filter(p => p.status === "published").length} published; ${errors.length} unavailable. See data/blogs/import-report.json.`);

return { total: posts.length, published: posts.filter(post => post.status === 'published').length, updated, preserved, errors };
}
