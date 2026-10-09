import Link from "next/link";
import Brand from "./Brand";

export default function SiteFooter({ homePage = false }) {
  const home = homePage ? "" : "/";

  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand href={homePage ? "#home" : "/"} className="brand footer-wordmark" />
          <p>Transparent gold buying, pledged-gold assistance and convenient valuation services.</p>
        </div>
        <div>
          <h4>Services</h4>
          <Link href={`${home}#services`}>Sell Gold</Link>
          <Link href={`${home}#booking`}>Release Pledged Gold</Link>
          <Link href={`${home}#calculator`}>Gold Calculator</Link>
          <Link href={`${home}#booking`}>Book Valuation</Link>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link href={`${home}#rates`}>Gold Rate</Link>
          <Link href={`${home}#branches`}>Our Branches</Link>
          <Link href={`${home}#how-it-works-testing`}>How It Works</Link>
          <Link href={`${home}#faq`}>FAQs</Link>
          <Link href={`${home}#our-story`}>Our Story</Link>
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
