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
