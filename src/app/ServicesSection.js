"use client";
import Image from "next/image";
export default function ServicesSection({ standalone = false, onDoorstep }) {
 const Heading = standalone ? "h1" : "h2";
 return (
    <section className="section services-section" id="services" aria-labelledby="services-title">
      <div className="container services-shell">
        <div className="services-heading reveal">
          <span className="kicker">What can we help you with?</span>
          <Heading id="services-title">Our Services</Heading>
        </div>
        <div className="services-layout">
          <article className="service-offer service-sell reveal">
            <div className="offer-image"><Image src="/service-sell-gold.webp" alt="Ornate gold necklace and earrings on emerald velvet" fill sizes="(max-width: 700px) 100vw, (max-width: 1200px) 35vw, 33vw" /></div>
            <div className="offer-content">
              <span className="offer-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="24" r="17"/><path d="M17 15h15M17 21h15M19 15c10 0 10 10 0 10l12 10"/></svg></span>
              <h3>Sell Gold</h3>
              <p>Sell your old, unused or unwanted gold with a clear and transparent evaluation process.</p>
              <a className="offer-button" href={standalone ? "/#booking" : "#booking"}>Get Gold Valuation <span aria-hidden="true">→</span></a>
            </div>
          </article>
          <article className="service-offer service-pledged reveal delay-1">
            <div className="offer-image"><Image src="/service-pledged-gold.webp" alt="Gold necklace on a jewelry case beside a loan document" fill sizes="(max-width: 700px) 100vw, (max-width: 1200px) 35vw, 33vw" /></div>
            <div className="offer-content">
              <span className="offer-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17 24 6l19 11H5ZM8 39h32M11 20v16m8-16v16m10-16v16m8-16v16M5 43h38"/></svg></span>
              <h3>Release Pledged Gold</h3>
              <p>Gold pledged with a bank or NBFC? We can assist you in releasing eligible pledged gold and help you understand the settlement.</p>
              <a className="offer-button" href={standalone ? "/#booking" : "#booking"}>Get Pledged Gold Assistance <span aria-hidden="true">→</span></a>
            </div>
          </article>
          <article className="service-offer service-doorstep reveal delay-2">
            <div className="offer-image"><Image src="/valuation-weight.webp" alt="Gold jewellery on a digital weighing scale" fill sizes="(max-width: 700px) 100vw, (max-width: 1200px) 35vw, 33vw" /></div>
            <div className="offer-content">
              <span className="offer-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22 24 6l19 16M10 19v23h28V19M19 42V28h10v14"/><path d="M31 9V5h7v10"/></svg></span>
              <h3>Doorstep Valuation</h3>
              <p>Request a gold valuation from the comfort of your home. Our team will confirm availability in your area and arrange a convenient visit.</p>
              <a className="offer-button" href={standalone ? "/#booking" : "#booking"} onClick={() => onDoorstep?.()}>Book Doorstep Valuation <span aria-hidden="true">→</span></a>
            </div>
          </article>
        </div>
      </div>
    </section>
 );
}
