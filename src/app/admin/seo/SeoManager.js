"use client";

import { useEffect, useState } from "react";
import { SEO_GROUPS, SEO_FIELDS } from "@/lib/seo-fields.mjs";
import styles from "./seo.module.css";

const labels = { meta_title: "Meta title", meta_description: "Meta description", focus_keywords: "Focus keywords", canonical_url: "Canonical URL", og_title: "Open Graph title", og_description: "Open Graph description", og_image: "Open Graph image URL", og_type: "Open Graph type", og_site_name: "Site name", og_locale: "Locale", twitter_card: "Twitter card", twitter_title: "Twitter title", twitter_description: "Twitter description", twitter_image: "Twitter image URL", twitter_site: "Twitter account", robots_index: "Allow search indexing", robots_follow: "Allow following links", robots_extra: "Additional robots directives", structured_data: "Structured data (JSON-LD)", head_scripts: "Head scripts", body_start_scripts: "Body start scripts", body_end_scripts: "Body end scripts" };
const blank = () => Object.fromEntries(["page_label", "route_path", ...SEO_FIELDS].map((key) => [key, ""]));
const normalize = (page) => ({ ...blank(), ...Object.fromEntries(Object.entries(page).map(([key, value]) => [key, value ?? ""])) });

export default function SeoManager() {
  const [pages, setPages] = useState([]);
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState("Search");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/seo", { signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPages(data.pages);
      setDraft(normalize(data.pages.find((page) => page.route_path === "/") || data.pages[0] || blank()));
    }).catch((error) => { if (error.name !== "AbortError") setStatus(error.message); });
    return () => controller.abort();
  }, []);

  function choose(page) {
    if (dirty && !window.confirm("Discard unsaved SEO changes?")) return;
    setDraft(normalize(page)); setDirty(false); setStatus("");
  }
  function change(key, value) { setDraft((previous) => ({ ...previous, [key]: value })); setDirty(true); }
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/admin/seo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPages(data.pages); setDraft(normalize(data.pages.find((page) => page.route_path === data.route))); setDirty(false); setStatus(data.message);
    } catch (error) { setStatus(error.message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!draft.id || !window.confirm("Remove this SEO record and return to defaults?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/seo?id=${draft.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPages(data.pages); setDraft(normalize(data.pages[0] || blank())); setDirty(false); setStatus(data.message);
    } catch (error) { setStatus(error.message); } finally { setBusy(false); }
  }
  const defaults = pages.find((page) => page.route_path === "*");
  const previewRoute = /^\/(?!\/)[^?#\s]*$/.test(draft?.route_path || "") ? draft.route_path : null;
  return <div className={styles.workspace}>
    <aside className={styles.pages}>
      <div className={styles.listHead}><div><strong>Static pages</strong><small>Manage site defaults and page SEO.</small></div><button type="button" onClick={() => choose(blank())} disabled={busy} aria-label="Add SEO page">+</button></div>
      <input className={styles.search} aria-label="Find a page" placeholder="Find a page" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className={styles.pageList}>{pages.filter((page) => `${page.page_label} ${page.route_path}`.toLowerCase().includes(search.toLowerCase())).map((page) => <button type="button" key={page.id} disabled={busy} aria-current={draft?.id === page.id ? "page" : undefined} onClick={() => choose(page)}><span>{page.page_label}<small>{page.route_path}</small></span><span aria-hidden="true">✓</span></button>)}</div>
    </aside>
    <section className={styles.editor}>
      {status && <p className={styles.status} role="status">{status}</p>}
      {!draft ? <p className={styles.loading}>Loading SEO settings…</p> : <form onSubmit={submit}>
        <header className={styles.editorHead}><div><h2>{draft.page_label || "New SEO page"}</h2><p>Page settings override site defaults. Blank fields use defaults.</p></div><div className={styles.actions}>{previewRoute && <a href={previewRoute} target="_blank" rel="noreferrer">Preview ↗</a>}<button type="button" onClick={remove} disabled={!draft.id || busy}>Remove</button><button type="submit" disabled={busy}>{busy ? "Saving…" : "Save SEO"}</button></div></header>
        <nav className={styles.tabs} aria-label="SEO settings">{Object.keys(SEO_GROUPS).map((name) => <button type="button" key={name} aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>)}</nav>
        <fieldset disabled={busy} className={styles.fields}>
          <div className={styles.identity}><label>Page label<input required maxLength={255} value={draft.page_label} onChange={(event) => change("page_label", event.target.value)} /></label><label>Route path<input required maxLength={255} placeholder="/contact-us" value={draft.route_path} onChange={(event) => change("route_path", event.target.value)} /><small>Use * for site defaults.</small></label></div>
          {tab === "Search" && <div className={styles.preview}><small>Google preview</small><h3>{draft.meta_title || defaults?.meta_title || "Page title"}</h3><span>{draft.canonical_url || (previewRoute ? `https://www.aryangoldbuyers.com${previewRoute}` : "https://www.aryangoldbuyers.com/")}</span><p>{draft.meta_description || defaults?.meta_description || "Add a description for this page."}</p></div>}
          {tab === "Scripts" && <p className={styles.note}>Script fields are saved for this page. Scripts are not executed by the site yet.</p>}
          {tab === "Advanced" && <p className={styles.note}>Robots settings apply to the page. JSON-LD is validated and stored; it is not rendered by the site yet.</p>}
          {SEO_GROUPS[tab].map((field) => <label key={field}>{labels[field]}{["meta_title", "meta_description"].includes(field) && <small className={styles.count}>{draft[field].length}/{field === "meta_title" ? 60 : 160}</small>}
            {field.startsWith("robots_") && field !== "robots_extra" ? <select value={draft[field]} onChange={(event) => change(field, event.target.value)}><option value="">Use default</option><option value="1">Yes</option><option value="0">No</option></select> : field === "twitter_card" ? <select value={draft[field]} onChange={(event) => change(field, event.target.value)}><option value="">Use default</option>{["summary", "summary_large_image", "app", "player"].map((card) => <option key={card}>{card}</option>)}</select> : /description|scripts|structured_data/.test(field) ? <textarea rows={field.includes("scripts") || field === "structured_data" ? 8 : 4} value={draft[field]} onChange={(event) => change(field, event.target.value)} /> : <input value={draft[field]} onChange={(event) => change(field, event.target.value)} />}
          </label>)}
          {dirty && <small>Unsaved changes</small>}
        </fieldset>
      </form>}
    </section>
  </div>;
}
