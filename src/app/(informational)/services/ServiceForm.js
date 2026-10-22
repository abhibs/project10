"use client";

import { useCallback, useRef, useState } from "react";
import { SERVICE_PAGES } from "@/lib/service-pages.mjs";
import { getContactAttribution } from "@/lib/contact-attribution.mjs";
import { submitContactRequest } from "@/lib/submit-contact.mjs";
import FormToast from "../../FormToast";
import SubmitLabel from "../../SubmitLabel";
import styles from "./service-page.module.css";

export default function ServiceForm({ service }) {
  const details = SERVICE_PAGES[service];
  const pledged = service === "release-pledged-gold";
  const lock = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (lock.current || !form.reportValidity()) return;
    lock.current = true;
    setSubmitting(true);
    setFeedback(null);
    try {
      const fields = Object.fromEntries(new FormData(form));
      const data = await submitContactRequest({ ...getContactAttribution(), ...fields, businessType: details.title, services: details.title });
      const result = { message: data.message || "Thank you! Our team will call you shortly.", error: false };
      setFeedback(result);
      setToast(result);
      form.reset();
    } catch (error) {
      const result = { message: error.message || "Unable to send your enquiry. Please try again.", error: true };
      setFeedback(result);
      setToast(result);
    } finally { lock.current = false; setSubmitting(false); }
  }

  return <aside className={styles.formCard}>
    <p className={styles.eyebrow}>LET’S GET STARTED</p><h2>{pledged ? "Get pledge assistance" : "Get a free valuation"}</h2>
    <p className={styles.formIntro}>Share your details and we’ll call you back.</p>
    <form onSubmit={submit} aria-busy={submitting}>
      <label>Name<input name="name" autoComplete="name" placeholder="Your full name" minLength={2} maxLength={255} required onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/[^\p{L}\s]/gu, ""); }} /></label>
      <label>Contact number<input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" pattern="[0-9]{10}" maxLength={10} required onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} /></label>
      <label>Gold weight (grams)<input name="weight" type="number" min="0.01" max="100000" step="0.01" placeholder="Approx. weight in grams" required /></label>
      {pledged && <>
        <label>Release bank / NBFC<input name="releaseBank" placeholder="Bank or NBFC name" maxLength={255} required /></label>
        <label>Release place<input name="releasePlace" placeholder="Branch, city or area" maxLength={255} required /></label>
      </>}
      <label className={styles.consent}><input type="checkbox" required defaultChecked /><span>I authorise Aryan Gold to contact me about this enquiry.</span></label>
      <button className={styles.submit} type="submit" disabled={submitting}><SubmitLabel loading={submitting}>{details.button}</SubmitLabel></button>
      {feedback && <p className={`${styles.feedback} ${feedback.error ? styles.error : ""}`} role={feedback.error ? "alert" : "status"}>{feedback.message}</p>}
      <p className={styles.note}>Free enquiry. No obligation to sell.</p>
    </form>
    <FormToast notification={toast} onClose={closeToast} />
  </aside>;
}
