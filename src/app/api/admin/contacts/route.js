import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { createManualContact, findBranchByCode, findContactById, getContacts, updateContact } from "@/lib/admin-db";
import { buildBranchVisitNotification, sendBranchVisitNotification } from "@/lib/branch-visit-notification.mjs";
import { resolveContactFilters } from "@/lib/contact-filters.mjs";
import { CONTACT_FORM_TYPES, countContactTypes, sumContactWeights } from "@/lib/contact-summary.mjs";
import { validateManualContact } from "@/lib/manual-contact.mjs";
import { normalizeBranchVisit, normalizeContactStatus, VISITING_BRANCH_STATUS } from "@/lib/contact-status.mjs";

const BUSINESS_TYPES = new Set(CONTACT_FORM_TYPES);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request) {
  try { await authorizeAdminRequest(request, "contact"); } catch (error) { return adminApiError(error); }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  let contact;
  try { contact = validateManualContact(body); } catch (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }

  try {
    const id = await createManualContact(contact);
    return Response.json({ id, callbackDate: contact.callbackDate, message: "Incoming-call enquiry added." }, { status: 201 });
  } catch (error) {
    console.error("Unable to add manual contact:", error);
    return Response.json({ message: "Unable to add the enquiry. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try { await authorizeAdminRequest(request, "contact"); } catch (error) { return adminApiError(error); }
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }
  if (!body || !Number.isSafeInteger(body.id) || body.id < 1 ||
      (body.comment !== undefined && (typeof body.comment !== "string" || body.comment.length > 2000)) ||
      (body.status === undefined && body.comment === undefined)) {
    return Response.json({ message: "Enter a valid status and a comment of up to 2,000 characters." }, { status: 400 });
  }
  const changes = {};
  const responseChanges = {};
  let notificationPayload = null;
  if (body.status !== undefined) {
    let normalizedStatus;
    try { normalizedStatus = normalizeContactStatus(body.status, body.callbackDate); } catch (error) {
      return Response.json({ message: error.message }, { status: 400 });
    }
    changes.status = normalizedStatus.status;
    changes.callback_date = normalizedStatus.callbackDate || null;
    responseChanges.status = normalizedStatus.status;
    responseChanges.callbackDate = normalizedStatus.callbackDate;

    if (normalizedStatus.status === VISITING_BRANCH_STATUS) {
      let visit;
      try { visit = normalizeBranchVisit(body.visitBranchId, body.visitDate, body.visitTime); } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
      }

      try {
        const [branch, contact] = await Promise.all([
          findBranchByCode(visit.branchId),
          findContactById(body.id),
        ]);
        if (!contact) return Response.json({ message: "Contact not found." }, { status: 404 });
        if (!branch || branch.status !== "active") {
          return Response.json({ message: "Select an active branch for the visit." }, { status: 400 });
        }
        changes.visit_branch_id = visit.branchId;
        changes.visit_date = visit.visitDate;
        changes.visit_time = visit.visitTime;
        responseChanges.visitBranchId = visit.branchId;
        responseChanges.visitBranchName = branch.name;
        responseChanges.visitDate = visit.visitDate;
        responseChanges.visitTime = visit.visitTime;
        notificationPayload = buildBranchVisitNotification(contact, branch, visit);
      } catch (error) {
        console.error("Unable to validate branch visit:", error);
        return Response.json({ message: "Unable to validate the branch visit. Please try again." }, { status: 500 });
      }
    } else {
      changes.visit_branch_id = null;
      changes.visit_date = null;
      changes.visit_time = null;
      responseChanges.visitBranchId = "";
      responseChanges.visitBranchName = "";
      responseChanges.visitDate = "";
      responseChanges.visitTime = "";
    }
  }
  if (body.comment !== undefined) {
    changes.comment = body.comment.trim();
    responseChanges.comment = changes.comment;
  }
  try {
    if (!await updateContact(body.id, changes) && !await findContactById(body.id)) {
      return Response.json({ message: "Contact not found." }, { status: 404 });
    }
    if (notificationPayload) {
      try {
        await sendBranchVisitNotification(notificationPayload);
      } catch (error) {
        console.error("Branch visit notification delivery failed:", error);
        return Response.json({
          changes: responseChanges,
          notificationDelivered: false,
          message: "Status updated, but the branch notification could not be delivered.",
        });
      }
    }
    return Response.json({
      changes: responseChanges,
      notificationDelivered: notificationPayload ? true : undefined,
      message: notificationPayload ? "Status updated and branch notified." : "Contact updated.",
    });
  } catch (error) {
    console.error("Unable to update contact:", error);
    return Response.json({ message: "Unable to save changes. Please try again." }, { status: 500 });
  }
}

export async function GET(request) {
  try { await authorizeAdminRequest(request, "contact"); } catch (error) { return adminApiError(error); }

  const { searchParams } = new URL(request.url);
  const { fromDate, toDate, businessType } = resolveContactFilters({
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
    businessType: searchParams.get("businessType") || "",
  });

  if ((fromDate && !DATE_PATTERN.test(fromDate)) || (toDate && !DATE_PATTERN.test(toDate))) {
    return Response.json({ message: "Invalid date filter." }, { status: 400 });
  }
  if (businessType && !BUSINESS_TYPES.has(businessType)) {
    return Response.json({ message: "Invalid form type filter." }, { status: 400 });
  }
  if (fromDate && toDate && fromDate > toDate) {
    return Response.json({ message: "From date cannot be after to date." }, { status: 400 });
  }

  try {
    const allContacts = await getContacts({ fromDate, toDate });
    return Response.json({
      contacts: businessType ? allContacts.filter((contact) => contact.businessType === businessType) : allContacts,
      counts: countContactTypes(allContacts), total: allContacts.length,
      ...sumContactWeights(allContacts),
    });
  } catch (error) {
    console.error("Unable to load contacts:", error);
    return Response.json({ message: "Unable to load contacts." }, { status: 500 });
  }
}
