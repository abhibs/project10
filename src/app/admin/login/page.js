"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (window.sessionStorage.getItem("admin-signed-out") === "true") {
      const timer = window.setTimeout(() => {
        window.sessionStorage.removeItem("admin-signed-out");
        setSuccessMessage("Signed out successfully.");
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!successMessage && !message) return;
    const timer = window.setTimeout(() => {
      setSuccessMessage("");
      setMessage("");
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage, message]);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to sign in. Please try again.");
        return;
      }

      window.sessionStorage.setItem("admin-login-success", "true");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.formPanel} aria-label="Admin sign in">
        <div className={styles.formContent}>
          <Link className={styles.brand} href="/" aria-label="Larkon home">
            <span className={styles.brandMark} aria-hidden="true">▰</span>
            <span>Larkon</span>
          </Link>

          <h1>Sign In</h1>
          <p className={styles.intro}>Enter your email address and password to access admin panel.</p>

          <form onSubmit={submit}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="user@demo.com" autoComplete="email" required />

            <div className={styles.passwordLabel}>
              <label htmlFor="password">Password</label>
            </div>
            <div className={styles.passwordField}>
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? "◉" : "◌"}
              </button>
            </div>

            <button className={styles.submit} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </section>
      <aside className={styles.visual} aria-hidden="true">
        <div className={styles.architecture}>
          <span className={styles.rail} />
          <span className={styles.steps} />
        </div>
      </aside>
      {successMessage && <div className={`${styles.toast} ${styles.successToast}`} role="status"><span>✓ {successMessage}</span><button className={styles.toastClose} type="button" onClick={() => setSuccessMessage("")} aria-label="Close notification">×</button></div>}
      {message && <div className={`${styles.toast} ${styles.errorToast}`} role="alert"><span>! {message}</span><button className={styles.toastClose} type="button" onClick={() => setMessage("")} aria-label="Close notification">×</button></div>}
    </main>
  );
}
