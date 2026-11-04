"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./blogs.module.css";

export default function BlogImageManager() {
  const [posts, setPosts] = useState([]);
  const [source, setSource] = useState(null);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState(null);
  const refreshLock = useRef(false);
  async function refresh() {
    if (refreshLock.current) return;
    refreshLock.current = true;
    setRefreshing(true); setRefreshMessage(null);
    try {
      const response = await fetch("/api/admin/blogs/refresh", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to refresh articles.");
      setRefreshMessage({ text: data.message, error: false });
      setAttempt(value => value + 1);
    } catch (error) { setRefreshMessage({ text: error.message, error: true }); }
    finally { refreshLock.current = false; setRefreshing(false); }
  }
  const refreshControls = <div className={styles.refreshBar}><button type="button" onClick={refresh} disabled={refreshing}>{refreshing ? "Refreshing sheet and articles…" : "Refresh from Google Sheet"}</button><p>Updates titles, article content and blog counts on the website. Uploaded images are kept.</p>{refreshMessage && <p role={refreshMessage.error ? "alert" : "status"} className={refreshMessage.error ? styles.error : styles.success}>{refreshMessage.text}</p>}</div>;
  const selected = posts.find(post => post.slug === selectedSlug);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/blogs", { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load articles.");
      setPosts(data.posts);
      setSource(data.source);
      setSelectedSlug(data.posts[0]?.slug || "");
      setError("");
    }).catch(error => { if (error.name !== "AbortError") setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  const filtered = posts.filter(post => `${post.id} ${post.title}`.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <p role="status">Loading blog posts…</p>;
  if (error) return <div>{refreshControls}<div role="alert">{error} <button onClick={() => { setLoading(true); setAttempt(value => value + 1); }}>Try again</button></div></div>;
  if (!posts.length) return <div>{refreshControls}<section className={styles.editor}><div className={styles.editorBody}><h2>No blogs from the selected spreadsheet yet</h2><p>{source?.status === "awaiting-import" ? "The new spreadsheet has not been imported. Grant read access to the sheet, then import its articles." : "The selected spreadsheet has no blog entries."}</p>{source?.url && <p><Link href={source.url} target="_blank" rel="noopener noreferrer">Open selected Google Sheet ↗</Link></p>}<p>Only articles from this spreadsheet will appear here and on the website.</p></div></section></div>;
  return <div>{refreshControls}<div className={styles.workspace}>
    <aside className={styles.list}><header><h2>Blog posts</h2><p>{posts.length} imported articles</p><label htmlFor="admin-blog-search" className={styles.srOnly}>Search articles by number or title</label><input id="admin-blog-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search number or title" type="search" /></header><nav aria-label="Select blog post">{filtered.map(post => <button type="button" key={post.slug} onClick={() => setSelectedSlug(post.slug)} aria-current={post.slug === selectedSlug ? "true" : undefined}><small>{post.id}</small><span>{post.title}<em>{post.status === "published" ? post.category : "Content unavailable · not published"}</em></span></button>)}{!filtered.length && <p className={styles.noResults}>No matching articles.</p>}</nav></aside>
    {selected && <ImageEditor key={selected.slug} post={selected} onSaved={image => setPosts(posts => posts.map(post => post.slug === selected.slug ? { ...post, image } : post))} />}
  </div></div>;
}
function ImageEditor({ post, onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const input = useRef(null);
  const lock = useRef(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  async function save(event) {
    event.preventDefault();
    if (!file || lock.current) return;
    lock.current = true; setSaving(true); setMessage(null);
    try {
      const form = new FormData(); form.set("image", file);
      const response = await fetch(`/api/admin/blogs/${post.slug}/image`, { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update image.");
      onSaved(data.image); setFile(null); setPreview(""); input.current.value = "";
      setMessage({ text: "Image updated on the blog listing and article page.", error: false });
    } catch (error) { setMessage({ text: error.message, error: true }); }
    finally { lock.current = false; setSaving(false); }
  }
  return <section className={styles.editor}>
    <header><div><span className={styles.eyebrow}>BLOG IMAGE</span><h2>{post.title}</h2><p>/blogs/{post.slug}</p></div>{post.status === "published" && <Link href={`/blogs/${post.slug}`} target="_blank" rel="noopener noreferrer">Preview article ↗</Link>}</header>
    <div className={styles.editorBody}>
      <div className={styles.preview}><Image src={preview || post.image} alt={`Cover preview for ${post.title}`} width={1200} height={750} unoptimized={!!preview} /></div>
      <form onSubmit={save}><h3>Cover image</h3><p>Used on the blog listing, article page and related articles.</p><label htmlFor="blog-cover">Choose a new image</label><input ref={input} id="blog-cover" type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={event => {
        const next = event.target.files?.[0]; setMessage(null);
        if (next && (!['image/jpeg','image/png','image/webp'].includes(next.type) || next.size > 10 * 1024 * 1024)) { event.target.value = ""; setFile(null); setPreview(""); setMessage({ text: "Choose a JPG, PNG or WebP image up to 10 MB.", error: true }); return; }
        setFile(next || null); setPreview(next ? URL.createObjectURL(next) : "");
      }} /><small>JPG, PNG or WebP · Max 10 MB · Recommended 1600 × 1000 px</small><button disabled={!file || saving} type="submit">{saving ? "Updating image…" : "Update blog image"}</button>{message && <p className={message.error ? styles.error : styles.success} role={message.error ? "alert" : "status"}>{message.text}</p>}</form>
      <div className={styles.articleInfo}><h3>Article details</h3><dl><dt>Category</dt><dd>{post.category}</dd><dt>Status</dt><dd>{post.status === "published" ? "Published" : "Awaiting article content"}</dd></dl><p>Titles and article content come from the imported spreadsheet. Use Refresh from Google Sheet above to import your latest changes.</p></div>
    </div>
  </section>;
}
