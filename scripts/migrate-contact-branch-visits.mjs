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
  const statusType = columns.find((column) => column.Field === "status")?.Type;
  if (!statusType?.startsWith("enum(")) throw new Error("Unexpected contacts status schema.");
  if (!statusType.includes("'visiting_branch'")) {
    await connection.query(`ALTER TABLE contacts MODIFY COLUMN status ${statusType.slice(0, -1)},'visiting_branch') NOT NULL DEFAULT 'inactive'`);
  }

  const additions = [];
  if (!columns.some((column) => column.Field === "visit_branch_id")) additions.push("ADD COLUMN visit_branch_id VARCHAR(64) DEFAULT NULL AFTER callback_date");
  if (!columns.some((column) => column.Field === "visit_date")) additions.push("ADD COLUMN visit_date DATE DEFAULT NULL AFTER visit_branch_id");
  if (!columns.some((column) => column.Field === "visit_time")) additions.push("ADD COLUMN visit_time TIME DEFAULT NULL AFTER visit_date");
  if (additions.length) await connection.query(`ALTER TABLE contacts ${additions.join(", ")}`);

  const [indexes] = await connection.query("SHOW INDEX FROM contacts");
  if (!indexes.some((index) => index.Key_name === "contacts_visit_date_index")) {
    await connection.query("ALTER TABLE contacts ADD KEY contacts_visit_date_index (visit_date)");
  }

  const [constraints] = await connection.execute(
    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contacts'
       AND COLUMN_NAME = 'visit_branch_id' AND REFERENCED_TABLE_NAME = 'branches'`,
  );
  if (!constraints.length) {
    await connection.query(`ALTER TABLE contacts ADD CONSTRAINT contacts_visit_branch_fk
      FOREIGN KEY (visit_branch_id) REFERENCES branches (branch_id) ON UPDATE CASCADE ON DELETE SET NULL`);
  }

  console.log("Contact branch-visit status and scheduling columns are ready.");
} catch (error) {
  console.error("Contact branch-visit migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
