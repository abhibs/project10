import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ExcelJS from "exceljs";
import { importBlogContent } from "../src/lib/blog-import.mjs";

test("refresh replaces removed entries, reloads document headings, and preserves posts on failure", async () => {
  const folder = await mkdtemp(path.join(tmpdir(), "blog-refresh-"));
  const root = pathToFileURL(folder + path.sep);
  const originalFetch = globalThis.fetch;
  let titles = ["Bangalore", "Chennai"], heading = "Original heading", fail = false, blocked = new Set();
  globalThis.fetch = async url => {
    if (String(url).includes("spreadsheets")) {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Sheet1");
      for (const [index, title] of titles.entries()) {
        sheet.addRow([`BLOG ${index + 1}: ${title}`]);
        const row = sheet.addRow([]);
        row.getCell(4).value = `/blogs/${title.toLowerCase()}/`;
        row.getCell(5).value = title;
        if (title !== "Missing") row.getCell(10).value = { text: title, hyperlink: `https://docs.google.com/document/d/${title}/edit` };
      }
      return new Response(await workbook.xlsx.writeBuffer());
    }
    if (fail) return new Response("Forbidden", { status: 403 });
    if ([...blocked].some(title => String(url).includes(`/d/${title}/`))) return new Response("Unauthorized", { status: 401 });
    return new Response(`<html><body><h1>Title</h1><h2>${heading}</h2><p>${"Useful educational information about selling gold and checking purity. ".repeat(20)}</p></body></html>`);
  };
  try {
    const options = { root, refreshSheet: true, refreshArticles: true, strict: true };
    assert.equal((await importBlogContent(options)).total, 2);
    titles = ["Bangalore"]; heading = "Updated heading";
    assert.equal((await importBlogContent(options)).total, 1);
    const before = await readFile(new URL("posts.json", root), "utf8");
    const posts = JSON.parse(before);
    assert.equal(posts.length, 1);
    assert.match(posts[0].html, /Updated heading/);
    assert.doesNotMatch(posts[0].html, /Original heading/);
    fail = true;
    await assert.rejects(importBlogContent(options), /Existing articles have been kept/);
    assert.equal(await readFile(new URL("posts.json", root), "utf8"), before);
    fail = false;
    titles = ["Bangalore", "Chennai", "Missing", "Private"];
    blocked = new Set(["Bangalore", "Private"]);
    heading = "Fresh Chennai heading";
    const partial = await importBlogContent({ ...options, strict: false });
    assert.equal(partial.updated, 1);
    assert.equal(partial.preserved, 1);
    assert.equal(partial.errors.length, 3);
    const refreshed = JSON.parse(await readFile(new URL("posts.json", root), "utf8"));
    assert.deepEqual(refreshed[0], posts[0]);
    assert.match(refreshed[1].html, /Fresh Chennai heading/);
    assert.equal(refreshed[1].status, "published");
    assert.equal(refreshed[2].status, "draft");
    assert.equal(refreshed[3].status, "draft");
    assert.equal(partial.errors.find(item => item.id === 1).preserved, true);
    assert.match(partial.errors.find(item => item.id === 4).documentUrl, /Private/);
    titles = []; fail = false;
    assert.equal((await importBlogContent(options)).total, 0);
    assert.deepEqual(JSON.parse(await readFile(new URL("posts.json", root), "utf8")), []);
  } finally {
    globalThis.fetch = originalFetch;
    await rm(folder, { recursive: true, force: true });
  }
});
