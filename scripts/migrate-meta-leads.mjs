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
  const changes = [];
  const businessType = columns.find((column) => column.Field === "business_type")?.Type;
  if (!businessType?.startsWith("enum(")) throw new Error("Unexpected contact business type schema.");
  if (!businessType.includes("'meta-lead'")) changes.push(`MODIFY COLUMN business_type ${businessType.slice(0, -1)},'meta-lead') NOT NULL`);
  if (!columns.some((column) => column.Field === "language")) changes.push("ADD COLUMN language ENUM('kannada','english') DEFAULT NULL AFTER area");
  if (!columns.some((column) => column.Field === "meta_lead_id")) changes.push("ADD COLUMN meta_lead_id VARCHAR(128) DEFAULT NULL AFTER language");
  if (changes.length) await connection.query(`ALTER TABLE contacts ${changes.join(", ")}`);

  const [indexes] = await connection.query("SHOW INDEX FROM contacts");
  if (!indexes.some((index) => index.Key_name === "contacts_meta_lead_id_unique")) {
    await connection.query("ALTER TABLE contacts ADD UNIQUE KEY contacts_meta_lead_id_unique (meta_lead_id)");
  }
  await connection.query("UPDATE contacts SET business_type = 'meta-lead' WHERE meta_lead_id IS NOT NULL AND business_type = 'googlelead-lp'");

  const [verified] = await connection.query("SHOW COLUMNS FROM contacts");
  const language = verified.find((column) => column.Field === "language")?.Type || "";
  if (!language.includes("'kannada'") || !language.includes("'english'") || !verified.some((column) => column.Field === "meta_lead_id")) {
    throw new Error("Meta lead schema verification failed.");
  }
  console.log("Meta lead language and source ID columns are ready.");
} catch (error) {
  console.error("Meta lead migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
