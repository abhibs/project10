import { Manrope, Playfair_Display } from "next/font/google";
import styles from "./theme.module.css";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-admin-body", display: "swap" });
const displayFont = Playfair_Display({ subsets: ["latin"], variable: "--font-admin-display", display: "swap" });

export const metadata = {
  title: "Aryan Gold | Admin Panel",
  description: "Manage Aryan Gold enquiries, gold rates and your account.",
  icons: { icon: "/logo.jpeg" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className={`${styles.theme} ${bodyFont.variable} ${displayFont.variable}`}>{children}</div>;
}
