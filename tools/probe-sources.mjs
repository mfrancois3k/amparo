#!/usr/bin/env node
/**
 * Probe candidate statute hosts to find ones that answer a GitHub Actions
 * runner. FindLaw serves a residential IP and 403s a datacenter one, so this
 * MUST be run on the runner — testing locally proves nothing about the case
 * that matters.
 *
 * For each candidate it reports HTTP status, whether the section number
 * actually appears in the fetched body (a 200 that renders a JS shell is
 * useless), and the extractable text length.
 *
 * Usage: node tools/probe-sources.mjs
 */
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'upgrade-insecure-requests': '1'
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CANDIDATES = [
  // --- TX Transp. Code 521.025 (licence display on demand) ---
  { id: 'tx-521.025', host: 'findlaw',    anchor: '521.025', url: 'https://codes.findlaw.com/tx/transportation-code/transp-sect-521-025/' },
  { id: 'tx-521.025', host: 'justia',     anchor: '521.025', url: 'https://law.justia.com/codes/texas/transportation-code/title-7/subtitle-b/chapter-521/subchapter-b/section-521-025/' },
  { id: 'tx-521.025', host: 'public.law', anchor: '521.025', url: 'https://texas.public.law/statutes/tex._transp._code_section_521.025' },
  { id: 'tx-521.025', host: 'onecle',     anchor: '521.025', url: 'https://law.onecle.com/texas/transportation/521.025.00.html' },
  { id: 'tx-521.025', host: 'capitol',    anchor: '521.025', url: 'https://statutes.capitol.texas.gov/Docs/TN/htm/TN.521.htm' },

  // --- TX Transp. Code 543.005 (signing a citation) ---
  { id: 'tx-543.005', host: 'findlaw',    anchor: '543.005', url: 'https://codes.findlaw.com/tx/transportation-code/transp-sect-543-005/' },
  { id: 'tx-543.005', host: 'public.law', anchor: '543.005', url: 'https://texas.public.law/statutes/tex._transp._code_section_543.005' },
  { id: 'tx-543.005', host: 'onecle',     anchor: '543.005', url: 'https://law.onecle.com/texas/transportation/543.005.00.html' },

  // --- NY VTL 1194 (chemical-test refusal) ---
  { id: 'ny-1194',    host: 'findlaw',    anchor: '1194',    url: 'https://codes.findlaw.com/ny/vehicle-and-traffic-law/vat-sect-1194/' },
  { id: 'ny-1194',    host: 'nysenate',   anchor: '1194',    url: 'https://www.nysenate.gov/legislation/laws/VAT/1194' },
  { id: 'ny-1194',    host: 'public.law', anchor: '1194',    url: 'https://newyork.public.law/laws/n.y._vehicle_and_traffic_law_section_1194' },
  { id: 'ny-1194',    host: 'justia',     anchor: '1194',    url: 'https://law.justia.com/codes/new-york/vat/title-7/article-31/1194/' },

  // --- GA O.C.G.A. 40-5-29 (licence possession/display) ---
  { id: 'ga-40-5-29', host: 'findlaw',    anchor: '40-5-29', url: 'https://codes.findlaw.com/ga/title-40-motor-vehicles-and-traffic/ga-code-sect-40-5-29/' },
  { id: 'ga-40-5-29', host: 'justia',     anchor: '40-5-29', url: 'https://law.justia.com/codes/georgia/title-40/chapter-5/article-2/section-40-5-29/' },
  { id: 'ga-40-5-29', host: 'public.law', anchor: '40-5-29', url: 'https://georgia.public.law/statutes/ga._code_%C2%A7_40-5-29' },
  { id: 'ga-40-5-29', host: 'onecle',     anchor: '40-5-29', url: 'https://law.onecle.com/georgia/40/40-5-29.html' },
  { id: 'ga-40-5-29', host: 'ga.elaws',   anchor: '40-5-29', url: 'https://ga.elaws.us/law/40-5-29' }
];

const strip = html => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const rows = [];
for (const [n, c] of CANDIDATES.entries()) {
  if (n) await sleep(1500);
  let status = '?', hasCite = false, len = 0, note = '';
  try {
    const res = await fetch(c.url, { headers: HEADERS, signal: AbortSignal.timeout(25000), redirect: 'follow' });
    status = res.status;
    if (res.ok) {
      const text = strip(await res.text());
      len = text.length;
      hasCite = text.includes(c.anchor);
      // A 200 that returns a JS shell has no statute text in it — worthless
      // for hashing even though the status looks healthy.
      if (!hasCite && len < 2000) note = 'shell/empty';
    }
  } catch (e) {
    status = 'ERR';
    note = String(e.message || e).slice(0, 40);
  }
  const usable = status === 200 && hasCite && len > 2000;
  rows.push({ ...c, status, hasCite, len, usable, note });
  console.log(
    `${usable ? 'USABLE  ' : '        '}${String(status).padEnd(5)} ` +
    `${c.id.padEnd(12)} ${c.host.padEnd(11)} cite=${hasCite ? 'Y' : 'n'} len=${String(len).padEnd(7)} ${note}`
  );
}

console.log('\n--- usable hosts per statute ---');
for (const id of [...new Set(CANDIDATES.map(c => c.id))]) {
  const win = rows.filter(r => r.id === id && r.usable).map(r => r.host);
  console.log(`${id.padEnd(12)} ${win.length ? win.join(', ') : 'NONE'}`);
}
