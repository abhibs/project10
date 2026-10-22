import { getPageSeoMetadata } from "@/lib/seo-metadata";
import { Manrope, Playfair_Display } from "next/font/google";
import CalculatorPage from "./CalculatorPage";
import "../home.css";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-aryan-body", display: "swap" });
const displayFont = Playfair_Display({ subsets: ["latin"], variable: "--font-aryan-display", display: "swap" });

const defaultMetadata = {
  title: "Gold Calculator | Aryan Gold Buyers",
  description: "Estimate your gold’s value by weight using the current 24K gold rate at Aryan Gold Buyers.",
};

export async function generateMetadata() {
  return getPageSeoMetadata("/gold-rate-calculation", defaultMetadata);
}

export default function Page() {
  return <div className={`${bodyFont.variable} ${displayFont.variable}`}><CalculatorPage /></div>;
}

