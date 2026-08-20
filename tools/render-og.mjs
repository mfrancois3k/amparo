#!/usr/bin/env node
/**
 * Renders a distinct share image for every indexable page.
 *
 * All 111 generated pages pointed at a single og.png, so every share of every
 * state page looked identical — 63 pages of surface area collapsing into one
 * thumbnail at exactly the moment someone was passing a link to a person who
 * needed it. On the channels this project actually relies on (a legal-aid
 * newsletter, a community group, a text message) the share image IS the ad.
 *
 * Same renderer as the post cards, at 1200x630 rather than 4:5, because these
 * are consumed as link previews rather than as feed posts.
 *
 * Reuses build-pages' own page list so the two cannot drift: if a state is
 * verified or gains a legal-aid entry, it becomes indexable and gets an image
 * on the next run without anything here changing.
 *
 * Usage:
 *   node tools/render-og.mjs           render missing images
 *   node tools/render-og.mjs --force   re-render everything
 *   node tools/render-og.mjs --list    print what would be rendered
 */
import { readFile, writeFile, mkdir, unlink, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const OUT = path.join(ROOT, 'og');
const W = 1200, H = 630;
const FORCE = process.argv.includes('--force');
const LIST = process.argv.includes('--list');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = []; let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function fit(title) {
  for (const [size, chars, max] of [[64, 26, 3], [56, 30, 3], [48, 36, 4], [42, 42, 4]]) {
    const lines = wrap(title, chars);
    if (lines.length <= max) return { size, lines };
  }
  return { size: 38, lines: wrap(title, 48).slice(0, 5) };
}

/* A verified state and an unverified one must not look the same. The badge is
   the honest difference, and it is also the more clickable of the two: "quoted
   from the statute" is a stronger promise than a state name. */
function badge(kind, lang) {
  if (kind === 'verified') return lang === 'es' ? 'CITADO DE LA LEY DEL ESTADO' : 'QUOTED FROM THE STATE STATUTE';
  if (kind === 'federal') return lang === 'es' ? 'REGLAS FEDERALES · 50 ESTADOS' : 'FEDERAL RULES · ALL 50 STATES';
  if (kind === 'about') return lang === 'es' ? 'ACERCA DE AMPARO' : 'ABOUT AMPARO';
  return lang === 'es' ? 'REGLAS FEDERALES APLICAN AQUÍ' : 'FEDERAL RULES APPLY HERE';
}

export function buildOgSvg({ title, kind, lang }) {
  const f = fit(title);
  const lineH = Math.round(f.size * 1.16);
  const blockH = f.lines.length * lineH;
  const startY = Math.round((H - blockH) / 2) + f.size - 26;
  const lines = f.lines.map((l, i) =>
    `<text x="72" y="${startY + i * lineH}" font-family="Georgia, 'Times New Roman', serif" font-size="${f.size}" font-weight="bold" fill="#1B2A4A">${esc(l)}</text>`
  ).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#FAF6EE"/><stop offset="100%" stop-color="#F1EADA"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="0" y="0" width="${W}" height="12" fill="#1B2A4A"/>
  <rect x="0" y="0" width="14" height="${H}" fill="#E8B84B"/>

  <g transform="translate(72,58) scale(0.42)">
    <g transform="rotate(-90 60 72)"><circle cx="60" cy="72" r="27" fill="none" stroke="#E8B84B" stroke-width="10"/></g>
    <path d="M46 49 h17 l10 10 v26 a3 3 0 0 1 -3 3 h-24 a3 3 0 0 1 -3 -3 v-33 a3 3 0 0 1 3 -3 z" fill="#1B2A4A"/>
    <path d="M14 61 L60 19 L106 61" fill="none" stroke="#1B2A4A" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="27" y="25" width="9.5" height="20" rx="1.5" fill="#1B2A4A"/>
  </g>
  <text x="134" y="94" font-family="system-ui, sans-serif" font-size="21" font-weight="600" fill="#1B2A4A" letter-spacing="1.4">AMPARO</text>
  <text x="72" y="${H - 118}" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#8a7a52" letter-spacing="1.8">${esc(badge(kind, lang))}</text>

  ${lines}

  <rect x="72" y="${H - 92}" width="96" height="7" rx="3" fill="#E8B84B"/>
  <text x="72" y="${H - 44}" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#1B2A4A" letter-spacing="1.2">amparohq.com</text>
  <text x="${W - 72}" y="${H - 44}" text-anchor="end" font-family="system-ui, sans-serif" font-size="20" fill="#6b7a94">${lang === 'es' ? 'Gratis · Bilingüe' : 'Free · Bilingual'}</text>
</svg>`;
}

async function findChrome() {
  for (const c of CHROME) { try { await readFile(c); return c; } catch {} }
  throw new Error('no Chrome or Edge found for rendering');
}

/* Mirrors build-pages.mjs: indexable means verified rules or a state-specific
   legal-aid directory. Anything thinner is noindexed and gets no image. */
async function pageList() {
  const src = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const lit = (name, o, c) => {
    const m = new RegExp(`^const ${name}\\s*=\\s*\\${o}`, 'm').exec(src);
    const b = m.index + m[0].length - 1;
    const e = src.indexOf(`\n${c};`, b);
    return new Function(`return (${src.slice(b, e + 1 + c.length)})`)();
  };
  const NAMES = lit('US_STATE_NAMES', '{', '}');
  const AID = lit('STATE_LEGAL_AID', '{', '}');
  const STATES = lit('STATES', '{', '}');

  const out = [];
  for (const ab of Object.keys(NAMES)) {
    const verified = !!STATES[ab];
    if (!verified && !AID[ab]) continue;               // noindexed: no image
    for (const lang of ['en', 'es']) {
      const base = lang === 'en' ? 'rights' : 'derechos';
      out.push({
        slug: `${base}-${ab.toLowerCase()}`, lang,
        kind: verified ? 'verified' : 'gap',
        title: lang === 'en'
          ? `Your rights at a traffic stop in ${NAMES[ab]}`
          : `Sus derechos en una parada de tráfico en ${NAMES[ab]}`
      });
    }
  }
  for (const lang of ['en', 'es']) {
    const base = lang === 'en' ? 'rights' : 'derechos';
    const s = lang === 'en' ? 'any-state' : 'cualquier-estado';
    out.push({ slug: `${base}-${s}`, lang, kind: 'federal',
      title: lang === 'en' ? 'Your rights at a traffic stop in any US state' : 'Sus derechos en una parada de tráfico en cualquier estado' });
    out.push({ slug: `${base}-hub`, lang, kind: 'federal',
      title: lang === 'en' ? 'Know your rights at a traffic stop' : 'Conozca sus derechos en una parada de tráfico' });
  }
  out.push({ slug: 'about', lang: 'en', kind: 'about', title: 'About Amparo' });
  out.push({ slug: 'acerca', lang: 'es', kind: 'about', title: 'Acerca de Amparo' });
  out.push({ slug: 'how-we-verify', lang: 'en', kind: 'about', title: 'How we verify every rule we publish' });
  out.push({ slug: 'como-verificamos', lang: 'es', kind: 'about', title: 'Cómo verificamos cada regla que publicamos' });
  return out;
}

const pages = await pageList();

if (LIST) {
  for (const p of pages) console.log(`${p.slug.padEnd(28)} ${p.kind.padEnd(9)} ${p.title}`);
  console.log(`\n${pages.length} images`);
  process.exit(0);
}

await mkdir(OUT, { recursive: true });
const chrome = await findChrome();
let made = 0, skipped = 0;

for (const p of pages) {
  const png = path.join(OUT, `${p.slug}.png`);
  if (!FORCE) {
    try { await access(png); skipped++; continue; } catch {}
  }
  const tmp = path.join(OUT, `.${p.slug}.svg`);
  await writeFile(tmp, buildOgSvg(p), 'utf8');
  try {
    await execFileP(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars',
      `--window-size=${W},${H}`, `--screenshot=${png}`, pathToFileURL(tmp).href], { timeout: 60000 });
    made++;
  } finally { await unlink(tmp).catch(() => {}); }
}

console.log(`og images: ${made} rendered, ${skipped} already present, ${pages.length} total`);
