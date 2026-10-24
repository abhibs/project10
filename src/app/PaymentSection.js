import Image from "next/image";
import styles from "./payment.module.css";

const benefits = [
  { title: "Easy Checkout", detail: "Review your purchase before payment.", icon: "bolt", tone: "gold" },
  { title: "Multiple Payment Options", detail: "Choose a convenient available method.", icon: "coins", tone: "red" },
  { title: "Safe Transactions", detail: "A clear, secure process from start to finish.", icon: "shield", tone: "gold" },
  { title: "GST Bill", detail: "Keep a bill for your gold purchase.", icon: "receipt", tone: "red" },
];


function PaymentIcon({ name }) {
  const paths = {
    bolt: <path d="m14 2-9 11h7l-2 9 9-11h-7l2-9Z" />,
    coins: <><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v5c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 11v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" /></>,
    shield: <><path d="M12 2 4 5v6c0 5.4 3.2 9 8 11 4.8-2 8-5.6 8-11V5l-8-3Z" /><path d="m8.5 12 2.5 2.5 4.8-5" /></>,
    receipt: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
    cash: <><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M5 9a3 3 0 0 0 3-3M19 15a3 3 0 0 0-3 3" /></>,
    phone: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M10 18h4M8 8h8M8 11h8M8 14h5" /></>,
    bank: <><path d="m2 9 10-6 10 6H2ZM4 20h16M2 22h20M6 9v11M10 9v11M14 9v11M18 9v11" /></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h5" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function PaymentSection() {
  return <section className={styles.section} aria-labelledby="payment-title">
    <div className={styles.hero}>
      <div className={styles.photo}>
        <Image src="/gold-purchase-handover.webp" alt="Customer receiving newly purchased gold jewellery in a presentation box" width={1800} height={771} sizes="(max-width: 1100px) 100vw, 50vw" />
      </div>
      <div className={styles.content}>
        <span className={styles.eyebrow}>Complete Your Gold Purchase</span>
        <h2 id="payment-title">Your Chosen Gold.<br /><span>Ready for You.</span></h2>
        <p className={styles.intro}>Review your selection and price breakdown, complete payment, and receive your gold jewellery with your purchase bill.</p>
        <div className={styles.benefits}>
          {benefits.map(({ title, detail, icon, tone }) => <div className={styles.benefit} key={title}>
            <span className={`${styles.benefitIcon} ${styles[tone]}`}><PaymentIcon name={icon} /></span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}
