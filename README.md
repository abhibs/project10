This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Admin accounts and permissions

Run `node scripts/migrate-admin-access.mjs` against an existing database before starting this version. The migration is safe to rerun and preserves existing accounts as full administrators. Fresh imports of `database.sql` already include these columns.

Open **Admin → Admins** to create, edit or delete accounts. The **Admin** role has all access; **Custom Permissions** lets you select Dashboard, Admins, Branches, Contacts, Gold rates and SEO. These permissions apply to both pages and APIs, and changes take effect on the next request. Custom users with Admins access can manage only custom accounts whose permissions are within their own. Accounts cannot delete themselves or change their own access.

Passwords are stored as bcrypt hashes in `password`. As requested, `password_hint` stores the original password, synchronized on creation and password changes. It is masked in the table until revealed, but is readable by authorized account managers and database operators. Password resets invalidate older sessions. Existing profile columns are retained for compatibility; they are not part of the account-management form.

Verify access rules with `node --test tests/admin-access.test.mjs`. With a local app running and an existing administrator in the database, `node scripts/test-admin-access.mjs` exercises account CRUD, restricted requests, live permission changes and session revocation using temporary accounts that it removes afterward. Set `ADMIN_TEST_URL` if the local server uses a port other than 3000.

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

**Read More** opens `/branches/{state}/{city}/{branch-slug}` using the saved state,
city and slug (for example `/branches/karnataka/bengaluru/malleswaram`). **Map**
opens the same page at `#branch-map`. Only active branches with matching location
segments are available. The detail page uses the branch photo, address, hours
and coordinates, with an address-based map fallback when coordinates are absent.
The map shows the current branch at full width. Callback requests use
the existing contact endpoint as **Branch Form** leads. The selected service is stored
separately from the branch ID; see the branch contact migration below.

Uploads accept JPG, PNG and WebP up to 10 MB and 25 megapixels. Images are decoded,
stripped of metadata, resized to fit 1600 × 1200 and saved as WebP with unique
branch-ID-prefixed filenames in `uploads/branches/`. A dedicated image route serves
new uploads immediately, including in production. Keep that directory on writable,
persistent storage and back it up with MySQL. Ephemeral/serverless deployments
need persistent shared storage or an object-storage adapter before using uploads.
Replaced/deleted images are retained on disk to avoid breaking in-flight readers;
they are not referenced by the branch feed. Failed new uploads are cleaned up.

Validation tests: `node --test tests/branch-values.test.mjs`.
Branch detail URL and directions tests: `node --test tests/branch-links.test.mjs`.

## Google Ads landing page

Run `node scripts/migrate-google-leads.mjs` once per database, then open
`/googleleads`. Submissions are stored in `contacts` with the exact form type
`googlelead-lp` and appear as **Google Lead** in the admin contact dashboard.
The form retains the existing GCLID, UTM campaign, keyword and ad-group fields,
plus common campaign query parameters, the landing-page URL and referrer.

## Branch contact references

Run `node scripts/migrate-contact-branches.mjs` after the branches migration in each environment.
Branch enquiries store the selected service separately from `contacts.branch_id`, which references
`branches.branch_id`. The contact details modal shows the branch ID and current branch name.
Contacts from other forms can have no branch. Branch code changes cascade to contacts;
deleting a branch retains its contacts and clears their branch reference.

## Branch visit status notifications

Run `npm run migrate:contact-branch-visits` once per database before using the
**Visiting Branch** contact status. The migration adds the status plus the assigned
branch, visit date and visit time fields.

Saving this status sends a server-side JSON `POST` to
`https://aryangold.in/api/integrations/contact-visits`. Set the required
`CONTACT_VISIT_WEBHOOK_SECRET` server environment variable to the webhook secret;
it is sent as the `Authorization: Bearer <secret>` header and is never exposed to
the browser. A failed delivery is shown in the admin table and can be retried
without changing the saved visit details.
