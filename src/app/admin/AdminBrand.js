import Image from "next/image";
import Link from "next/link";
import styles from "./theme.module.css";

export default function AdminBrand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Aryan Gold Buyers home">
      <Image className={styles.logo} src="/logo.jpeg" width={56} height={56} alt="Aryan Gold Buyers logo" />
      <span><small>GOLD</small><strong>ARYAN</strong><small>BUYERS</small></span>
    </Link>
  );
}
