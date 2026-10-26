import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-auth";
import { adminHome } from "@/lib/admin-access.mjs";
import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const admin = await requireAdminPage();
  const home = adminHome(admin);
  if (home !== "/admin/no-access") redirect(home);
  return <DashboardClient section="no-access" admin={admin} />;
}
