"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { slugifyBranchName } from "@/lib/branch-values.mjs";
import styles from "./branches.module.css";

const fields = [
  { name: "area", label: "Area", maxLength: 160 },
  { name: "city", label: "City", maxLength: 120 },
  { name: "state", label: "State", maxLength: 120 },
  { name: "pincode", label: "Pincode", maxLength: 6, pattern: "[1-9][0-9]{5}", inputMode: "numeric" },
  { name: "timings", label: "Timings", maxLength: 160, placeholder: "9:30 AM – 6:30 PM" },
  { name: "latitude", label: "Latitude (optional)", type: "number", min: -90, max: 90, step: "0.0000001", optional: true },
  { name: "longitude", label: "Longitude (optional)", type: "number", min: -180, max: 180, step: "0.0000001", optional: true },
  { name: "url", label: "URL (optional)", type: "url", maxLength: 2048, optional: true, placeholder: "https://maps.google.com/…" },
];

function BranchForm({ branch, onSaved, onCancel }) {
  const [name, setName] = useState(branch.name || "");
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const formRef = useRef(null);
  useEffect(() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    form.set("removeImage", String(removeImage));
    try {
      const response = await fetch(branch.id ? "/api/admin/branches/" + branch.id : "/api/admin/branches", {
        method: branch.id ? "PUT" : "POST", body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save branch.");
      onSaved(data.branch, data.message);
    } catch (error) { setError(error.message || "Unable to connect. Please try again."); }
    finally { setSaving(false); lock.current = false; }
  }

  const image = preview || (!removeImage && branch.image ? "/api/branch-images/" + branch.image : "");
  return <section className={styles.panel} ref={formRef} aria-labelledby="branch-editor-title">
    <div className={styles.heading}><div><h2 id="branch-editor-title">{branch.id ? "Edit branch" : "Add branch"}</h2><p>Active branches appear on the homepage. Fields marked * are required.</p></div></div>
    <form onSubmit={submit} className={styles.form}>
      <fieldset disabled={saving}>
        <div className={styles.formGrid}>
          <label className={styles.field} htmlFor="branch-branchId"><span>Branch ID *</span><input id="branch-branchId" name="branchId" type="text" defaultValue={branch.branchId || ""} required maxLength={64} pattern="[a-zA-Z0-9][a-zA-Z0-9_-]*" placeholder="e.g. AG-BLR-01" /></label>
          <label className={styles.field} htmlFor="branch-name"><span>Branch name *</span><input id="branch-name" name="name" type="text" defaultValue={branch.name || ""} required maxLength={160} onChange={event => setName(event.target.value)} /></label>
          <div className={styles.field}><span>Branch slug</span><output className={styles.slugPreview} aria-label="Generated branch slug" aria-live="polite">{slugifyBranchName(name) || "Enter a branch name"}</output><small>Created automatically from the name. Repeated names get a number.</small></div>
          {fields.map(field => <label key={field.name} className={styles.field} htmlFor={"branch-" + field.name}>
            <span>{field.label}{!field.optional && " *"}</span>
            <input id={"branch-" + field.name} name={field.name} type={field.type || "text"} defaultValue={branch[field.name] ?? ""}
              required={!field.optional} maxLength={field.maxLength} pattern={field.pattern} inputMode={field.inputMode}
              min={field.min} max={field.max} step={field.step} placeholder={field.placeholder} />
          </label>)}
          <label className={styles.field} htmlFor="branch-status"><span>Status *</span><select id="branch-status" name="status" defaultValue={branch.status || "active"} required><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          <div className={styles.field}>
            <label htmlFor="branch-image">Branch image (optional)</label>
            <input id="branch-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="branch-image-help" onChange={event => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : "");
              if (file) setRemoveImage(false);
            }} />
            <small id="branch-image-help">JPG, PNG or WebP, up to 10 MB. Saved as WebP.</small>
            {image && <Image className={styles.preview} src={image} alt="Branch image preview" width={240} height={150} unoptimized />}
            {branch.image && !preview && <label className={styles.checkbox}><input type="checkbox" checked={removeImage} onChange={event => setRemoveImage(event.target.checked)} />Remove current image</label>}
          </div>
          <label className={styles.fullField} htmlFor="branch-address"><span>Address *</span><textarea id="branch-address" name="address" defaultValue={branch.address || ""} rows={3} maxLength={2000} required /></label>
        </div>
      </fieldset>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}><button type="button" onClick={onCancel} disabled={saving}>Cancel</button><button className={styles.primary} type="submit" disabled={saving}>{saving ? "Saving…" : branch.id ? "Save changes" : "Create branch"}</button></div>
    </form>
  </section>;
}

export default function BranchManager() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState(null);
  const [search, setSearch] = useState("");
  const [version, setVersion] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const deleteLock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/branches", { cache: "no-store", signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data; })
      .then(data => setBranches(data.branches))
      .catch(error => { if (!controller.signal.aborted) setError(error.message || "Unable to load branches."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [version]);

  async function remove(branch) {
    if (deleteLock.current || !window.confirm('Delete "' + branch.name + '" (' + branch.branchId + ')? This permanently removes the branch from admin and the website.')) return;
    deleteLock.current = true; setDeleting(branch.id); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/branches/" + branch.id, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setBranches(items => items.filter(item => item.id !== branch.id));
      if (editor?.id === branch.id) setEditor(null);
      setMessage(data.message);
    } catch (error) { setError(error.message || "Unable to delete branch."); }
    finally { setDeleting(null); deleteLock.current = false; }
  }

  const visible = branches.filter(branch => [branch.branchId, branch.slug, branch.name, branch.city, branch.area].join(" ").toLowerCase().includes(search.trim().toLowerCase()));
  return <div className={styles.manager}>
    <div className={styles.toolbar}><p>Manage the locations customers see on your website.</p><button className={styles.primary} type="button" disabled={!!editor} onClick={() => { setEditor({}); setMessage(""); }}>+ Add branch</button></div>
    {message && <p className={styles.success} role="status">{message}</p>}
    {error && <div className={styles.error} role="alert">{error} <button type="button" onClick={() => { setLoading(true); setError(""); setVersion(v => v + 1); }}>Retry</button></div>}
    {editor && <BranchForm key={editor.id || "new"} branch={editor} onCancel={() => setEditor(null)} onSaved={(saved, message) => {
      setBranches(items => [...items.filter(item => item.id !== saved.id), saved].sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)));
      setEditor(null); setMessage(message); setError("");
    }} />}
    <section className={styles.panel} aria-labelledby="branch-list-title">
      <div className={styles.heading}><div><h2 id="branch-list-title">All branches</h2><p>{branches.length} locations · Active branches are visible to customers</p></div><label className={styles.search}><span>Search branches</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, ID, slug, area or city" /></label></div>
      {loading ? <p className={styles.empty} role="status">Loading branches…</p> : error && !branches.length ? <p className={styles.empty}>The branch list could not be loaded. Please retry.</p> : !visible.length ? <p className={styles.empty}>{branches.length ? "No branches match your search." : "No branches yet. Add your first branch to show it on the website."}</p> :
        <div className={styles.list}>{visible.map(branch => <article className={styles.branch} key={branch.id}>
          <div className={styles.branchTop}>
            {branch.image ? <Image className={styles.thumbnail} src={"/api/branch-images/" + branch.image} alt={branch.name} width={96} height={72} unoptimized /> : <span className={styles.placeholder} aria-hidden="true">⌂</span>}
            <div><span className={styles.branchId}>ID: {branch.branchId}</span><h3>{branch.name}</h3><p>Slug: {branch.slug}</p><p>{branch.area}, {branch.city}</p></div>
            <span className={branch.status === "active" ? styles.active : styles.inactive}>{branch.status === "active" ? "Active" : "Inactive"}</span>
          </div>
          <details><summary>View details</summary><dl><dt>Address</dt><dd>{branch.address}</dd><dt>State / Pincode</dt><dd>{branch.state} · {branch.pincode}</dd><dt>Timings</dt><dd>{branch.timings}</dd><dt>Coordinates</dt><dd>{branch.latitude !== null ? branch.latitude + ", " + branch.longitude : "Not provided"}</dd><dt>URL</dt><dd>{branch.url ? <a href={branch.url} target="_blank" rel="noopener noreferrer">{branch.url}</a> : "Not provided"}</dd></dl></details>
          <div className={styles.actions}><button type="button" disabled={!!editor || deleting !== null} onClick={() => { setEditor(branch); setMessage(""); }}>Edit<span className={styles.srOnly}> {branch.name}</span></button><button className={styles.danger} type="button" disabled={deleting !== null} onClick={() => remove(branch)}>{deleting === branch.id ? "Deleting…" : "Delete"}<span className={styles.srOnly}> {branch.name}</span></button></div>
        </article>)}</div>}
    </section>
  </div>;
}
