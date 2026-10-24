// Contact dates follow the business timezone, regardless of browser/server timezone.
export function resolveContactFilters({ fromDate = "", toDate = "", businessType = "" } = {}, now = new Date()) {
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
