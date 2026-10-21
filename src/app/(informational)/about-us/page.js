import { getPageSeoMetadata } from "@/lib/seo-metadata";
import StorySection from "../../StorySection";
const defaultMetadata = { title: "About Us | Aryan Gold Buyers" };

export async function generateMetadata() {
  return getPageSeoMetadata("/about-us", defaultMetadata);
}
export default function Page() { return <StorySection standalone />; }
