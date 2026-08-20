#!/usr/bin/env node
/**
 * Renders a post as a 4:5 image card, in Amparo's own brand, from SVG.
 *
 * WHY NOT A GENERATIVE IMAGE MODEL: the format that works on this channel is
 * text burned into an image, and text is the one thing image models still get
 * wrong. A card whose whole payload is a statute quote cannot afford a
 * hallucinated character in a section number. Rendering SVG through headless
 * Chrome gives exact glyphs, exact brand colour, no per-image cost, no API key
 * and a deterministic result — every property that matters here.
 *
 * A generative model earns its place on atmosphere and illustration, neither of
 * which this product wants: photographs of police encounters are the wrong
 * register for a tool whose job is to keep someone calm, and generated ones
 * carry a further problem of depicting an event that never happened.
 *
 * 4:5 at 1080x1350 is the tallest ratio Facebook and Instagram both render
 * without cropping, so it occupies the most vertical space in a feed — which is
 * the entire mechanical advantage an image post has over a text post.
 *
 * Usage:
 *   node tools/render-card.mjs --hook "..." --quote "..." --drill "..." --out card.png
 *   node tools/render-card.mjs --selftest
 */
import { writeFile, mkdir, readFile, unlink } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const W = 1080, H = 1350;

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'
];

export const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* SVG has no text wrapping. Measure in character units against the box width,
   which is close enough for a display face at a known size and avoids pulling
   in a text-measurement dependency for six lines of copy. */
export function wrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) { lines.push(line); line = w; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Shrink the hook until it fits the space it has, rather than overflowing. */
export function fitHook(hook) {
  for (const [size, chars, max] of [[86, 20, 4], [76, 23, 5], [66, 27, 6], [58, 31, 7]]) {
    const lines = wrap(hook, chars);
    if (lines.length <= max) return { size, lines };
  }
  return { size: 52, lines: wrap(hook, 35).slice(0, 8) };
}

export function buildSvg({ hook, quote, cite, drill, lang = 'en' }) {
  const h = fitHook(hook);
  const hookY = 250;
  const lineH = Math.round(h.size * 1.16);
  const hookLines = h.lines.map((l, i) =>
    `<text x="88" y="${hookY + i * lineH}" font-family="Georgia, 'Times New Roman', serif" font-size="${h.size}" font-weight="bold" fill="#1B2A4A">${esc(l)}</text>`
  ).join('\n  ');

  const ruleY = hookY + h.lines.length * lineH + 4;
  const quoteLines = quote ? wrap(quote, 52).slice(0, 7) : [];
  /* Anchor the quote to the footer rather than letting it flow from the rule.
     Flowing left a dead band in the middle of the card whenever the hook was
     short, and on a 4:5 card that empty third is the most valuable space in
     the feed. Anchored, a short hook opens the card up instead of hollowing it. */
  const quoteBlockH = quoteLines.length * 40 + (cite ? 34 : 0);
  const quoteY = Math.max(ruleY + 84, H - 148 - 96 - quoteBlockH);
  const quoteSvg = quoteLines.map((l, i) =>
    `<text x="104" y="${quoteY + i * 40}" font-family="Georgia, serif" font-size="27" font-style="italic" fill="#2f3f5e">${esc(l)}</text>`
  ).join('\n  ');
  const quoteBoxH = quoteLines.length * 40 + 42;

  const cta = lang === 'es' ? `Practique ${drill}` : `Practice ${drill}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FAF6EE"/><stop offset="100%" stop-color="#F1EADA"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="14" fill="#1B2A4A"/>

  <!-- mark, from const LOGO -->
  <g transform="translate(88,96) scale(0.62)">
    <g transform="rotate(-90 60 72)"><circle cx="60" cy="72" r="27" fill="none" stroke="#E8B84B" stroke-width="10"/></g>
    <path d="M46 49 h17 l10 10 v26 a3 3 0 0 1 -3 3 h-24 a3 3 0 0 1 -3 -3 v-33 a3 3 0 0 1 3 -3 z" fill="#1B2A4A"/>
    <path d="M14 61 L60 19 L106 61" fill="none" stroke="#1B2A4A" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="27" y="25" width="9.5" height="20" rx="1.5" fill="#1B2A4A"/>
  </g>
  <text x="176" y="150" font-family="system-ui, sans-serif" font-size="27" font-weight="600" fill="#1B2A4A" letter-spacing="1">AMPARO</text>

  ${hookLines}

  <rect x="88" y="${ruleY}" width="132" height="9" rx="4" fill="#E8B84B"/>

  ${quoteLines.length ? `<rect x="88" y="${quoteY - 34}" width="6" height="${quoteBoxH}" rx="3" fill="#E8B84B"/>
  ${quoteSvg}
  ${cite ? `<text x="104" y="${quoteY + quoteLines.length * 40 + 12}" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#6b7a94">${esc(cite)}</text>` : ''}` : ''}

  <rect x="0" y="${H - 148}" width="${W}" height="148" fill="#1B2A4A"/>
  <text x="88" y="${H - 88}" font-family="system-ui, sans-serif" font-size="34" font-weight="600" fill="#FAF6EE">${esc(cta)}</text>
  <text x="88" y="${H - 42}" font-family="system-ui, sans-serif" font-size="27" fill="#E8B84B" letter-spacing="1.5">amparohq.com</text>
</svg>`;
}

async function findChrome() {
  for (const c of CHROME_CANDIDATES) {
    try { await readFile(c); return c; } catch {}
  }
  throw new Error('no Chrome or Edge found for rendering — checked: ' + CHROME_CANDIDATES.join(', '));
}

export async function renderCard(spec, outPath) {
  const svg = buildSvg(spec);
  const tmp = path.join(path.dirname(outPath), `.card-${Date.now()}.svg`);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(tmp, svg, 'utf8');
  const chrome = await findChrome();
  try {
    await execFileP(chrome, [
      '--headless', '--disable-gpu', '--hide-scrollbars',
      `--window-size=${W},${H}`,
      `--screenshot=${outPath}`,
      pathToFileURL(tmp).href
    ], { timeout: 60000 });
  } finally {
    await unlink(tmp).catch(() => {});
  }
  return outPath;
}

if (process.argv.includes('--selftest')) {
  const c = []; const ok = (v, m) => c.push([v, m]);
  ok(wrap('a b c d e f', 3).length === 3, 'wrap breaks on the character budget');
  ok(wrap('supercalifragilistic', 5)[0] === 'supercalifragilistic', 'a word longer than the budget is not chopped mid-word');
  ok(wrap('', 10).length === 0, 'empty text yields no lines');

  const short = fitHook('Short hook here');
  const long = fitHook('An officer can order you out of the car without suspecting you of anything at all today');
  ok(short.size >= long.size, 'a longer hook renders at a smaller size');
  ok(long.lines.length <= 7, `a long hook still fits the box (${long.lines.length} lines)`);
  const shortCard = buildSvg({ hook: 'Short.', quote: 'A quoted rule that sits low on the card.', cite: 'Cite', drill: 'x' });
  const qy = Number(/<text x="104" y="(\d+)"/.exec(shortCard)[1]);
  ok(qy > 800, `a short hook still pushes the quote to the lower card, not the middle (y=${qy})`);

  const svg = buildSvg({ hook: 'Test & <hook>', quote: 'Quoted "law" text', cite: 'Penal Code §38.02(a)', drill: 'the Admission Trap' });
  ok(svg.startsWith('<svg'), 'produces an svg');
  ok(/width="1080" height="1350"/.test(svg), '4:5 at 1080x1350');
  ok(svg.includes('Test &amp; &lt;hook&gt;'), 'hook text is XML-escaped');
  ok(svg.includes('&quot;law&quot;'), 'quote text is XML-escaped');
  ok(svg.includes('§38.02(a)'), 'section symbols survive');
  ok(svg.includes('amparohq.com'), 'carries the domain');
  ok(!/<svg[\s\S]*<svg/.test(svg), 'single root element');

  const es = buildSvg({ hook: 'Hola', drill: 'el ejercicio de Retén', lang: 'es' });
  ok(es.includes('Practique el ejercicio de Retén'), 'Spanish CTA uses the Spanish verb');

  let f = 0;
  for (const [v, m] of c) { console.log(`${v ? 'ok  ' : 'FAIL'}  ${m}`); if (!v) f++; }
  console.log(`\n${c.length - f}/${c.length} passed`);
  process.exit(f ? 1 : 0);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const arg = f => { const i = process.argv.indexOf(f); return i === -1 ? null : process.argv[i + 1]; };
  const out = arg('--out') || path.join(ROOT, 'content', 'cards', 'card.png');
  await renderCard({
    hook: arg('--hook') || 'Refusing a search is not evidence of anything.',
    quote: arg('--quote') || null,
    cite: arg('--cite') || null,
    drill: arg('--drill') || 'the Traffic Stop drill',
    lang: arg('--lang') || 'en'
  }, out);
  console.log(`wrote ${out}`);
}
