import { slugifyBranchName } from "./branch-values.mjs";

export function branchPath(branch) {
  return `/branches/${slugifyBranchName(branch.state)}/${slugifyBranchName(branch.city)}/${encodeURIComponent(branch.slug)}`;
}

export function matchesBranchRoute(branch, { state, city, slug }) {
  return branch.status === "active" && branch.slug === slug &&
    slugifyBranchName(branch.state) === state && slugifyBranchName(branch.city) === city;
}

export function branchMapQuery(branch) {
  if (branch.latitude != null && branch.longitude != null &&
      Number.isFinite(Number(branch.latitude)) && Number.isFinite(Number(branch.longitude))) {
    return `${Number(branch.latitude)},${Number(branch.longitude)}`;
  }
  return [branch.name, branch.address, branch.area, branch.city, branch.state, branch.pincode].filter(Boolean).join(", ");
}

export function branchDirections(branch) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(branchMapQuery(branch))}`;
}
