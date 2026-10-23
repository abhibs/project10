"use client";

import { useEffect, useRef, useState } from "react";
import { resolveContactFilters } from "@/lib/contact-filters.mjs";
import { CONTACT_FORM_TYPES, GOOGLE_LEAD_TYPE, getContactFormLabel } from "@/lib/contact-summary.mjs";
import styles from "./page.module.css";

function displayService(contact) {
  return ["Banner Form", "Sell Gold", "Release Pledged Gold"].includes(contact.businessType) ? "—" : contact.services || "—";
}

function ContactDetails({ contact }) {
  const dialog = useRef(null);
  const [message, setMessage] = useState("");
  const standard = [
    ["GCLID", contact.gclid], ["UTM source", contact.utmSource], ["UTM campaign", contact.utmCampaign],
    ["Keyword", contact.keyword], ["Ad group ID", contact.adgroupId],
  ];
  const standardKeys = new Set(["gclid", "utm_source", "utm_campaign", "keyword", "utm_term", "adgroup_id", "adgroupid"]);
  const extra = Object.entries(contact.trackingData || {}).filter(([key]) => !standardKeys.has(key)).map(([key, value]) => [key, value]);
  const context = [["Landing page", contact.landingPage], ["Referrer", contact.referrer]];
  const rows = [
    ["Date", displayDate(contact.submittedDate)],
    ["Time (IST)", displayTime(contact.submittedTime)],
    ["Form type", getContactFormLabel(contact.businessType)],
    ["Name", contact.name], ["Mobile", contact.mobile], ["City", contact.city],
    ["Weight", contact.weight ? `${contact.weight} g` : "-"],
    ["Release bank", contact.releaseBank], ["Release place", contact.releasePlace],
    ["Preferred date", displayDate(contact.preferredDate)],
    ["Preferred time", displayTime(contact.preferredTime)],
    ["Service / Help with", displayService(contact)],
    ...standard, ...extra, ...context,
    ["Status", contact.status === "active" ? "Completed" : "Pending"],
    ["Comment", contact.comment],
  ].map(([label, value]) => [label,
    value == null || value === "" ? "-" : typeof value === "object" ? JSON.stringify(value) : String(value),
  ]);

  async function copyDetails() {
    try {
      await navigator.clipboard.writeText(rows.map(([label, value]) => `${label}: ${value}`).join("\n"));
      setMessage("Contact details copied.");
    } catch { setMessage("Unable to copy. Select the value and copy it manually."); }
  }

  return <>
    <button type="button" className={styles.gclidButton} aria-haspopup="dialog" aria-label={`View details for ${contact.name}`} onClick={() => { setMessage(""); dialog.current.showModal(); }}>View details</button>
    <dialog ref={dialog} className={styles.gclidDialog} aria-labelledby={`attribution-title-${contact.id}`} onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className={styles.gclidContent}>
        <div className={styles.modalHead}><div><h2 id={`attribution-title-${contact.id}`}>Contact details</h2><p>{contact.name} · {contact.mobile}</p></div><button type="button" aria-label="Close contact details" onClick={() => dialog.current.close()}>×</button></div>
        <table className={styles.detailsTable}>
          <caption className={styles.detailsCaption}>Details for {contact.name}</caption>
          <thead><tr><th scope="col">Field</th><th scope="col">Value</th></tr></thead>
          <tbody>{rows.map(([label, value], index) => <tr key={index}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody>
        </table>
        <p className={styles.exportStatus} role="status">{message}</p>
        <div className={styles.modalActions}><button type="button" onClick={copyDetails}>Copy details</button><button type="button" onClick={() => dialog.current.close()}>Close</button></div>
      </div>
    </dialog>
  </>;
}

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
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }).join(" – ");
}

function ContactControls({ contact, onSaved }) {
  const [draft, setDraft] = useState(contact.comment || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const active = contact.status === "active";

  async function save(changes) {
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/contacts", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(contact.id), ...changes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save changes.");
      onSaved(contact.id, data.changes);
      if (changes.comment !== undefined) setDraft(data.changes.comment);
      setMessage("Saved.");
    } catch (error) { setMessage(error.message || "Unable to save changes."); }
    finally { lock.current = false; setSaving(false); }
  }

  return <>
    <td>
      <label className={styles.completionCheckbox}>
        <input type="checkbox" checked={active} aria-label={`Completed for ${contact.name}`} disabled={saving} onChange={(event) => save({ status: event.target.checked ? "active" : "inactive" })} />
        <span>{active ? "Completed" : "Pending"}</span>
      </label>
    </td>
    <td className={styles.commentCell}>
      <form onSubmit={(event) => { event.preventDefault(); save({ comment: draft }); }}>
        <textarea aria-label={`Comment for ${contact.name}`} placeholder="Add a comment…" maxLength={2000} rows={2} value={draft} disabled={saving} onChange={(event) => { setDraft(event.target.value); setMessage(""); }} />
        <div><button type="submit" disabled={saving || draft === (contact.comment || "")}>{saving ? "Saving…" : "Save comment"}</button><span role="status">{message}</span></div>
      </form>
    </td>
  </>;
}

export default function ContactsTable() {
  const [filters, setFilters] = useState(() => resolveContactFilters());
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [contacts, setContacts] = useState([]);
  const [summary, setSummary] = useState({ counts: {}, total: 0, weights: {}, totalWeight: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  function updateRow(id, changes) {
    setContacts((previous) => previous.map((contact) => contact.id === id ? { ...contact, ...changes } : contact));
  }

  async function exportContacts(format) {
    setExporting(true);
    setExportMessage("");
    const headers = ["#", "Date", "Time (IST)", "Form type", "Name", "Mobile", "City", "Weight", "Release bank", "Release place", "Preferred date", "Preferred time", "Service / Help with", "GCLID", "UTM Source", "UTM Campaign", "Keyword", "Adgroup ID", "Landing page", "Referrer", "Tracking data", "Status", "Comment"];
    const rows = contacts.map((contact, index) => [
      index + 1, displayDate(contact.submittedDate), displayTime(contact.submittedTime),
      getContactFormLabel(contact.businessType), contact.name, contact.mobile, contact.city || "—",
      contact.weight ? `${contact.weight} g` : "—", contact.releaseBank || "", contact.releasePlace || "", displayDate(contact.preferredDate),
      displayTime(contact.preferredTime), displayService(contact),
      ...["gclid", "utmSource", "utmCampaign", "keyword", "adgroupId"].map((field) => contact[field] || "-"),
      contact.landingPage || "", contact.referrer || "", JSON.stringify(contact.trackingData || {}),
      contact.status === "active" ? "Completed" : "Pending", contact.comment || "",
    ]);
    // Prevent user-entered values from becoming spreadsheet formulas.
    const safeText = (value) => {
      const text = String(value ?? "");
      return /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
    };
    try {
      if (format === "copy") {
        const text = [headers, ...rows].map((row) => row.map((value) => safeText(value).replace(/[\t\r\n]+/g, " ")).join("\t")).join("\r\n");
        await navigator.clipboard.writeText(text);
        setExportMessage(`${contacts.length} records copied to clipboard.`);
        return;
      }
      let blob;
      if (format === "csv") {
        const csv = [headers, ...rows].map((row) => row.map((value) => `"${safeText(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
        blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
      } else {
        const { default: ExcelJS } = await import("exceljs");
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Contact requests");
        sheet.addRows([headers, ...rows.map((row) => row.map((value) => String(value ?? "")))]);
        sheet.getRow(1).font = { bold: true };
        sheet.columns.forEach((column, index) => { column.width = index === 13 ? 50 : 22; });
        sheet.views = [{ state: "frozen", ySplit: 1 }];
        sheet.autoFilter = { from: "A1", to: "W1" };
        blob = new Blob([await workbook.xlsx.writeBuffer()], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contact-requests-${appliedFilters.fromDate}-${appliedFilters.toDate}.${format === "csv" ? "csv" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportMessage(`${format === "csv" ? "CSV" : "Excel"} download ready: ${contacts.length} records.`);
    } catch {
      setExportMessage(format === "copy" ? "Unable to copy. Check clipboard permissions or download CSV or Excel instead." : "Unable to export contacts. Please try again.");
    } finally {
      setExporting(false);
    }
  }

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
      .then((data) => {
        setContacts(data.contacts);
        setSummary({ counts: data.counts, total: data.total, weights: data.weights, totalWeight: data.totalWeight });
      })
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
    const nextFilters = resolveContactFilters(filters);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setRequestVersion((version) => version + 1);
  }

  function clearFilters() {
    setLoading(true);
    setError("");
    const todayFilters = resolveContactFilters();
    setFilters(todayFilters);
    setAppliedFilters(todayFilters);
    setRequestVersion((version) => version + 1);
  }

  function selectFormType(businessType) {
    const nextFilters = { ...appliedFilters, businessType };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setLoading(true);
    setError("");
    setRequestVersion((version) => version + 1);
  }

  return (
    <article className={styles.contactsPanel}>
      <div className={styles.panelHeading}>
        <div><h2>Contact requests</h2><p>Today’s requests are shown by default. Choose a date range and click Filter to view older requests.</p></div>
        <span className={styles.resultCount}>{loading ? "…" : contacts.length} records</span>
      </div>

      <form className={styles.filters} onSubmit={applyFilters}>
        <label><span>From date</span><input type="date" value={filters.fromDate} onChange={(event) => setFilters({...filters, fromDate: event.target.value})} /></label>
        <label><span>To date</span><input type="date" min={filters.fromDate || undefined} value={filters.toDate} onChange={(event) => setFilters({...filters, toDate: event.target.value})} /></label>
        <label><span>Form type</span><select value={filters.businessType} onChange={(event) => setFilters({...filters, businessType: event.target.value})}><option value="">All form types</option>{CONTACT_FORM_TYPES.map((type) => <option key={type} value={type}>{getContactFormLabel(type)}</option>)}</select></label>
        <div className={styles.filterActions}><button className={styles.filterButton} type="submit">Filter</button><button type="button" onClick={clearFilters}>Clear</button></div>
      </form>

      <div className={styles.contactSummary} role="group" aria-label="Lead counts by form type for the selected dates">
        {[["", "All form types"], ...CONTACT_FORM_TYPES.map((type) => [type, getContactFormLabel(type)])].map(([type, label]) => <button key={type} type="button" className={`${styles.summaryCard} ${appliedFilters.businessType === type ? styles.summarySelected : ""}`} aria-pressed={appliedFilters.businessType === type} disabled={loading} onClick={() => selectFormType(type)}>
          <span>{label}</span><strong>{loading ? "…" : type ? summary.counts[type] || 0 : summary.total}</strong><small>{type ? "leads" : "total leads"}</small>
          <span className={styles.summaryWeight}>Total weight <b>{loading ? "…" : `${Number(type ? summary.weights?.[type] || 0 : summary.totalWeight || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })} g`}</b></span>
        </button>)}
      </div>
      {error && <p className={styles.tableError} role="alert">{error}</p>}
      <div className={styles.exportToolbar}>
        <div className={styles.exportButtons} role="group" aria-label="Export contact requests">
          <button type="button" disabled={loading || exporting || !contacts.length} onClick={() => exportContacts("copy")}>Copy</button>
          <button type="button" disabled={loading || exporting || !contacts.length} onClick={() => exportContacts("csv")}>CSV</button>
          <button type="button" disabled={loading || exporting || !contacts.length} onClick={() => exportContacts("excel")}>Excel</button>
        </div>
        <span className={styles.exportStatus} role="status">{exporting ? "Preparing export…" : exportMessage}</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.contactsTable}>
          <thead><tr><th>#</th><th>Date</th><th>Time (IST)</th><th>Form type</th><th>Name</th><th>Mobile</th><th>City</th><th>Weight</th><th>Details</th><th>Status</th><th>Comment</th></tr></thead>
          <tbody>
            {loading ? <tr><td className={styles.tableStatus} colSpan="11">Loading contact requests…</td></tr> : contacts.length === 0 ? <tr><td className={styles.tableStatus} colSpan="11">No contact requests found.</td></tr> : contacts.map((contact, index) => (
              <tr key={contact.id} className={contact.comment?.trim() ? styles.commentedRow : undefined}>
                <td>{index + 1}</td>
                <td className={styles.noWrap}>{displayDate(contact.submittedDate)}</td>
                <td className={styles.noWrap}>{displayTime(contact.submittedTime)}</td>
                <td><span className={`${styles.typeBadge} ${["Quick Contact", "Contact Page", "Banner Form", GOOGLE_LEAD_TYPE].includes(contact.businessType) ? styles.quickBadge : ""}`}>{getContactFormLabel(contact.businessType)}</span></td>
                <td>{contact.name}</td><td className={styles.noWrap}>{contact.mobile}</td><td>{contact.city || "—"}</td>
                <td className={styles.noWrap}>{contact.weight ? `${contact.weight} g` : "—"}</td><td><ContactDetails contact={contact} /></td>
                <ContactControls contact={contact} onSaved={updateRow} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
