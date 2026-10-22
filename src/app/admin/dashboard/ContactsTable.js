"use client";

import { useEffect, useState } from "react";
import { resolveContactFilters } from "@/lib/contact-filters.mjs";
import styles from "./page.module.css";

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

export default function ContactsTable() {
  const [filters, setFilters] = useState(() => resolveContactFilters());
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  async function exportContacts(format) {
    setExporting(true);
    setExportMessage("");
    const headers = ["#", "Date", "Time (IST)", "Form type", "Name", "Mobile", "City", "Weight", "Preferred date", "Preferred time", "Service / Help with", "GCLID", "UTM Source", "UTM Campaign", "Keyword", "Adgroup ID"];
    const rows = contacts.map((contact, index) => [
      index + 1, displayDate(contact.submittedDate), displayTime(contact.submittedTime),
      contact.businessType, contact.name, contact.mobile, contact.city || "—",
      contact.weight ? `${contact.weight} g` : "—", displayDate(contact.preferredDate),
      displayTime(contact.preferredTime), contact.businessType === "Banner Form" ? "—" : contact.services || "—",
      ...["gclid", "utmSource", "utmCampaign", "keyword", "adgroupId"].map((field) => contact[field] || "-"),
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
        sheet.columns.forEach((column, index) => { column.width = index === 11 ? 50 : 22; });
        sheet.views = [{ state: "frozen", ySplit: 1 }];
        sheet.autoFilter = { from: "A1", to: "P1" };
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

  return (
    <article className={styles.contactsPanel}>
      <div className={styles.panelHeading}>
        <div><h2>Contact requests</h2><p>Today’s requests are shown by default. Choose a date range and click Filter to view older requests.</p></div>
        <span className={styles.resultCount}>{loading ? "…" : contacts.length} records</span>
      </div>

      <form className={styles.filters} onSubmit={applyFilters}>
        <label><span>From date</span><input type="date" value={filters.fromDate} onChange={(event) => setFilters({...filters, fromDate: event.target.value})} /></label>
        <label><span>To date</span><input type="date" min={filters.fromDate || undefined} value={filters.toDate} onChange={(event) => setFilters({...filters, toDate: event.target.value})} /></label>
        <label><span>Form type</span><select value={filters.businessType} onChange={(event) => setFilters({...filters, businessType: event.target.value})}><option value="">All form types</option><option>Branch Visit</option><option>Doorstep Service</option><option>Quick Contact</option><option>Contact Page</option><option>Banner Form</option></select></label>
        <div className={styles.filterActions}><button className={styles.filterButton} type="submit">Filter</button><button type="button" onClick={clearFilters}>Clear</button></div>
      </form>

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
          <thead><tr><th>#</th><th>Date</th><th>Time (IST)</th><th>Form type</th><th>Name</th><th>Mobile</th><th>City</th><th>Weight</th><th>Preferred date</th><th>Preferred time</th><th>Service / Help with</th><th>GCLID</th><th>UTM Source</th><th>UTM Campaign</th><th>Keyword</th><th>Adgroup ID</th></tr></thead>
          <tbody>
            {loading ? <tr><td className={styles.tableStatus} colSpan="16">Loading contact requests…</td></tr> : contacts.length === 0 ? <tr><td className={styles.tableStatus} colSpan="16">No contact requests found.</td></tr> : contacts.map((contact, index) => (
              <tr key={contact.id}>
                <td>{index + 1}</td>
                <td className={styles.noWrap}>{displayDate(contact.submittedDate)}</td>
                <td className={styles.noWrap}>{displayTime(contact.submittedTime)}</td>
                <td><span className={`${styles.typeBadge} ${["Quick Contact", "Contact Page", "Banner Form"].includes(contact.businessType) ? styles.quickBadge : ""}`}>{contact.businessType}</span></td>
                <td>{contact.name}</td><td className={styles.noWrap}>{contact.mobile}</td><td>{contact.city || "—"}</td>
                <td className={styles.noWrap}>{contact.weight ? `${contact.weight} g` : "—"}</td><td className={styles.noWrap}>{displayDate(contact.preferredDate)}</td><td className={styles.noWrap}>{displayTime(contact.preferredTime)}</td><td>{contact.businessType === "Banner Form" ? "—" : contact.services || "—"}</td>
                {["gclid", "utmSource", "utmCampaign", "keyword", "adgroupId"].map((field) => <td key={field}>{contact[field] || "-"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
