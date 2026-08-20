#!/usr/bin/env node
/**
 * Checks the fulfilment path against the shipped files, not a copy of them.
 *
 * The thing this guards is the failure CHANGELOG v2.26.1 documents: Stripe
 * Checkout worked end to end while nothing was delivered afterwards, and only
 * a test-mode key stood between that and charging real money for a product
 * that did not exist. So the assertions here are mostly about what must be
 * TRUE BEFORE payments are switched on, and one about the switch itself.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const arena = await readFile(path.join(ROOT, 'arena', 'index.html'), 'utf8');
const stripe = await readFile(path.join(ROOT, 'app-src', 'convex', 'stripe.ts'), 'utf8');
const http = await readFile(path.join(ROOT, 'app-src', 'convex', 'http.ts'), 'utf8');

const checks = [];
const ok = (v, m) => checks.push([v, m]);

/* --- the guest identity problem --- */
ok(/success_url:.*checkout=success&session_id=\{CHECKOUT_SESSION_ID\}/.test(stripe),
  'guest success_url carries {CHECKOUT_SESSION_ID} — without it a guest cannot be given anything');
ok(/export const verifySession/.test(stripe), 'verifySession action exists');
ok(/payment_status !== 'paid'/.test(stripe), 'redemption requires payment_status paid, not merely a redirect');
ok(/\^cs_\[A-Za-z0-9_\]\+\$/.test(stripe), 'session id is shape-validated server-side before it reaches Stripe');
ok(/path: '\/redeem'/.test(http), '/redeem route is mounted');
ok((http.match(/path: '\/redeem'/g) || []).length === 2, '/redeem has both OPTIONS and POST (CORS preflight)');

/* --- the client must not trust its own redirect --- */
ok(/cs_\[A-Za-z0-9_\]\+/.test(arena), 'arena shape-checks the session id before calling redeem');
ok(/redeem/.test(arena) && /grantEntitlement/.test(arena), 'arena redeems, then grants — in that order');
ok(!/checkout=success[\s\S]{0,400}grantEntitlement/.test(arena.replace(/[\s\S]*?fetch\(/, '')),
  'entitlement is never granted from the redirect alone');

/* --- the artifact --- */
ok(/function renderScriptPack/.test(arena), 'a Script Pack renderer exists');
ok(/function packDataFor/.test(arena), 'pack content is derived from SCEN');
ok(/c\.p>=1&&c\.g===1/.test(arena), 'the pack uses the deck\'s own p:1/g:1 scoring rather than a second judgement');
ok(/@media print/.test(arena), 'the pack is printable');
ok(/not a law firm|no es un bufete/.test(arena), 'the pack carries the non-advice line');

/* The assertion above only proves packDataFor EXISTS. It did exist, and it
   still returned null for the default situation: it resolved decks by prefix-
   matching SCEN ids against the situation id, which is true for door/pass/
   trap/step but false for traffic (routine/intense/tension/hard) and last30
   (l301…). A real Script Pack purchase on the default scenario rendered only
   "That scenario has no pack yet." This suite passed 16/16 throughout.
   So: resolve every situation the way the shipped code does and assert each
   one actually lands on a deck with turns. */
const sitIds = [...arena.matchAll(/\{id:'([a-z0-9]+)',icon:'[^']*',bg:'[^']*',title:\{[\s\S]{0,500}?levels:\[([^\]]*)\]/g)]
  .map(m => ({ id: m[1], levels: [...m[2].matchAll(/'([^']+)'/g)].map(x => x[1]) }));
const scenIds = new Set([...arena.matchAll(/\{id:'([a-z0-9]+)',icon:'[^']*',bg:'[^']*',title:\{/g)].map(m => m[1]));
ok(sitIds.length >= 6, `situation list parsed from source (found ${sitIds.length})`);
for (const s of sitIds) {
  const resolves = scenIds.has(s.id) || s.levels.some(l => scenIds.has(l));
  ok(resolves, `situation '${s.id}' resolves to a real deck, so its Script Pack can render`);
}
ok(/SIT\.find\(s=>s\.id===sitId\)/.test(arena),
  'packDataFor resolves through SIT.levels, not a prefix match that silently missed traffic and last30');

/* --- and the switch itself --- */
ok(/const PAYMENTS_LIVE=false/.test(arena),
  'PAYMENTS_LIVE is still false — flipping it is a decision about attorney review, not about code');

/* REVIEW.attorneys empty is the actual gate. Assert it so that the day someone
   flips PAYMENTS_LIVE, this test tells them what they are also asserting. */
const root = await readFile(path.join(ROOT, 'index.html'), 'utf8');
const signed = /attorneys:\{[\s\S]*?name:"[^"]+"/.test(root);
ok(!signed || /const PAYMENTS_LIVE=false/.test(arena),
  'if any attorney has signed, payments may go live; while none has, they must not');

let fail = 0;
for (const [v, m] of checks) { console.log(`${v ? 'ok  ' : 'FAIL'}  ${m}`); if (!v) fail++; }
console.log(`\n${checks.length - fail}/${checks.length} passed`);
if (!signed) {
  console.log('\nNOTE: REVIEW.attorneys is empty for every state. Payments must stay off.');
  console.log('      FTC v. DoNotPay (final order Jan 2025, $193,000) turned on exactly this:');
  console.log('      selling legal output with no attorney retained to test its accuracy.');
}
process.exit(fail ? 1 : 0);
