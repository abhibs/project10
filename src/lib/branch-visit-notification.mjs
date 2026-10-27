export const BRANCH_VISIT_TIMEZONE = "Asia/Kolkata";
export const CONTACT_VISIT_ENDPOINT = "https://aryangold.in/api/integrations/contact-visits";

export function buildBranchVisitNotification(contact, branch, visit) {
  return {
    event: "contact.visiting_branch",
    status: "visiting_branch",
    contact: {
      id: Number(contact.id),
      name: contact.name,
      mobile: contact.mobile,
      city: contact.city || "",
    },
    branch: {
      id: branch.branchId,
      name: branch.name,
      area: branch.area || "",
      city: branch.city || "",
      address: branch.address || "",
    },
    visit: {
      date: visit.visitDate,
      time: visit.visitTime,
      timezone: BRANCH_VISIT_TIMEZONE,
    },
  };
}

export function buildContactVisitHeaders(secret = process.env.CONTACT_VISIT_WEBHOOK_SECRET) {
  if (!secret) throw new Error("CONTACT_VISIT_WEBHOOK_SECRET is not configured.");
  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

export async function sendBranchVisitNotification(payload) {
  const response = await fetch(CONTACT_VISIT_ENDPOINT, {
    method: "POST",
    headers: buildContactVisitHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Branch notification API returned HTTP ${response.status}.`);
  }
}
