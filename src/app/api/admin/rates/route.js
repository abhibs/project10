import { authorizeAdminRequest, adminApiError } from "@/lib/admin-auth";
import { getRates, saveRates } from "@/lib/admin-db";
import { validateRates } from "@/lib/rate-values";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await authorizeAdminRequest(request, "rate");
    return Response.json({ rate: await getRates() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function PUT(request) {
  try {
    await authorizeAdminRequest(request, "rate");
    const rates = validateRates(await request.json().catch(() => null));
    if (!rates) return Response.json({ message: "Enter a positive price for all three purities, with at most two decimal places (maximum 99,999,999.99)." }, { status: 400 });
    await saveRates(rates);
    return Response.json({ message: "Rates saved successfully." });
  } catch (error) {
    return adminApiError(error);
  }
}
