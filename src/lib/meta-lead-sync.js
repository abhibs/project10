import "server-only";
import { syncMetaLeadContacts } from "./admin-db";
import { metaLeadExportUrl, parseMetaLeadWorkbook } from "./meta-leads.mjs";

const MAX_WORKBOOK_BYTES = 15 * 1024 * 1024;

export async function syncMetaLeadsFromSheet(fetcher = fetch) {
  const response = await fetcher(metaLeadExportUrl(), {
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Meta lead spreadsheet download failed with HTTP ${response.status}.`);
  const buffer = await response.arrayBuffer();
  if (!buffer.byteLength || buffer.byteLength > MAX_WORKBOOK_BYTES) throw new Error("Meta lead spreadsheet export has an invalid size.");
  const parsed = await parseMetaLeadWorkbook(buffer);
  const synced = await syncMetaLeadContacts(parsed.leads);
  return { ...synced, skipped: parsed.skipped, total: parsed.leads.length + parsed.skipped };
}
