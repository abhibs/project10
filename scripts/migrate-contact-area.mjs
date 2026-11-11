import nextEnv from "@next/env";
import mysql from "mysql2/promise";
nextEnv.loadEnvConfig(process.cwd());
const db = await mysql.createConnection({ host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", database: process.env.DB_NAME || "project10" });
try {
  const [columns] = await db.query("SHOW COLUMNS FROM contacts LIKE 'area'");
  if (!columns.length) await db.query("ALTER TABLE contacts ADD COLUMN area VARCHAR(160) DEFAULT NULL AFTER city");
  console.log("Separate contact area column ready.");
} finally { await db.end(); }
