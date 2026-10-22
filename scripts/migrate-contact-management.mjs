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
  const [columns] = await connection.query("SHOW COLUMNS FROM contacts");
  const additions = [];
  if (!columns.some((column) => column.Field === "status")) additions.push("ADD COLUMN status ENUM('active', 'inactive') NOT NULL DEFAULT 'inactive'");
  if (!columns.some((column) => column.Field === "comment")) additions.push("ADD COLUMN comment TEXT DEFAULT NULL");
  if (additions.length) await connection.query(`ALTER TABLE contacts ${additions.join(", ")}`);
  await connection.query("ALTER TABLE contacts MODIFY COLUMN status ENUM('active', 'inactive') NOT NULL DEFAULT 'inactive'");
  const [verified] = await connection.query("SHOW COLUMNS FROM contacts");
  if (!["status", "comment"].every((field) => verified.some((column) => column.Field === field))) throw new Error("Schema verification failed.");
  console.log("Contact status and comment columns are ready.");
} catch (error) {
  console.error("Contact management migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
