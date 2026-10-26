export function getBranchCarouselItems(branches, visibleCount) {
  if (branches.length < 2) return branches;
  // Include a complete viewport after the last real branch, even when the
  // viewport contains more cards than there are unique branches.
  return Array.from({ length: branches.length + visibleCount }, (_, index) => branches[index % branches.length]);
}
