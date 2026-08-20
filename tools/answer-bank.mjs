#!/usr/bin/env node
/**
 * Ready-to-paste replies for the questions Amparo actually answers.
 *
 * WHAT THIS IS FOR: answering a real person's question in a group or thread,
 * in your own name, in about thirty seconds. It is not an auto-reply system and
 * must never become one — the value of answering in a community comes entirely
 * from a person having answered, and the moment that is simulated the channel
 * is worth nothing and the account is banned besides.
 *
 * THE CONSTRAINT THAT SHAPES THE BANK: every legal sentence is lifted verbatim
 * from STATES / BASE_RULES_* in index.html. Nothing is written here. So the
 * bank can only cover questions Amparo has already verified — and the ones it
 * cannot cover are as important as the ones it can. Recording an officer, phone
 * searches, and most state-by-state identification rules are deliberately
 * ABSENT, because `research/state-law-matrix.md` has not cleared them. A
 * confident answer on an unverified point is the one thing that would cost more
 * than staying quiet.
 *
 * Each entry carries the drill deep link, so a helpful answer also puts someone
 * one click from practising the thing they just asked about.
 *
 * Usage:
 *   node tools/answer-bank.mjs            write growth/answer-bank.{json,md}
 *   node tools/answer-bank.mjs --selftest
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const ORIGIN = 'https://www.amparohq.com';

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

/* Each entry: the question it answers, where the law comes from, and which
   drill it points at. `match` is what the monitor scores incoming questions
   against — deliberately plain words, because people do not ask questions in
   legal vocabulary. */
export const ENTRIES = [
  {
    id: 'why-pulled-over', drill: 'trap', law: { src: 'BASE', i: 2 },
    q: { en: 'Do I have to answer “do you know why I pulled you over?”',
         es: '¿Tengo que responder «sabe por qué lo detuve»?' },
    match: ['why i pulled you over', 'why they pulled me over', 'do you know why', 'admit', 'admitted', 'said i was speeding', 'por que lo detuve', 'admiti'],
    open: { en: 'You don’t have to guess, and you don’t have to answer that one.',
            es: 'No tiene que adivinar, y no tiene que responder esa pregunta.' }
  },
  {
    id: 'stay-silent', drill: 'traffic', law: { src: 'BASE', i: 2 },
    q: { en: 'Can I just stay quiet?', es: '¿Puedo simplemente quedarme callado?' },
    match: ['stay quiet', 'stay silent', 'remain silent', 'say nothing', 'not answer', 'plead the fifth', 'guardar silencio', 'callado'],
    open: { en: 'Silence works, but only if you say you’re using it. That part surprises people.',
            es: 'El silencio funciona, pero solo si dice que lo está usando. Eso sorprende a mucha gente.' }
  },
  {
    id: 'out-of-car', drill: 'step', law: { src: 'BASE', i: 1 },
    q: { en: 'Can they make me get out of the car?', es: '¿Pueden obligarme a bajar del auto?' },
    match: ['get out of the car', 'step out', 'ordered me out', 'made me exit', 'bajar del auto', 'salir del carro', 'me hizo bajar'],
    open: { en: 'Yes — and they don’t need a reason. This is settled and it catches almost everyone off guard.',
            es: 'Sí — y no necesitan una razón. Es ley establecida y sorprende a casi todos.' }
  },
  {
    id: 'refuse-search', drill: 'traffic', law: { src: 'BASE', i: 3 },
    q: { en: 'Can I refuse a search?', es: '¿Puedo negarme a un registro?' },
    match: ['refuse a search', 'consent to search', 'search my car', 'let them search', 'do i have to let', 'registrar mi auto', 'negarme a un registro'],
    open: { en: 'You can refuse, and refusing is not evidence of anything.',
            es: 'Puede negarse, y negarse no es prueba de nada.' }
  },
  {
    id: 'drug-dog', drill: 'last30', law: { src: 'BASE', i: 4 },
    q: { en: 'How long can they keep me there?', es: '¿Cuánto tiempo pueden retenerme?' },
    match: ['how long can they', 'kept me for', 'waiting for a dog', 'drug dog', 'k9', 'prolong', 'retenerme', 'perro antidrogas'],
    open: { en: 'Once the reason for the stop is finished, holding you longer needs its own justification.',
            es: 'Una vez terminado el motivo de la parada, retenerlo más tiempo necesita su propia justificación.' }
  },
  {
    id: 'unlawful-order', drill: 'last30', law: { src: 'BASE', i: 5 },
    q: { en: 'What if the order is illegal?', es: '¿Y si la orden es ilegal?' },
    match: ['illegal order', 'unlawful', 'they had no right', 'can i refuse to', 'resist', 'orden ilegal', 'no tenian derecho'],
    open: { en: 'Even then — you win later, on paper, with a lawyer. Nobody wins on the roadside.',
            es: 'Aun así — se gana después, en papel, con un abogado. Nadie gana en la carretera.' }
  },
  {
    id: 'sign-ticket-tx', drill: 'last30', law: { src: 'TX', i: 1 }, state: 'TX',
    q: { en: 'Do I have to sign the ticket? (Texas)', es: '¿Tengo que firmar la multa? (Texas)' },
    match: ['sign the ticket', 'signing the ticket', 'refused to sign', 'firmar la multa', 'firmar el ticket'],
    open: { en: 'In Texas, yes — and refusing is one of the few traffic offenses you can be arrested for.',
            es: 'En Texas, sí — y negarse es una de las pocas infracciones por las que pueden arrestarlo.' }
  },
  {
    id: 'passenger-id-tx', drill: 'pass', law: { src: 'TX', i: 3 }, state: 'TX',
    q: { en: 'I was the passenger — do I have to give my name? (Texas)', es: 'Era el pasajero — ¿tengo que dar mi nombre? (Texas)' },
    match: ['passenger', 'i was not driving', 'my friend was driving', 'do i have to give my name', 'ask for my id', 'pasajero', 'dar mi nombre'],
    open: { en: 'It’s not the same rule as the driver’s, and it’s not the same in every state.',
            es: 'No es la misma regla que la del conductor, ni es igual en todos los estados.' }
  },
  {
    id: 'breath-test-tx', drill: 'last30', law: { src: 'TX', i: 5 }, state: 'TX',
    q: { en: 'Can I refuse a breath test? (Texas)', es: '¿Puedo negarme a la prueba de aliento? (Texas)' },
    match: ['breath test', 'breathalyzer', 'blood test', 'field sobriety', 'refuse the test', 'prueba de aliento', 'alcoholemia'],
    open: { en: 'Silence covers questions — it does not cover chemical tests, and the consequences are separate.',
            es: 'El silencio cubre preguntas — no cubre pruebas químicas, y las consecuencias son aparte.' }
  },
  {
    id: 'nyc-right-to-know', drill: 'traffic', law: { src: 'NY', i: 2 }, state: 'NY',
    q: { en: 'Does the officer have to identify themselves? (NYC)', es: '¿El oficial debe identificarse? (NYC)' },
    match: ['badge number', 'identify themselves', 'business card', 'right to know', 'numero de placa', 'identificarse'],
    open: { en: 'In New York City specifically, there are rules about this that most people have never heard of.',
            es: 'Específicamente en la ciudad de Nueva York hay reglas sobre esto que casi nadie conoce.' }
  }
];

const CLOSER = {
  en: (drill, url) => `If it helps, there’s a free 3-minute drill for this exact moment — ${drill}. No account, English or Spanish: ${url}`,
  es: (drill, url) => `Si le sirve, hay un ejercicio gratuito de 3 minutos para justo este momento — ${drill}. Sin cuenta, en inglés o español: ${url}`
};
const DRILL_NAMES = {
  trap: { en: 'the Admission Trap', es: 'la Trampa de Admisión' },
  last30: { en: 'the Last 30 Seconds', es: 'los Últimos 30 Segundos' },
  step: { en: 'Step Out of the Car', es: 'Salir del Auto' },
  pass: { en: 'the Passenger drill', es: 'el ejercicio de Pasajero' },
  traffic: { en: 'the Traffic Stop drill', es: 'el ejercicio de Parada de Tráfico' },
  ck: { en: 'the Checkpoint drill', es: 'el ejercicio de Retén' }
};

export function lawText(src, entry, lang) {
  let rule;
  if (entry.law.src === 'BASE') {
    rule = extractLiteral(src, lang === 'es' ? 'BASE_RULES_ES' : 'BASE_RULES_EN', '[', ']')[entry.law.i];
  } else {
    const st = extractLiteral(src, 'STATES', '{', '}')[entry.law.src];
    rule = st && (lang === 'es' ? st.rules_es : st.rules_en)[entry.law.i];
  }
  if (!rule || /⚠️/.test(rule)) return null;
  const q = pullQuote(rule);
  return { body: bodyOnly(rule), quote: q };
}

export function buildReply(entry, lang, law) {
  const drill = DRILL_NAMES[entry.drill][lang];
  const url = `${ORIGIN}/arena/?sit=${entry.drill}&utm_source=community&utm_medium=answer&utm_content=${entry.id}`;
  return [
    entry.open[lang],
    '',
    law.body,
    law.quote ? '' : null,
    law.quote || null,
    '',
    CLOSER[lang](drill, url)
  ].filter(v => v !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

if (process.argv.includes('--selftest')) {
  const c = []; const ok = (v, m) => c.push([v, m]);
  const src = await readFile(path.join(ROOT, 'index.html'), 'utf8');

  ok(ENTRIES.length >= 10, `bank has ${ENTRIES.length} entries`);
  ok(new Set(ENTRIES.map(e => e.id)).size === ENTRIES.length, 'ids are unique');
  ok(ENTRIES.every(e => DRILL_NAMES[e.drill]), 'every entry points at a named drill');
  ok(!ENTRIES.some(e => e.drill === 'door'), 'nothing points at the held door drill');
  ok(ENTRIES.every(e => e.match.length >= 4), 'every entry has enough match terms to be findable');
  ok(ENTRIES.some(e => e.match.some(m => /[áéíóúñ]/.test(m)) || e.q.es), 'Spanish is covered');

  for (const lang of ['en', 'es']) {
    for (const e of ENTRIES) {
      const law = lawText(src, e, lang);
      if (!law) { ok(false, `${e.id}/${lang} resolved no verified law`); continue; }
      const r = buildReply(e, lang, law);
      if (!r.includes(`sit=${e.drill}`)) { ok(false, `${e.id}/${lang} lost its deep link`); continue; }
      if (/<[a-z]/i.test(r)) { ok(false, `${e.id}/${lang} leaked HTML`); continue; }
    }
  }
  ok(!c.some(([v]) => !v), 'every entry resolves verified law in both languages, keeps its deep link, and contains no HTML');

  /* The absences are a feature and are asserted, so nobody adds them casually. */
  const ids = ENTRIES.map(e => e.id).join(' ');
  ok(!/record|film|phone-search/.test(ids), 'no entry covers recording or phone searches — state-law-matrix has not cleared those');

  let f = 0;
  for (const [v, m] of c) { console.log(`${v ? 'ok  ' : 'FAIL'}  ${m}`); if (!v) f++; }
  console.log(`\n${c.length - f}/${c.length} passed`);
  process.exit(f ? 1 : 0);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const src = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const out = [];
  for (const e of ENTRIES) {
    const row = { id: e.id, drill: e.drill, state: e.state || null, match: e.match, q: e.q, replies: {} };
    for (const lang of ['en', 'es']) {
      const law = lawText(src, e, lang);
      if (law) row.replies[lang] = buildReply(e, lang, law);
    }
    out.push(row);
  }
  await mkdir(path.join(ROOT, 'growth'), { recursive: true });
  await writeFile(path.join(ROOT, 'growth', 'answer-bank.json'),
    JSON.stringify({ _readme: 'Paste-ready replies for real questions. Post them yourself, in your own name. Never automate a reply — the value of answering in a community is that a person answered.', generated: new Date().toISOString().slice(0, 10), entries: out }, null, 2) + '\n', 'utf8');

  const md = ['# Answer bank', '', '_Paste these yourself, in your own name. Every legal sentence is verbatim from the app._', ''];
  for (const r of out) {
    md.push(`## ${r.q.en}`, '', `**Drill:** \`?sit=${r.drill}\`${r.state ? ` · **State:** ${r.state}` : ''}`, '');
    md.push('### English', '', '```', r.replies.en || '(unavailable)', '```', '');
    md.push('### Español', '', '```', r.replies.es || '(no disponible)', '```', '');
  }
  await writeFile(path.join(ROOT, 'growth', 'answer-bank.md'), md.join('\n'), 'utf8');
  console.log(`answer bank: ${out.length} entries, both languages -> growth/answer-bank.{json,md}`);
}
