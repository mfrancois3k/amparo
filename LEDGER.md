# LEDGER.md · wargame runs

## 36 — Deep Pack hold + the Script Pack fulfilment bug it uncovered

- **Date:** 2026-08-20 · **Commits:** `60806af`, `6d1147c`, `1ae8eb9` (local, not pushed)
- **Trigger:** operator asked to "fix the Deep Pack renderer". The right answer turned out to be
  *don't build it* — and looking for it surfaced a worse bug in the product that already sells.

### The Deep Pack is held, not built

Deep Pack ($6.99) was purchasable with no renderer anywhere in the repo. Two of its four promises
cannot be written safely today: **courthouse directions** is per-state factual data that exists
nowhere (inventing it sends someone to the wrong building on a court date), and the **ICE addendum**
would draw on the door-knock drill that the arena itself gates behind `HELD_SITS={door:1}` pending
attorney + DV-clinician review. Content too unreviewed to give away free must not be sold — which is
what `notebook/amparo-accounts-payments-plan-2026-08-19.md` already said: *charging the most-scared
user for the highest-stakes information is a betrayal.* This is blindspot **C1** and the choice
`tasks/34` left open, resolved as its stated default. Held rather than deleted, because the plan
expects it to survive as the flagship SKU once written.

### The bigger find: the paid Script Pack rendered nothing on the default scenario

`packDataFor` resolved decks by prefix-matching SCEN ids against the situation id. True for
`door`/`pass`/`trap`/`step`; false for `traffic` (routine/intense/tension/hard) and `last30` (l301…).
`traffic` is the **default** situation, and the redeem handler passes exactly that id — so the most
common $3.99 purchase produced only *"That scenario has no pack yet."* Now resolved via `SIT.levels`;
all six situations render in both languages.

Second: entitlements were **write-only**. `hasEntitlement` had zero callers repo-wide and
`renderScriptPack` was reachable from exactly one place — inside `/redeem`, moments after the Stripe
redirect. Close the tab and the pack you paid for was gone for good. Added the missing read.

### Defence in depth (from the blind-spot audit)

The `held` gate initially guarded only checkout *creation*. `/checkout` is public, CORS `*`,
unauthenticated — a session for a held product can be created by anyone reading the page source, and
one created before the gate deploys stays payable indefinitely. `verifySession` now reports `held`,
`/redeem` forwards it, and the arena refuses to grant a dead entitlement, telling the buyer they
should not have been charged. The webhook still records the purchase on purpose: the trail is what
makes a refund findable, and a `deep` row while `deep` is held **is** the alarm.

### Test blind spot closed

`test-fulfilment.mjs` passed 16/16 throughout the traffic bug — it only asserted `packDataFor`
*exists*, via regex, and never resolved anything. Now 24/24, with per-situation resolution checks.
Limit worth knowing: these are static checks on a file the suite does not execute.

### Ordering hazard — matters before the Stripe key goes on

**`npx convex deploy --prod` must run BEFORE `STRIPE_SECRET_KEY` is set on prod.** Otherwise prod
accepts `deep` and can take a real charge for it via a direct POST, no browser needed.

### Open / operator decisions

- Refund copy now promises a refund to anyone charged for a held product — confirm the wording.
- Focus group's remaining asks: no cadence on "in review"; the free-pack redirect inside the held
  modal isn't clickable; the peek grid shows an ethics-gated tile and three merely-unwritten ones as
  equally "coming soon".
- Practice-module findings (separate from packaging): no non-simulated checklist route for
  PTSD-sensitive users; Hard Mode consent uses a bare `confirm()`; "held" means two different things
  across the app; the safety checklist never re-anchors at Hard Mode.

## 35 — GTM playbook (operator layer)

- **Date:** 2026-08-20
- **Doc:** `tasks/35-gtm-playbook.md`
- **Trigger:** operator asked to translate a "Claude Code as a sales/marketing machine"
  course into an executable plan for Amparo — order of operations, copy-paste prompts,
  blindspots, money map, and the skills/routines to automate it.
- **Not a wargame:** no move-by-move simulation, no red-team pass. It is the operator
  layer on top of wargame 32 rev 4, which stays the plan of record.

### What it establishes

- Two audiences, one outbound target: partner **organizations** only. End users are never
  emailed, enriched, or listed. Volume cold-email, lookalike sending domains, and Meta ads
  are rejected with reasons (§5 blindspots 1–3, 6).
- Money ranked by time-to-first-dollar: agency work (no gate) → Script Pack → org bulk
  licensing → sponsorship → grants. Attorney sign-off gates everything but the first.
- The reviewer Amparo needs is a **state criminal-defense / traffic attorney**, not an
  immigration attorney — the published material is stop-and-identify and traffic law.
- Vercel Hobby (non-commercial) is a revenue blocker, not a chore, and must move before
  `PAYMENTS_LIVE`.
- 22 blindspots with fixes; §6 specs three skills and two routines, incl. a **re-sign
  trigger** so a statute diff in a signed state cannot leave an attorney's name over
  unreviewed text.

### Discovered during recon

- **Track E is already built and untracked.** `tools/render-kyr-card.mjs` (283 lines,
  `--selftest` byte-matching every quoted line against `arena/index.html`) plus `cards/`
  — WhatsApp 1080×1080 EN/ES and the Avery 5371 ten-up duplex print PDF. Phase 2 in the
  playbook was rewritten from "build" to "review and ship"; blindspot 21 flags the loss
  risk. Deliberately NOT swept into this commit.
- The close-out ritual was a silent no-op: `.claude/skills/amparo-loop` step 5 wrote to
  the `amparo` notebook, which is full at 52 sources, with the broken `--file` flag.
  Repaired in this commit — growth notebook + `--text` + `brain.js refresh`.

## 32 — Facebook as Amparo's primary traffic engine

- **Date:** 2026-08-19
- **Mission brief:** `tasks/32-facebook-traffic-engine.md`
- **Draft:** `wargames/32-facebook-traffic-engine.md`
- **War-gamer:** Opus 5 · **Intended executor:** Sonnet + Michael (HUMAN ONLY moves)
- **Recon inputs:** root `index.html`, `arena/index.html`, `app-src/convex/stripe.ts`,
  `CHANGELOG.md` v2.26.1, `wargames/31-paywall-meets-ladder.md`, Meta SIEP policy,
  Notion "Facebook Automation Guide", `/watch-bulk` digest of 2 videos.

### Self-grade

All 8 `SUCCESS.md` points pass; #8 with a stated caveat (the HUMAN ONLY block is
deliberately not model-executable — the executor stops and flags). Full table in the
draft's §8.

### Patches from the red-team pass

| Attack | Outcome | Patch |
|---|---|---|
| "Skip the organic lab, just run ads" | Failed | None needed — the arithmetic of Facts 1+2 defeats it |
| "Move 3's framing is a dodge that fails review anyway" | **Landed** | Meta identity verification (H3) moved forward from contingency to unconditional prerequisite; Move 3's fork rewritten to forbid softening copy further; Move 8 relabelled from "confirm the framing works" to "submit to find out" |
| "`{{CPL_CEILING}}` is invented" | **Partly landed** | Ceiling marked as placeholder-with-rationale, not a measured number; Move 10 explicitly forbids raising it to justify spend |

### Open placeholders

| Placeholder | Default in use | Owner | Blocks |
|---|---|---|---|
| `{{DAILY_BUDGET}}` | $20/day | Michael (H7) | Move 9 |
| `{{CPL_CEILING}}` | $3.00/email — **unmeasured, see R9** | Michael | Move 10 |
| Page name (topic, not "Amparo") | — | Michael + Move 5 branding prompt | Move 5 |
| Disclaimer entity (Route B only) | — | Michael (H4) | Move 9 |
| Sending domain / from-address | — | Michael (H8) | Move 4 |

### Known ceilings recorded during recon

- Root `index.html` is 669 KB as a single page. Not refactored for this campaign; logged as a
  landing-performance risk with Move 2's Route B as the escape hatch.
- `PAYMENTS_LIVE=false` and no Script/Deep Pack artifact exists — the campaign's revenue
  objective is blocked on fulfilment, not on marketing.
- No owned social accounts exist (`grep` finds only `facebook.com/sharer`, `x.com/intent`).
  Starting from zero followers is confirmed.
- R6 (does Meta classify Amparo as SIEP?) is unsettleable from outside Meta. Move 8 is the
  check. No other move assumes an answer.

### Execution status — 2026-08-20

| Move | State | Note |
|---|---|---|
| A1 attribution | **done** | first-touch `ft_*` super-properties; two send-time bugs found and fixed in verification |
| A2 publishing surface | **done** | 1 url -> 111 pages, 51 jurisdictions, 63 indexable |
| A3 publisher posture | **done** | /about/ + /how-we-verify/ EN+ES; states the attorney gap outright |
| A4 RSS | **done** | 29 items, English only, discovery link on every page |
| B1 outreach discovery | built, dormant | needs `FIRECRAWL_API_KEY`; exits 0 without it |
| B2 republisher crawl | built, dormant | same key; also needs a landed placement to crawl for |
| B3 citation mining | **live** | weekly, no key required, 26 claims on first run |
| C1 two pieces + pitches | **HUMAN ONLY** | trade press blacklists detected-AI submissions, permanently |
| C2 email capture | **BLOCKED** | no `RESEND_API_KEY` and no sending domain (H8). Offer is "email me my link" — recon settled that no PDF generator exists |
| C3 Facebook page | **done by operator** | page live, secrets stored, posting proven via unpublished draft |
| C4 aggregator submissions | **HUMAN ONLY** | ~1 hour, once; Feedly needs none — it ingests A4's feed |
| D1-D6 paid | deferred | unchanged; runs only if the operator chooses to spend |

**Open blocker:** the stored Facebook token is `type USER` expiring 2026-08-20
04:00 UTC. All scopes correct, posting verified working. The browser "Extend
Access Token" step never applied across four attempts — the Access Token Tool
renders the extended token BELOW the button while the original stays above it.
Resolved by moving the `fb_exchange_token` exchange into
`tools/fb-setup-secrets.mjs`, driven by `SETUP-FACEBOOK.cmd`, which collects
the App Secret without displaying it.

**Recon closed this round:** R1, R2, R4 (no PDF generator — `window.print()`
only), R5 (`STATES` is a clean literal), R6 (only TX/GA/NY are VERIFIED),
R7 (no search API key configured), R8 (Education website category).

### Revision 3 — execution status, end of 2026-08-20

Revision 2 was graded before anything ran. This is the state after execution.
Full narrative in `wargames/32-facebook-traffic-engine.md` §13.

| Move | State | Evidence |
|---|---|---|
| A1 attribution | **live** | first-touch `ft_*` super-properties; two send-time bugs found in verification and fixed |
| A2 publishing surface | **live** | 111 pages, 51 jurisdictions, 63 in sitemap, 48 noindexed as too thin |
| A3 publisher posture | **live** | `/about/` + `/how-we-verify/` EN+ES; states the attorney gap outright |
| A4 RSS | **live** | 29 items, English only, discovery link on every page |
| B1 outreach discovery | built, **no yield yet** | keyless via Marginalia; last run throttled, first real yield expected on the Monday cron |
| B2 republisher crawl | built, **idle** | keyless via GDELT; nothing to crawl for until a placement lands |
| B3 citation mining | **live** | weekly, no key, 26 claims on first run |
| C1 two pieces + pitches | **not started** | HUMAN ONLY — trade press blacklists detected-AI submissions |
| C2 email capture | **blocked** | no sending domain (H8), no `RESEND_API_KEY` |
| C3 Facebook page + posting | **live** | page created, token stored, posting verified, generator replaced — see below |
| C4 aggregator submissions | **not started** | HUMAN ONLY, ~1 hour once; Feedly needs none, it ingests A4 |
| D1–D6 paid | **never entered** | no ad account, no spend; **Move D2's SIEP test was never run**, so Fact 6 stays a live unknown |

### Patches this round

| What | Why |
|---|---|
| Move C3's generator replaced | The statute-quote format was factually perfect and would have got no reach. The honesty constraint had been allowed to determine the creative. Replaced with scenario-led posts timed by news, on the rule that the news picks WHICH scenario and never supplies WHAT is said. |
| Track B search provider | Firecrawl (key) → Marginalia + GDELT (keyless). Seven providers measured against a CI runner; five were blocked outright. |
| Two new abort conditions | Never react to an individual case; never advertise a held drill (`HELD_SITS={door:1}`). |
| Six unplanned tools | Token handling consumed most of the execution time and burned several credentials. See §13c. |
| `verify` mode on the daily workflow | So a new token's first act is an unpublished draft, not a surprise public post. Caught wrong-token storage three times. |

### Open items, ranked by what they block

1. **H5 attorney sign-off — unchanged and now larger.** In revision 1 it blocked ad spend. It now
   sits behind 63 indexable pages and a daily post, all pointing at TX/GA/NY content that has not
   met `state-law-matrix.md`'s own standard. `/how-we-verify/` states the gap honestly; stating it
   is not closing it.
2. **H8 sending domain** — one DNS setup unblocks C2 entirely.
3. **`/arena/` deep links** — no `URLSearchParams` in the file, so every drill CTA lands on the
   menu rather than the drill. Highest-value conversion fix outstanding.
4. **C1 / C4** — the one-time human sprint. Everything upstream of it is now built.

### Revision 4 — after research, 2026-08-20

Three positions from revisions 1–3 were contradicted by evidence and are now
reversed. Full panel and reasoning in `wargames/32-facebook-traffic-engine.md`
§14.

| Was | Is | Evidence |
|---|---|---|
| Facebook Page is the primary social channel | The **forwardable card** is what travels; WhatsApp is where | ILRC 10M Red Cards since Nov 2024 vs Notifica app ~8,500 first-week installs, discontinued Feb 2025; 54% of Latino adults use WhatsApp |
| Compete in search bilingually on equal footing | **Spanish is the opportunity**; English is unwinnable unfunded | Live SERP: `know your rights traffic stop Texas` = 7 law firms + 1 course vendor, zero nonprofits. Spanish equivalent = PDFs, a community-college file, and a Peruvian news site ranking for a Texas query |
| Email the 32 orgs Amparo cites | **Local affiliates**, timed to Labor Rights Week (last week of August) | ILRC verbatim: "The ILRC does not vet other production sources or content." CLINIC has 290 field offices in 47 states |

**New tracks:** E (forwardable card — E1 WhatsApp-shaped image, E2 ILRC-format
3.5×2in print PDF, E3 WhatsApp Channel) and F (ten accounts the operator must
open personally, F1–F10).

**Shipped this round:** the Script Pack artifact and guest fulfilment. A buyer
now receives a printable checklist and flashcards built from the drill they
finished, and `{CHECKOUT_SESSION_ID}` plus server-side verification ties a
guest's payment to their browser. `PAYMENTS_LIVE` stays false and
`tools/test-fulfilment.mjs` asserts it stays false while `REVIEW.attorneys` is
empty — *FTC v. DoNotPay* (Jan 2025, $193,000) turned on selling legal output
with no attorney retained to test accuracy.

**Two constraints discovered that were not in any earlier revision:**
- MCP servers cannot run in GitHub Actions. They are interactive; this
  project's automation is cron. MCP belongs in the analyse loop, not publish.
- Vercel Hobby is non-commercial only. A live paid pack makes it a $20/mo
  requirement, which is an argument for mirroring to Cloudflare Pages.

## 33 — Core Web Vitals fix pass (root + /app)

- **Date:** 2026-08-20
- **Mission brief:** `tasks/33-core-web-vitals-fix-pass.md`
- **Draft:** `wargames/33-core-web-vitals-fix-pass.md`
- **War-gamer:** Sonnet 5 · **Intended executor:** Sonnet, mechanical moves (1, 3, 4a, 5) droppable
  to Haiku; anything forking toward `/app`'s content-extraction pipeline or `sw.js` cache logic
  escalates to Opus instead — full table in the draft's model-routing section.
- **Recon inputs:** root `index.html` (byte size, `<img>`/`<script>`/`<h1>` patterns via grep, not a
  full read), `app/index.html` (built output), `vercel.json` (live CSP), `HANDOFF.md`'s bundle-size
  table + `/app` extraction invariant, this operator's global `web/performance.md` /
  `web/security.md` rules, `git status`, and a `/watch-bulk` digest of 2 videos — **both videos
  failed to download** (YouTube blocked yt-dlp with 403/429 on stream + captions, confirmed
  persistent on one retry); only creator-written descriptions and the operator's own pre-existing
  notes were usable. One video was on-topic (Income Stream Surfers, Claude-Code-driven CWV/SEO fix
  loop); the other (AI Workshop, Claude Fable 5 content-automation) turned out unrelated and was not
  folded into this mission.

### Self-grade

All 8 `SUCCESS.md` points pass; #8 with the same caveat pattern as mission 32 — `git push`/deploy is
a deliberate HUMAN CONFIRM step, not a gap in blind-executability. Full table in the draft's §"Self-
grade against SUCCESS.md".

### Patches from the red-team pass

| Attack | Outcome | Patch |
|---|---|---|
| "Skip PSI, the gaps are already visible by grep" | Partly landed | Split Move 4 into 4a (zero-risk, runs immediately) and 4b (PSI-prioritized, waits on triage); Moves 1-2 stay mandatory regardless |
| "Executor will re-add `async` to a script that already has it" | Failed | Recon already confirmed GSAP's `async`+SRI is correct; no patch needed |
| "PSI/Lighthouse numbers are noisy enough to fake a win" | **Landed** | Move 6 now requires a 3-run average per surface per device, written into the move itself |
| "Nothing stops sweeping the 4 pre-existing uncommitted files into this commit" | **Landed** | Move 3's abort condition and Move 7's counter-move both now name the four files explicitly |
| "A worktree might not actually isolate from those 4 files" | **Landed** | Move 3 now explains the worktree-vs-plain-branch distinction and requires confirming which applies before Move 4 |

### Open placeholders

None — this mission is fully specified from repo recon + this operator's existing standing perf
targets (LCP<2.5s / INP<200ms / CLS<0.1 / FCP<1.5s / TBT<200ms). No operator-only unknowns block
execution, only the overall short-circuit: **Moves 3-7 only run if Move 1's baseline data actually
shows a gap** — Moves 1-2 are mandatory regardless, near-zero-cost recon.

### Known ceilings recorded during recon

- Root `index.html` is 675,145 bytes (~659 KiB) as of `2aff921` — up from HANDOFF's recorded 545.5 KB
  at v2.21.2 one week earlier. No bundler, no build step; "reduce unused JS"-class findings are
  structural, not a quick fix (tagged out-of-scope by default, see Move 2).
- No PageSpeed/Lighthouse data has ever existed for this project before this mission's Move 1 —
  the real size of the opportunity is currently unknown.
- Live CSP (`vercel.json`) already ships `'unsafe-inline'` for script-src/style-src, not
  nonce-based — pre-existing, out of this mission's scope to change, but flagged as a standing
  tension with this operator's own security-rule preference.
- The 94.5% funnel drop (72 landed → 4 picked a state) has never been diagnosed as
  performance-caused (autocapture is off by design). This mission treats CWV as a reasonable bet,
  not a proven fix for that funnel — see the draft's value-maximization verdict.

### Execution status — 2026-08-20

| Move | State | Note |
|---|---|---|
| 1 | done, via documented fallback | Live site unmeasurable — **two independent blockers, both verified.** (a) Cloudflare WARP on the workstation blocks Vercel's whole IP range: `vercel.com`/`nextjs.org`/`sdk.vercel.ai`/`amparohq.com` all fail TLS in ~0.07 s while `example.com`/`google.com` return 200. This — not a WAF — caused the "Chrome interstitial" errors; an earlier entry blamed a WAF on this evidence and **was wrong**. (b) The live site genuinely returns **HTTP 403 to automated traffic**, verified from an external network; `robots.txt` is 403 too, so it's blanket. Not in `vercel.json` (grep clean), DNS straight to Vercel with no Cloudflare proxy → dashboard Firewall/Bot Protection. Could not read the setting (MCP can't list projects, no CLI auth). Measured instead via Move 6's own authorized fallback: local Lighthouse against a local static server, 3 runs × 2 form factors × 2 branches = 12 runs. |
| 2 | done | Real triage on real data — `notebook/amparo-cwv-findings-2026-08-20.md`, 12 findings scope-tagged. Baseline mobile: **perf 48, LCP 6,034 ms, TBT 923 ms, CLS 0, FCP 4,087 ms**; desktop passes everything (95 / 1,245 / 107 / 0 / 750). CPU-bound — worst possible split for a phone-first product. |
| 3 | done | Worktree `../amparo-cwv-fix` on `cwv-fix-pass`, clean checkout. |
| 4a | done | Preconnect for `cdnjs.cloudflare.com` + `ph.amparohq.com` (PostHog host confirmed byte-level in the SDK init). Data later vindicated the aim: PostHog is real and costs 573 ms. |
| 4b | **dropped — measured inert** | The wargame's static recon assumed images were the target. Data says otherwise: **CLS is already 0** (nothing for sizing attributes to fix) and the **LCP element is `div.stag`, a text div** (nothing for `fetchpriority` to fix). Doing it would have been busywork measuring as noise. |
| 5 | done | `cowork-artifact-meta` dead block removed; fresh grep confirmed no other reference. |
| 6 | **done — FAIL, logged not spun** | 3-run averages show no measurable change either way (mobile 48→45 perf, LCP 6,034→6,056, TBT 923→1,214). **TBT ranged 81–1,529 ms across all 12 runs** — every delta is inside that noise band. Per Move 6's abort condition: *"attempted, no clean win found this pass."* Instrument problem, not a bad fix: preconnect's whole benefit is DNS/TCP/TLS setup, measured against `127.0.0.1` which has none — Lighthouse modeled it at 61 ms, below the noise floor before any run started. |
| 7 | commit exists, **not pushed** | `13338c1`, one file, correctly scoped. Push remains the human-confirm gate. No win claimed. |

**What the data overturned:** the biggest reported opportunity — "Enable text compression, 446 kB /
2,100 ms" — is a **localhost artifact**. Vercel compresses automatically, nothing in `vercel.json`
disables it, and HANDOFF records the real figures (545.5 kB raw / 180.9 kB gz / **145.7 kB br**).
Chasing it would have burned a whole fix pass on a phantom. Also retired: the multi-`<h1>` concern
(SEO scores **100**).

**Real top lever, unaddressed:** PostHog blocks the main thread **573 ms** (~half of TBT), vs GSAP's
36 ms. Loading-strategy change, no content/copy/statute involvement — but the analytics contract has
five explicitly load-bearing privacy settings, so it needs its own recon, not a blind edit.

**Escalations for Michael:** (1) Vercel dashboard Firewall/Bot Protection — the 403 contradicts the
repo's own `robots.txt` ("Crawling it is the point"); unproven whether verified Googlebot is exempt.
(2) WARP — exclude Vercel ranges to make local perf tooling usable. (3) The structural ceilings
(style/layout 1,093 ms, script eval 1,507 ms, 174 kB unused JS) are the biggest numbers on the board
but every one needs a build step this project has deliberately not adopted — that's the
`/app`-promotion decision (HANDOFF #10), not this mission.

**Reports:** `notebook/amparo-cwv-findings-2026-08-20.md`, `notebook/amparo-cwv-move-1-blocked-2026-08-20.md`
