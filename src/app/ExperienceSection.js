import Image from "next/image";
import styles from "./experience.module.css";

const benefits = [
  { title: "Explore Designs", detail: "Discover necklaces, bangles and more.", icon: "eye", tone: "gold" },
  { title: "Clear Explanation", detail: "Understand purity, weight and pricing.", icon: "chat", tone: "red" },
  { title: "No Pressure", detail: "Take time to review and decide.", icon: "people", tone: "gold" },
  { title: "Trusted Process", detail: "A clear process at every branch.", icon: "handshake", tone: "red" },
];


function ExperienceIcon({ name }) {
  const paths = {
    eye: <><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    chat: <><path d="M3 4h13a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8l-4 3v-3a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3Z" /><path d="M8 9h7M8 12h5" /></>,
    people: <><circle cx="12" cy="7" r="3" /><path d="M5 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2H5ZM4 13a3 3 0 0 0-2 3v3M20 13a3 3 0 0 1 2 3v3" /></>,
    handshake: <><path d="m2 8 5-4 4 3 2-1 4 1 5 4-4 6-3-1-2 2-3-1-2 1-6-6Z" /><path d="m8 11 3 2 2-2 4 3M10 17l-3-3" /></>,
    chair: <><path d="M5 11V5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6M4 12h16a2 2 0 0 1 2 2v4H2v-4a2 2 0 0 1 2-2ZM5 18v4M19 18v4" /></>,
    cup: <><path d="M3 7h14v8a7 7 0 0 1-14 0V7ZM17 9h2a3 3 0 0 1 0 6h-2M2 21h18M8 2c-1 1 1 2 0 3M12 2c-1 1 1 2 0 3" /></>,
    shield: <><path d="M12 2 4 5v6c0 5.4 3.2 9 8 11 4.8-2 8-5.6 8-11V5l-8-3Z" /><path d="m8.5 12 2.5 2.5 4.8-5" /></>,
    document: <><path d="M6 2h9l4 4v16H6V2ZM15 2v5h4M9 11h7M9 15h7M9 19h5" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function ExperienceSection() {
  return <section className={styles.section} aria-labelledby="experience-title">
    <div className={styles.hero}>
      <div className={styles.heroImage}>
        <Image src="/gold-purchase-selection.webp" alt="Jewellery advisor helping a customer choose new gold jewellery" fill sizes="100vw" />
      </div>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>A Better Gold Buying Experience</span>
        <h2 id="experience-title">Explore Gold.<br /><span>Find Your Favourite.</span></h2>
        <p className={styles.lead}>Explore gold jewellery with guidance on design, purity and pricing, so you can choose with confidence.</p>
        <div className={styles.benefits}>
          {benefits.map(({ title, detail, icon, tone }) => <div className={styles.benefit} key={title}>
            <span className={`${styles.benefitIcon} ${styles[tone]}`}><ExperienceIcon name={icon} /></span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}
