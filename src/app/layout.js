import "./globals.css";
import Script from "next/script";
import ContactAttribution from "./ContactAttribution";
import GoogleTagManager, { GoogleTagManagerNoScript } from "./GoogleTagManager";
import FloatingContactActions from "./FloatingContactActions";

export const metadata = {
  metadataBase: new URL("https://aryangoldbuyers.com"),
  title: "Aryan Gold Buyers",
  description: "Gold buying and valuation services from Aryan Gold Buyers.",
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        {/* Share one Google tag loader for Google Ads and Analytics. */}
        <Script
          id="google-ads-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18497186303');
gtag('config', 'G-ZCN1VRN9HD');`,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18497186303"
          strategy="afterInteractive"
        />
        <GoogleTagManager />
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleTagManagerNoScript />
        <ContactAttribution />
        {children}
        <FloatingContactActions />
      </body>
    </html>
  );
}
