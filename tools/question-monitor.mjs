#!/usr/bin/env node
/**
 * Finds real questions Amparo can answer, and queues them for a human.
 *
 * IT NEVER REPLIES. It never logs in, never posts, never touches an account.
 * It reads public RSS, scores what it finds against the answer bank, and writes
 * a list. A person opens the list, decides whether the question is genuine and
 * whether the answer actually fits, and replies in their own name.
 *
 * That division is the whole design, not a limitation of it. An automated reply
 * in a community is spam however good the text is, gets the account banned, and
 * for this product would trade the only asset that matters — that a stranger
 * can trust it in a bad moment — for a handful of clicks. The automation is
 * allowed to do the finding, which is the boring part. The being-a-person part
 * stays with the person.
 *
 * SOURCES, all keyless: Reddit search RSS across the subreddits where these
 * questions actually get asked. Reddit rate-limits aggressively, so queries are
 * few, spaced, and honestly user-agented.
 *
 * Usage:
 *   node tools/question-monitor.mjs            refresh growth/questions.json
 *   node tools/question-monitor.mjs --selftest
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUT = path.join(ROOT, 'growth', 'questions.json');
const UA = 'AmparoQuestionMonitor/1.0 (+https://www.amparohq.com; hello@amparohq.com)';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SOURCES = [
  { sub: 'legaladvice', q: 'traffic stop' },
  { sub: 'legaladvice', q: 'pulled over search' },
  { sub: 'AskLawyers', q: 'traffic stop rights' },
  { sub: 'immigration', q: 'checkpoint' },
  { sub: 'DACA', q: 'police stop' },
  { sub: 'legaladvicespanish', q: 'policia' }
];

/* A question, not a war story. People post both, and only one is answerable. */
export const isQuestion = t =>
  /\?/.test(t) ||
  /^(can|do|does|am i|is it|what|how|should|are they|will i|if i|whats|what's|puedo|tengo|debo|que pasa|qué pasa|es legal)\b/i.test(String(t).trim());

/* Never surface a thread that is describing a case in progress. Answering
   those is how a helpful reply turns into something that reads as legal advice
   to a person who needs a lawyer, not a drill. */
export const TOO_SERIOUS = /(arrest|charged|court date|my lawyer|attorney|sued|lawsuit|jail|felony|convicted|deported|deportation|ice raid|detained|warrant|custody|acusad|abogado|corte|deportaci|detenid)/i;

export function scoreAgainst(title, entries) {
  const t = String(title).toLowerCase();
  let best = null;
  for (const e of entries) {
    let hits = 0;
    for (const m of e.match) if (t.includes(m.toLowerCase())) hits++;
    if (hits && (!best || hits > best.hits)) best = { id: e.id, drill: e.drill, hits };
  }
  return best;
}

export function parseRss(xml) {
  const out = [];
  const items = String(xml).split(/<entry[\s>]/).slice(1);
  for (const it of items) {
    const title = (/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(it) || [])[1];
    const link = (/<link[^>]*href="([^"]+)"/i.exec(it) || [])[1];
    const updated = (/<updated>([^<]+)<\/updated>/i.exec(it) || [])[1];
    if (title && link) out.push({ title: title.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim(), url: link, at: (updated || '').slice(0, 10) });
  }
  return out;
}

async function fetchSub({ sub, q }) {
  const url = `https://www.reddit.com/r/${sub}/search.rss?q=${encodeURIComponent(q)}&restrict_sr=1&sort=new&t=month`;
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/atom+xml' } });
  if (res.status === 429) throw new Error('Reddit rate limit');
  if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);
  return parseRss(await res.text());
}

if (process.argv.includes('--selftest')) {
  const c = []; const ok = (v, m) => c.push([v, m]);

  ok(isQuestion('Can they search my car without a warrant?'), 'a question mark is a question');
  ok(isQuestion('Do I have to sign the ticket'), 'a question word with no mark still counts');
  ok(isQuestion('¿Puedo negarme a un registro?'), 'Spanish questions count');
  ok(!isQuestion('Got pulled over last night and it went badly.'), 'a statement is not a question');

  ok(TOO_SERIOUS.test('I was arrested at a checkpoint, what now?'), 'an arrest thread is filtered out');
  ok(TOO_SERIOUS.test('My court date is Tuesday, can I refuse a search?'), 'a live case is filtered out');
  ok(TOO_SERIOUS.test('Me detuvieron y tengo corte'), 'Spanish live-case wording is filtered out');
  ok(!TOO_SERIOUS.test('Can they make me get out of the car?'), 'a general question is not filtered');

  const entries = [
    { id: 'out-of-car', drill: 'step', match: ['get out of the car', 'step out', 'ordered me out'] },
    { id: 'refuse-search', drill: 'traffic', match: ['refuse a search', 'search my car'] }
  ];
  ok(scoreAgainst('Can they make me get out of the car?', entries)?.id === 'out-of-car', 'matches the right entry');
  ok(scoreAgainst('Can they search my car and can I refuse a search?', entries)?.id === 'refuse-search', 'more term hits wins');
  ok(scoreAgainst('What is the best pizza in Chicago', entries) === null, 'an unrelated question matches nothing');

  const rss = `<feed><entry><title>Can I refuse a search?</title><link href="https://reddit.com/x"/><updated>2026-08-20T01:00:00Z</updated></entry></feed>`;
  const p = parseRss(rss);
  ok(p.length === 1 && p[0].title === 'Can I refuse a search?' && p[0].url === 'https://reddit.com/x', 'RSS entries parse');
  ok(parseRss('<feed></feed>').length === 0, 'an empty feed yields nothing');

  let f = 0;
  for (const [v, m] of c) { console.log(`${v ? 'ok  ' : 'FAIL'}  ${m}`); if (!v) f++; }
  console.log(`\n${c.length - f}/${c.length} passed`);
  process.exit(f ? 1 : 0);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const { ENTRIES } = await import('./answer-bank.mjs');
  let bank = { entries: [] };
  try { bank = JSON.parse(await readFile(path.join(ROOT, 'growth', 'answer-bank.json'), 'utf8')); } catch {}
  const replyFor = id => bank.entries.find(e => e.id === id) || null;

  let store = { queue: [], handled: [] };
  try { store = { ...store, ...JSON.parse(await readFile(OUT, 'utf8')) }; } catch {}
  const seen = new Set([...store.queue.map(q => q.url), ...store.handled.map(u => u.url || u)]);

  const found = [];
  const unanswerable = [];
  const errors = [];
  let scanned = 0;

  /* Reddit blocked five of six searches on the first live run. Same shape as
     Marginalia: the limit is real and no amount of politeness removes it, so
     take a slice per run and remember where we stopped. Two sources a week
     covers all six in three weeks, which is far more often than the questions
     people ask actually change. */
  const PER_RUN = 2;
  const start = Number(store.cursor || 0) % SOURCES.length;
  const slice = Array.from({ length: PER_RUN }, (_, i) => SOURCES[(start + i) % SOURCES.length]);
  store.cursor = (start + PER_RUN) % SOURCES.length;

  for (const s of slice) {
    try {
      const items = await fetchSub(s);
      scanned += items.length;
      for (const it of items) {
        if (seen.has(it.url)) continue;
        if (!isQuestion(it.title)) continue;
        if (TOO_SERIOUS.test(it.title)) continue;
        const m = scoreAgainst(it.title, ENTRIES);
        if (!m) {
          /* A real question in the right community that the bank cannot answer.
             This is the most useful output here: it is a list of what people
             actually ask, in their words, that Amparo has not covered — which
             is how the bank and eventually the product should grow. */
          unanswerable.push({ title: it.title, url: it.url, source: `r/${s.sub}` });
          continue;
        }
        seen.add(it.url);
        const r = replyFor(m.id);
        found.push({
          title: it.title, url: it.url, at: it.at,
          source: `r/${s.sub}`, answer: m.id, drill: m.drill, confidence: m.hits,
          suggestedReply: r?.replies?.en || null,
          suggestedReplyEs: r?.replies?.es || null,
          status: 'new'
        });
      }
    } catch (e) { errors.push({ sub: s.sub, error: e.message }); }
    await sleep(12000);
  }

  found.sort((a, b) => b.confidence - a.confidence);
  store.queue = [...found, ...store.queue].slice(0, 200);
  store.unanswerable = [...unanswerable, ...(store.unanswerable || [])].slice(0, 120);
  store._readme = 'Questions a human should answer, in their own name. NOTHING here is posted automatically and nothing should be. Move an item to "handled" once you have replied. Threads describing an arrest or an open case are filtered out on purpose — those need a lawyer, not a drill.';
  store.generated = new Date().toISOString().slice(0, 10);
  store.errors = errors;

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(store, null, 2) + '\n', 'utf8');

  console.log(`scanned ${scanned} threads across ${slice.length} searches (cursor ${store.cursor}/${SOURCES.length}) -> ${found.length} answerable, ${unanswerable.length} we cannot answer yet`);
  if (errors.length) console.log(`${errors.length} source error(s): ${errors.map(e => e.sub + ' ' + e.error).join('; ')}`);
  for (const f2 of found.slice(0, 6)) console.log(`  [${f2.answer}] ${f2.title.slice(0, 74)}`);
}
