import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "../dashboard/DashboardClient";
export const dynamic = "force-dynamic";
export default async function BlogsAdminPage() {
  const admin = await requireAdminPage("blogs");
  return <DashboardClient section="blogs" admin={admin} />;
}
