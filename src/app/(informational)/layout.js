import { Manrope, Playfair_Display } from "next/font/google";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import "../home.css";
import "./pages.css";
const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-aryan-body", display: "swap" });
const displayFont = Playfair_Display({ subsets: ["latin"], variable: "--font-aryan-display", display: "swap" });
export default function Layout({ children }) {
  return <div className={`${bodyFont.variable} ${displayFont.variable}`}>
    <div className="aryan-home information-page" data-theme="light">
      <SiteHeader /><main>{children}</main><SiteFooter />
    </div>
  </div>;
}
