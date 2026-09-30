import { findBranchById, updateBranch, deleteBranch } from "@/lib/admin-db";
import { authorizeBranchRequest, readBranchForm, branchApiError } from "@/lib/branch-api";
import { BranchError, validateBranch, validBranchRecordId } from "@/lib/branch-values.mjs";
import { saveBranchImage, discardBranchImage } from "@/lib/branch-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function existingBranch(params) {
  const { id } = await params;
  if (!validBranchRecordId(id)) throw new BranchError("Branch not found.", 404);
  const branch = await findBranchById(id);
  if (!branch) throw new BranchError("Branch not found.", 404);
  return branch;
}

export async function PUT(request, { params }) {
  let image = null;
  try {
    await authorizeBranchRequest(request);
    const current = await existingBranch(params);
    const form = await readBranchForm(request);
    const branch = validateBranch(form);
    image = await saveBranchImage(form.get("image"), branch.branchId);
    const saved = await updateBranch(current.id, {
      ...branch, image: image || (form.get("removeImage") === "true" ? null : current.image),
    });
    if (!saved) throw new BranchError("Branch no longer exists. Refresh the list.", 404);
    return Response.json({ branch: saved, message: "Branch updated successfully." });
  } catch (error) {
    if (image) await discardBranchImage(image);
    return branchApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await authorizeBranchRequest(request);
    const branch = await existingBranch(params);
    if (!await deleteBranch(branch.id)) throw new BranchError("Branch not found.", 404);
    return Response.json({ message: "Branch deleted successfully." });
  } catch (error) { return branchApiError(error); }
}
