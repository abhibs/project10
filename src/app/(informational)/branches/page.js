import { getPublicBranches } from "@/lib/public-branches";
import { getPageSeoMetadata } from "@/lib/seo-metadata";
import BranchLocations from "../../BranchLocations";
const defaultMetadata = { title: "Branches | Aryan Gold Buyers" };

export async function generateMetadata() {
  return getPageSeoMetadata("/branches", defaultMetadata);
}
export const dynamic = "force-dynamic";
export default async function Page() { return <BranchLocations standalone initialBranches={await getPublicBranches()} />; }
