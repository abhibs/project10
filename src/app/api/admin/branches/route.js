import { getBranches, createBranch } from "@/lib/admin-db";
import { authorizeBranchRequest, readBranchForm, branchApiError } from "@/lib/branch-api";
import { validateBranch } from "@/lib/branch-values.mjs";
import { saveBranchImage, discardBranchImage } from "@/lib/branch-images";
import { requireBranchUpsert } from "@/lib/branch-sync.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await authorizeBranchRequest(request);
    return Response.json({ branches: await getBranches() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return branchApiError(error); }
}

export async function POST(request) {
  let image = null;
  try {
    await authorizeBranchRequest(request);
    const form = await readBranchForm(request);
    const branch = validateBranch(form);
    await requireBranchUpsert(branch);
    image = await saveBranchImage(form.get("image"), branch.branchId);
    const saved = await createBranch({ ...branch, image });
    return Response.json({ branch: saved, message: "Branch created and synced successfully." }, { status: 201 });
  } catch (error) {
    if (image) await discardBranchImage(image);
    return branchApiError(error);
  }
}
