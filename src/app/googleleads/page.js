import Image from "next/image";
import { getPageSeoMetadata } from "@/lib/seo-metadata";
import { Manrope, Playfair_Display } from "next/font/google";
import Brand from "@/app/Brand";
import GoogleLeadForm from "./GoogleLeadForm";
import styles from "./googleleads.module.css";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-google-lead-body", display: "swap" });
const displayFont = Playfair_Display({ subsets: ["latin"], variable: "--font-google-lead-display", display: "swap" });

const defaultMetadata = {
  title: "Sell Gold for Instant Cash | Aryan Gold Buyers",
  description: "Get a free, transparent gold valuation and quick payment from Aryan Gold Buyers. Share your details for a callback from our gold expert.",
};

export async function generateMetadata() {
  return getPageSeoMetadata("/googleleads", defaultMetadata);
}

function BenefitIcon({ type }) {
  if (type === "shield") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 20 6v5.5c0 4.8-3.2 8.2-8 10-4.8-1.8-8-5.2-8-10V6l8-3.2Z"/><path d="m8.6 12 2.1 2.1 4.8-5"/></svg>;
  if (type === "cash") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.8" y="5.5" width="18.4" height="13" rx="2"/><path d="M7 9h.01M17 15h.01M12 9.2c1.7 0 3 1.2 3 2.8s-1.3 2.8-3 2.8-3-1.2-3-2.8 1.3-2.8 3-2.8Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15.5 8.5 11l3 3L20 5.5"/><path d="M14.5 5.5H20V11"/><path d="M4 20h16"/></svg>;
}

export default function GoogleLeadsPage() {
  return (
    <div className={`${styles.page} ${bodyFont.variable} ${displayFont.variable}`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand className={styles.brand} />
          <div className={styles.headerActions}>
            <div className={styles.headerPromise}><span>✓</span> Trusted gold buyers</div>
            <a href="#lead-form">Free valuation <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="google-leads-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Gold buyers in Bengaluru &amp; Chennai</span>
              <h1 id="google-leads-title">Your gold.<br />Its true value.<br /><em>Paid quickly.</em></h1>
              <p className={styles.heroLead}>A transparent gold valuation, completed in front of you. No cutting, no hidden steps, and no obligation to sell.</p>

              <div className={styles.benefits} aria-label="Aryan Gold Buyers benefits">
                <div><span><BenefitIcon type="shield" /></span><p><strong>Non-destructive testing</strong><small>Your jewellery stays intact</small></p></div>
                <div><span><BenefitIcon type="rate" /></span><p><strong>Transparent valuation</strong><small>Purity, weight and rate explained</small></p></div>
                <div><span><BenefitIcon type="cash" /></span><p><strong>Quick payment</strong><small>After verification and formalities</small></p></div>
              </div>

              <a className={styles.mobileCta} href="#lead-form">Get a free valuation <span aria-hidden="true">→</span></a>
            </div>

            <div className={styles.portrait} aria-label="Welcome to Aryan Gold Buyers">
              <div className={styles.portraitHalo} aria-hidden="true" />
              <Image src="/Selected/306A7111-transparent.png" alt="Aryan Gold Buyers representative holding cash and gold jewellery" width={1024} height={1536} priority sizes="(max-width: 820px) 92vw, 34vw" />
            </div>

            <GoogleLeadForm />
          </div>
        </section>

        <section id="trust-benefits" className={styles.trustSection} aria-label="Why customers choose Aryan Gold Buyers">
          <div className={styles.trustBar}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">✓</span>
              <p><strong>Free valuation</strong><small>No fees or hidden charges</small></p>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">✓</span>
              <p><strong>Advanced purity testing</strong><small>Clear, non-destructive process</small></p>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">✓</span>
              <p><strong>Transparent gold rate</strong><small>Purity, weight and rate explained</small></p>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">✓</span>
              <p><strong>No obligation</strong><small>Decide only when you are ready</small></p>
            </div>
          </div>
        </section>

        <section className={styles.steps} aria-labelledby="steps-title">
          <div className={styles.stepsInner}>
            <div className={styles.stepsHeading}><span>HOW IT WORKS</span><h2 id="steps-title">Your gold. Its true value. Three simple steps.</h2></div>
            <ol>
              <li><span>01</span><div><h3>Share your details</h3><p>Tell us how to reach you and what service you need.</p></div></li>
              <li><span>02</span><div><h3>Get a transparent valuation</h3><p>Your gold is checked for purity and weight in front of you.</p></div></li>
              <li><span>03</span><div><h3>Receive quick payment</h3><p>Accept the offer and complete the required verification.</p></div></li>
            </ol>
          </div>
        </section>
      </main>

      <footer className={styles.footer}><p>© 2026 Aryan Gold Buyers. Free valuation. No obligation to sell.</p></footer>
    </div>
  );
}
