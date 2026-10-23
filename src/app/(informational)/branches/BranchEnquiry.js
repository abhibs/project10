"use client";

import { useRef, useState } from "react";
import { getContactAttribution } from "@/lib/contact-attribution.mjs";
import { submitContactRequest } from "@/lib/submit-contact.mjs";
import SubmitLabel from "@/app/SubmitLabel";
import styles from "./branch-detail.module.css";

export default function BranchEnquiry({ branch }) {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (lock.current || !form.reportValidity()) return;
    lock.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      const values = Object.fromEntries(new FormData(form));
      const data = await submitContactRequest({
        ...getContactAttribution(), ...values,
        businessType: "Sell Gold", city: branch.city,
        services: `${values.services} — ${branch.name} (${branch.branchId})`.slice(0, 255),
      });
      setFeedback({ message: data.message || "Thank you. Our team will call you shortly.", error: false });
      form.reset();
    } catch (error) {
      setFeedback({ message: error.message || "Unable to send your enquiry. Please try again.", error: true });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return <aside className={styles.formCard} id="branch-enquiry" aria-labelledby="branch-form-title">
    <span className={styles.eyebrow}>FREE GOLD VALUATION</span>
    <h2 id="branch-form-title">Let’s find your<br />gold’s true value.</h2>
    <p>Leave your details for a callback about our {branch.area} branch.</p>
    <form onSubmit={submit} aria-busy={busy}>
      <label>Full name<input name="name" autoComplete="name" placeholder="Your full name" minLength={2} maxLength={255} required onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/[^\p{L}\s]/gu, ""); }} /></label>
      <label>Mobile number<input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" pattern="[0-9]{10}" maxLength={10} required onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} /></label>
      <div className={styles.formRow}>
        <label>Gold weight (g)<input name="weight" type="number" inputMode="decimal" placeholder="Approx. grams" min="0.01" max="100000" step="0.01" required /></label>
        <label>Gold type<select name="services" defaultValue="Gold jewellery"><option>Gold jewellery</option><option>Gold coins</option><option>Gold bars</option><option>Old or broken gold</option></select></label>
      </div>
      <label className={styles.consent}><input type="checkbox" defaultChecked required /><span>I authorise Aryan Gold to contact me.</span></label>
      <button className={styles.goldButton} type="submit" disabled={busy}><SubmitLabel loading={busy}>Request a callback</SubmitLabel><span aria-hidden="true">→</span></button>
      {feedback && <p className={feedback.error ? styles.formError : styles.formSuccess} role={feedback.error ? "alert" : "status"}>{feedback.message}</p>}
      <small>Free valuation. No obligation to sell.</small>
    </form>
  </aside>;
}
