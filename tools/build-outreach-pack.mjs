#!/usr/bin/env node
/**
 * Generates growth/outreach-pack.md — the Flipboard seed list and the
 * compliant Reels scripts. A content pack for the operator to execute by
 * hand, not an automation: Flipboard and Instagram publishing both require a
 * logged-in human, and that is correct, not a gap to close.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO:
 *
 *   - Script coordinated upvoting on any platform. Digg (relaunched Jan 2026)
 *     ranks by genuine engagement; manufacturing votes is the same category
 *     of abuse as Reddit vote brigading, on whichever platform it targets.
 *
 *   - React to a specific trending clip of a real incident. That is the exact
 *     case tools/news-post.mjs was built to refuse: THE NEWS CHOOSES WHICH
 *     SCENARIO, NEVER WHAT THE POST SAYS, and no individual case ever enters
 *     a post. A clip from the last 24-48 hours is a real person, often mid
 *     legal process; scripting a "correction" against a stranger's comment
 *     section to route traffic here is a reputational and legal risk this
 *     product cannot carry, and it defeats the entire trust argument the site
 *     is built on.
 *
 * The Reels scripts below use the SAME Hook/Value/CTA shape, sourced instead
 * from Amparo's own verified drills (imported from render-kyr-card.mjs, so
 * they stay byte-identical to the card and the arena) and reacting to a
 * PATTERN — a common misconception, a recurring moment — never a named
 * person's specific footage.
 *
 * Usage: node tools/build-outreach-pack.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { LINES } from './render-kyr-card.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const ORIGIN = 'https://www.amparohq.com';

const u = (path_, content) => `${ORIGIN}${path_}?utm_source=flipboard&utm_medium=organic&utm_content=${content}`;

/* ---------- Flipboard: real, checkable authorities only ----------
   No scraped or unattributed content. Every non-Amparo link below is a named
   organisation's own published material — the same standard applied to the
   answer bank and the state pages: cite the primary source, never paraphrase
   it as if it were ours. */
const FLIPBOARD_MAGS = [
  {
    name: 'Know Your Rights — Texas & New York',
    desc: 'What the statute actually says at a traffic stop in TX and NY, quoted with the citation.',
    seed: [
      ['Amparo — Your rights at a traffic stop in Texas', u('/rights/tx/', 'mag_tx')],
      ['Amparo — Sus derechos en una parada de tráfico en Texas', u('/derechos/tx/', 'mag_tx_es')],
      ['Amparo — Your rights at a traffic stop in New York', u('/rights/ny/', 'mag_ny')],
      ['Amparo — Sus derechos en una parada de tráfico en Nueva York', u('/derechos/ny/', 'mag_ny_es')],
      ['ACLU — Know Your Rights: Stopped by Police', 'https://www.aclu.org/know-your-rights/stopped-by-police'],
      ['NYCLU — Know Your Rights', 'https://www.nyclu.org/know-your-rights'],
      ['TexasLawHelp.org — Find Legal Help', 'https://texaslawhelp.org/find-legal-help'],
      ['ACLU of Texas — Know Your Rights', 'https://www.aclutx.org/en/know-your-rights'],
      ['Amparo — How we verify every rule we publish', u('/how-we-verify/', 'mag_verify')]
    ]
  },
  {
    name: 'Beat Traffic-Stop Anxiety',
    desc: 'What actually happens during a stop, and how to walk in prepared instead of guessing.',
    seed: [
      ['Amparo — About', u('/about/', 'mag_anx')],
      ['ACLU — What to Do If You Are Stopped by Police', 'https://www.aclu.org/know-your-rights/stopped-by-police'],
      ['NHTSA — Traffic Stops: What to Expect', 'https://www.nhtsa.gov/road-safety/driver-safety'],
      ['ILRC — Red Cards (Know Your Rights)', 'https://www.ilrc.org/red-cards-tarjetas-rojas'],
      ['CLINIC — Know Your Rights Resources', 'https://cliniclegal.org/resources/know-your-rights'],
      ['Amparo — Your rights at a traffic stop (federal floor, any state)', u('/rights/any-state/', 'mag_anx_us')],
      ['CHIRLA — Know Your Rights', 'https://www.chirla.org/know-your-rights/'],
      ['211.org — Find Local Legal Aid', 'https://www.211.org/'],
      ['Amparo — Your rights at a traffic stop in Georgia', u('/rights/ga/', 'mag_anx_ga')]
    ]
  },
  {
    name: 'Bilingual Justice & Civil Rights',
    desc: 'Rights information that exists in Spanish and English with equal rigor — not a translation afterthought.',
    seed: [
      ['Amparo — Sus derechos en cualquier estado (piso federal)', u('/derechos/cualquier-estado/', 'mag_bj')],
      ['ACLU — Derechos si es detenido por la policía', 'https://www.aclu.org/know-your-rights/stopped-by-police'],
      ['USAHello — Know Your Rights (multilingual)', 'https://usahello.org/rights/'],
      ['United We Dream — Know Your Rights', 'https://unitedwedream.org/resources/know-your-rights/'],
      ['Amparo — Acerca de Amparo', u('/acerca/', 'mag_bj_about')],
      ['LawHelpCA — Find Legal Help', 'https://www.lawhelpca.org/find-legal-help'],
      ['NILC — Know Your Rights Materials', 'https://www.nilc.org/resources/'],
      ['Amparo — Cómo verificamos cada regla', u('/como-verificamos/', 'mag_bj_verify')],
      ['CLINIC — Conozca Sus Derechos', 'https://cliniclegal.org/resources/know-your-rights']
    ]
  }
];

/* ---------- Reels: pattern-reactive, never clip-reactive ----------
   Each script names the MISCONCEPTION it corrects, not a person or a clip.
   "Value" lines are pulled straight from LINES, so they cannot drift from
   what the card and the drill already say. */
const REELS = [
  {
    id: 'admission-trap',
    misconception: { en: 'People think “do you know why I pulled you over” is small talk.', es: 'La gente cree que «¿sabe por qué lo detuve?» es una charla casual.' },
    line: LINES.find(l => l.id === 'guess'),
    drill: 'trap', drillName: { en: 'the Admission Trap', es: 'la Trampa de Admisión' }
  },
  {
    id: 'silence-aloud',
    misconception: { en: 'People think going quiet is the same as using their right to remain silent.', es: 'La gente cree que quedarse callado es lo mismo que usar el derecho a guardar silencio.' },
    line: LINES.find(l => l.id === 'silence'),
    drill: 'traffic', drillName: { en: 'the Traffic Stop drill', es: 'el ejercicio de Parada de Tráfico' }
  },
  {
    id: 'refuse-search',
    misconception: { en: 'People think refusing a search is itself suspicious.', es: 'La gente cree que negarse a un registro ya es sospechoso.' },
    line: LINES.find(l => l.id === 'search'),
    drill: 'traffic', drillName: { en: 'the Traffic Stop drill', es: 'el ejercicio de Parada de Tráfico' }
  }
];

function reelScript(r, lang) {
  const url = u('/arena/', `reel_${r.id}_${lang}`).replace('/arena/?', `/arena/?sit=${r.drill}&`);
  return lang === 'en' ? `
HOOK (0-2s) — on screen, no clip, no name:
  “${r.misconception.en}”

VALUE (2-15s) — say this, verbatim from the drill:
  ${r.line.en}
  (${r.line.label.en})

CTA (15-30s):
  "Amparo has a free 3-minute drill for exactly this — ${r.drillName.en}. Link in bio."
  On-screen URL: ${url}
` : `
GANCHO (0-2s) — en pantalla, sin clip, sin nombre:
  «${r.misconception.es}»

VALOR (2-15s) — diga esto, textual del ejercicio:
  ${r.line.es}
  (${r.line.label.es})

LLAMADO A LA ACCIÓN (15-30s):
  "Amparo tiene un ejercicio gratis de 3 minutos para justo esto — ${r.drillName.es}. Enlace en la bio."
  URL en pantalla: ${url}
`;
}

const md = [];
md.push('# Outreach pack — Flipboard + compliant Reels\n');
md.push('_Content to execute by hand. Flipboard and Instagram both require a logged-in human — that is correct, not a gap.', '', '**Two things intentionally excluded, and why:**', '- No coordinated upvoting on Digg. Manufacturing votes to game a ranking algorithm is inauthentic engagement, the same category as Reddit vote brigading, regardless of platform.', '- No reaction to a specific trending clip. `tools/news-post.mjs` already enforces this rule for the daily posts: the news chooses WHICH scenario, never WHAT is said, and no individual case ever enters a post. A 24-48h-old clip is a real person, often mid legal process — scripting a "correction" against a stranger to route traffic here is a risk this product does not take. The Reels below react to a misconception PATTERN instead.\n', '---\n');

md.push('## Flipboard magazines\n');
for (const m of FLIPBOARD_MAGS) {
  md.push(`### ${m.name}`, m.desc, '');
  md.push('Seed list (flip these, in order — mix of Amparo pages and named primary sources, never scraped or unattributed):', '');
  m.seed.forEach((s, i) => md.push(`${i + 1}. [${s[0]}](${s[1]})`));
  md.push('');
}

md.push('---\n', '## Reels scripts — pattern-reactive, not clip-reactive\n');
md.push('Find or film your OWN 20-30s talking-head clip for each. Do not attach these to someone else\'s trending video.\n');
for (const r of REELS) {
  md.push(`### ${r.id}`, '```', reelScript(r, 'en').trim(), '```', '', '```', reelScript(r, 'es').trim(), '```', '');
}

await mkdir(path.join(ROOT, 'growth'), { recursive: true });
await writeFile(path.join(ROOT, 'growth', 'outreach-pack.md'), md.join('\n') + '\n', 'utf8');
console.log(`wrote growth/outreach-pack.md — ${FLIPBOARD_MAGS.length} magazines (${FLIPBOARD_MAGS.reduce((n, m) => n + m.seed.length, 0)} seed links), ${REELS.length} Reels scripts x2 languages`);
