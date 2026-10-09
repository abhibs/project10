import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-session";
import { getContacts } from "@/lib/admin-db";

const BUSINESS_TYPES = new Set(["Branch Visit", "Doorstep Service", "Quick Contact", "Contact Page"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request) {
  const cookieStore = await cookies();
  const admin = readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!admin) return Response.json({ message: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";
  const businessType = searchParams.get("businessType") || "";

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
    return Response.json({ contacts: await getContacts({ fromDate, toDate, businessType }) });
  } catch (error) {
    console.error("Unable to load contacts:", error);
    return Response.json({ message: "Unable to load contacts." }, { status: 500 });
  }
}
