#!/usr/bin/env node
/**
 * Daily source check for Amparo's cited statutes.
 *
 * WHAT THIS DOES: fetches each primary statute page in research/law-watch.json,
 * extracts a normalised text window around the section anchor, hashes it, and
 * compares against the stored hash. A change means the source text moved and a
 * HUMAN needs to re-read it.
 *
 * WHAT THIS EXPLICITLY DOES NOT DO: verify the law. No script can. It cannot
 * tell you the rule is still correct, only that the page hasn't changed. The
 * site must never claim "law verified today" on the strength of this job —
 * "sources checked" and "content reviewed by a person" are different claims and
 * are surfaced separately.
 *
 * Failure philosophy: a site that blocks bots or times out is INCONCLUSIVE, not
 * broken. Justia 403s a HEAD request and 200s a browser-UA GET; georgialegalaid
 * refuses this runner entirely. Treating those as alarms would produce a red
 * banner every single day and train everyone to ignore it. Only a real content
 * change raises `changed`.
 *
 * Usage: node tools/law-watch.mjs [--write]
 *   --write  update stored hashes (use on the first run and after a human has
 *            re-reviewed a changed source)
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const WATCH = path.join(ROOT, 'research', 'law-watch.json');
const OUT = path.join(ROOT, 'law-status.json');
const WRITE = process.argv.includes('--write');

/* A bare user-agent is not enough: several legal-code hosts 403 a request that
   lacks the rest of a browser's header set, and they rate-limit rapid bursts.
   Hence the full headers, the delay between requests, and one retry. */
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'upgrade-insecure-requests': '1'
};
const POLITE_DELAY_MS = 2500;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Strip markup and collapse whitespace so only readable text is hashed. */
function normalise(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Hash a window around the anchor rather than the whole page. Whole-page
 * hashing flags every day because of ads, CSRF tokens and "last visited"
 * strings — noise that would bury a real amendment.
 */
function windowHash(text, anchor) {
  const i = text.indexOf(anchor);
  if (i === -1) return { hash: null, found: false };
  const slice = text.slice(Math.max(0, i - 200), i + 3000);
  return { hash: createHash('sha256').update(slice).digest('hex').slice(0, 16), found: true };
}

async function fetchOnce(url) {
  return fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(25000), redirect: 'follow' });
}

async function check(src) {
  const base = { id: src.id, state: src.state, cite: src.cite, url: src.url };
  let res;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetchOnce(src.url);
      if (res.ok) break;
      if (attempt === 0) { await sleep(4000); continue; }   // one retry for a throttled 403
    } catch (e) {
      if (attempt === 1) return { ...base, status: 'unreachable', detail: String(e.message || e).slice(0, 120) };
      await sleep(4000);
    }
  }
  if (!res || !res.ok) return { ...base, status: 'unreachable', detail: `HTTP ${res ? res.status : '?'}` };

  const text = normalise(await res.text());
  const { hash, found } = windowHash(text, src.anchor);
  if (!found) {
    // The anchor vanishing usually means the page was restructured — that is
    // itself worth a human look, but it is not evidence the law changed.
    return { ...base, status: 'anchor-missing', detail: `"${src.anchor}" not found on page` };
  }
  if (!src.hash) return { ...base, status: 'baseline', hash };
  return { ...base, status: hash === src.hash ? 'ok' : 'changed', hash, previous: src.hash };
}

const watch = JSON.parse(await readFile(WATCH, 'utf8'));
const results = [];
for (const [n, src] of watch.sources.entries()) {
  if (n) await sleep(POLITE_DELAY_MS);
  const r = await check(src);
  results.push(r);
  console.log(`${r.status.padEnd(15)} ${r.state}  ${r.cite}${r.detail ? '  — ' + r.detail : ''}`);
  if (WRITE && r.hash) src.hash = r.hash;
}

const counts = results.reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {});
const changed = results.filter(r => r.status === 'changed' || r.status === 'anchor-missing');

const status = {
  // Deliberately named "checked", never "verified" — see the header comment.
  lastChecked: new Date().toISOString().slice(0, 10),
  sourcesWatched: watch.sources.length,
  counts,
  needsReview: changed.map(r => ({ state: r.state, cite: r.cite, why: r.status })),
  note: 'Automated source-change check only. This does not verify that the law is correct — that requires a person.'
};

await writeFile(OUT, JSON.stringify(status, null, 2) + '\n');
if (WRITE) await writeFile(WATCH, JSON.stringify(watch, null, 2) + '\n');

console.log('\n' + JSON.stringify(status.counts));
console.log(changed.length ? `\nNEEDS HUMAN REVIEW: ${changed.length}` : '\nNo source changes detected.');

// Never fail the build for an unreachable site — only for a real change, so the
// workflow can open an issue when something genuinely moved.
process.exit(changed.length ? 1 : 0);
