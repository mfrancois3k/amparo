#!/usr/bin/env node
/**
 * Validates the Facebook Page credentials for tools/daily-post.mjs WITHOUT
 * ever printing them.
 *
 * The token this checks can post to Amparo's page. It is a credential: it
 * belongs in a GitHub Actions secret or a local shell, never in a file, never
 * in a commit, and never pasted into a chat window or an issue. This script
 * exists so the token can be verified without any of that — it reads from the
 * environment, reports what the token IS (which page, how long it lasts, what
 * it may do), and prints only a masked fingerprint.
 *
 * Usage:
 *   FB_PAGE_ID=... FB_PAGE_TOKEN=... node tools/fb-token-check.mjs
 *   ...                              node tools/fb-token-check.mjs --post-test
 *
 * --post-test creates an UNPUBLISHED post on the page. Unpublished, not
 * published-then-deleted: nothing is ever visible to the public, and nothing
 * has to be deleted afterward to clean up. It proves the write path end to end
 * — which is the only thing a read call cannot prove — at zero blast radius.
 * The draft is left in place; it is visible only to page admins under
 * Publishing Tools, and you can remove it there.
 *
 * Exit codes: 0 all good · 1 a check failed · 2 credentials not set.
 */
import { resolvePageToken } from './fb-token.mjs';

const GRAPH = 'https://graph.facebook.com/v21.0';
const ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_TOKEN;
const POST_TEST = process.argv.includes('--post-test');

/* Enough to tell two tokens apart in a log, useless to anyone who reads it. */
const fingerprint = t => `${t.slice(0, 4)}…${t.slice(-4)} (${t.length} chars)`;

if (!ID || !TOKEN) {
  console.error('FB_PAGE_ID and FB_PAGE_TOKEN must both be set in the environment.\n');
  console.error('  PowerShell:  $env:FB_PAGE_ID="..."; $env:FB_PAGE_TOKEN="..."');
  console.error('  bash:        export FB_PAGE_ID=... FB_PAGE_TOKEN=...');
  console.error('\nDo not put them in a file in this repo.');
  process.exit(2);
}

/* Accept either token type: resolve first, then run every check below against
   the resolved PAGE token. Without this the checker reports three confusing
   failures for one cause — a user token stored in the page-token slot. */
let RESOLVED = TOKEN, KIND = 'page', PAGE_NAME = '';
try {
  const r = await resolvePageToken(TOKEN, ID);
  RESOLVED = r.token; KIND = r.kind; PAGE_NAME = r.name;
} catch (e) {
  console.error(`FAIL  Could not resolve a usable Page token — ${String(e.message).split(TOKEN).join('<redacted>')}`);
  process.exit(1);
}

const results = [];
const check = (ok, label, detail) => { results.push({ ok, label, detail }); return ok; };

async function get(pathname, params = {}) {
  const qs = new URLSearchParams({ ...params, access_token: RESOLVED });
  const res = await fetch(`${GRAPH}${pathname}?${qs}`);
  const json = await res.json().catch(() => ({}));
  /* Never let a Graph error body echo the token back into the console — it
     appears in the request url, and some error shapes quote it verbatim. */
  if (!res.ok) throw new Error((json?.error?.message || `HTTP ${res.status}`).split(TOKEN).join('<redacted>'));
  return json;
}

console.log(`token ${fingerprint(TOKEN)}  page id ${ID}\n`);

let me = null;
try {
  me = await get('/me', { fields: 'id,name,category' });
  check(true, 'Token is valid', `authenticates as "${me.name}"`);
} catch (e) {
  check(false, 'Token is valid', e.message);
}

if (me) {
  check(me.id === ID, 'Token belongs to the page in FB_PAGE_ID',
    me.id === ID ? `${me.name} (${me.id})` : `token is for id ${me.id}, but FB_PAGE_ID is ${ID}`);

  /* A USER token also answers /me, with a person's name and no category. That
     is the single most common mistake in this flow and it fails confusingly
     later — the post call returns a permissions error that reads as if the
     token is wrong rather than the wrong KIND of token. */
  check(!!me.category, 'It is a Page token, not a User token',
    me.category ? `category "${me.category}"` : 'no category field — this looks like a USER token; run GET /me/accounts and use the page-specific token it returns');
}

try {
  const dbg = await get('/debug_token', { input_token: RESOLVED });
  const d = dbg.data || {};
  const never = d.expires_at === 0 || d.expires_at === undefined;
  check(never, 'Token does not expire',
    never ? 'expires_at = 0 (never)' : `EXPIRES ${new Date(d.expires_at * 1000).toISOString().slice(0, 10)} — you exchanged a short-lived user token; redo the long-lived exchange or this stops posting`);

  const scopes = d.scopes || [];
  for (const need of ['pages_manage_posts', 'pages_read_engagement']) {
    check(scopes.includes(need), `Permission ${need}`, scopes.includes(need) ? 'granted' : `MISSING — re-generate the token with ${need} ticked`);
  }
} catch (e) {
  check(false, 'Token metadata readable', `${e.message} (debug_token can need an app token; the post test below is the decisive check)`);
}

if (POST_TEST) {
  try {
    const res = await fetch(`${GRAPH}/${ID}/feed`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'Amparo posting check — unpublished draft, not visible to anyone. Safe to delete.',
        published: false,
        access_token: RESOLVED
      })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((json?.error?.message || `HTTP ${res.status}`).split(TOKEN).join('<redacted>'));
    check(true, 'Can write to the page', `created unpublished post ${json.id} — remove it under Publishing Tools when you like`);
  } catch (e) {
    check(false, 'Can write to the page', e.message);
  }
} else {
  console.log('(skipping the write test — add --post-test to prove posting works)\n');
}

let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.label}${r.detail ? ` — ${r.detail}` : ''}`);
  if (!r.ok) failed++;
}
console.log(failed
  ? `\n${failed} check(s) failed. Fix before adding these to GitHub secrets.`
  : `\nAll checks passed. Add FB_PAGE_ID and FB_PAGE_TOKEN as GitHub repository secrets and the daily workflow starts posting.`);
process.exit(failed ? 1 : 0);
