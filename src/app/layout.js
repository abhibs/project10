import "./globals.css";
import ContactAttribution from "./ContactAttribution";
import GoogleTagManager, { GoogleTagManagerNoScript } from "./GoogleTagManager";
import FloatingContactActions from "./FloatingContactActions";

export const metadata = {
  title: "Larkon Admin",
  description: "Project 10 admin portal",
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        {/* Share one Google tag loader for Google Ads and Analytics. */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18497186303" />
        <script
          id="google-ads-tag"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18497186303');
gtag('config', 'G-ZCN1VRN9HD');`,
          }}
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
