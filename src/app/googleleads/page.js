import Image from "next/image";
import GoldHeroBanner, { HeroBenefitIcon } from "../GoldHeroBanner";
import "../home.css";
import "../banner-form.css";
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
        <div className={`aryan-home ${styles.banner}`} data-theme="light">
          <GoldHeroBanner
            eyebrow="Gold buyers in Bengaluru & Chennai"
            heading={<>Your gold.<br />Its true value.<br /><span>Paid quickly.</span></>}
            description="A transparent gold valuation, completed in front of you. No cutting, no hidden steps, and no obligation to sell."
            valuationHref="#lead-form"
            valuationLabel="Get a free valuation"
            branchesHref="/branches"
            branchesLabel="Find your nearest branch"
            benefits={[
              ["shield", "Non-destructive testing", "Your jewellery stays intact"],
              ["chart", "Transparent valuation", "Purity, weight and rate explained"],
              ["payment", "Quick payment", "After verification and formalities"],
            ].map(([icon, title, detail]) => (
              <div key={icon}>
                <HeroBenefitIcon type={icon} />
                <span>{title}<small className={styles.benefitDetail}>{detail}</small></span>
              </div>
            ))}
            portrait={
              <div className={styles.portrait}>
                <Image src="/Selected/306A7111-transparent.png" alt="Aryan Gold Buyers representative holding cash and gold jewellery" width={1024} height={1536} sizes="(max-width: 1200px) 90vw, 40vw" preload />
              </div>
            }
          >
            <GoogleLeadForm />
          </GoldHeroBanner>
        </div>

        <section className={styles.steps} aria-labelledby="steps-title">
          <div className={styles.stepsInner}>
            <div className={styles.stepsHeading}><span>HOW IT WORKS</span><h2 id="steps-title">Your gold&apos;s true value in 3 simple steps.</h2></div>
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
