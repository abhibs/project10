"use client";
import Link from "next/link";
import Image from "next/image";
import { branchPath, branchDirections } from "@/lib/branch-links.mjs";
import { getBranchCarouselItems } from "@/lib/branch-carousel.mjs";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import styles from "./branches.module.css";

const cardLayoutQueries = ["(max-width: 600px)", "(max-width: 900px)", "(max-width: 1200px)"];
function subscribeToCardLayout(callback) {
  const queries = cardLayoutQueries.map(query => window.matchMedia(query));
  queries.forEach(query => query.addEventListener("change", callback));
  return () => queries.forEach(query => query.removeEventListener("change", callback));
}
function visibleCardCount() {
  const index = cardLayoutQueries.findIndex(query => window.matchMedia(query).matches);
  return index < 0 ? 4 : index + 1;
}

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
    pause: <path d="M9 5v14M15 5v14" />,
    play: <path d="m8 5 11 7-11 7V5Z" />,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function BranchCard({ branch }) {
  const [failedImage, setFailedImage] = useState(null);
  const uploadedImage = branch.image ? `/api/branch-images/${encodeURIComponent(branch.image)}` : null;
  const image = uploadedImage && failedImage !== uploadedImage ? uploadedImage : "/branches-storefront.webp";
  const path = branchPath(branch);
  const directions = branchDirections(branch);

  return <article className={styles.card}>
    <div className={styles.cardImage}>
      <Image src={image} alt={image === uploadedImage ? `${branch.name} branch in ${branch.city}` : "Aryan Gold Buyers branch exterior"} fill sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, (max-width: 1200px) 30vw, 25vw" onError={() => { if (uploadedImage && failedImage !== uploadedImage) setFailedImage(uploadedImage); }} />
    </div>
    <div className={styles.cardBody}>
      <div className={styles.cardTop}>
        <span className={styles.locationTag}><Icon name="pin" /> {branch.area}</span>
        <h3>{branch.name}</h3>
      </div>
      <div className={styles.details}>
        <p className={styles.address}>{branch.address}<br />{branch.city}, {branch.state} - {branch.pincode}</p>
        <p className={styles.timings}><Icon name="clock" /><span><strong>Opening hours</strong>{branch.timings}</span></p>
      </div>
      <div className={styles.actions}>
        <Link className={styles.actionPrimary} href={path}>Read More <span aria-hidden="true">→</span></Link>
        <a className={styles.actionLight} href={directions} target="_blank" rel="noopener noreferrer"><Icon name="pin" /> Directions</a>
        {branch.phone && <a className={styles.actionLight} href={`tel:${branch.phone}`}><Icon name="phone" /> Call Branch</a>}
      </div>
    </div>
  </article>;
}

export default function BranchLocations({ standalone = false, initialBranches = [] }) {
  const [branches, setBranches] = useState(initialBranches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedCity, setSelectedCity] = useState(initialBranches[0] ? cityName(initialBranches[0].city) : "Bangalore");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const autoScrollPaused = hoverPaused || focusPaused || manuallyPaused;
  const trackRef = useRef(null);
  const loopResetRef = useRef(null);
  const visibleCount = useSyncExternalStore(subscribeToCardLayout, visibleCardCount, () => 4);
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
  const carouselBranches = useMemo(() => getBranchCarouselItems(visibleBranches, visibleCount), [visibleBranches, visibleCount]);
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
        if (!disposed && controller === current) { setError(true); }
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
  }, [city, searchQuery, visibleCount]);

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

  const Heading = standalone ? "h1" : "h2";
  return <section className={styles.section} id="branches" aria-labelledby="branches-title">
    <div className={styles.backdrop}>
      <div className="container">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>OUR LOCATIONS</p>
          <Heading id="branches-title">Find Aryan Gold Buyers<br /><span>Near You</span></Heading>
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
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false); }}>
      {loading ? <p className={styles.notice} role="status">Loading branch locations...</p> : error && !branches.length ? <div className={styles.notice} role="status">Branch locations are temporarily unavailable. <button type="button" onClick={() => { setLoading(true); setAttempt(value => value + 1); }}>Try again</button></div> :
        !branches.length ? <p className={styles.notice}>Branch locations will be listed here soon. <Link href="/#booking">Book a valuation</Link> for assistance.</p> :
        !visibleBranches.length ? <div className={styles.notice} role="status">{searchQuery ? <>No branches found for “{searchQuery}” in {city}. <button type="button" onClick={() => { setSearchDraft(""); setSearchQuery(""); }}>Clear search</button></> : <>No branches are currently listed in {city}. <Link href="/#booking">Book a valuation</Link> for assistance.</>}</div> :
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
            <span className={styles.count} aria-live={autoScrollPaused ? "polite" : "off"}>Branch {currentIndex + 1} of {visibleBranches.length}</span>
            <div className={styles.controls} aria-label="Branch carousel controls">
              <button type="button" onClick={() => setManuallyPaused(value => !value)} aria-pressed={manuallyPaused} aria-label={manuallyPaused ? "Start automatic branch scrolling" : "Pause automatic branch scrolling"}><Icon name={manuallyPaused ? "play" : "pause"} /></button>
              <button type="button" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} aria-label="Previous branch">←</button>
              <button type="button" onClick={() => goTo(currentIndex + 1)} aria-label="Next branch">→</button>
            </div>
          </div>}
        </>}
    <details><summary>All branch addresses and opening hours</summary>{branches.map(branch => <div key={branch.id}><h3><Link href={branchPath(branch)}>{branch.name}</Link></h3><p>{branch.address}, {branch.city}, {branch.state} {branch.pincode}</p><p>{branch.timings}</p><a href={branchDirections(branch)}>Directions</a></div>)}<Link href="/contact-us">Contact our team for branch assistance</Link></details>
    </div>
  </section>;
}
