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
  const expected = ["gclid", "utm_source", "utm_campaign", "keyword", "adgroup_id"];
  const [columns] = await connection.query("SHOW COLUMNS FROM contacts");
  const missing = expected.filter((name) => !columns.some((column) => column.Field === name));
  if (missing.length) {
    await connection.query(`ALTER TABLE contacts ${missing.map((name) => `ADD COLUMN \`${name}\` VARCHAR(255) DEFAULT NULL`).join(", ")}`);
  }
  const [verified] = await connection.query("SHOW COLUMNS FROM contacts");
  if (!expected.every((name) => verified.some((column) => column.Field === name))) {
    throw new Error("Contact attribution schema verification failed.");
  }
  console.log("All five contact attribution columns are available.");
} catch (error) {
  console.error("Contact attribution migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
