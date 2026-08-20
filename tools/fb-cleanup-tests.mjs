#!/usr/bin/env node
/**
 * Removes the unpublished drafts that fb-token-check.mjs --post-test created.
 *
 * TARGETED BY ID, not by search. Each verification run printed the id of the
 * draft it created, and those ids are listed below. That is stricter than any
 * filter: the script can only ever touch posts this project is known to have
 * made, and cannot walk the Page's content at all.
 *
 * It also sidesteps a permission problem worth recording. Listing drafts needs
 * a read endpoint, and both available ones refuse this app:
 *   /promotable_posts -> (#100) Tried accessing nonexisting field
 *   /feed             -> (#10) requires pages_read_engagement or Page Public
 *                        Content Access
 * The token does carry pages_read_engagement, so the block is the app being in
 * Development Mode rather than a missing scope. Requesting Page Public Content
 * Access — an App Review feature granting read access to public Page content —
 * to tidy four test drafts would be a bad trade. Deleting a post you own needs
 * only pages_manage_posts, which is already granted.
 *
 * SAFETY: each id is fetched first and deleted ONLY if the post still carries
 * the exact verification message and is still unpublished. If that read fails
 * for any reason, the post is SKIPPED rather than deleted blind — an
 * unverifiable delete against a live Page is not worth the tidiness.
 *
 * Dry-run by default. --confirm is required.
 */
import { resolvePageToken } from './fb-token.mjs';

const GRAPH = 'https://graph.facebook.com/v21.0';
const ID = process.env.FB_PAGE_ID;
const RAW = process.env.FB_PAGE_TOKEN;
const CONFIRM = process.argv.includes('--confirm');

/* Byte-identical to the string in fb-token-check.mjs. If that is ever reworded
   this stops matching and nothing is deleted — the correct failure direction. */
const TEST_MESSAGE = 'Amparo posting check — unpublished draft, not visible to anyone. Safe to delete.';

/* Post-id suffixes reported by the verify runs on 2026-08-20. Extra ids can be
   passed as arguments; nothing is ever discovered automatically. */
const KNOWN = [
  '122104733283439182',
  '122104737213439182',
  '122104755267439182',
  '122104804017439182'
];

if (!ID || !RAW) { console.error('FB_PAGE_ID and FB_PAGE_TOKEN must be set'); process.exit(2); }

const redact = s => String(s).split(RAW).join('<redacted>');
const extra = process.argv.filter(a => /^\d{6,}$/.test(a));
const suffixes = [...new Set([...KNOWN, ...extra])];

let TOKEN;
try {
  TOKEN = (await resolvePageToken(RAW, ID)).token;
} catch (e) {
  console.error(`could not resolve a page token — ${redact(e.message)}`);
  process.exit(1);
}

console.log(`checking ${suffixes.length} known test drafts${CONFIRM ? '' : ' (dry run)'}\n`);

let deleted = 0, skipped = 0, gone = 0;

for (const suffix of suffixes) {
  const postId = `${ID}_${suffix}`;
  let post = null;
  try {
    const r = await fetch(`${GRAPH}/${postId}?fields=id,message,is_published&access_token=${encodeURIComponent(TOKEN)}`);
    post = await r.json();
  } catch (e) {
    console.log(`SKIP    ${suffix} — network error: ${redact(e.message)}`);
    skipped++; continue;
  }

  if (post?.error) {
    /* Code 100 on a specific object usually means it no longer exists — an
       already-deleted draft, which is success rather than a problem. */
    const msg = post.error.message || '';
    if (/does not exist|cannot be loaded|nonexisting/i.test(msg)) {
      console.log(`GONE    ${suffix} — already deleted`);
      gone++;
    } else {
      console.log(`SKIP    ${suffix} — ${redact(msg)}`);
      skipped++;
    }
    continue;
  }

  if (post.message !== TEST_MESSAGE) {
    console.log(`SKIP    ${suffix} — message does not match the verification string, leaving it alone`);
    skipped++; continue;
  }
  if (post.is_published !== false) {
    console.log(`SKIP    ${suffix} — this post is PUBLISHED, refusing to delete`);
    skipped++; continue;
  }

  if (!CONFIRM) { console.log(`WOULD DELETE  ${suffix}`); continue; }

  const del = await fetch(`${GRAPH}/${postId}?access_token=${encodeURIComponent(TOKEN)}`, { method: 'DELETE' });
  const body = await del.json().catch(() => ({}));
  if (del.ok && body?.success !== false) { console.log(`DELETED ${suffix}`); deleted++; }
  else { console.log(`FAILED  ${suffix} — ${redact(body?.error?.message || `HTTP ${del.status}`)}`); skipped++; }
}

console.log('');
if (CONFIRM) console.log(`${deleted} deleted, ${gone} already gone, ${skipped} skipped.`);
else console.log(`Dry run — nothing deleted. Re-run with --confirm.`);
