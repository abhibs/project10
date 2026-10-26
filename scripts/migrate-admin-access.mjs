import nextEnv from "@next/env";
import mysql from "mysql2/promise";

nextEnv.loadEnvConfig(process.cwd());
let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "project10", connectTimeout: 5000,
  });
  const [columns] = await connection.query("SHOW COLUMNS FROM admins");
  const changes = [];
  // Existing accounts retain full administrator access.
  if (!columns.some(({ Field }) => Field === "role")) changes.push("ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'admin'");
  if (!columns.some(({ Field }) => Field === "permissions")) changes.push("ADD COLUMN permissions LONGTEXT DEFAULT NULL");
  if (!columns.some(({ Field }) => Field === "session_version")) changes.push("ADD COLUMN session_version INT UNSIGNED NOT NULL DEFAULT 0");
  if (!columns.some(({ Field }) => Field === "password_hint")) changes.push("ADD COLUMN password_hint VARCHAR(255) NOT NULL DEFAULT ''");
  if (changes.length) await connection.query(`ALTER TABLE admins ${changes.join(", ")}`);
  console.log("Admin roles, permissions and session versions are ready. Existing accounts retain full access.");
} catch (error) {
  console.error("Admin migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally { if (connection) await connection.end(); }
