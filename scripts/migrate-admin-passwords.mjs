import nextEnv from "@next/env";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

nextEnv.loadEnvConfig(process.cwd());
let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "project10", connectTimeout: 5000,
  });
  await connection.beginTransaction();
  const [rows] = await connection.query("SELECT id, password FROM admins FOR UPDATE");
  let migrated = 0;
  for (const row of rows) {
    if (/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(row.password)) continue;
    const hash = await bcrypt.hash(row.password, 10);
    if (!await bcrypt.compare(row.password, hash)) throw new Error("Password migration verification failed");
    await connection.execute("UPDATE admins SET password = ? WHERE id = ?", [hash, row.id]);
    migrated++;
  }
  await connection.commit();
  // DDL commits implicitly; only remove hints after every password is verified.
  const [columns] = await connection.query("SHOW COLUMNS FROM admins LIKE 'password_hint'");
  if (columns.length) await connection.query("ALTER TABLE admins DROP COLUMN password_hint");
  console.log(`Password migration complete: ${migrated} plaintext passwords hashed; ${rows.length} accounts use bcrypt. Password hints removed.`);
} catch (error) {
  if (connection) await connection.rollback();
  console.error("Password migration failed:", error.code || "Unable to migrate passwords");
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
