"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getContactAttribution } from "@/lib/contact-attribution.mjs";
import { GOOGLE_LEAD_TYPE } from "@/lib/contact-summary.mjs";
import { submitContactRequest } from "@/lib/submit-contact.mjs";
import styles from "./googleleads.module.css";

function keepTenDigits(event) {
  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10);
}

function keepNameCharacters(event) {
  event.currentTarget.value = event.currentTarget.value.replace(/[^\p{L}\s]/gu, "").slice(0, 255);
}

export default function GoogleLeadForm() {
  const router = useRouter();
  const formRef = useRef(null);
  const lock = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!window.matchMedia("(max-width: 850px)").matches) return;

    const frame = window.requestAnimationFrame(() => {
      formRef.current?.focus({ preventScroll: true });
      formRef.current?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function submitLead(event) {
    event.preventDefault();
    if (lock.current) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    lock.current = true;
    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const result = await submitContactRequest({
        ...getContactAttribution(),
        name: fields.name,
        mobile: fields.mobile,
        city: fields.city,
        weight: fields.weight,
        services: fields.services,
        businessType: GOOGLE_LEAD_TYPE,
      });
      form.reset();
      setFeedback({ type: "success", message: result.message });
      router.replace("/thank-you");
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to submit your request. Please try again." });
      lock.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} className={styles.leadForm} id="lead-form" tabIndex={-1} aria-labelledby="google-lead-form-title" aria-busy={submitting} onSubmit={submitLead}>
      <div className={styles.formHeading}>
        <span className={styles.formKicker}>FREE GOLD VALUATION</span>
        <h2 id="google-lead-form-title">Request a free valuation</h2>
        <p>Leave your details and our gold expert will call you shortly.</p>
      </div>

      <label className={styles.field} htmlFor="google-lead-name">
        <span>Full name</span>
        <input id="google-lead-name" name="name" autoComplete="name" placeholder="Enter your full name" minLength={2} maxLength={255} onInput={keepNameCharacters} required />
      </label>

      <label className={styles.field} htmlFor="google-lead-mobile">
        <span>Mobile number</span>
        <div className={styles.phoneField}><b aria-hidden="true">+91</b><input id="google-lead-mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" pattern="[0-9]{10}" minLength={10} maxLength={10} onInput={keepTenDigits} required /></div>
      </label>

      <div className={styles.fieldRow}>
        <label className={styles.field} htmlFor="google-lead-city">
          <span>City / area</span>
          <input id="google-lead-city" name="city" autoComplete="address-level2" placeholder="e.g. Bengaluru" maxLength={255} required />
        </label>
        <label className={styles.field} htmlFor="google-lead-weight">
          <span>Approx. gold weight</span>
          <div className={styles.weightField}><input id="google-lead-weight" name="weight" type="number" inputMode="decimal" placeholder="Optional" min="0.01" max="100000" step="0.01" /><b>g</b></div>
        </label>
      </div>

      <label className={styles.field} htmlFor="google-lead-service">
        <span>How can we help?</span>
        <select id="google-lead-service" name="services" defaultValue="" required>
          <option value="" disabled>Select a service</option>
          <option>Sell Gold for Instant Cash</option>
          <option>Doorstep Service</option>
          <option>Release Pledged Gold</option>
          <option>Gold Valuation</option>
          <option>Need Guidance</option>
        </select>
      </label>

      <label className={styles.consent} htmlFor="google-lead-consent">
        <input id="google-lead-consent" type="checkbox" defaultChecked required />
        <span>I authorise Aryan Gold Buyers to contact me about this enquiry.</span>
      </label>

      <button className={styles.submitButton} type="submit" disabled={submitting || feedback.type === "success"}>
        <span>{submitting ? "Submitting…" : "Get Free Valuation"}</span>
        <span aria-hidden="true">→</span>
      </button>

      <p className={styles.formNote}>No fees. No obligation to sell. Your details stay private.</p>
      <Link className={styles.branchLink} href="/branches">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <span>Find your nearest branch</span>
        <span aria-hidden="true">→</span>
      </Link>
      {feedback.type === "error" && <p className={`${styles.feedback} ${styles.error}`} role="alert">{feedback.message}</p>}
    </form>
  );
}
