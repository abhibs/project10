export default function DocumentIcon({ type }) {
  const artwork = {
    pan: <>
      <rect x="4" y="6" width="56" height="36" rx="5" fill="#fffdf6" />
      <path d="M5 15h54" stroke="#c5a24c" />
      <path d="M11 11h15M47 11h6" />
      <circle cx="18" cy="24" r="4" fill="#e4eee5" />
      <path d="M11 35v-1a7 7 0 0 1 14 0v1H11ZM32 22h19M32 28h13M32 34h17" />
    </>,
    aadhaar: <>
      <rect x="4" y="6" width="56" height="36" rx="5" fill="#fffdf6" />
      <path d="M11 13h12" stroke="#d99c3c" strokeWidth="3" />
      <path d="M27 13h12" stroke="#d5dfd3" strokeWidth="3" />
      <path d="M43 13h10" strokeWidth="3" />
      <path d="M11 23h12M11 29h9M11 35h12" />
      <path d="M32 31v-5a10 10 0 0 1 20 0v5M36 35V26a6 6 0 0 1 12 0v7M40 36V26a2 2 0 0 1 4 0v10M32 35v1M48 36v1" />
    </>,
    ornaments: <>
      <path d="M14 7c0 18 6 28 18 28S50 25 50 7" stroke="#b78725" strokeWidth="2.5" />
      <path d="M19 8c0 14 4 22 13 22s13-8 13-22" stroke="#d3ad47" />
      <circle cx="32" cy="37" r="7" fill="#f6d779" stroke="#b78725" />
      <path d="m32 33 4 4-4 4-4-4 4-4Z" stroke="#b78725" />
      <circle cx="10" cy="27" r="2.5" fill="#f6d779" stroke="#b78725" />
      <path d="M10 30c-6 7-6 12 0 12s6-5 0-12Z" fill="#f9e6a8" stroke="#b78725" />
      <circle cx="54" cy="27" r="2.5" fill="#f6d779" stroke="#b78725" />
      <path d="M54 30c-6 7-6 12 0 12s6-5 0-12Z" fill="#f9e6a8" stroke="#b78725" />
    </>,
    pledge: <>
      <path d="M15 4h27l7 7v33l-5-3-5 3-5-3-5 3-5-3-5 3-4-3V4Z" fill="#fffdf6" />
      <path d="M42 4v8h7M21 13h13M21 19h21M21 25h12M21 31h8" />
      <circle cx="40" cy="33" r="6.5" fill="#f9e6a8" stroke="#b78725" />
      <path d="m37 33 2 2 4-4" stroke="#b78725" />
    </>,
    cheque: <>
      <rect x="3" y="9" width="58" height="30" rx="3" fill="#fffdf6" />
      <path d="M10 10v28" strokeDasharray="2 3" />
      <path d="M16 16h12M16 23h20M16 28h13" />
      <rect x="42" y="20" width="13" height="9" rx="1.5" fill="#f9e6a8" stroke="#b78725" />
      <path d="M35 34c3-5 3-1 5-3 2-3 2 4 6 1M16 34h3m4 0h3m24 0h5" />
    </>,
    passbook: <>
      <path d="M14 5H50v37H14a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5Z" fill="#e4eee5" />
      <path d="M14 5v31M50 36H14a3 3 0 0 0 0 6" />
      <path d="m23 16 10-5 10 5H23Z" fill="#f9e6a8" stroke="#b78725" />
      <path d="M26 20v8M33 20v8M40 20v8M23 30h20M25 33h16" />
    </>,
  };

  return <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{artwork[type]}</svg>;
}
