"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function RateForm() {
  const [rates, setRates] = useState({ 24: "", 22: "", 18: "" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/admin/rates", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        if (data.rate) { setRates(data.rate.rates); setExists(true); }
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(error.message || "Unable to load rates.");
        setLoadError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [attempt]);

  async function save(event) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/rates", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setExists(true); setMessage(data.message);
    } catch (error) { setError(error.message || "Unable to save rates."); }
    finally { setSaving(false); }
  }

  return <article className={`${styles.modal} ${styles.ratePanel}`}>
    <div className={styles.modalHead}><div><h2>Gold rates</h2><p>Set the price per gram in INR shown on the website.</p></div></div>
    <p className={styles.rateHelp}>The first save creates your rates. Future saves update the same record.</p>
    {loading ? <p role="status">Loading rates…</p> : loadError ? <button type="button" onClick={() => { setLoading(true); setLoadError(false); setError(""); setAttempt(attempt + 1); }}>Retry loading</button> :
      <form onSubmit={save}>
        <fieldset className={styles.rateFields} disabled={saving}>
          {[24, 22, 18].map(karat => <div key={karat}>
            <label htmlFor={`gold-${karat}`}>{karat}K Gold — ₹ per gram</label>
            <input id={`gold-${karat}`} name={`gold${karat}`} type="number" min="0.01" max="99999999.99" step="0.01" required value={rates[karat]} onChange={event => { setRates({ ...rates, [karat]: event.target.value }); setMessage(""); }} />
          </div>)}
        </fieldset>
        <div className={styles.modalActions}><button className={styles.savePassword} type="submit" disabled={saving}>{saving ? "Saving…" : exists ? "Update rates" : "Save rates"}</button></div>
      </form>}
    {error && <p className={styles.passwordError} role="alert">{error}</p>}
    {message && <p className={styles.rateSuccess} role="status">{message}</p>}
  </article>;
}
