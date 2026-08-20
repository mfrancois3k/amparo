#!/usr/bin/env node
/**
 * Wargame 32 Moves B1 + B2 — unattended outreach discovery.
 *
 * B1 finds publications that openly accept contributed articles in Amparo's
 * subject area, by running the submission-page search operators across our
 * niches in both languages.
 *
 * B2 finds who REPUBLISHED a piece after it landed. Sibling trade publications
 * monitor each other, so one placement seeds further copies with no additional
 * work — and each copy is another citation. This is the only asset in the whole
 * organic plan that compounds without anyone touching it, which is why it runs
 * on the same schedule rather than being a manual follow-up nobody remembers.
 *
 * Both live in one script because they are the same operation — search, dedupe
 * by domain, record — differing only in the query. Splitting them would mean
 * two crawlers, two stores and two reconciliations of the same domain list.
 *
 * WHAT THIS DOES NOT DO: contact anybody. It builds a list. Every one of the
 * five source videos bottlenecks on a human writing and sending the pitch, and
 * the trade-press channel specifically blacklists senders it detects as
 * automated — permanently, and across future pitches. The automation stops at
 * the list on purpose.
 *
 * SEARCH PROVIDER: Firecrawl, because the CLI is already installed on this
 * machine and was already used for this project (see .firecrawl/). One
 * provider, one env var, no adapter layer for hypothetical future providers.
 * Without FIRECRAWL_API_KEY the script exits 0 having done nothing, so the
 * weekly workflow stays green until the key exists rather than mailing a
 * failure every Monday.
 *
 * Usage:
 *   node tools/discover-targets.mjs             B1 + B2
 *   node tools/discover-targets.mjs --selftest  offline assertions
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUT = path.join(ROOT, 'growth', 'outreach-targets.json');
const KEY = process.env.FIRECRAWL_API_KEY;

/* The five operators the source material converged on. "write for us" surfaces
   smaller, hungrier outlets; "editorial guidelines" and "submit a story" surface
   established desks that carry more weight per placement. Both ends are useful,
   so all five run. */
const OPERATORS = ['write for us', 'submit a story', 'contribute', 'submit a guest post', 'editorial guidelines'];

/* Amparo's actual adjacency, not "marketing". These are the desks that would
   genuinely want a free bilingual know-your-rights resource, and the Spanish
   terms are first-class because half the audience is. */
const NICHES = [
  'immigrant rights', 'legal aid', 'civil rights', 'know your rights',
  'public defender', 'driver education', 'latino community news',
  'derechos de inmigrantes', 'ayuda legal', 'noticias latinas'
];

/* Domains that will never be an outreach target: our own, the platforms
   themselves, and the aggregators that surface everything. Filtering here keeps
   the human queue honest — a list padded with facebook.com looks bigger and is
   worth less. */
const SKIP = /^(www\.)?(amparohq\.com|facebook\.com|x\.com|twitter\.com|linkedin\.com|reddit\.com|medium\.com|youtube\.com|instagram\.com|pinterest\.com|quora\.com|wikipedia\.org|google\.[a-z.]+)$/i;

export function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; }
}

export function isUsefulTarget(url) {
  const d = domainOf(url);
  if (!d) return false;
  if (SKIP.test(d) || SKIP.test(`www.${d}`)) return false;
  return true;
}

/* Guidelines pages state the terms of the deal. Pulling these four fields is
   what turns a list of domains into something a human can triage in one pass
   instead of opening forty tabs. links-in-body vs bio-only is the one that
   decides whether a placement is worth writing for at all. */
export function parseGuidelines(markdown) {
  const t = String(markdown).slice(0, 20000);
  const wordCount = (/(\d{3,5})\s*(?:-|–|to)\s*(\d{3,5})\s*words|\b(\d{3,5})\+?\s*words/i.exec(t) || [])[0] || null;
  const bioOnly = /author bio|link (?:in|from) (?:your )?bio|bio link|no (?:do ?follow|in-?body) links/i.test(t);
  const bodyLinks = /links? (?:in|within) (?:the )?body|in-?body links?|contextual links?/i.test(t);
  const paid = /\b(we pay|payment|paid|\$\d+\s*(?:per|\/)\s*(?:article|post|piece))\b/i.test(t);
  const noAI = /\b(no (?:ai|AI-generated)|ai-generated content (?:is )?(?:not|never))/i.test(t);
  return {
    wordCount,
    links: bodyLinks ? 'body' : bioOnly ? 'bio-only' : 'unstated',
    paid,
    forbidsAI: noAI
  };
}

async function fcSearch(query, limit = 10) {
  const res = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ query, limit })
  });
  if (!res.ok) throw new Error(`Firecrawl search ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const json = await res.json();
  return json?.data || [];
}

if (process.argv.includes('--selftest')) {
  const checks = [];
  const ok = (c, m) => checks.push([c, m]);

  ok(domainOf('https://www.example.org/write-for-us') === 'example.org', 'domain extraction strips www');
  ok(domainOf('not a url') === null, 'malformed url yields null rather than throwing');
  ok(!isUsefulTarget('https://www.facebook.com/x'), 'platform domains are skipped');
  ok(!isUsefulTarget('https://amparohq.com/rights/tx/'), 'our own domain is skipped');
  ok(isUsefulTarget('https://immigrationimpact.com/write-for-us'), 'a real trade publication is kept');

  const g1 = parseGuidelines('We accept posts of 800-1200 words. Links in the body are permitted.');
  ok(g1.wordCount === '800-1200 words', `word count parsed (${g1.wordCount})`);
  ok(g1.links === 'body', 'in-body links detected');

  const g2 = parseGuidelines('Contributors receive an author bio. No AI-generated content is accepted.');
  ok(g2.links === 'bio-only', 'bio-only detected');
  ok(g2.forbidsAI === true, 'explicit no-AI policy flagged — this is the channel that blacklists for it');

  const g3 = parseGuidelines('Send us your pitch.');
  ok(g3.links === 'unstated' && g3.wordCount === null, 'silent guidelines yield unstated rather than a guess');

  let fail = 0;
  for (const [c, m] of checks) { console.log(`${c ? 'ok  ' : 'FAIL'}  ${m}`); if (!c) fail++; }
  console.log(`\n${checks.length - fail}/${checks.length} passed`);
  process.exit(fail ? 1 : 0);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (!KEY) {
    console.log('FIRECRAWL_API_KEY is not set — nothing to do.');
    console.log('B1/B2 stay dormant until it exists; B3 (tools/citation-gaps.mjs) needs no key and runs regardless.');
    console.log('Set it as a GitHub Actions secret named FIRECRAWL_API_KEY to switch this on.');
    process.exit(0);
  }

  let store = { targets: [], republishers: [], placements: [] };
  try { store = { ...store, ...JSON.parse(await readFile(OUT, 'utf8')) }; } catch {}

  const known = new Set(store.targets.map(t => t.domain));
  const added = [];
  const errors = [];

  for (const niche of NICHES) {
    for (const op of OPERATORS) {
      try {
        for (const r of await fcSearch(`${niche} ${op}`, 10)) {
          if (!isUsefulTarget(r.url)) continue;
          const domain = domainOf(r.url);
          if (known.has(domain)) continue;
          known.add(domain);
          const entry = {
            domain, url: r.url, title: r.title || '', niche, operator: op,
            guidelines: parseGuidelines(`${r.title || ''} ${r.description || ''} ${r.markdown || ''}`),
            found: new Date().toISOString().slice(0, 10), status: 'new'
          };
          store.targets.push(entry);
          added.push(entry);
        }
      } catch (e) { errors.push({ query: `${niche} ${op}`, error: e.message }); }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  /* B2 — only meaningful once something has been placed. store.placements is
     appended by hand after a piece lands: {title, url, date}. */
  const newRepubs = [];
  for (const p of store.placements || []) {
    try {
      for (const r of await fcSearch(`"${p.title}"`, 10)) {
        const domain = domainOf(r.url);
        if (!domain || domain === domainOf(p.url) || !isUsefulTarget(r.url)) continue;
        if ((store.republishers || []).some(x => x.domain === domain && x.of === p.title)) continue;
        const e = { domain, url: r.url, of: p.title, found: new Date().toISOString().slice(0, 10) };
        store.republishers.push(e);
        newRepubs.push(e);
      }
    } catch (e) { errors.push({ query: p.title, error: e.message }); }
  }

  store._readme = 'Wargame 32 B1/B2. A LIST, not an outreach system — nothing here contacts anyone. Add landed placements to "placements" as {title,url,date} and the republisher crawl starts tracking who copied them.';
  store.generated = new Date().toISOString().slice(0, 10);
  store.errors = errors;

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(store, null, 2) + '\n', 'utf8');

  console.log(`targets: ${store.targets.length} total (+${added.length} new)`);
  console.log(`republishers: ${store.republishers.length} total (+${newRepubs.length} new) across ${(store.placements || []).length} placement(s)`);
  if (errors.length) console.log(`${errors.length} query error(s)`);
  console.log(`written: ${path.relative(ROOT, OUT)}`);
}
