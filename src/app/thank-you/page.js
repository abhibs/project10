import Link from "next/link";
import { Manrope, Playfair_Display } from "next/font/google";
import Brand from "../Brand";
import styles from "./page.module.css";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-thank-body", display: "swap" });
const displayFont = Playfair_Display({ subsets: ["latin"], variable: "--font-thank-display", display: "swap" });

export const metadata = {
  title: "Thank You | Aryan Gold Buyers",
  description: "Your gold valuation enquiry has been received. Our gold expert will call you shortly.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <div className={`${styles.page} ${bodyFont.variable} ${displayFont.variable}`}>
    <header className={styles.header}><Brand className={styles.brand} /></header>
    <main className={styles.content}>
      <span className={styles.check} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg></span>
      <p className={styles.eyebrow}>ENQUIRY RECEIVED</p>
      <h1>Thank you!</h1>
      <p className={styles.message}>Your enquiry has been received.<br />Our gold expert will call you shortly.</p>
      <Link className={styles.homeLink} href="/">Back to home <span aria-hidden="true">→</span></Link>
    </main>
    <footer className={styles.footer}>Aryan Gold Buyers · Free valuation. No obligation to sell.</footer>
  </div>;
}
