"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const INITIAL_FILTERS = { fromDate: "", toDate: "", businessType: "" };

function displayDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function displayTime(value) {
  if (!value) return "—";

  return value.split("-").map((part) => {
    const [hours, minutes] = part.trim().split(":").map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return part;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  }).join(" – ");
}

export default function ContactsTable() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });

    fetch(`/api/admin/contacts?${query}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load contacts.");
        return data;
      })
      .then((data) => setContacts(data.contacts))
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message || "Unable to load contacts.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [appliedFilters, requestVersion]);

  function applyFilters(event) {
    event.preventDefault();
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
      setError("From date cannot be after to date.");
      return;
    }
    setLoading(true);
    setError("");
    setAppliedFilters({ ...filters });
    setRequestVersion((version) => version + 1);
  }

  function clearFilters() {
    setLoading(true);
    setError("");
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setRequestVersion((version) => version + 1);
  }

  return (
    <article className={styles.contactsPanel}>
      <div className={styles.panelHeading}>
        <div><h2>Contact requests</h2><p>Branch visits, doorstep requests, quick contacts and contact page enquiries.</p></div>
        <span className={styles.resultCount}>{loading ? "…" : contacts.length} records</span>
      </div>

      <form className={styles.filters} onSubmit={applyFilters}>
        <label><span>From date</span><input type="date" value={filters.fromDate} onChange={(event) => setFilters({...filters, fromDate: event.target.value})} /></label>
        <label><span>To date</span><input type="date" min={filters.fromDate || undefined} value={filters.toDate} onChange={(event) => setFilters({...filters, toDate: event.target.value})} /></label>
        <label><span>Form type</span><select value={filters.businessType} onChange={(event) => setFilters({...filters, businessType: event.target.value})}><option value="">All form types</option><option>Branch Visit</option><option>Doorstep Service</option><option>Quick Contact</option><option>Contact Page</option></select></label>
        <div className={styles.filterActions}><button className={styles.filterButton} type="submit">Filter</button><button type="button" onClick={clearFilters}>Clear</button></div>
      </form>

      {error && <p className={styles.tableError} role="alert">{error}</p>}
      <div className={styles.tableWrap}>
        <table className={styles.contactsTable}>
          <thead><tr><th>#</th><th>Date</th><th>Time</th><th>Form type</th><th>Name</th><th>Mobile</th><th>City</th><th>Weight</th><th>Preferred date</th><th>Preferred time</th><th>Service / Help with</th></tr></thead>
          <tbody>
            {loading ? <tr><td className={styles.tableStatus} colSpan="11">Loading contact requests…</td></tr> : contacts.length === 0 ? <tr><td className={styles.tableStatus} colSpan="11">No contact requests found.</td></tr> : contacts.map((contact, index) => (
              <tr key={contact.id}>
                <td>{index + 1}</td>
                <td className={styles.noWrap}>{displayDate(contact.submittedDate)}</td>
                <td className={styles.noWrap}>{displayTime(contact.submittedTime)}</td>
                <td><span className={`${styles.typeBadge} ${["Quick Contact", "Contact Page"].includes(contact.businessType) ? styles.quickBadge : ""}`}>{contact.businessType}</span></td>
                <td>{contact.name}</td><td className={styles.noWrap}>{contact.mobile}</td><td>{contact.city || "—"}</td>
                <td className={styles.noWrap}>{contact.weight ? `${contact.weight} g` : "—"}</td><td className={styles.noWrap}>{displayDate(contact.preferredDate)}</td><td className={styles.noWrap}>{displayTime(contact.preferredTime)}</td><td>{contact.services}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
