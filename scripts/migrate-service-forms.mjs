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
  const [columns] = await connection.query("SHOW COLUMNS FROM contacts");
  const types = ["Branch Visit", "Doorstep Service", "Quick Contact", "Contact Page", "Banner Form", "Sell Gold", "Release Pledged Gold", "Doorstep Valuation"];
  const existingType = columns.find((column) => column.Field === "business_type")?.Type;
  if (!existingType?.startsWith("enum(")) throw new Error("Unexpected contact business type schema.");
  const existingValues = [...existingType.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  if (existingValues.some((value) => !types.includes(value))) throw new Error("Unknown contact type; inspect before migrating.");
  const changes = [];
  if (types.some((value) => !existingValues.includes(value))) changes.push(`MODIFY COLUMN business_type ENUM(${types.map((value) => connection.escape(value)).join(",")}) NOT NULL`);
  for (const field of ["release_bank", "release_place"]) {
    if (!columns.some((column) => column.Field === field)) changes.push(`ADD COLUMN \`${field}\` VARCHAR(255) DEFAULT NULL`);
  }
  if (changes.length) await connection.query(`ALTER TABLE contacts ${changes.join(", ")}`);
  const [verified] = await connection.query("SHOW COLUMNS FROM contacts");
  if (!["release_bank", "release_place"].every((field) => verified.some((column) => column.Field === field))) throw new Error("Service schema verification failed.");
  console.log("Service enquiry types, release bank and release place are ready.");
} catch (error) {
  console.error("Service form migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally { if (connection) await connection.end(); }
