import mysql from "mysql2/promise";
import { SEO_FIELDS } from "./seo-fields.mjs";
import { runOncePerContactDay, uniqueDailyContacts } from "./contact-leads.mjs";
import { buildContactDateFilter } from "./contact-filters.mjs";
import { AdminAccessError, assertAdminUserChange, canManageAdmin, adminPermissions, hasAdminPermission } from "./admin-access.mjs";

export async function getSeoPages() {
  const [rows] = await getPool().execute("SELECT * FROM seo_pages ORDER BY route_path <> '*', id");
  return rows.map((row) => ({ ...row, structured_data: row.structured_data == null ? "" : typeof row.structured_data === "string" ? row.structured_data : JSON.stringify(row.structured_data, null, 2) }));
}

export async function saveSeoPage(id, values) {
  const fields = ["page_label", "route_path", ...SEO_FIELDS];
  const params = fields.map((field) => values[field] ?? null);
  if (id) {
    await getPool().execute(`UPDATE seo_pages SET ${fields.map((field) => `\`${field}\` = ?`).join(", ")} WHERE id = ?`, [...params, id]);
  } else {
    await getPool().execute(`INSERT INTO seo_pages (${fields.map((field) => `\`${field}\``).join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`, params);
  }
}

export async function deleteSeoPage(id) {
  await getPool().execute("DELETE FROM seo_pages WHERE id = ?", [id]);
}
const BRANCH_COLUMNS = `id, branch_id AS branchId, name, slug, image, area, city, state,
  pincode, timings, latitude, longitude, url, status, address`;

function branchRow(row) {
  return row ? { ...row, latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude) } : null;
}

export async function getBranches(activeOnly = false) {
  const [rows] = await getPool().execute(
    `SELECT ${BRANCH_COLUMNS} FROM branches ${activeOnly ? "WHERE status = 'active'" : ""} ORDER BY city, name, id`
  );
  return rows.map(branchRow);
}

export async function findBranchById(id) {
  const [rows] = await getPool().execute(`SELECT ${BRANCH_COLUMNS} FROM branches WHERE id = ?`, [id]);
  return branchRow(rows[0]);
}

export async function findBranchByCode(branchId) {
  const [rows] = await getPool().execute(`SELECT ${BRANCH_COLUMNS} FROM branches WHERE branch_id = ? LIMIT 1`, [branchId]);
  return branchRow(rows[0]);
}

function branchParameters(branch) {
  return [branch.branchId, branch.name, branch.slug, branch.image, branch.area, branch.city, branch.state,
    branch.pincode, branch.timings, branch.latitude, branch.longitude, branch.url, branch.status, branch.address];
}

export async function createBranch(branch) {
  for (let suffix = 1; suffix <= 100; suffix++) {
    const candidate = branchSlugCandidate(branch.slug, suffix);
    try {
      const [result] = await getPool().execute(
        `INSERT INTO branches (branch_id, name, slug, image, area, city, state, pincode, timings, latitude, longitude, url, status, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        branchParameters({ ...branch, slug: candidate })
      );
      return findBranchById(result.insertId);
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY" || !error.message.includes("branches_slug_unique")) throw error;
    }
  }
  throw new Error("Could not find an available branch slug.");
}

function branchSlugCandidate(base, suffix) {
  if (suffix === 1) return base;
  const ending = "-" + suffix;
  return base.slice(0, 64 - ending.length).replace(/-+$/g, "") + ending;
}

export async function updateBranch(id, branch) {
  for (let suffix = 1; suffix <= 100; suffix++) {
    const candidate = branchSlugCandidate(branch.slug, suffix);
    try {
      const [result] = await getPool().execute(
        `UPDATE branches SET branch_id = ?, name = ?, slug = ?, image = ?, area = ?, city = ?, state = ?, pincode = ?,
          timings = ?, latitude = ?, longitude = ?, url = ?, status = ?, address = ? WHERE id = ?`,
        [...branchParameters({ ...branch, slug: candidate }), id]
      );
      return result.affectedRows ? findBranchById(id) : null;
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY" || !error.message.includes("branches_slug_unique")) throw error;
    }
  }
  throw new Error("Could not find an available branch slug.");
}

export async function deleteBranch(id) {
  const [result] = await getPool().execute("DELETE FROM branches WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

let pool;
let contactPool;

function createPool() {
  return mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "project10",
      waitForConnections: true,
      connectionLimit: 10,
    });
}

function getPool() {
  if (!pool) pool = createPool();
  return pool;
}

async function executeContactQuery(sql, values) {
  // TIMESTAMP values and date filters must use the same business timezone.
  // Keep these sessions separate from queries that deserialize dates in JS.
  if (!contactPool) contactPool = createPool();
  const connection = await contactPool.getConnection();
  try {
    await connection.query("SET SESSION time_zone = '+05:30'");
    return await connection.execute(sql, values);
  } finally {
    connection.release();
  }
}

export async function findAdminByEmail(email) {
  const [rows] = await getPool().execute(
    "SELECT id, name, email, password, role, permissions, session_version FROM admins WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] || null;
}

export async function findAdminById(id) {
  const [rows] = await getPool().execute(
    "SELECT id, name, email, phone, address, image, password, role, permissions, session_version FROM admins WHERE id = ? LIMIT 1",
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

export async function updateAdminPassword(id, passwordHash, passwordHint) {
  await getPool().execute(
    "UPDATE admins SET password = ?, password_hint = ?, session_version = session_version + 1, updated_at = NOW() WHERE id = ?",
    [passwordHash, passwordHint, id]
  );
}

export async function getAdminUsers(actor) {
  const [rows] = await getPool().execute("SELECT id, name, email, password_hint, role, permissions FROM admins ORDER BY id");
  return rows.filter((row) => canManageAdmin(actor, row)).map((row) => ({ ...row, permissions: adminPermissions(row.permissions) }));
}

// Serialize account changes and recheck the actor under the same locks. This also
// prevents two administrators from simultaneously demoting each other.
export async function saveAdminUser(actor, id, values, passwordHash, deleting = false) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query("SELECT id, role, permissions, session_version FROM admins ORDER BY id FOR UPDATE");
    const currentActor = rows.find((row) => String(row.id) === String(actor.id));
    if (!currentActor || Number(currentActor.session_version) !== Number(actor.session_version) || !hasAdminPermission(currentActor, "admins")) {
      throw new AdminAccessError("Your access has changed. Please sign in again.", 403);
    }
    const target = id == null ? null : rows.find((row) => String(row.id) === String(id));
    if (id != null && !target) throw new AdminAccessError("Account not found.", 404);
    assertAdminUserChange(currentActor, target, values, deleting);
    let savedId = id;
    if (deleting) {
      await connection.execute("DELETE FROM admins WHERE id = ?", [id]);
    } else if (id == null) {
      const [result] = await connection.execute(
        "INSERT INTO admins (name, email, password, password_hint, role, permissions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [values.name, values.email, passwordHash, values.password, values.role, JSON.stringify(values.permissions)],
      );
      savedId = result.insertId;
    } else {
      const passwordSql = passwordHash ? ", password = ?, password_hint = ?, session_version = session_version + 1" : "";
      await connection.execute(
        `UPDATE admins SET name = ?, email = ?, role = ?, permissions = ?, updated_at = NOW()${passwordSql} WHERE id = ?`,
        [values.name, values.email, values.role, JSON.stringify(values.permissions), ...(passwordHash ? [passwordHash, values.password] : []), id],
      );
    }
    await connection.commit();
    return savedId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
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
  gclid, utmSource, utmCampaign, keyword, adgroupId,
  trackingData = {}, landingPage = "", referrer = "",
  releaseBank = "", releasePlace = "",
  branchId = null,
}) {
  if (!contactPool) contactPool = createPool();
  const connection = await contactPool.getConnection();
  try {
    await connection.query("SET SESSION time_zone = '+05:30'");
    return await runOncePerContactDay(connection, mobile, async () => {
      const [result] = await connection.execute(
        `INSERT INTO contacts
          (name, mobile, city, weight, preffered_date, preffered_time, services, business_type,
           gclid, utm_source, utm_campaign, keyword, adgroup_id, tracking_data, landing_page, referrer,
           release_bank, release_place, branch_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          mobile,
          city || null,
          weight || null,
          preferredDate || null,
          preferredTime || null,
          services,
          businessType,
          gclid || null, utmSource || null, utmCampaign || null, keyword || null, adgroupId || null,
          Object.keys(trackingData).length ? JSON.stringify(trackingData) : null,
          landingPage || null, referrer || null,
          releaseBank || null, releasePlace || null,
          branchId,
        ],
      );
      return result.insertId;
    });
  } finally {
    connection.release();
  }
}

export async function createManualContact({ name, mobile, city, weight, services, details, status, callbackDate, comment, businessType }) {
  const [result] = await executeContactQuery(
    `INSERT INTO contacts
      (name, mobile, city, weight, services, business_type, details, status, callback_date, comment)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, mobile, city, weight, services, businessType, details || null, status, callbackDate || null, comment || null],
  );
  return result.insertId;
}

export async function getContacts({ fromDate = "", toDate = "", businessType = "" } = {}) {
  const conditions = [];
  const values = [];

  const dateFilter = buildContactDateFilter(fromDate, toDate);
  if (dateFilter.condition) conditions.push(dateFilter.condition);
  values.push(...dateFilter.values);
  if (businessType) {
    conditions.push("business_type = ?");
    values.push(businessType);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await executeContactQuery(
    `SELECT id, name, mobile, city, weight, details, status, comment, release_bank AS releaseBank, release_place AS releasePlace,
       branch_id AS branchId,
       (SELECT b.name FROM branches b WHERE b.branch_id = contacts.branch_id) AS branchName,
       visit_branch_id AS visitBranchId,
       (SELECT b.name FROM branches b WHERE b.branch_id = contacts.visit_branch_id) AS visitBranchName,
       DATE_FORMAT(visit_date, '%Y-%m-%d') AS visitDate,
       TIME_FORMAT(visit_time, '%H:%i') AS visitTime,
       DATE_FORMAT(callback_date, '%Y-%m-%d') AS callbackDate,
       DATE_FORMAT(preffered_date, '%Y-%m-%d') AS preferredDate,
       preffered_time AS preferredTime, services, business_type AS businessType,
       gclid, utm_source AS utmSource, utm_campaign AS utmCampaign, keyword, adgroup_id AS adgroupId,
       tracking_data AS trackingData, landing_page AS landingPage, referrer,
       DATE_FORMAT(created_at, '%Y-%m-%d') AS submittedDate,
       DATE_FORMAT(created_at, '%H:%i:%s') AS submittedTime
     FROM contacts ${where}
     ORDER BY created_at DESC, id DESC`,
    values
  );

  return uniqueDailyContacts(rows).map((row) => ({
    ...row,
    weight: row.weight === null ? null : Number(row.weight),
    trackingData: (() => {
      if (!row.trackingData) return {};
      if (typeof row.trackingData === "object") return row.trackingData;
      try { return JSON.parse(row.trackingData); } catch { return {}; }
    })(),
  }));
}

export async function findContactById(id) {
  const [rows] = await executeContactQuery(
    "SELECT id, name, mobile, city FROM contacts WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

export async function updateContact(id, changes) {
  const fields = Object.keys(changes);
  const [result] = await executeContactQuery(
    `UPDATE contacts SET ${fields.map((field) => `\`${field}\` = ?`).join(", ")} WHERE id = ?`,
    [...fields.map((field) => changes[field]), id],
  );
  return result.affectedRows > 0;
}
