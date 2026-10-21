import { getPageSeoMetadata } from "@/lib/seo-metadata";
import BranchLocations from "../../BranchLocations";
const defaultMetadata = { title: "Branches | Aryan Gold Buyers" };

export async function generateMetadata() {
  return getPageSeoMetadata("/branches", defaultMetadata);
}
export default function Page() { return <BranchLocations standalone />; }
