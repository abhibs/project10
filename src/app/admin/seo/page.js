import { requireAdminPage } from "@/lib/admin-auth";
import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  const admin = await requireAdminPage("seo");
  return <DashboardClient section="seo" admin={admin} />;
}
