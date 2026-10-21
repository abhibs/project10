import { getPageSeoMetadata } from "@/lib/seo-metadata";
import GoldRatePage from "../../GoldRatePage";
const defaultMetadata = { title: "Gold Rate | Aryan Gold Buyers" };

export async function generateMetadata() {
  return getPageSeoMetadata("/gold-rate", defaultMetadata);
}
export default function Page() { return <GoldRatePage />; }
