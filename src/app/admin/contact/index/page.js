import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "../../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const admin = await requireAdminPage("contact");
  return <DashboardClient section="contact" admin={admin} />;
}
