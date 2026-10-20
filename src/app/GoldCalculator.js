"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const rupees = new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 0});

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

export default function GoldCalculator({ rate, live = false, standalone = false, bookingHref = standalone ? "/#booking" : "#booking" }) {
  const [weight, setWeight] = useState("10");
  const weightNumber = Math.max(0, Number(weight) || 0);
  const Heading = standalone ? "h1" : "h2";

  return (
    <section className="gold-calc-section" id="calculator" aria-labelledby="gold-calc-title">
      <div className="gold-calc-inner">
        <div className="gold-calc-image">
          <Image src="/buy-gold-bars.webp" alt="Gold bars stacked on deep green velvet" fill priority={standalone} sizes="(max-width: 760px) 100vw, 50vw" />
        </div>
        <div className="gold-calc-content">
          <div className="gold-calc-intro reveal">
            <Heading id="gold-calc-title">What Could Your<br /><span>Gold Be Worth?</span></Heading>
            <p>Get an indicative estimate before visiting us.</p>
          </div>
          <div className="gold-calc-panel reveal delay-1">
            <label className="gold-calc-label" htmlFor="gold-weight">Enter Gold Weight</label>
            <div className="gold-calc-weight"><input id="gold-weight" type="number" min="0" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} inputMode="decimal" /><span>grams</span></div>
            <div className="gold-calc-rate"><span>{live ? "Current" : "Indicative"} 24K Gold Rate</span><strong>{rupees.format(rate)} <small>/ gram</small></strong></div>
            <div className="gold-calc-value"><span>Estimated Metal Value</span><AnimatedAmount value={weightNumber * rate} /></div>
            <a className="gold-calc-button" href={bookingHref}>Get Exact Valuation <span aria-hidden="true">→</span></a>
            <p className="gold-calc-note"><b>* Calculator values are indicative estimates. Final purchase value requires physical evaluation.*</b></p>
          </div>
        </div>
      </div>
    </section>
  );
}
