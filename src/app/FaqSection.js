import Image from "next/image";
import styles from "./faq.module.css";

const questions = [
  {
    question: "Do you scratch gold during testing?",
    answer: "Our testing process is designed to avoid scratching or cutting suitable items. We explain the method before we begin.",
  },
  {
    question: "How is my gold price calculated?",
    answer: "The offer is based on verified weight, purity and the applicable gold rate. We explain the calculation before you decide.",
  },
  {
    question: "Do I have to sell after evaluation?",
    answer: "No. You can review the valuation and decide whether you want to sell.",
  },
  {
    question: "Can I sell gold without a bill?",
    answer: "Please contact our team before your visit if you do not have a purchase bill. They can confirm which documents are needed.",
  },
  {
    question: "Do you buy gold without hallmarking?",
    answer: "Unhallmarked gold can be considered after testing, subject to our buying criteria and verification.",
  },
  {
    question: "What documents should I carry?",
    answer: "Bring a valid government-issued ID and any available purchase documents. Our team will confirm if anything else is needed.",
  },
  {
    question: "Can Aryan release pledged gold?",
    answer: "We can discuss assistance with pledged gold. The process depends on your lender, documents and outstanding amount.",
  },
  {
    question: "How quickly will I receive payment?",
    answer: "Our team will explain the available payment method and timing after verification, before you accept an offer.",
  },
];

function ContactIcon({ name }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "pin"
      ? <><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></>
      : <><rect x="3" y="4" width="18" height="15" rx="3" /><path d="m7 19-2 3v-4M8 9h8M8 13h5" /></>}
  </svg>;
}

export default function FaqSection() {
  return <section className={styles.section} id="faq" aria-labelledby="faq-title">
    <div className={"container " + styles.shell}>
      <div className={styles.layout}>
        <div className={styles.questions}>
          <h2 id="faq-title">Frequently<br />Asked Questions</h2>
          <div className={styles.list}>
            {questions.map(({ question, answer }) => <details className={styles.item} key={question}>
              <summary><span className={styles.questionIcon} aria-hidden="true">?</span><span>{question}</span><span className={styles.toggle} aria-hidden="true">+</span></summary>
              <p className={styles.answer}>{answer}</p>
            </details>)}
          </div>
        </div>
        <aside className={styles.aside} aria-label="More help">
          <div className={styles.image}>
            <Image src="/faq-jewellery.webp" alt="Gold necklace and bangles displayed in a jewellery showroom" fill sizes="(max-width: 760px) 90vw, 38vw" />
          </div>
          <h3>Still have questions?<br />Talk to our team.</h3>
          <div className={styles.actions}>
            <a className={styles.call} href="#branches"><ContactIcon name="pin" /><span>Find a Branch</span></a>
            <a className={styles.message} href="#booking"><ContactIcon name="message" /><span>Book a Visit</span></a>
          </div>
        </aside>
      </div>
    </div>
  </section>;
}
