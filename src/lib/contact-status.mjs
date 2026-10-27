export const PENDING_STATUS = "inactive";
export const COMPLETED_STATUS = "active";
export const CALLBACK_STATUS = "pending_callback";
export const VISITING_BRANCH_STATUS = "visiting_branch";

export const CONTACT_STATUS_OPTIONS = [
  [PENDING_STATUS, "Pending"],
  [CALLBACK_STATUS, "Pending Call Back"],
  [VISITING_BRANCH_STATUS, "Visiting Branch"],
  [COMPLETED_STATUS, "Completed"],
];

const STATUS_VALUES = new Set(CONTACT_STATUS_OPTIONS.map(([value]) => value));
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function normalizeContactStatus(status, callbackDate = "") {
  if (!STATUS_VALUES.has(status)) throw new Error("Select Pending, Pending Call Back, Visiting Branch or Completed status.");
  if (status === CALLBACK_STATUS && !isRealDate(callbackDate)) {
    throw new Error("Select a valid call-back date.");
  }
  return { status, callbackDate: status === CALLBACK_STATUS ? callbackDate : "" };
}

export function normalizeBranchVisit(branchId = "", visitDate = "", visitTime = "") {
  const normalizedBranchId = typeof branchId === "string" ? branchId.trim() : "";
  if (!normalizedBranchId || normalizedBranchId.length > 64) {
    throw new Error("Select an active branch for the visit.");
  }
  if (!isRealDate(visitDate)) throw new Error("Select a valid branch visit date.");
  if (!TIME_PATTERN.test(visitTime)) throw new Error("Select a valid branch visit time.");
  return { branchId: normalizedBranchId, visitDate, visitTime };
}

export function getContactStatusLabel(status) {
  return CONTACT_STATUS_OPTIONS.find(([value]) => value === status)?.[1] || status;
}
