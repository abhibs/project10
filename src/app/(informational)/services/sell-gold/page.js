import ServicePage from "../ServicePage";
import { SERVICE_PAGES } from "@/lib/service-pages.mjs";
import { getPageSeoMetadata } from "@/lib/seo-metadata";

export async function generateMetadata() {
  return getPageSeoMetadata("/services/sell-gold", { title: SERVICE_PAGES["sell-gold"].title + " | Aryan Gold Buyers", description: SERVICE_PAGES["sell-gold"].description });
}

export default function Page() { return <ServicePage service="sell-gold" />; }
