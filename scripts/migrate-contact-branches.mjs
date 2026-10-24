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
  const [columns] = await connection.query("SHOW COLUMNS FROM contacts LIKE 'branch_id'");
  const [types] = await connection.query("SHOW COLUMNS FROM contacts LIKE 'business_type'");
  const businessType = types[0]?.Type;
  if (!businessType?.startsWith("enum(")) throw new Error("Unexpected contacts business_type schema.");
  if (!businessType.includes("'Branch Form'")) {
    await connection.query(`ALTER TABLE contacts MODIFY COLUMN business_type ${businessType.slice(0, -1)},'Branch Form') NOT NULL`);
  }
  if (!columns.length) {
    await connection.query("ALTER TABLE contacts ADD COLUMN branch_id VARCHAR(64) DEFAULT NULL");
  }
  const [constraints] = await connection.execute(
    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contacts'
       AND COLUMN_NAME = 'branch_id' AND REFERENCED_TABLE_NAME = 'branches'`,
  );
  if (!constraints.length) {
    await connection.query(`ALTER TABLE contacts ADD CONSTRAINT contacts_branch_fk
      FOREIGN KEY (branch_id) REFERENCES branches (branch_id) ON UPDATE CASCADE ON DELETE SET NULL`);
  }
  await connection.query("UPDATE contacts SET business_type = 'Branch Form' WHERE branch_id IS NOT NULL AND business_type = 'Sell Gold'");
  console.log("Contact branch reference and Branch Form type are ready.");
} catch (error) {
  console.error("Contact branch migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
