import ServicePage from "../ServicePage";
import { SERVICE_PAGES } from "@/lib/service-pages.mjs";
import { getPageSeoMetadata } from "@/lib/seo-metadata";

export async function generateMetadata() {
  return getPageSeoMetadata("/services/release-pledged-gold", { title: SERVICE_PAGES["release-pledged-gold"].title + " | Aryan Gold Buyers", description: SERVICE_PAGES["release-pledged-gold"].description });
}

export default function Page() { return <ServicePage service="release-pledged-gold" />; }
