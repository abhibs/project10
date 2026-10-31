/** @type {import('next').NextConfig} */
const nextConfig = {
 async redirects() { return [{source:"/:path*",has:[{type:"host",value:"www.aryangoldbuyers.com"}],destination:"https://aryangoldbuyers.com/:path*",permanent:true}]; },
 async headers() { return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"}]}]; }
};
export default nextConfig;
