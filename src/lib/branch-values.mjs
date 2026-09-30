export class BranchError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function slugifyBranchName(name) {
  return String(name || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 64).replace(/-+$/g, "");
}

export function validateBranch(form) {
  const value = (key) => typeof form.get(key) === "string" ? form.get(key).trim() : "";
  const branch = {};
  const fields = [
    ["branchId", "Branch ID", 64], ["name", "Branch name", 160],
    ["area", "Area", 160], ["city", "City", 120], ["state", "State", 120],
    ["timings", "Timings", 160], ["address", "Address", 2000],
  ];
  for (const [key, label, limit] of fields) {
    branch[key] = value(key);
    if (!branch[key] || branch[key].length > limit) throw new BranchError(label + " is required (maximum " + limit + " characters).");
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(branch.branchId)) throw new BranchError("Branch ID may contain only letters, numbers, hyphens and underscores.");
  branch.slug = slugifyBranchName(branch.name);
  if (!branch.slug) throw new BranchError("Branch name must include letters or numbers to create a slug.");
  branch.pincode = value("pincode");
  if (!/^[1-9][0-9]{5}$/.test(branch.pincode)) throw new BranchError("Enter a valid 6-digit Indian pincode.");
  branch.status = value("status");
  if (!["active", "inactive"].includes(branch.status)) throw new BranchError("Choose Active or Inactive.");
  const latitude = value("latitude"), longitude = value("longitude");
  if (Boolean(latitude) !== Boolean(longitude)) throw new BranchError("Provide both latitude and longitude, or leave both blank.");
  for (const [key, raw, max] of [["latitude", latitude, 90], ["longitude", longitude, 180]]) {
    if (raw && (!/^-?\d+(\.\d{1,7})?$/.test(raw) || !Number.isFinite(Number(raw)) || Math.abs(Number(raw)) > max)) {
      throw new BranchError("Enter a valid " + key + " with up to 7 decimal places.");
    }
    branch[key] = raw ? Number(raw) : null;
  }
  branch.url = value("url");
  if (branch.url) {
    let url;
    try { url = new URL(branch.url); } catch { throw new BranchError("Enter a valid http:// or https:// URL."); }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || branch.url.length > 2048) throw new BranchError("Enter a valid public http:// or https:// URL.");
  }
  return branch;
}

export function validBranchRecordId(value) {
  return /^[1-9]\d{0,9}$/.test(value) && Number(value) <= 4294967295;
}
