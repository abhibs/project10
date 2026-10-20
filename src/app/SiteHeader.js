"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";

export default function SiteHeader({ progressRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
        <nav className={`main-nav${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }} id="main-nav" aria-label="Primary navigation">
          {[
            ["/about-us", "About Us"],
            ["/gold-rate", "Gold Rate"],
            ["/gold-rate-calculation", "Gold Rate Calculation"],
            ["/services", "Services"],
            ["/branches", "Branches"],
            ["/contact-us", "Contact Us"],
          ].map(([href, label]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        <a className="btn btn-gold nav-cta" href={`${home}#booking`}>
          Get Free Gold Valuation <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
