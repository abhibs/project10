"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import styles from "./site-navigation.module.css";

export default function SiteHeader({ progressRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [goldMenuOpen, setGoldMenuOpen] = useState(false);
  const pathname = usePathname();
  const innerPage = pathname !== "/";
  const home = innerPage ? "/" : "";

  return (
    <header className="site-header" id="home">
      {!innerPage && <div className="reading-progress" ref={progressRef} aria-hidden="true" />}
      <div className="container nav-wrap">
        <Brand href="/" className="brand" />
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span /><span /><span />
        </button>
        <nav className={`main-nav${menuOpen ? " open" : ""}`} onClick={(event) => { if (event.target.closest("a")) { setMenuOpen(false); setGoldMenuOpen(false); } }} onKeyDown={(event) => { if (event.key === "Escape") { setMenuOpen(false); setGoldMenuOpen(false); } }} id="main-nav" aria-label="Primary navigation">
          {[
            ["/about-us", "About Us"],
            ["/gold-rate", "Gold Rate"],
            ["/services", "Services"],
            ["/branches", "Branches"],
            ["/contact-us", "Contact Us"],
          ].map(([href, label]) => (
            href === "/gold-rate" ? <div key={href} className={styles.dropdown} onMouseEnter={() => setGoldMenuOpen(true)} onMouseLeave={() => setGoldMenuOpen(false)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setGoldMenuOpen(false); }}>
              <div className={styles.parentLink}>
                <Link href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>
                <button type="button" aria-label="Gold Rate submenu" aria-expanded={goldMenuOpen} aria-controls="gold-rate-submenu" onClick={() => setGoldMenuOpen((open) => !open)}><span aria-hidden="true">⌄</span></button>
              </div>
              <div id="gold-rate-submenu" className={styles.submenu} hidden={!goldMenuOpen}>
                <Link href="/gold-rate-calculation" aria-current={pathname === "/gold-rate-calculation" ? "page" : undefined}>Gold Rate Calculation</Link>
              </div>
            </div> : <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        <a className="btn btn-gold nav-cta" href={`${home}#booking`}>
          Get Free Gold Valuation <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
