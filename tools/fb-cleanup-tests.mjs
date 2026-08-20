#!/usr/bin/env node
/**
 * Removes the unpublished drafts that fb-token-check.mjs --post-test creates.
 *
 * SCOPE, deliberately narrow. This deletes a post only when ALL of these hold:
 *   1. its message is EXACTLY the verification string, character for character
 *   2. it is unpublished (is_published === false)
 *   3. the page returned it under promotable_posts for the configured page id
 *
 * Nothing is matched by prefix, keyword, or date. A real post cannot satisfy
 * condition 1 unless someone deliberately types the test sentence verbatim,
 * and it would still have to be unpublished. Deleting a post is irreversible
 * and this runs against a live Page, so the filter is the safety mechanism —
 * not the caller's intent, not the operator's memory of which ones were tests.
 *
 * Dry-run by default. --confirm is required to delete anything.
 *
 * Usage:
 *   node tools/fb-cleanup-tests.mjs            list what would be deleted
 *   node tools/fb-cleanup-tests.mjs --confirm  delete them
 */
import { resolvePageToken } from './fb-token.mjs';

const GRAPH = 'https://graph.facebook.com/v21.0';
const ID = process.env.FB_PAGE_ID;
const RAW = process.env.FB_PAGE_TOKEN;
const CONFIRM = process.argv.includes('--confirm');

/* Must stay byte-identical to the string in fb-token-check.mjs. If that one is
   ever reworded, this stops matching and the drafts are simply left alone —
   which is the correct failure direction for a delete. */
const TEST_MESSAGE = 'Amparo posting check — unpublished draft, not visible to anyone. Safe to delete.';

if (!ID || !RAW) { console.error('FB_PAGE_ID and FB_PAGE_TOKEN must be set'); process.exit(2); }

const redact = s => String(s).split(RAW).join('<redacted>');

let TOKEN;
try {
  TOKEN = (await resolvePageToken(RAW, ID)).token;
} catch (e) {
  console.error(`could not resolve a page token — ${redact(e.message)}`);
  process.exit(1);
}

/* /feed with a PAGE token returns unpublished drafts alongside published
   posts, with is_published distinguishing them. promotable_posts was tried
   first and this Page does not expose it — '(#100) Tried accessing nonexisting
   field (promotable_posts)' — which is an app-permission-dependent edge, not
   something worth requesting extra scopes to work around. */
const res = await fetch(`${GRAPH}/${ID}/feed?fields=id,message,created_time,is_published&limit=100&access_token=${encodeURIComponent(TOKEN)}`);
const json = await res.json();
if (json?.error) { console.error(`Graph API — ${redact(json.error.message)}`); process.exit(1); }

const all = (json?.data || []).filter(p => p.is_published === false);
const targets = all.filter(p => p.message === TEST_MESSAGE && p.is_published === false);

console.log(`unpublished posts on the page: ${all.length}`);
console.log(`exact verification-message matches: ${targets.length}\n`);

if (!targets.length) {
  console.log('Nothing to delete.');
  if (all.length) {
    console.log('\nOther unpublished posts were found and are being LEFT ALONE:');
    for (const p of all) console.log(`  ${p.id}  ${(p.message || '(no message)').slice(0, 70)}`);
  }
  process.exit(0);
}

for (const p of targets) console.log(`  ${p.id}  created ${p.created_time}`);

if (!CONFIRM) {
  console.log('\nDry run — nothing deleted. Re-run with --confirm to delete these.');
  process.exit(0);
}

console.log('');
let ok = 0, failed = 0;
for (const p of targets) {
  const del = await fetch(`${GRAPH}/${p.id}?access_token=${encodeURIComponent(TOKEN)}`, { method: 'DELETE' });
  const body = await del.json().catch(() => ({}));
  if (del.ok && body?.success !== false) { console.log(`deleted ${p.id}`); ok++; }
  else { console.log(`FAILED ${p.id} — ${redact(body?.error?.message || `HTTP ${del.status}`)}`); failed++; }
}
console.log(`\n${ok} deleted, ${failed} failed.`);
process.exit(failed ? 1 : 0);
