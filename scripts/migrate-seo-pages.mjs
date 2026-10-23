import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";
import { SEO_KEYWORDS } from "../database/seo-keywords.mjs";
import { SERVICE_PAGES } from "../src/lib/service-pages.mjs";

nextEnv.loadEnvConfig(process.cwd());

const pages = [
  ["Site defaults", "*", null],
  ["Home page", "/", "src/app/page.js"],
  ["Google Leads landing page", "/googleleads", "src/app/googleleads/page.js"],
  ["About us", "/about-us", "src/app/(informational)/about-us/page.js"],
  ["Services", "/services", "src/app/(informational)/services/page.js"],
  ...Object.entries(SERVICE_PAGES).map(([slug, service]) => [service.title, `/services/${slug}`, `src/app/(informational)/services/${slug}/page.js`]),
  ["Contact us", "/contact-us", "src/app/contact-us/page.js"],
  ["Branches", "/branches", "src/app/(informational)/branches/page.js"],
  ["Gold rate", "/gold-rate", "src/app/(informational)/gold-rate/page.js"],
  ["Gold rate calculation", "/gold-rate-calculation", "src/app/gold-rate-calculation/page.js"],
];

let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "project10",
    connectTimeout: 5000,
  });
  await connection.query(await readFile(new URL("../database/seo-pages.sql", import.meta.url), "utf8"));
  await connection.beginTransaction();
  for (const [label, route, file] of pages) {
    const source = file ? await readFile(file, "utf8") : "";
    const service = route.startsWith("/services/") ? SERVICE_PAGES[route.split("/").at(-1)] : null;
    const title = service ? `${service.title} | Aryan Gold Buyers` : file ? source.match(/title:\s*"([^"]*)"/)?.[1] || null : "Aryan Gold Buyers";
    const description = service ? service.description : file ? source.match(/description:\s*"([^"]*)"/)?.[1] || null
      : "Aryan Gold Buyers offers gold valuation, cash for gold and pledged gold release services.";
    await connection.execute(
      `INSERT INTO seo_pages (page_label, route_path, meta_title, meta_description, focus_keywords)
       VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
         focus_keywords = IF(focus_keywords IS NULL OR TRIM(focus_keywords) = '', ?, focus_keywords),
         meta_title = IF(meta_title IS NULL OR TRIM(meta_title) = '', ?, meta_title),
         meta_description = IF(meta_description IS NULL OR TRIM(meta_description) = '', ?, meta_description)`,
      [label, route, title, description, SEO_KEYWORDS[route], SEO_KEYWORDS[route], title, description],
    );
  }
  const [rows] = await connection.query("SELECT page_label, route_path, focus_keywords FROM seo_pages ORDER BY id");
  for (const [, route] of pages) {
    if (!rows.some((row) => row.route_path === route)) throw new Error("Missing SEO route: " + route);
    if (!rows.find((row) => row.route_path === route)?.focus_keywords?.trim()) throw new Error("Missing focus keywords: " + route);
  }
  await connection.commit();
  console.log("SEO table verified. Existing SEO records were preserved.");
  console.table(rows);
} catch (error) {
  if (connection) await connection.rollback();
  console.error("SEO migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
