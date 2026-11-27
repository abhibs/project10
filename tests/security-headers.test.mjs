import assert from "node:assert/strict";
import test from "node:test";
import config from "../next.config.mjs";

test("security headers cover all routes and separate production from development", async () => {
 const previous = process.env.NODE_ENV;
 try {
  for (const environment of ["production", "development"]) {
   process.env.NODE_ENV = environment;
   const [rule] = await config.headers();
   assert.equal(rule.source, "/:path*");
   const headers = Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
   assert.equal(headers["X-Content-Type-Options"], "nosniff");
   assert.equal(headers["X-Frame-Options"], "DENY");
   assert.match(headers["Permissions-Policy"], /camera=\(\), microphone=\(\), geolocation=\(\)/);
   const csp = headers["Content-Security-Policy"];
   for (const directive of ["default-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'"]) assert.ok(csp.includes(directive));
   for (const origin of ["https://tile.openstreetmap.org", "https://maps.google.com", "https://www.googletagmanager.com", "https://connect.facebook.net"]) assert.ok(csp.includes(origin));
   assert.equal(csp.includes("'unsafe-eval'"), environment === "development");
   assert.equal(csp.includes("ws://localhost:*"), environment === "development");
   assert.equal(csp.includes("upgrade-insecure-requests"), environment === "production");
   assert.equal(headers["Strict-Transport-Security"], environment === "production" ? "max-age=31536000" : undefined);
  }
 } finally {
  if (previous === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous;
 }
});
