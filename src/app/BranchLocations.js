"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import styles from "./branches.module.css";

const singleCardQuery = "(max-width: 1100px)";
function subscribeToCardLayout(callback) {
  const media = window.matchMedia(singleCardQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function isSingleCardLayout() { return window.matchMedia(singleCardQuery).matches; }

function cityName(value) {
  if (/^(bangalore|bengaluru)$/i.test(value)) return "Bangalore";
  if (/^chennai$/i.test(value)) return "Chennai";
  return value;
}

function Icon({ name }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    pin: <><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    phone: <path d="M6.7 3.5 9.2 6l-1.5 2.5a15 15 0 0 0 7.8 7.8L18 14.8l2.5 2.5-1.6 3a2 2 0 0 1-2.2 1A19 19 0 0 1 2.7 7.3a2 2 0 0 1 1-2.2l3-1.6Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function BranchCard({ branch }) {
  const destination = branch.latitude != null && branch.longitude != null
    ? `${branch.latitude},${branch.longitude}`
    : [branch.name, branch.address, branch.area, branch.city, branch.state, branch.pincode].filter(Boolean).join(", ");
  const directions = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(destination);

  return <article className={styles.card}>
    <div className={styles.cardTop}>
      <span className={styles.locationTag}><Icon name="pin" /> {branch.area}</span>
      <h3>{branch.name}</h3>
    </div>
    <div className={styles.details}>
      <p className={styles.address}>{branch.address}<br />{branch.city}, {branch.state} - {branch.pincode}</p>
      <p className={styles.timings}><Icon name="clock" /><span><strong>Opening hours</strong>{branch.timings}</span></p>
    </div>
    <div className={`${styles.actions}${branch.phone ? "" : ` ${styles.actionsTwo}`}`}>
      <a className={styles.actionLight} href={directions} target="_blank" rel="noopener noreferrer"><Icon name="pin" /> Directions</a>
      {branch.phone && <a className={styles.actionLight} href={`tel:${branch.phone}`}><Icon name="phone" /> Call Branch</a>}
      <a className={styles.actionGold} href="#booking"><Icon name="calendar" /> Book Appointment</a>
    </div>
  </article>;
}

export default function BranchLocations() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const trackRef = useRef(null);
  const loopResetRef = useRef(null);
  const visibleCount = useSyncExternalStore(subscribeToCardLayout, isSingleCardLayout, () => false) ? 1 : 2;
  const cities = useMemo(() => [
    "Bangalore",
    "Chennai",
    ...[...new Set(branches.map(branch => cityName(branch.city)).filter(Boolean))]
      .filter(value => !/^(bangalore|chennai)$/i.test(value)).sort(),
  ], [branches]);
  const city = selectedCity;
  const visibleBranches = useMemo(() => {
    const term = searchQuery.trim().toLocaleLowerCase();
    return branches.filter(branch => cityName(branch.city) === city && (!term || [branch.name, branch.area, branch.address, branch.pincode].some(value => String(value || "").toLocaleLowerCase().includes(term))));
  }, [branches, city, searchQuery]);
  const carouselBranches = visibleBranches.length > 1
    ? [...visibleBranches, ...visibleBranches.slice(0, visibleCount)]
    : visibleBranches;
  const maxIndex = Math.max(0, visibleBranches.length - 1);
  const currentIndex = Math.min(activeIndex, maxIndex);

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

  useEffect(() => {
    clearTimeout(loopResetRef.current);
    trackRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }, [city, searchQuery]);

  useEffect(() => {
    if (visibleBranches.length < 2 || autoScrollPaused) return;
    const timer = setInterval(() => {
      if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const track = trackRef.current;
      if (!track) return;
      const step = track.children[1]?.offsetLeft - track.children[0]?.offsetLeft || track.clientWidth;
      const position = Math.round(track.scrollLeft / step);
      track.scrollTo({ left: (position + 1) * step, behavior: "smooth" });
    }, 4500);
    return () => clearInterval(timer);
  }, [visibleBranches.length, autoScrollPaused, city, searchQuery, visibleCount]);

  useEffect(() => () => clearTimeout(loopResetRef.current), []);

  function goTo(index) {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(index, visibleBranches.length));
    const step = track.children[1]?.offsetLeft - track.children[0]?.offsetLeft || track.clientWidth;
    track.scrollTo({ left: target * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    setActiveIndex(target % visibleBranches.length);
  }

  function selectCity(nextCity) {
    setSelectedCity(nextCity);
    setSearchDraft("");
    setSearchQuery("");
    setActiveIndex(0);
    trackRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }

  return <section className={styles.section} id="branches" aria-labelledby="branches-title">
    <div className={styles.backdrop}>
      <div className="container">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>OUR LOCATIONS</p>
          <h2 id="branches-title">Find Aryan Gold Buyers<br /><span>Near You</span></h2>
          <p className={styles.subtitle}>Find a nearby branch for a personal gold valuation.</p>
          <div className={styles.cityTabs} aria-label="Choose a city">
            {cities.map(option => <button key={option} type="button" className={option === city ? styles.cityActive : styles.cityTab} onClick={() => selectCity(option)} aria-pressed={option === city}>{option}</button>)}
          </div>
          <form className={styles.search} role="search" onSubmit={event => { event.preventDefault(); setSearchQuery(searchDraft); setActiveIndex(0); }}>
            <label className={styles.srOnly} htmlFor="branch-search">Search branches by area or PIN code</label>
            <input id="branch-search" type="search" value={searchDraft} onChange={event => setSearchDraft(event.target.value)} placeholder="Search by area or PIN code" autoComplete="off" />
            <button type="submit" aria-label="Search branches"><Icon name="search" /></button>
          </form>
        </div>
      </div>
    </div>
    <div className={"container " + styles.results}
      onMouseEnter={() => setAutoScrollPaused(true)}
      onMouseLeave={() => setAutoScrollPaused(false)}
      onFocusCapture={() => setAutoScrollPaused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setAutoScrollPaused(false); }}>
      {loading ? <p className={styles.notice} role="status">Loading branch locations...</p> : error ? <div className={styles.notice} role="status">Branch locations are temporarily unavailable. <button type="button" onClick={() => { setLoading(true); setAttempt(value => value + 1); }}>Try again</button></div> :
        !branches.length ? <p className={styles.notice}>Branch locations will be listed here soon. <a href="#booking">Book a valuation</a> for assistance.</p> :
        !visibleBranches.length ? <div className={styles.notice} role="status">{searchQuery ? <>No branches found for “{searchQuery}” in {city}. <button type="button" onClick={() => { setSearchDraft(""); setSearchQuery(""); }}>Clear search</button></> : <>No branches are currently listed in {city}. <a href="#booking">Book a valuation</a> for assistance.</>}</div> :
        <>
          <div className={styles.track} ref={trackRef} role="region" aria-roledescription="carousel" aria-label={`${city} branch locations`} tabIndex={0}
            onScroll={event => {
            const track = event.currentTarget;
            const step = track.children[1]?.offsetLeft - track.children[0]?.offsetLeft || track.clientWidth;
            const position = Math.round(track.scrollLeft / step);
            setActiveIndex(position % visibleBranches.length);
            clearTimeout(loopResetRef.current);
            if (position >= visibleBranches.length) {
              loopResetRef.current = setTimeout(() => track.scrollTo({ left: 0, behavior: "instant" }), 180);
            }
          }}>
            {carouselBranches.map((branch, index) => <div className={styles.slide} key={branch.id + "-" + index} role="group" aria-roledescription="slide" aria-label={`${index % visibleBranches.length + 1} of ${visibleBranches.length}: ${branch.name}`}><BranchCard branch={branch} /></div>)}
          </div>
          {visibleBranches.length > 1 && <div className={styles.carouselFooter}>
            <span className={styles.count} aria-live="polite">Branch {currentIndex + 1} of {visibleBranches.length}</span>
            <div className={styles.controls} aria-label="Branch carousel controls">
              <button type="button" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} aria-label="Previous branch">←</button>
              <button type="button" onClick={() => goTo(currentIndex + 1)} aria-label="Next branch">→</button>
            </div>
          </div>}
        </>}
    </div>
  </section>;
}
