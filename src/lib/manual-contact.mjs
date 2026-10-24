import { INCOMING_CALL_TYPE } from "./contact-summary.mjs";
import { normalizeContactStatus } from "./contact-status.mjs";

const NAME_PATTERN = /^[\p{L}\s]+$/u;
const MOBILE_PATTERN = /^\d{10}$/;

function clean(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export function validateManualContact(body) {
  if (!body || typeof body !== "object") throw new Error("Enter the enquiry details.");

  const name = clean(body.name, 255);
  const mobile = clean(body.mobile, 20);
  const city = clean(body.city, 255);
  const services = clean(body.services, 255);
  const details = clean(body.details, 2000);
  const comment = clean(body.comment, 2000);
  const status = clean(body.status, 20);
  const callbackDate = clean(body.callbackDate, 10);
  const weight = Number(body.weight);

  if (name.length < 2 || !NAME_PATTERN.test(name)) {
    throw new Error("Enter a valid name using at least two letters.");
  }
  if (!MOBILE_PATTERN.test(mobile)) {
    throw new Error("Enter a valid 10-digit mobile number.");
  }
  if (!city) throw new Error("Enter the city or area.");
  if (!Number.isFinite(weight) || weight <= 0 || weight > 100000) {
    throw new Error("Enter a valid gold weight up to 100,000 grams.");
  }
  if (!services) throw new Error("Enter the service or help requested.");
  const normalizedStatus = normalizeContactStatus(status, callbackDate);

  return {
    name,
    mobile,
    city,
    weight,
    services,
    details,
    ...normalizedStatus,
    comment,
    businessType: INCOMING_CALL_TYPE,
  };
}
