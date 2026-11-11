import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "../../dashboard/DashboardClient";
export const dynamic = "force-dynamic";
export default async function MetaLeadsPage() {
  const admin = await requireAdminPage("contact");
  return <DashboardClient section="contact" metaOnly admin={admin} />;
}
