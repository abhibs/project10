import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminRatePage() {
  const admin = await requireAdminPage("rate");
  return <DashboardClient section="rate" admin={admin} />;
}
