#!/usr/bin/env node
/**
 * Scenario-led social posts, timed by real news.
 *
 * THE CENTRAL RULE, and the reason this is safe:
 *
 *     THE NEWS CHOOSES WHICH SCENARIO TO POST.
 *     THE NEWS NEVER SUPPLIES WHAT THE POST SAYS.
 *
 * Nothing from an article is ever quoted, paraphrased, named or linked. A feed
 * hit is a timing signal and nothing else — if checkpoints are being announced
 * this week, this week is a good week to post the checkpoint drill. The words
 * come from Amparo's own verified material, exactly as they did before.
 *
 * That inversion is what makes newsjacking survivable for this product. The
 * live feed is full of items like "Glasgow woman arrested after traffic stop"
 * and "Civil rights lawsuit filed against Arkansas state trooper" — reacting to
 * those would mean using a named person's worst day as an advertisement, which
 * is wrong on its own terms, legally fraught while a case is open, and the
 * fastest possible route to the advocacy framing that pulls a Page into Meta's
 * Social Issues category. So individual cases are not merely deprioritised;
 * they cannot enter the pipeline, because no article text ever reaches a post.
 *
 * The one thing derived from the feed is a COUNT — "N checkpoints announced in
 * the US this week" — an aggregate that names nobody and that any reader can
 * verify by searching. Timeliness without exposure.
 *
 * LEGAL TEXT IS STILL VERBATIM. Every sentence in a post that states what the
 * law is comes from STATES / BASE_RULES_* in index.html, unchanged. The hooks
 * and calls to action are product copy — they describe a drill Amparo offers,
 * and assert nothing about the law.
 *
 * WHAT IS PROMOTED IS GATED ON WHAT EXISTS. arena/index.html carries
 * HELD_SITS={door:1} — the door-knock drills are with an attorney and a
 * DV clinician for review — so "at your door" and "we have a warrant" are
 * excluded here despite being the strongest hooks in the set. A drill that
 * cannot be practised is not a drill that can be advertised.
 *
 * Usage:
 *   node tools/news-post.mjs                  today's post (draft)
 *   node tools/news-post.mjs --date 2026-09-01
 *   node tools/news-post.mjs --publish        publish if creds are set
 *   node tools/news-post.mjs --selftest       offline assertions
 *   node tools/news-post.mjs --preview 7      print the next 7 days
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolvePageToken, scrub } from './fb-token.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUTDIR = path.join(ROOT, 'content', 'facebook');
const ORIGIN = 'https://www.amparohq.com';
const GRAPH = 'https://graph.facebook.com/v21.0';
const UA = 'AmparoNewsBot/1.0 (+https://www.amparohq.com; hello@amparohq.com)';

const arg = f => { const i = process.argv.indexOf(f); return i === -1 ? null : process.argv[i + 1]; };
const has = f => process.argv.includes(f);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- verified source text ---------- */
function extractLiteral(src, name, open, close) {
  const m = new RegExp(`^const ${name}\\s*=\\s*\\${open}`, 'm').exec(src);
  if (!m) throw new Error(`could not find const ${name}`);
  const b = m.index + m[0].length - 1;
  const e = src.indexOf(`\n${close};`, b);
  return new Function(`return (${src.slice(b, e + 1 + close.length)})`)();
}
const stripTags = s => String(s).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
export const pullQuote = s => { const m = /<i class="stq">([\s\S]*?)<\/i>/.exec(s); return m ? stripTags(m[1]) : null; };
export const bodyOnly = s => stripTags(String(s).replace(/<br\s*\/?>\s*<i class="stq">[\s\S]*?<\/i>/i, ''));

/* ---------- the drills, and whether they may be advertised ---------- */
export const DRILLS = {
  trap:    { live: true,  en: 'the Admission Trap', es: 'la Trampa de Admisión' },
  last30:  { live: true,  en: 'the Last 30 Seconds', es: 'los Últimos 30 Segundos' },
  step:    { live: true,  en: 'Step Out of the Car', es: 'Salir del Auto' },
  pass:    { live: true,  en: 'the Passenger drill', es: 'el ejercicio de Pasajero' },
  traffic: { live: true,  en: 'the Traffic Stop drill', es: 'el ejercicio de Parada de Tráfico' },
  ck:      { live: true,  en: 'the Checkpoint drill', es: 'el ejercicio de Retén' },
  door:    { live: false, en: 'At Your Door', es: 'En Su Puerta' }   // HELD_SITS={door:1}
};

/* ---------- news queries, each mapped to the drill it should surface ----------
   These exist to answer "is this a live week for X", never to source copy. */
export const QUERIES = [
  { drill: 'ck',      lang: 'en', q: '"DUI checkpoint" OR "sobriety checkpoint" announced' },
  { drill: 'ck',      lang: 'es', q: '"retén" OR "punto de control" policía conductores' },
  { drill: 'traffic', lang: 'en', q: '"traffic enforcement" campaign OR crackdown police' },
  { drill: 'traffic', lang: 'es', q: '"conozca sus derechos" parada de tráfico' }
];

/* An item counts toward a drill's timeliness ONLY if it looks like an
   announcement or an educational notice. Allowlist first, because a blocklist
   cannot anticipate every way a headline names a person. */
export const ALLOW = /(checkpoint|check point|ret[ée]n|punto de control|saturation patrol|enforcement (campaign|effort|blitz|period)|click it or ticket|know your rights|conozca sus derechos|drive sober|holiday (travel|enforcement))/i;

/* And a blocklist anyway, because an allowlist term can appear inside a story
   about a specific person — "arrested at a DUI checkpoint" matches ALLOW. */
/* The Spanish half is as long as the English half on purpose. The first
   version reused English stems and let "Hombre detenido tras un retén
   policial" through — a story about a named man's arrest, matched as a
   checkpoint announcement, because "detenido" is not "detained". Half this
   audience reads Spanish, so a blocklist that is thorough in one language and
   approximate in the other is not a blocklist. */
export const DENY = new RegExp([
  // English
  'arrest', 'charged', 'charges', 'sued', 'lawsuit', 'kill', 'shot', 'shoot',
  'died', 'death', 'indict', 'convict', 'plead', 'sentenc', 'alleged', 'victim',
  'bodycam', 'body cam', 'assault', 'misconduct', 'brutal', 'settle', 'fired',
  'resign', 'detained', 'custody', 'suspect', 'probe', 'investigat',
  // Spanish
  'detenid', 'arrestad', 'demanda', 'denuncia', 'muert', 'homicid', 'herid',
  'dispar', 'balac', 'tirote', 'acusad', 'culpab', 'condenad', 'sentenci',
  'v[ií]ctima', 'agredi', 'abuso', 'fiscal[ií]a', 'cargos', 'investigaci[óo]n',
  'presunt', 'sospechos'
].join('|'), 'i');

export const isTimingSignal = title => ALLOW.test(title) && !DENY.test(title);

/* ---------- the posts ----------
   `law` names where the legal sentence is lifted from; nothing is authored. */
const POSTS = [
  {
    id: 'trap-question', drill: 'trap',
    hook: { en: '“Do you know why I pulled you over?” is not small talk.',
            es: '«¿Sabe por qué lo detuve?» no es una charla casual.' },
    lead: { en: 'It is the one question in a traffic stop that invites you to agree to something before anyone has accused you of anything. You do not have to guess, and you do not have to answer it.',
            es: 'Es la única pregunta de una parada que lo invita a admitir algo antes de que alguien lo acuse de nada. No tiene que adivinar, y no tiene que responderla.' },
    law: { src: 'BASE', i: 2 }
  },
  {
    id: 'silence-aloud', drill: 'traffic',
    hook: { en: 'Going quiet is not the same as using your right to remain silent.',
            es: 'Quedarse callado no es lo mismo que usar su derecho a guardar silencio.' },
    lead: { en: 'The right only protects you once you say it out loud. Most people find that out afterwards.',
            es: 'El derecho solo lo protege cuando lo dice en voz alta. La mayoría se entera después.' },
    law: { src: 'BASE', i: 2 }
  },
  {
    id: 'step-out', drill: 'step',
    hook: { en: 'An officer can order you out of the car without suspecting you of anything.',
            es: 'Un oficial puede ordenarle bajar del auto sin sospechar nada de usted.' },
    lead: { en: 'It is settled law, and it surprises almost everyone the first time it happens. The moment goes better if you have already been through it once.',
            es: 'Es ley establecida, y sorprende a casi todos la primera vez. El momento sale mejor si ya lo practicó una vez.' },
    law: { src: 'BASE', i: 1 }
  },
  {
    id: 'passenger', drill: 'pass',
    hook: { en: 'You were not driving. You are the passenger. Do you have to give your name?',
            es: 'Usted no manejaba. Es el pasajero. ¿Tiene que dar su nombre?' },
    lead: { en: 'The answer is not the same in every state, and it is not the same as the driver’s.',
            es: 'La respuesta no es igual en todos los estados, ni es la misma que la del conductor.' },
    law: { src: 'TX', i: 3 }
  },
  {
    id: 'sign-ticket', drill: 'last30',
    hook: { en: 'In Texas, refusing to sign a ticket can get you arrested.',
            es: 'En Texas, negarse a firmar una multa puede llevar a un arresto.' },
    lead: { en: 'Signing is not admitting anything. It is one of the last things that happens in a stop, and one of the easiest to get wrong.',
            es: 'Firmar no admite nada. Es de lo último que pasa en una parada, y de lo más fácil de equivocar.' },
    law: { src: 'TX', i: 1 }
  },
  {
    id: 'last30', drill: 'last30',
    hook: { en: 'Most stops go fine until the last thirty seconds.',
            es: 'La mayoría de las paradas van bien hasta los últimos treinta segundos.' },
    lead: { en: 'The documents are handed back, the tension drops, and that is exactly when people start explaining themselves.',
            es: 'Le devuelven los documentos, baja la tensión, y justo ahí la gente empieza a explicarse.' },
    law: { src: 'BASE', i: 5 }
  },
  {
    id: 'checkpoint', drill: 'ck',
    hook: { en: 'A checkpoint is not a traffic stop, and the rules are not the same.',
            es: 'Un retén no es una parada de tráfico, y las reglas no son iguales.' },
    lead: { en: 'You were not pulled over for anything. Knowing what that changes — and what it does not — is the whole difference.',
            es: 'A usted no lo detuvieron por nada en particular. Saber qué cambia eso, y qué no, es toda la diferencia.' },
    law: { src: 'BASE', i: 3 }
  },
  {
    id: 'consent-search', drill: 'traffic',
    hook: { en: 'Refusing a search is not evidence of anything.',
            es: 'Negarse a un registro no es prueba de nada.' },
    lead: { en: 'Saying no does not give an officer a reason to search. Saying it clearly, once, without arguing, is a skill — and it is practisable.',
            es: 'Decir que no no le da al oficial una razón para registrar. Decirlo claro, una vez, sin discutir, es una habilidad — y se practica.' },
    law: { src: 'BASE', i: 3 }
  }
];

const CTA = {
  en: (d, n) => `Amparo has a free drill for exactly this moment — ${d}. Three minutes, no account, English or Spanish.`,
  es: (d, n) => `Amparo tiene un ejercicio gratuito para justo este momento — ${d}. Tres minutos, sin cuenta, en inglés o español.`
};
const FIND_OUT = {
  en: 'Practice it, then build your free glovebox pack:',
  es: 'Practíquelo y luego cree su paquete gratis para la guantera:'
};
/* Says NEWS REPORTS, not checkpoints. What the feed yields is a count of
   matching articles, and several outlets covering one checkpoint each count
   once — so "149 checkpoints were announced" was a claim the measurement does
   not support. The number is real and verifiable by searching; the noun it
   attaches to has to be the one actually counted. */
const TIMELY = {
  en: n => `Local news carried ${n} checkpoint announcements in the past week.`,
  es: n => `La prensa local publicó ${n} avisos de retenes en la última semana.`
};

/* ---------- feed ---------- */
export function parseRssTitles(xml) {
  return [...String(xml).matchAll(/<item[\s>][\s\S]*?<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim())
    .filter(Boolean);
}

async function googleNews(q, lang) {
  const hl = lang === 'es' ? 'es-419' : 'en-US';
  const ceid = lang === 'es' ? 'US:es-419' : 'US:en';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=US&ceid=${ceid}`;
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/rss+xml' } });
  if (!res.ok) throw new Error(`Google News HTTP ${res.status}`);
  return parseRssTitles(await res.text());
}

/** Count safe timing signals per drill. Titles are counted and discarded. */
export async function readSignals() {
  const counts = {}; const errors = [];
  for (const { drill, lang, q } of QUERIES) {
    try {
      const titles = await googleNews(q, lang);
      /* Syndicated copy repeats a headline nearly verbatim across outlets.
         Normalising away the trailing " - Outlet Name", punctuation and case
         collapses those to one before counting. */
      const norm = t => t.replace(/\s+[-–|]\s+[^-–|]{2,40}$/, '').toLowerCase().replace(/[^a-z0-9áéíóúñü ]/g, '').replace(/\s+/g, ' ').trim();
      const uniq = new Set(titles.filter(isTimingSignal).map(norm));
      counts[drill] = (counts[drill] || 0) + uniq.size;
    } catch (e) { errors.push({ q, error: e.message }); }
    await sleep(1500);
  }
  return { counts, errors };
}

/* ---------- selection ---------- */
const dayIndex = iso => Math.floor(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000);
const gcd = (a, b) => b ? gcd(b, a % b) : a;
function stride(len) { let s = Math.max(1, Math.round(len * 0.6180339887)); while (gcd(s, len) !== 1) s++; return s; }

/** Alternate language daily; pick the drill the week is hot on, else rotate. */
export function choosePost(iso, counts = {}) {
  const d = dayIndex(iso);
  const lang = d % 2 === 0 ? 'en' : 'es';
  const live = POSTS.filter(p => DRILLS[p.drill].live);

  const hot = Object.entries(counts).filter(([k, v]) => v >= 3 && DRILLS[k]?.live)
    .sort((a, b) => b[1] - a[1])[0];
  /* Even on a hot week, only every third day is news-timed — otherwise the
     Page becomes a checkpoint bulletin and the other drills never surface. */
  if (hot && d % 3 === 0) {
    const pool = live.filter(p => p.drill === hot[0]);
    if (pool.length) return { post: pool[d % pool.length], lang, timely: hot[1], drill: hot[0] };
  }
  return { post: live[(d * stride(live.length)) % live.length], lang, timely: 0 };
}

export function render(post, lang, timely, law) {
  const drill = DRILLS[post.drill][lang];
  /* Deep-link into the named drill rather than the menu. Every hook above
     names a specific scenario, and landing on a list asks the reader to find
     it again at the exact moment they had already decided. arena/index.html
     validates the id and refuses held drills, so a stale link degrades rather
     than breaking. */
  const url = `${ORIGIN}/arena/?sit=${post.drill}&utm_source=facebook&utm_medium=organic&utm_content=${post.id}_${lang}`;
  return [
    post.hook[lang],
    '',
    timely >= 3 ? TIMELY[lang](timely) : null,
    timely >= 3 ? '' : null,
    post.lead[lang],
    '',
    law ? law : null,
    law ? '' : null,
    CTA[lang](drill),
    '',
    `${FIND_OUT[lang]} ${url}`
  ].filter(v => v !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function lawFor(post, lang) {
  const src = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  if (post.law.src === 'BASE') {
    const arr = extractLiteral(src, lang === 'es' ? 'BASE_RULES_ES' : 'BASE_RULES_EN', '[', ']');
    const rule = arr[post.law.i];
    if (!rule || /⚠️/.test(rule)) return null;
    const q = pullQuote(rule);
    return q ? `${bodyOnly(rule)}\n\n${q}` : bodyOnly(rule);
  }
  const STATES = extractLiteral(src, 'STATES', '{', '}');
  const st = STATES[post.law.src];
  if (!st) return null;
  const rule = (lang === 'es' ? st.rules_es : st.rules_en)[post.law.i];
  if (!rule) return null;
  const q = pullQuote(rule);
  return q ? `${bodyOnly(rule)}\n\n${q}` : bodyOnly(rule);
}

/* ---------- publish ---------- */
async function publish(text) {
  const id = process.env.FB_PAGE_ID, raw = process.env.FB_PAGE_TOKEN;
  if (!id || !raw) return { published: false, reason: 'FB_PAGE_ID / FB_PAGE_TOKEN not set - draft only' };
  let token;
  try { token = (await resolvePageToken(raw, id)).token; }
  catch (e) { return { published: false, reason: scrub(e.message, raw) }; }
  const res = await fetch(`${GRAPH}/${id}/feed`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: text, access_token: token })
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) return { published: false, reason: `Graph ${res.status}: ${scrub(j?.error?.message || '?', raw)}` };
  return { published: true, postId: j.id };
}

/* ---------- selftest ---------- */
if (has('--selftest')) {
  const c = []; const ok = (v, m) => c.push([v, m]);

  ok(isTimingSignal('Modesto police to hold DUI checkpoint Friday'), 'checkpoint announcement is a valid timing signal');
  ok(isTimingSignal('Conozca Sus Derechos Baltimore - Baltimore City'), 'Spanish rights notice is a valid signal');
  ok(!isTimingSignal('Glasgow woman arrested after traffic stop'), 'an arrest story is rejected');
  ok(!isTimingSignal('Civil rights lawsuit filed against Arkansas state trooper after traffic stop'), 'a lawsuit story is rejected');
  ok(!isTimingSignal('Man charged after traffic stop in Morris County'), 'a charging story is rejected');
  ok(!isTimingSignal('Driver arrested at DUI checkpoint'), 'allowlist term inside an arrest story is still rejected');
  ok(!isTimingSignal('Hombre detenido tras un retén policial'), 'Spanish arrest story is rejected');
  ok(!isTimingSignal('Presunto responsable acusado tras control policial'), 'Spanish charging story is rejected');
  ok(!isTimingSignal('Investigación por muerte bajo custodia policial'), 'Spanish custody-death story is rejected');
  ok(isTimingSignal('Retén de sobriedad este viernes en Modesto'), 'a plain Spanish checkpoint announcement still passes');
  ok(!isTimingSignal('City council debates new bike lane'), 'unrelated news is not a signal');

  ok(POSTS.every(p => DRILLS[p.drill]), 'every post maps to a known drill');
  ok(POSTS.every(p => DRILLS[p.drill].live), 'no post advertises a held drill');
  ok(!POSTS.some(p => p.drill === 'door'), 'the door drills are excluded while held for review');

  const a = choosePost('2026-09-01', {}), b = choosePost('2026-09-02', {});
  ok(a.lang !== b.lang, 'language alternates day to day');
  ok(choosePost('2026-09-01', {}).post.id === choosePost('2026-09-01', {}).post.id, 'same date is deterministic');

  const seen = new Set();
  const liveN = POSTS.filter(p => DRILLS[p.drill].live).length;
  for (let i = 0; i < liveN; i++) seen.add(choosePost(new Date(Date.UTC(2026, 8, 1) + i * 86400000).toISOString().slice(0, 10), {}).post.id);
  ok(seen.size === liveN, `rotation covers every post before repeating (${seen.size}/${liveN})`);

  const hotDays = [];
  for (let i = 0; i < 9; i++) {
    const iso = new Date(Date.UTC(2026, 8, 1) + i * 86400000).toISOString().slice(0, 10);
    if (choosePost(iso, { ck: 12 }).timely) hotDays.push(iso);
  }
  ok(hotDays.length > 0 && hotDays.length <= 4, `a hot week times some but not all posts (${hotDays.length}/9)`);

  const txt = render(POSTS[0], 'en', 0, 'LAW TEXT');
  ok(txt.includes('utm_source=facebook'), 'rendered post carries attribution');
  ok(txt.includes('/arena/'), 'CTA points at the practice arena, not the homepage');
  ok(txt.includes('?sit=trap&'), 'CTA deep-links into the named drill');
  ok(!POSTS.some(p => !DRILLS[p.drill].live), 'no post can deep-link to a held drill');
  ok(!/<[a-z]/i.test(txt), 'no raw HTML survives into a post');
  const timelyTxt = render(POSTS[0], 'en', 12, 'LAW TEXT');
  ok(/carried 12 checkpoint announcements/.test(timelyTxt), 'aggregate appears, names nobody, and counts news reports rather than checkpoints');

  ok(parseRssTitles('<item><title><![CDATA[Hello &amp; goodbye]]></title></item>')[0] === 'Hello & goodbye', 'RSS titles are CDATA-unwrapped and entity-decoded');

  let f = 0;
  for (const [v, m] of c) { console.log(`${v ? 'ok  ' : 'FAIL'}  ${m}`); if (!v) f++; }
  console.log(`\n${c.length - f}/${c.length} passed`);
  process.exit(f ? 1 : 0);
}

/* ---------- main ---------- */
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const previewN = Number(arg('--preview') || 0);
  const iso = arg('--date') || new Date().toISOString().slice(0, 10);

  let counts = {}, errors = [];
  if (!previewN) ({ counts, errors } = await readSignals());

  if (previewN) {
    for (let i = 0; i < previewN; i++) {
      const d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) + i * 86400000).toISOString().slice(0, 10);
      const { post, lang, timely } = choosePost(d, {});
      console.log(`${d}  [${lang}/${post.drill}]  ${post.hook[lang].slice(0, 70)}`);
    }
    process.exit(0);
  }

  const { post, lang, timely } = choosePost(iso, counts);
  const law = await lawFor(post, lang);
  const text = render(post, lang, timely, law);

  const outPath = path.join(OUTDIR, `${iso}.json`);
  let existing = null;
  try { await access(outPath); existing = JSON.parse(await readFile(outPath, 'utf8')); } catch {}
  if (existing?.published && !has('--force')) {
    console.log(`${iso}: already published (${existing.postId || 'no id'})`);
    process.exit(0);
  }

  const result = has('--publish') ? await publish(text) : { published: false, reason: 'draft mode (no --publish)' };
  await mkdir(OUTDIR, { recursive: true });
  await writeFile(outPath, JSON.stringify({ date: iso, lang, drill: post.drill, postKey: post.id, timelySignals: timely, signalCounts: counts, feedErrors: errors, text, ...result }, null, 2) + '\n', 'utf8');

  console.log(`${iso}  [${lang}/${post.drill}]  ${result.published ? 'PUBLISHED ' + result.postId : 'draft — ' + result.reason}`);
  if (Object.keys(counts).length) console.log(`signals: ${JSON.stringify(counts)}`);
  console.log('-'.repeat(64));
  console.log(text);
}
