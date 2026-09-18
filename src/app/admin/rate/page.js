import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-session";
import { findAdminById } from "@/lib/admin-db";
import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminRatePage() {
  const cookieStore = await cookies();
  const admin = readAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!admin) redirect("/admin/login");

  const currentAdmin = await findAdminById(admin.id);
  if (!currentAdmin) redirect("/admin/login");

  return <DashboardClient section="rate" admin={{
    id: currentAdmin.id,
    name: currentAdmin.name || "Administrator",
    email: currentAdmin.email,
    phone: currentAdmin.phone ? String(currentAdmin.phone) : "",
    address: currentAdmin.address || "",
    image: currentAdmin.image || "",
  }} />;
}
