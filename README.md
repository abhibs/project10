This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Gold rates

Apply `database/rates.sql` to the database configured in `.env` before using
`/admin/rate`. The **Rate** sidebar page saves 24K, 22K and 18K INR prices per gram.
The table starts empty. The first save inserts row 1; subsequent saves atomically
update it. A database constraint prevents any additional row IDs.

The homepage reads `/api/rates` on load, every minute, and when Refresh rates is
clicked. The calculator offers the saved 24K, 22K and 18K rates. If published
rates are unavailable, the homepage labels its demo fallback prices.

## Branch management

Run `node scripts/migrate-branches.mjs` from the project root once per environment.
It uses the existing database settings in `.env` and creates `branches` without
changing other tables. Existing rows receive a separate name-based `slug` column;
branch IDs and other branch details are preserved.

Sign in and open `/admin/branches` to add, view, search, edit or delete branches.
Branch IDs are entered separately. Slugs are generated automatically from names
in lowercase with hyphens. Repeated names receive a numeric suffix.
An image, URL and coordinate pair are optional; the
remaining fields are required. Deletion requires confirmation. Use **Inactive**
to hide a location without deleting it.

Active branches appear in the homepage's **Branches** section. The public feed
(`/api/branches`) is uncached, refreshes every minute and on window focus, and never
returns inactive branches. Cards show location, address, timings, an optional
branch link and Google Maps directions. Empty, loading and retry states are included.

Uploads accept JPG, PNG and WebP up to 10 MB and 25 megapixels. Images are decoded,
stripped of metadata, resized to fit 1600 × 1200 and saved as WebP with unique
branch-ID-prefixed filenames in `uploads/branches/`. A dedicated image route serves
new uploads immediately, including in production. Keep that directory on writable,
persistent storage and back it up with MySQL. Ephemeral/serverless deployments
need persistent shared storage or an object-storage adapter before using uploads.
Replaced/deleted images are retained on disk to avoid breaking in-flight readers;
they are not referenced by the branch feed. Failed new uploads are cleaned up.

Validation tests: `node --test tests/branch-values.test.mjs`.
