#!/usr/bin/env node
/**
 * The forwardable know-your-rights card — Track E of wargame 32.
 *
 * WHY THIS SHAPE: ILRC's Red Card has moved 10 million units since November
 * 2024. United We Dream's app, with hundreds of millions of PR impressions,
 * did ~8,500 first-week installs and was discontinued. The unit that travels
 * in this audience is a card someone forwards or hands over, not a link
 * someone must click — 54% of US Latino adults are on WhatsApp, and a
 * forwarded image asks nothing of the recipient. The web tool is the
 * generator; the card is the payload.
 *
 * TWO OUTPUTS:
 *   1. WhatsApp card — 1080x1080 PNG per language. Square survives every chat
 *      client's crop, and the type is sized to stay legible after WhatsApp
 *      re-compresses it, which it always does.
 *   2. Print PDF — US Letter, ten 3.5x2in cards per page in the standard
 *      Avery 5371 business-card grid. Page 1 is English fronts, page 2 is
 *      Spanish backs with MIRRORED columns, so duplex printing with a
 *      long-edge flip lines each back up with its front. Matching ILRC's
 *      physical format is deliberate distribution compatibility: anyone
 *      already printing Red Cards can print these on the same stock in the
 *      same run.
 *
 * EVERY QUOTED LINE IS LIFTED VERBATIM from the drills in arena/index.html,
 * and the selftest enforces that byte-for-byte: if a line on this card is not
 * a substring of the arena source, the build fails. The section labels and
 * the footer are product copy — they describe the card, and assert nothing
 * about the law. The one legal citation shown (Berghuis/Salinas, for
 * silence-must-be-claimed) is carried inside a BASE_RULES entry the site
 * already publishes.
 *
 * Usage:
 *   node tools/render-kyr-card.mjs             build cards/ + PDF
 *   node tools/render-kyr-card.mjs --selftest  verify lines + geometry, no render
 */
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUT = path.join(ROOT, 'cards');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'
];

/* ---- the lines. Verbatim from arena SCEN; the selftest proves it. ----
   The 🤚/🛡 glyphs that follow some lines in the drills are drill UI, not part
   of the sentence, so the card carries the sentence alone — and the selftest
   checks the sentence, which is still a byte-exact substring either way. */
export const LINES = [
  {
    id: 'docs',
    label: { en: 'HANDING OVER DOCUMENTS', es: 'AL ENTREGAR DOCUMENTOS' },
    en: '\u201cMy documents are in the glovebox \u2014 reaching for them now.\u201d',
    es: '\u00abMis documentos est\u00e1n en la guantera \u2014 voy a alcanzarlos.\u00bb'
  },
  {
    id: 'guess',
    label: { en: 'IF ASKED \u201cDO YOU KNOW WHY\u2026\u201d', es: 'SI PREGUNTAN \u00abSABE POR QU\u00c9\u2026\u00bb' },
    en: '\u201cI\u2019d rather not guess, officer.\u201d',
    es: '\u00abPrefiero no adivinar, oficial.\u00bb'
  },
  {
    id: 'silence',
    label: { en: 'TO STAY SILENT \u2014 SAY IT', es: 'PARA GUARDAR SILENCIO \u2014 D\u00cdGALO' },
    en: '\u201cI choose to remain silent.\u201d',
    es: '\u00abElijo guardar silencio.\u00bb'
  },
  {
    id: 'search',
    label: { en: 'IF ASKED TO SEARCH', es: 'SI PIDEN REGISTRAR' },
    en: '\u201cI do not consent to a search.\u201d',
    es: '\u00abNo doy consentimiento a un registro.\u00bb'
  },
  {
    id: 'free',
    label: { en: 'WHEN IT SEEMS OVER', es: 'CUANDO PAREZCA TERMINAR' },
    en: '\u201cAm I free to go?\u201d',
    es: '\u00ab\u00bfSoy libre de irme?\u00bb'
  }
];

const FOOT = {
  en: 'Free bilingual practice drills \u00b7 amparohq.com \u00b7 Not legal advice',
  es: 'Ejercicios de pr\u00e1ctica gratis \u00b7 amparohq.com \u00b7 No es asesor\u00eda legal'
};
const TITLE = {
  en: 'What to say at a traffic stop',
  es: 'Qu\u00e9 decir en una parada de tr\u00e1fico'
};
const CITE = 'Berghuis v. Thompkins, 560 U.S. 370 \u00b7 Salinas v. Texas, 570 U.S. 178';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- WhatsApp square, 1080x1080 ---------- */
/* Long lines wrap rather than shrink: a say-line that has to be squinted at
   defeats the card, and the first live render proved shrinking alone clips —
   the Spanish documents line ran off the right edge. Georgia bold at 40px
   fits roughly 46 characters across the printable width; wrap there and keep
   every line the same size. */
function wrapLine(text, max = 46) {
  const words = String(text).split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length > max && cur) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function buildWhatsAppSvg(lang) {
  const W = 1080, H = 1080;
  let y = 268;
  const rows = LINES.map(l => {
    const wrapped = wrapLine(l[lang]);
    const block = `
  <text x="84" y="${y}" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#8a7a52" letter-spacing="2">${esc(l.label[lang])}</text>
${wrapped.map((ln, j) => `  <text x="84" y="${y + 46 + j * 46}" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="bold" fill="#1B2A4A">${esc(ln)}</text>`).join('\n')}`;
    y += 100 + wrapped.length * 46;
    return block;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FAF6EE"/><stop offset="100%" stop-color="#F1EADA"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="0" y="0" width="${W}" height="16" fill="#1B2A4A"/>
  <rect x="0" y="${H - 16}" width="${W}" height="16" fill="#1B2A4A"/>

  <g transform="translate(84,64) scale(0.5)">
    <g transform="rotate(-90 60 72)"><circle cx="60" cy="72" r="27" fill="none" stroke="#E8B84B" stroke-width="10"/></g>
    <path d="M46 49 h17 l10 10 v26 a3 3 0 0 1 -3 3 h-24 a3 3 0 0 1 -3 -3 v-33 a3 3 0 0 1 3 -3 z" fill="#1B2A4A"/>
    <path d="M14 61 L60 19 L106 61" fill="none" stroke="#1B2A4A" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="27" y="25" width="9.5" height="20" rx="1.5" fill="#1B2A4A"/>
  </g>
  <text x="190" y="108" font-family="system-ui, sans-serif" font-size="26" font-weight="600" fill="#1B2A4A" letter-spacing="1.4">AMPARO</text>

  <text x="84" y="196" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#1B2A4A">${esc(TITLE[lang])}</text>
  <rect x="86" y="216" width="140" height="8" rx="4" fill="#E8B84B"/>
  ${rows}
  <text x="84" y="${H - 92}" font-family="system-ui, sans-serif" font-size="21" fill="#6b7a94">${esc(CITE)}</text>
  <text x="84" y="${H - 52}" font-family="system-ui, sans-serif" font-size="27" font-weight="600" fill="#1B2A4A">${esc(FOOT[lang])}</text>
</svg>`;
}

/* ---------- print PDF: Avery 5371, ten 3.5x2in cards on US Letter ----------
   Letter is 8.5x11in. The 5371 grid: two columns of 3.5in starting at a
   0.75in left margin, five rows of 2in starting at a 0.5in top margin.
   No gutters — cards share cut lines, exactly like the stock. */
function cardHtml(lang, mirror) {
  const cells = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 2; c++) {
      const col = mirror ? 1 - c : c;
      const left = 0.75 + col * 3.5;
      const top = 0.5 + r * 2;
      cells.push(`
  <div class="card" style="left:${left}in;top:${top}in">
    <div class="head"><span class="mark">
      <svg width="15" height="15" viewBox="0 0 120 120"><g transform="rotate(-90 60 72)"><circle cx="60" cy="72" r="27" fill="none" stroke="#E8B84B" stroke-width="10"/></g><path d="M46 49 h17 l10 10 v26 a3 3 0 0 1 -3 3 h-24 a3 3 0 0 1 -3 -3 v-33 a3 3 0 0 1 3 -3 z" fill="#1B2A4A"/><path d="M14 61 L60 19 L106 61" fill="none" stroke="#1B2A4A" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span><span class="t">${esc(TITLE[lang])}</span></div>
    ${LINES.map(l => `<div class="row"><span class="lb">${esc(l.label[lang])}</span><span class="say">${esc(l[lang])}</span></div>`).join('')}
    <div class="foot">${esc(FOOT[lang])}</div>
  </div>`);
    }
  }
  return cells.join('\n');
}

export function buildPrintHtml() {
  return `<!doctype html><meta charset="utf-8"><title>Amparo wallet card \u2014 Avery 5371</title>
<style>
@page{size:letter;margin:0}
body{margin:0;font-family:system-ui,sans-serif}
.page{position:relative;width:8.5in;height:11in;page-break-after:always;overflow:hidden}
.card{position:absolute;width:3.5in;height:2in;box-sizing:border-box;padding:0.09in 0.13in;
  border:0.5px dashed #b9ae94;display:flex;flex-direction:column;background:#FAF6EE}
.head{display:flex;align-items:center;gap:4px;margin-bottom:1px}
.head .t{font-family:Georgia,serif;font-weight:bold;font-size:8.2pt;color:#1B2A4A}
.row{display:flex;flex-direction:column;margin-top:1.5px}
.lb{font-size:4.6pt;font-weight:600;letter-spacing:0.4px;color:#8a7a52}
.say{font-family:Georgia,serif;font-size:7.4pt;font-weight:bold;color:#1B2A4A;line-height:1.16}
.foot{margin-top:auto;font-size:4.8pt;color:#6b7a94}
.note{position:absolute;left:0.75in;right:0.75in;bottom:0.14in;font-size:6.5pt;color:#999}
</style>
<div class="page">
${cardHtml('en', false)}
  <div class="note">Amparo wallet cards \u2014 Avery 5371 layout (ten 3.5\u00d72in cards). Print double-sided, flip on LONG edge, for English front / Spanish back. amparohq.com/cards</div>
</div>
<div class="page">
${cardHtml('es', true)}
</div>`;
}

async function findChrome() {
  for (const c of CHROME) { try { await readFile(c); return c; } catch {} }
  throw new Error('no Chrome or Edge found');
}

/* ---------- selftest ---------- */
if (process.argv.includes('--selftest')) {
  const c = []; const ok = (v, m) => c.push([v, m]);
  const arena = await readFile(path.join(ROOT, 'arena', 'index.html'), 'utf8');
  /* The arena escapes apostrophes as \u2019 inside single-quoted JS strings;
     normalise that before the byte comparison so we compare rendered text. */
  const arenaText = arena.replace(/\\u2019/g, '\u2019').replace(/\\'/g, "'");

  for (const l of LINES) {
    ok(arenaText.includes(l.en), `EN line verbatim in arena: ${l.en.slice(0, 44)}`);
    ok(arenaText.includes(l.es), `ES line verbatim in arena: ${l.es.slice(0, 44)}`);
  }

  const root = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  ok(root.includes('Berghuis v. Thompkins, 560 U.S. 370') && root.includes('Salinas v. Texas, 570 U.S. 178'),
    'the citation on the card is one the site already publishes');

  for (const lang of ['en', 'es']) {
    const svg = buildWhatsAppSvg(lang);
    ok(svg.includes('width="1080" height="1080"'), `${lang} WhatsApp card is 1080x1080`);
    ok(!/<svg[\s\S]*<svg/.test(svg), `${lang} single root element`);
    const minSize = Math.min(...[...svg.matchAll(/font-size="(\d+)"/g)].map(m => Number(m[1])));
    ok(minSize >= 21, `${lang} smallest type is ${minSize}px \u2014 survives WhatsApp recompression`);
    ok(svg.includes('amparohq.com'), `${lang} carries the domain`);
    const sayLines = [...svg.matchAll(/font-size="40"[^>]*>([^<]+)</g)].map(m => m[1]);
    const longest = Math.max(...sayLines.map(t => t.length));
    ok(longest <= 46, `${lang} longest rendered line is ${longest} chars — nothing clips (46 fits at 40px)`);
    ok(/[Nn]ot legal advice|[Nn]o es asesor/.test(svg), `${lang} carries the non-advice line`);
  }

  const html = buildPrintHtml();
  ok((html.match(/class="card"/g) || []).length === 20, '20 cards across the two pages (10 per side)');
  ok(html.includes('left:0.75in') && html.includes('left:4.25in'), 'Avery 5371 columns at 0.75in and 4.25in');
  ok(html.includes('top:0.5in') && html.includes('top:8.5in'), 'five 2in rows from 0.5in');
  /* duplex mirroring: on the ES page the FIRST emitted cell must sit in the
     RIGHT column, so a long-edge flip pairs it with the EN front. */
  const esPage = html.slice(html.lastIndexOf('<div class="page">'));
  const firstEsLeft = /left:([\d.]+)in/.exec(esPage)[1];
  ok(firstEsLeft === '4.25', `ES page columns are mirrored for long-edge duplex (first cell at ${firstEsLeft}in)`);
  ok(/page-break-after:always/.test(html), 'pages break correctly');
  ok(!/\u26a0/.test(html) && !LINES.some(l => /\u26a0/.test(l.en)), 'the unverified-state notice is not on the card (it lives on the site, where a state is chosen)');

  let f = 0;
  for (const [v, m] of c) { console.log(`${v ? 'ok  ' : 'FAIL'}  ${m}`); if (!v) f++; }
  console.log(`\n${c.length - f}/${c.length} passed`);
  process.exit(f ? 1 : 0);
}

/* ---------- build ---------- */
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await mkdir(OUT, { recursive: true });
  const chrome = await findChrome();

  for (const lang of ['en', 'es']) {
    const svgPath = path.join(OUT, `.wa-${lang}.svg`);
    const png = path.join(OUT, `whatsapp-${lang}.png`);
    await writeFile(svgPath, buildWhatsAppSvg(lang), 'utf8');
    try {
      await execFileP(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars',
        '--window-size=1080,1080', `--screenshot=${png}`, pathToFileURL(svgPath).href], { timeout: 60000 });
    } finally { await unlink(svgPath).catch(() => {}); }
    console.log(`wrote ${png}`);
  }

  const htmlPath = path.join(OUT, '.print.html');
  const pdf = path.join(OUT, 'wallet-cards-avery5371.pdf');
  await writeFile(htmlPath, buildPrintHtml(), 'utf8');
  try {
    await execFileP(chrome, ['--headless', '--disable-gpu', '--no-pdf-header-footer',
      `--print-to-pdf=${pdf}`, pathToFileURL(htmlPath).href], { timeout: 120000 });
  } finally { await unlink(htmlPath).catch(() => {}); }
  console.log(`wrote ${pdf}`);
}
