"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CONTACT_STATUS_PAGES } from "@/lib/contact-status.mjs";
import RateForm from "./RateForm";
import ContactsTable from "./ContactsTable";
import BranchManager from "../branches/BranchManager";
import SeoManager from "../seo/SeoManager";
import BlogImageManager from "../blogs/BlogImageManager";
import AdminUsersManager from "../users/AdminUsersManager";
import { ADMIN_SECTIONS, hasAdminPermission } from "@/lib/admin-access.mjs";
import AdminBrand from "../AdminBrand";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

function ContactStatusIcon({ slug }) {
  const paths = {
    pending: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    "pending-call-back": <><path d="M22 6v5h-5M21 11a7 7 0 0 0-12-5" /><path d="M7 10l3 3-2 2c2 3 4 5 7 6l2-2 3 3c-1 2-3 2-5 1C9 21 3 15 2 9c-1-2 0-4 2-5l3 3-2 2 2 1Z" transform="translate(1 -1) scale(.85)" /></>,
    "visiting-branch": <><path d="M4 21V5h10v16M2 21h20M8 9h2m-2 4h2m-2 4h2M17 7l4 4-4 4m-3-4h7" /></>,
    completed: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  };
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}>{paths[slug]}</svg>;
}

export default function DashboardClient({ admin, section = "dashboard", contactStatus = "", metaOnly = false, googleOnly = false }) {
  const router = useRouter();
  const [profileUpdate, setProfileUpdate] = useState(null);
  const profile = profileUpdate?.source === admin ? profileUpdate.value : admin;
  const [successMessage, setSuccessMessage] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [imagePreview, setImagePreview] = useState(admin.image ? `/admin/${admin.image}` : "");
  const [profileImageError, setProfileImageError] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("admin-login-success") === "true") {
      const timer = window.setTimeout(() => {
        window.sessionStorage.removeItem("admin-login-success");
        setSuccessMessage("Login successful. Welcome back!");
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.sessionStorage.setItem("admin-signed-out", "true");
    router.replace("/admin/login");
    router.refresh();
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordMessage("");
    const form = new FormData(event.currentTarget);
    const newPassword = form.get("newPassword");
    if (newPassword !== form.get("confirmPassword")) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPasswordMessage(data.message || "Unable to change password.");
        return;
      }
      setIsPasswordModalOpen(false);
      setSuccessMessage(data.message);
    } catch {
      setPasswordMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  function selectProfileImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    setProfileMessage("");
  }

  function closeProfileModal() {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(profile.image ? `/admin/${profile.image}` : "");
    setProfileMessage("");
    setIsProfileModalOpen(false);
  }

  async function updateProfile(event) {
    event.preventDefault();
    setProfileMessage("");
    setIsSavingProfile(true);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const data = await response.json();
      if (!response.ok) {
        setProfileMessage(data.message || "Unable to update profile.");
        return;
      }

      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setProfileUpdate({ source: admin, value: data.admin });
      setImagePreview(data.admin.image ? `/admin/${data.admin.image}` : "");
      setProfileImageError(false);
      setIsProfileModalOpen(false);
      setSuccessMessage(data.message);
      router.refresh();
    } catch {
      setProfileMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  const avatar = imagePreview || (profile.image ? `/admin/${profile.image}` : "");
  const statusPage = CONTACT_STATUS_PAGES.find(({ status }) => status === contactStatus);
  const sectionTitle = statusPage?.label || (section === "blogs" ? "Blog images" : section === "admins" ? "Admins & permissions" : section === "no-access" ? "Account access" : section === "seo" ? "SEO Control Center" : section === "branches" ? "Branches" : section === "rate" ? "Gold rates" : section === "contact" ? "Contact requests" : "Dashboard");

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><AdminBrand /></div>
        <p className={styles.menuTitle}>ADMIN WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {ADMIN_SECTIONS.slice(0, ADMIN_SECTIONS.findIndex(({ slug }) => slug === "completed") + 1).filter(({ key }) => hasAdminPermission(admin, key)).map(({ key, label, href, icon, slug }) => <Link key={key} className={(contactStatus ? statusPage?.permission === key : !metaOnly && !googleOnly && section === key) ? styles.active : undefined} aria-current={section === key && !contactStatus && !metaOnly && !googleOnly ? "page" : undefined} href={href}><span aria-hidden="true">{slug ? <ContactStatusIcon slug={slug} /> : icon}</span> {label}</Link>)}
          {hasAdminPermission(admin, "contact") && <Link href="/admin/contact/meta-leads" className={metaOnly ? styles.active : undefined} aria-current={metaOnly ? "page" : undefined}><span aria-hidden="true"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M12 12c-3-5-5-7-7-5C2 9 1 18 5 18c4 0 9-14 13-11 3 2 5 11 1 11-3 0-5-4-7-6Z" /></svg></span> Meta Lead</Link>}
          {hasAdminPermission(admin, "contact") && <Link href="/admin/contact/google-leads" className={googleOnly ? styles.active : undefined} aria-current={googleOnly ? "page" : undefined}><span aria-hidden="true"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M20 7a9 9 0 1 0 1 5h-9m9 0v5" /></svg></span> Google Lead</Link>}
          {ADMIN_SECTIONS.slice(ADMIN_SECTIONS.findIndex(({ slug }) => slug === "completed") + 1).filter(({ key }) => hasAdminPermission(admin, key)).map(({ key, label, href, icon, slug }) => <Link key={key} className={(contactStatus ? statusPage?.permission === key : !metaOnly && !googleOnly && section === key) ? styles.active : undefined} aria-current={section === key && !contactStatus && !metaOnly && !googleOnly ? "page" : undefined} href={href}><span aria-hidden="true">{slug ? <ContactStatusIcon slug={slug} /> : icon}</span> {label}</Link>)}
        </nav>
        <div className={styles.sidebarFoot}><span>ARYAN GOLD</span><p>Trust today.<br />Brighter tomorrows.</p><Link href="/">View website →</Link></div>
      </aside>
      <section className={styles.content}>
        <header className={styles.topbar}>
          <div><p className={styles.crumb}>Aryan Gold / Admin</p><h1>{sectionTitle}</h1></div>
          <div className={styles.profile}>
            <button className={styles.profileToggle} type="button" onClick={() => setIsProfileOpen(!isProfileOpen)} aria-expanded={isProfileOpen}>
              <span className={styles.avatar}>{profile.image && !profileImageError ? <Image src={`/admin/${profile.image}`} alt="" width={37} height={37} onError={() => setProfileImageError(true)} /> : profile.name.charAt(0).toUpperCase()}</span><div><strong>{profile.name}</strong><small>{profile.email}</small></div><span className={styles.chevron}>⌄</span>
            </button>
            {isProfileOpen && <div className={styles.profileMenu}>
              <div className={styles.profileMenuHead}><strong>{profile.name}</strong><span>{profile.email}</span></div>
              <button type="button" onClick={() => { setIsProfileOpen(false); setProfileMessage(""); setIsProfileModalOpen(true); }}>Profile</button>
              <button type="button" onClick={() => { setIsProfileOpen(false); setPasswordMessage(""); setIsPasswordModalOpen(true); }}>Change password</button>
              <button className={styles.logoutOption} type="button" onClick={logout}>Logout</button>
            </div>}
          </div>
        </header>
        {section === "no-access" ? <article className={styles.welcome}><h2>No sections assigned yet</h2><p>Ask your administrator to select the sidebar sections you can access. You can still update your profile or sign out using the account menu.</p></article> : section === "blogs" ? <BlogImageManager /> : section === "admins" ? <AdminUsersManager admin={admin} /> : section === "seo" ? <SeoManager /> : section === "branches" ? <BranchManager /> : section === "rate" ? <RateForm /> : section === "contact" ? <ContactsTable key={googleOnly ? "google" : metaOnly ? "meta" : contactStatus || "all"} googleOnly={googleOnly} metaOnly={metaOnly} status={contactStatus} canCreate={hasAdminPermission(admin, "contact")} /> : <>
          <article className={styles.welcome}>
            <p className={styles.eyebrow}>YOUR ARYAN GOLD WORKSPACE</p>
            <h2>Welcome back, {profile.name}.</h2>
            <p>Keep your gold rates up to date and every customer enquiry within reach.</p>
            {hasAdminPermission(admin, "rate") && <Link href="/admin/rate">Manage gold rates →</Link>}
          </article>
          <div className={styles.quickGrid}>
            {hasAdminPermission(admin, "branches") && <Link className={styles.quickCard} href="/admin/branches"><span className={styles.cardIcon} aria-hidden="true">⌂</span><h2>Branch locations</h2><p>Add and manage the branches customers can find on your website.</p><strong>Manage branches →</strong></Link>}
            {hasAdminPermission(admin, "contact") && <Link className={styles.quickCard} href="/admin/contact/index"><span className={styles.cardIcon} aria-hidden="true">☏</span><h2>Customer enquiries</h2><p>Review branch visits, doorstep service requests, quick contacts and contact page enquiries.</p><strong>View contact requests →</strong></Link>}
            {hasAdminPermission(admin, "rate") && <Link className={styles.quickCard} href="/admin/rate"><span className={styles.cardIcon} aria-hidden="true">₹</span><h2>Gold rates</h2><p>Manage the 24K, 22K and 18K prices displayed on your website.</p><strong>Update gold rates →</strong></Link>}
          </div>
        </>}
      </section>
      {successMessage && <div className={styles.toast} role="status"><span>✓ {successMessage}</span><button className={styles.toastClose} type="button" onClick={() => setSuccessMessage("")} aria-label="Close notification">×</button></div>}
      {isProfileModalOpen && <div className={styles.modalBackdrop} role="presentation" onMouseDown={closeProfileModal}>
        <section className={`${styles.modal} ${styles.profileModal}`} role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className={styles.modalHead}><div><h2 id="edit-profile-title">Update profile</h2><p>Update your personal details and profile image.</p></div><button type="button" onClick={closeProfileModal} aria-label="Close">×</button></div>
          <form onSubmit={updateProfile}>
            <div className={styles.imagePicker}>
              <span className={styles.imagePreview}>{avatar && (avatar.startsWith("blob:") || !profileImageError) ? <Image src={avatar} alt="Profile preview" width={88} height={88} unoptimized={avatar.startsWith("blob:")} onError={() => setProfileImageError(true)} /> : profile.name.charAt(0).toUpperCase()}</span>
              <div><label className={styles.fileButton} htmlFor="profileImage">Choose image</label><input className={styles.fileInput} id="profileImage" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectProfileImage} /><small>JPG, PNG or WebP. Maximum 5 MB.</small></div>
            </div>
            <div className={styles.formGrid}>
              <div><label htmlFor="profileName">Name</label><input id="profileName" name="name" defaultValue={profile.name} maxLength="255" required /></div>
              <div><label htmlFor="profileEmail">Email</label><input id="profileEmail" name="email" type="email" defaultValue={profile.email} maxLength="255" autoComplete="email" required /></div>
              <div className={styles.fullField}><label htmlFor="profilePhone">Phone</label><input id="profilePhone" name="phone" type="tel" defaultValue={profile.phone} inputMode="numeric" pattern="[0-9]{7,15}" maxLength="15" autoComplete="tel" /></div>
              <div className={styles.fullField}><label htmlFor="profileAddress">Address</label><textarea id="profileAddress" name="address" defaultValue={profile.address} rows="4" maxLength="5000" autoComplete="street-address" /></div>
            </div>
            {profileMessage && <p className={styles.passwordError} role="alert">{profileMessage}</p>}
            <div className={styles.modalActions}><button type="button" onClick={closeProfileModal}>Cancel</button><button className={styles.savePassword} type="submit" disabled={isSavingProfile}>{isSavingProfile ? "Saving…" : "Save changes"}</button></div>
          </form>
        </section>
      </div>}
      {isPasswordModalOpen && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsPasswordModalOpen(false)}>
        <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="change-password-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className={styles.modalHead}><div><h2 id="change-password-title">Change password</h2><p>Choose a new password for your account.</p></div><button type="button" onClick={() => setIsPasswordModalOpen(false)} aria-label="Close">×</button></div>
          <form onSubmit={changePassword}>
            <label htmlFor="currentPassword">Current password</label><input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
            <label htmlFor="newPassword">New password</label><input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength="8" required />
            <label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required />
            {passwordMessage && <p className={styles.passwordError} role="alert">{passwordMessage}</p>}
            <div className={styles.modalActions}><button type="button" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button><button className={styles.savePassword} type="submit" disabled={isChangingPassword}>{isChangingPassword ? "Saving…" : "Change password"}</button></div>
          </form>
        </section>
      </div>}
    </main>
  );
}
