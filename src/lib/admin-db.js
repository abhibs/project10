import mysql from "mysql2/promise";

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "project10",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  return pool;
}

export async function findAdminByEmail(email) {
  const [rows] = await getPool().execute(
    "SELECT id, name, email, password FROM admins WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] || null;
}

export async function findAdminById(id) {
  const [rows] = await getPool().execute(
    "SELECT id, name, email, phone, address, image, password FROM admins WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0] || null;
}

export async function updateAdminProfile(id, { name, email, phone, address, image }) {
  await getPool().execute(
    "UPDATE admins SET name = ?, email = ?, phone = ?, address = ?, image = ?, updated_at = NOW() WHERE id = ?",
    [name, email, phone || null, address || null, image || null, id]
  );
}

export async function updateAdminPassword(id, passwordHash) {
  await getPool().execute(
    "UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?",
    [passwordHash, id]
  );
}

export async function getRates() {
  const [rows] = await getPool().execute(
    "SELECT gold_24, gold_22, gold_18, updated_at FROM rates WHERE id = 1"
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    rates: { 24: Number(row.gold_24), 22: Number(row.gold_22), 18: Number(row.gold_18) },
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function saveRates(rates) {
  await getPool().execute(
    `INSERT INTO rates (id, gold_24, gold_22, gold_18) VALUES (1, ?, ?, ?)
     ON DUPLICATE KEY UPDATE gold_24 = VALUES(gold_24), gold_22 = VALUES(gold_22),
       gold_18 = VALUES(gold_18), updated_at = CURRENT_TIMESTAMP`,
    [rates[24], rates[22], rates[18]]
  );
}

export async function createContact({
  name,
  mobile,
  city,
  weight,
  preferredDate,
  preferredTime,
  services,
  businessType,
}) {
  const [result] = await getPool().execute(
    `INSERT INTO contacts
      (name, mobile, city, weight, preffered_date, preffered_time, services, business_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      mobile,
      city || null,
      weight || null,
      preferredDate || null,
      preferredTime || null,
      services,
      businessType,
    ]
  );

  return result.insertId;
}

export async function getContacts({ fromDate = "", toDate = "", businessType = "" } = {}) {
  const conditions = [];
  const values = [];

  if (fromDate) {
    conditions.push("created_at >= ?");
    values.push(`${fromDate} 00:00:00`);
  }
  if (toDate) {
    conditions.push("created_at < DATE_ADD(?, INTERVAL 1 DAY)");
    values.push(toDate);
  }
  if (businessType) {
    conditions.push("business_type = ?");
    values.push(businessType);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await getPool().execute(
    `SELECT id, name, mobile, city, weight,
       DATE_FORMAT(preffered_date, '%Y-%m-%d') AS preferredDate,
       preffered_time AS preferredTime, services, business_type AS businessType,
       DATE_FORMAT(created_at, '%Y-%m-%d') AS submittedDate,
       DATE_FORMAT(created_at, '%H:%i:%s') AS submittedTime
     FROM contacts ${where}
     ORDER BY created_at DESC, id DESC`,
    values
  );

  return rows.map((row) => ({
    ...row,
    weight: row.weight === null ? null : Number(row.weight),
  }));
}
