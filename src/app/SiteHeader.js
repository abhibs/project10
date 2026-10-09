"use client";

import { useState } from "react";
import Link from "next/link";
import Brand from "./Brand";

export default function SiteHeader({ contactPage = false, progressRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const home = contactPage ? "/" : "";

  return (
    <header className="site-header" id="home">
      {!contactPage && <div className="reading-progress" ref={progressRef} aria-hidden="true" />}
      <div className="container nav-wrap">
        <Brand href={contactPage ? "/" : "#home"} className="brand" />
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <span /><span /><span />
        </button>
        <nav className={`main-nav${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }} id="main-nav" aria-label="Primary navigation">
          <a href={`${home}#services`}>Services</a>
          <a href={`${home}#rates`}>Gold Rate</a>
          <a href={`${home}#calculator`}>Calculator</a>
          <a href={`${home}#how-it-works-testing`}>How it works</a>
          <a href={`${home}#branches`}>Branches</a>
          <a href={`${home}#faq`}>FAQ</a>
          <a href={`${home}#booking`}>Book Service</a>
          <Link href="/contact-us" aria-current={contactPage ? "page" : undefined}>Contact Us</Link>
        </nav>
        <a className="btn btn-gold nav-cta" href={`${home}#booking`}>
          Get Free Gold Valuation <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
