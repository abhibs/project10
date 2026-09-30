import Image from "next/image";
import Link from "next/link";
import styles from "./theme.module.css";

export default function AdminBrand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Aryan Gold home">
      <Image className={styles.logo} src="/logo.jpeg" width={56} height={56} alt="Aryan Gold logo" />
      <span><strong>ARYAN</strong><small>GOLD</small></span>
    </Link>
  );
}
