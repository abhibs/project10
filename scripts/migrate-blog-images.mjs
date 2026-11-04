import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";
nextEnv.loadEnvConfig(process.cwd());
const connection = await mysql.createConnection({ host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", database: process.env.DB_NAME || "project10", connectTimeout: 5000 });
try { await connection.query(await readFile(new URL("../database/blog-images.sql", import.meta.url), "utf8")); console.log("Blog image table is ready. Existing images preserved."); }
finally { await connection.end(); }
