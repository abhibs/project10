"use client";
import { publishedRateStatus } from "@/lib/rate-freshness.mjs";

import { useEffect, useState } from "react";
import GoldCalculator from "../GoldCalculator";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { validateRates } from "@/lib/rate-values";

const FALLBACK_RATES = {24: 14250, 22: 13062, 18: 10688};

export default function CalculatorPage() {
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [status, setStatus] = useState("Published rates are loading; demo estimates shown until available.");
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
        const publication = publishedRateStatus(data.updatedAt);
        setLive(publication.fresh);
        setStatus(publication.label);
      } catch {
        if (disposed || controller !== request) return;
        setRates(FALLBACK_RATES);
        setLive(false);
        setStatus("Published rates unavailable; demo estimates shown. Confirm with the branch.");
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
      <main><p role="status">{status}</p><GoldCalculator rates={rates} live={live} standalone /></main>
      <SiteFooter />
    </div>
  );
}
