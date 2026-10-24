"use client";

import { useEffect, useState } from "react";
import GoldCalculator from "../GoldCalculator";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { validateRates } from "@/lib/rate-values";

const FALLBACK_RATES = {24: 14250, 22: 13062, 18: 10688};

export default function CalculatorPage() {
  const [rates, setRates] = useState(FALLBACK_RATES);
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
        const nextRates = validateRates(data.rates);
        if (!nextRates) throw new Error("Invalid rates");
        if (disposed || controller !== request) return;
        setRates(nextRates);
        setLive(true);
      } catch {
        if (disposed || controller !== request) return;
        setRates(FALLBACK_RATES);
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
      <main><GoldCalculator rates={rates} live={live} standalone /></main>
      <SiteFooter />
    </div>
  );
}
