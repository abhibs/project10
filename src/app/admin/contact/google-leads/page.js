import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "../../dashboard/DashboardClient";
export const dynamic = "force-dynamic";
export default async function GoogleLeadsPage() {
  const admin = await requireAdminPage("contact");
  return <DashboardClient section="contact" googleOnly admin={admin} />;
}
