import { getPageSeoMetadata } from "@/lib/seo-metadata";
import { Manrope, Playfair_Display } from "next/font/google";
import ContactPage from "./ContactPage";
import "../home.css";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-aryan-body", display: "swap" });
const displayFont = Playfair_Display({ subsets: ["latin"], variable: "--font-aryan-display", display: "swap" });

const defaultMetadata = {
  title: "Contact Us | Aryan Gold Buyers",
  description: "Contact Aryan Gold Buyers for gold valuation, branch information, pledged gold release and assistance.",
};

export async function generateMetadata() {
  return getPageSeoMetadata("/contact-us", defaultMetadata);
}

export default function Page() {
  return <>
    <div className={`${bodyFont.variable} ${displayFont.variable}`}><ContactPage /></div>
  </>;
}
