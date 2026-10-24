export const PENDING_STATUS = "inactive";
export const COMPLETED_STATUS = "active";
export const CALLBACK_STATUS = "pending_callback";

export const CONTACT_STATUS_OPTIONS = [
  [PENDING_STATUS, "Pending"],
  [CALLBACK_STATUS, "Pending Call Back"],
  [COMPLETED_STATUS, "Completed"],
];

const STATUS_VALUES = new Set(CONTACT_STATUS_OPTIONS.map(([value]) => value));
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function normalizeContactStatus(status, callbackDate = "") {
  if (!STATUS_VALUES.has(status)) throw new Error("Select Pending, Pending Call Back or Completed status.");
  if (status === CALLBACK_STATUS && !isRealDate(callbackDate)) {
    throw new Error("Select a valid call-back date.");
  }
  return { status, callbackDate: status === CALLBACK_STATUS ? callbackDate : "" };
}

export function getContactStatusLabel(status) {
  return CONTACT_STATUS_OPTIONS.find(([value]) => value === status)?.[1] || status;
}
