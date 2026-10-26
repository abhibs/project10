import Link from "next/link";
import { getPageSeoMetadata } from "@/lib/seo-metadata";
import DocumentIcon from "./DocumentIcon";
import styles from "./page.module.css";

const requirements = [
  {
    id: "physical-gold", title: "Physical gold", icon: "gold",
    description: "Bring the following when selling your gold ornaments.",
    items: [
      { label: "PAN card", icon: "pan" },
      { label: "Aadhaar card", icon: "aadhaar" },
      { label: "Gold ornaments", icon: "ornaments" },
    ],
    service: "/services/sell-gold", serviceLabel: "About selling physical gold",
  },
  {
    id: "release-pledged-gold", title: "Release pledged gold", icon: "document",
    description: "Bring these documents for pledged gold release.",
    items: [
      { label: "Pledge slip", icon: "pledge" },
      { label: "Cheque leaf", icon: "cheque" },
      { label: "Bank passbook", icon: "passbook" },
      { label: "PAN card", icon: "pan" },
      { label: "Aadhaar card", icon: "aadhaar" },
    ],
    service: "/services/release-pledged-gold", serviceLabel: "About releasing pledged gold",
  },
];

export async function generateMetadata() {
  return getPageSeoMetadata("/documents", {
    title: "Documents Required to Sell Gold | Aryan Gold Buyers",
    description: "Check what to bring to sell physical gold or release pledged gold: PAN card, Aadhaar card, gold ornaments, pledge slip, cheque leaf and bank passbook.",
  });
}

export default function DocumentsPage() {
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="documents-title">
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Documents</span></nav>
        <p className={styles.eyebrow}>BEFORE YOUR VISIT</p>
        <h1 id="documents-title">Documents required<br />to sell gold</h1>
        <p className={styles.intro}>Check the documents and items to bring for selling physical gold or releasing pledged gold.</p>
      </div>
    </section>

    <div className={`container ${styles.content}`}>
      <div className={styles.groups}>
        {requirements.map(({ id, title, icon, description, items, service, serviceLabel }) => <section className={styles.group} key={id} aria-labelledby={`${id}-title`}>
          <div className={styles.groupHeader}>
            <div><span className={styles.count}>{items.length} required {icon === "gold" ? "items" : "documents"}</span><h2 id={`${id}-title`}>{title}</h2><p className={styles.description}>{description}</p></div>
            <Link className={styles.serviceLink} href={service}>{serviceLabel}<span aria-hidden="true">→</span></Link>
          </div>
          <ul className={styles.documentGrid}>{items.map(({ label, icon }) => <li className={styles.documentCard} key={icon}><span className={styles.documentIcon}><DocumentIcon type={icon} /></span><h3>{label}</h3></li>)}</ul>
        </section>)}
      </div>

      <section className={styles.help} aria-labelledby="visit-title">
        <div><h2 id="visit-title">Ready for your visit?</h2><p>Find your nearest branch or speak with our team.</p></div>
        <div className={styles.actions}><Link className={styles.primary} href="/branches">Find a branch <span aria-hidden="true">→</span></Link><Link href="/contact-us">Contact our team</Link></div>
      </section>
    </div>
  </div>;
}
