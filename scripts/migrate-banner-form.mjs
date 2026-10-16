import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";

nextEnv.loadEnvConfig(process.cwd());
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
  const [columns] = await connection.query("SHOW COLUMNS FROM contacts LIKE 'business_type'");
  const type = columns[0]?.Type;
  const expected = "enum('Branch Visit','Doorstep Service','Quick Contact','Contact Page')";
  const updated = "enum('Branch Visit','Doorstep Service','Quick Contact','Contact Page','Banner Form')";
  if (type === expected) {
    await connection.query(await readFile(new URL("../database/banner-form-migration.sql", import.meta.url), "utf8"));
  } else if (type !== updated) {
    throw new Error("Unexpected contacts.business_type schema; inspect it before migrating.");
  }
  const [verified] = await connection.query("SHOW COLUMNS FROM contacts LIKE 'business_type'");
  if (verified[0]?.Type !== updated) throw new Error("Banner Form schema verification failed.");
  console.log("Banner Form is an allowed contact type. Existing records are unchanged.");
} catch (error) {
  console.error("Banner Form migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
