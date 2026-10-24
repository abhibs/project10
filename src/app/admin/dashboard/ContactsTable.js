"use client";

import { useEffect, useRef, useState } from "react";
import { resolveContactFilters } from "@/lib/contact-filters.mjs";
import { CONTACT_FORM_TYPES, GOOGLE_LEAD_TYPE, INCOMING_CALL_TYPE, getContactFormLabel } from "@/lib/contact-summary.mjs";
import { CALLBACK_STATUS, CONTACT_STATUS_OPTIONS, getContactStatusLabel } from "@/lib/contact-status.mjs";
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
    ["Service / Help with", displayService(contact)], ["Details", contact.details],
    ["Release bank", contact.releaseBank], ["Release place", contact.releasePlace],
    ["Preferred date", displayDate(contact.preferredDate)],
    ["Preferred time", displayTime(contact.preferredTime)],
    ["Call-back date", displayDate(contact.callbackDate)],
    ...standard, ...extra, ...context,
    ["Status", getContactStatusLabel(contact.status)],
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
  const [status, setStatus] = useState(contact.status);
  const [callbackDate, setCallbackDate] = useState(contact.callbackDate || "");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const lock = useRef(false);
  const statusChanged = status !== contact.status || (status === CALLBACK_STATUS ? callbackDate !== (contact.callbackDate || "") : !!contact.callbackDate);

  async function save(changes, setMessage) {
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
      if (changes.status !== undefined) {
        setStatus(data.changes.status);
        setCallbackDate(data.changes.callbackDate || "");
      }
      setMessage("Saved.");
    } catch (error) { setMessage(error.message || "Unable to save changes."); }
    finally { lock.current = false; setSaving(false); }
  }

  return <>
    <td className={styles.statusCell}>
      <form className={styles.statusEditor} onSubmit={(event) => { event.preventDefault(); save({ status, callbackDate }, setStatusMessage); }}>
        <select aria-label={`Status for ${contact.name}`} value={status} disabled={saving} onChange={(event) => { setStatus(event.target.value); setStatusMessage(""); }}>
          {CONTACT_STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {status === CALLBACK_STATUS && <input aria-label={`Call-back date for ${contact.name}`} type="date" value={callbackDate} required disabled={saving} onChange={(event) => { setCallbackDate(event.target.value); setStatusMessage(""); }} />}
        <div><button type="submit" disabled={saving || !statusChanged || (status === CALLBACK_STATUS && !callbackDate)}>{saving ? "Saving…" : "Save status"}</button><span role="status">{statusMessage}</span></div>
      </form>
    </td>
    <td className={styles.commentCell}>
      <form onSubmit={(event) => { event.preventDefault(); save({ comment: draft }, setCommentMessage); }}>
        <textarea aria-label={`Comment for ${contact.name}`} placeholder="Add a comment…" maxLength={2000} rows={2} value={draft} disabled={saving} onChange={(event) => { setDraft(event.target.value); setCommentMessage(""); }} />
        <div><button type="submit" disabled={saving || draft === (contact.comment || "")}>{saving ? "Saving…" : "Save comment"}</button><span role="status">{commentMessage}</span></div>
      </form>
    </td>
  </>;
}

function ManualEnquiryDialog({ onCreated }) {
  const dialog = useRef(null);
  const form = useRef(null);
  const lock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  function open() {
    form.current?.reset();
    setMessage("");
    setStatus("");
    dialog.current.showModal();
  }

  function close() {
    if (!saving) dialog.current.close();
  }

  async function submit(event) {
    event.preventDefault();
    if (lock.current || !event.currentTarget.reportValidity()) return;
    lock.current = true;
    setSaving(true);
    setMessage("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add the enquiry.");
      form.current.reset();
      setStatus("");
      dialog.current.close();
      onCreated(data.message, data.callbackDate);
    } catch (error) {
      setMessage(error.message || "Unable to add the enquiry. Please try again.");
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }

  return <>
    <button type="button" className={styles.insertEnquiryButton} onClick={open}>+ Insert enquiry</button>
    <dialog ref={dialog} className={`${styles.gclidDialog} ${styles.enquiryDialog}`} aria-labelledby="manual-enquiry-title" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <form ref={form} className={styles.enquiryForm} onSubmit={submit}>
        <div className={styles.modalHead}>
          <div><h2 id="manual-enquiry-title">Insert enquiry</h2><p>Add an enquiry received through an incoming call.</p></div>
          <button type="button" aria-label="Close enquiry form" disabled={saving} onClick={close}>×</button>
        </div>
        <div className={styles.formGrid}>
          <label><span>Form type</span><input value={INCOMING_CALL_TYPE} readOnly /></label>
          <label><span>Status <b>*</b></span><select name="status" value={status} required disabled={saving} onChange={(event) => setStatus(event.target.value)}><option value="" disabled>Select status</option>{CONTACT_STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {status === CALLBACK_STATUS && <label><span>Call-back date <b>*</b></span><input name="callbackDate" type="date" required disabled={saving} /></label>}
          <label><span>Name <b>*</b></span><input name="name" autoComplete="name" minLength={2} maxLength={255} placeholder="Customer name" required disabled={saving} /></label>
          <label><span>Mobile <b>*</b></span><input name="mobile" type="tel" autoComplete="tel-national" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} placeholder="10-digit mobile number" required disabled={saving} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} /></label>
          <label><span>City / area <b>*</b></span><input name="city" autoComplete="address-level2" maxLength={255} placeholder="e.g. Bengaluru" required disabled={saving} /></label>
          <label><span>Gold weight (g) <b>*</b></span><input name="weight" type="number" inputMode="decimal" min="0.01" max="100000" step="0.01" placeholder="Approx. weight" required disabled={saving} /></label>
          <label className={styles.fullField}><span>Service / Help with <b>*</b></span><input name="services" maxLength={255} placeholder="e.g. Gold valuation or pledged gold release" required disabled={saving} /></label>
          <label className={styles.fullField}><span>Details</span><textarea name="details" maxLength={2000} rows={4} placeholder="Add the customer’s enquiry details" disabled={saving} /></label>
          <label className={styles.fullField}><span>Comment</span><textarea name="comment" maxLength={2000} rows={3} placeholder="Optional internal comment" disabled={saving} /></label>
        </div>
        {message && <p className={styles.passwordError} role="alert">{message}</p>}
        <div className={styles.modalActions}><button type="button" disabled={saving} onClick={close}>Cancel</button><button className={styles.savePassword} type="submit" disabled={saving}>{saving ? "Adding…" : "Add enquiry"}</button></div>
      </form>
    </dialog>
  </>;
}

export default function ContactsTable() {
  const [filters, setFilters] = useState(() => resolveContactFilters());
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(contacts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleContacts = contacts.slice(pageStart, pageStart + pageSize);
  const [summary, setSummary] = useState({ counts: {}, total: 0, weights: {}, totalWeight: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  function updateRow(id, changes) {
    setContacts((previous) => previous.map((contact) => contact.id === id ? { ...contact, ...changes } : contact));
    if (changes.status !== undefined) {
      if (changes.status === CALLBACK_STATUS && changes.callbackDate) {
        const nextFilters = resolveContactFilters({ fromDate: changes.callbackDate, toDate: changes.callbackDate, businessType: appliedFilters.businessType });
        setFilters(nextFilters);
        setAppliedFilters(nextFilters);
      }
      setLoading(true);
      setRequestVersion((version) => version + 1);
    }
  }

  function manualEnquiryCreated(message, callbackDate) {
    const nextFilters = callbackDate
      ? resolveContactFilters({ fromDate: callbackDate, toDate: callbackDate, businessType: INCOMING_CALL_TYPE })
      : resolveContactFilters({ businessType: INCOMING_CALL_TYPE });
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(1);
    setLoading(true);
    setError("");
    setExportMessage(message);
    setRequestVersion((version) => version + 1);
  }

  async function exportContacts(format) {
    setExporting(true);
    setExportMessage("");
    const headers = ["#", "Date", "Time (IST)", "Form type", "Name", "Mobile", "City", "Weight", "Release bank", "Release place", "Preferred date", "Preferred time", "Service / Help with", "Details", "GCLID", "UTM Source", "UTM Campaign", "Keyword", "Adgroup ID", "Landing page", "Referrer", "Tracking data", "Call-back date", "Status", "Comment"];
    const rows = contacts.map((contact, index) => [
      index + 1, displayDate(contact.submittedDate), displayTime(contact.submittedTime),
      getContactFormLabel(contact.businessType), contact.name, contact.mobile, contact.city || "—",
      contact.weight ? `${contact.weight} g` : "—", contact.releaseBank || "", contact.releasePlace || "", displayDate(contact.preferredDate),
      displayTime(contact.preferredTime), displayService(contact), contact.details || "",
      ...["gclid", "utmSource", "utmCampaign", "keyword", "adgroupId"].map((field) => contact[field] || "-"),
      contact.landingPage || "", contact.referrer || "", JSON.stringify(contact.trackingData || {}),
      displayDate(contact.callbackDate), getContactStatusLabel(contact.status), contact.comment || "",
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
        sheet.autoFilter = { from: "A1", to: "Y1" };
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
        setPage(1);
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
        <div className={styles.panelActions}><ManualEnquiryDialog onCreated={manualEnquiryCreated} /><span className={styles.resultCount}>{loading ? "…" : contacts.length} records</span></div>
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
          <thead><tr><th>#</th><th>Date</th><th>Time (IST)</th><th>Form type</th><th>Name</th><th>Mobile</th><th>City</th><th>Weight</th><th>Service / Help with</th><th>Details</th><th>Status</th><th>Comment</th></tr></thead>
          <tbody>
            {loading ? <tr><td className={styles.tableStatus} colSpan="12">Loading contact requests…</td></tr> : contacts.length === 0 ? <tr><td className={styles.tableStatus} colSpan="12">No contact requests found.</td></tr> : visibleContacts.map((contact, index) => (
              <tr key={contact.id} className={contact.comment?.trim() ? styles.commentedRow : undefined}>
                <td>{pageStart + index + 1}</td>
                <td className={styles.noWrap}>{displayDate(contact.submittedDate)}</td>
                <td className={styles.noWrap}>{displayTime(contact.submittedTime)}</td>
                <td><span className={`${styles.typeBadge} ${["Quick Contact", "Contact Page", "Banner Form", GOOGLE_LEAD_TYPE, INCOMING_CALL_TYPE].includes(contact.businessType) ? styles.quickBadge : ""}`}>{getContactFormLabel(contact.businessType)}</span></td>
                <td>{contact.name}</td><td className={styles.noWrap}>{contact.mobile}</td><td>{contact.city || "—"}</td>
                <td className={styles.noWrap}>{contact.weight ? `${contact.weight} g` : "—"}</td><td>{displayService(contact)}</td><td><ContactDetails contact={contact} /></td>
                <ContactControls contact={contact} onSaved={updateRow} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className={styles.pagination} aria-label="Contact pages">
        <span role="status">{loading ? "Loading…" : `Showing ${contacts.length ? pageStart + 1 : 0}–${Math.min(pageStart + pageSize, contacts.length)} of ${contacts.length} contacts`}</span>
        <div>
          <button type="button" disabled={loading || currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <label>Page <select aria-label="Contact page" value={currentPage} disabled={loading || !contacts.length} onChange={(event) => setPage(Number(event.target.value))}>
            {Array.from({ length: totalPages }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
          </select> of {totalPages}</label>
          <button type="button" disabled={loading || currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </nav>
    </article>
  );
}
