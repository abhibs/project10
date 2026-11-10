// Contact dates follow the business timezone, regardless of browser/server timezone.
export function resolveContactFilters({ fromDate = "", toDate = "", businessType = "", status = "", allDates = false } = {}, now = new Date()) {
  if (status) return { fromDate: "", toDate: "", businessType, status };

  if (allDates) return { fromDate: "", toDate: "", businessType, allDates: true };

  if (!fromDate && !toDate) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    fromDate = toDate = `${date.year}-${date.month}-${date.day}`;
  }

  return { fromDate, toDate, businessType };
}

export function buildContactDateFilter(fromDate = "", toDate = "") {
  if (!fromDate && !toDate) return { condition: "", values: [] };

  const createdConditions = [];
  const callbackConditions = [];
  const createdValues = [];
  const callbackValues = [];
  if (fromDate) {
    createdConditions.push("created_at >= ?");
    createdValues.push(`${fromDate} 00:00:00`);
    callbackConditions.push("callback_date >= ?");
    callbackValues.push(fromDate);
  }
  if (toDate) {
    createdConditions.push("created_at < DATE_ADD(?, INTERVAL 1 DAY)");
    createdValues.push(toDate);
    callbackConditions.push("callback_date <= ?");
    callbackValues.push(toDate);
  }

  return {
    condition: `((${createdConditions.join(" AND ")}) OR (status = 'pending_callback' AND ${callbackConditions.join(" AND ")}))`,
    values: [...createdValues, ...callbackValues],
  };
}

export const CONTACT_DATE_PRESETS = [
  ["today", "Today"], ["yesterday", "Yesterday"], ["today-yesterday", "Today and yesterday"],
  ["7", "Last 7 days"], ["14", "Last 14 days"], ["28", "Last 28 days"], ["30", "Last 30 days"],
  ["this-week", "This week"], ["last-week", "Last week"], ["this-month", "This month"],
  ["last-month", "Last month"], ["maximum", "Maximum"], ["custom", "Custom range"],
];

export function contactDatePreset(preset, now = new Date()) {
  if (preset === "maximum") return { fromDate: "", toDate: "", allDates: true };
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).map(({ type, value }) => [type, value]));
  const today = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  const from = new Date(today);
  const to = new Date(today);
  const shift = (date, days) => date.setUTCDate(date.getUTCDate() + days);
  if (preset === "yesterday") { shift(from, -1); shift(to, -1); }
  else if (preset === "today-yesterday") shift(from, -1);
  else if (["7", "14", "28", "30"].includes(preset)) shift(from, 1 - Number(preset));
  else if (preset === "this-week" || preset === "last-week") {
    shift(from, -((today.getUTCDay() + 6) % 7));
    if (preset === "last-week") { to.setTime(from.getTime()); shift(to, -1); shift(from, -7); }
  } else if (preset === "this-month") from.setUTCDate(1);
  else if (preset === "last-month") { from.setUTCDate(1); to.setTime(from.getTime()); shift(to, -1); from.setUTCMonth(from.getUTCMonth() - 1); }
  return { fromDate: from.toISOString().slice(0, 10), toDate: to.toISOString().slice(0, 10), allDates: false };
}
