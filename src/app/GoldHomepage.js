"use client";
import { publishedRateStatus } from "@/lib/rate-freshness.mjs";


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
import GoldHeroBanner, { HeroBenefitIcon } from "./GoldHeroBanner";
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
const VALUATION_FACTORS = [
  {title: "Weight", description: "See the weight of the old gold you bring to sell.", icon: "scale"},
  {title: "Purity", description: "Understand the purity measured during your gold assessment.", icon: "gem"},
  {title: "Current Gold Rate", description: "Understand the rate used to value your old gold.", icon: "chart"},
  {title: "Your Gold Offer", description: "Review the valuation and any deductions before you sell.", icon: "rupee"},
];

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

export default function GoldHomepage({ initialBranches = [] }) {
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
      const status = publishedRateStatus(data.updatedAt);
      setLive(status.fresh);
      setRateStatus(status.label);
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
      area: fields.area || "",
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
    <GoldHeroBanner valuationHref="#banner-form" branchesHref="#branches" animateCopy>
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
          <label className="banner-field" htmlFor="banner-area"><span>Area</span><input id="banner-area" name="area" autoComplete="address-level3" placeholder="Your area" maxLength={160} required /></label>
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
    </GoldHeroBanner>

    <GoldRateSection rates={rates} live={live} rateStatus={rateStatus} loading={loading} fetchRates={fetchRates} />

    <GoldCalculator rates={rates} live={live} />

    <ServicesSection onDoorstep={() => setServiceMode("Doorstep Service")} />

    <ExperienceSection />


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
    <BranchLocations initialBranches={initialBranches} />
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
            <label className="field"><span>City</span><input name="city" autoComplete="address-level2" maxLength={255} required placeholder="e.g. Bengaluru" /></label>
            <label className="field"><span>Area</span><input name="area" autoComplete="address-level3" maxLength={160} required placeholder="e.g. Jayanagar" /></label>
            <label className="field"><span>Approx. gold weight</span><div className="input-unit"><input name="weight" type="number" min="0.1" step="0.1" placeholder="Optional" /><b>grams</b></div></label>
            <label className="field"><span>Preferred date</span><input name="preferredDate" id="booking-date" min={minimumDate} type="date" required /></label>
            <label className="field"><span>Preferred time</span><select name="preferredTime" required><option value="">Choose a time</option><option value="09:00-12:00">09:00 – 12:00</option><option value="12:00-15:00">12:00 – 15:00</option><option value="15:00-18:00">15:00 – 18:00</option></select></label>
            <label className="field"><span>Service required</span><select name="services" required><option>Sell Gold for Cash</option><option>Release Pledged Gold</option><option>Gold Valuation Only</option><option>Other / Need Guidance</option></select></label>
          </div>
          <label className="consent"><input type="checkbox" required /><span>I agree to be contacted by Aryan Gold regarding this request.</span></label>
          <button className="btn btn-gold btn-block" type="submit" disabled={submitting.booking}><SubmitLabel loading={submitting.booking}>Request Appointment</SubmitLabel></button>
          <p className="form-message" id="booking-message" role="status">{messages.booking}</p>
        </form>
      </div>
    </section>

  </main>

  <SiteFooter homePage />

  <FormToast notification={toast} onClose={closeToast} />
    </div>
  );
}
