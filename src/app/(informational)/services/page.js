import { getPageSeoMetadata } from "@/lib/seo-metadata";
import ServicesSection from "../../ServicesSection";
const defaultMetadata = { title: "Services | Aryan Gold Buyers" };

export async function generateMetadata() {
  return getPageSeoMetadata("/services", defaultMetadata);
}
export default function Page() { return <ServicesSection standalone />; }
