export const BLOG_SPREADSHEET = "https://docs.google.com/spreadsheets/d/1iQ666q4zXtzHlzHb31uLe2x6uK16TloudA9GxZbMq-o";

export function activeBlogEntries(posts, importedSpreadsheet) {
  if (importedSpreadsheet !== BLOG_SPREADSHEET) return [];
  return posts.filter(post => post.source?.spreadsheet === BLOG_SPREADSHEET);
}
