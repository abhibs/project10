"use client";
import { useEffect, useState } from "react";
import GoldRateSection from "./GoldRateSection";
export default function GoldRatePage() {
  const [rate, setRate] = useState(14250);
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
        const value = Number(data.rates?.[24]);
        if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid rate");
        if (disposed || controller !== request) return;
        setRate(value);
        setLive(true);
      } catch {
        if (disposed || controller !== request) return;
        setRate(14250);
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
  return <GoldRateSection standalone rates={{24: rate}} live={live} loading={loading}
    rateStatus={loading ? "Loading published gold rates..." : live ? "Published gold rates" : "Published rates unavailable - showing demo fallback rates"}
    fetchRates={() => setAttempt(value => value + 1)} />;
}
