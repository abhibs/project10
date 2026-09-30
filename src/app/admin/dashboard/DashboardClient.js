"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RateForm from "./RateForm";
import ContactsTable from "./ContactsTable";
import AdminBrand from "../AdminBrand";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function DashboardClient({ admin, section = "dashboard" }) {
  const router = useRouter();
  const [profile, setProfile] = useState(admin);
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
      setProfile(data.admin);
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
  const sectionTitle = section === "rate" ? "Gold rates" : section === "contact" ? "Contact requests" : "Dashboard";

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><AdminBrand /></div>
        <p className={styles.menuTitle}>ADMIN WORKSPACE</p>
        <nav aria-label="Admin navigation">
          <Link className={section === "dashboard" ? styles.active : undefined} aria-current={section === "dashboard" ? "page" : undefined} href="/admin/dashboard"><span aria-hidden="true">▦</span> Dashboard</Link>
          <Link className={section === "contact" ? styles.active : undefined} aria-current={section === "contact" ? "page" : undefined} href="/admin/contact/index"><span aria-hidden="true">☏</span> Contacts</Link>
          <Link className={section === "rate" ? styles.active : undefined} aria-current={section === "rate" ? "page" : undefined} href="/admin/rate"><span aria-hidden="true">₹</span> Gold rates</Link>
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
        {section === "rate" ? <RateForm /> : section === "contact" ? <ContactsTable /> : <>
          <article className={styles.welcome}>
            <p className={styles.eyebrow}>YOUR ARYAN GOLD WORKSPACE</p>
            <h2>Welcome back, {profile.name}.</h2>
            <p>Keep your gold rates up to date and every customer enquiry within reach.</p>
            <Link href="/admin/rate">Manage gold rates →</Link>
          </article>
          <div className={styles.quickGrid}>
            <Link className={styles.quickCard} href="/admin/contact/index"><span className={styles.cardIcon} aria-hidden="true">☏</span><h2>Customer enquiries</h2><p>Review branch visits, doorstep service requests and quick contacts.</p><strong>View contact requests →</strong></Link>
            <Link className={styles.quickCard} href="/admin/rate"><span className={styles.cardIcon} aria-hidden="true">₹</span><h2>Gold rates</h2><p>Manage the 24K, 22K and 18K prices displayed on your website.</p><strong>Update gold rates →</strong></Link>
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
