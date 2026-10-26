import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdminPage("dashboard");
  return <DashboardClient section="dashboard" admin={admin} />;
}
