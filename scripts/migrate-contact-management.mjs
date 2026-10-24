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
  if (!columns.some((column) => column.Field === "details")) additions.push("ADD COLUMN details TEXT DEFAULT NULL");
  if (!columns.some((column) => column.Field === "callback_date")) additions.push("ADD COLUMN callback_date DATE DEFAULT NULL");
  if (additions.length) await connection.query(`ALTER TABLE contacts ${additions.join(", ")}`);
  const statusType = columns.find((column) => column.Field === "status")?.Type || "enum('active','inactive')";
  if (!statusType.includes("'pending_callback'")) {
    await connection.query(`ALTER TABLE contacts MODIFY COLUMN status ${statusType.slice(0, -1)},'pending_callback') NOT NULL DEFAULT 'inactive'`);
  }
  const businessType = columns.find((column) => column.Field === "business_type")?.Type;
  if (!businessType?.startsWith("enum(")) throw new Error("Unexpected contacts business_type schema.");
  if (!businessType.includes("'Incoming Calls'")) {
    await connection.query(`ALTER TABLE contacts MODIFY COLUMN business_type ${businessType.slice(0, -1)},'Incoming Calls') NOT NULL`);
  }
  const [indexes] = await connection.query("SHOW INDEX FROM contacts");
  if (!indexes.some((index) => index.Column_name === "callback_date" && index.Seq_in_index === 1)) {
    await connection.query("ALTER TABLE contacts ADD KEY contacts_callback_date_index (callback_date)");
  }
  const [verified] = await connection.query("SHOW COLUMNS FROM contacts");
  if (!["status", "comment", "details", "callback_date"].every((field) => verified.some((column) => column.Field === field))) throw new Error("Schema verification failed.");
  console.log("Contact management, incoming-call and callback columns are ready.");
} catch (error) {
  console.error("Contact management migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
