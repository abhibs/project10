"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./branches.module.css";

function BranchCard({ branch }) {
  const [imageFailed, setImageFailed] = useState(false);
  const destination = branch.latitude !== null && branch.longitude !== null
    ? branch.latitude + "," + branch.longitude
    : [branch.name, branch.address, branch.area, branch.city, branch.state, branch.pincode].join(", ");
  const directions = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(destination);
  return <article className={styles.card} id={"branch-" + branch.slug}>
    {branch.image && !imageFailed
      ? <Image className={styles.image} src={"/api/branch-images/" + branch.image} alt={branch.name + " branch"} width={600} height={360} unoptimized onError={() => setImageFailed(true)} />
      : <div className={styles.imageFallback}><Image src="/logo.jpeg" alt="Aryan Gold" width={80} height={80} /><span>ARYAN GOLD · {branch.city}</span></div>}
    <div className={styles.cardBody}>
      <span className={styles.area}>{branch.area} · {branch.city}</span>
      <h3>{branch.name}</h3>
      <p className={styles.address}>{branch.address}<br />{branch.city}, {branch.state} – {branch.pincode}</p>
      <p className={styles.timings}><strong>Opening hours</strong><span>{branch.timings}</span></p>
      <div className={styles.links}><a className={styles.directions} href={directions} target="_blank" rel="noopener noreferrer">Get directions ↗</a>{branch.url && <a className={styles.more} href={branch.url} target="_blank" rel="noopener noreferrer">Branch link ↗</a>}</div>
    </div>
  </article>;
}

export default function BranchLocations() {
  const [branches, setBranches] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let controller;
    let disposed = false;
    async function load() {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      const timeout = setTimeout(() => current.abort(), 10000);
      try {
        const response = await fetch("/api/branches", { cache: "no-store", signal: current.signal });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.branches)) throw new Error("Unavailable");
        if (!disposed && controller === current) { setBranches(data.branches); setError(false); }
      } catch {
        if (!disposed && controller === current) { setBranches([]); setError(true); }
      } finally {
        clearTimeout(timeout);
        if (!disposed && controller === current) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { disposed = true; controller?.abort(); clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [attempt]);

  const visible = branches.filter(branch => [branch.name, branch.area, branch.city, branch.state, branch.pincode].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  return <section className={"section " + styles.section} id="branches" aria-labelledby="branches-title">
    <div className="container">
      <div className={styles.heading}><div><p className={styles.kicker}>VISIT ARYAN GOLD</p><h2 id="branches-title">Find your nearest branch.</h2><p>Visit us for a transparent gold evaluation and personal assistance.</p></div>
        <label className={styles.search}><span>Search locations</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="City, area or pincode" /></label>
      </div>
      {loading ? <p className={styles.notice} role="status">Loading branch locations…</p> : error ? <div className={styles.notice} role="status">Branch locations are temporarily unavailable. <button type="button" onClick={() => { setLoading(true); setAttempt(value => value + 1); }}>Try again</button></div> :
        !branches.length ? <p className={styles.notice}>Branch locations will be listed here soon. <a href="#contact">Contact our team</a> for assistance.</p> :
        !visible.length ? <p className={styles.notice} role="status">No branches match your search. Try another city, area or pincode.</p> :
        <div className={styles.grid}>{visible.map(branch => <BranchCard key={branch.id + "-" + branch.image} branch={branch} />)}</div>}
    </div>
  </section>;
}
