import ServicePage from "../ServicePage";
import { SERVICE_PAGES } from "@/lib/service-pages.mjs";
import { getPageSeoMetadata } from "@/lib/seo-metadata";

export async function generateMetadata() {
  return getPageSeoMetadata("/services/doorstep-valuation", { title: SERVICE_PAGES["doorstep-valuation"].title + " | Aryan Gold Buyers", description: SERVICE_PAGES["doorstep-valuation"].description });
}

export default function Page() { return <ServicePage service="doorstep-valuation" />; }
