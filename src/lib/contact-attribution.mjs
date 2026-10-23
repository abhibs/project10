const STORAGE_KEY = "contact-attribution";
const PARAMETERS = {
  gclid: ["gclid"],
  utmSource: ["utm_source"],
  utmCampaign: ["utm_campaign"],
  keyword: ["keyword", "utm_term"],
  adgroupId: ["adgroup_id", "adgroupid", "adgroupId"],
};

const TRACKING_PARAMETER = /^(?:utm_[a-z0-9_]+|gclid|gbraid|wbraid|dclid|msclkid|fbclid|campaign_?id|adgroup_?id|keyword|matchtype|network|device|creative|placement|targetid|loc_interest_ms|loc_physical_ms)$/i;

function cleanText(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export function sanitizeTrackingData(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = [];
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = cleanText(rawKey, 100).toLowerCase();
    const item = cleanText(rawValue, 500);
    if (!key || !TRACKING_PARAMETER.test(key) || !item) continue;
    entries.push([key, item]);
    if (entries.length === 40) break;
  }
  return Object.fromEntries(entries);
}

export function readTrackingData(search) {
  const values = {};
  for (const [key, value] of new URLSearchParams(search)) values[key] = value;
  return sanitizeTrackingData(values);
}

export function readAttribution(search) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(Object.entries(PARAMETERS).map(([field, aliases]) => [
    field, aliases.map((alias) => params.get(alias)?.trim()).find(Boolean)?.slice(0, 255) || "",
  ]));
}

export function getContactAttribution() {
  if (typeof window === "undefined") return {};
  const campaign = readAttribution(window.location.search);
  const trackingData = readTrackingData(window.location.search);
  const current = {
    ...campaign,
    trackingData,
    landingPage: cleanText(window.location.href, 2048),
    referrer: cleanText(globalThis.document?.referrer, 2048),
  };
  try {
    if (Object.values(campaign).some(Boolean) || Object.keys(trackingData).length) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current;
    }
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
    const storedCampaign = Object.fromEntries(Object.keys(PARAMETERS).map((key) => [key,
      typeof stored?.[key] === "string" ? stored[key].slice(0, 255) : "",
    ]));
    if (Object.values(storedCampaign).some(Boolean) || Object.keys(sanitizeTrackingData(stored?.trackingData)).length) {
      return {
        ...storedCampaign,
        trackingData: sanitizeTrackingData(stored?.trackingData),
        landingPage: cleanText(stored?.landingPage, 2048),
        referrer: cleanText(stored?.referrer, 2048),
      };
    }
    return current;
  } catch {
    return current;
  }
}
