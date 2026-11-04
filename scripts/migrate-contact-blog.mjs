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
  const businessType = columns.find(column => column.Field === "business_type")?.Type;
  if (!businessType?.startsWith("enum(")) throw new Error("Unexpected contacts business_type schema.");
  const changes = [];
  if (!businessType.includes("'Blog Page'")) changes.push(`MODIFY COLUMN business_type ${businessType.slice(0, -1)},'Blog Page') NOT NULL`);
  if (!columns.some(column => column.Field === "blog_id")) changes.push("ADD COLUMN blog_id BIGINT UNSIGNED DEFAULT NULL");
  if (!columns.some(column => column.Field === "blog_name")) changes.push("ADD COLUMN blog_name VARCHAR(255) DEFAULT NULL");
  if (changes.length) await connection.query(`ALTER TABLE contacts ${changes.join(", ")}`);
  console.log("Blog Page contact type, blog ID and blog name are ready.");
} catch (error) {
  console.error("Contact blog migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
