export const GOOGLE_LEAD_TYPE = "googlelead-lp";
export const INCOMING_CALL_TYPE = "Incoming Calls";
export const CONTACT_FORM_TYPES = ["Branch Visit", "Doorstep Service", "Quick Contact", "Contact Page", "Banner Form", "Branch Form", "Sell Gold", "Release Pledged Gold", "Doorstep Valuation", GOOGLE_LEAD_TYPE, INCOMING_CALL_TYPE];

export function getContactFormLabel(type) {
  return type === GOOGLE_LEAD_TYPE ? "Google Lead" : type;
}

export function countContactTypes(contacts) {
  const counts = Object.fromEntries(CONTACT_FORM_TYPES.map((type) => [type, 0]));
  for (const contact of contacts) {
    if (Object.hasOwn(counts, contact.businessType)) counts[contact.businessType]++;
  }
  return counts;
}

export function sumContactWeights(contacts) {
  // Stored weights have two decimal places; add integer hundredths of a gram.
  const hundredths = Object.fromEntries(CONTACT_FORM_TYPES.map((type) => [type, 0]));
  let total = 0;
  for (const contact of contacts) {
    const weight = Number(contact.weight);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    const amount = Math.round(weight * 100);
    total += amount;
    if (Object.hasOwn(hundredths, contact.businessType)) hundredths[contact.businessType] += amount;
  }
  return { weights: Object.fromEntries(Object.entries(hundredths).map(([type, amount]) => [type, amount / 100])), totalWeight: total / 100 };
}
