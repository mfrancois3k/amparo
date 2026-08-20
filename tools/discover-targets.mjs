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
 * work — and each copy is another citation. It is the only asset in the whole
 * organic plan that compounds without anyone touching it, which is why it runs
 * on a schedule rather than being a manual follow-up nobody remembers.
 *
 * WHAT THIS DOES NOT DO: contact anybody. It builds a list. Every source video
 * bottlenecks on a human writing and sending the pitch, and the trade-press
 * channel specifically blacklists senders it detects as automated —
 * permanently, and across future pitches. The automation stops at the list on
 * purpose.
 *
 * SEARCH: Marginalia for B1, GDELT for B2. Neither needs an API key, which
 * matters more than result quality here — an unattended weekly job that needs
 * a credential is a job that silently stops the day the credential lapses.
 *
 * Firecrawl was the original choice and needed a key. DuckDuckGo replaced it
 * and was measured returning HTTP 202 with an anti-bot page to a CI runner;
 * so did Mojeek, lite.duckduckgo and three SearXNG instances (403 or blocked).
 * Marginalia answered 200 with real results.
 *
 * Marginalia is also the better index for this specific job, not merely the
 * one that answered. It deliberately down-ranks commercial SEO content and
 * favours small independent sites — which is precisely the population B1 wants,
 * since the outlets most likely to accept a contributed piece are the small
 * hungry ones, and those are exactly what a mainstream index buries.
 *
 * GDELT indexes global news coverage, which makes it the right tool for B2:
 * finding who republished a headline is a news-corpus question, not a web
 * search one. It rate-limits to one request every five seconds, which is
 * unproblematic for a handful of placements.
 *
 * The honest ceiling: both are HTML/JSON endpoints that can change or throttle.
 * The job fails visibly rather than silently — a run finding zero results
 * across every query errors instead of writing an empty file over a good one.
 *
 * Usage:
 *   node tools/discover-targets.mjs             B1 + B2
 *   node tools/discover-targets.mjs --limit 6   fewer queries (testing)
 *   node tools/discover-targets.mjs --selftest  offline assertions
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUT = path.join(ROOT, 'growth', 'outreach-targets.json');

/* Identify honestly. A scraper that pretends to be Chrome is the kind that
   gets whole IP ranges blocked, and this one has no deadline worth that. */
const UA = 'AmparoOutreachBot/1.0 (+https://www.amparohq.com; hello@amparohq.com)';

/* The five operators the source material converged on. "write for us" surfaces
   smaller, hungrier outlets; "editorial guidelines" and "submit a story"
   surface established desks that carry more weight per placement. Both ends
   are useful, so all five run. */
const OPERATORS = ['"write for us"', '"submit a story"', '"contribute"', '"submit a guest post"', '"editorial guidelines"'];

/* Amparo's actual adjacency, not "marketing". These are desks that would
   genuinely want a free bilingual know-your-rights resource, and the Spanish
   terms are first-class because half the audience is. */
const NICHES = [
  'immigrant rights', 'legal aid', 'civil rights', 'know your rights',
  'public defender', 'driver education', 'latino community news',
  'derechos de inmigrantes', 'ayuda legal', 'noticias latinas'
];

/* Our own domain, the platforms, and the aggregators that surface everything.
   Filtering here keeps the queue honest — a list padded with facebook.com
   looks bigger and is worth less. */
const SKIP = /^(www\.)?(amparohq\.com|facebook\.com|x\.com|twitter\.com|linkedin\.com|reddit\.com|medium\.com|youtube\.com|instagram\.com|pinterest\.com|quora\.com|wikipedia\.org|duckduckgo\.com|google\.[a-z.]+|bing\.com|yahoo\.com|pinterest\.[a-z.]+)$/i;

export function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; }
}

export function isUsefulTarget(url) {
  const d = domainOf(url);
  if (!d) return false;
  return !(SKIP.test(d) || SKIP.test(`www.${d}`));
}

const decodeEntities = s => String(s)
  .replace(/&shy;|&#173;|&#xad;/gi, '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');

/* Marginalia renders each hit as a plain external anchor, and alongside it a
   web.archive.org link to the same page plus its own navigation. Rather than
   depend on a class name that could be restyled, take every external http(s)
   anchor and drop the infrastructure — the SKIP list and the archive/self
   filters do the real work, and this survives a template change. */
/* Matched anywhere in the host, not anchored: an anchored pattern let
   git.marginalia.nu and about.marginalia-search.com through on the first live
   run, because neither STARTS with the engine's domain. ip2location is in the
   page footer, not a result. */
const NON_RESULT = /(marginalia|web\.archive\.org|github\.com|gitlab\.com|mastodon|patreon\.com|creativecommons\.org|ip2location|archive\.ph|w3\.org|mozilla\.org)/i;

export function parseMarginaliaResults(html) {
  const seen = new Set();
  const out = [];
  const re = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = decodeEntities(m[1]);
    let host;
    try { host = new URL(url).hostname; } catch { continue; }
    if (NON_RESULT.test(host)) continue;
    const key = url.replace(/[#?].*$/, '');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ url, title: decodeEntities(m[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim() });
  }
  return out;
}

/* Guidelines pages state the terms of the deal. These four fields turn a list
   of domains into something a human can triage in one pass instead of opening
   forty tabs. links-in-body vs bio-only is the one that decides whether a
   placement is worth writing for at all. */
export function parseGuidelines(text) {
  const t = String(text).slice(0, 20000);
  const wordCount = (/(\d{3,5})\s*(?:-|–|to)\s*(\d{3,5})\s*words|\b(\d{3,5})\+?\s*words/i.exec(t) || [])[0] || null;
  const bioOnly = /author bio|link (?:in|from) (?:your )?bio|bio link|no (?:do ?follow|in-?body) links/i.test(t);
  const bodyLinks = /links? (?:in|within) (?:the )?body|in-?body links?|contextual links?/i.test(t);
  return {
    wordCount,
    links: bodyLinks ? 'body' : bioOnly ? 'bio-only' : 'unstated',
    paid: /\b(we pay|payment|paid|\$\d+\s*(?:per|\/)\s*(?:article|post|piece))\b/i.test(t),
    forbidsAI: /\b(no (?:ai|AI-generated)|ai-generated content (?:is )?(?:not|never))/i.test(t)
  };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function marginaliaSearch(query) {
  const res = await fetch(`https://search.marginalia.nu/search?query=${encodeURIComponent(query)}`, {
    headers: { 'user-agent': UA, accept: 'text/html' }
  });
  if (!res.ok) throw new Error(`Marginalia HTTP ${res.status}`);
  return parseMarginaliaResults(await res.text());
}

/* GDELT's article list is the right shape for B2: it answers "which news
   domains carried this headline", which is the actual republisher question. */
async function gdeltSearch(phrase) {
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(`"${phrase}"`)}&mode=artlist&format=json&maxrecords=50`;
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  const body = await res.text();
  if (res.status === 429) throw new Error('GDELT rate limit — one request per five seconds');
  if (!res.ok) throw new Error(`GDELT HTTP ${res.status}`);
  let json;
  try { json = JSON.parse(body); } catch { throw new Error(`GDELT returned non-JSON: ${body.slice(0, 80)}`); }
  return (json.articles || []).map(a => ({ url: a.url, title: a.title || '' })).filter(a => a.url);
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow' });
    if (!res.ok) return null;
    const html = await res.text();
    return decodeEntities(
      html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
    ).replace(/\s+/g, ' ').trim();
  } catch { return null; }
}

if (process.argv.includes('--selftest')) {
  const checks = [];
  const ok = (c, m) => checks.push([c, m]);

  ok(domainOf('https://www.example.org/write-for-us') === 'example.org', 'domain extraction strips www');
  ok(domainOf('not a url') === null, 'malformed url yields null rather than throwing');
  ok(!isUsefulTarget('https://www.facebook.com/x'), 'platform domains are skipped');
  ok(!isUsefulTarget('https://amparohq.com/rights/tx/'), 'our own domain is skipped');
  ok(isUsefulTarget('https://immigrationimpact.com/write-for-us'), 'a real trade publication is kept');

  const html = `<a href="https://immigrationimpact.com/write-for-us">Write for <b>Us</b> &amp; Contribute</a>
    <a href="https://web.archive.org/web/*/https://immigrationimpact.com/write-for-us">archived</a>
    <a href="https://www.facebook.com/x">Facebook</a>
    <a href="https://immigrationimpact.com/write-for-us#top">dupe with fragment</a>`;
  const parsed = parseMarginaliaResults(html);
  ok(parsed.length === 2, `keeps the real results, drops archive + dupes (got ${parsed.length})`);
  ok(parsed[0].url === 'https://immigrationimpact.com/write-for-us', 'first result url intact');
  ok(parsed[0].title === 'Write for Us & Contribute', `title de-tagged and entity-decoded ("${parsed[0]?.title}")`);
  ok(!parsed.some(p => /web\.archive/.test(p.url)), 'web.archive.org mirror of the same page is dropped');
  ok(parseMarginaliaResults('<html>no results</html>').length === 0, 'a page with no results yields none rather than throwing');
  const infra = parseMarginaliaResults('<a href="https://git.marginalia.nu/x">git</a><a href="https://about.marginalia-search.com/y">about</a><a href="https://lite.ip2location.com/z">ip</a>');
  ok(infra.length === 0, `search-engine infrastructure is dropped (got ${infra.length})`);
  ok(decodeEntities('Mic&shy;Wright &amp; Co &#8212; ok') === 'MicWright & Co — ok', `soft hyphens and numeric entities decoded ("${decodeEntities('Mic&shy;Wright &amp; Co &#8212; ok')}")`);

  const g1 = parseGuidelines('We accept posts of 800-1200 words. Links in the body are permitted.');
  ok(g1.wordCount === '800-1200 words', `word count parsed (${g1.wordCount})`);
  ok(g1.links === 'body', 'in-body links detected');
  const g2 = parseGuidelines('Contributors receive an author bio. No AI-generated content is accepted.');
  ok(g2.links === 'bio-only', 'bio-only detected');
  ok(g2.forbidsAI === true, 'explicit no-AI policy flagged — this is the channel that blacklists for it');
  ok(parseGuidelines('Send us your pitch.').links === 'unstated', 'silent guidelines yield unstated rather than a guess');

  let fail = 0;
  for (const [c, m] of checks) { console.log(`${c ? 'ok  ' : 'FAIL'}  ${m}`); if (!c) fail++; }
  console.log(`\n${checks.length - fail}/${checks.length} passed`);
  process.exit(fail ? 1 : 0);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  /* Marginalia throttles at roughly 50 consecutive queries, after which it
     answers 200 with only its own navigation. Rather than burn the whole
     niche x operator matrix in one run and get cut off partway, take a small
     slice each week and remember where we stopped. The matrix is 50 queries;
     at 10 a week it is covered every five weeks, which is far more often than
     a list of publications actually changes. */
  const PER_RUN = 10;
  const li = process.argv.indexOf('--limit');
  const LIMIT = li === -1 ? PER_RUN : Number(process.argv[li + 1]);

  let store = { targets: [], republishers: [], placements: [] };
  try { store = { ...store, ...JSON.parse(await readFile(OUT, 'utf8')) }; } catch {}

  const known = new Set(store.targets.map(t => t.domain));
  const added = [];
  const errors = [];
  let queriesRun = 0, resultsSeen = 0;

  /* Flatten the matrix so a single cursor can walk it across runs. */
  const MATRIX = NICHES.flatMap(n => OPERATORS.map(o => [n, o]));
  const start = Number(store.cursor || 0) % MATRIX.length;

  outer:
  for (let k = 0; k < MATRIX.length; k++) {
    {
      const [niche, op] = MATRIX[(start + k) % MATRIX.length];
      if (queriesRun >= LIMIT) break outer;
      queriesRun++;
      store.cursor = (start + k + 1) % MATRIX.length;
      try {
        const results = await marginaliaSearch(`${niche} ${op}`);
        resultsSeen += results.length;
        for (const r of results) {
          if (!isUsefulTarget(r.url)) continue;
          const domain = domainOf(r.url);
          if (known.has(domain)) continue;
          known.add(domain);
          added.push({ domain, url: r.url, title: r.title, niche, operator: op.replace(/"/g, ''), found: new Date().toISOString().slice(0, 10), status: 'new' });
        }
      } catch (e) { errors.push({ query: `${niche} ${op}`, error: e.message }); }
      /* Unhurried on purpose. There is no deadline on a weekly job, and being
         a well-behaved client is what keeps this working without a key. */
      await sleep(8000);
    }
  }

  /* Fetch guidelines only for the new ones, and only a bounded number — this
     is the expensive half and the target list is long-lived. */
  for (const t of added.slice(0, 25)) {
    const text = await fetchText(t.url);
    t.guidelines = text ? parseGuidelines(text) : { parseFailed: true };
    await sleep(1200);
  }
  for (const t of added.slice(25)) t.guidelines = { notFetchedYet: true };

  store.targets.push(...added);

  /* B2 — only meaningful once something has been placed. store.placements is
     appended by hand after a piece lands: {title, url, date}. */
  const newRepubs = [];
  for (const p of store.placements || []) {
    try {
      for (const r of await gdeltSearch(p.title)) {
        const domain = domainOf(r.url);
        if (!domain || domain === domainOf(p.url) || !isUsefulTarget(r.url)) continue;
        if ((store.republishers || []).some(x => x.domain === domain && x.of === p.title)) continue;
        const e = { domain, url: r.url, of: p.title, found: new Date().toISOString().slice(0, 10) };
        store.republishers.push(e);
        newRepubs.push(e);
      }
    } catch (e) { errors.push({ query: p.title, error: e.message }); }
    await sleep(8000);
  }

  /* Fail loudly rather than overwrite a good file with an empty one. Zero
     results across every query means DuckDuckGo blocked the runner or changed
     its markup — a real breakage that must not look like "no targets exist". */
  if (queriesRun > 0 && resultsSeen === 0) {
    console.error(`ran ${queriesRun} queries and parsed 0 results.`);
    console.error('Marginalia has most likely throttled this runner. Measured behaviour: it');
    console.error('serves ~50 queries and then returns 200 with only its own navigation, so a');
    console.error('zero here is a throttle, not an absence of targets. Next week resumes from');
    console.error('the stored cursor.');
    console.error('Existing growth/outreach-targets.json left untouched.');
    process.exit(1);
  }

  store._readme = 'Wargame 32 B1/B2. A LIST, not an outreach system — nothing here contacts anyone. Add landed placements to "placements" as {title,url,date} and the republisher crawl starts tracking who copied them. Search is DuckDuckGo HTML, no API key.';
  store.generated = new Date().toISOString().slice(0, 10);
  store.errors = errors;

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(store, null, 2) + '\n', 'utf8');

  console.log(`${queriesRun} queries -> ${resultsSeen} raw results (cursor now ${store.cursor}/${MATRIX.length})`);
  console.log(`targets: ${store.targets.length} total (+${added.length} new)`);
  console.log(`republishers: ${store.republishers.length} total (+${newRepubs.length} new) across ${(store.placements || []).length} placement(s)`);
  if (errors.length) console.log(`${errors.length} query error(s)`);
  console.log(`written: ${path.relative(ROOT, OUT)}`);
}
