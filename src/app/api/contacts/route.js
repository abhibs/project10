import { createContact } from "@/lib/admin-db";

const APPOINTMENT_TYPES = new Set(["Branch Visit", "Doorstep Service"]);
const BUSINESS_TYPES = new Set([...APPOINTMENT_TYPES, "Quick Contact", "Contact Page"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d(?:-(?:[01]\d|2[0-3]):[0-5]\d)?$/;
const MOBILE_PATTERN = /^\d{10}$/;
const NAME_PATTERN = /^[\p{L}\s]+$/u;

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
    const services = clean(body.services);
    const city = clean(body.city);
    const preferredDate = clean(body.preferredDate, 10);
    const preferredTime = clean(body.preferredTime, 20);
    const appointment = APPOINTMENT_TYPES.has(businessType);
    const rawWeight = body.weight === "" || body.weight === null || body.weight === undefined
      ? null
      : Number(body.weight);

    if (name.length < 2 || !NAME_PATTERN.test(name) || !MOBILE_PATTERN.test(mobile) || !services || !BUSINESS_TYPES.has(businessType)) {
      return Response.json({ message: "Please enter valid contact details." }, { status: 400 });
    }
    if (appointment && (!city || !isRealDate(preferredDate) || !TIME_PATTERN.test(preferredTime))) {
      return Response.json({ message: "Please complete the appointment details." }, { status: 400 });
    }
    if (rawWeight !== null && (!Number.isFinite(rawWeight) || rawWeight <= 0 || rawWeight > 100000)) {
      return Response.json({ message: "Please enter a valid gold weight." }, { status: 400 });
    }

    const id = await createContact({
      name,
      mobile,
      city,
      weight: appointment ? rawWeight : null,
      preferredDate: appointment ? preferredDate : "",
      preferredTime: appointment ? preferredTime : "",
      services,
      businessType,
    });

    return Response.json({ id, message: appointment ? "Appointment request received." : "Callback request received." }, { status: 201 });
  } catch (error) {
    console.error("Unable to save contact request:", error);
    return Response.json({ message: "Unable to submit your request right now. Please try again." }, { status: 500 });
  }
}
