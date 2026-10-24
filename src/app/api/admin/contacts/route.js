import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-session";
import { createManualContact, getContacts, updateContact } from "@/lib/admin-db";
import { resolveContactFilters } from "@/lib/contact-filters.mjs";
import { isAllowedBranchOrigin } from "@/lib/branch-origin.mjs";
import { CONTACT_FORM_TYPES, countContactTypes, sumContactWeights } from "@/lib/contact-summary.mjs";
import { validateManualContact } from "@/lib/manual-contact.mjs";
import { normalizeContactStatus } from "@/lib/contact-status.mjs";

const BUSINESS_TYPES = new Set(CONTACT_FORM_TYPES);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request) {
  const cookieStore = await cookies();
  if (!readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }
  if (!isAllowedBranchOrigin(request)) {
    return Response.json({ message: "Invalid request origin." }, { status: 403 });
  }

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
  const cookieStore = await cookies();
  if (!readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  }
  if (!isAllowedBranchOrigin(request)) {
    return Response.json({ message: "Invalid request origin." }, { status: 403 });
  }
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
  if (body.status !== undefined) {
    let normalizedStatus;
    try { normalizedStatus = normalizeContactStatus(body.status, body.callbackDate); } catch (error) {
      return Response.json({ message: error.message }, { status: 400 });
    }
    changes.status = normalizedStatus.status;
    changes.callback_date = normalizedStatus.callbackDate || null;
    responseChanges.status = normalizedStatus.status;
    responseChanges.callbackDate = normalizedStatus.callbackDate;
  }
  if (body.comment !== undefined) {
    changes.comment = body.comment.trim();
    responseChanges.comment = changes.comment;
  }
  try {
    if (!await updateContact(body.id, changes)) return Response.json({ message: "Contact not found." }, { status: 404 });
    return Response.json({ changes: responseChanges, message: "Contact updated." });
  } catch (error) {
    console.error("Unable to update contact:", error);
    return Response.json({ message: "Unable to save changes. Please try again." }, { status: 500 });
  }
}

export async function GET(request) {
  const cookieStore = await cookies();
  const admin = readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!admin) return Response.json({ message: "Unauthorized." }, { status: 401 });

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
