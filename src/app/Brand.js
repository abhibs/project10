import Image from "next/image";
import styles from "./brand.module.css";

export default function Brand({ href = "/", className = "" }) {
  return (
    <a href={href} className={`${styles.brand} ${className}`} aria-label="Aryan Gold Buyers home">
      <Image className={styles.mark} src="/aryan-mark.png" width={64} height={64} alt="" />
      <span className={styles.wordmark}><span>ARYAN</span><span>Gold Buyers</span></span>
    </a>
  );
}
