import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-session";
import { findAdminById, getRates, saveRates } from "@/lib/admin-db";
import { validateRates } from "@/lib/rate-values";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized() {
  const cookieStore = await cookies();
  const session = readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  return session && await findAdminById(session.id);
}

export async function GET() {
  try {
    if (!await authorized()) return Response.json({ message: "Please sign in again." }, { status: 401 });
    return Response.json({ rate: await getRates() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Rate loading failed:", error);
    return Response.json({ message: "Unable to load rates. Please try again." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!await authorized()) return Response.json({ message: "Please sign in again." }, { status: 401 });
    const rates = validateRates(await request.json().catch(() => null));
    if (!rates) return Response.json({ message: "Enter a positive price for all three purities, with at most two decimal places (maximum 99,999,999.99)." }, { status: 400 });
    await saveRates(rates);
    return Response.json({ message: "Rates saved successfully." });
  } catch (error) {
    console.error("Rate saving failed:", error);
    return Response.json({ message: "Unable to save rates. Please try again." }, { status: 500 });
  }
}
