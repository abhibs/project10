import GoldHomepage from "./GoldHomepage";
import "./home.css";
import "./booking-refresh.css";
import { Manrope, Playfair_Display } from "next/font/google";
import Script from "next/script";
import GoogleTagManager from "./GoogleTagManager";

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
    <>
      <GoogleTagManager />
      {/* Meta Pixel Code */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2194327534459621');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* Keep the tracking request unoptimized and on Meta's domain. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=2194327534459621&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      <div className={`${bodyFont.variable} ${displayFont.variable}`}>
        <GoldHomepage />
      </div>
    </>
  );
}
