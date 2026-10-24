"use client";

import { getContactAttribution } from "@/lib/contact-attribution.mjs";

import FormToast from "./FormToast";
import SubmitLabel from "./SubmitLabel";
import { submitContactRequest } from "@/lib/submit-contact.mjs";

import ServicesSection from "./ServicesSection";
import GoldRateSection from "./GoldRateSection";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import BranchLocations from "./BranchLocations";
import PaymentSection from "./PaymentSection";
import ExperienceSection from "./ExperienceSection";
import StorySection from "./StorySection";
import FaqSection from "./FaqSection";
import GoldCalculator from "./GoldCalculator";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const FALLBACK_RATES = {24: 14250, 22: 13062, 18: 10688};
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
const VALUATION_FACTORS = [
  {title: "Weight", description: "See the weight of the old gold you bring to sell.", icon: "scale"},
  {title: "Purity", description: "Understand the purity measured during your gold assessment.", icon: "gem"},
  {title: "Current Gold Rate", description: "Understand the rate used to value your old gold.", icon: "chart"},
  {title: "Your Gold Offer", description: "Review the valuation and any deductions before you sell.", icon: "rupee"},
];

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
  const submitLock = useRef({booking: false, contact: false, banner: false});
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [serviceMode, setServiceMode] = useState("Branch Visit");
  const [messages, setMessages] = useState({booking: "", contact: "", banner: ""});
  const [submitting, setSubmitting] = useState({booking: false, contact: false, banner: false});
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [minimumDate, setMinimumDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const [rateStatus, setRateStatus] = useState("Loading published gold rates…");

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
      ...getContactAttribution(),
      name: fields.name,
      mobile: fields.mobile,
      city: appointment ? fields.city : "",
      weight: appointment || kind === "banner" ? fields.weight : "",
      preferredDate: appointment ? fields.preferredDate : "",
      preferredTime: appointment ? fields.preferredTime : "",
      services: fields.services,
      businessType: appointment ? serviceMode : kind === "banner" ? "Banner Form" : "Quick Contact",
    };

    setMessages((previous) => ({...previous, [kind]: ""}));
    setSubmitting((previous) => ({...previous, [kind]: true}));
    try {
      const data = await submitContactRequest(payload);

      setMessages((previous) => ({...previous, [kind]: data.message}));
      setToast({ message: data.message, error: false });
      form.reset();
      if (kind === "booking") setServiceMode("Branch Visit");
    } catch (error) {
      setToast({ message: error.message || "Unable to submit your request. Please try again.", error: true });
      setMessages((previous) => ({...previous, [kind]: error.message || "Unable to submit your request. Please try again."}));
    } finally {
      submitLock.current[kind] = false;
      setSubmitting((previous) => ({...previous, [kind]: false}));
    }
  }

  return (
    <div className="aryan-home" data-theme="light" ref={root}>
  <SiteHeader progressRef={scrollProgress} />

  <main>
    <section className="hero section-shell" id="hero" aria-labelledby="hero-title">
      <div className="hero-gold-flow" aria-hidden="true">
        <Image className="hero-gold-pile" src="/hero-gold-cutout.webp" alt="" width={600} height={400} sizes="40vw" />
        <div className="hero-gold-right">
          <Image src="/buy-gold-jewellery.webp" alt="" width={1254} height={1254} sizes="(max-width: 1200px) 440px, 42vw" />
        </div>
      </div>
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <div className="eyebrow">Gold buyers in Bangalore &amp; Chennai</div>
          <h1 id="hero-title">Your Gold Deserves<br /><span>Its True Value.</span></h1>
          <p className="hero-lead">Sell your gold with confidence at Aryan Gold Buyers. Get your gold evaluated in front of you using advanced, non-destructive testing technology — without scratching, cutting or damaging your ornaments.</p>

          <div className="hero-actions">
            <a className="btn btn-gold btn-lg" href="#banner-form">Get Free Gold Valuation <span aria-hidden="true">→</span></a>
            <a className="btn btn-outline btn-lg" href="#branches"><span aria-hidden="true">⌖</span> Find Nearest Branch</a>
          </div>

          <div className="trust-row" aria-label="Our service benefits">
            <div><HeroBenefitIcon type="diamond" /><span>Non-Destructive<br />Testing</span></div>
            <div><HeroBenefitIcon type="shield" /><span>Transparent<br />Evaluation</span></div>
            <div><HeroBenefitIcon type="chart" /><span>Competitive<br />Gold Rate</span></div>
            <div><HeroBenefitIcon type="payment" /><span>Quick<br />Payment</span></div>
          </div>
        </div>



        <div className="hero-siddhi">
          <svg className="hero-mandala" viewBox="0 0 600 600" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">
            <defs>
              <g id="hero-mandala-petal">
                <path d="M300 272C258 236 260 182 300 144C340 182 342 236 300 272Z" />
                <path d="M300 154C246 112 267 56 300 24C333 56 354 112 300 154Z" />
                <path d="M300 147C275 112 281 76 300 50C319 76 325 112 300 147Z" />
                <path d="M288 48L300 9L312 48" />
                <circle cx="300" cy="126" r="5" />
              </g>
            </defs>
            <g strokeWidth="1.3">
              {Array.from({ length: 24 }, (_, index) => <use key={index} href="#hero-mandala-petal" transform={`rotate(${index * 15} 300 300)`} />)}
              <circle cx="300" cy="300" r="58" />
              <circle cx="300" cy="300" r="150" />
              <circle cx="300" cy="300" r="158" />
              <circle cx="300" cy="300" r="270" />
              <circle cx="300" cy="300" r="280" strokeDasharray="2 7" />
            </g>
          </svg>
          <Image src="/siddhi-banner.png" alt="Siddhi welcoming you to Aryan Gold" width={1087} height={1446} sizes="(max-width: 1200px) 80vw, 32vw" preload />
        </div>

        <form className="banner-form" id="banner-form" aria-labelledby="banner-form-title" aria-busy={submitting.banner} onSubmit={(event) => submitContact(event, "banner")}>
          <span className="banner-form-kicker">FREE GOLD VALUATION</span>
          <h2 id="banner-form-title">Know your gold’s worth.</h2>
          <p className="banner-form-intro">Share your details and we’ll call you back.</p>
          <label className="banner-field" htmlFor="banner-name">
            <span>Name</span>
            <input id="banner-name" name="name" autoComplete="name" placeholder="Your full name" minLength={2} maxLength={255} onInput={keepNameCharacters} required />
          </label>
          <label className="banner-field" htmlFor="banner-phone">
            <span>Phone number</span>
            <input id="banner-phone" name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" pattern="[0-9]{10}" maxLength={10} title="Enter a 10-digit mobile number" onInput={keepTenDigits} required />
          </label>
          <label className="banner-field" htmlFor="banner-weight">
            <span>Gold weight <small>(grams)</small></span>
            <input id="banner-weight" name="weight" type="number" inputMode="decimal" placeholder="Approx. weight in grams" min="0.01" max="100000" step="0.01" required />
          </label>
          <label className="banner-consent" htmlFor="banner-consent">
            <input id="banner-consent" name="consent" type="checkbox" defaultChecked required />
            <span>I authorise Aryan Gold to contact me.</span>
          </label>
          <button className="banner-submit" type="submit" disabled={submitting.banner}><SubmitLabel loading={submitting.banner}>Get Free Valuation</SubmitLabel><span aria-hidden="true">→</span></button>
          <p className="banner-form-note">Free valuation. No obligation to sell.</p>
          <p className="banner-form-message" role="status" aria-live="polite">{messages.banner}</p>
        </form>
      </div>
    </section>

    <GoldRateSection rates={rates} live={live} rateStatus={rateStatus} loading={loading} fetchRates={fetchRates} />

    <GoldCalculator rates={rates} live={live} />

    <ServicesSection onDoorstep={() => setServiceMode("Doorstep Service")} />

    <ExperienceSection />

    <section className="testing-section" id="testing" aria-labelledby="testing-title">
      <div className="testing-main">
        <div className="container testing-main-inner">
          <div className="testing-image">
            <Image src="/gold-testing-omio-scene.webp" alt="Gold jewellery being examined beside a testing machine" width={1672} height={941} sizes="(max-width: 1100px) 100vw, 52vw" />
          </div>
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
            <article className="why-feature reveal delay-1"><span className="why-feature-icon tone-red"><HeroBenefitIcon type="shield" /></span><h3>Transparent<br />Evaluation</h3><p>See and understand how your gold is evaluated.</p></article>
            <article className="why-feature reveal delay-2"><span className="why-feature-icon tone-teal"><HeroBenefitIcon type="chart" /></span><h3>Competitive<br />Gold Rate</h3><p>Highly competitive buying prices based on verified purity and weight.</p></article>
            <article className="why-feature reveal"><span className="why-feature-icon tone-red"><HeroBenefitIcon type="payment" /></span><h3>Quick<br />Payment</h3><p>Fast settlement after verification and completion of formalities.</p></article>
            <article className="why-feature reveal delay-1"><span className="why-feature-icon tone-teal"><HeroBenefitIcon type="support" /></span><h3>Dedicated<br />Support</h3><p>Our customer team is here to answer your questions and guide you at every step.</p></article>
          </div>
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
      </div>
    </section>

    <section className="valuation-section" id="transparent-valuation" aria-labelledby="valuation-title">
      <div className="valuation-overview">
        <div className="container valuation-overview-inner">
          <div className="valuation-heading reveal">
            <span className="valuation-kicker">Transparent Gold Pricing</span>
            <h2 id="valuation-title">Know What Your<br /><span>Old Gold</span><br />Is Worth.</h2>
            <p>Understand your old gold’s weight, tested purity and applicable rate. Review the offer and any deductions before deciding to sell.</p>
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
    </section>

    <PaymentSection />
    <BranchLocations />
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

        <form className="form-card reveal delay-1" id="booking-form" aria-busy={submitting.booking} onSubmit={(event) => submitContact(event, "booking")}>
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
          <button className="btn btn-gold btn-block" type="submit" disabled={submitting.booking}><SubmitLabel loading={submitting.booking}>Request Appointment</SubmitLabel></button>
          <p className="form-message" id="booking-message" role="status">{messages.booking}</p>
        </form>
      </div>
    </section>

  </main>

  <SiteFooter homePage />

  <div className="floating-actions" aria-label="Quick actions">
    <a href="#booking" className="float-btn gold" aria-label="Book valuation">₹</a>
  </div>
  <FormToast notification={toast} onClose={closeToast} />
    </div>
  );
}
