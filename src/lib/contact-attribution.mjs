const STORAGE_KEY = "contact-attribution";
const PARAMETERS = {
  gclid: ["gclid"],
  utmSource: ["utm_source"],
  utmCampaign: ["utm_campaign"],
  keyword: ["keyword", "utm_term"],
  adgroupId: ["adgroup_id", "adgroupid", "adgroupId"],
};

export function readAttribution(search) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(Object.entries(PARAMETERS).map(([field, aliases]) => [
    field, aliases.map((alias) => params.get(alias)?.trim()).find(Boolean)?.slice(0, 255) || "",
  ]));
}

export function getContactAttribution() {
  if (typeof window === "undefined") return {};
  const current = readAttribution(window.location.search);
  try {
    if (Object.values(current).some(Boolean)) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current;
    }
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
    return Object.fromEntries(Object.keys(PARAMETERS).map((key) => [key,
      typeof stored?.[key] === "string" ? stored[key].slice(0, 255) : "",
    ]));
  } catch {
    return current;
  }
}
