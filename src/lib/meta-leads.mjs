import ExcelJS from "exceljs";

export const META_LEAD_SPREADSHEET = "https://docs.google.com/spreadsheets/d/1COG68Cdsu75dK4wKyJX6fOdU5Y5LnSsD9yGhNjVIHYM";

const SHEET_CONFIGS = [
  {
    name: "English Leads",
    language: "english",
    service: "select_type",
    weight: "approx._gold_weight_(grams)?",
    area: "which_area?",
  },
  {
    name: "Kannada Leads",
    language: "kannada",
    service: "ಸೇವೆಯನ್ನು_ಆಯ್ಕೆಮಾಡಿ?",
    weight: "ಚಿನ್ನದ_ಅಂದಾಜು_ತೂಕ_(ಗ್ರಾಂ)?",
    area: "ನೀವು_ಯಾವ_ಪ್ರದೇಶದಲ್ಲಿದ್ದೀರಿ?",
  },
];

function text(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if (value.text != null) return String(value.text);
    if (value.result != null) return String(value.result);
    if (Array.isArray(value.richText)) return value.richText.map((part) => part.text || "").join("");
  }
  return String(value);
}

function limited(value, length) {
  const normalized = text(value).trim();
  return normalized ? normalized.slice(0, length) : "";
}

function phoneNumber(value) {
  let digits = text(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^\d{10}$/.test(digits) ? digits : "";
}

function weightInGrams(value) {
  const match = text(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const amount = Number(match[0]);
  return Number.isFinite(amount) && amount > 0 && amount <= 100000 ? Math.round(amount * 100) / 100 : null;
}

function mysqlUtcTimestamp(value) {
  const date = new Date(text(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function normalizeMetaLead(record, config) {
  const metaLeadId = limited(record.id, 128);
  const name = limited(record.first_name || record.full_name, 255);
  const mobile = phoneNumber(record.phone_number);
  const createdAt = mysqlUtcTimestamp(record.created_time);
  if (!metaLeadId || !name || !mobile || !createdAt) return null;

  const trackingData = {};
  for (const key of ["ad_id", "ad_name", "adset_id", "adset_name", "campaign_id", "campaign_name", "form_id", "form_name", "is_organic", "platform", "lead_status"]) {
    const value = limited(record[key], 1000);
    if (value) trackingData[key] = value;
  }
  trackingData.source_sheet = config.name;

  return {
    metaLeadId,
    createdAt,
    name,
    mobile,
    city: "",
    area: limited(record[config.area], 160),
    weight: weightInGrams(record[config.weight]),
    services: limited(record[config.service] || record["select_service_type?"], 255) || "Meta Ads enquiry",
    language: config.language,
    campaignName: limited(record.campaign_name, 255),
    adName: limited(record.ad_name, 255),
    adsetId: limited(record.adset_id, 255),
    trackingData,
  };
}

export async function parseMetaLeadWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const leadsById = new Map();
  let skipped = 0;
  let matchedSheets = 0;

  for (const config of SHEET_CONFIGS) {
    const sheet = workbook.worksheets.find((sheet) => [config.name.toLowerCase(), config.name.toLowerCase().replace(" leads", " creative leads")].includes(sheet.name.trim().toLowerCase()));
    if (!sheet) continue;
    matchedSheets++;
    const headers = sheet.getRow(1).values.slice(1).map((value) => text(value).trim());
    const required = ["id", "created_time", "phone_number", config.weight];
    const missing = required.filter((header) => !headers.includes(header));
    if (!headers.includes("first_name") && !headers.includes("full_name")) missing.push("first_name or full_name");
    if (!headers.includes(config.service) && !headers.includes("select_service_type?")) missing.push(config.service);
    if (missing.length) throw new Error(`${config.name} is missing columns: ${missing.join(", ")}`);

    for (let rowNumber = 2; rowNumber <= sheet.actualRowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const record = Object.fromEntries(headers.map((header, index) => [header, row.getCell(index + 1).value]));
      if (!headers.some((header) => text(record[header]).trim())) continue;
      const lead = normalizeMetaLead(record, config);
      if (!lead) { skipped++; continue; }
      leadsById.set(lead.metaLeadId, lead);
    }
  }

  if (!matchedSheets) throw new Error("No supported lead tabs found. Expected English Leads or Kannada Leads.");
  return { leads: [...leadsById.values()], skipped };
}

export function metaLeadExportUrl(value = process.env.META_LEADS_SPREADSHEET_URL || META_LEAD_SPREADSHEET) {
  const id = String(value).match(/(?:\/d\/)?([\w-]{20,})(?:\/|$)/)?.[1];
  if (!id) throw new Error("META_LEADS_SPREADSHEET_URL is not a valid Google Sheets URL.");
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
}
