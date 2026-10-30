"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { branchPath, branchDirections } from "@/lib/branch-links.mjs";
import "leaflet/dist/leaflet.css";
import styles from "./active-branch-map.module.css";

export default function ActiveBranchMap() {
  const router = useRouter();
  const container = useRef(null);
  const [status, setStatus] = useState({ loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let map;
    let observer;

    async function load() {
      try {
        const [response, { default: L }] = await Promise.all([
          fetch("/api/branches", { signal: controller.signal, cache: "no-store" }),
          import("leaflet"),
        ]);
        if (!response.ok) throw new Error("Branches unavailable");
        const data = await response.json();
        if (!Array.isArray(data.branches)) throw new Error("Invalid branch response");
        if (controller.signal.aborted) return;
        const active = data.branches.filter(branch => branch.status === "active");
        const mapped = active.filter(branch =>
          branch.latitude != null && branch.latitude !== "" &&
          branch.longitude != null && branch.longitude !== "" &&
          Number.isFinite(Number(branch.latitude)) && Number.isFinite(Number(branch.longitude)) &&
          Math.abs(Number(branch.latitude)) <= 90 && Math.abs(Number(branch.longitude)) <= 180);

        map = L.map(container.current, { scrollWheelZoom: false }).setView([14, 78], 5);
        const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        tiles.on("tileerror", () => {
          if (!controller.signal.aborted) setStatus(current => ({ ...current, tileError: true }));
        });
        const icon = L.divIcon({ className: styles.marker, iconSize: [16, 16], iconAnchor: [8, 8] });
        for (const branch of mapped) {
          const popup = document.createElement("div");
          popup.className = styles.popup;
          const title = document.createElement("strong");
          title.textContent = branch.name;
          const address = document.createElement("p");
          address.textContent = [branch.address, branch.city, branch.state, branch.pincode].filter(Boolean).join(", ");
          const hours = document.createElement("p");
          hours.textContent = branch.timings || "";
          const details = document.createElement("a");
          details.href = branchPath(branch);
          details.textContent = "View branch";
          const directions = document.createElement("a");
          directions.href = branchDirections(branch);
          directions.textContent = "Get directions";
          directions.target = "_blank";
          directions.rel = "noopener noreferrer";
          popup.append(title, address, hours, details, document.createTextNode(" · "), directions);
          const marker = L.marker([Number(branch.latitude), Number(branch.longitude)], {
            icon, title: branch.name, alt: `View ${branch.name} branch`,
          }).addTo(map).bindPopup(popup, { autoPan: false });
          marker.on("mouseover", () => marker.openPopup());
          marker.on("click", () => router.push(branchPath(branch)));
          marker.getElement()?.addEventListener("focus", () => marker.openPopup());
        }
        if (mapped.length) map.fitBounds(L.latLngBounds(mapped.map(branch => [Number(branch.latitude), Number(branch.longitude)])), { padding: [35, 35], maxZoom: 12 });
        observer = new ResizeObserver(() => map.invalidateSize());
        observer.observe(container.current);
        setStatus({ loading: false, total: active.length, mapped: mapped.length });
      } catch (error) {
        if (controller.signal.aborted) return;
        observer?.disconnect();
        map?.remove();
        map = null;
        setStatus({ loading: false, error: true });
      }
    }
    load();
    return () => { controller.abort(); observer?.disconnect(); map?.remove(); };
  }, [attempt, router]);

  return <section className={styles.section} aria-labelledby="active-branches-title">
    <div className={styles.card}>
      <div className={styles.heading}>
        <div><h2 id="active-branches-title">All Active Branch Locations</h2>
          <p aria-live="polite">{status.loading ? "Loading branch locations…" : status.error ? "Branch locations are temporarily unavailable." : `${status.mapped} active ${status.mapped === 1 ? "branch" : "branches"} mapped`}</p>
        </div>
        <Link href="/branches">View branch list</Link>
      </div>
      <div className={styles.map} ref={container} role="region" aria-label="Interactive map of active Aryan Gold Buyers branches" />
      {(status.loading || status.error || status.mapped === 0 || status.tileError || status.total > status.mapped) && <div className={styles.notice} role="status">
        {status.loading ? "Loading map…" : status.error ? <><span>Unable to load the map. </span><button type="button" onClick={() => { setStatus({ loading: true }); setAttempt(value => value + 1); }}>Try again</button></> : status.tileError ? "Map tiles could not load. Please use the branch list for addresses and directions." : status.total === 0 ? "No active branches are currently available." : `${status.total - status.mapped} active branches do not yet have map coordinates. Find them in the branch list.`}
      </div>}
    </div>
  </section>;
}
