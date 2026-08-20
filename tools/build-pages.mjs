#!/usr/bin/env node
/**
 * Generates Amparo's crawlable publishing surface from the data already
 * shipped in root index.html, and rewrites sitemap.xml to match.
 *
 * WHY THIS EXISTS: robots.txt has always said "the rights content here is the
 * only crawlable know-your-rights material in this category (every competitor
 * is a native app). Crawling it is the point." sitemap.xml listed exactly one
 * URL, so there was nothing for a search engine or a language model to cite
 * for "know your rights traffic stop <state>" — the highest-intent free query
 * in the category.
 *
 * WHAT IT DOES NOT DO: author anything. Every rule on every generated page is
 * lifted verbatim from STATES / BASE_RULES_* in index.html — the same text
 * that already ships to users today. Publishing it at a crawlable URL changes
 * the surface, never the claim. If a rule is wrong here it is already wrong in
 * the product, which is the only acceptable coupling.
 *
 * ===================== ALL 51 JURISDICTIONS, HONESTLY =====================
 * Every state and DC gets a page, mirroring the app, where every state is
 * selectable and nobody hits a dead end. But only three states — TX, GA, NY —
 * have rules verified to Amparo's citation standard, and
 * research/state-law-matrix.md forbids publishing anything else as fact.
 *
 * So a page is one of two things, decided by the data and never by hand:
 *
 *   VERIFIED (3)   That state's own statutes, quoted, with citations.
 *   UNVERIFIED     The federal floor only — Constitution and Supreme Court
 *                  rules that genuinely bind every state — plus an explicit
 *                  notice that we have NOT checked that state's own rules,
 *                  plus that state's legal-aid directory where we have one.
 *
 * An unverified page never states a state-specific rule. It says what is true
 * everywhere, says plainly what it does not know, and points at someone who
 * does. That is the same bargain the app already makes.
 *
 * INDEXING follows substance, not ambition. A page is indexable when it has
 * something a visitor could not get from any other state's page: verified
 * rules, or a state-specific legal-aid directory. The rest are identical
 * except the state name — the textbook doorway pattern — so they are
 * generated (useful to someone arriving from a link) but carry noindex and
 * stay out of the sitemap. No hand-maintained list: add a legal-aid entry or
 * verify a state, and its page flips on by itself.
 * =========================================================================
 *
 * THE HONESTY CONSTRAINT: REVIEW.attorneys is {name:"",bar:"",date:"",
 * edition:""} for all three verified states, so isReviewed() is false
 * everywhere and the app hides its own attorney badge. These pages therefore
 * must NOT claim attorney review. They claim what is checkable: the edition,
 * and when law-watch.mjs last checked the cited statute SOURCES. "A lawyer
 * signed this" is a different claim and is made nowhere — /how-we-verify/
 * states its absence outright rather than leaving it to be inferred.
 *
 * Usage: node tools/build-pages.mjs [--check]
 *   --check  build to memory and diff against disk; exit 1 if stale. For CI.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const SRC = path.join(ROOT, 'index.html');
const CHECK = process.argv.includes('--check');
const ORIGIN = 'https://www.amparohq.com';

/* Top-level literals in index.html open with `const NAME = {` and close with
   `};` in column 0; everything nested is indented. So "first line that is
   exactly };" is an exact terminator and needs no brace matching — which
   matters because the rule text contains quotes, section symbols and HTML,
   and a naive brace counter would trip on the first one it met inside a
   string. */
function extractLiteral(src, name, open, close) {
  const m = new RegExp(`^const ${name}\\s*=\\s*\\${open}`, 'm').exec(src);
  if (!m) throw new Error(`extractLiteral: could not find "const ${name} = ${open}" in index.html`);
  const bodyStart = m.index + m[0].length - 1;
  const endIdx = src.indexOf(`\n${close};`, bodyStart);
  if (endIdx === -1) throw new Error(`extractLiteral: no column-0 "${close};" terminator after ${name}`);
  try {
    return new Function(`return (${src.slice(bodyStart, endIdx + 1 + close.length)})`)();
  } catch (e) {
    throw new Error(`extractLiteral: ${name} did not evaluate as a literal — ${e.message}`);
  }
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const CSS = `
/* Amparo's real palette, taken from const LOGO and the app's own CSS: navy
   #1B2A4A, gold #E8B84B, cream #FAF6EE. */
:root{--ink:#1c2740;--bg:#FAF6EE;--line:#e5dcc6;--quote:#2f3f5e;--accent:#1B2A4A;--gold:#E8B84B;--warn:#6b4f0a;--warnbg:#fdf6e3}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.65 Georgia,'Times New Roman',serif;padding:0 20px}
main{max-width:44rem;margin:0 auto;padding:48px 0 72px}
h1{font-size:clamp(1.7rem,1.2rem+2vw,2.4rem);line-height:1.2;margin:0 0 .35em;color:var(--accent)}
h1::after{content:'';display:block;width:3.2rem;height:5px;border-radius:3px;background:var(--gold);margin-top:.45em}
h2{font-size:1.2rem;margin:2.2em 0 .6em;font-family:system-ui,sans-serif;color:var(--accent)}
.intro{font-size:1.05rem;color:var(--quote)}
ol,ul{padding-left:1.1em}
li{margin:0 0 1.1em}
.stq{display:block;margin-top:.5em;padding-left:.9em;border-left:3px solid var(--gold);color:var(--quote);font-size:.94em}
.note{background:var(--warnbg);border:1.5px solid var(--gold);border-radius:12px;padding:16px 18px;margin:1.6em 0;color:var(--warn);font-size:.96rem;line-height:1.55}
.note b{color:var(--accent)}
.cta{display:inline-block;margin:1.4em 0;padding:.85em 1.4em;background:var(--accent);color:#FAF6EE;text-decoration:none;border-radius:8px;font-family:system-ui,sans-serif;font-size:1rem}
.aid{margin:0 0 1.1em;padding-left:0;list-style:none}
.aid li{margin:0 0 1em}
.aid .n{font-weight:bold;color:var(--accent)}
.aid .p{font-family:system-ui,sans-serif;font-size:.93em}
.cols{columns:2;column-gap:2rem}
.cols li{break-inside:avoid;margin:0 0 .5em}
@media(max-width:34rem){.cols{columns:1}}
footer{margin-top:3em;padding-top:1.4em;border-top:1px solid var(--line);font-size:.85rem;color:var(--quote);font-family:system-ui,sans-serif}
a{color:var(--accent)}
@media(prefers-color-scheme:dark){:root{--ink:#e8eef7;--bg:#141b2b;--line:#2f3f5e;--quote:#8fa0bd;--accent:#E8B84B;--gold:#E8B84B;--warn:#f0dca8;--warnbg:#241f10}
.cta{color:#1B2A4A}}`.trim();

const page = ({ lang, title, desc, canonical, altHref, altLang, h1, intro, blocks, jsonld, footerNote, noindex }) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex,follow">\n' : ''}<link rel="canonical" href="${canonical}">
${altHref ? `<link rel="alternate" hreflang="${altLang}" href="${altHref}">\n<link rel="alternate" hreflang="${lang}" href="${canonical}">` : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="og:image" content="${ORIGIN}/og.png">
<link rel="alternate" type="application/rss+xml" title="Amparo" href="${ORIGIN}/feed.xml">
<style>
${CSS}
</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body>
<main>
<h1>${esc(h1)}</h1>
<p class="intro">${intro}</p>
${blocks}
<footer>${footerNote}</footer>
</main>
</body>
</html>
`;

const appLink = (s, label) => `<a class="cta" href="/?utm_source=organic&amp;utm_medium=page&amp;utm_content=${s}">${esc(label)}</a>`;
const rulesList = rules => `<ol>${rules.map(r => `<li>${r}</li>`).join('')}</ol>`;

const aidList = (entries, lang) => `<ul class="aid">${entries.map(e => {
  const name = (lang === 'es' && e.n_es) ? e.n_es : e.n;
  const d = lang === 'es' ? (e.d_es || e.d_en) : e.d_en;
  const p = String(e.p || '');
  /* Phone numbers and "Dial 211" are not links; bare hostnames are. */
  const href = /^https?:\/\//i.test(p) ? p : (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(p) ? `https://${p}` : null);
  return `<li><span class="n">${esc(name)}</span><br><span class="p">${href ? `<a href="${esc(href)}" rel="nofollow noopener">${esc(p)}</a>` : esc(p)}</span><br>${esc(d || '')}</li>`;
}).join('')}</ul>`;

async function build() {
  const src = await readFile(SRC, 'utf8');
  const STATES = extractLiteral(src, 'STATES', '{', '}');
  const BASE = { en: extractLiteral(src, 'BASE_RULES_EN', '[', ']'), es: extractLiteral(src, 'BASE_RULES_ES', '[', ']') };
  const NAMES = extractLiteral(src, 'US_STATE_NAMES', '{', '}');
  const AID = extractLiteral(src, 'STATE_LEGAL_AID', '{', '}');
  const NATIONAL = extractLiteral(src, 'BASE_LIFELINES', '[', ']');
  const EDITION = (/const EDITION\s*=\s*"([^"]+)"/.exec(src) || [, 'unknown'])[1];

  const verified = Object.keys(STATES);
  if (verified.length < 3) throw new Error(`STATES parsed to ${verified.length} entries (${verified}); expected the three verified states`);
  for (const k of verified) {
    if (!STATES[k].rules_en?.length || !STATES[k].rules_es?.length) throw new Error(`${k} missing rules_en/rules_es`);
  }
  if (Object.keys(NAMES).length < 51) throw new Error(`US_STATE_NAMES parsed to ${Object.keys(NAMES).length}; expected 51`);
  if (!BASE.en.length || !BASE.es.length) throw new Error('BASE_RULES_* parsed empty');

  let status = {};
  try { status = JSON.parse(await readFile(path.join(ROOT, 'law-status.json'), 'utf8')); } catch {}
  const checked = status.lastChecked || 'unknown';

  const files = new Map();
  const indexable = [`${ORIGIN}/`];
  /* Only pages worth subscribing to: real content, English only — a bilingual
     feed of the same page twice reads as duplication to an aggregator. */
  const feedEntries = [];

  const foot = lang => lang === 'es'
    ? `Edición ${esc(EDITION)}. Fuentes legales citadas verificadas por última vez el ${esc(checked)} — esa comprobación detecta cambios en la página de la ley, no confirma que la regla sea correcta. Amparo no es un bufete y esto no es asesoría legal. <a href="/derechos/">Todos los estados</a> · <a href="/como-verificamos/">Cómo verificamos</a> · <a href="/acerca/">Acerca de</a> · <a href="/">Amparo</a>`
    : `Edition ${esc(EDITION)}. Cited legal sources last checked ${esc(checked)} — that check detects when a statute page changes, it does not confirm the rule is correct. Amparo is not a law firm and this is not legal advice. <a href="/rights/">All states</a> · <a href="/how-we-verify/">How we verify</a> · <a href="/about/">About</a> · <a href="/">Amparo</a>`;

  const faq = (items, lang, name) => ({
    '@context': 'https://schema.org', '@type': 'FAQPage', name, inLanguage: lang,
    mainEntity: items.map((t, i) => ({
      '@type': 'Question', name: `${lang === 'es' ? 'Regla' : 'Rule'} ${i + 1}`,
      acceptedAnswer: { '@type': 'Answer', text: stripTags(t) }
    }))
  });

  /* ---- 51 state pages ---- */
  for (const ab of Object.keys(NAMES)) {
    const name = NAMES[ab];
    const isVerified = !!STATES[ab];
    const aid = AID[ab] ? [AID[ab]] : null;
    const noindex = !isVerified && !aid;

    for (const lang of ['en', 'es']) {
      const base = lang === 'en' ? 'rights' : 'derechos';
      const other = lang === 'en' ? 'derechos' : 'rights';
      const url = `${ORIGIN}/${base}/${ab.toLowerCase()}/`;
      const rules = isVerified ? (lang === 'en' ? STATES[ab].rules_en : STATES[ab].rules_es) : BASE[lang];

      const title = lang === 'en'
        ? `Your rights at a traffic stop in ${name} — Amparo`
        : `Sus derechos en una parada de tráfico en ${name} — Amparo`;
      const desc = isVerified
        ? (lang === 'en'
          ? `What ${name} law requires at a traffic stop, each rule quoted from the statute it comes from. Free, bilingual, printable.`
          : `Lo que la ley de ${name} exige en una parada de tráfico, cada regla citada de la ley de la que proviene. Gratis, bilingüe, imprimible.`)
        : (lang === 'en'
          ? `The federal rules that apply in ${name} at a traffic stop, each with the case it comes from — and an honest note on what we have not verified about ${name} yet.`
          : `Las reglas federales que aplican en ${name} en una parada de tráfico, cada una con el caso del que proviene — y una nota honesta sobre lo que aún no hemos verificado de ${name}.`);

      const intro = isVerified
        ? (lang === 'en'
          ? `Every rule below is quoted from the ${name} statute it comes from, so you can check it yourself. This is the same text Amparo prints onto a card for your glovebox.`
          : `Cada regla aquí está citada de la ley de ${name} de la que proviene, para que usted mismo pueda verificarla. Este es el mismo texto que Amparo imprime en una tarjeta para su guantera.`)
        : (lang === 'en'
          ? `These rules come from the US Constitution and the Supreme Court, so they hold in ${name} and in every other state.`
          : `Estas reglas provienen de la Constitución de EE. UU. y la Corte Suprema, así que aplican en ${name} y en todos los demás estados.`);

      /* The gap notice sits ABOVE the rules, not under them. A reader who
         stops after the first screen must still leave knowing what we have
         not checked — burying it below seven rules would be technically
         present and practically hidden. */
      const gap = isVerified ? '' : (lang === 'en'
        ? `<div class="note"><b>We have not verified ${esc(name)}'s own rules yet.</b> Everything below is federal law and applies everywhere. What changes state by state — whether you must give your name, whether refusing to sign a ticket can get you arrested, whether you may record without telling the officer — is not shown for ${esc(name)}, because we will not print a rule we have not checked against that state's statutes. Three states are done so far: Texas, Georgia and New York.</div>`
        : `<div class="note"><b>Todavía no hemos verificado las reglas propias de ${esc(name)}.</b> Todo lo siguiente es ley federal y aplica en todas partes. Lo que cambia según el estado — si debe dar su nombre, si negarse a firmar una multa puede llevar a un arresto, si puede grabar sin avisarle al oficial — no se muestra para ${esc(name)}, porque no publicamos una regla que no hemos verificado con las leyes de ese estado. Tres estados están listos: Texas, Georgia y Nueva York.</div>`);

      const help = (() => {
        const list = aid || (isVerified ? null : NATIONAL);
        if (!list) return '';
        const h = lang === 'en'
          ? (aid ? `Free legal help in ${esc(name)}` : 'Free legal help, anywhere in the US')
          : (aid ? `Ayuda legal gratuita en ${esc(name)}` : 'Ayuda legal gratuita, en todo EE. UU.');
        return `<h2>${h}</h2>${aidList(list, lang)}`;
      })();

      files.set(path.join(ROOT, base, ab.toLowerCase(), 'index.html'), page({
        lang, title, desc, canonical: url, noindex,
        altHref: `${ORIGIN}/${other}/${ab.toLowerCase()}/`, altLang: lang === 'en' ? 'es' : 'en',
        h1: lang === 'en' ? `Your rights at a traffic stop in ${name}` : `Sus derechos en una parada de tráfico en ${name}`,
        intro,
        blocks: gap + rulesList(rules) + help + appLink(`${base}_${ab.toLowerCase()}`, lang === 'en' ? 'Build your free pack' : 'Cree su paquete gratis'),
        jsonld: faq(rules, lang, title), footerNote: foot(lang)
      }));
      if (!noindex) indexable.push(url);
      if (!noindex && lang === 'en') feedEntries.push({ title, url, desc, date: checked });
    }
  }

  /* ---- federal page + hub ---- */
  for (const lang of ['en', 'es']) {
    const base = lang === 'en' ? 'rights' : 'derechos';
    const other = lang === 'en' ? 'derechos' : 'rights';
    const s = lang === 'en' ? 'any-state' : 'cualquier-estado';
    const os = lang === 'en' ? 'cualquier-estado' : 'any-state';
    const url = `${ORIGIN}/${base}/${s}/`;
    const title = lang === 'en'
      ? 'Your rights at a traffic stop in any US state — Amparo'
      : 'Sus derechos en una parada de tráfico en cualquier estado — Amparo';
    files.set(path.join(ROOT, base, s, 'index.html'), page({
      lang, title,
      desc: lang === 'en'
        ? 'The federal floor: rules from the US Constitution and the Supreme Court that bind every state, each with the case it comes from.'
        : 'El piso federal: reglas de la Constitución de EE. UU. y la Corte Suprema que aplican en todos los estados, cada una con el caso del que proviene.',
      canonical: url, altHref: `${ORIGIN}/${other}/${os}/`, altLang: lang === 'en' ? 'es' : 'en',
      h1: lang === 'en' ? 'Your rights at a traffic stop in any US state' : 'Sus derechos en una parada de tráfico en cualquier estado',
      intro: lang === 'en'
        ? 'These come from the US Constitution and the Supreme Court, so they hold in all fifty states. What changes state by state is on each state’s own page.'
        : 'Estas provienen de la Constitución de EE. UU. y la Corte Suprema, así que aplican en los cincuenta estados. Lo que cambia según el estado aparece en la página de cada estado.',
      blocks: rulesList(BASE[lang])
        + `<h2>${lang === 'en' ? 'Free legal help, anywhere in the US' : 'Ayuda legal gratuita, en todo EE. UU.'}</h2>` + aidList(NATIONAL, lang)
        + appLink(`${base}_${s}`, lang === 'en' ? 'Build your free pack' : 'Cree su paquete gratis'),
      jsonld: faq(BASE[lang], lang, title), footerNote: foot(lang)
    }));
    indexable.push(url);
    if (lang === 'en') feedEntries.push({ title, url, desc: 'The federal floor: rules from the US Constitution and the Supreme Court that bind every state, each with the case it comes from.', date: checked });

    const hubUrl = `${ORIGIN}/${base}/`;
    const done = Object.keys(NAMES).filter(a => STATES[a]);
    const rest = Object.keys(NAMES).filter(a => !STATES[a]);
    const li = a => `<li><a href="/${base}/${a.toLowerCase()}/">${esc(NAMES[a])}</a></li>`;
    files.set(path.join(ROOT, base, 'index.html'), page({
      lang,
      title: lang === 'en' ? 'Know your rights at a traffic stop, by state — Amparo' : 'Conozca sus derechos en una parada de tráfico, por estado — Amparo',
      desc: lang === 'en'
        ? 'Traffic-stop rights for all 50 states and DC. Three states verified against their own statutes; the rest show the federal rules that apply everywhere.'
        : 'Derechos en paradas de tráfico para los 50 estados y DC. Tres estados verificados con sus propias leyes; el resto muestra las reglas federales.',
      canonical: hubUrl, altHref: `${ORIGIN}/${other}/`, altLang: lang === 'en' ? 'es' : 'en',
      h1: lang === 'en' ? 'Know your rights at a traffic stop' : 'Conozca sus derechos en una parada de tráfico',
      intro: lang === 'en'
        ? `Every state and DC has a page. ${done.length} are verified against that state’s own statutes; the rest show the federal rules that apply everywhere, plus an honest note about what has not been checked.`
        : `Cada estado y DC tiene su página. ${done.length} están verificados con las leyes de ese estado; el resto muestra las reglas federales que aplican en todas partes, más una nota honesta sobre lo que no se ha verificado.`,
      blocks: `<h2>${lang === 'en' ? 'Verified against that state’s statutes' : 'Verificados con las leyes del estado'}</h2><ul>${done.map(li).join('')}</ul>`
        + `<h2>${lang === 'en' ? 'Federal rules apply — state rules not verified yet' : 'Aplican reglas federales — reglas estatales aún no verificadas'}</h2><ul class="cols">${rest.map(li).join('')}</ul>`
        + appLink(`${base}_hub`, lang === 'en' ? 'Build your free pack' : 'Cree su paquete gratis'),
      footerNote: foot(lang)
    }));
    indexable.push(hubUrl);
  }

  /* ---- Move A3: the publisher-posture pages ----
     Every free channel in the organic plan — LLM citation, news aggregators,
     trade press, search — screens for whether a site looks like a publisher
     before it will carry it: a named author, a stated method, a correction
     path. These two pages are that gate, and they are also the pages where
     understating is the whole point. */
  const REV = { founder: 'Michael Francois', role: 'Founder', contact: 'hello@amparohq.com' };
  for (const lang of ['en', 'es']) {
    const aboutSlug = lang === 'en' ? 'about' : 'acerca';
    const otherAbout = lang === 'en' ? 'acerca' : 'about';
    const verifySlug = lang === 'en' ? 'how-we-verify' : 'como-verificamos';
    const otherVerify = lang === 'en' ? 'como-verificamos' : 'how-we-verify';

    files.set(path.join(ROOT, aboutSlug, 'index.html'), page({
      lang,
      title: lang === 'en' ? 'About Amparo' : 'Acerca de Amparo',
      desc: lang === 'en'
        ? 'Who makes Amparo, why it exists, and exactly what it does and does not claim.'
        : 'Quién hace Amparo, por qué existe, y exactamente qué afirma y qué no.',
      canonical: `${ORIGIN}/${aboutSlug}/`, altHref: `${ORIGIN}/${otherAbout}/`, altLang: lang === 'en' ? 'es' : 'en',
      h1: lang === 'en' ? 'About Amparo' : 'Acerca de Amparo',
      intro: lang === 'en'
        ? 'Amparo builds a free, bilingual pack you print and keep in the glovebox: a card that speaks for you, your documents laid out, your state’s rules, and the words to say.'
        : 'Amparo crea un paquete gratuito y bilingüe que usted imprime y guarda en la guantera: una tarjeta que habla por usted, sus documentos, las reglas de su estado y las palabras que decir.',
      blocks: lang === 'en' ? `
<h2>Why it exists</h2>
<p><em>Amparo</em> is the Spanish word for shelter, and in law, for a constitutional protection. A traffic stop is a short, high-pressure conversation where knowing one sentence changes the outcome — and the people most likely to be stopped are least likely to have a lawyer’s number in their phone. The pack is free because charging for it would defeat the point.</p>
<h2>Who makes it</h2>
<p>${esc(REV.founder)}, ${esc(REV.role)}. Write to <a href="mailto:${esc(REV.contact)}">${esc(REV.contact)}</a>.</p>
<h2>What Amparo claims — and what it does not</h2>
<ul>
<li><b>It claims:</b> every published state rule is quoted from that state’s own statute, with the citation, so you can check it against the primary source yourself.</li>
<li><b>It does not claim</b> to be a law firm, to give legal advice, or to be attorney-reviewed. <a href="/${verifySlug}/">How we verify</a> states exactly where that line sits today.</li>
<li><b>It does not claim</b> nationwide coverage. Three states are verified. Every other state page shows the federal rules that apply everywhere and says plainly what has not been checked.</li>
</ul>
<h2>What it costs</h2>
<p>Nothing. There is no paid product.</p>` : `
<h2>Por qué existe</h2>
<p><em>Amparo</em> significa refugio, y en derecho, una protección constitucional. Una parada de tráfico es una conversación corta y de mucha presión donde saber una sola frase cambia el resultado — y las personas con más probabilidad de ser detenidas son las que menos suelen tener el número de un abogado en el teléfono. El paquete es gratis porque cobrar por él anularía el propósito.</p>
<h2>Quién lo hace</h2>
<p>${esc(REV.founder)}, ${esc(REV.role)}. Escriba a <a href="mailto:${esc(REV.contact)}">${esc(REV.contact)}</a>.</p>
<h2>Lo que Amparo afirma — y lo que no</h2>
<ul>
<li><b>Afirma:</b> cada regla estatal publicada está citada de la ley de ese estado, con su referencia, para que usted mismo pueda verificarla en la fuente primaria.</li>
<li><b>No afirma</b> ser un bufete, dar asesoría legal, ni estar revisado por un abogado. <a href="/${verifySlug}/">Cómo verificamos</a> explica exactamente dónde está esa línea hoy.</li>
<li><b>No afirma</b> cobertura nacional. Tres estados están verificados. Las demás páginas muestran las reglas federales y dicen claramente qué no se ha verificado.</li>
</ul>
<h2>Cuánto cuesta</h2>
<p>Nada. No hay producto de pago.</p>`,
      footerNote: foot(lang)
    }));
    indexable.push(`${ORIGIN}/${aboutSlug}/`);

    files.set(path.join(ROOT, verifySlug, 'index.html'), page({
      lang,
      title: lang === 'en' ? 'How we verify — Amparo' : 'Cómo verificamos — Amparo',
      desc: lang === 'en'
        ? 'Amparo’s verification standard, the confidence levels behind every rule, the daily source check, and an honest statement of what has not been done yet.'
        : 'El estándar de verificación de Amparo, los niveles de confianza detrás de cada regla, la comprobación diaria de fuentes, y una declaración honesta de lo que aún no se ha hecho.',
      canonical: `${ORIGIN}/${verifySlug}/`, altHref: `${ORIGIN}/${otherVerify}/`, altLang: lang === 'en' ? 'es' : 'en',
      h1: lang === 'en' ? 'How we verify' : 'Cómo verificamos',
      intro: lang === 'en'
        ? 'Amparo publishes rules people rely on in a moment they cannot pause. This page states exactly how a rule gets published — and what has not been done yet.'
        : 'Amparo publica reglas en las que la gente confía en un momento que no puede pausar. Esta página explica exactamente cómo se publica una regla — y qué aún no se ha hecho.',
      blocks: lang === 'en' ? `
<h2>Three confidence levels</h2>
<ul>
<li><b>Verified</b> — quoted from an official legislature site or primary statute text. Only this level is ever published as a state rule.</li>
<li><b>Likely</b> — the section number is corroborated by multiple independent secondary sources, but the raw statute text has not been fetched. Never published.</li>
<li><b>Unverified</b> — not established. Never published in any form.</li>
</ul>
<h2>Why so few states</h2>
<p>Three states — Texas, Georgia and New York — are published. Careful sourcing contradicted the widely-copied list of “stop and identify” states on four of the first ten states researched. That is the argument against generating state content quickly: the fast version would have been wrong in four places, and a driver would have been holding it at the window.</p>
<h2>The daily source check</h2>
<p>A scheduled job re-fetches every primary statute page behind a published rule and compares it to a stored hash. A change means a person has to re-read it. <b>It does not verify that the law is correct — no script can.</b> “Sources checked” and “reviewed by a person” are different claims, and this site keeps them separate on purpose.</p>
<h2>What has not been done yet</h2>
<div class="note"><b>No attorney has signed off on the current edition.</b> Amparo’s own standard is that a rule should also be reviewed by an attorney licensed in that state, tied to the specific edition reviewed. That has not happened yet — so no attorney badge appears anywhere on this site, and nothing here should be read as attorney-reviewed. Every published rule is quoted from primary statute text, which is a real standard, but it is a different and weaker one. Saying so is more useful to you than the alternative.</div>
<h2>Found something wrong?</h2>
<p>Write to <a href="mailto:${esc(REV.contact)}">${esc(REV.contact)}</a> with the state and the rule. Corrections are the highest-priority work here.</p>` : `
<h2>Tres niveles de confianza</h2>
<ul>
<li><b>Verificado</b> — citado de un sitio oficial de la legislatura o del texto primario de la ley. Solo este nivel se publica como regla estatal.</li>
<li><b>Probable</b> — el número de sección está corroborado por varias fuentes secundarias independientes, pero no se obtuvo el texto original. Nunca se publica.</li>
<li><b>No verificado</b> — no establecido. Nunca se publica de ninguna forma.</li>
</ul>
<h2>Por qué tan pocos estados</h2>
<p>Tres estados — Texas, Georgia y Nueva York — están publicados. Una investigación cuidadosa contradijo la lista más copiada de estados con leyes de “identifíquese” en cuatro de los primeros diez estados investigados. Ese es el argumento contra generar contenido estatal rápido: la versión rápida habría estado equivocada en cuatro lugares, y un conductor la habría tenido en la mano en la ventana.</p>
<h2>La comprobación diaria de fuentes</h2>
<p>Un proceso programado vuelve a descargar cada página de ley primaria detrás de una regla publicada y la compara con un hash guardado. Un cambio significa que una persona debe volver a leerla. <b>No verifica que la ley sea correcta — ningún script puede hacerlo.</b> “Fuentes comprobadas” y “revisado por una persona” son afirmaciones distintas, y este sitio las mantiene separadas a propósito.</p>
<h2>Lo que aún no se ha hecho</h2>
<div class="note"><b>Ningún abogado ha aprobado la edición actual.</b> El estándar de Amparo es que una regla también sea revisada por un abogado con licencia en ese estado, ligada a la edición específica revisada. Eso todavía no ha ocurrido — así que no aparece ninguna insignia de abogado en este sitio, y nada aquí debe leerse como revisado por un abogado. Cada regla publicada está citada del texto primario de la ley, que es un estándar real, pero distinto y más débil. Decirlo le sirve más a usted que lo contrario.</div>
<h2>¿Encontró un error?</h2>
<p>Escriba a <a href="mailto:${esc(REV.contact)}">${esc(REV.contact)}</a> con el estado y la regla. Las correcciones son el trabajo de mayor prioridad aquí.</p>`,
      footerNote: foot(lang)
    }));
    indexable.push(`${ORIGIN}/${verifySlug}/`);
    if (lang === 'en') feedEntries.push({
      title: 'How we verify — Amparo',
      url: `${ORIGIN}/${verifySlug}/`,
      desc: 'The confidence ladder behind every rule, the daily source check and its stated limit, and an explicit account of what has not been done yet.',
      date: checked
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  /* ---- Move A4: RSS ----
     Feedly, News Break and Flipboard ingest RSS, which makes this the one
     aggregator channel that needs no application form and no human review.

     Seeded from the generated pages rather than from statute changes alone.
     law-status.json watches four sources and reports needsReview: [], so a
     change feed would emit a handful of items a YEAR — technically a feed,
     practically empty, and an empty feed is worse than none because it reads
     as an abandoned site. Statute changes are a bonus item type on top of real
     content, never the substance of it.

     Deliberately NOT padded to manufacture cadence. Amparo is a reference, not
     a newsroom; if an aggregator declines it for posting too rarely, that is
     the correct outcome and the wargame's abort condition says so — inventing
     a content calendar would convert a zero-maintenance asset into a permanent
     obligation. */
  const rssItems = feedEntries.map(e => `  <item>
    <title>${esc(e.title)}</title>
    <link>${e.url}</link>
    <guid isPermaLink="true">${e.url}</guid>
    <description>${esc(e.desc)}</description>
    <pubDate>${new Date(e.date + 'T12:00:00Z').toUTCString()}</pubDate>
  </item>`).join(String.fromCharCode(10));

  files.set(path.join(ROOT, 'feed.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Amparo — what your state's traffic-stop law actually says</title>
  <link>${ORIGIN}/</link>
  <atom:link href="${ORIGIN}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Traffic-stop rights by state, each rule quoted from the statute it comes from. Free and bilingual. Not a law firm; not legal advice.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date(today + 'T12:00:00Z').toUTCString()}</lastBuildDate>
${rssItems}
</channel>
</rss>
`);

  files.set(path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    indexable.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u === ORIGIN + '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${u === ORIGIN + '/' ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n') +
    `\n</urlset>\n`);

  const thin = Object.keys(NAMES).filter(a => !STATES[a] && !AID[a]).length * 2;
  return { files, indexable, thin, verified: verified.length, aid: Object.keys(AID).length, jurisdictions: Object.keys(NAMES).length };
}

const { files, indexable, thin, verified, aid, jurisdictions } = await build();

if (CHECK) {
  let stale = 0;
  for (const [p, content] of files) {
    if (p.endsWith('sitemap.xml')) continue;   // lastmod moves daily
    let cur = null;
    try { cur = await readFile(p, 'utf8'); } catch {}
    if (cur !== content) { console.error(`stale: ${path.relative(ROOT, p)}`); stale++; }
  }
  console.log(stale ? `${stale} generated page(s) out of date — run: node tools/build-pages.mjs` : `all ${files.size - 1} generated pages current`);
  process.exit(stale ? 1 : 0);
}

for (const [p, content] of files) {
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, content, 'utf8');
}
console.log(`wrote ${files.size} files across ${jurisdictions} jurisdictions`);
console.log(`  ${verified} verified states · ${aid} states with their own legal-aid directory`);
console.log(`  ${indexable.length} indexable urls in sitemap · ${thin} pages noindexed as too thin to index`);
