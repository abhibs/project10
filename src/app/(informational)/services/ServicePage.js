import Image from "next/image";
import Link from "next/link";
import ServiceForm from "./ServiceForm";
import { SERVICE_PAGES } from "@/lib/service-pages.mjs";
import styles from "./service-page.module.css";

export default function ServicePage({ service }) {
  const details = SERVICE_PAGES[service];
  return <section className={styles.section}>
    <div className="container">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/services">Services</Link><span>/</span><span>{details.title}</span></nav>
      <div className={styles.grid}>
        <article className={styles.content}>
          <div className={styles.image}><Image src={details.image} alt={details.alt} fill sizes="(max-width: 800px) 100vw, 55vw" priority /></div>
          <div className={styles.copy}><p className={styles.eyebrow}>ARYAN GOLD BUYERS</p><h1>{details.title}</h1><p>{details.description}</p><ul>{details.points.map((point) => <li key={point}>{point}</li>)}</ul></div>
        </article>
        <ServiceForm service={service} />
      </div>
    </div>
  </section>;
}
