#!/usr/bin/env node
/**
 * Generates Amparo's crawlable publishing surface from the data already
 * shipped in root index.html, and rewrites sitemap.xml to match.
 *
 * WHY THIS EXISTS: robots.txt has always said "the rights content here is the
 * only crawlable know-your-rights material in this category (every competitor
 * is a native app). Crawling it is the point." sitemap.xml listed exactly one
 * URL. The whole product was one page, so there was nothing for a search
 * engine or a language model to cite for "know your rights traffic stop
 * <state>" — the highest-intent free query we could possibly rank for. This
 * closes that gap without writing a single new sentence of legal content.
 *
 * WHAT IT DOES NOT DO: author anything. Every rule on every generated page is
 * lifted verbatim from STATES / BASE_RULES_* in index.html — the same text
 * that already ships to users today. Publishing it at a crawlable URL changes
 * the surface, never the claim. If a rule is wrong here it is already wrong in
 * the product, which is the only acceptable coupling.
 *
 * THE HONESTY CONSTRAINT: REVIEW.attorneys is currently {name:"",bar:"",
 * date:"",edition:""} for all three states, so isReviewed() is false
 * everywhere and the app hides its own attorney badge. These pages therefore
 * must NOT claim attorney review. They claim what is true and checkable:
 * which edition the text belongs to, and when the cited statute SOURCES were
 * last machine-checked (law-status.json). Those are different claims than
 * "a lawyer signed this" and v2.26.1 exists because that distinction got
 * blurred once already.
 *
 * Only TX/GA/NY get state pages. research/state-law-matrix.md is explicit that
 * nothing enters STATES without primary-statute verification, so STATES is the
 * allowlist — if a state is not in it, it does not get a page. That is what
 * keeps this from becoming a programmatic-SEO doorway farm.
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
  const startRe = new RegExp(`^const ${name}\\s*=\\s*\\${open}`, 'm');
  const m = startRe.exec(src);
  if (!m) throw new Error(`extractLiteral: could not find "const ${name} = ${open}" in index.html`);
  const bodyStart = m.index + m[0].length - 1;
  const endIdx = src.indexOf(`\n${close};`, bodyStart);
  if (endIdx === -1) throw new Error(`extractLiteral: no column-0 "${close};" terminator after ${name}`);
  const literal = src.slice(bodyStart, endIdx + 1 + close.length);
  try {
    return new Function(`return (${literal})`)();
  } catch (e) {
    throw new Error(`extractLiteral: ${name} did not evaluate as a literal — ${e.message}`);
  }
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* Rule strings carry inline markup (<br>, <b>, <i class="stq"> around the
   quoted statute). Keep it in the rendered page — the statute quote is the
   single most citable thing here — but strip it for JSON-LD, where the spec
   wants text. */
const stripTags = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const page = ({ lang, title, desc, canonical, altHref, altLang, h1, intro, blocks, jsonld, footerNote }) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${altHref ? `<link rel="alternate" hreflang="${altLang}" href="${altHref}">\n<link rel="alternate" hreflang="${lang}" href="${canonical}">` : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="og:image" content="${ORIGIN}/og.png">
<style>
:root{--ink:#1a1a1a;--bg:#FAF6EE;--line:#e2d9c6;--quote:#5a5348;--accent:#7a1f1f}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.65 Georgia,'Times New Roman',serif;padding:0 20px}
main{max-width:44rem;margin:0 auto;padding:48px 0 72px}
h1{font-size:clamp(1.7rem,1.2rem+2vw,2.4rem);line-height:1.2;margin:0 0 .5em}
h2{font-size:1.15rem;margin:2.2em 0 .6em;font-family:system-ui,sans-serif}
.intro{font-size:1.05rem;color:#3d372e}
ol{padding-left:1.1em}
li{margin:0 0 1.3em}
.stq{display:block;margin-top:.5em;padding-left:.9em;border-left:3px solid var(--line);color:var(--quote);font-size:.94em}
.cta{display:inline-block;margin:1.4em 0;padding:.85em 1.4em;background:var(--accent);color:#fff;text-decoration:none;border-radius:8px;font-family:system-ui,sans-serif;font-size:1rem}
footer{margin-top:3em;padding-top:1.4em;border-top:1px solid var(--line);font-size:.85rem;color:var(--quote);font-family:system-ui,sans-serif}
a{color:var(--accent)}
nav a{margin-right:1em}
@media(prefers-color-scheme:dark){:root{--ink:#ece6da;--bg:#17150f;--line:#3a3428;--quote:#a89f8d;--accent:#e0a3a3}}
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

const appLink = (slug, label) =>
  `<a class="cta" href="/?utm_source=organic&amp;utm_medium=page&amp;utm_content=${slug}">${esc(label)}</a>`;

async function build() {
  const src = await readFile(SRC, 'utf8');
  const STATES = extractLiteral(src, 'STATES', '{', '}');
  const BASE_EN = extractLiteral(src, 'BASE_RULES_EN', '[', ']');
  const BASE_ES = extractLiteral(src, 'BASE_RULES_ES', '[', ']');
  const EDITION = (/const EDITION\s*=\s*"([^"]+)"/.exec(src) || [, 'unknown'])[1];

  const keys = Object.keys(STATES);
  /* Fail loudly rather than silently shipping a smaller site. If the extractor
     ever half-parses, an empty or short STATES would quietly delete pages from
     the sitemap and nobody would notice until rankings moved. */
  if (keys.length < 3) throw new Error(`STATES parsed to ${keys.length} entries (${keys}); expected the three verified states`);
  for (const k of keys) {
    if (!STATES[k].rules_en?.length || !STATES[k].rules_es?.length) throw new Error(`${k} missing rules_en/rules_es`);
  }

  let status = {};
  try { status = JSON.parse(await readFile(path.join(ROOT, 'law-status.json'), 'utf8')); } catch {}
  const checked = status.lastChecked || 'unknown';

  const files = new Map();
  const urls = [`${ORIGIN}/`];

  const foot = (lang) => lang === 'es'
    ? `Edición ${esc(EDITION)}. Fuentes legales citadas verificadas por última vez el ${esc(checked)} — esa comprobación detecta cambios en la página de la ley, no confirma que la regla sea correcta. Amparo no es un bufete y esto no es asesoría legal. <a href="/derechos/">Todos los estados</a> · <a href="/">Amparo</a>`
    : `Edition ${esc(EDITION)}. Cited legal sources last checked ${esc(checked)} — that check detects when a statute page changes, it does not confirm the rule is correct. Amparo is not a law firm and this is not legal advice. <a href="/rights/">All states</a> · <a href="/">Amparo</a>`;

  const faq = (items, lang, name) => ({
    '@context': 'https://schema.org', '@type': 'FAQPage', name,
    inLanguage: lang,
    mainEntity: items.map((t, i) => ({
      '@type': 'Question',
      name: `${lang === 'es' ? 'Regla' : 'Rule'} ${i + 1}`,
      acceptedAnswer: { '@type': 'Answer', text: stripTags(t) }
    }))
  });

  const rulesList = rules => `<ol>${rules.map(r => `<li>${r}</li>`).join('')}</ol>`;

  for (const k of keys) {
    const st = STATES[k], ab = k.toLowerCase();
    for (const lang of ['en', 'es']) {
      const base = lang === 'en' ? 'rights' : 'derechos';
      const other = lang === 'en' ? 'derechos' : 'rights';
      const url = `${ORIGIN}/${base}/${ab}/`;
      const rules = lang === 'en' ? st.rules_en : st.rules_es;
      const title = lang === 'en'
        ? `Your rights at a traffic stop in ${st.name} — Amparo`
        : `Sus derechos en una parada de tráfico en ${st.name} — Amparo`;
      const desc = lang === 'en'
        ? `What ${st.name} law requires at a traffic stop, each rule quoted from the statute it comes from. Free, bilingual, printable.`
        : `Lo que la ley de ${st.name} exige en una parada de tráfico, cada regla citada de la ley de la que proviene. Gratis, bilingüe, imprimible.`;
      files.set(path.join(ROOT, base, ab, 'index.html'), page({
        lang, title, desc, canonical: url,
        altHref: `${ORIGIN}/${other}/${ab}/`, altLang: lang === 'en' ? 'es' : 'en',
        h1: lang === 'en' ? `Your rights at a traffic stop in ${st.name}` : `Sus derechos en una parada de tráfico en ${st.name}`,
        intro: lang === 'en'
          ? `Every rule below is quoted from the ${st.name} statute it comes from, so you can check it yourself. This is the same text Amparo prints onto a card for your glovebox.`
          : `Cada regla aquí está citada de la ley de ${st.name} de la que proviene, para que usted mismo pueda verificarla. Este es el mismo texto que Amparo imprime en una tarjeta para su guantera.`,
        blocks: rulesList(rules) + appLink(`${base}_${ab}`, lang === 'en' ? 'Build your free pack' : 'Cree su paquete gratis'),
        jsonld: faq(rules, lang, title), footerNote: foot(lang)
      }));
      urls.push(url);
    }
  }

  for (const lang of ['en', 'es']) {
    const base = lang === 'en' ? 'rights' : 'derechos';
    const other = lang === 'en' ? 'derechos' : 'rights';
    const slug = lang === 'en' ? 'any-state' : 'cualquier-estado';
    const otherSlug = lang === 'en' ? 'cualquier-estado' : 'any-state';
    const url = `${ORIGIN}/${base}/${slug}/`;
    const rules = lang === 'en' ? BASE_EN : BASE_ES;
    const title = lang === 'en'
      ? 'Your rights at a traffic stop in any US state — Amparo'
      : 'Sus derechos en una parada de tráfico en cualquier estado — Amparo';
    files.set(path.join(ROOT, base, slug, 'index.html'), page({
      lang, title,
      desc: lang === 'en'
        ? 'The federal floor: rules from the US Constitution and the Supreme Court that bind every state, each with the case it comes from.'
        : 'El piso federal: reglas de la Constitución de EE. UU. y la Corte Suprema que aplican en todos los estados, cada una con el caso del que proviene.',
      canonical: url, altHref: `${ORIGIN}/${other}/${otherSlug}/`, altLang: lang === 'en' ? 'es' : 'en',
      h1: lang === 'en' ? 'Your rights at a traffic stop in any US state' : 'Sus derechos en una parada de tráfico en cualquier estado',
      intro: lang === 'en'
        ? 'These come from the US Constitution and the Supreme Court, so they hold in all fifty states. What changes state by state is listed separately — and Amparo only publishes a state once its rules are checked against that state’s own statutes.'
        : 'Estas provienen de la Constitución de EE. UU. y la Corte Suprema, así que aplican en los cincuenta estados. Lo que cambia según el estado se indica aparte — y Amparo solo publica un estado cuando sus reglas se verifican contra las leyes de ese estado.',
      blocks: rulesList(rules) + appLink(`${base}_${slug}`, lang === 'en' ? 'Build your free pack' : 'Cree su paquete gratis'),
      jsonld: faq(rules, lang, title), footerNote: foot(lang)
    }));
    urls.push(url);

    const hubUrl = `${ORIGIN}/${base}/`;
    const links = keys.map(k => `<li><a href="/${base}/${k.toLowerCase()}/">${esc(STATES[k].name)}</a></li>`).join('') +
      `<li><a href="/${base}/${slug}/">${lang === 'en' ? 'Any other state (federal rules)' : 'Cualquier otro estado (reglas federales)'}</a></li>`;
    files.set(path.join(ROOT, base, 'index.html'), page({
      lang,
      title: lang === 'en' ? 'Know your rights at a traffic stop, by state — Amparo' : 'Conozca sus derechos en una parada de tráfico, por estado — Amparo',
      desc: lang === 'en'
        ? 'Traffic-stop rights by state, each rule quoted from the statute it comes from. Free and bilingual.'
        : 'Derechos en paradas de tráfico por estado, cada regla citada de la ley de la que proviene. Gratis y bilingüe.',
      canonical: hubUrl, altHref: `${ORIGIN}/${other}/`, altLang: lang === 'en' ? 'es' : 'en',
      h1: lang === 'en' ? 'Know your rights at a traffic stop' : 'Conozca sus derechos en una parada de tráfico',
      intro: lang === 'en'
        ? `Pick your state. Amparo publishes a state only after its rules are checked against that state’s own statutes, so this list is short on purpose — ${keys.length} states so far, plus the federal rules that apply everywhere.`
        : `Elija su estado. Amparo publica un estado solo después de verificar sus reglas contra las leyes de ese estado, así que esta lista es corta a propósito — ${keys.length} estados hasta ahora, más las reglas federales que aplican en todas partes.`,
      blocks: `<ul>${links}</ul>` + appLink(`${base}_hub`, lang === 'en' ? 'Build your free pack' : 'Cree su paquete gratis'),
      footerNote: foot(lang)
    }));
    urls.push(hubUrl);
  }

  const today = new Date().toISOString().slice(0, 10);
  files.set(path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u === ORIGIN + '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${u === ORIGIN + '/' ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n') +
    `\n</urlset>\n`);

  return { files, urls };
}

const { files, urls } = await build();

if (CHECK) {
  let stale = 0;
  for (const [p, content] of files) {
    let cur = null;
    try { cur = await readFile(p, 'utf8'); } catch {}
    /* sitemap carries a lastmod that moves daily; comparing it would make
       --check fail every day for no reason. Compare everything else. */
    if (p.endsWith('sitemap.xml')) continue;
    if (cur !== content) { console.error(`stale: ${path.relative(ROOT, p)}`); stale++; }
  }
  console.log(stale ? `${stale} generated page(s) out of date — run: node tools/build-pages.mjs` : `all ${files.size - 1} generated pages current`);
  process.exit(stale ? 1 : 0);
}

for (const [p, content] of files) {
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, content, 'utf8');
}
console.log(`wrote ${files.size} files, ${urls.length} sitemap urls`);
