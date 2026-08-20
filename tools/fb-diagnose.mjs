#!/usr/bin/env node
/**
 * Prints everything Facebook will tell us ABOUT the stored token, without ever
 * printing the token.
 *
 * Written after four rounds of "extend it again" failed to produce a
 * non-expiring token. Guessing from a single FAIL line was not converging, and
 * debug_token exposes exactly the fields that distinguish the possible causes:
 *
 *   type=USER   + short expiry  -> the extend step did not happen, or the
 *                                  extended token was not the one copied
 *   type=PAGE   + short expiry  -> a page token was pasted into the debugger
 *                                  and "extend" silently did nothing useful;
 *                                  page tokens inherit the USER token's
 *                                  lifetime and cannot be extended directly
 *   type=USER   + never expires -> already correct, the page exchange is fine
 *
 * None of these fields are secret: they describe the token, not its value.
 */
import { resolvePageToken } from './fb-token.mjs';

const GRAPH = 'https://graph.facebook.com/v21.0';
const ID = process.env.FB_PAGE_ID;
const TOKEN = process.env.FB_PAGE_TOKEN;

if (!ID || !TOKEN) { console.error('FB_PAGE_ID and FB_PAGE_TOKEN must be set'); process.exit(2); }

const redact = s => String(s).split(TOKEN).join('<redacted>');
const when = t => !t ? 'never' : new Date(t * 1000).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

async function debug(tok, label) {
  const res = await fetch(`${GRAPH}/debug_token?input_token=${encodeURIComponent(tok)}&access_token=${encodeURIComponent(tok)}`);
  const j = await res.json();
  if (j?.error) { console.log(`${label}: could not inspect — ${redact(j.error.message)}`); return null; }
  const d = j.data || {};
  console.log(`${label}:`);
  console.log(`   type              ${d.type || '(unknown)'}`);
  console.log(`   app               ${d.app_id || '?'} ${d.application ? `(${d.application})` : ''}`);
  console.log(`   valid             ${d.is_valid}`);
  console.log(`   issued            ${when(d.issued_at)}`);
  console.log(`   expires           ${when(d.expires_at)}`);
  console.log(`   data access ends  ${when(d.data_access_expires_at)}`);
  console.log(`   scopes            ${(d.scopes || []).join(', ') || '(none)'}`);
  if (d.profile_id) console.log(`   profile_id        ${d.profile_id}`);
  return d;
}

console.log(`stored FB_PAGE_TOKEN is ${TOKEN.length} chars, configured page ${ID}\n`);

const raw = await debug(TOKEN, 'AS STORED');

console.log('');
let resolved = null;
try {
  const r = await resolvePageToken(TOKEN, ID);
  console.log(`resolution: ${r.kind === 'page' ? 'already a Page token' : 'USER token, exchanged for the page token'} ("${r.name}")\n`);
  if (r.token !== TOKEN) resolved = await debug(r.token, 'AFTER EXCHANGE');
} catch (e) {
  console.log(`resolution FAILED — ${redact(e.message)}`);
}

console.log('\n--- what this means ---');
const d = resolved || raw;
const forever = d && (!d.expires_at || d.expires_at === 0);
if (forever) {
  console.log('The page token never expires. Nothing further to do.');
} else if (raw?.type === 'PAGE') {
  console.log('A PAGE token is stored, and it expires. Page tokens inherit the lifetime of');
  console.log('the USER token they came from and cannot be extended on their own — running');
  console.log('a page token through "Extend Access Token" does nothing useful, which is why');
  console.log('repeating that step has not changed the expiry.');
  console.log('');
  console.log('Fix: extend the USER token first, then store THAT. The code exchanges it for');
  console.log('a page token automatically, and the result inherits the long lifetime.');
} else if (raw?.type === 'USER') {
  console.log('A USER token is stored and it still expires, so the extend either did not run');
  console.log('or a different token got copied afterwards. The extended token is the one');
  console.log('shown BELOW the "Extend Access Token" button, not the one in the box above it.');
} else {
  console.log('Could not classify the token type — see the fields above.');
}
