// Only first-party editorial dates qualify; import/source dates belong to the source site.
export function articleDates(post) {
  const valid = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) && Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now();
  const publishedTime = valid(post.publishedAt) ? post.publishedAt : undefined;
  const modifiedTime = valid(post.modifiedAt) && (!publishedTime || Date.parse(post.modifiedAt) >= Date.parse(publishedTime)) ? post.modifiedAt : undefined;
  return { publishedTime, modifiedTime };
}
