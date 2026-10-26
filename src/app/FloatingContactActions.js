"use client";

import { usePathname } from "next/navigation";
import styles from "./floating-contact-actions.module.css";

export default function FloatingContactActions() {
  const pathname = usePathname();
  if (!pathname || pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return <div className={styles.actions} role="group" aria-label="Contact Aryan Gold Buyers">
    <a href="tel:+919117125555" aria-label="Call Aryan Gold Buyers on +91 9117 125 555">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 3 3 5-2 2a15 15 0 0 0 6 6l2-2 5 3-1 4C10 22 2 14 3 4l4-1Z" /></svg>
      <span>+91 9117 125 555</span>
    </a>
    <a className={styles.whatsapp} href="https://wa.me/919117125555" target="_blank" rel="noopener noreferrer" aria-label="Check Your Gold Value on WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4.1Z" /><path d="m8.3 7.3 1.2 2.5-1 1.1a9 9 0 0 0 4.6 4.2l1-1.2 2.6 1.1c-.3 1.5-1.2 2.1-2.7 1.8-4.4-.8-7.5-4-8.1-7.7-.2-1.3.6-2.2 2.4-1.8Z" /></svg>
      <span>Check Your Gold Value</span>
    </a>
  </div>;
}
