"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import styles from "./contact.module.css";

function Icon({ name }) {
  const paths = {
    phone: <path d="m7 3 3 5-2 2a15 15 0 0 0 6 6l2-2 5 3-1 4C10 22 2 14 3 4l4-1Z" />,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 3" /></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function ContactPage() {
  const pending = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (pending.current || !form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    if (!/^[\p{L}\s]+$/u.test(fields.name.trim()) || fields.name.trim().length < 2) {
      setFeedback({ error: true, message: "Please enter your name using at least two letters." });
      form.elements.name.focus();
      return;
    }
    if (!fields.message.trim()) {
      setFeedback({ error: true, message: "Please tell us how we can help." });
      form.elements.message.focus();
      return;
    }
    pending.current = true;
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fields.name.trim(), mobile: fields.mobile, city: fields.city, services: fields.message.trim(), businessType: "Contact Page" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to send your message. Please try again.");
      setFeedback({ error: false, message: "Thank you! Your message has been received. Our team will get back to you shortly." });
      form.reset();
    } catch (error) {
      setFeedback({ error: true, message: error.message || "Unable to send your message. Please try again." });
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className={`aryan-home ${styles.page}`} data-theme="light">
      <SiteHeader contactPage />
      <main>
        <section className={styles.hero} aria-labelledby="contact-title">
          <div className={styles.heroImage}>
            <Image src="/story-reception.webp" fill sizes="(max-width: 700px) 100vw, 60vw" alt="A welcoming gold-toned reception lounge" priority />
          </div>
          <div className={styles.heroInner}>
            <div className={styles.breadcrumb}><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Contact Us</span></div>
            <p className={styles.eyebrow}>LET’S START A CONVERSATION</p>
            <h1 id="contact-title">Contact <span>Us</span></h1>
            <p className={styles.intro}>We are here to help. Reach out to us for any<br className={styles.desktopBreak} /> queries, branch information or assistance.</p>
            <div className={styles.contactStrip}>
              <a href="tel:+918880300300" className={styles.contactItem}><span className={styles.icon}><Icon name="phone" /></span><span><strong>Call Us</strong><span>8880 300 300</span></span></a>
              <a href="#office-address" className={styles.contactItem}><span className={styles.icon}><Icon name="pin" /></span><span><strong>Head Office</strong><span>Bengaluru, Karnataka</span></span></a>
              <Link href="/" className={styles.contactItem}><span className={styles.icon}><Icon name="globe" /></span><span><strong>Our Website</strong><span>www.aryangoldbuyers.com</span></span></Link>
            </div>
          </div>
        </section>

        <section className={styles.contactPanel} aria-labelledby="message-title">
          <div className={styles.formSide}>
            <span className={styles.sectionLabel}>WE’RE LISTENING</span>
            <h2 id="message-title">Send Us a Message</h2>
            <p className={styles.formIntro}>Fill in your details and we will get back to you shortly.</p>
            <form onSubmit={submit} className={styles.form} aria-busy={submitting}>
              <div className={styles.fields}>
                <label className={styles.field}><span>Name <b>*</b></span><input name="name" autoComplete="name" minLength={2} maxLength={255} placeholder="Your name" required /></label>
                <label className={styles.field}><span>Phone Number <b>*</b></span><span className={styles.phoneInput}><span>+91</span><input name="mobile" type="tel" autoComplete="tel-national" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} title="Enter your 10-digit mobile number" placeholder="Mobile number" required /></span></label>
                <label className={styles.field}><span>City <b>*</b></span><select name="city" autoComplete="address-level2" defaultValue="" required><option value="" disabled>Select your city</option><option>Bengaluru</option><option>Chennai</option><option>Other</option></select></label>
                <label className={styles.field}><span>Message <b>*</b></span><textarea name="message" maxLength={255} rows={4} placeholder="How can we help you?" required /></label>
              </div>
              <p className={styles.formNote}>By sending this message, you agree to be contacted about your enquiry.</p>
              <button className={styles.sendButton} type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send Message"}<Icon name="arrow" /></button>
              {feedback && <p className={`${styles.feedback} ${feedback.error ? styles.error : styles.success}`} role={feedback.error ? "alert" : "status"}>{feedback.message}</p>}
            </form>
          </div>

          <aside className={styles.officeSide} aria-label="Office information">
            <div className={styles.officeDetail} id="office-address"><span className={styles.icon}><Icon name="pin" /></span><div><h3>Our Office Address</h3><address><strong>Aryan Gold Buyers</strong><br />#123, 2nd Floor, XYZ Towers,<br />Rajajinagar, Bengaluru – 560010<br />Karnataka, India</address><Link href="/#branches" className={styles.textLink}>Explore our branches <span aria-hidden="true">↗</span></Link></div></div>
            <div className={styles.officeDetail}><span className={styles.icon}><Icon name="clock" /></span><div><h3>Business Hours</h3><dl className={styles.hours}><dt>Monday – Saturday</dt><dd>10:00 AM – 7:00 PM</dd><dt>Sunday</dt><dd>10:00 AM – 5:00 PM</dd></dl></div></div>
            <div className={styles.visitCard}><Icon name="pin" /><span>A friendly face, close to you.<small>Visit a branch for a personal gold valuation.</small></span></div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
