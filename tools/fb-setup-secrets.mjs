#!/usr/bin/env node
/**
 * Gets the Facebook Page token and puts it into GitHub Actions secrets without
 * it ever being displayed, written to a file, or pasted anywhere.
 *
 * WHY THIS EXISTS: the documented flow ends with "find your page in the
 * /me/accounts response and copy its access_token". In practice that means the
 * token lands on a screen, gets selected, and ends up in a chat window or a
 * notes app — which is how two tokens got burned before this script was
 * written. The failure is not carelessness, it is that the flow asks a human
 * to handle a credential by hand for no reason. A machine can carry it from
 * one API to the other and never show it to anybody.
 *
 * What you still have to handle once: the long-lived USER token, pasted into
 * your own shell as an environment variable. That one is unavoidable, it is
 * local, and it becomes useless the moment the Page token is issued.
 *
 * THIS SCRIPT NEVER PRINTS A TOKEN. Not on success, not in an error, not in a
 * stack trace — Graph errors echo the token back inside the request url, so
 * every message is scrubbed before it reaches the console.
 *
 * Usage (run this in YOUR OWN terminal, not through an assistant):
 *
 *   PowerShell:
 *     $env:FB_USER_TOKEN="<long-lived user token>"
 *     node tools/fb-setup-secrets.mjs
 *
 *   bash:
 *     FB_USER_TOKEN=<long-lived user token> node tools/fb-setup-secrets.mjs
 *
 *   Add --page "Name" if the account administers more than one page.
 *   Add --dry-run to check everything without writing secrets.
 */
import { execFileSync } from 'node:child_process';

const GRAPH = 'https://graph.facebook.com/v21.0';
const TOKEN = process.env.FB_USER_TOKEN;
const DRY = process.argv.includes('--dry-run');
const wantIdx = process.argv.indexOf('--page');
const WANT = wantIdx === -1 ? null : process.argv[wantIdx + 1];

/* Every secret this script has ever seen, scrubbed out of any string on its
   way to a console. Cheap insurance against the one error path nobody tested. */
const secrets = new Set();
const scrub = s => {
  let out = String(s);
  for (const v of secrets) if (v && v.length > 8) out = out.split(v).join('<redacted>');
  return out;
};
const die = (msg, code = 1) => { console.error(scrub(msg)); process.exit(code); };

if (!TOKEN) {
  console.error('FB_USER_TOKEN is not set.\n');
  console.error('Get a LONG-LIVED user token from the Graph API Explorer (after the');
  console.error('"Extend Access Token" step), then run this in your own terminal:\n');
  console.error('  PowerShell:  $env:FB_USER_TOKEN="..."; node tools/fb-setup-secrets.mjs');
  console.error('  bash:        FB_USER_TOKEN=... node tools/fb-setup-secrets.mjs\n');
  console.error('Do not paste the token into a chat window, a file, or a commit.');
  process.exit(2);
}
secrets.add(TOKEN);

async function graph(pathname, params = {}) {
  const qs = new URLSearchParams({ ...params, access_token: TOKEN });
  let res, json;
  try {
    res = await fetch(`${GRAPH}${pathname}?${qs}`);
    json = await res.json();
  } catch (e) {
    die(`network error calling ${pathname}: ${scrub(e.message)}`);
  }
  if (!res.ok) die(`Graph API ${res.status} on ${pathname}: ${scrub(json?.error?.message || 'unknown error')}`);
  return json;
}

const me = await graph('/me', { fields: 'id,name' });
console.log(`signed in as: ${me.name}`);

const accounts = await graph('/me/accounts', { fields: 'id,name,access_token,tasks' });
const pages = accounts?.data || [];
if (!pages.length) {
  die('No pages returned by /me/accounts.\n' +
    'Either this account administers no Page, or the token was generated without\n' +
    'pages_show_list / pages_manage_posts. Re-generate it with those permissions ticked.');
}

console.log(`pages found: ${pages.length}`);
for (const p of pages) {
  secrets.add(p.access_token);
  console.log(`  - ${p.name} (${p.id})  tasks: ${(p.tasks || []).join(', ') || 'none'}`);
}

let page = pages[0];
if (WANT) {
  page = pages.find(p => p.name.toLowerCase().includes(WANT.toLowerCase()));
  if (!page) die(`No page matching "${WANT}". Names above.`);
} else if (pages.length > 1) {
  die(`\nMore than one page. Re-run with:  node tools/fb-setup-secrets.mjs --page "${pages[0].name}"`);
}

console.log(`\nselected: ${page.name} (${page.id})`);

/* CREATE_CONTENT is the task that actually permits posting. Without it the
   daily job fails at publish time with a permissions error that reads like a
   bad token rather than a missing grant — catch it here instead. */
if (!(page.tasks || []).includes('CREATE_CONTENT')) {
  die(`This page's token lacks CREATE_CONTENT, so it cannot post.\n` +
    `Re-generate the user token with pages_manage_posts granted for this page.`);
}
console.log('ok  CREATE_CONTENT granted');

/* A page token derived from a SHORT-lived user token expires. That failure is
   silent and delayed: posting works today and stops in about an hour. */
const dbg = await graph('/debug_token', { input_token: page.access_token });
const exp = dbg?.data?.expires_at;
if (exp && exp !== 0) {
  die(`This page token EXPIRES on ${new Date(exp * 1000).toISOString().slice(0, 10)}.\n` +
    `That means FB_USER_TOKEN was the short-lived token. Do the "Extend Access Token"\n` +
    `exchange first, then re-run this with the long-lived one.`);
}
console.log('ok  page token does not expire');

if (DRY) {
  console.log('\n--dry-run: everything checks out, no secrets written.');
  process.exit(0);
}

function setSecret(name, value) {
  try {
    execFileSync('gh', ['secret', 'set', name], { input: value, stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(`ok  ${name} written to GitHub Actions secrets`);
  } catch (e) {
    die(`failed to set ${name}: ${scrub(e.stderr?.toString() || e.message)}\n` +
      `Is the gh CLI authenticated for this repo? Try: gh auth status`);
  }
}

/* Piped through stdin, never as an argv element — process arguments are
   visible to anything that can list processes on this machine. */
setSecret('FB_PAGE_TOKEN', page.access_token);
setSecret('FB_PAGE_ID', page.id);

console.log(`\nDone. The daily workflow will start posting to "${page.name}" on its next run.`);
console.log('Now clear the user token from your shell:');
console.log('  PowerShell:  Remove-Item Env:FB_USER_TOKEN');
console.log('  bash:        unset FB_USER_TOKEN');
