import nextEnv from "@next/env";
import mysql from "mysql2/promise";

nextEnv.loadEnvConfig(process.cwd());

const formTypes = [
  "Branch Visit", "Doorstep Service", "Quick Contact", "Contact Page", "Banner Form",
  "Sell Gold", "Release Pledged Gold", "Doorstep Valuation", "googlelead-lp",
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

  const [columns] = await connection.query("SHOW COLUMNS FROM contacts");
  const businessType = columns.find((column) => column.Field === "business_type")?.Type;
  if (!businessType?.startsWith("enum(")) throw new Error("Unexpected contact business type schema.");
  const existingTypes = [...businessType.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  if (existingTypes.some((type) => !formTypes.includes(type))) {
    throw new Error("Unknown contact type; inspect the schema before migrating.");
  }

  const changes = [];
  if (!existingTypes.includes("googlelead-lp")) {
    changes.push(`MODIFY COLUMN business_type ENUM(${formTypes.map((type) => connection.escape(type)).join(",")}) NOT NULL`);
  }
  if (!columns.some((column) => column.Field === "tracking_data")) changes.push("ADD COLUMN tracking_data LONGTEXT DEFAULT NULL AFTER adgroup_id");
  if (!columns.some((column) => column.Field === "landing_page")) changes.push("ADD COLUMN landing_page VARCHAR(2048) DEFAULT NULL AFTER tracking_data");
  if (!columns.some((column) => column.Field === "referrer")) changes.push("ADD COLUMN referrer VARCHAR(2048) DEFAULT NULL AFTER landing_page");
  if (changes.length) await connection.query(`ALTER TABLE contacts ${changes.join(", ")}`);

  const [verified] = await connection.query("SHOW COLUMNS FROM contacts");
  const verifiedType = verified.find((column) => column.Field === "business_type")?.Type || "";
  if (!verifiedType.includes("'googlelead-lp'") || !["tracking_data", "landing_page", "referrer"].every((field) => verified.some((column) => column.Field === field))) {
    throw new Error("Google lead schema verification failed.");
  }
  console.log("Google lead form type and attribution columns are ready.");
} catch (error) {
  console.error("Google lead migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
