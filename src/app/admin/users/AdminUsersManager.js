"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_SECTIONS, canManageAdmin, hasAdminPermission } from "@/lib/admin-access.mjs";
import styles from "./users.module.css";

function UserDialog({ actor, user, onClose, onSaved }) {
  const dialog = useRef(null);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(user?.role || "custom");
  const [permissions, setPermissions] = useState(user?.permissions || (hasAdminPermission(actor, "dashboard") ? ["dashboard"] : []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isSelf = String(user?.id) === String(actor.id);
  const allowedSections = ADMIN_SECTIONS.filter(({ key }) => hasAdminPermission(actor, key));

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(user ? `/api/admin/users/${user.id}` : "/api/admin/users", {
        method: user ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, permissions: role === "admin" ? [] : permissions }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save the account.");
      onSaved(data.message);
    } catch (error) { setError(error.message); }
    finally { setSaving(false); }
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="user-dialog-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}>
    <div className={styles.dialogHeading}><div><h2 id="user-dialog-title">{user ? "Edit account" : "Add account"}</h2><p>Manage login details and sidebar access.</p></div><button type="button" onClick={onClose} disabled={saving} aria-label="Close">×</button></div>
    <form className={styles.form} onSubmit={save}>
      <fieldset disabled={saving} className={styles.fields}>
        <div className={styles.formGrid}>
          <label>Name<input name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={255} autoComplete="off" required autoFocus /></label>
          <label>Email<input name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={255} autoComplete="off" required /></label>
        </div>
        <label>{user ? "New password" : "Password"}<div className={styles.passwordField}><input name="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} autoComplete="new-password" required={!user} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button></div><small>{user ? "Leave blank to keep the current password. " : "At least 8 characters. "}The original value is saved as password_hint.</small></label>
        <label>Role<select name="role" value={role} onChange={(event) => setRole(event.target.value)} disabled={isSelf}>
          {actor.role === "admin" && <option value="admin">Admin — full access</option>}
          <option value="custom">Custom Permissions</option>
        </select></label>
        <fieldset className={styles.permissions} disabled={saving || role === "admin" || isSelf}>
          <legend>Permissions</legend>
          <div className={styles.permissionGrid}>{allowedSections.map(({ key, label }) => <label key={key}><input type="checkbox" checked={role === "admin" || permissions.includes(key)} onChange={(event) => setPermissions((current) => event.target.checked ? [...current, key] : current.filter((value) => value !== key))} />{label}</label>)}</div>
        </fieldset>
        <p className={styles.help}>{isSelf ? "Your own role and permissions cannot be changed here." : role === "admin" ? "Admins can access every section and manage every account." : "Only selected sections will appear in this user's sidebar. Selecting Admins allows management of custom users within their own permissions."}</p>
      </fieldset>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}><button type="button" onClick={onClose} disabled={saving}>Cancel</button><button className={styles.primary} type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button></div>
    </form>
  </dialog>;
}

function DeleteDialog({ user, onClose, onDeleted }) {
  const dialog = useRef(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close(); }, []);
  async function remove() {
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete the account.");
      onDeleted(data.message);
    } catch (error) { setError(error.message); }
    finally { setDeleting(false); }
  }
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="delete-user-title" onCancel={(event) => { event.preventDefault(); if (!deleting) onClose(); }}>
    <div className={styles.dialogHeading}><h2 id="delete-user-title">Delete account?</h2></div>
    <div className={styles.form}><p>Delete <strong>{user.name}</strong> ({user.email})? They will lose access immediately.</p>{error && <p className={styles.error} role="alert">{error}</p>}<div className={styles.actions}><button type="button" onClick={onClose} disabled={deleting} autoFocus>Cancel</button><button type="button" className={styles.danger} onClick={remove} disabled={deleting}>{deleting ? "Deleting…" : "Delete account"}</button></div></div>
  </dialog>;
}

export default function AdminUsersManager({ admin }) {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [visibleHints, setVisibleHints] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/users", { cache: "no-store", signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load accounts.");
      setUsers(data.users);
      setLoading(false);
    }).catch((error) => { if (error.name !== "AbortError") { setError(error.message); setLoading(false); } });
    return () => controller.abort();
  }, [version]);

  function reload() { setLoading(true); setError(""); setVisibleHints([]); setVersion((value) => value + 1); }
  function saved(message) { setEditing(null); setDeleting(null); setMessage(message); reload(); router.refresh(); }
  const visible = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.trim().toLowerCase()));

  return <div className={styles.manager}>
    <div className={styles.toolbar}><p>Create accounts and choose the sections each person can use.</p><button type="button" className={styles.primary} onClick={() => { setMessage(""); setEditing({}); }}>Add account</button></div>
    {message && <p className={styles.success} role="status">{message}</p>}
    <section className={styles.panel} aria-labelledby="accounts-title">
      <div className={styles.heading}><div><h2 id="accounts-title">Admin accounts</h2><p>{users.length} account{users.length === 1 ? "" : "s"}{admin.role !== "admin" ? " within your permissions" : ""}</p></div><label className={styles.search}>Search accounts<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email" /></label></div>
      {error && <p className={styles.error} role="alert">{error} <button type="button" onClick={reload}>Retry</button></p>}
      {loading ? <p className={styles.empty} role="status">Loading accounts…</p> : !visible.length ? <p className={styles.empty}>{search ? "No accounts match your search." : "No accounts available."}</p> : <div className={styles.tableWrap}><table><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Password hint</th><th scope="col">Role</th><th scope="col">Permissions</th><th scope="col">Actions</th></tr></thead><tbody>{visible.map((user) => <tr key={user.id}>
        <td><strong>{user.name}</strong>{String(user.id) === String(admin.id) && <small className={styles.you}>You</small>}</td><td>{user.email}</td>
        <td><div className={styles.hint}><span>{!user.password_hint ? "—" : visibleHints.includes(user.id) ? user.password_hint : "••••••••"}</span>{!!user.password_hint && <button type="button" aria-label={`${visibleHints.includes(user.id) ? "Hide" : "Show"} password hint for ${user.name}`} aria-pressed={visibleHints.includes(user.id)} onClick={() => setVisibleHints((current) => current.includes(user.id) ? current.filter((id) => id !== user.id) : [...current, user.id])}>{visibleHints.includes(user.id) ? "Hide" : "Show"}</button>}</div></td>
        <td><span className={user.role === "admin" ? styles.adminRole : styles.customRole}>{user.role === "admin" ? "Admin" : "Custom Permissions"}</span></td>
        <td><div className={styles.badges}>{user.role === "admin" ? <span>All access</span> : user.permissions.length ? ADMIN_SECTIONS.filter(({ key }) => user.permissions.includes(key)).map(({ key, label }) => <span key={key}>{label}</span>) : <span>No sections selected</span>}</div></td>
        <td><div className={styles.rowActions}><button type="button" onClick={() => { setMessage(""); setEditing(user); }} disabled={!canManageAdmin(admin, user)}>Edit</button><button type="button" className={styles.deleteButton} onClick={() => setDeleting(user)} disabled={String(user.id) === String(admin.id) || !canManageAdmin(admin, user)}>Delete</button></div></td>
      </tr>)}</tbody></table></div>}
    </section>
    {editing && <UserDialog actor={admin} user={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={saved} />}
    {deleting && <DeleteDialog user={deleting} onClose={() => setDeleting(null)} onDeleted={saved} />}
  </div>;
}
