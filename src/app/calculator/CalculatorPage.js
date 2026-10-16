"use client";

import { useEffect, useState } from "react";
import GoldCalculator from "../GoldCalculator";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";

const FALLBACK_RATE = 14250;

export default function CalculatorPage() {
  const [rate, setRate] = useState(FALLBACK_RATE);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let controller;
    let disposed = false;
    async function refreshRate() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      const timeout = setTimeout(() => request.abort(), 10000);
      try {
        const response = await fetch("/api/rates", { cache: "no-store", signal: request.signal });
        if (!response.ok) throw new Error("Rates unavailable");
        const data = await response.json();
        const nextRate = Number(data.rates?.[24]);
        if (!Number.isFinite(nextRate) || nextRate <= 0) throw new Error("Invalid rate");
        if (disposed || controller !== request) return;
        setRate(nextRate);
        setLive(true);
      } catch {
        if (disposed || controller !== request) return;
        setRate(FALLBACK_RATE);
        setLive(false);
      } finally {
        clearTimeout(timeout);
      }
    }
    refreshRate();
    const interval = setInterval(refreshRate, 60000);
    return () => {
      disposed = true;
      controller?.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="aryan-home" data-theme="light">
      <SiteHeader calculatorPage />
      <main><GoldCalculator rate={rate} live={live} standalone /></main>
      <SiteFooter />
    </div>
  );
}
