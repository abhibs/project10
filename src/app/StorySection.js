import Image from "next/image";
import styles from "./story.module.css";

const values = [
  { label: "Transparency", icon: "shield" },
  { label: "Technology", icon: "technology" },
  { label: "Competitive Value", icon: "value" },
  { label: "Customer Focus", icon: "customer" },
];

function ValueIcon({ name }) {
  const drawing = {
    shield: <><path d="M12 2.8 20 6v5.4c0 5-3.4 8.4-8 10.2-4.6-1.8-8-5.2-8-10.2V6l8-3.2Z" /><path d="m8.5 12 2.3 2.3 4.8-5" /></>,
    technology: <><rect x="5" y="5" width="14" height="14" rx="3" /><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" /><circle cx="12" cy="12" r="3" /></>,
    value: <><circle cx="12" cy="12" r="9" /><path d="M8.5 8h7M8.5 11h7M10 8c4.5 0 5 4.5 0 4.5h-.8l5.4 4.8" /></>,
    customer: <><circle cx="12" cy="8" r="3.2" /><path d="M5.4 20c.5-4 2.8-6 6.6-6s6.1 2 6.6 6" /><circle cx="12" cy="12" r="9" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawing[name]}</svg>;
}

export default function StorySection() {
  return <section className={styles.section} id="our-story" aria-labelledby="story-title">
    <div className={"container " + styles.shell}>
      <Image className={styles.photo} src="/story-reception.webp" alt="Warm reception interior with a cream counter and gold accents" fill sizes="(max-width: 760px) 100vw, 92vw" />
      <div className={styles.wallBrand} aria-hidden="true">
        <Image src="/aryan-mark.png" alt="" width={82} height={82} />
        <span>ARYAN GOLD</span>
      </div>
      <div className={styles.content}>
        <h2 id="story-title">A New Approach<br />To Gold Buying.</h2>
        <p className={styles.description}>Aryan Gold Buyers puts your trust first. Our clear process, modern testing and personal service help you make a confident decision about your gold.</p>
        <ul className={styles.values}>
          {values.map(value => <li key={value.label}><span className={styles.icon}><ValueIcon name={value.icon} /></span><span>{value.label}</span></li>)}
        </ul>
        <a className={styles.button} href="#why-aryan">Our Story <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>;
}
