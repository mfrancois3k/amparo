#!/usr/bin/env node
/**
 * Wargame 32 Move B3 — citation-gap topic generator.
 *
 * Wikipedia marks unsourced claims with {{Citation needed}}. Across Amparo's
 * subject area that is a public, queryable backlog of questions people are
 * asking that currently have NO authoritative source behind them. Each one is
 * a candidate topic for a page Amparo is unusually well placed to write,
 * because the statute quoting is already the house style.
 *
 * ============================ HARD BOUNDARY ============================
 * This script READS Wikipedia. It never edits it, and nothing downstream of
 * it may either. Undisclosed automated or promotional editing violates
 * Wikipedia's bot and conflict-of-interest policies, and a block or a
 * spam-blacklist entry against amparohq.com would permanently destroy the
 * domain's value as a citable source — which is the exact asset the whole
 * organic plan is built to accumulate. Mining the backlog is free. Editing
 * into it risks everything. We mine.
 * =======================================================================
 *
 * Output is a QUEUE FOR A HUMAN, not a publishing pipeline. Every claim it
 * surfaces is a legal claim about police powers, and Amparo's own
 * research/state-law-matrix.md requires primary-statute verification before
 * anything ships. That gate is the product; this script feeds it, never
 * bypasses it.
 *
 * No API key. No account. Wikipedia's API is open, so this is the one piece of
 * Track B that runs from day one.
 *
 * Usage:
 *   node tools/citation-gaps.mjs            refresh growth/citation-gaps.json
 *   node tools/citation-gaps.mjs --selftest parser assertions, no network
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUT = path.join(ROOT, 'growth', 'citation-gaps.json');
const API = 'https://en.wikipedia.org/w/api.php';

/* Wikipedia asks automated clients to identify themselves with a contact.
   Being a well-behaved reader is not politeness here, it is what keeps the
   domain off the blocked list. */
const UA = 'AmparoTopicMiner/1.0 (https://www.amparohq.com; hello@amparohq.com) node-fetch';

/* Amparo's subject area. Deliberately about police ENCOUNTERS rather than
   driving — the product already covers a checkpoint as well as a traffic stop,
   and warrants plus station questioning are planned, so the mining surface
   should not be narrower than the roadmap. */
const KEYWORDS = [
  'traffic stop', 'stop and identify statutes', 'Miranda warning',
  'Fourth Amendment', 'consent search', 'police checkpoint',
  'terry stop', 'implied consent law', 'search warrant',
  'custodial interrogation', 'right to remain silent', 'probable cause'
];

/* {{Citation needed}} has many aliases and usually carries a date parameter. */
const CN = /\{\{\s*(citation needed|cn|fact|citation-needed|need citation)\b[^}]*\}\}/gi;

/* Wikitext is not prose. Strip the markup that would otherwise dominate the
   extracted sentence and make it unreadable in the queue. */
export function cleanWikitext(s) {
  let t = String(s)
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
  /* Templates nest: {{cite book |title={{lang|es|...}} }}. One pass strips the
     innermost and leaves the outer wrapper's pipe-delimited guts as prose,
     which is how "|title=Ballentine's Law Dictionary |isbn=..." ended up in a
     mined claim. Repeat to a fixed point, then drop any orphaned parameter
     debris from a template whose braces were split across the slice boundary. */
  for (let i = 0; i < 8; i++) {
    const next = t.replace(/\{\{[^{}]*\}\}/g, '');
    if (next === t) break;
    t = next;
  }
  return t
    .replace(/\{\{[\s\S]*$/, '')
    .replace(/\|\s*\w+\s*=[^|}]*/g, '')
    .replace(/(?:\{\{[^{}]*\}\}\s*)+/g, m => m.replace(/[\s\S]*/, ''))
    .replace(/\[\[(?:[^\]|]*\|)?([^\]|]*)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* The claim needing a source is the sentence immediately BEFORE the tag, so
   walk backwards from the tag to the previous sentence boundary. Abbreviations
   like "U.S." and "v." would break a naive split on ".", so the boundary
   requires a following space and capital, and known abbreviations are masked
   first. */
export function claimBefore(text, tagIndex) {
  const before = text.slice(0, tagIndex);
  const masked = before
    .replace(/\b(U\.S|Ct|Cir|Cal|Fed|Rev|Stat|Const|Ass'n|Dep't|Gov't|v|No|Art|Sec|Amend|Inc|Co|St|Mr|Mrs|Dr|e\.g|i\.e|cf)\./gi, m => m.replace(/\./g, ''));
  const parts = masked.split(/(?<=[.!?])\s+(?=[A-Z"“])/);
  const last = (parts[parts.length - 1] || '').replace(//g, '.');
  return cleanWikitext(last);
}

/* Matching the ARTICLE to a keyword is not enough, and the first live run
   proved it: searching "traffic stop" returns "Traffic light", whose
   citation-needed tags are about green arrows and Australian cluster signals.
   Relevance has to be judged on the CLAIM, because a single article mixes
   claims we could source with dozens we could not.

   These terms are deliberately unambiguous. A weaker vocabulary ("search",
   "stop", "rights") pulls in search engines, bus stops and property rights.
   Every term here is police-encounter specific in almost any sentence. */
const RELEVANT = /\b(police|officer|law enforcement|arrest|detain|detention|custodial|custody|interrogat|miranda|warrant|probable cause|reasonable suspicion|(?<![\w-])fourth amendment|(?<![\w-])fifth amendment|self-incriminat|right to remain silent|stop and identify|identify yourself|frisk|breathalyz|implied consent|sobriety checkpoint)/i;

/* Claim-level matching alone is too strict in the other direction: "Refusing
   to identify yourself is a crime in some states" is exactly the kind of claim
   Amparo should source, and it names no institution at all. So use both
   signals — inside an article that is unambiguously about police encounters,
   a substantive claim is worth queueing even when the sentence itself reads
   generically. "Traffic light" does not clear this bar; "Stop and identify
   statutes" does.

   This queue is reviewed by a human before anything is written, so recall is
   worth more than precision here — a missed topic is invisible, a bad one
   costs ten seconds to skip. */
const TITLE_STRONG = /police|miranda|(?<![\w-])fourth amendment|(?<![\w-])fifth amendment|stop and identify|terry stop|search warrant|interrogation|arrest|probable cause|reasonable suspicion|traffic stop|checkpoint|right to silence|self-incrimination/i;

export function findGaps(wikitext, title) {
  const out = [];
  CN.lastIndex = 0;
  let m;
  while ((m = CN.exec(wikitext)) !== null) {
    const claim = claimBefore(wikitext, m.index);
    /* A one-word fragment is a parse artifact, not a claim. A 600-character
       run means the sentence splitter never found a boundary and we would be
       queueing half a section. */
    if (claim.length < 40 || claim.length > 600) continue;
    if (!RELEVANT.test(claim) && !TITLE_STRONG.test(title)) continue;
    /* Real wikitext is messier than any fixture: citation templates split
       across a slice boundary leave "}}" or "|" debris, and legal abbreviations
       the mask misses ("Dist. Ct.,") strand the claim mid-citation. Rather than
       chase every abbreviation in US case law, drop the visibly broken ones —
       this is a human queue, and a truncated claim wastes a person's attention
       without teaching the parser anything. */
    if (/[}|]/.test(claim)) continue;
    if (/^[A-Z][a-z]{0,4}\.,/.test(claim)) continue;
    out.push({ title, claim });
  }
  return out;
}

async function api(params) {
  const qs = new URLSearchParams({ format: 'json', origin: '*', ...params });
  const res = await fetch(`${API}?${qs}`, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`Wikipedia API ${res.status}`);
  return res.json();
}

if (process.argv.includes('--selftest')) {
  const checks = [];
  const ok = (c, m) => checks.push([c, m]);

  const sample = `Police may ask for identification during a stop.{{Citation needed|date=May 2024}} ` +
    `In Hiibel v. Sixth Judicial District Court of Nevada, 542 U.S. 177, the Supreme Court upheld the statute. ` +
    `Refusing to identify yourself is a crime in some states.{{cn}}`;

  const gaps = findGaps(sample, 'Stop and identify statutes');
  ok(gaps.length === 2, `finds both tags (found ${gaps.length})`);
  ok(gaps[0].claim === 'Police may ask for identification during a stop.', `first claim extracted cleanly: "${gaps[0]?.claim}"`);
  ok(/Refusing to identify/.test(gaps[1]?.claim || ''), 'second claim starts at the right sentence boundary, not mid-citation');
  ok(!/U\.S|/.test(gaps[1]?.claim || ''), 'abbreviation masking is reversed before output');
  ok(!/\{\{|\[\[|<ref/.test(gaps.map(g => g.claim).join(' ')), 'no wikitext markup survives into a claim');

  ok(findGaps('Short.{{cn}}', 'x').length === 0, 'rejects fragments under 40 chars as parse artifacts');
  ok(findGaps(`${'word '.repeat(200)}.{{cn}}`, 'x').length === 0, 'rejects 600+ char runs where the splitter failed');
  ok(cleanWikitext("[[Terry stop|Terry stops]] are '''brief'''<ref name=a/>") === 'Terry stops are brief', 'wikilinks, bold and refs stripped');
  ok(findGaps('No tags at all here, nothing to find in this sentence.', 'x').length === 0, 'clean article yields nothing');

  /* The defect the first live run exposed: searching "traffic stop" returns
     "Traffic light", and every tag in it was being queued. */
  const offTopic = 'A green arrow may display to require drivers to turn in a particular direction only.{{cn}}';
  ok(findGaps(offTopic, 'Traffic light').length === 0, 'off-topic claim in a topically-adjacent article is rejected');
  const onTopic = 'An officer may order the driver out of the vehicle during a lawful stop.{{cn}}';
  ok(findGaps(onTopic, 'Traffic light').length === 1, 'on-topic claim is kept even when the article is off-topic');
  ok(findGaps('Users can search the index for a document quickly and reliably.{{cn}}','x').length === 0, 'weak words like "search" alone do not qualify');
  ok(findGaps(offTopic, 'Terry stop').length === 1, 'strongly on-topic article title rescues a generically-worded claim');
  ok(findGaps('G. }} Notably this definition does not require that the officer hold public authority.{{cn}}','Probable cause').length === 0, 'template debris in a claim is dropped');
  ok(findGaps('Ct., Chief Justice Young said the suspect must merely state his name to an officer.{{cn}}','Stop and identify statutes').length === 0, 'claim stranded mid-citation by a missed abbreviation is dropped');

  let fail = 0;
  for (const [c, m] of checks) { console.log(`${c ? 'ok  ' : 'FAIL'}  ${m}`); if (!c) fail++; }
  console.log(`\n${checks.length - fail}/${checks.length} passed`);
  process.exit(fail ? 1 : 0);
}

/* Without this guard, `import`ing the module to test its parsers executes the
   whole scraper — 65 live Wikipedia requests as an import side effect. Found
   exactly that way while running the regression checks. */
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (!isMain) { /* imported for its parsers; do no network work */ }
else {

const seen = new Set();
const gaps = [];
const errors = [];

for (const kw of KEYWORDS) {
  try {
    const search = await api({ action: 'query', list: 'search', srsearch: kw, srlimit: '6', srnamespace: '0' });
    const titles = (search?.query?.search || []).map(r => r.title).filter(t => !seen.has(t));
    for (const title of titles) {
      seen.add(title);
      const rev = await api({ action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', titles: title, formatversion: '2' });
      const page = rev?.query?.pages?.[0];
      const text = page?.revisions?.[0]?.slots?.main?.content;
      if (!text) continue;
      for (const g of findGaps(text, title)) {
        gaps.push({ ...g, keyword: kw, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}` });
      }
      /* Sequential with a pause. There is no deadline on a weekly job, and
         hammering the API is how a reader becomes a blocked reader. */
      await new Promise(r => setTimeout(r, 400));
    }
  } catch (e) {
    errors.push({ keyword: kw, error: e.message });
  }
}

/* Same claim can carry a tag in several articles; keep the first. */
const uniq = [];
const claims = new Set();
for (const g of gaps) {
  const k = g.claim.toLowerCase().slice(0, 120);
  if (claims.has(k)) continue;
  claims.add(k);
  uniq.push(g);
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({
  _readme: 'Topic queue mined from Wikipedia {{Citation needed}} tags. READ-ONLY: nothing here may be used to edit Wikipedia. Every claim is a legal claim and needs primary-statute verification plus the state-law-matrix.md gate before it can become an Amparo page.',
  generated: new Date().toISOString().slice(0, 10),
  keywords: KEYWORDS.length,
  articlesScanned: seen.size,
  found: uniq.length,
  errors,
  gaps: uniq
}, null, 2) + '\n', 'utf8');

console.log(`scanned ${seen.size} articles across ${KEYWORDS.length} keywords -> ${uniq.length} unsourced claims`);
if (errors.length) console.log(`${errors.length} keyword(s) errored: ${errors.map(e => e.keyword).join(', ')}`);
console.log(`written: ${path.relative(ROOT, OUT)}`);
}
