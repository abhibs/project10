"use client";

import Brand from "./Brand";
import BranchLocations from "./BranchLocations";
import PaymentSection from "./PaymentSection";
import ExperienceSection from "./ExperienceSection";
import StorySection from "./StorySection";
import FaqSection from "./FaqSection";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const FALLBACK_RATES = {24: 14250, 22: 13062, 18: 10688};
const rupees = new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 0});
const BUY_ITEMS = [
  {title: "Gold Jewellery", description: "Chains, rings, bangles and more", image: "/buy-gold-jewellery.webp", alt: "Traditional gold jewellery on emerald velvet"},
  {title: "Old Gold", description: "Unused and outdated jewellery", image: "/buy-old-gold.webp", alt: "Collection of old gold chains and rings"},
  {title: "Broken Gold", description: "Damaged and broken articles", image: "/buy-broken-gold.webp", alt: "Broken gold rings and jewellery pieces"},
  {title: "Gold Coins", description: "All eligible gold coins", image: "/buy-gold-coins.webp", alt: "Stack of gold coins"},
  {title: "Gold Bars / Biscuits", description: "Investment gold, subject to verification", image: "/buy-gold-bars.webp", alt: "Stack of gold bars"},
  {title: "Silver Articles", description: "Silver jewellery, coins and more", image: "/buy-silver-articles.webp", alt: "Silver vessels and jewellery"},
];
const TESTING_BENEFITS = [
  {title: "No Scratching", description: "Truly non-destructive evaluation", icon: "shield", tone: "teal"},
  {title: "No Cutting", description: "Your jewellery stays intact", icon: "atom", tone: "red"},
  {title: "Accurate Purity Check", description: "Advanced XRF technology", icon: "search", tone: "teal"},
  {title: "Transparent Results", description: "See the purity details clearly", icon: "check", tone: "red"},
];
const TESTING_STEPS = [
  {title: "Place Your Item", description: "Keep your gold item on the testing machine.", icon: "bangle"},
  {title: "XRF Analysis", description: "Advanced technology analyses purity instantly.", icon: "scan"},
  {title: "View Results", description: "See the purity details on screen.", icon: "report"},
  {title: "Get Valuation", description: "We offer a fair price based on verified purity.", icon: "check"},
];
const VALUATION_FACTORS = [
  {title: "Weight", description: "Verified weight on a digital machine.", icon: "scale"},
  {title: "Purity", description: "Measured using advanced XRF technology.", icon: "gem"},
  {title: "Current Gold Rate", description: "Applicable live market rate at the time of evaluation.", icon: "chart"},
  {title: "Service Charges", description: "Clearly explained before you decide.", icon: "report"},
  {title: "Your Final Offer", description: "Based on verified weight, purity and live rate.", icon: "rupee"},
];
const VALUATION_STEPS = [
  {title: "Accurate Weight Check", description: "Your gold is weighed on a calibrated digital machine in front of you.", image: "/valuation-weight.webp", alt: "Gold jewellery on a digital weighing scale"},
  {title: "Purity Testing", description: "We use advanced XRF technology to check the purity without damaging your item.", image: "/valuation-purity.webp", alt: "Jeweller testing a gold bangle with an XRF scanner"},
  {title: "Live Gold Rate", description: "We apply the current market rate at the time of evaluation.", image: "/valuation-rate.webp", alt: "Gold rate display beside gold bars", liveRate: true},
  {title: "Clear Final Offer", description: "You get a complete breakup and the final offer before you decide.", image: "/valuation-offer.webp", alt: "Valuation sheet with gold jewellery"},
];

function AnimatedAmount({ value }) {
  const number = useRef(null);
  const displayed = useRef(value);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const from = displayed.current;
    let frame;
    const finish = () => {
      cancelAnimationFrame(frame);
      displayed.current = value;
      number.current.textContent = rupees.format(value);
    };
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / 420, 1);
      displayed.current = from + (value - from) * (1 - Math.pow(1 - progress, 3));
      number.current.textContent = rupees.format(displayed.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    if (motion.matches || from === value) finish();
    else frame = requestAnimationFrame(tick);
    motion.addEventListener("change", finish);
    return () => {
      cancelAnimationFrame(frame);
      motion.removeEventListener("change", finish);
    };
  }, [value]);

  return <strong id="estimate-value"><span ref={number} aria-hidden="true">{rupees.format(value)}</span><span className="amount-accessible">{rupees.format(value)}</span></strong>;
}

function HeroBenefitIcon({type}) {
  const paths = {
    diamond: <><path d="M4 16 12 5h24l8 11-20 27L4 16Z"/><path d="M4 16h40M12 5l6 11 6 27 6-27 6-11"/></>,
    shield: <><path d="M24 4 40 10v12c0 11-7 18-16 22C15 40 8 33 8 22V10L24 4Z"/><path d="m16 24 5 5 11-12"/></>,
    chart: <><path d="M5 41h38M10 35V26h7v9M21 35V19h7v16M32 35V12h7v23M10 20l11-8 8 5L41 5M35 5h6v6"/></>,
    payment: <><circle cx="24" cy="24" r="19"/><path d="M16 15h17M16 21h17M18 15c11 0 11 10 0 10l13 11"/></>,
    coins: <><ellipse cx="17" cy="13" rx="10" ry="4"/><path d="M7 13v8c0 2 4 4 10 4 2 0 4 0 6-1M7 20c1 2 5 4 10 4"/><ellipse cx="31" cy="25" rx="10" ry="4"/><path d="M21 25v12c0 2 4 4 10 4s10-2 10-4V25M21 31c0 2 4 4 10 4s10-2 10-4"/></>,
    support: <><circle cx="24" cy="15" r="6"/><path d="M12 37v-3c0-6 5-10 12-10s12 4 12 10v3H12Z"/><circle cx="9" cy="20" r="4"/><path d="M8 27c-4 0-6 3-6 8v2h7M39 27c4 0 7 3 7 8v2h-7"/><circle cx="39" cy="20" r="4"/></>,
  };
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function TestingIcon({type}) {
  const paths = {
    shield: <><path d="M24 4 40 10v12c0 11-7 18-16 22C15 40 8 33 8 22V10L24 4Z"/><path d="m16 24 5 5 11-12"/></>,
    atom: <><circle cx="24" cy="24" r="3"/><ellipse cx="24" cy="24" rx="18" ry="7"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(120 24 24)"/></>,
    search: <><circle cx="21" cy="21" r="14"/><path d="m31 31 12 12"/></>,
    check: <><circle cx="24" cy="24" r="19"/><path d="m14 24 7 7 14-15"/></>,
    bangle: <><ellipse cx="24" cy="18" rx="17" ry="7"/><path d="M7 18v12c0 4 8 7 17 7s17-3 17-7V18M7 24c0 4 8 7 17 7s17-3 17-7"/></>,
    scan: <><path d="M5 17V7h10M33 7h10v10M43 31v10H33M15 41H5V31"/><path d="m24 15 9 9-9 9-9-9 9-9Z"/></>,
    report: <><path d="M12 5h18l7 7v31H12V5Z"/><path d="M30 5v8h7M18 21h13M18 27h13M18 33h10"/></>,
  };
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function ValuationIcon({type}) {
  const paths = {
    scale: <><path d="M24 5v35M11 12h26M13 12 5 29h16l-8-17ZM35 12l-8 17h16l-8-17ZM14 42h20"/></>,
    gem: <><path d="M5 18 14 7h20l9 11-19 24L5 18Z"/><path d="M5 18h38M14 7l6 11 4 24 4-24 6-11"/></>,
    chart: <><path d="M5 42h38M9 37V26h8v11M20 37V19h8v18M31 37V12h8v25M8 21l12-8 8 4L41 5M35 5h6v6"/></>,
    report: <><path d="M12 5h18l7 7v31H12V5Z"/><path d="M30 5v8h7M18 21h13M18 27h13M18 33h10"/></>,
    rupee: <><path d="M11 13h26M11 20h26M15 13c15 0 15 13 0 13l17 17"/></>,
  };
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export default function GoldHomepage() {
  const root = useRef(null);
  const scrollProgress = useRef(null);
  const pending = useRef(null);
  const submitLock = useRef({booking: false, contact: false});
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
  const [rateStatus, setRateStatus] = useState("Loading published gold rates…");
  const weightNumber = Math.max(0, Number(weight) || 0);
  const selectedRate = purity === 20 ? (Number(rates[20]) || Math.round(rates[24] * 20 / 24)) : rates[purity];

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
      setLive(true);
      setRateStatus(`Published gold rates • updated ${time}`);
    } catch {
      if (pending.current !== controller) return;
      setRates(FALLBACK_RATES);
      setLive(false);
      setRateStatus("Published rates unavailable • showing demo fallback rates");
    } finally {
      clearTimeout(timeout);
      if (pending.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const date = new Date();
      setMinimumDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
      fetchRates();
    }, 0);
    const interval = setInterval(fetchRates, 60000);
    const container = root.current;
    container.dataset.motion = "ready";
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.08});
    container.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      observer.disconnect();
      delete container.dataset.motion;
      const controller = pending.current;
      pending.current = null;
      controller?.abort();
    };
  }, [fetchRates]);

  useEffect(() => {
    const container = root.current;
    let frame;
    const update = () => {
      frame = undefined;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(window.scrollY / distance, 1) : 0;
      scrollProgress.current.style.transform = `scaleX(${progress})`;
      container.dataset.scrolled = window.scrollY > 40 ? "true" : "false";
    };
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

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
    <div className="aryan-home" data-theme="light" ref={root}>
  <header className="site-header" id="home">
    <div className="reading-progress" ref={scrollProgress} aria-hidden="true" />
    <div className="container nav-wrap">
      <Brand href="#home" className="brand" />

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "Close menu" : "Open menu"}>
        <span></span><span></span><span></span>
      </button>

      <nav className={`main-nav${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} id="main-nav" aria-label="Primary navigation">
        <a href="#services">Services</a>
        <a href="#rates">Gold Rate</a>
        <a href="#calculator">Calculator</a>
        <a href="#how-it-works-testing">How it works</a>
        <a href="#branches">Branches</a>
        <a href="#faq">FAQ</a>
        <a href="#booking">Book Service</a>
      </nav>


      <a className="btn btn-gold nav-cta" href="#booking">Get Free Gold Valuation <span aria-hidden="true">→</span></a>
    </div>
  </header>

  <main>
    <section className="hero section-shell" id="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <div className="eyebrow">Gold buyers in Bangalore &amp; Chennai</div>
          <h1 id="hero-title">Your Gold Deserves<br /><span>Its True Value.</span></h1>
          <p className="hero-lead">Sell your gold with confidence at Aryan Gold Buyers. Get your gold evaluated in front of you using advanced, non-destructive testing technology — without scratching, cutting or damaging your ornaments.</p>

          <div className="hero-actions">
            <a className="btn btn-gold btn-lg" href="#booking">Get Free Gold Valuation <span aria-hidden="true">→</span></a>
            <a className="btn btn-outline btn-lg" href="#branches"><span aria-hidden="true">⌖</span> Find Nearest Branch</a>
          </div>

          <div className="trust-row" aria-label="Our service benefits">
            <div><HeroBenefitIcon type="diamond" /><span>Non-Destructive<br />Testing</span></div>
            <div><HeroBenefitIcon type="shield" /><span>Transparent<br />Evaluation</span></div>
            <div><HeroBenefitIcon type="chart" /><span>Competitive<br />Gold Rate</span></div>
            <div><HeroBenefitIcon type="payment" /><span>Quick<br />Payment</span></div>
          </div>
        </div>

        <p className="hero-motto">Trust today<br />Brighter<br />tomorrows</p>
      </div>
    </section>

    <section className="rate-strip" id="rates">
      <div className="container rate-grid">
        <div className="rate-intro">
          <h2>{live ? "Today’s Gold Rate" : "Indicative Gold Rate"}</h2>
          <p>Know the market before you sell.</p>
        </div>
        <div className="rate-values">
          {[24, 22, 18].map((karat) => (
            <div className="rate-card" key={karat}>
              <span>{karat}K Gold</span>
              <strong id={`rate-${karat}`}>{rupees.format(rates[karat])}</strong>
              <small>per gram</small>
            </div>
          ))}
        </div>
        <a className="rate-calculator" href="#calculator">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="4" width="30" height="40" rx="3"/><path d="M15 11h18v8H15zM16 26h2m6 0h2m6 0h1M16 33h2m6 0h2m6 0h1"/></svg>
          <span>Calculate Your<br />Gold Value</span>
          <span className="rate-arrow" aria-hidden="true">→</span>
        </a>
        <div className="rate-meta">
          <span><b>Note:</b> Online rates are indicative. Final purchase value is determined after physical evaluation and verification.</span>
          <span id="rate-status">{rateStatus}</span>
          <button id="refresh-rates" disabled={loading} onClick={() => fetchRates()} className="text-button" type="button">Refresh rates</button>
        </div>
      </div>
    </section>

    <section className="gold-calc-section" id="calculator" aria-labelledby="gold-calc-title">
      <div className="container gold-calc-inner">
        <div className="gold-calc-content">
          <div className="gold-calc-intro reveal">
            <h2 id="gold-calc-title">What Could Your<br /><span>Gold Be Worth?</span></h2>
            <p>Get an indicative estimate before visiting us.</p>
          </div>
          <div className="gold-calc-panel reveal delay-1">
            <label className="gold-calc-label" htmlFor="gold-weight">Enter Gold Weight</label>
            <div className="gold-calc-weight"><input id="gold-weight" type="number" min="0" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} inputMode="decimal" /><span>grams</span></div>
            <span className="gold-calc-label">Select Purity</span>
            <div className="gold-calc-purities" role="group" aria-label="Gold purity">
              {[24, 22, 20, 18].map((karat) => <button key={karat} type="button" aria-pressed={purity === karat} onClick={() => setPurity(karat)}>{karat}K</button>)}
            </div>
            <div className="gold-calc-rate"><span>{live && purity !== 20 ? "Current" : "Indicative"} {purity}K Gold Rate</span><strong>{rupees.format(selectedRate)} <small>/ gram</small></strong>{purity === 20 && <small>20K rate estimated from the 24K reference.</small>}</div>
            <div className="gold-calc-value"><span>Estimated Metal Value</span><AnimatedAmount value={weightNumber * selectedRate} /></div>
            <a className="gold-calc-button" href="#booking">Get Exact Valuation <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
      <p className="gold-calc-note">Calculator values are indicative estimates. Final purchase value requires physical evaluation.</p>
    </section>

    <section className="section why-section" id="why-aryan" aria-labelledby="why-aryan-title">
      <div className="container why-shell">
        <div className="why-layout">
          <div className="why-intro reveal">
            <span className="kicker">Why choose Aryan Gold Buyers?</span>
            <h2 id="why-aryan-title">A Better Way<br />to Sell Your <span>Gold.</span></h2>
            <p>At Aryan Gold Buyers, we combine advanced technology, transparent evaluation and professional service to give you a clear and confident experience.</p>
          </div>
          <div className="why-features">
            <article className="why-feature reveal"><span className="why-feature-icon tone-teal"><HeroBenefitIcon type="diamond" /></span><h3>Non-Destructive<br />Testing</h3><p>Advanced technology designed to evaluate gold without scratching or cutting.</p></article>
            <article className="why-feature reveal delay-1"><span className="why-feature-icon tone-gold"><HeroBenefitIcon type="shield" /></span><h3>Transparent<br />Evaluation</h3><p>See and understand how your gold is evaluated.</p></article>
            <article className="why-feature reveal delay-2"><span className="why-feature-icon tone-red"><HeroBenefitIcon type="chart" /></span><h3>Competitive<br />Gold Rate</h3><p>Highly competitive buying prices based on verified purity and weight.</p></article>
            <article className="why-feature reveal delay-3"><span className="why-feature-icon tone-gold"><HeroBenefitIcon type="coins" /></span><h3>Clear Service<br />Charges</h3><p>Applicable charges are explained before you decide.</p></article>
            <article className="why-feature reveal"><span className="why-feature-icon tone-red"><HeroBenefitIcon type="payment" /></span><h3>Quick<br />Payment</h3><p>Fast settlement after verification and completion of formalities.</p></article>
            <article className="why-feature reveal delay-1"><span className="why-feature-icon tone-teal"><HeroBenefitIcon type="support" /></span><h3>Dedicated<br />Support</h3><p>Our customer team is here to answer your questions and guide you at every step.</p></article>
          </div>
        </div>
      </div>
    </section>

    <section className="section services-section" id="services" aria-labelledby="services-title">
      <div className="container services-shell">
        <div className="services-heading reveal">
          <span className="kicker">What can we help you with?</span>
          <h2 id="services-title">Our Services</h2>
        </div>
        <div className="services-layout">
          <article className="service-offer service-sell reveal">
            <div className="offer-image"><Image src="/service-sell-gold.webp" alt="Ornate gold necklace and earrings on emerald velvet" fill sizes="(max-width: 700px) 100vw, (max-width: 1200px) 35vw, 20vw" /></div>
            <div className="offer-content">
              <span className="offer-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="24" r="17"/><path d="M17 15h15M17 21h15M19 15c10 0 10 10 0 10l12 10"/></svg></span>
              <h3>Sell Gold</h3>
              <p>Sell your old, unused or unwanted gold with a clear and transparent evaluation process.</p>
              <a className="offer-button" href="#booking">Get Gold Valuation <span aria-hidden="true">→</span></a>
            </div>
          </article>
          <article className="service-offer service-pledged reveal delay-1">
            <div className="offer-image"><Image src="/service-pledged-gold.webp" alt="Gold necklace on a jewelry case beside a loan document" fill sizes="(max-width: 700px) 100vw, (max-width: 1200px) 35vw, 22vw" /></div>
            <div className="offer-content">
              <span className="offer-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17 24 6l19 11H5ZM8 39h32M11 20v16m8-16v16m10-16v16m8-16v16M5 43h38"/></svg></span>
              <h3>Release Pledged Gold</h3>
              <p>Gold pledged with a bank or NBFC? We can assist you in releasing eligible pledged gold and help you understand the settlement.</p>
              <a className="offer-button" href="#booking">Get Pledged Gold Assistance <span aria-hidden="true">→</span></a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section className="section buy-section" id="what-we-buy" aria-labelledby="buy-title">
      <div className="container buy-shell">
        <div className="buy-intro reveal">
          <span className="kicker">What we buy</span>
          <h2 id="buy-title">We Buy More Than<br /><span>Just Gold Jewellery.</span></h2>
          <p>Bring your eligible gold and silver items for a transparent evaluation at Aryan Gold Buyers.</p>
        </div>
        <div className="buy-grid">
          {BUY_ITEMS.map((item, index) => (
            <article className="buy-card reveal" key={item.title} style={{transitionDelay: `${Math.min(index, 3) * 70}ms`}}>
              <div className="buy-card-image"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 650px) 47vw, (max-width: 1200px) 31vw, 16vw" /></div>
              <div className="buy-card-copy"><h3>{item.title}</h3><span aria-hidden="true" /><p>{item.description}</p></div>
            </article>
          ))}
        </div>
        <a className="buy-cta" href="#booking">Check What We Buy <span aria-hidden="true">→</span></a>
      </div>
    </section>

    <section className="testing-section" id="testing" aria-labelledby="testing-title">
      <div className="testing-main">
        <div className="container testing-main-inner">
          <div className="testing-copy reveal">
            <span className="testing-kicker">Non-Destructive Testing</span>
            <h2 id="testing-title">Your Jewellery<br />Should Be Tested.<br /><span>Not Damaged.</span></h2>
            <p>We use advanced non-destructive testing technology designed to analyse your gold’s purity without scratching, cutting or causing any damage.</p>
            <div className="testing-benefits">
              {TESTING_BENEFITS.map((benefit) => (
                <article className="testing-benefit" key={benefit.title}>
                  <span className={`testing-benefit-icon ${benefit.tone}`}><TestingIcon type={benefit.icon} /></span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="testing-process" id="how-it-works-testing">
        <div className="container testing-process-inner">
          <div className="testing-steps-panel reveal">
            <div className="testing-steps-heading"><span className="testing-kicker">How It Works</span><h3>Gold Testing in 4 Simple Steps</h3></div>
            <ol className="testing-steps-list">
              {TESTING_STEPS.map((step) => (
                <li key={step.title}><span className="testing-step-icon"><TestingIcon type={step.icon} /></span><h4>{step.title}</h4><p>{step.description}</p></li>
              ))}
            </ol>
          </div>
          <aside className="testing-safe-card reveal delay-1">
            <span className="testing-safe-icon"><TestingIcon type="shield" /></span>
            <div><h3>100% Safe for<br />Your Jewellery</h3><p>Your gold remains exactly as it is. No cuts, no scratches, no damage — only accurate purity testing.</p></div>
          </aside>
        </div>
      </div>
    </section>

    <section className="valuation-section" id="transparent-valuation" aria-labelledby="valuation-title">
      <div className="valuation-overview">
        <div className="container valuation-overview-inner">
          <div className="valuation-heading reveal">
            <span className="valuation-kicker">Transparent Valuation</span>
            <h2 id="valuation-title">See How Your<br /><span>Gold’s Value</span><br />Is Calculated.</h2>
            <p>We weigh, test and value your gold in front of you with complete transparency, so you know exactly what you are getting.</p>
          </div>
          <div className="valuation-factors reveal delay-1">
            {VALUATION_FACTORS.map((factor) => (
              <div className="valuation-factor" key={factor.title}>
                <span className="valuation-factor-icon"><ValuationIcon type={factor.icon} /></span>
                <div><h3>{factor.title}</h3><p>{factor.description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container valuation-cards">
        {VALUATION_STEPS.map((step, index) => (
          <article className="valuation-card reveal" key={step.title} style={{transitionDelay: `${Math.min(index, 3) * 70}ms`}}>
            <div className="valuation-card-image">
              <Image src={step.image} alt={step.alt} fill sizes="(max-width: 700px) 90vw, (max-width: 1050px) 45vw, 24vw" />
              <span className="valuation-step-number">{index + 1}</span>
              {step.liveRate && <div className="valuation-live-rate"><span>Today’s 24K Gold Rate</span><strong>{rupees.format(rates[24])}</strong><small>per gram</small></div>}
            </div>
            <div className="valuation-card-copy"><h3>{step.title}</h3><p>{step.description}</p></div>
          </article>
        ))}
      </div>
    </section>

    <BranchLocations />
    <PaymentSection />
    <ExperienceSection />
    <StorySection />
    <FaqSection />

    <section className="booking-section booking-refresh" id="booking">
      <div className="container booking-grid">
        <div className="booking-copy reveal">
          <span className="kicker light">BOOK A FREE VALUATION</span>
          <h2>Branch visit or doorstep service—your choice.</h2>
          <p>Share a few details. The Aryan Gold team can confirm service availability and your appointment.</p>
          <div className="booking-note"><span>✓</span><div><strong>No obligation</strong><small>Getting a valuation does not require you to sell.</small></div></div>
          <div className="booking-note"><span>✓</span><div><strong>Your privacy matters</strong><small>Use only the details needed to arrange your appointment.</small></div></div>
        </div>

        <form className="form-card reveal delay-1" id="booking-form" onSubmit={(event) => submitContact(event, "booking")}>
          <div className="booking-form-intro">
            <div>
              <span className="booking-form-kicker">YOUR APPOINTMENT</span>
              <h3>Let&apos;s plan your visit.</h3>
              <p>Choose a service and a time that works for you.</p>
            </div>
            <span className="booking-form-badge">Free valuation</span>
          </div>
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

  </main>

  <footer>
    <div className="container footer-grid">
      <div className="footer-brand">
        <Brand href="#home" className="brand footer-wordmark" />
        <p>Transparent gold buying, pledged-gold assistance and convenient valuation services.</p>
      </div>
      <div><h4>Services</h4><a href="#services">Sell Gold</a><a href="#booking">Release Pledged Gold</a><a href="#calculator">Gold Calculator</a><a href="#booking">Book Valuation</a></div>
      <div><h4>Quick Links</h4><a href="#rates">Gold Rate</a><a href="#branches">Our Branches</a><a href="#how-it-works-testing">How It Works</a><a href="#faq">FAQs</a><a href="#our-story">Our Story</a></div>
      <div><h4>Important</h4><p className="footer-small">Rates shown online are indicative. Final value is confirmed after physical evaluation and applicable compliance checks.</p></div>
    </div>
    <div className="container footer-bottom"><span>© <span id="year">{new Date().getFullYear()}</span> Aryan Gold. All rights reserved.</span></div>
  </footer>

  <div className="floating-actions" aria-label="Quick actions">
    <a href="#booking" className="float-btn gold" aria-label="Book valuation">₹</a>
  </div>
  {toast && <div className="contact-toast" role="status" aria-live="polite"><span>✓</span><p>{toast}</p><button type="button" onClick={() => setToast("")} aria-label="Close notification">×</button></div>}
    </div>
  );
}
