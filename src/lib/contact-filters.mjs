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
