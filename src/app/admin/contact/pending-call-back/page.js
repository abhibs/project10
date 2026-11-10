import { requireAdminPage } from "@/lib/admin-auth";
import { CONTACT_STATUS_PAGES } from "@/lib/contact-status.mjs";
import DashboardClient from "../../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function ContactStatusPage() {
  const { status, permission } = CONTACT_STATUS_PAGES.find(({ slug }) => slug === "pending-call-back");
  const admin = await requireAdminPage(permission);
  return <DashboardClient section="contact" contactStatus={status} admin={admin} />;
}
