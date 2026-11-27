/** @type {import('next').NextConfig} */
const nextConfig = {
 // Keep metadata in the initial head for scanners that do not execute JavaScript.
 htmlLimitedBots: /.*/,
 images: {
  localPatterns: [
   { pathname: "/**", search: "" },
   { pathname: "/blog-import/**", search: "?v=photo-v2" },
  ],
 },
 async redirects() { return [{source:"/:path*",has:[{type:"host",value:"www.aryangoldbuyers.com"}],destination:"https://aryangoldbuyers.com/:path*",permanent:true}]; },
 async headers() {
  const isDevelopment = process.env.NODE_ENV === "development";
  // Static Next.js pages and the existing tracking snippets require inline scripts.
  // Keep eval and development WebSocket connections out of production.
  const csp = [
   "default-src 'self'",
   `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://connect.facebook.net`,
   "style-src 'self' 'unsafe-inline'",
   "img-src 'self' data: blob: https://tile.openstreetmap.org https://www.googletagmanager.com https://*.google-analytics.com https://www.google.com https://www.google.co.in https://www.googleadservices.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.facebook.com",
   "font-src 'self'",
   `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https://www.google.co.in https://www.googleadservices.com https://*.doubleclick.net https://www.facebook.com${isDevelopment ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
   "frame-src 'self' https://maps.google.com https://www.google.com https://www.googletagmanager.com https://td.doubleclick.net",
   "object-src 'none'",
   "base-uri 'self'",
   "form-action 'self'",
   "frame-ancestors 'none'",
   ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
  return [{
   source: "/:path*",
   headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Do not opt unrelated subdomains into HSTS or preload without checking their TLS setup.
    ...(!isDevelopment ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
   ],
  }];
 }
};
export default nextConfig;
