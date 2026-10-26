import { getPageSeoMetadata } from "@/lib/seo-metadata";
import styles from "./page.module.css";

const steps = [
  { title: "Place Your Item", description: "Keep your gold item on the testing machine.", icon: "item" },
  { title: "XRF Analysis", description: "Advanced technology analyses purity instantly.", icon: "scan" },
  { title: "View Results", description: "See the purity details on screen.", icon: "report" },
  { title: "Get Valuation", description: "We offer a fair price based on verified purity.", icon: "check" },
];

function StepIcon({ type }) {
  const paths = {
    check: <><circle cx="24" cy="24" r="19"/><path d="m14 24 7 7 14-15"/></>,
    item: <><ellipse cx="24" cy="18" rx="17" ry="7"/><path d="M7 18v12c0 4 8 7 17 7s17-3 17-7V18M7 24c0 4 8 7 17 7s17-3 17-7"/></>,
    scan: <><path d="M5 17V7h10M33 7h10v10M43 31v10H33M15 41H5V31"/><path d="m24 15 9 9-9 9-9-9 9-9Z"/></>,
    report: <><path d="M12 5h18l7 7v31H12V5Z"/><path d="M30 5v8h7M18 21h13M18 27h13M18 33h10"/></>,
  };
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export async function generateMetadata() {
  return getPageSeoMetadata("/how-it-works", {
    title: "Gold Testing in 4 Simple Steps | Aryan Gold Buyers",
    description: "Place your gold item, complete XRF analysis, view the purity results and get a valuation based on verified purity.",
  });
}

export default function HowItWorksPage() {
  return <div className={styles.page}>
    <section className="container" aria-labelledby="how-it-works-title">
      <header className={styles.heading}>
        <p className={styles.eyebrow}>HOW IT WORKS</p>
        <h1 className={styles.title} id="how-it-works-title">Gold Testing in 4 Simple Steps</h1>
      </header>
      <ol className={styles.steps}>
        {steps.map(({ title, description, icon }, index) => <li className={styles.step} key={icon}>
          <span className={styles.icon}><StepIcon type={icon} /></span>
          <h2>{title}</h2>
          <p>{description}</p>
          {index < steps.length - 1 && <span className={styles.connector} aria-hidden="true">&rarr;</span>}
        </li>)}
      </ol>
    </section>
  </div>;
}
