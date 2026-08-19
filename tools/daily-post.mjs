#!/usr/bin/env node
/**
 * Daily Facebook post generator for Amparo.
 *
 * WHAT IT DOES: picks one rule per day from the verified rules already
 * shipping in index.html, renders it as a post in EN or ES with a link to the
 * matching /rights/ or /derechos/ page, and writes it to content/facebook/.
 * If a Page token is present it publishes; if not it leaves the draft on disk
 * and says so. That split is deliberate — the generator is useful before the
 * Facebook page exists, and stays useful if it never does.
 *
 * WHAT IT CANNOT DO, BY CONSTRUCTION: post a legal claim Amparo has not
 * already verified. The pool is built from STATES and BASE_RULES_* — the same
 * text on the printed card and the crawlable pages. There is no authoring step
 * and no model in this pipeline. A daily content routine that could invent a
 * sentence about what police may do is not a content routine, it is a
 * liability, and for this product the whole moat is that we don't do that.
 *
 * The only non-legal text is the hook line, which is descriptive framing
 * ("Texas — what the statute actually says") and asserts nothing about the
 * law. Hooks rotate with the item so the feed doesn't read as a bot.
 *
 * CARD-ONLY LINES ARE EXCLUDED. Rules like "don't drive with this card
 * mounted on the windshield" are instructions for a physical artifact the
 * reader doesn't have yet, so as a standalone post they're confusing. That is
 * a presentation exclusion, narrowly matched on the card reference — it is
 * NOT a judgement about the rule, and nothing is excluded for legal content.
 *
 * ROTATION is deterministic on the date: same day in, same post out, so a
 * re-run or a retried CI job never double-posts different content. It walks
 * the whole pool before repeating (~7 weeks at one a day).
 *
 * Usage:
 *   node tools/daily-post.mjs                 draft for today
 *   node tools/daily-post.mjs --date 2026-09-01
 *   node tools/daily-post.mjs --publish       publish if FB creds are set
 *   node tools/daily-post.mjs --selftest      assertions, writes nothing
 *
 * Publishing needs BOTH env vars, and they must come from CI secrets or a
 * local shell — never a committed file:
 *   FB_PAGE_ID, FB_PAGE_TOKEN
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUTDIR = path.join(ROOT, 'content', 'facebook');
const ORIGIN = 'https://www.amparohq.com';
const GRAPH = 'https://graph.facebook.com/v21.0';

const arg = (flag) => { const i = process.argv.indexOf(flag); return i === -1 ? null : process.argv[i + 1]; };
const has = (flag) => process.argv.includes(flag);

/* Same column-0 terminator trick as build-pages.mjs: top-level literals close
   with `};`/`];` at column 0 while everything nested is indented, so this needs
   no brace matching against rule text full of quotes and inline HTML. */
function extractLiteral(src, name, open, close) {
  const m = new RegExp(`^const ${name}\\s*=\\s*\\${open}`, 'm').exec(src);
  if (!m) throw new Error(`could not find "const ${name} = ${open}" in index.html`);
  const bodyStart = m.index + m[0].length - 1;
  const end = src.indexOf(`\n${close};`, bodyStart);
  if (end === -1) throw new Error(`no column-0 "${close};" terminator after ${name}`);
  return new Function(`return (${src.slice(bodyStart, end + 1 + close.length)})`)();
}

const stripTags = s => String(s).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
/* The statute quote lives in <i class="stq">. Pulled out separately so the
   post can put it under its own line break, which is what makes the citation
   readable in a feed instead of a wall of text. */
const pullQuote = s => { const m = /<i class="stq">([\s\S]*?)<\/i>/.exec(s); return m ? stripTags(m[1]) : null; };
const bodyOnly = s => stripTags(String(s).replace(/<br\s*\/?>\s*<i class="stq">[\s\S]*?<\/i>/i, ''));
const isCardOnly = s => /this card|esta tarjeta/i.test(String(s));

const HOOKS = {
  en: [
    s => `${s} — what the statute actually says.`,
    s => `Stopped in ${s}? This one is written into the law.`,
    s => `${s} drivers: this is the statute, not an opinion.`,
    s => `What the law says in ${s}.`
  ],
  es: [
    s => `${s} — lo que dice la ley, textualmente.`,
    s => `¿Lo detienen en ${s}? Esto está escrito en la ley.`,
    s => `Conductores en ${s}: esto es la ley, no una opinión.`,
    s => `Lo que dice la ley en ${s}.`
  ]
};
const FED = { en: 'All 50 states', es: 'Los 50 estados' };
const CTA = {
  en: 'Full rules for your state, and a free printable pack for your glovebox:',
  es: 'Reglas completas para su estado, y un paquete gratis para imprimir:'
};

async function buildPool() {
  const src = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const STATES = extractLiteral(src, 'STATES', '{', '}');
  const BASE = { en: extractLiteral(src, 'BASE_RULES_EN', '[', ']'), es: extractLiteral(src, 'BASE_RULES_ES', '[', ']') };
  const pool = [];

  for (const k of Object.keys(STATES)) {
    const st = STATES[k], ab = k.toLowerCase();
    for (const lang of ['en', 'es']) {
      const rules = lang === 'en' ? st.rules_en : st.rules_es;
      const base = lang === 'en' ? 'rights' : 'derechos';
      rules.forEach((r, i) => {
        if (isCardOnly(r)) return;
        pool.push({ lang, scope: k, label: st.name, rule: r, idx: i, url: `${ORIGIN}/${base}/${ab}/` });
      });
    }
  }
  for (const lang of ['en', 'es']) {
    const base = lang === 'en' ? 'rights' : 'derechos';
    const slug = lang === 'en' ? 'any-state' : 'cualquier-estado';
    BASE[lang].forEach((r, i) => {
      /* The federal list ends with the "your state isn't verified yet" notice.
         True and important in the app, where the reader has already picked a
         state — but as a standalone post it is a disclaimer with nothing to
         disclaim, so it is not social content. */
      if (isCardOnly(r) || /⚠️/.test(r)) return;
      pool.push({ lang, scope: 'US', label: FED[lang], rule: r, idx: i, url: `${ORIGIN}/${base}/${slug}/` });
    });
  }
  /* Stable order regardless of object key order, so rotation can't silently
     reshuffle when a state is added and start repeating recent posts. */
  pool.sort((a, b) => `${a.scope}${a.lang}${String(a.idx).padStart(3, '0')}`.localeCompare(`${b.scope}${b.lang}${String(b.idx).padStart(3, '0')}`));
  return pool;
}

const dayIndex = (iso) => Math.floor(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000);

/* Walking the pool in order would post every Texas-Spanish rule, then every
   Texas-English rule, then Georgia — a week of one state in one language,
   which reads as a bot and wastes the reach the seed audience gives a page
   that varies. So step through the pool by a stride co-prime with its length:
   consecutive days land far apart (different state, usually different
   language) while still visiting every item exactly once before repeating.
   The 0.618 seed is the golden-ratio low-discrepancy trick; the gcd loop is
   what guarantees the full cycle survives the pool changing size when a state
   is added. */
const gcd = (a, b) => b ? gcd(b, a % b) : a;
function stride(len) {
  let s = Math.max(1, Math.round(len * 0.6180339887));
  while (gcd(s, len) !== 1) s++;
  return s;
}
const pickIndex = (iso, len) => (dayIndex(iso) * stride(len)) % len;

function render(item, iso) {
  const hooks = HOOKS[item.lang];
  const hook = hooks[dayIndex(iso) % hooks.length](item.label);
  const quote = pullQuote(item.rule);
  return [hook, '', bodyOnly(item.rule), quote ? `\n${quote}` : null, '', `${CTA[item.lang]} ${item.url}?utm_source=facebook&utm_medium=organic&utm_content=${item.scope.toLowerCase()}_${item.idx}`]
    .filter(v => v !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function publish(post) {
  const id = process.env.FB_PAGE_ID, token = process.env.FB_PAGE_TOKEN;
  if (!id || !token) return { published: false, reason: 'FB_PAGE_ID / FB_PAGE_TOKEN not set — draft only' };
  const res = await fetch(`${GRAPH}/${id}/feed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: post.text, access_token: token })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { published: false, reason: `Graph API ${res.status}: ${json?.error?.message || 'unknown'}` };
  return { published: true, postId: json.id };
}

if (has('--selftest')) {
  const pool = await buildPool();
  const a = [];
  const assert = (c, m) => { a.push([c, m]); };

  assert(pool.length >= 20, `pool has ${pool.length} items (expected >= 20)`);
  assert(!pool.some(p => isCardOnly(p.rule)), 'no card-only rule leaked into the pool');
  assert(!pool.some(p => /⚠️/.test(p.rule)), 'no unverified-state disclaimer leaked into the pool');

  const d1 = render(pool[pickIndex('2026-09-01', pool.length)], '2026-09-01');
  const d1again = render(pool[pickIndex('2026-09-01', pool.length)], '2026-09-01');
  const d2 = render(pool[pickIndex('2026-09-02', pool.length)], '2026-09-02');
  assert(d1 === d1again, 'same date renders identically (idempotent, so a CI retry cannot double-post different text)');
  assert(d1 !== d2, 'consecutive days differ');

  const seen = new Set();
  for (let i = 0; i < pool.length; i++) seen.add(pickIndex(new Date(Date.UTC(2026,8,1)+i*86400000).toISOString().slice(0,10), pool.length));
  assert(seen.size === pool.length, `rotation covers the whole pool before repeating (${seen.size}/${pool.length})`);

  assert(pool.every(p => p.url.startsWith(ORIGIN + '/')), 'every item links to a real generated page');
  assert(d1.includes('utm_source=facebook'), 'rendered post carries campaign attribution');
  assert(!/<[a-z]/i.test(d1), 'rendered post contains no raw HTML');

  let fail = 0;
  for (const [ok, msg] of a) { console.log(`${ok ? 'ok  ' : 'FAIL'}  ${msg}`); if (!ok) fail++; }
  console.log(`\n${a.length - fail}/${a.length} passed · pool ${pool.length} items ≈ ${Math.floor(pool.length / 7)} weeks at one a day`);
  process.exit(fail ? 1 : 0);
}

const iso = arg('--date') || new Date().toISOString().slice(0, 10);
const pool = await buildPool();
const item = pool[pickIndex(iso, pool.length)];
const outPath = path.join(OUTDIR, `${iso}.json`);

let existing = null;
try { await access(outPath); existing = JSON.parse(await readFile(outPath, 'utf8')); } catch {}
if (existing?.published && !has('--force')) {
  console.log(`${iso}: already published (${existing.postId || 'no id'}) — nothing to do`);
  process.exit(0);
}

const post = { date: iso, lang: item.lang, scope: item.scope, ruleIndex: item.idx, link: item.url, text: render(item, iso) };
const result = has('--publish') ? await publish(post) : { published: false, reason: 'draft mode (no --publish)' };

await mkdir(OUTDIR, { recursive: true });
await writeFile(outPath, JSON.stringify({ ...post, ...result }, null, 2) + '\n', 'utf8');

console.log(`${iso}  [${post.lang}/${post.scope}]  ${result.published ? 'PUBLISHED ' + result.postId : 'draft — ' + result.reason}`);
console.log('-'.repeat(60));
console.log(post.text);
