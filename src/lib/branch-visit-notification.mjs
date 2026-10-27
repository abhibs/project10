export const BRANCH_VISIT_TIMEZONE = "Asia/Kolkata";

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

export async function sendBranchVisitNotification(payload) {
  const endpoint = process.env.BRANCH_NOTIFICATION_URL || "https://aryangold.in/api/branchnotif";
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (process.env.BRANCH_NOTIFICATION_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BRANCH_NOTIFICATION_TOKEN}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Branch notification API returned HTTP ${response.status}.`);
  }
}
