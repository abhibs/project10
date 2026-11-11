import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SERVICE_PAGES } from "../src/lib/service-pages.mjs";
import { sanitizeTrackingData } from "../src/lib/contact-attribution.mjs";
import { GOOGLE_LEAD_TYPE } from "../src/lib/contact-summary.mjs";
import { DAILY_CONTACT_DUPLICATE_MESSAGE, isDailyContactDuplicate } from "../src/lib/contact-leads.mjs";

test("public forms pass city and area separately to persistence", async () => {
  const source = (await readFile(new URL("../src/app/api/contacts/route.js", import.meta.url), "utf8")).replace(/^import .*;\r?\n/gm, "").replace("export async function POST", "async function POST");
  const saved = [];
  const deps = { createContact: async value => { saved.push(value); return 1; }, findBranchByCode: async () => null, sanitizeTrackingData, GOOGLE_LEAD_TYPE, DAILY_CONTACT_DUPLICATE_MESSAGE, isDailyContactDuplicate, publishedBlogs: async () => [{ id: 1, title: "Gold guide" }], SERVICE_PAGES };
  const POST = new Function(...Object.keys(deps), source + "\nreturn POST;")(...Object.values(deps));
  for (const businessType of ["Banner Form", "Branch Visit", "Doorstep Service", "Blog Page", "Contact Page", GOOGLE_LEAD_TYPE]) {
    const response = await POST(new Request("https://example.com/api/contacts", { method: "POST", body: JSON.stringify({ name: "Test User", mobile: "9876543210", city: "Bengaluru", area: " Jayanagar ", weight: "10", services: "Sell Gold", preferredDate: "2026-12-01", preferredTime: "09:00-12:00", blogId: 1, businessType }) }));
    assert.equal(response.status, 201, businessType);
    assert.equal(saved.at(-1).city, "Bengaluru");
    assert.equal(saved.at(-1).area, "Jayanagar");
  }
});
