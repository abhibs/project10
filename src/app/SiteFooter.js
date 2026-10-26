import Link from "next/link";
import Brand from "./Brand";

export default function SiteFooter({ homePage = false }) {
  const home = homePage ? "" : "/";

  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand href="/" className="brand footer-wordmark" />
          <p>Transparent gold buying, pledged-gold assistance and convenient valuation services.</p>
        </div>
        <div>
          <h4>Services</h4>
          <Link href="/services/sell-gold">Sell Gold</Link>
          <Link href="/services/release-pledged-gold">Release Pledged Gold</Link>
          <Link href="/services/doorstep-valuation">Doorstep Valuation</Link>
          <Link href="/gold-rate-calculation">Gold Calculator</Link>
          <Link href={`${home}#booking`}>Book Valuation</Link>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link href="/gold-rate">Gold Rate</Link>
          <Link href="/documents">Required Documents</Link>
          <Link href="/branches">Our Branches</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href={`${home}#faq`}>FAQs</Link>
          <Link href="/about-us">Our Story</Link>
          <Link href="/contact-us">Contact Us</Link>
        </div>
        <div>
          <h4>Important</h4>
          <p className="footer-small">Rates shown online are indicative. Final value is confirmed after physical evaluation and applicable compliance checks.</p>
        </div>
      </div>
      <div className="container footer-bottom"><span>© <span id="year">{new Date().getFullYear()}</span> Aryan Gold. All rights reserved.</span></div>
    </footer>
  );
}
