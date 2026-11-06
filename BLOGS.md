# Blog content and images

## Authorized website import

`npm run import:website-blogs` imports the authorized article library from
`https://www.atticagoldcompany.com/blogs/`, discovering every article through its
posts sitemap. The user confirmed reuse permission for the articles and images.
Article HTML and original images are cached in the ignored
`data/blogs/source/website/` directory. A failed download keeps the existing
website dataset intact; rerun to retry. Use `-- --refresh --rebrand` to redownload
article HTML and rebuild covers, or `-- --rebrand` to rebuild from cached sources.

Imported articles live in `data/blogs/website-posts.json`, with provenance,
stable IDs in a separate namespace, and a report in
`data/blogs/website-import-report.json`. Existing Google Sheet posts take
precedence on duplicate slugs. Sheet refreshes preserve the website library.
Both sources appear in admin, search, article pages and the sitemap.

Imported images are stored in `public/blog-import/` and travel with deployment.
Aryan-branded covers use clear topic-matched gold, cash, customer consultation,
testing, weighing and jewellery photographs. Three original AI-generated editorial
photos are stored in `public/blog-scenes/`; existing site photography supplies the
specialist subjects. These are illustrations, not photographs of actual customers.
`src/lib/blog-visuals.mjs` selects the subject from each title and description.
Run `npm run blogs:covers` to rebuild every cover locally without downloading the
source site. The cover manifest also applies to Google Sheet posts and duplicate
slugs; future website imports use the same rendering rules. Source images stay
archived in the download cache rather than appearing on the public covers.
Uploaded admin images continue to override imported covers.

To replace an existing logo-only or blank admin upload with a description-related
photo, run `node scripts/set-blog-topic-images.mjs sell-gold-in-bangalore sell-gold-in-chennai`
against that deployment's database. This assigns a fresh image URL, keeps the old
files, and uses the same topic selection as the covers. Both current local overrides
have been replaced with the customer-and-gold valuation photograph.

Article processing removes navigation, recommendations, forms, promotional blocks,
source-company claims and source-specific FAQ answers. It sanitizes HTML, rewrites
internal links and revises recurring editorial wording. It is an import with
editorial cleanup, not a complete original rewrite of every sentence or an audit
of historical financial figures. Original source dates remain provenance only.

Public listing: `/blogs`. Articles: `/blogs/[slug]`. Image management: `/admin/blogs` (Blog images permission).

Configured Google Sheet: https://docs.google.com/spreadsheets/d/1iQ666q4zXtzHlzHb31uLe2x6uK16TloudA9GxZbMq-o/edit?gid=0

The selected sheet is now readable and has been imported successfully. Its Sheet1 tab contains exactly one entry: Sell Gold in Bangalore. Its linked article document imported successfully. Only this entry appears in admin, the frontend and the sitemap. Both dataset and per-article provenance must match the configured sheet. Run `npm run import:blogs -- --refresh-sheet` for future updates; the next page request reads the current import. Refresh an already-open admin page after importing.

The current workbook and its cells are saved in `data/blogs/source/content-plan.xlsx` and `data/blogs/source/workbook.json`. The old sheet's 587-entry dataset has been replaced by this one-entry import. See `data/blogs/import-report.json` for current provenance and import diagnostics: one published article, no missing content and no duplicate slugs. Uploaded blog images remain stored separately.

The import removes developer notes, widget placeholders, raw schema instructions, source-business promotions and unsupported Attica identity claims. It keeps educational paragraphs, headings, lists and tables. Article titles use Aryan branding and self-referencing Aryan URLs. Source keyword volumes, proposed schema types, intent and original canonical values remain in the data for reference. Original workbook and document links are preserved; the public pages do not expose editorial fields. Article schema describes the visible article and breadcrumbs. It does not claim fictitious local branches, certifications, reviews or publication dates.

Run `npm run import:blogs -- --refresh-sheet` to download the current workbook and rebuild articles. Downloads are cached by Google document ID under `data/blogs/source/articles` (ignored by Git), so a changed document link cannot reuse another article's cached body. To refresh all article documents from the command line, add `--refresh-articles`. Importing never changes uploaded images. The next page request checks the report and loads only entries belonging to the selected spreadsheet. Use Refresh from Google Sheet in /admin/blogs to fetch the current workbook and every linked article document. This updates admin and frontend content, removes deleted entries, and preserves uploaded images. A failed document download keeps existing published articles. The deployment must provide writable persistent storage for data/blogs; each server instance must use the same storage.

Run `npm run migrate:blog-images` on each deployment database. The `blog_images` table stores one cover image filename per slug. Original uploads are decoded, bounded and converted to WebP in `uploads/blogs`. Keep that directory on persistent storage and include it in backups, following the existing branch-image deployment convention. The image is shared by list cards, detail pages and related articles. Replacements use a new immutable URL; old images remain available to cached pages. A fresh page request picks up image changes immediately.

Only image uploads are supported by the admin blog mutation route. Session authentication, the Blog images permission and same-origin checks run before parsing the bounded multipart upload. Text/HTML/SEO edits are rejected. The imported content is kept in source control, outside the image table. No production publishing, Google Sheets changes or live customer submissions were performed.

Current verification: production build, ESLint and all 63 unit tests pass. Authenticated HTTP checks confirm the previous sheet's entries are excluded from the admin API, frontend listing, sitemap, detail pages and image mutations. The new-source frontend empty state and access guards pass. Earlier checks of the previous import verified article rendering and image replacement; those entries are now excluded. `node scripts/test-blog-images.mjs` handles both the awaiting-import state and the populated new-source dataset. Set `BLOG_TEST_URL` if the local server uses another port. Browser visual QA was unavailable because Computer Use could not establish the browser URL. Source financial/tax assertions are not independently audited; examples in article bodies are not a current price feed.

After the successful two-entry import: content tests and authenticated image-update checks pass. HTTP checks on both local ports 3000 and 3103 show exactly two article cards, with Bangalore and Chennai present and Hyderabad absent. Both current detail pages return 200; the former Hyderabad route returns 404. The sitemap contains exactly the two current article URLs.
