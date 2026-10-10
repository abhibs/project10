export function isAllowedBranchOrigin(request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin") return true;
  if (fetchSite === "cross-site" || fetchSite === "same-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    if (origin === new URL(request.url).origin) return true;

    // Behind a reverse proxy, request.url may contain an internal host.
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.slice(0, -1);
    return !!host && origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}
