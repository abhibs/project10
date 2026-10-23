import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBranches } from "@/lib/admin-db";
import { branchPath, branchDirections, matchesBranchRoute } from "@/lib/branch-links.mjs";
import BranchEnquiry from "../../../BranchEnquiry";
import BranchMap from "../../../BranchMap";
import styles from "../../../branch-detail.module.css";

export const dynamic = "force-dynamic";
const loadBranches = cache(() => getBranches(true));

async function resolveBranch(params) {
  const route = await params;
  const branches = await loadBranches();
  const branch = branches.find((item) => matchesBranchRoute(item, route));
  if (!branch) notFound();
  return { branch, branches };
}

export async function generateMetadata({ params }) {
  const { branch } = await resolveBranch(params);
  const title = `Gold Buyers in ${branch.area}, ${branch.city} | Aryan Gold Buyers`;
  const description = `Visit Aryan Gold Buyers in ${branch.area}, ${branch.city} for transparent gold valuation. Find the branch address, opening hours, directions and request a callback.`;
  return {
    title, description,
    keywords: [`gold buyers in ${branch.area}`, `sell gold in ${branch.city}`, "free gold valuation", "Aryan Gold Buyers"],
    alternates: { canonical: branchPath(branch) },
    openGraph: { title, description, type: "website" },
  };
}

function Icon({ type }) {
  const paths = {
    pin: <><path d="M12 22s7-6 7-13a7 7 0 0 0-14 0c0 7 7 13 7 13Z" /><circle cx="12" cy="9" r="2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>,
    shield: <><path d="m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5Z" /><path d="m8 12 3 3 5-6" /></>,
    gold: <><path d="m3 18 3-11h12l3 11Z" /><path d="M6 7h12M8 11h8M2 21h20" /></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m7 12 3 3 7-7" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

const services = [
  ["01", "Gold jewellery", "Chains, bangles, rings and more. Understand the purity, weight and value of your jewellery before deciding to sell.", "/buy-gold-jewellery.webp", "/services/sell-gold"],
  ["02", "Doorstep valuation", "Prefer an evaluation at home? Ask our team about doorstep availability in your area.", "/service-sell-gold.webp", "/services/doorstep-valuation"],
  ["03", "Pledged gold assistance", "Discuss options for your pledged gold and understand the process before taking the next step.", "/service-pledged-gold.webp", "/services/release-pledged-gold"],
];

export default async function BranchDetailPage({ params }) {
  const { branch } = await resolveBranch(params);
  const image = branch.image ? `/api/branch-images/${encodeURIComponent(branch.image)}` : "/branches-storefront.webp";

  return <article className={styles.page}>
    <section className={styles.hero} aria-labelledby="branch-title">
      <div className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/branches">Branches</Link><span>/</span><span>{branch.state}</span><span>/</span><span>{branch.city}</span><span>/</span><span aria-current="page">{branch.name}</span></nav>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>YOUR NEIGHBOURHOOD GOLD BUYERS · {branch.area}</span>
            <h1 id="branch-title">Your gold.<br />Its true value.<br /><em>Right here in {branch.area}.</em></h1>
            <p>A clear valuation. A confident decision. Visit Aryan Gold Buyers in {branch.city} for a personal evaluation, with every step explained in front of you.</p>
            <div className={styles.heroBenefits}><span><Icon type="shield" /> Non-destructive testing</span><span><Icon type="check" /> No obligation to sell</span></div>
            <div className={styles.heroLocation}><Icon type="pin" /><span><strong>{branch.name}</strong><small>{branch.city}, {branch.state} · {branch.pincode}</small></span></div>
          </div>
          <BranchEnquiry branch={{ name: branch.name, area: branch.area, city: branch.city, branchId: branch.branchId }} />
        </div>
      </div>
    </section>

    <div className={styles.trustStrip}><div className={styles.shell}>
      {[["Free valuation", "Know what your gold is worth"], ["Clear process", "Purity, weight and rate explained"], ["Quick payment", "After verification and formalities"], ["Personal service", `Your local ${branch.city} team`]].map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
    </div></div>

    <section className={styles.section} id="branch-map" aria-labelledby="branch-map-title">
      <div className={styles.shell}>
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>OUR BRANCH NETWORK</span><h2 id="branch-map-title">A familiar face.<br />A location close to you.</h2><p>Find our {branch.name} branch on the map and plan your visit.</p></div>
        <BranchMap branch={branch} />
      </div>
    </section>

    <section className={`${styles.section} ${styles.whiteSection}`} aria-labelledby="visit-title">
      <div className={`${styles.shell} ${styles.visitGrid}`}>
        <div className={styles.branchPhoto}><Image src={image} alt={branch.image ? `Aryan Gold Buyers ${branch.name} branch` : "Aryan Gold Buyers storefront"} fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className={styles.visitCopy}><span className={styles.eyebrow}>COME SAY HELLO</span><h2 id="visit-title">Aryan Gold Buyers<br />in {branch.area}</h2><p>{branch.address}<br />{branch.city}, {branch.state} — {branch.pincode}</p>
          <ul><li><Icon type="pin" /><span>Branch ID: <strong>{branch.branchId}</strong></span></li><li><Icon type="clock" /><span>{branch.timings}</span></li></ul>
          <div className={styles.heroButtons}><a className={styles.tealButton} href={branchDirections(branch)} target="_blank" rel="noopener noreferrer">Get directions ↗</a><Link className={styles.textLink} href="/branches">Explore all branches →</Link></div>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="branch-services-title"><div className={styles.shell}>
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>GOLD SERVICES</span><h2 id="branch-services-title">More possibilities.<br />One transparent process.</h2><p>Explore gold selling and valuation services with our {branch.area} team.</p></div>
      <div className={styles.servicesGrid}>{services.map(([number, title, description, src, href]) => <Link href={href} className={styles.serviceCard} key={number}>
        <div className={styles.serviceImage}><Image src={src} alt="" fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 25vw" /></div>
        <div className={styles.serviceCopy}><span>{number} /</span><h3>{title}</h3><p>{description}</p><strong>Explore service <span aria-hidden="true">↗</span></strong></div>
      </Link>)}</div>
    </div></section>

    <section className={`${styles.section} ${styles.tealSection}`} aria-labelledby="process-title"><div className={`${styles.shell} ${styles.splitSection}`}>
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>THE ARYAN GOLD WAY</span><h2 id="process-title">Your trust matters.<br />At every step.</h2><p>See the process, understand your offer, and make the decision that feels right for you.</p><a className={styles.goldButton} href="#branch-enquiry">Talk to our team →</a></div>
      <div className={styles.processGrid}>{[["01", "A warm welcome", "Tell us about your gold and what you need. We’ll explain how the valuation works."], ["02", "An open evaluation", "Your gold is checked in front of you, with purity and weight clearly explained."], ["03", "A clear offer", "Understand the rate and valuation before you choose whether to go ahead."], ["04", "A considered decision", "Complete verification and payment formalities only when you accept the offer."]].map(([number, title, text]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
    </div></section>

  </article>;
}
