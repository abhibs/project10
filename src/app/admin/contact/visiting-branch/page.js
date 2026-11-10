import { requireAdminPage } from "@/lib/admin-auth";
import { CONTACT_STATUS_PAGES } from "@/lib/contact-status.mjs";
import DashboardClient from "../../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function ContactStatusPage() {
  const admin = await requireAdminPage("contact");
  const { status } = CONTACT_STATUS_PAGES.find(({ slug }) => slug === "visiting-branch");
  return <DashboardClient section="contact" contactStatus={status} admin={admin} />;
}
