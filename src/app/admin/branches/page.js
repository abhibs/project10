import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-session";
import { findAdminById } from "@/lib/admin-db";
import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  const session = readAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");
  const admin = await findAdminById(session.id);
  if (!admin) redirect("/admin/login");
  return <DashboardClient section="branches" admin={{
    id: admin.id, name: admin.name || "Administrator", email: admin.email,
    phone: admin.phone ? String(admin.phone) : "", address: admin.address || "", image: admin.image || "",
  }} />;
}
