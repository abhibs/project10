import "./globals.css";
import ContactAttribution from "./ContactAttribution";
import GoogleTagManager, { GoogleTagManagerNoScript } from "./GoogleTagManager";

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
        {/* Keep the supplied Google Ads snippet in the initial page head. */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18497186303" />
        <script
          id="google-ads-tag"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18497186303');`,
          }}
        />
        <GoogleTagManager />
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleTagManagerNoScript />
        <ContactAttribution />
        {children}
      </body>
    </html>
  );
}
