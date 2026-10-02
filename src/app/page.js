import GoldHomepage from "./GoldHomepage";
import "./home.css";
import { Manrope, Playfair_Display } from "next/font/google";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-aryan-body",
  display: "swap",
});

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-aryan-display",
  display: "swap",
});

export const metadata = {
  title: "Aryan Gold | Sell Gold for Instant Cash",
  description: "Aryan Gold — cash for gold, pledged gold release and doorstep valuation services.",
};

export default function Home() {
  return (
    <div className={`${bodyFont.variable} ${displayFont.variable}`}>
      <GoldHomepage />
    </div>
  );
}
