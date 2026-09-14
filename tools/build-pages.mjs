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
/* The app page moved from index.html to pack.html on 2026-09-02 (the root
   rewrite to new/index.html could not fire while a physical index.html
   existed). The STATES / BASE_RULES_* literals it extracts live there now. */
const SRC = path.join(ROOT, 'pack.html');
/* Spanish state names and the per-state review flags come from the generated
   hud bank, the same source the Arena and the Panic HUD read. */
const HUD = JSON.parse(await readFile(path.join(ROOT, 'data', 'hud.json'), 'utf8'));
/* Unique cited statute sections behind the Arena + Panic HUD lines, computed from
   the data so the how-we-verify count never drifts (was hardcoded "230", real 184). */
const HUD_CITE_COUNT = (() => { const s = new Set(); (function walk(o){ if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.cite && String(o.cite).trim()) s.add(String(o.cite).trim()); Object.values(o).forEach(walk); } })(HUD); return s.size; })();
const nameEsOf = (ab, name) => HUD.states[ab]?.nameEs ?? name;
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

const page = ({ lang, title, desc, canonical, altHref, altLang, h1, intro, blocks, jsonld, footerNote, noindex, ogSlug }) => `<!doctype html>
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
<meta property="og:image" content="${ogSlug ? `${ORIGIN}/og/${ogSlug}.png` : `${ORIGIN}/og.png`}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
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
  /* The two product routes are rewrites (vercel.json), not generated pages:
     /rehearse serves the Arena, /aid the legal-help directory. */
  const indexable = [`${ORIGIN}/`, `${ORIGIN}/pack`, `${ORIGIN}/rehearse`, `${ORIGIN}/aid`, `${ORIGIN}/organizations`, `${ORIGIN}/ready-kit`];
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
      const nameEs = nameEsOf(ab, name);
      const gap = isVerified ? '' : (lang === 'en'
        ? `<div class="note"><b>${esc(name)}'s own rules are checked against the statute text, not yet reviewed by a ${esc(name)}-licensed attorney.</b> Everything below is federal law and applies everywhere. ${esc(name)}'s state-specific lines (what you must show, whether refusing to sign a ticket can get you arrested, what a firearm changes) are in the Arena, each cited to the statute: <a href="/rehearse?state=${ab}">open ${esc(name)} in the Arena</a>. Education, not legal advice.</div>`
        : `<div class="note"><b>Las reglas propias de ${esc(nameEs)} están cotejadas con el texto de la ley, aún sin revisión de un abogado con licencia en ${esc(nameEs)}.</b> Todo lo siguiente es ley federal y aplica en todas partes. Las líneas específicas de ${esc(nameEs)} (qué debe mostrar, si negarse a firmar una multa puede llevarlo al arresto, qué cambia un arma) están en la Arena, cada una con su cita: <a href="/rehearse?state=${ab}">abrir ${esc(nameEs)} en la Arena</a>. Educación, no asesoría legal.</div>`);
      /* law-status.json flags a state whose source page changed. Until
         2026-09-03 only pack.html rendered it; the state page printed the
         rule as fact under a reassuring "last checked" footer. */
      const flags = (status.needsReview || []).filter(r => r.state === ab);
      const flag = !flags.length ? '' : (lang === 'en'
        ? `<div class="note"><b>Under review:</b> the source page behind ${flags.map(r => esc(r.cite)).join(', ')} changed on ${esc(status.lastAttempt || checked)} and a person is re-reading it. Treat that rule as unconfirmed until this notice clears.</div>`
        : `<div class="note"><b>En revisión:</b> la página fuente de ${flags.map(r => esc(r.cite)).join(', ')} cambió el ${esc(status.lastAttempt || checked)} y una persona la está releyendo. Considere esa regla como no confirmada hasta que desaparezca este aviso.</div>`);

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
        /* Only indexable pages have a rendered share image — render-og.mjs skips
           the thin ones, so pointing at one here would be a 404 in every link
           preview. They fall back to the shared og.png. */
        ogSlug: noindex ? null : `${base}-${ab.toLowerCase()}`,
        altHref: `${ORIGIN}/${other}/${ab.toLowerCase()}/`, altLang: lang === 'en' ? 'es' : 'en',
        h1: lang === 'en' ? `Your rights at a traffic stop in ${name}` : `Sus derechos en una parada de tráfico en ${name}`,
        intro,
        blocks: flag + gap + rulesList(rules) + help + appLink(`${base}_${ab.toLowerCase()}`, lang === 'en' ? 'Build your free pack' : 'Cree su paquete gratis'),
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
      canonical: url, altHref: `${ORIGIN}/${other}/${os}/`, altLang: lang === 'en' ? 'es' : 'en', ogSlug: `${base}-${s}`,
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
      canonical: hubUrl, altHref: `${ORIGIN}/${other}/`, altLang: lang === 'en' ? 'es' : 'en', ogSlug: `${base}-hub`,
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
    const privacySlug = lang === 'en' ? 'privacy' : 'privacidad';
    const privacyOther = lang === 'en' ? 'privacidad' : 'privacy';
    const trustNav = lang === 'en'
      ? '<p><a href="/privacy/">What Amparo stores</a> · <a href="/how-we-verify/">How we verify</a> · <a href="/about/">About</a> · <a href="/organizations">Organizations</a> · <a href="/rehearse">Practice free</a> · <a href="/privacidad/" lang="es">Español</a></p>'
      : '<p><a href="/privacidad/">Qué guarda Amparo</a> · <a href="/como-verificamos/">Cómo verificamos</a> · <a href="/acerca/">Acerca de</a> · <a href="/organizations?lang=es">Organizaciones</a> · <a href="/rehearse?lang=es">Practicar gratis</a> · <a href="/privacy/" lang="en">English</a></p>';
    files.set(path.join(ROOT, privacySlug, 'index.html'), page({
      lang, title: lang === 'en' ? 'What Amparo stores — Privacy' : 'Qué guarda Amparo — Privacidad',
      desc: lang === 'en' ? 'Practice, voice, optional accounts, payments and technical reports: concrete privacy details.' : 'Práctica, voz, cuentas opcionales, pagos e informes técnicos: detalles concretos de privacidad.',
      canonical: `${ORIGIN}/${privacySlug}/`, altHref: `${ORIGIN}/${privacyOther}/`, altLang: lang === 'en' ? 'es' : 'en',
      h1: lang === 'en' ? 'What Amparo stores' : 'Qué guarda Amparo',
      intro: lang === 'en' ? 'No account is required to practice. Here is where information goes when you use Amparo.' : 'No necesita una cuenta para practicar. Aquí se explica dónde va la información al usar Amparo.',
      blocks: lang === 'en' ? `
<h2>Practice and device storage</h2>
<p>Practice answers, progress, scores, settings, selected state and the supervision answer are saved in this browser on this device. They are not sent to an Amparo account. Local storage means another person using this browser may be able to see saved information. The Arena’s “Wipe my data” removes its setup and practice save; the pack builder has a separate save and deletion control. Downloaded files and printed copies must be removed separately.</p>
<h2>Voice</h2>
<p>Amparo does not store voice recordings. If you enable voice input, your browser or device provider may process audio on its servers; the app asks before enabling it. You can tap or type instead. Officer audio is prerecorded and served with the site.</p>
<h2>Optional account and pack</h2>
<p>An optional account uses Clerk for sign-in and Convex for a saved pack. The account-backed pack contains text such as state, name, emergency contacts, attorney contact, ZIP and language, linked to your account. Document photos and Arena practice history are not included. Delete the cloud pack from its account screen. Deleting a local save does not delete a cloud account or cloud pack. Server records may be disclosed if legally required.</p>
<h2>Website metrics and technical reports</h2>
<p>Marketing analytics and session recording are disabled. Hosting providers necessarily receive connection information when serving pages. Technical errors may be reported automatically to Sentry. The error integration strips URL queries and form request data and does not enable session replay; this is diagnostic reporting, not a promise of zero network traffic. Sending feedback sends your message to Sentry and Amparo, with name and email only if you provide them. Do not include sensitive documents or legal details in feedback.</p>
<h2>Payments and contact</h2>
<p>Payments are not live. Product pages show previews or contact options. The configured future checkout uses Stripe; it must not be activated until the release requirements are met. If enabled, Stripe would handle card and billing information and Amparo would retain order and entitlement records. Emailing Amparo shares the information you choose to include through your email provider.</p>
<h2>Questions or deletion requests</h2>
<p>Write to <a href="mailto:hello@amparohq.com">hello@amparohq.com</a>. This summary describes the current implementation; it does not claim that clearing one browser deletes information held by a provider or copies you have shared.</p>` : `
<h2>Práctica y almacenamiento en el dispositivo</h2>
<p>Las respuestas, el progreso, las puntuaciones, los ajustes, el estado elegido y la respuesta sobre supervisión se guardan en este navegador y dispositivo. No se envían a una cuenta de Amparo. Otra persona que use este navegador podría ver la información guardada. “Borrar mis datos” en la Arena elimina su configuración y práctica; el creador del paquete tiene su propio guardado y control de borrado. Los archivos descargados y las copias impresas deben eliminarse por separado.</p>
<h2>Voz</h2>
<p>Amparo no guarda grabaciones de voz. Si activa la entrada de voz, el proveedor del navegador o dispositivo puede procesar audio en sus servidores; la aplicación pregunta antes de activarla. Puede tocar o escribir en su lugar. El audio del oficial está pregrabado y se sirve con el sitio.</p>
<h2>Cuenta y paquete opcionales</h2>
<p>Una cuenta opcional usa Clerk para iniciar sesión y Convex para guardar el paquete. El paquete de la cuenta contiene texto como estado, nombre, contactos de emergencia, contacto del abogado, código postal e idioma, vinculado a su cuenta. No incluye fotos de documentos ni historial de práctica de la Arena. Elimine el paquete en la nube desde la pantalla de la cuenta. Borrar datos locales no elimina la cuenta ni el paquete en la nube. Los registros del servidor pueden divulgarse por obligación legal.</p>
<h2>Métricas del sitio e informes técnicos</h2>
<p>Los análisis de marketing y las grabaciones de sesión están desactivados. Los proveedores de alojamiento reciben necesariamente información de conexión al servir páginas. Los errores técnicos pueden enviarse automáticamente a Sentry. La integración elimina parámetros de URL y datos de formularios de las solicitudes y no activa grabaciones de sesión; son diagnósticos, no una promesa de cero tráfico de red. Enviar comentarios envía su mensaje a Sentry y Amparo, con nombre y correo solo si los proporciona. No incluya documentos sensibles ni detalles legales en los comentarios.</p>
<h2>Pagos y contacto</h2>
<p>Los pagos no están activos. Las páginas de productos muestran vistas previas u opciones de contacto. El futuro pago configurado usa Stripe y no debe activarse hasta cumplir los requisitos de lanzamiento. Si se activa, Stripe gestionaría los datos de tarjeta y facturación y Amparo guardaría registros de pedidos y acceso a productos. Enviar un correo a Amparo comparte la información que decida incluir mediante su proveedor de correo.</p>
<h2>Preguntas o solicitudes de borrado</h2>
<p>Escriba a <a href="mailto:hello@amparohq.com">hello@amparohq.com</a>. Este resumen describe la implementación actual; borrar un navegador no elimina información conservada por un proveedor ni copias que haya compartido.</p>`,
      footerNote: foot(lang) + trustNav
    }));
    indexable.push(`${ORIGIN}/${privacySlug}/`);
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
      canonical: `${ORIGIN}/${aboutSlug}/`, altHref: `${ORIGIN}/${otherAbout}/`, altLang: lang === 'en' ? 'es' : 'en', ogSlug: aboutSlug,
      h1: lang === 'en' ? 'About Amparo' : 'Acerca de Amparo',
      intro: lang === 'en'
        ? 'Amparo is a free practice tool in English and Spanish. Rehearse what to say in police encounters, then print basic preparedness materials to keep within reach.'
        : 'Amparo es una herramienta gratuita de práctica en inglés y español. Ensaye qué decir en encuentros policiales y después imprima materiales básicos de preparación para tenerlos a mano.',
      blocks: lang === 'en' ? `
<h2>Why it exists</h2>
<p><em>Amparo</em> is the Spanish word for shelter, and in law, for a constitutional protection. Practicing the words can make them more familiar under pressure. Practice does not guarantee safety or a legal outcome. Reading rights resources and contacting qualified legal help remain important; Amparo adds rehearsal, not a replacement for either. Core practice and basic printing are free.</p>
<h2>Who makes it</h2>
<p>${esc(REV.founder)}, ${esc(REV.role)} and product builder. The legal information comes from cited sources; the founder’s role is not a claim of legal qualification. Professional review status is stated separately below. Write to <a href="mailto:${esc(REV.contact)}">${esc(REV.contact)}</a>.</p>
<h2>What Amparo claims — and what it does not</h2>
<ul>
<li><b>It claims:</b> the Texas, Georgia and New York pack editions quote primary statutes. The Arena also has provisional, cited state summaries; summaries and source quotations are identified separately in the verification process.</li>
<li><b>It does not claim</b> to be a law firm, to give legal advice, or to be attorney-reviewed. <a href="/${verifySlug}/">How we verify</a> states exactly where that line sits today.</li>
<li><b>It does not claim</b> attorney-reviewed coverage in any state. Federal practice is available nationally. Texas, Georgia and New York have source-verified pack editions; other public state pages show federal information and identify limits. Source verification is not attorney review.</li>
</ul>
<h2>What it costs</h2>
<p>Nothing to read, practice or print basic materials. The optional $9.99 Master Script is a convenience format, not access to extra rights. The $19.99 physical card is a pre-launch proposal, not available to order. Legal review, fulfillment, pricing and payment approval remain required. See the <a href="/ready-kit">physical product preview</a> and <a href="/organizations">organization options</a>.</p>` : `
<h2>Por qué existe</h2>
<p><em>Amparo</em> significa refugio, y en derecho, una protección constitucional. Practicar las palabras puede ayudar a familiarizarse con ellas bajo presión. La práctica no garantiza seguridad ni un resultado legal. Leer recursos sobre derechos y contactar ayuda legal cualificada sigue siendo importante; Amparo añade ensayo, sin sustituir ninguno de los dos. La práctica básica y la impresión básica son gratuitas.</p>
<h2>Quién lo hace</h2>
<p>${esc(REV.founder)}, fundador y creador del producto. La información legal procede de fuentes citadas; ser el fundador no implica una cualificación jurídica. El estado de revisión profesional se indica por separado. Escriba a <a href="mailto:${esc(REV.contact)}">${esc(REV.contact)}</a>.</p>
<h2>Lo que Amparo afirma — y lo que no</h2>
<ul>
<li><b>Afirma:</b> las ediciones del paquete de Texas, Georgia y Nueva York citan textos legales primarios. La Arena también incluye resúmenes estatales provisionales con citas; el proceso de verificación distingue los resúmenes de las citas textuales.</li>
<li><b>No afirma</b> ser un bufete, dar asesoría legal, ni estar revisado por un abogado. <a href="/${verifySlug}/">Cómo verificamos</a> explica exactamente dónde está esa línea hoy.</li>
<li><b>No afirma</b> cobertura revisada por abogados en ningún estado. La práctica federal está disponible a nivel nacional. Texas, Georgia y Nueva York tienen ediciones del paquete verificadas contra fuentes; las demás páginas estatales muestran información federal e indican los límites. Verificar fuentes no equivale a revisión de abogado.</li>
</ul>
<h2>Cuánto cuesta</h2>
<p>Leer, practicar e imprimir materiales básicos no cuesta nada. El Guion Maestro opcional de $9.99 es un formato cómodo, no acceso a más derechos. La tarjeta física de $19.99 es una propuesta de prelanzamiento y no se puede pedir. Aún se necesitan revisión legal, preparación de envíos y aprobación de precios y pagos. Vea la <a href="/ready-kit?lang=es">vista previa del producto físico</a> y las <a href="/organizations?lang=es">opciones para organizaciones</a>.</p>`,
      footerNote: foot(lang) + trustNav
    }));
    indexable.push(`${ORIGIN}/${aboutSlug}/`);

    files.set(path.join(ROOT, verifySlug, 'index.html'), page({
      lang,
      title: lang === 'en' ? 'How we verify — Amparo' : 'Cómo verificamos — Amparo',
      desc: lang === 'en'
        ? 'Amparo’s verification standard, the confidence levels behind every rule, the daily source check, and an honest statement of what has not been done yet.'
        : 'El estándar de verificación de Amparo, los niveles de confianza detrás de cada regla, la comprobación diaria de fuentes, y una declaración honesta de lo que aún no se ha hecho.',
      canonical: `${ORIGIN}/${verifySlug}/`, altHref: `${ORIGIN}/${otherVerify}/`, altLang: lang === 'en' ? 'es' : 'en', ogSlug: verifySlug,
      h1: lang === 'en' ? 'How we verify' : 'Cómo verificamos',
      intro: lang === 'en'
        ? 'Amparo publishes rules people rely on in a moment they cannot pause. This page states exactly how a rule gets published — and what has not been done yet.'
        : 'Amparo publica reglas en las que la gente confía en un momento que no puede pausar. Esta página explica exactamente cómo se publica una regla — y qué aún no se ha hecho.',
      blocks: lang === 'en' ? `
<h2>Four source-confidence levels</h2>
<ul>
<li><b>Verified</b> — quoted from an official legislature site or primary statute text. The three verified states' rules on these pages are this level.</li>
<li><b>Checked</b> — the statute text was read and cited, then paraphrased into one plain sentence for the Arena's state panel and the Panic HUD, for all 51 jurisdictions. Every such line carries its citation and the provisional notice, and no sentence is printed as state-specific without a citation behind it. Not attorney-reviewed.</li>
<li><b>Likely</b> — the section number is corroborated by multiple independent secondary sources, but the raw statute text has not been fetched. Never published as a rule; the one Arena line that rests on such a reading carries a visible “reported, not verified” flag.</li>
<li><b>Unverified</b> — not established. Never published in any form.</li>
</ul>
<h2>Why so few states</h2>
<p>Three source-verified pack editions — Texas, Georgia and New York — are published. Careful sourcing contradicted the widely-copied list of “stop and identify” states on four of the first ten states researched. That is the argument against generating state content quickly: the fast version would have been wrong in four places, and a driver would have been holding it at the window.</p>
<h2>The daily source check</h2>
<p>A scheduled job re-fetches the four primary statute pages behind the pack’s cited rules and compares them to a stored hash. The ${HUD_CITE_COUNT} sections cited on the Arena and Panic HUD lines are not yet on that watch list; putting them there needs a source URL per section, which the research matrix does not carry today. A change means a person has to re-read it. <b>It does not verify that the law is correct — no script can.</b> “Sources checked” and “reviewed by a person” are different claims, and this site keeps them separate on purpose.</p>
<h2>What has not been done yet</h2>
<div class="note"><b>No attorney has signed off on the current edition.</b> Amparo’s own standard is that a rule should also be reviewed by an attorney licensed in that state, tied to the specific edition reviewed. That has not happened yet — so no attorney badge appears anywhere on this site, and nothing here should be read as attorney-reviewed. Source quotations and provisional summaries follow the source standards above; neither constitutes professional legal review. Saying so is more useful to you than the alternative.</div>
<h2>Future professional review records</h2>
<p>A completed review must identify the reviewer, professional role, licensed jurisdiction, review date, and edition. No completed record is displayed because no attorney sign-off is recorded for this edition.</p>
<h2>Found something wrong?</h2>
<p>Write to <a href="mailto:${esc(REV.contact)}">${esc(REV.contact)}</a> with the state and the rule. Corrections are the highest-priority work here.</p>` : `
<h2>Cuatro niveles de confianza en las fuentes</h2>
<ul>
<li><b>Verificado</b> — citado de un sitio oficial de la legislatura o del texto primario de la ley. Las reglas de los tres estados verificados en estas páginas son de este nivel.</li>
<li><b>Cotejado</b> — se leyó y citó el texto de la ley y se resumió en una sola frase para el panel de estado de la Arena y el Panic HUD, en las 51 jurisdicciones. Cada línea lleva su cita y el aviso provisional, y ninguna frase se publica como específica de un estado sin una cita detrás. Sin revisión de abogado.</li>
<li><b>Probable</b> — el número de sección está corroborado por varias fuentes secundarias independientes, pero no se obtuvo el texto original. Nunca se publica como regla; la única línea de la Arena que descansa en una lectura así lleva la marca visible «reportado, no verificado».</li>
<li><b>No verificado</b> — no establecido. Nunca se publica de ninguna forma.</li>
</ul>
<h2>Por qué tan pocos estados</h2>
<p>Se publican tres ediciones del paquete verificadas contra fuentes: Texas, Georgia y Nueva York. Una investigación cuidadosa contradijo la lista más copiada de estados con leyes de “identifíquese” en cuatro de los primeros diez estados investigados. Ese es el argumento contra generar contenido estatal rápido: la versión rápida habría estado equivocada en cuatro lugares, y un conductor la habría tenido en la mano en la ventana.</p>
<h2>La comprobación diaria de fuentes</h2>
<p>Un proceso programado vuelve a descargar las cuatro páginas de ley primaria detrás de las reglas citadas del paquete y las compara con un hash guardado. Las ${HUD_CITE_COUNT} secciones citadas en las líneas de la Arena y del Panic HUD aún no están en esa lista de vigilancia; incluirlas requiere una URL de fuente por sección, que la matriz de investigación hoy no tiene. Un cambio significa que una persona debe volver a leerla. <b>No verifica que la ley sea correcta — ningún script puede hacerlo.</b> “Fuentes comprobadas” y “revisado por una persona” son afirmaciones distintas, y este sitio las mantiene separadas a propósito.</p>
<h2>Lo que aún no se ha hecho</h2>
<div class="note"><b>Ningún abogado ha aprobado la edición actual.</b> El estándar de Amparo es que una regla también sea revisada por un abogado con licencia en ese estado, ligada a la edición específica revisada. Eso todavía no ha ocurrido — así que no aparece ninguna insignia de abogado en este sitio, y nada aquí debe leerse como revisado por un abogado. Las citas textuales y los resúmenes provisionales siguen los estándares de fuentes anteriores; ninguno equivale a revisión jurídica profesional. Decirlo le sirve más a usted que lo contrario.</div>
<h2>Futuros registros de revisión profesional</h2>
<p>Una revisión completada debe identificar al revisor, su función profesional, la jurisdicción de su licencia, la fecha y la edición. No se muestra un registro completado porque esta edición no tiene una aprobación de abogado registrada.</p>
<h2>¿Encontró un error?</h2>
<p>Escriba a <a href="mailto:${esc(REV.contact)}">${esc(REV.contact)}</a> con el estado y la regla. Las correcciones son el trabajo de mayor prioridad aquí.</p>`,
      footerNote: foot(lang) + trustNav
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

  /* Hand-written pages (not generated above) that should still be in the sitemap.
     Kept here so the daily cron regen does not silently drop them. Only tracked,
     deployed pages belong here — privacy/ + privacidad/ are added when they ship. */
  indexable.push(`${ORIGIN}/organizations/`, `${ORIGIN}/organizaciones/`);

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
    // line-ending agnostic: git on Windows may hand the file back with CRLF, which is not staleness
    if (cur === null || cur.replace(/\r\n/g, '\n') !== content) { console.error(`stale: ${path.relative(ROOT, p)}`); stale++; }
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
