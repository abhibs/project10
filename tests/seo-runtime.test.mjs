import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedRateStatus } from '../src/lib/rate-freshness.mjs';
import { jsonLd, PAGE_DEFAULTS } from '../src/lib/site-seo.mjs';
test('publication status rejects missing, invalid, future and stale timestamps',()=>{
 const now=Date.parse('2026-10-31T10:00:00Z');
 for(const value of [null,'invalid','2026-11-01T10:00:00Z','2026-10-29T10:00:00Z']) assert.equal(publishedRateStatus(value,now).fresh,false);
 const status=publishedRateStatus('2026-10-31T09:00:00Z',now); assert.equal(status.fresh,true); assert.match(status.label,/IST/);
});
test('structured data escapes script injection and preserves JSON',()=>{
 const data={name:'</script><script>alert(1)</script>'}; const encoded=jsonLd(data); assert.equal(encoded.includes('<'),false); assert.deepEqual(JSON.parse(encoded),data);
});
test('audited metadata defaults have distinct titles and descriptions',()=>{
 for(const field of ['title','description']) assert.equal(new Set(Object.values(PAGE_DEFAULTS).map(p=>p[field])).size,Object.keys(PAGE_DEFAULTS).length);
});
