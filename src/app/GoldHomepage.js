"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const FALLBACK_RATES = {24: 14250, 22: 13062, 18: 10688};
const rupees = new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 0});

export default function GoldHomepage() {
  const root = useRef(null);
  const pending = useRef(null);
  const submitLock = useRef({booking: false, contact: false});
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [weight, setWeight] = useState("10");
  const [purity, setPurity] = useState(22);
  const [serviceMode, setServiceMode] = useState("Branch Visit");
  const [messages, setMessages] = useState({booking: "", contact: ""});
  const [submitting, setSubmitting] = useState({booking: false, contact: false});
  const [toast, setToast] = useState("");
  const [minimumDate, setMinimumDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const [updated, setUpdated] = useState("using fallback");
  const [rateStatus, setRateStatus] = useState("Loading published gold rates…");
  const weightNumber = Math.max(0, Number(weight) || 0);

  function changeTheme(nextTheme) {
    setTheme(nextTheme);
    try { localStorage.setItem("aryanGoldTheme", nextTheme); } catch { /* Storage may be disabled. */ }
  }

  const fetchRates = useCallback(async () => {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    setLoading(true);
    setRateStatus("Loading published gold rates…");
    try {
      const response = await fetch("/api/rates", {cache: "no-store", signal: controller.signal});
      if (!response.ok) throw new Error("Rate feed unavailable");
      const data = await response.json();
      if (!Number(data.rates?.[24]) || !Number(data.rates?.[22]) || !Number(data.rates?.[18])) {
        throw new Error("Invalid rates");
      }
      setRates(data.rates);
      const date = new Date(data.updatedAt);
      const time = date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      setUpdated(time);
      setLive(true);
      setRateStatus(`Published gold rates • updated ${time}`);
    } catch {
      if (pending.current !== controller) return;
      setRates(FALLBACK_RATES);
      setLive(false);
      setUpdated("using fallback");
      setRateStatus("Published rates unavailable • showing demo fallback rates");
    } finally {
      clearTimeout(timeout);
      if (pending.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try { setTheme(localStorage.getItem("aryanGoldTheme") === "dark" ? "dark" : "light"); } catch { /* Use light theme. */ }
      const date = new Date();
      setMinimumDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
      fetchRates();
    }, 0);
    const interval = setInterval(fetchRates, 60000);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12});
    root.current.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      observer.disconnect();
      const controller = pending.current;
      pending.current = null;
      controller?.abort();
    };
  }, [fetchRates]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  function keepNameCharacters(event) {
    event.currentTarget.value = event.currentTarget.value.replace(/[^\p{L}\s]/gu, "");
  }

  function keepTenDigits(event) {
    event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10);
  }

  async function submitContact(event, kind) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || submitLock.current[kind]) return;

    submitLock.current[kind] = true;

    const fields = Object.fromEntries(new FormData(form));
    const appointment = kind === "booking";
    const payload = {
      name: fields.name,
      mobile: fields.mobile,
      city: appointment ? fields.city : "",
      weight: appointment ? fields.weight : "",
      preferredDate: appointment ? fields.preferredDate : "",
      preferredTime: appointment ? fields.preferredTime : "",
      services: fields.services,
      businessType: appointment ? serviceMode : "Quick Contact",
    };

    setMessages((previous) => ({...previous, [kind]: ""}));
    setSubmitting((previous) => ({...previous, [kind]: true}));
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to submit your request.");

      setMessages((previous) => ({...previous, [kind]: ""}));
      setToast(data.message);
      form.reset();
      if (kind === "booking") setServiceMode("Branch Visit");
    } catch (error) {
      setMessages((previous) => ({...previous, [kind]: error.message || "Unable to submit your request. Please try again."}));
    } finally {
      submitLock.current[kind] = false;
      setSubmitting((previous) => ({...previous, [kind]: false}));
    }
  }

  return (
    <div className="aryan-home" data-theme={theme} ref={root}>
<div className="topbar">
    <div className="container topbar-inner">
      <span>Transparent gold evaluation • Fast payout • Private & secure</span>
      <a href="#rates">View today&apos;s gold rate <span aria-hidden="true">→</span></a>
    </div>
  </div>

  <header className="site-header" id="home">
    <div className="container nav-wrap">
      <a className="brand" href="#home" aria-label="Aryan Gold home">
        <span className="brand-logo-shell"><Image className="brand-image" src="/aryan-gold.webp" width="44" height="44" alt="Aryan Gold logo" /></span>
        <span className="brand-copy"><strong>ARYAN</strong><small>GOLD</small></span>
      </a>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "Close menu" : "Open menu"}>
        <span></span><span></span><span></span>
      </button>

      <nav className={`main-nav${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} id="main-nav" aria-label="Primary navigation">
        <a href="#services">Services</a>
        <a href="#rates">Gold Rate</a>
        <a href="#calculator">Calculator</a>
        <a href="#how-it-works">How it works</a>
        <a href="#booking">Book Service</a>
        <a href="#faq">FAQ</a>
      </nav>


      <div className="theme-switch" role="group" aria-label="Color theme">
        <button className={theme === "light" ? "theme-option active" : "theme-option"} type="button" onClick={() => changeTheme("light")} aria-pressed={theme === "light"} title="Light mode"><span className="theme-icon" aria-hidden="true">☀</span><span className="theme-label">Light</span></button>
        <button className={theme === "dark" ? "theme-option active" : "theme-option"} type="button" onClick={() => changeTheme("dark")} aria-pressed={theme === "dark"} title="Dark mode"><span className="theme-icon" aria-hidden="true">☾</span><span className="theme-label">Dark</span></button>
      </div>

      <a className="btn btn-dark nav-cta" href="#contact">Get a Call Back</a>
    </div>
  </header>

  <main>
    <section className="hero section-shell">
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <div className="eyebrow"><span className="dot"></span> Trusted gold buying, in a premium blended finish</div>
          <h1>Your gold.<br /><span>Your value.</span><br />Paid fast.</h1>
          <p className="hero-lead">Sell old gold, unlock pledged jewellery, or request a doorstep valuation with a process built around transparency, convenience and speed.</p>

          <div className="hero-actions">
            <a className="btn btn-gold btn-lg" href="#calculator">Calculate Gold Value</a>
            <a className="btn btn-outline btn-lg" href="#booking">Book Free Valuation</a>
          </div>

          <div className="trust-row" aria-label="Service highlights">
            <div><strong>100%</strong><span>Transparent testing</span></div>
            <div><strong>Fast</strong><span>Cash / bank payout</span></div>
            <div><strong>Secure</strong><span>Private process</span></div>
          </div>
        </div>

        <div className="hero-visual reveal delay-1">
          <div className="gold-orbit orbit-one"></div>
          <div className="gold-orbit orbit-two"></div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span>Today&apos;s indicative rate</span>
              <span className="live-pill"><i></i> {live ? "PUBLISHED" : "INDICATIVE"}</span>
            </div>
            <div className="hero-price-row">
              <div>
                <span>24K / gram</span>
                <strong id="hero-rate">{rupees.format(rates[24])}</strong>
              </div>
              <div className="mini-badge">999<br /><small>purity</small></div>
            </div>
            <div className="hero-highlights" aria-label="Service highlights">
              <div className="hero-highlight-item"><span>Purity Test</span><strong>XRF Evaluation</strong></div>
              <div className="hero-highlight-item"><span>Payout</span><strong>Instant Transfer</strong></div>
              <div className="hero-highlight-item"><span>Service</span><strong>Branch / Doorstep</strong></div>
            </div>
            <div className="hero-card-bottom"><span>Updated <b id="hero-updated">{updated}</b></span><a href="#rates">See all rates →</a></div>
          </div>
        </div>
      </div>
    </section>

    <section className="rate-strip" id="rates">
      <div className="container rate-grid">
        <div className="rate-intro">
          <span className="kicker">GOLD RATE TRACKER</span>
          <h2>Gold rate at a glance</h2>
          <p>Indicative metal value per gram. Final buying value depends on verified purity and evaluation.</p>
        </div>
        <div className="rate-card">
          <span>24K Gold</span>
          <strong id="rate-24">{rupees.format(rates[24])}</strong>
          <small>per gram</small>
        </div>
        <div className="rate-card">
          <span>22K Gold</span>
          <strong id="rate-22">{rupees.format(rates[22])}</strong>
          <small>per gram</small>
        </div>
        <div className="rate-card">
          <span>18K Gold</span>
          <strong id="rate-18">{rupees.format(rates[18])}</strong>
          <small>per gram</small>
        </div>
        <div className="rate-meta">
          <button id="refresh-rates" disabled={loading} onClick={() => fetchRates()} className="text-button" type="button">↻ Refresh rates</button>
          <span id="rate-status">{rateStatus}</span>
        </div>
      </div>
    </section>

    <section className="section" id="calculator">
      <div className="container calc-grid">
        <div className="section-copy reveal">
          <span className="kicker">FREE GOLD VALUATION</span>
          <h2>Know what your gold could be worth.</h2>
          <p>Enter approximate weight and purity to see an instant indicative value using the latest rate available.</p>
          <ul className="check-list">
            <li>Published-rate based estimate</li>
            <li>No obligation to sell</li>
            <li>Final valuation after purity test</li>
          </ul>
          <a className="inline-link" href="#booking">Prefer expert help? Book a valuation →</a>
        </div>

        <div className="calculator-card reveal delay-1">
          <div className="calc-head">
            <div><span className="kicker">VALUE CALCULATOR</span><h3>Estimate your gold value</h3></div>
            <span className="secure-chip">Indicative</span>
          </div>
          <div className="field-grid two">
            <label className="field">
              <span>Gold weight</span>
              <div className="input-unit"><input id="gold-weight" type="number" min="0" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} inputMode="decimal" /><b>grams</b></div>
            </label>
            <label className="field">
              <span>Purity</span>
              <select id="gold-purity" value={purity} onChange={(event) => setPurity(Number(event.target.value))}>
                <option value="24">24K (99.9%)</option>
                <option value="22">22K (91.6%)</option>
                <option value="18">18K (75.0%)</option>
              </select>
            </label>
          </div>
          <div className="value-panel">
            <span>Estimated metal value</span>
            <strong id="estimate-value">{rupees.format(weightNumber * rates[purity])}</strong>
            <small id="estimate-copy">{`${weightNumber} g × ${purity}K reference rate of ${rupees.format(rates[purity])}/g`}</small>
          </div>
          <div className="calc-actions">
            <a className="btn btn-gold" href="#booking">Book Free Evaluation</a>
            <a className="btn btn-light" href="#contact">Talk to an Expert</a>
          </div>
          <p className="fine-print">This calculator is for guidance only. Stones, non-gold materials, verified purity and applicable buying terms may affect the final offer.</p>
        </div>
      </div>
    </section>

    <section className="section services-section" id="services">
      <div className="container">
        <div className="section-heading center reveal">
          <span className="kicker">ARYAN GOLD SERVICES</span>
          <h2>One trusted place for every gold need.</h2>
          <p>Choose the service that fits your situation. Our team can guide you before you visit or arrange a convenient doorstep appointment.</p>
        </div>

        <div className="services-grid">
          <article className="service-card featured reveal">
            <div className="service-icon">₹</div>
            <span className="service-num">01</span>
            <h3>Sell Gold for Cash</h3>
            <p>Convert jewellery, coins or old gold into funds with a clear purity check and market-linked valuation.</p>
            <ul><li>Transparent evaluation</li><li>Quick settlement</li><li>Branch or doorstep support</li></ul>
            <a href="#calculator">Check value →</a>
          </article>
          <article className="service-card reveal delay-1">
            <div className="service-icon">◆</div>
            <span className="service-num">02</span>
            <h3>Release Pledged Gold</h3>
            <p>Get assistance to release gold pledged with a bank, NBFC or finance company and understand your next options.</p>
            <ul><li>Private assistance</li><li>Clear documentation flow</li><li>Guided process</li></ul>
            <a href="#pledge">Request release help →</a>
          </article>
          <article className="service-card reveal delay-2">
            <div className="service-icon">⌂</div>
            <span className="service-num">03</span>
            <h3>Doorstep Gold Service</h3>
            <p>Request a convenient visit where available, or reserve a time at your preferred Aryan Gold branch.</p>
            <ul><li>Flexible appointment</li><li>Convenient scheduling</li><li>Fast confirmation</li></ul>
            <a href="#booking">Book service →</a>
          </article>
        </div>
      </div>
    </section>

    <section className="pledge-section" id="pledge">
      <div className="container pledge-grid">
        <div className="pledge-visual reveal" aria-hidden="true">
          <div className="pledge-ring"></div>
          <div className="pledge-card small-card-a"><span>STEP 1</span><strong>Share pledge details</strong></div>
          <div className="pledge-card small-card-b"><span>STEP 2</span><strong>Get release guidance</strong></div>
          <div className="pledge-center"><span>RELEASE</span><strong>YOUR<br />GOLD</strong><small>with expert support</small></div>
        </div>
        <div className="section-copy reveal delay-1">
          <span className="kicker light">PLEDGED GOLD SUPPORT</span>
          <h2>Don’t let your pledged gold stay locked away.</h2>
          <p>Tell us where your gold is pledged and the approximate outstanding amount. Our team can explain the release process and available service options.</p>
          <div className="pledge-points">
            <div><b>01</b><span><strong>Share basic details</strong><small>No sensitive account credentials required online.</small></span></div>
            <div><b>02</b><span><strong>Speak with a specialist</strong><small>Understand the steps, documents and estimated timeline.</small></span></div>
            <div><b>03</b><span><strong>Complete securely</strong><small>Proceed only after you are comfortable with the terms.</small></span></div>
          </div>
          <a className="btn btn-gold btn-lg" href="#contact">Request Pledge Release Call</a>
        </div>
      </div>
    </section>

    <section className="section" id="how-it-works">
      <div className="container">
        <div className="section-heading reveal">
          <span className="kicker">SIMPLE & TRANSPARENT</span>
          <h2>From gold to payment in four clear steps.</h2>
        </div>
        <div className="steps-grid">
          <div className="step reveal"><span>01</span><div className="step-line"></div><h3>Book</h3><p>Choose branch or doorstep service and your preferred time.</p></div>
          <div className="step reveal delay-1"><span>02</span><div className="step-line"></div><h3>Test</h3><p>Your gold is weighed and purity is checked transparently.</p></div>
          <div className="step reveal delay-2"><span>03</span><div className="step-line"></div><h3>Value</h3><p>Receive a clear market-linked valuation before you decide.</p></div>
          <div className="step reveal delay-3"><span>04</span><div className="step-line"></div><h3>Get Paid</h3><p>Accept the offer and complete payment through the available payout mode.</p></div>
        </div>
      </div>
    </section>

    <section className="booking-section" id="booking">
      <div className="container booking-grid">
        <div className="booking-copy reveal">
          <span className="kicker light">BOOK A FREE VALUATION</span>
          <h2>Branch visit or doorstep service—your choice.</h2>
          <p>Share a few details. The Aryan Gold team can confirm service availability and your appointment.</p>
          <div className="booking-note"><span>✓</span><div><strong>No obligation</strong><small>Getting a valuation does not require you to sell.</small></div></div>
          <div className="booking-note"><span>✓</span><div><strong>Your privacy matters</strong><small>Use only the details needed to arrange your appointment.</small></div></div>
        </div>

        <form className="form-card reveal delay-1" id="booking-form" onSubmit={(event) => submitContact(event, "booking")}>
          <div className="mode-switch" role="group" aria-label="Service mode">
            <button className={serviceMode === "Branch Visit" ? "active" : ""} type="button" aria-pressed={serviceMode === "Branch Visit"} onClick={() => setServiceMode("Branch Visit")}>Branch Visit</button>
            <button className={serviceMode === "Doorstep Service" ? "active" : ""} type="button" aria-pressed={serviceMode === "Doorstep Service"} onClick={() => setServiceMode("Doorstep Service")}>Doorstep Service</button>
          </div>
          <div className="field-grid two">
            <label className="field"><span>Full name</span><input name="name" autoComplete="name" required minLength="2" maxLength="255" onInput={keepNameCharacters} placeholder="Enter your name" /></label>
            <label className="field"><span>Mobile number</span><input name="mobile" type="tel" inputMode="numeric" autoComplete="tel" required pattern="[0-9]{10}" minLength="10" maxLength="10" onInput={keepTenDigits} placeholder="10-digit mobile number" /></label>
            <label className="field"><span>Service city / area</span><input name="city" autoComplete="address-level2" required placeholder="e.g. Bengaluru, Jayanagar" /></label>
            <label className="field"><span>Approx. gold weight</span><div className="input-unit"><input name="weight" type="number" min="0.1" step="0.1" placeholder="Optional" /><b>grams</b></div></label>
            <label className="field"><span>Preferred date</span><input name="preferredDate" id="booking-date" min={minimumDate} type="date" required /></label>
            <label className="field"><span>Preferred time</span><select name="preferredTime" required><option value="">Choose a time</option><option value="09:00-12:00">09:00 – 12:00</option><option value="12:00-15:00">12:00 – 15:00</option><option value="15:00-18:00">15:00 – 18:00</option></select></label>
          </div>
          <label className="field"><span>Service required</span><select name="services" required><option>Sell Gold for Cash</option><option>Release Pledged Gold</option><option>Gold Valuation Only</option><option>Other / Need Guidance</option></select></label>
          <label className="consent"><input type="checkbox" required /><span>I agree to be contacted by Aryan Gold regarding this request.</span></label>
          <button className="btn btn-gold btn-block" type="submit" disabled={submitting.booking}>{submitting.booking ? "Submitting…" : "Request Appointment"}</button>
          <p className="form-message" id="booking-message" role="status">{messages.booking}</p>
        </form>
      </div>
    </section>

    <section className="section why-section">
      <div className="container why-grid">
        <div className="section-copy reveal">
          <span className="kicker">THE ARYAN GOLD PROMISE</span>
          <h2>Confidence at every step.</h2>
          <p>Gold is personal. The experience should feel professional, transparent and respectful from the first call to final settlement.</p>
        </div>
        <div className="why-cards">
          <div className="why-card reveal"><b>01</b><h3>Clear valuation</h3><p>Weight, purity and rate are explained before you decide.</p></div>
          <div className="why-card reveal delay-1"><b>02</b><h3>Secure handling</h3><p>Your gold stays within a controlled evaluation process.</p></div>
          <div className="why-card reveal delay-2"><b>03</b><h3>Fast service</h3><p>Appointments and callbacks are designed to reduce waiting time.</p></div>
          <div className="why-card reveal delay-3"><b>04</b><h3>Choice & convenience</h3><p>Use a branch or ask about doorstep service availability.</p></div>
        </div>
      </div>
    </section>

    <section className="section faq-section" id="faq">
      <div className="container faq-grid">
        <div className="section-copy reveal">
          <span className="kicker">FAQ</span>
          <h2>Questions before you sell?</h2>
          <p>Here are the answers customers usually need first.</p>
          <a className="btn btn-dark" href="#contact">Ask Aryan Gold</a>
        </div>
        <div className="accordion reveal delay-1">
          <details open><summary>How is my gold value calculated?</summary><p>Your estimated value is based on weight, purity and the current reference rate. The final offer can only be confirmed after physical purity and weight verification.</p></details>
          <details><summary>Can I sell old or broken jewellery?</summary><p>Yes. Old, broken and unused gold jewellery can be evaluated based on verified gold content, subject to Aryan Gold’s buying policy.</p></details>
          <details><summary>Can Aryan Gold help release pledged gold?</summary><p>You can request assistance for gold pledged with a bank, NBFC or finance company. The exact process depends on the pledge provider, documents and outstanding amount.</p></details>
          <details><summary>What documents should I carry?</summary><p>Carry valid government-issued identity and address proof. Additional documents may be requested depending on the transaction and local compliance requirements.</p></details>
          <details><summary>Is doorstep service available everywhere?</summary><p>Doorstep availability can depend on your service area and appointment slot. Submit a booking request and the team can confirm availability.</p></details>
        </div>
      </div>
    </section>

    <section className="contact-section" id="contact">
      <div className="container contact-grid">
        <div className="contact-copy reveal">
          <span className="kicker light">QUICK CONTACT</span>
          <h2>Have gold to sell?<br />Start with a 2-minute call.</h2>
          <p>Leave your number and tell us what you need. An Aryan Gold representative can contact you.</p>
          <div className="contact-chips"><span>Sell gold</span><span>Release pledge</span><span>Gold rate</span><span>Book visit</span></div>
        </div>
        <form className="quick-form reveal delay-1" id="contact-form" onSubmit={(event) => submitContact(event, "contact")}>
          <label className="field field-dark"><span>Your name</span><input name="name" required minLength="2" maxLength="255" onInput={keepNameCharacters} placeholder="Full name" /></label>
          <label className="field field-dark"><span>Mobile number</span><input name="mobile" type="tel" required inputMode="numeric" pattern="[0-9]{10}" minLength="10" maxLength="10" onInput={keepTenDigits} placeholder="10-digit mobile number" /></label>
          <label className="field field-dark"><span>I need help with</span><select name="services"><option>Selling Gold</option><option>Releasing Pledged Gold</option><option>Gold Rate / Valuation</option><option>Branch / Doorstep Appointment</option></select></label>
          <button className="btn btn-gold btn-block" type="submit" disabled={submitting.contact}>{submitting.contact ? "Submitting…" : "Request Call Back"}</button>
          <p className="form-message dark-message" id="contact-message" role="status">{messages.contact}</p>
        </form>
      </div>
    </section>
  </main>

  <footer>
    <div className="container footer-grid">
      <div className="footer-brand">
        <div className="brand-fallback footer-wordmark">
          <span className="brand-mark">AG</span>
          <span className="brand-copy"><strong>ARYAN</strong><small>GOLD</small></span>
        </div>
        <p>Transparent gold buying, pledged-gold assistance and convenient valuation services.</p>
      </div>
      <div><h4>Services</h4><a href="#services">Sell Gold</a><a href="#pledge">Release Pledged Gold</a><a href="#calculator">Gold Calculator</a><a href="#booking">Book Valuation</a></div>
      <div><h4>Quick Links</h4><a href="#rates">Gold Rate</a><a href="#how-it-works">How It Works</a><a href="#faq">FAQs</a><a href="#contact">Contact</a></div>
      <div><h4>Important</h4><p className="footer-small">Rates shown online are indicative. Final value is confirmed after physical evaluation and applicable compliance checks.</p></div>
    </div>
    <div className="container footer-bottom"><span>© <span id="year">{new Date().getFullYear()}</span> Aryan Gold. All rights reserved.</span><span>White • Gold • Black premium theme</span></div>
  </footer>

  <div className="floating-actions" aria-label="Quick actions">
    <a href="#contact" className="float-btn" aria-label="Request callback">☎</a>
    <a href="#booking" className="float-btn gold" aria-label="Book valuation">₹</a>
  </div>
  {toast && <div className="contact-toast" role="status" aria-live="polite"><span>✓</span><p>{toast}</p><button type="button" onClick={() => setToast("")} aria-label="Close notification">×</button></div>}
    </div>
  );
}
