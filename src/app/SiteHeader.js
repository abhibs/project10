"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import styles from "./site-navigation.module.css";
import { SERVICE_PAGES } from "@/lib/service-pages.mjs";

export default function SiteHeader({ progressRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
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
        <nav className={`main-nav${menuOpen ? " open" : ""}`} onClick={(event) => { if (event.target.closest("a")) { setMenuOpen(false); setOpenSubmenu(null); } }} onKeyDown={(event) => { if (event.key === "Escape") { setMenuOpen(false); setOpenSubmenu(null); } }} id="main-nav" aria-label="Primary navigation">
          {[
            ["/about-us", "About Us"],
            ["/gold-rate", "Gold Rate"],
            ["/services", "Services"],
            ["/branches", "Branches"],
            ["/contact-us", "Contact Us"],
          ].map(([href, label]) => (
            ["/gold-rate", "/services"].includes(href) ? <div key={href} className={styles.dropdown} onMouseEnter={() => setOpenSubmenu(href)} onMouseLeave={() => setOpenSubmenu(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenSubmenu(null); }}>
              <div className={styles.parentLink}>
                <Link href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>
                <button type="button" aria-label={`${label} submenu`} aria-expanded={openSubmenu === href} aria-controls={`${href.slice(1)}-submenu`} onClick={() => setOpenSubmenu((open) => open === href ? null : href)}><span aria-hidden="true">⌄</span></button>
              </div>
              <div id={`${href.slice(1)}-submenu`} className={styles.submenu} hidden={openSubmenu !== href}>
                {(href === "/services" ? Object.entries(SERVICE_PAGES).map(([slug, service]) => [`/services/${slug}`, service.title]) : [["/gold-rate-calculation", "Gold Rate Calculation"]]).map(([url, title]) => <Link key={url} href={url} aria-current={pathname === url ? "page" : undefined}>{title}</Link>)}
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
