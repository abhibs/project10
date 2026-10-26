import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  const admin = await requireAdminPage("branches");
  return <DashboardClient section="branches" admin={admin} />;
}
