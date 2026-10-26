import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdminPage("admins");
  return <DashboardClient section="admins" admin={admin} />;
}
