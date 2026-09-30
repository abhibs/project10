import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";
import { slugifyBranchName } from "../src/lib/branch-values.mjs";

nextEnv.loadEnvConfig(process.cwd());
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "project10",
});
try {
  await connection.execute(await readFile(new URL("../database/branches.sql", import.meta.url), "utf8"));
  const [columns] = await connection.query("SHOW COLUMNS FROM branches LIKE 'slug'");
  if (!columns.length) await connection.execute("ALTER TABLE branches ADD COLUMN slug VARCHAR(64) NULL AFTER name");
  await connection.beginTransaction();
  try {
    const [rows] = await connection.execute("SELECT id, name, slug FROM branches ORDER BY id FOR UPDATE");
    const held = new Map(rows.filter(row => row.slug).map(row => [row.slug.toLowerCase(), row.id]));
    let updated = 0;
    for (const row of rows) {
      const base = slugifyBranchName(row.name);
      if (!base) throw new Error("Branch " + row.id + " needs a name with letters or numbers before its slug can be generated.");
      let candidate = "";
      for (let suffix = 1; suffix <= 100; suffix++) {
        const ending = suffix === 1 ? "" : "-" + suffix;
        const next = base.slice(0, 64 - ending.length).replace(/-+$/g, "") + ending;
        if (!held.has(next) || held.get(next) === row.id) { candidate = next; break; }
      }
      if (!candidate) throw new Error("Could not find a unique slug for branch " + row.id + ".");
      if (candidate !== row.slug) {
        await connection.execute("UPDATE branches SET slug = ? WHERE id = ?", [candidate, row.id]);
        updated++;
      }
      if (row.slug) held.delete(row.slug.toLowerCase());
      held.set(candidate, row.id);
    }
    await connection.commit();
    const [currentColumn] = await connection.query("SHOW COLUMNS FROM branches LIKE 'slug'");
    if (currentColumn[0]?.Null !== "NO") await connection.execute("ALTER TABLE branches MODIFY COLUMN slug VARCHAR(64) NOT NULL");
    const [indexes] = await connection.query("SHOW INDEX FROM branches WHERE Key_name = 'branches_slug_unique'");
    if (!indexes.length) await connection.execute("ALTER TABLE branches ADD UNIQUE KEY branches_slug_unique (slug)");
    console.log("Branches table is ready. Filled " + updated + " name-based slug(s); branch IDs and other details were preserved.");
  } catch (error) {
    await connection.rollback();
    throw error;
  }
} finally { await connection.end(); }
