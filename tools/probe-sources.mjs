#!/usr/bin/env node
/**
 * Probe candidate statute hosts from a GitHub Actions runner.
 *
 * Round 1 established: public.law serves datacenter IPs reliably and covers
 * TX and NY, but has no Georgia subdomain (georgia.public.law does not
 * resolve). FindLaw 403s the runner for TX/NY yet answered once for GA, so it
 * cannot be trusted without evidence it is stable.
 *
 * Round 2 therefore hunts a Georgia source, and re-tests FindLaw's GA URL
 * three times to tell a real success from a fluke.
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

const ANCHOR = '40-5-29';
const CANDIDATES = [
  { host: 'findlaw #1',  url: 'https://codes.findlaw.com/ga/title-40-motor-vehicles-and-traffic/ga-code-sect-40-5-29/' },
  { host: 'findlaw #2',  url: 'https://codes.findlaw.com/ga/title-40-motor-vehicles-and-traffic/ga-code-sect-40-5-29/' },
  { host: 'findlaw #3',  url: 'https://codes.findlaw.com/ga/title-40-motor-vehicles-and-traffic/ga-code-sect-40-5-29/' },
  { host: 'lawserver',   url: 'https://www.lawserver.com/law/state/georgia/ga-code/georgia_code_40-5-29' },
  { host: 'onecle-a',    url: 'https://law.onecle.com/georgia/motor-vehicles-and-traffic/40-5-29.html' },
  { host: 'elaws-a',     url: 'https://ga.elaws.us/law/section40-5-29' },
  { host: 'elaws-b',     url: 'https://ga.elaws.us/law/40-5-29' },
  { host: 'justia',      url: 'https://law.justia.com/codes/georgia/title-40/chapter-5/article-2/section-40-5-29/' },
  { host: 'casetext',    url: 'https://casetext.com/statute/code-of-georgia/title-40-motor-vehicles-and-traffic/chapter-5-drivers-licenses/article-2-issuance-expiration-and-renewal-of-licenses/section-40-5-29-possession-and-display-of-license-by-licensee' },
  { host: 'legis.ga',    url: 'https://www.legis.ga.gov/legislation/ocga' },
  { host: 'vlex',        url: 'https://law.justia.com/georgia/' }
];

const strip = html => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

for (const [n, c] of CANDIDATES.entries()) {
  if (n) await sleep(2000);
  let status = '?', hasCite = false, len = 0, note = '';
  try {
    const res = await fetch(c.url, { headers: HEADERS, signal: AbortSignal.timeout(25000), redirect: 'follow' });
    status = res.status;
    if (res.ok) {
      const text = strip(await res.text());
      len = text.length;
      hasCite = text.includes(ANCHOR);
      if (!hasCite && len < 2000) note = 'shell/empty';
    }
  } catch (e) {
    status = 'ERR';
    note = String(e.message || e).slice(0, 40);
  }
  const usable = status === 200 && hasCite && len > 2000;
  console.log(
    `${usable ? 'USABLE  ' : '        '}${String(status).padEnd(5)} ` +
    `${c.host.padEnd(11)} cite=${hasCite ? 'Y' : 'n'} len=${String(len).padEnd(7)} ${note}`
  );
}
