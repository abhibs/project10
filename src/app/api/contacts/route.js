import { createContact, findBranchByCode } from "@/lib/admin-db";
import { sanitizeTrackingData } from "@/lib/contact-attribution.mjs";
import { GOOGLE_LEAD_TYPE } from "@/lib/contact-summary.mjs";
import { DAILY_CONTACT_DUPLICATE_MESSAGE, isDailyContactDuplicate } from "@/lib/contact-leads.mjs";
import { SERVICE_PAGES } from "@/lib/service-pages.mjs";

const APPOINTMENT_TYPES = new Set(["Branch Visit", "Doorstep Service"]);
const SERVICE_TYPES = new Set(Object.values(SERVICE_PAGES).map((service) => service.title));
const BUSINESS_TYPES = new Set([...APPOINTMENT_TYPES, ...SERVICE_TYPES, "Quick Contact", "Contact Page", "Banner Form", "Branch Form", GOOGLE_LEAD_TYPE]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d(?:-(?:[01]\d|2[0-3]):[0-5]\d)?$/;
const MOBILE_PATTERN = /^\d{10}$/;
const NAME_PATTERN = /^[\p{L}\s]+$/u;
const GOOGLE_LEAD_CITIES = new Set(["Bengaluru", "Chennai"]);

function clean(value, maximum = 255) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = clean(body.name);
    const mobile = clean(body.mobile, 20);
    const businessType = clean(body.businessType, 30);
    const services = businessType === "Banner Form" ? "" : clean(body.services);
    const city = clean(body.city);
    const area = clean(body.area, 160);
    const branchId = typeof body.branchId === "string" ? body.branchId.trim() : "";
    if (body.branchId != null && (typeof body.branchId !== "string" || !branchId || branchId.length > 64)) {
      return Response.json({ message: "Please select a valid branch." }, { status: 400 });
    }
    const preferredDate = clean(body.preferredDate, 10);
    const preferredTime = clean(body.preferredTime, 20);
    const appointment = APPOINTMENT_TYPES.has(businessType);
    const banner = businessType === "Banner Form";
    const branchForm = businessType === "Branch Form";
    if (branchForm && !branchId) {
      return Response.json({ message: "Please select a valid branch." }, { status: 400 });
    }
    const contactPage = businessType === "Contact Page";
    const googleLead = businessType === GOOGLE_LEAD_TYPE;
    const scheduled = appointment || contactPage;
    const servicePage = SERVICE_TYPES.has(businessType);
    const pledged = businessType === "Release Pledged Gold";
    const releaseBank = pledged ? clean(body.releaseBank) : "";
    const releasePlace = pledged ? clean(body.releasePlace) : "";
    const rawWeight = body.weight === "" || body.weight === null || body.weight === undefined
      ? null
      : Number(body.weight);

    if (name.length < 2 || !NAME_PATTERN.test(name) || !MOBILE_PATTERN.test(mobile) || (!banner && !contactPage && !services) || !BUSINESS_TYPES.has(businessType)) {
      return Response.json({ message: "Please enter valid contact details." }, { status: 400 });
    }
    if (scheduled && (!city || !isRealDate(preferredDate) || !TIME_PATTERN.test(preferredTime))) {
      return Response.json({ message: "Please complete the appointment details." }, { status: 400 });
    }
    if (googleLead && (!GOOGLE_LEAD_CITIES.has(city) || !area)) {
      return Response.json({ message: "Please select a valid city and enter your area." }, { status: 400 });
    }
    if (((banner || servicePage || branchForm) && rawWeight === null) || (rawWeight !== null && (!Number.isFinite(rawWeight) || rawWeight <= 0 || rawWeight > 100000))) {
      return Response.json({ message: "Please enter a valid gold weight." }, { status: 400 });
    }
    if (pledged && (!releaseBank || !releasePlace)) {
      return Response.json({ message: "Please enter the release bank and place." }, { status: 400 });
    }

    const branch = branchId ? await findBranchByCode(branchId) : null;
    if (branchId && (!branch || branch.status !== "active")) {
      return Response.json({ message: "This branch is unavailable. Please select an active branch." }, { status: 400 });
    }

    const id = await createContact({
      name,
      mobile,
      city: branch ? branch.city : googleLead ? `${city}, ${area}` : city,
      branchId: branch ? branch.branchId : null,
      weight: scheduled || banner || servicePage || googleLead || branchForm ? rawWeight : null,
      releaseBank, releasePlace,
      preferredDate: scheduled ? preferredDate : "",
      preferredTime: scheduled ? preferredTime : "",
      services,
      businessType,
      gclid: clean(body.gclid),
      utmSource: clean(body.utmSource ?? body.utm_source),
      utmCampaign: clean(body.utmCampaign ?? body.utm_campaign),
      keyword: clean(body.keyword ?? body.utm_term),
      adgroupId: clean(body.adgroupId ?? body.adgroup_id ?? body.adgroupid),
      trackingData: sanitizeTrackingData(body.trackingData ?? body.tracking_data),
      landingPage: clean(body.landingPage ?? body.landing_page, 2048),
      referrer: clean(body.referrer, 2048),
    });

    return Response.json({ id, message: appointment ? "Appointment request received." : googleLead ? "Thank you. Our gold expert will call you shortly." : "Callback request received." }, { status: 201 });
  } catch (error) {
    if (isDailyContactDuplicate(error)) {
      return Response.json({ message: DAILY_CONTACT_DUPLICATE_MESSAGE }, { status: 409 });
    }
    console.error("Unable to save contact request:", error);
    return Response.json({ message: "Unable to submit your request right now. Please try again." }, { status: 500 });
  }
}
