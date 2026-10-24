"use client";
import { useEffect, useState } from "react";
import GoldRateSection from "./GoldRateSection";
import GoldCalculator from "./GoldCalculator";
import { validateRates } from "@/lib/rate-values";
const FALLBACK_RATES = {24: 14250, 22: 13062, 18: 10688};
export default function GoldRatePage() {
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let controller;
    let disposed = false;
    async function refresh() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      setLoading(true);
      const timeout = setTimeout(() => request.abort(), 10000);
      try {
        const response = await fetch("/api/rates", {cache: "no-store", signal: request.signal});
        if (!response.ok) throw new Error("Rates unavailable");
        const data = await response.json();
        const values = validateRates(data.rates);
        if (!values) throw new Error("Invalid rates");
        if (disposed || controller !== request) return;
        setRates(values);
        setLive(true);
      } catch {
        if (disposed || controller !== request) return;
        setRates(FALLBACK_RATES);
        setLive(false);
      } finally {
        clearTimeout(timeout);
        if (!disposed && controller === request) setLoading(false);
      }
    }
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => { disposed = true; controller?.abort(); clearInterval(interval); };
  }, [attempt]);
  return (
    <>
      <GoldRateSection standalone rates={rates} live={live} loading={loading}
        rateStatus={loading ? "Loading published gold rates..." : live ? "Published gold rates" : "Published rates unavailable - showing demo fallback rates"}
        fetchRates={() => setAttempt(value => value + 1)} />
      <GoldCalculator rates={rates} live={live} bookingHref="/#booking" />
    </>
  );
}
