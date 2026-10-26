export const ADMIN_SECTIONS = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "▦" },
  { key: "admins", label: "Admins", href: "/admin/users", icon: "♙" },
  { key: "branches", label: "Branches", href: "/admin/branches", icon: "⌂" },
  { key: "contact", label: "Contacts", href: "/admin/contact/index", icon: "☎" },
  { key: "rate", label: "Gold rates", href: "/admin/rate", icon: "₹" },
  { key: "seo", label: "SEO", href: "/admin/seo", icon: "⌕" },
];

const permissionKeys = new Set(ADMIN_SECTIONS.map(({ key }) => key));

export class AdminAccessError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function adminPermissions(value) {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return []; }
  }
  return Array.isArray(value) ? [...new Set(value.filter((key) => permissionKeys.has(key)))] : [];
}

export function hasAdminPermission(admin, permission) {
  return !!admin && permissionKeys.has(permission) &&
    (admin.role === "admin" || (admin.role === "custom" && adminPermissions(admin.permissions).includes(permission)));
}

export function adminHome(admin) {
  return ADMIN_SECTIONS.find(({ key }) => hasAdminPermission(admin, key))?.href || "/admin/no-access";
}

export function adminProfile(admin) {
  return {
    id: admin.id, name: admin.name || "Administrator", email: admin.email,
    phone: admin.phone ? String(admin.phone) : "", address: admin.address || "", image: admin.image || "",
    role: admin.role, permissions: adminPermissions(admin.permissions),
  };
}

export function canManageAdmin(actor, target) {
  if (!hasAdminPermission(actor, "admins")) return false;
  if (actor.role === "admin") return true;
  return target?.role === "custom" && adminPermissions(target.permissions).every((key) => hasAdminPermission(actor, key));
}

export function validateAdminUser(body, creating = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AdminAccessError("Enter valid user details.");
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password === undefined ? "" : body.password;
  if (!name || name.length > 255) throw new AdminAccessError("Enter a name of up to 255 characters.");
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AdminAccessError("Enter a valid email address.");
  if (typeof password !== "string" || ((creating || password !== "") &&
      (password.length < 8 || new TextEncoder().encode(password).length > 72))) {
    throw new AdminAccessError("Passwords must contain at least 8 characters and at most 72 UTF-8 bytes.");
  }
  if (!["admin", "custom"].includes(body.role)) throw new AdminAccessError("Choose a valid role.");
  if (!Array.isArray(body.permissions) || body.permissions.some((key) => !permissionKeys.has(key))) {
    throw new AdminAccessError("Choose valid sidebar permissions.");
  }
  return { name, email, password, role: body.role, permissions: body.role === "admin" ? [] : adminPermissions(body.permissions) };
}

export function assertAdminUserChange(actor, target, values, deleting = false) {
  if (!hasAdminPermission(actor, "admins") || (target && !canManageAdmin(actor, target))) {
    throw new AdminAccessError("You do not have permission to manage this account.", 403);
  }
  if (target && String(actor.id) === String(target.id)) {
    if (deleting) throw new AdminAccessError("You cannot delete your own account.", 409);
    if (values.role !== actor.role || JSON.stringify([...values.permissions].sort()) !== JSON.stringify(adminPermissions(actor.permissions).sort())) {
      throw new AdminAccessError("You cannot change your own role or permissions.", 409);
    }
  }
  if (!deleting && actor.role !== "admin" &&
      (values.role !== "custom" || values.permissions.some((key) => !hasAdminPermission(actor, key)))) {
    throw new AdminAccessError("You can only grant permissions that you have. Full administrator access requires an admin.", 403);
  }
}
