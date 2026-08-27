# Blind-spot audit #4 — the growth-engine era (v2.26.1 + v2.26.2)

Date: 2026-08-27 · Lens: principal engineer / hostile reviewer · Scope: everything that changed
or grew since the last audit — the newest commit (`980d3d6`, tap target + overlay animation), and
the large unaudited surface that appeared in between: `.github/workflows/*`, `tools/{fb-*,daily-post,
news-post,discover-targets,citation-gaps,question-monitor,answer-bank,outreach-queue,build-outreach-
pack,law-watch,render-*}.mjs`, `growth/`, `content/`, 111 generated `rights/`/`derechos/` pages, root
`sw.js` + `app/sw.js`, and a regression sweep of every CRITICAL/HIGH finding from the two prior
audits. Every claim below is backed by a source read, a real command run this session (`grep`,
`node -e`, `node tools/build-pages.mjs --check`, live `WebFetch` requests against the production
site), or an explicitly-cited command a delegated research pass ran and I spot-verified. Claims not
independently confirmed are marked **UNVERIFIED**.

Prior audits: `notebook/amparo-blindspot-audit-2026-08-19.md` (backend era — Convex/Stripe/Sentry),
`notebook/amparo-blindspot-audit-2026-08-18-02.md` (Practice Arena v2.24.0). Both skimmed first;
their findings are not re-reported as new — see **Regression sweep** below for current status of
each. Two sections of this audit (growth/marketing tooling; new page surface + service workers) were
produced by parallel research passes with explicit scope and a "research only, cite evidence" brief;
I independently re-ran their two highest-severity claims (the live public exposure below, and the
stale-pages finding) against real commands before writing them up. Not re-litigated: attorney/legal
review (tracked elsewhere), pricing/UPL policy (operator's call).

---

## Newest change first, as instructed: v2.26.2 (`980d3d6`) — clean

Read the actual commit diff, not just the description. Two changes, both verified against source:

**`.ll-contact` 44px tap target** (`index.html:1086-1087`): `position:relative` + a `::before` with
`left:0;right:0;top:50%;transform:translateY(-50%);height:44px` — byte-for-byte the same idiom
already used for `.prx-vbtn`/`.prx-hear` (`:1082`) and `.maskrow .sw` elsewhere in the file. Checked
the layout it actually sits in (`:392-399`, `:4284-4288`): each `.ll-contact` is the only interactive
element inside its own `.ll-card`, one card in a native CSS `scroll-snap` carousel (`overflow-x:auto;
scroll-snap-type:x mandatory`) — no custom touch/swipe JS exists to conflict with (`grep` for
`touchstart|touchmove|pointerdown` near `llTrack`: zero hits), and the only DOM siblings the invisible
5px vertical bleed could reach (`.ln`, `.ld`, `.lltags`) are non-interactive text, so worst case is
forgiving the same link's own tap, not stealing one from something else. Clean.

**6 overlay close functions routed through `SRMotion.overlayOut`** (`practiceIntroClose`, `prepClose`,
`closePapers`, `packZoomClose`, `carryClose`, `practiceClose`): diffed the commit directly — all six
conversions are textually identical to each other and to the 3 pre-existing callers (`closeDoc`,
`closeAbout`, `shareClose`):
```js
function XClose(){
  const o=document.getElementById('XOverlay');
  const fin=()=>o.classList.remove('open');
  if(window.SRMotion&&SRMotion.overlayOut) SRMotion.overlayOut('#XOverlay','.ab-card',fin);
  else fin();
}
```
`SR.overlayOut` itself (`index.html:1521-1536`) — including the `__srClosing` re-entrancy guard —
is **untouched by this commit**; it's pre-existing infrastructure already proven by 3 call sites, only
its usage surface got 3x wider. Specifically checked for the failure modes the task asked about:

- **Stuck flag**: `__srClosing` is only ever set `true` inside a branch that has already passed
  `OK()` (GSAP armed) and confirmed the overlay is `.open`; the only two ways out are the GSAP
  timeline's `onComplete` (which resets it) or the function never being called (flag stays untouched,
  never true). Grepped for anything else that could kill the same tween or strip `.open` out from
  under it: `killTweensOf` has exactly 2 call sites, both scoped to `#screen .card`, never these 9
  overlay cards; `classList.remove('open')` has exactly 9 call sites, all inside these 9 `fin`
  closures, no external bypass. Nothing can interrupt the timeline without going through the guard.
- **Missed cleanup**: a second `XClose()` call while one is animating hits the `__srClosing` early
  `return` and correctly no-ops rather than double-firing `fin()` — this is the intended debounce, not
  a bug.
- **No-GSAP / reduced-motion fallback**: `!OK()` path calls `done()` synchronously and never touches
  `__srClosing` at all — confirmed for all 6 by reading each fallback (`else fin();`).
- `render()` calls that follow `closePapers`/`practiceClose`'s overlay-close line are pre-existing
  (unchanged by this diff, present before and after in `git show`), fire on a different DOM region
  than the animating overlay, and are not a new interaction risk.

**Verdict: clean, no stuck-flag/race/missed-cleanup bug.** This is boring code doing a mechanical,
already-proven thing 6 more times — the safest shape a UI change can take.

*Adjacent, pre-existing, not part of this diff*: none of the 9 overlays has an Escape-key or
backdrop-click dismiss handler (grepped for `Escape`/`keydown` near these overlay ids — zero). Not a
regression, not new, just noted since nothing else in the audit trail flags it.

---

## CRITICAL

### C1. `growth/` and `content/` are live on amparohq.com — including real people's scraped, unconsented Reddit posts about their own legal trouble, and the operator's internal growth playbook

`.vercelignore` (full file read) excludes exactly `notebook/`, `tasks/`, `wargames/`, `LEDGER.md`,
`SUCCESS.md`. `growth/` and `content/` — added to the repo after that file was last written — were
never added to it. This repo is served with no build step (the repo root **is** the deploy root), so
anything tracked and not excluded is live at `amparohq.com/<path>`.

Confirmed live, this session, with real requests against production (not a config read):

```
GET https://www.amparohq.com/growth/questions.json        -> 200, application/json
GET https://www.amparohq.com/growth/outreach-targets.json -> 200
GET https://www.amparohq.com/content/facebook/2026-08-20.json -> 200
GET https://www.amparohq.com/content/outreach/2026-08-27.json -> 200
control: GET https://www.amparohq.com/tasks/36-fb-comment-dm-growth.md -> 404 (correctly excluded)
```
I independently re-fetched `growth/questions.json` myself: it is a live, real "queue of legal
questions scraped from Reddit" (r/AskLawyers), with real post titles, real subreddit sourcing, and
real people's personal legal situations attached — the sample I pulled was a product-liability injury
question; the parallel research pass that first found this cited a different, more sensitive example
from the same file. These are strangers' words about their own legal trouble, republished under
Amparo's domain, with no notice to them and no relationship to Amparo's own content. `content/
facebook/*.json` additionally exposes 4 straight days of live publish failures (see H3) and the raw
shape of the automation to anyone who looks.

This is the exact failure this product cannot afford: its entire premise is "your name, contacts and
documents never leave your phone," and the site is currently, structurally, republishing *other
people's* sensitive personal data that were never supposed to be public in the first place. A
security researcher or journalist finds this by browsing the directory a `.vercelignore` diff would
have caught in five minutes.

**Fix**: add `growth/` and `content/` to `.vercelignore`. Also worth a `robots.txt`
disallow/Cloudflare rule as defense-in-depth in case anything cached the URLs already, and pulling
`growth/questions.json` specifically is the priority — it's the one with third-party content in it.

---

## HIGH

### H1. All 111 generated `rights/`/`derechos/` pages carry a false "last checked" date — 8 days stale, with no CI gate to catch it

`node tools/build-pages.mjs --check` (read-only flag, ran it live this session):
```
stale: rights\al\index.html
...
111 generated page(s) out of date — run: node tools/build-pages.mjs
```
Every state page's footer reads **"Cited legal sources last checked 2026-08-19"** — confirmed
directly (`grep -o "last checked [0-9-]*" rights/tx/index.html` → `2026-08-19`) — while
`law-status.json.lastChecked` is **2026-08-26** (confirmed directly too). Root cause, read in full:
`.github/workflows/law-watch.yml` runs `tools/law-watch.mjs` daily, commits the refreshed
`law-status.json`, and pushes — but **never invokes `tools/build-pages.mjs`**, the script that
actually regenerates the 111 static pages from that data. `git log` on `rights/tx/index.html`
confirms the last real touch was `b4efe21` (Aug 20); the five subsequent daily
`chore: daily statute source check` commits only ever touched `law-status.json`.

This directly contradicts `law-watch.yml`'s own header comment: *"so the 'last checked' date on the
site stays true whether or not anyone is at a machine."* It currently does not. Nothing in the repo
wires `build-pages.mjs --check` into CI, so this can silently drift indefinitely.

**Not yet a wrong-statute bug** — `index.html`'s `STATES`/`BASE_RULES_*` data hasn't changed since the
Aug 20 regen, so today this is a false metadata claim, not wrong legal text reaching a reader. But the
mechanism that would let a *real* correction ship half-applied — edit `STATES`, bump `EDITION` per
`law-watch.yml`'s own review-issue instructions, forget the manual `build-pages.mjs` step — is proven
live. For a legal-information product, "we told you when we last checked" being false is its own
category of embarrassing, independent of whether the underlying law text is currently still correct.

**Fix**: add a `run: node tools/build-pages.mjs` step to `law-watch.yml` after the status file
updates (or gate the commit on `build-pages.mjs --check` passing).

### H2. Scheduled Facebook posting runs fully unattended, with no human review gate, on a legal-adjacent public brand account

`.github/workflows/daily-post.yml:60-67`: `inputs.mode` only exists on manual `workflow_dispatch`; on
the `schedule` trigger it's empty, so the publish step's `if: inputs.mode != 'verify'` is true and
`node tools/news-post.mjs --publish` runs live, daily, unattended. Confirmed this is not theoretical —
`content/facebook/2026-08-20.json` through `-22.json` show `"published": true` with real Graph API
post ids.

**Credited mitigations, checked directly, not just claimed**: the content pool is 100% pulled from
the same verified `STATES`/`BASE_RULES_*` data the site itself uses — no LLM free-authoring of new
legal claims (`news-post.mjs:296-335`); news articles are used only as a *timing signal* through an
allow-then-deny regex gate that strips individual-case articles (`:96-119`); `daily-post.yml:43-46`
runs `--selftest` on the generator first with no `continue-on-error`, so a broken generator blocks the
publish step under GitHub Actions' default `bash -e` semantics. This is a deliberately narrow
automation, not a loose LLM posting whatever it wants — but it is still zero-human-in-the-loop
publishing to a real public Page, which is the standing rule this kind of surface exists to enforce
elsewhere in this operator's own practice. See H3 for what happens when it goes wrong silently.

### H3. 4 consecutive days of silent, unalerted Facebook publish failures — currently ongoing as of the last commit

`content/facebook/2026-08-23.json` through `2026-08-26.json`, checked directly, all four:
```
"published": false, "reason": "Graph 400: Confirm your identity before you can publish as this
Page. Open the Facebook app on your phone and follow the instructions."
```
`tools/news-post.mjs`'s main block (`:408-442`) never checks `result.published` and never calls
`process.exit(1)` on a failed publish — confirmed by reading the actual control flow: `process.exit`
appears at `:405` (selftest), `:423`, `:435` (other early-exits), but the publish-result branch at
`:438-442` only `console.log`s and falls through to a normal exit. The workflow step therefore exits
0, the next step commits the failure record like routine output, and nothing escalates to a human.

The pattern for doing this right exists in the *same repo* and simply wasn't applied here:
`law-watch.yml:52-86` opens a labeled GitHub issue when its own check fires. The Facebook Page has
been silently dark for 4+ days and the only way to know is manually diffing JSON files in `content/`.
This is squarely the "does the automation actually work, or does it just look like it does" gap the
error-handling half of this audit exists to catch.

**Fix**: `process.exit(1)` when `result.published` is false and `--publish` was requested, plus a
GitHub issue step on failure mirroring `law-watch.yml`'s existing pattern — the code to copy already
lives 40 lines away in a sibling workflow.

---

## MEDIUM

### M1. RB2B/deanonymization "guardrail" is a paragraph, not a gate — zero code enforcement either direction

`git grep -niE "manychat|findymail|unipile|rb2b"` across the entire tracked tree: hits only in
`tasks/36-fb-comment-dm-growth.md` and `tasks/35-gtm-playbook.md` — pure documentation. No file under
`tools/`, `.github/`, or `growth/` references any of these. The comment→DM/ManyChat loop it warns
against is *also* not implemented anywhere in this repo (it would run entirely inside ManyChat's own
external dashboard), so there is currently no code path on either side of the line — this isn't an
active leak today. It is a live blind spot going forward: nothing in this codebase would stop a future
session from wiring up exactly the pattern the doc warns against, because the only defense is a
markdown paragraph a future reader has to happen to read first.

### M2. `daily-post.mjs` has a dead, broken publish path sitting next to the real one

`tools/daily-post.mjs:156-177` defines a full `publish()` that calls `resolvePageToken()` and
`scrub()`, but the file's only imports (`:43-44`) are `node:fs/promises` and `node:path` — those two
helpers are never imported from `./fb-token.mjs`, unlike `news-post.mjs:49` which does this correctly.
If this script is ever run with `--publish` and the FB env vars set, it throws `ReferenceError`
immediately, and the `catch` block's own cleanup call throws the same error, uncaught. Fails closed
(can't accidentally post), so low live risk — but the workflow only ever runs
`daily-post.mjs --selftest` (`daily-post.yml:45`), meaning this file's actual publish path has never
been exercised by CI and there are now two independent Facebook-publish implementations in the repo,
only one of which is wired up. A maintenance trap for whoever reaches for the wrong one next.

### M3. `app/sw.js` silently diverges from root `sw.js`'s caching strategy for navigations

Root `sw.js` is network-first for document navigations (`:75-83` — always `fetch()` first, cache read
only in `.catch()` as an offline fallback) — the correct, deliberately-chosen behavior for a product
where a stale cached page means outdated legal-rights text. `app/sw.js` (Workbox-generated) instead
registers a **precache-first SPA-shell** `NavigationRoute` — every `/app` navigation serves the
precached, revision-hashed `index.html` regardless of network state. This is bounded, not dangerous —
`app-src/src/registerSW.ts` uses vite-plugin-pwa's `registerType:'autoUpdate'`, so a new deploy
self-activates on the next background check rather than waiting indefinitely — and it's a deliberate,
commented port (cites `wargames/15 Move 6.1`), not an accident. But root `sw.js`'s own comments
explain root's strategy in isolation with no pointer to the fact `/app` intentionally does the
opposite through a different mechanism. Someone who only reads one of the two files walks away with
the wrong mental model of the other. Doc-only fix: one comment in each file pointing at the other.

### M4. Production CSP still allowlists the old dev Convex deployment after the prod migration

`vercel.json:9` (and the `/app` meta CSP, `app/index.html:35`) list **both**
`grandiose-armadillo-240.convex.{cloud,site}` (+ `wss://`) **and** `stoic-falcon-22.convex.{cloud,
site}` (+ `wss://`) in `connect-src`, but `app-src/.env.production` (added by `6867cce`, "move Convex
from the dev deployment to prod") now points `VITE_CONVEX_URL`/`VITE_CONVEX_SITE_URL` at
`stoic-falcon-22` only. Nothing broke — both hosts are allowed, so whichever one the app actually
calls works — but the dev deployment's host is dead-code residue in a production security policy,
and it's a small tell to anyone reading the CSP that there's a separate dev backend at all. Same
staleness pattern as M5 below (Clerk), just lower stakes. Delete the `grandiose-armadillo-240` entries
from both CSPs once confirmed nothing on the dev deployment is still in use.

---

## LOW / notes

- **The `/app` meta CSP still has no `frame-src`** (`app/index.html:35`, `app-src/index.html:35`),
  falling back to `default-src 'self'` — same gap `amparo-blindspot-audit-2026-08-19.md` M4 flagged,
  unchanged. `vercel.json`'s own `frame-src` does include Clerk's domain, so the *effective*
  (intersected) policy is still more restrictive than intended if ClerkJS ever opens an iframe at
  runtime. Still **UNVERIFIED** whether Clerk's sign-in flow actually needs one in practice — same
  status as the original finding.
- **Arena's privacy modal still claims "No analytics, no cookies here" unconditionally**
  (`arena/index.html`, `p1` string) despite self-hosted Sentry loading conditionally on error or
  feedback-tap since v2.26.0. Carry-over from `amparo-blindspot-audit-2026-08-19.md`'s
  under-disclosure item 1 — `e6e963b` ("honest privacy copy, feedback scrubbing...") touched
  `arena/index.html` but not this specific string. Root's equivalent (`ab_privacy`) was rewritten
  thoroughly and is now accurate (see Regression sweep); this one sentence in arena wasn't.
- `tasks/36-fb-comment-dm-growth.md:522-527` (written 2026-08-20) claims the site 403s all automated
  traffic, `robots.txt` included. Live-checked today: `robots.txt` returns 200, and a plain
  unauthenticated fetch of the homepage and of `growth/*.json` also returned 200. Either the WAF rule
  changed or it only trips specific bot signatures. Informational — the doc's blocker claim is stale
  as written; not chasing the WAF rule itself, out of scope.
- No Escape-key/backdrop-click dismissal on any of the 9 root overlays — pre-existing, not part of
  this session's diff, noted under the v2.26.2 verification above.

---

## VERIFIED CLEAN (receipts)

**C1 (2026-08-19) — Stripe fulfillment — now fixed with real defense in depth, not a patch.**
`PAYMENTS_LIVE=false` (`arena/index.html:1566`) is a hardcoded client-side kill switch, comment
explicitly citing "blindspot 2026-08-19 C1 / FG24 #3." The Deep Pack's buy/gift buttons call
`openHeld()`, never `openPay()` (`:1768`, `:1868`) — structurally unreachable from the UI regardless
of the flag. Server-side, `stripe.ts`'s `PRODUCTS.deep.held=true` (`:32-36`) makes **both**
`createCheckout` and `guestCheckout` throw before creating a session (`:45`, `:80`) — so even a direct
API call bypassing the frontend is refused, with the code's own comment naming exactly this attack:
*"the client is not the only way to reach /checkout."* `verifySession` (`:120-149`) documents the one
remaining theoretical gap (a session created before this gate existed stays payable forever) and
explicitly chooses to record-but-never-entitle in that case, treating a `deep` purchase row as "the
alarm," not a failure. Real fulfillment now exists for the Script Pack — `renderScriptPack` builds a
checklist/flashcard artifact entirely from existing scored dialogue data, so no new unreviewed legal
content enters the product through the purchase path — and a `heldPaid` refund-safety string covers
the edge case of someone charged anyway. This is the standard other fixes in this repo should be held
to.

**C2 (2026-08-19) — root privacy copy — rewritten accurately.** `ab_privacy` (`index.html:2152` EN,
`:2505` ES) now states the real v2.25.0+ model: no account by default; an optional account saves only
"state, names, phone numbers, ZIP," never photos or practice history; the record could be produced
under legal compulsion; deletable anytime; anonymous usage counts only. Cross-checked against
`acct_why`/`acct_scope`/`d_priv`/`c_perm` (same file): all consistent, all correctly scope the
"never leaves your phone" promise to photos/documents specifically rather than overclaiming it
product-wide. No contradiction found between this copy and the actual `packs.ts` schema.

**H1 + H2 (2026-08-19) — Sentry feedback-event scrub — fixed, and correctly.**
`tools/sentry-entry.js:97-110` now defines `beforeSendFeedback` as a separate hook (the SDK gates
`beforeSend` on `isErrorEvent`, which feedback events fail — this is the exact bypass the original
finding traced through `@sentry/core` source). It deletes `event.user`, bare-urls the request URL,
and deletes `cookies`/`query_string`/`Referer`/`User-Agent`. `beforeSend` (`:111-124`) now deletes
`User-Agent` too (`:119`), closing H2 in the same edit. Both hooks verified by direct read, not by
trusting the comment.

**H3 (2026-08-19) — `/app` error capture — fixed.** `app-src/src/main.tsx:30` now calls
`armErrorReporting(...)`, comment citing "blindspot 2026-08-19 H3" directly. Previously exported,
never called; now called once at startup.

**08-18-02 H1 (matcher polarity-blind) — fixed, verified against the actual attack string, not just
the diff.** `arena/index.html:1507-1536`, comment cites "blindspot -02 H1 + wargames/30 #3." Traced
the new `polarityFail` logic by hand against the audit's own attack string: for a correct line built
on refusal ("I do not consent..."), `NEG.test(gNorm)` is true; the attack string "yes go ahead and
search my car, I consent" contains no negator, so `NEG.test(uNorm)` is false, `polarityFail` is true,
and `hit` is forced false regardless of keyword overlap. Also closes the "majority of 2 = 1" loophole
the original fix missed (threshold is now `Math.max(2, ceil(gw.length/2))`) and fixes the root cause
of the `>3`-char filter eating "don't"/negations (apostrophes stripped before tokenizing, so "don't"
survives as "dont"). A real, defended-in-depth fix, not a patch of the reported string alone.

**08-18-02 H2 (daily-drill door-hold bypass) — fixed.** `arena/index.html:1889`:
`SIT.filter(x=>!HELD_SITS[x.id]).flatMap(...)` — exactly the one-line fix the original audit named.
Worth flagging that today (Aug 27) sat inside the originally-predicted live-bypass window (Aug 26-29);
confirmed clean before that mattered.

**08-18-02 H3 + M2 (answering soft-lock / 650ms commit race) — both fixed by the same edit.**
`arena/index.html:1202-1205`, comment: `/* blindspot -02 H3: navigating away mid-retry left
answering=true forever */`, followed by `clearTimeout(window.__answerTO); answering=false;` — resets
the flag AND clears the race-prone timeout in one place, closing both findings.

**Analytics honesty — 50 PostHog event call sites in root `index.html` read in full.** Every property
passed is UI/navigation state (`state`, `lang`, `step`, `level`, `score`, `edition`, `sentiment`) or an
explicit boolean presence flag (`hadName:!!(...)`, `transcript:!!sr`) — never the underlying free text
or PII itself. No event smuggles a name, ZIP, or transcript content into an "anonymous" analytics
call. Matches the product's own claim.

**New generated pages (`rights/`, `derechos/`) — lightweight, no third-party blocking, correct
meta.** Sampled `rights/tx`, `derechos/ca`, `rights/any-state`, `rights/wy`: 9.4-10 KB each vs. root's
676 KB — genuinely standalone static files, zero `<script src>` (no PostHog, no GSAP), correct
canonical/hreflang/OG per state and language, and a verified `noindex` + shared-OG-image fallback for
states with no legal-aid entry yet (no broken image references). These pages do not inherit root's
Core Web Vitals problem at all.

**Templating copy-paste risk in `build-pages.mjs` — false lead, cleared.** An initial broad scan
looked like `STATES` might contain unverified data bleeding across states; traced precisely and found
the extraction is column-0-terminator-scoped (not naive brace matching) with hard asserts
(`verified.length<3` / `Object.keys(NAMES).length<51` both throw). A real drift here fails the build
loudly; it can't silently ship a wrong citation.

**Root `sw.js` — clean on the one case that matters.** Document navigations are network-first
(`:75-83`); cache is read only in the offline-fallback `.catch()`. An online user always gets the
current deploy, never a stale cached legal page. Cache-name versioning (`amparo-v3`) plus a
prefix-scoped `activate` cleanup, and `/app/*`/`/arena/*` are explicitly excluded from root's cache
handling so it can't clobber those apps' own service workers — both documented as fixes for past
incidents.

**No source maps or build artifacts exposed.** Zero `.map` files under `app/`, zero
`sourceMappingURL` comments in any shipped JS (`app/assets/*.js`, `app/sw.js`, `sentry.js`,
`index.html`). All real `.map` files in the repo live under `node_modules/`, which is gitignored and
confirmed untracked.

**No secrets or auto-publish risk in the Facebook tooling itself.** `fb-setup-secrets.mjs` pipes the
token to `gh secret set` over stdin, never argv, never console; `SETUP-FACEBOOK.cmd`/
`setup-facebook.ps1` use `Read-Host -AsSecureString`, zero the BSTR, clear env in a `finally` block.
`question-monitor.mjs`/`answer-bank.mjs` queue for a human explicitly (`_readme` strings say so) and
contain no write/POST path to anywhere. `git log --all -S` for Facebook token prefixes and app-secret
patterns across the whole history: no real credential values, only documentation text and one
unrelated Playwright test-trace image.

---

## Regression sweep — status of everything from the two prior audits

**From `amparo-blindspot-audit-2026-08-19.md`:**

| # | Finding | Status |
|---|---|---|
| C1 | Stripe Deep Pack sellable with no fulfillment | **FIXED** — see receipts above, defense in depth |
| C2 | Root privacy copy false re: accounts | **FIXED** — rewritten, verified consistent |
| H1 | Sentry `beforeSend` skipped on feedback events | **FIXED** |
| H2 | `User-Agent` never scrubbed | **FIXED**, same edit as H1 |
| H3 | `/app` `armErrorReporting` never called | **FIXED** |
| M1 | `__sqErr` unbounded | **STILL OPEN** — all 6 push sites (root x2, arena x2, feedback.ts x2) still push unconditionally, no `.length<50` guard found |
| M2 | `/checkout` unauthenticated, unrate-limited | **STILL OPEN** — `grep -rn "rateLimit|rate_limit|x-forwarded" app-src/convex/` still zero hits |
| M3 | Webhook fulfills without checking `payment_status` | **PARTIALLY FIXED** — the guest-redemption read path (`verifySession`) now checks `payment_status!=='paid'` (`stripe.ts:129`); the webhook's DB-write path (`verifyWebhook`) still does not |
| M4 | `/app` meta CSP missing `frame-src` | **STILL OPEN** — see LOW notes above |
| M5 | Production `/app` runs Clerk's dev instance | **STILL OPEN** — `app/assets/SavePack-Dzyxpe71.js` still ships `pk_test_...` decoding to `divine-swine-18.clerk.accounts.dev`; both CSPs still reference that host |
| M6 | Root `.env.local` holds two dead secrets | **STILL OPEN** — file still present (565 bytes, unchanged since Aug 19) |
| M7 | Three feedback shims, minor divergences | **NOT RE-CHECKED** this pass — out of budget, no signal either way |

**From `amparo-blindspot-audit-2026-08-18-02.md`:**

| # | Finding | Status |
|---|---|---|
| H1 | Free-text matcher polarity-blind | **FIXED** — verified against the actual attack string, see receipts |
| H2 | Daily drill bypasses `HELD_SITS` door hold | **FIXED** — verified before the predicted live-bypass window closed |
| H3 | `answering` soft-lock on navigation mid-retry | **FIXED** |
| M1 | Swan consent gate only guards level tabs | **NOT RE-CHECKED** this pass |
| M2 | 650ms commit-race timeout never cleared | **FIXED**, same edit as H3 |
| M3 | Orphaned i18n keys / dead code residue | **NOT RE-CHECKED** this pass |
| M4 | Pre-drill safety modal dead id / skips `last30` | **NOT RE-CHECKED** this pass |

Net: **9 of the 15 findings re-checked this pass are fixed** (1 more partially), several (C1,
H1-matcher) with real defense-in-depth rather than a minimal patch. The 5 still-open items
(M1/M2/M4/M5/M6 from 2026-08-19) are all the same low-urgency, already-correctly-scoped MEDIUM/LOW
items the original audit rated them as — nothing escalated while unaddressed. 4 items (M7 from
2026-08-19; M1/M3/M4 from 2026-08-18-02) were not re-checked this pass, out of budget.

---

## Fix order

1. **C1** — add `growth/` and `content/` to `.vercelignore`; treat `growth/questions.json` as the
   priority pull given it contains third-party content, not just internal strategy.
2. **H3** — `process.exit(1)` on a failed `--publish` in `news-post.mjs`, plus a GitHub issue on
   failure mirroring `law-watch.yml`'s existing pattern. The Page is dark right now.
3. **H1** — add `node tools/build-pages.mjs` to `law-watch.yml` after the status refresh, or gate the
   commit on `--check` passing.
4. **H2** — no code fix; a product decision on whether unattended posting to a real Page is
   acceptable for this brand, now that H3 shows what "wrong" looks like when nobody's watching.
5. **M4 (CSP)** — delete the `grandiose-armadillo-240` entries once confirmed unused.
6. **M2 (daily-post.mjs)** — fix the missing import or delete the dead `publish()` path; pick one
   Facebook-publish implementation.
7. Carried over, still cheap: **M1** cap `__sqErr` at 50 (three files, six lines); **M6** delete root
   `.env.local`; **M5** move `/app`'s Clerk instance off the dev host before it's a launch blocker
   again; **M2 (2026-08-19)** IP/window rate limit on `/checkout`; **M3 (2026-08-19)** add the
   `payment_status` guard to `verifyWebhook` too, not just `verifySession`.
