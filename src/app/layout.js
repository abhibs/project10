import "./globals.css";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
