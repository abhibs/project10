import { Manrope, Playfair_Display } from "next/font/google";
import ContactPage from "./ContactPage";
import "../home.css";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-aryan-body", display: "swap" });
const displayFont = Playfair_Display({ subsets: ["latin"], variable: "--font-aryan-display", display: "swap" });

export const metadata = {
  title: "Contact Us | Aryan Gold Buyers",
  description: "Contact Aryan Gold Buyers for gold valuation, branch information, pledged gold release and assistance.",
};

export default function Page() {
  return <>
    <div className={`${bodyFont.variable} ${displayFont.variable}`}><ContactPage /></div>
  </>;
}
