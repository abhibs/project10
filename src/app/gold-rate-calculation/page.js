import { getPageSeoMetadata } from "@/lib/seo-metadata";
export { default } from "../calculator/page";
export async function generateMetadata() {
  return getPageSeoMetadata("/gold-rate-calculation", { title: "Gold Calculator | Aryan Gold Buyers", description: "Estimate your gold value by weight at Aryan Gold Buyers." });
}
