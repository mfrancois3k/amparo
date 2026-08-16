# Amparo — version history & reference index

Purpose: a lookup table. "Which version was it when X happened" → find it here,
then `git checkout vX.Y.Z -- .` in the repo restores exactly that state.

Repo: `C:\Users\mfran\Ai-Foundations\Amparo` — tags are annotated, dates below
are the actual tag creation dates (`git for-each-ref`), not estimated.

---

## v2.22.11 — 2026-08-16 — "The QR box that only worked for 3 states"

Focus group #20 caught the print-pack QR mechanism was still TX/GA/NY-only
after v2.22.9 added 24 more directory states. Generated real QR codes for
all 24 (qrcode npm package, actual URLs encoded, not placeholders). Also
fixed a translated string (`pack_zoom_close`) that was authored but never
wired to root's close button aria-label.

## v2.22.10 — 2026-08-16 — "www. matters"

Second blind-spot audit round found 5 of v2.22.9's new state links (AL, CA,
MS, NC, PA) missing the `www.` subdomain — 404s / a TLS failure for CA.
Independently re-verified and fixed; spot-checked the rest of the batch.

## v2.22.9 — 2026-08-16 — "24 real directories, 24 honest no's"

4 parallel research agents WebFetch-verified all 48 non-cited states for
real county/ZIP-searchable legal-aid directories. 24 verified (AL, AZ, CA,
DC, FL, IL, IN, KY, LA, MD, MA, MI, MN, MS, MT, NC, OH, OR, PA, SC, TN, VA,
WA, WI) now show their own directory ahead of the national fallback; 24
checked and honestly ruled out. No cron job, no scraper. See
`notebook/amparo-directory-feasibility-2026-08-16.md`.

## v2.22.8 — 2026-08-16 — "Tap-to-zoom, and a bug caught by actually clicking it"

Print-pack thumbnails now open a readable full-size preview on tap (audit
finding #3). Shipped with a real scoping bug (packZoomOpen nested inside
render(), broke every onclick with ReferenceError) — caught by actually
clicking a real thumbnail live, fixed before this entry existed.

## v2.22.7 — 2026-08-16 — "The audit's diagnosis was half right"

Blind-spot audit, focus group, and elite Mobbin UI/UX audit findings, fixed:
a real pre-existing CRLF/LF bug in the content-verify tool (fresh clones
always failed), Enter-to-confirm on state search, distinct click tracking
for the Welcome shortcut, and a real flex layout bug squeezing the doc-row
text to word-breaking width (root cause was min-width:0 + a competing badge,
not the overflow-wrap value first suspected — verified live before and
after). See CHANGELOG for full detail.

## v2.22.6 — 2026-08-16 — "Link to who already maintains it"

Researched LSC.gov/LawHelp.org for a public dataset to cron-pull a pro bono
directory from — neither exists safely. Linked TX/GA/NY lifelines to their
own county-search pages instead, added a national LawHelp.org finder to
the 48-state fallback. No scraper, no new liability. See
`notebook/amparo-directory-feasibility-2026-08-16.md`.

## v2.22.5 — 2026-08-16 — "The reassurance nobody saw"

Real PostHog funnel data (first pull this session) showed the actual
bottleneck is Welcome→State (67% drop), not "You" as assumed. Restored
`pilotBanner` to Welcome and added a low-commitment "just need a lawyer or
hotline" link to the same first step, backed by Mobbin trust-pattern
research. Also: root's Lifelines links now track clicks (`sr_lifeline_link_clicked`).

## v2.22.4 — 2026-08-13 — "The verify claim, re-verified, and found wanting"

Loop's focus group live-verified v2.22.3's own "verified live" claim and found
the clipboard-failure message's `role="status"` was hardcoded to the wrong
element — worked from the link field's own Copy button, silently announced
nothing from the row's separate Copy tile, since the text always mutates on
whichever button fired. Fixed by setting the role on the actual mutating node.
Verified both trigger paths live. No content change.

## v2.22.3 — 2026-08-13 — "It showed a link and sent a score"

Rest of the share-sheet loop findings. The sheet displayed a bare URL while
sending the user's grid, level and score — added a verbatim preview of the
outgoing message (shows the maximum payload; Facebook gets only the link).
`sms:` no longer opens and strands a blank tab. A denied clipboard now says so
instead of looking like nothing happened. Root now persists a miss
immediately, matching `/app`, which had silently produced different counters
for the same two runs — and aligning that exposed an asymmetry (`prxBack`'s
decrement only touched memory), found by testing `localStorage` rather than
in-memory state.

## v2.22.2 — 2026-08-13 — "The row hid the two safest targets"

Loop findings, one round after the share sheet shipped. At 375×812 the row hid
**Copy link and More entirely** (scrollbar suppressed, chevrons dropped, no
affordance) — a regression between v2.22.0 and v2.22.1, which added two
targets without revisiting the comment justifying the scroll. `flex-wrap`; all
six now 100% visible, measured. Also: a Border Patrol checkpoint share no
longer captions itself a traffic stop; `sr_drill_shared` → `sr_drill_share_opened`
(the sheet moved it off the actual share); `prxShareCert` no longer treats a
cancelled OS share as a save (pre-existing); `back()` now reverses a miss it
recorded, +2 checks (24 total). Method note: layout geometry *is* measurable in
the frozen preview tab even though compositing is not — that conflation is
where the overflow hid.

## v2.22.1 — 2026-08-13 — "Facebook and X, on your call"

Adds both to the share sheet after they were deliberately withheld from
v2.22.0 as an operator decision. They behave differently and it is documented
in source: Facebook's sharer takes only the URL and renders from this page's
`og:` tags, so a practice-result share posts **no score**; X's intent URL does
carry the text. Verified by checking both hrefs for the score, not assumed.
Inline SVG brand marks, no new strings, no content drift.

## v2.22.0 — 2026-08-13 — "Share was a button that relabelled itself"

Real share sheet replacing a bare `navigator.share()` that silently degraded
to relabelling its own button on desktop. Adapts a supplied shadcn/React
reference onto root's existing `.ab-card` overlay — target row, link field,
copy — with targets chosen for this audience (WhatsApp, SMS, copy link, native
sheet as "More"). Registers with the existing overlay a11y system (Escape,
focus trap, `inert`, focus restore); `z-index:97` so it behaves when opened
from inside the practice debrief. File shares (cert, carry card) keep their
own `navigator.share({files})` path. Removes orphaned `w_shared`. Visual
render unverified — the preview tab cannot composite frames. No content
change, `EDITION` unmoved.

## v2.21.11 — 2026-08-13 — "The record the results screen tells you to fix, kept getting erased"

`prx.miss` (root) / `progress.miss` (`/app`) now persists an all-time
per-beat miss count, surfaced as a numeric `×N` badge on chronically-missed
breakdown rows — giving `prx_tip_y`'s existing advice something real to
point at, since `prxAgain()`/`again()` previously erased the only record of
it. Verified live in both: count survives a full run and a replay, badge
renders correctly in root's DOM and in `/app`'s real React UI via a live
click-through. Not full spaced repetition — no scheduling, that's a feature
decision. Item 3 (curveball coverage) skipped — needs new officer dialogue,
inside hard rule 1. No content change.

## v2.21.10 — 2026-08-13 — "Fix the answer's screen position, delete the config nobody reads"

Correct-answer button position is now randomized per beat (`swap`, set at
deal time) instead of a fixed function of beat index — root and `/app` both
trained "which side," not "which words," on every run of every level.
Verified live: ~50/50 split across 200 decks, DOM order matches the flag,
stable across a same-beat re-render. Also drops `PRX_LEVELS[].rate`, dead
config confirmed unread anywhere. No content change.

## v2.21.9 — 2026-08-13 — "Every curveball in /app was speaking TTS instead of the recorded clip"

`/app` now recomputes `PRX_VAR`/`PRX_CURVE`/`PRX_HARD` ids from array
position, matching root. `PRX_CURVE` had NO literal id in source at all —
every curveball beat had `id===undefined` in `/app` and silently fell back to
TTS instead of the recorded clip, since curveballs shipped. Confirmed live
before/after via `buildDeck()`. Also closes a latent id-swap exploit the prior
loop's audit proved. Adds a 22nd `practice-engine-check` assertion, proven to
catch both by disabling the fix first and confirming the right failure. No
content change.

## v2.21.8 — 2026-08-13 — "The keyboard fix that only landed on one of two tabs"

Lifelines tablist gets the arrow/Home/End nav the hub tablist got in v2.21.4 —
found by this loop's own focus-group pass. Simpler than the hub's fix: `llTab()`
already patches buttons in place rather than rebuilding the card, so only the
missing `tabindex` + keydown handler needed adding. Verified live. No content
change.

## v2.21.7 — 2026-08-13 — "Restored, still dormant"

Restores 5 more pruned hostile lines (`v0_4`, `v0_5`, `v1_4`, `v1_5`, `v4_4`) at
the operator's explicit instruction — same recovery method as v2.21.6, text
from git, audio round-tripped and confirmed matching before restoring. Unlike
`v2_4`, confirmed NOT reachable by any live path (Level 0/1 tone pools never
include hostile; divergence only reaches Level 2's own deck). Verified by
building 500 real decks and confirming none were ever dealt. `EDITION` →
`2026-E`, inert. `ci:7` still empty, still needs the operator.

## v2.21.6 — 2026-08-13 — "Restored, not authored"

Restores the `ci:2` hostile consent-to-search line at the operator's explicit
instruction — recovered verbatim from git (`f205531` deleted it 2026-08-03,
before divergent turns shipped and made it reachable), not model-authored.
`EDITION` → `2026-D`, confirmed inert (zero attorneys have a filled review
entry). Verified the real divergence transition, not just data presence, by
forcing a non-hostile starting beat before diverging. `ci:7` (arrest) remains
genuinely empty and still needs the operator.

## v2.21.5 — 2026-08-13 — "Three more claims stopped outliving what they claimed about"

Print banner no longer says "sent to your printer" on `afterprint`, which fires
on Cancel too and cannot be told apart from Print in any browser — the fix is
to stop asserting an unknowable outcome, not chase a signal that doesn't exist.
Statute badge now distinguishes "3 of 4 reachable" from "all checked," instead
of claiming "auto-checked daily" through 11 of the last 14 days Georgia was
down. `/app`'s ErrorBoundary gets its first sentence, extracted through
`index.html` like every other string. No content change, `EDITION` unmoved.

## v2.21.4 — 2026-08-13 — "Claims that outlived what they claimed about"

Offline chip no longer promises "works without internet" off `serviceWorker.ready`
alone — `sw.js` swallows cache failures and activates anyway, so the chip could
appear with nothing cached; now gated on `caches.match('./')`. The daily
law-watch cron read tee's exit code instead of the script's, so its review-issue
step had never fired since the workflow was written (`${PIPESTATUS[0]}`). Root's
hub tablist sent keyboard focus to `<body>` on every activation — v2.21.3 gave
it the `role="tab"` contract without the behaviour; now restores focus with
roving tabindex + arrow keys. `role="alert"` on the `/app` error fallback. No
content change, `EDITION` unmoved.

## v2.21.3 — 2026-08-13 — "Verified live, not read"

`prx.best` escaped at both `innerHTML` sites (`5468`/`5588` — HANDOFF's cited
`5451`/`5569` were a release stale), proven with a live injected payload.
`/app` gets its first ErrorBoundary, above Suspense so a failed lazy chunk
lands in it; proven by 404ing a real built chunk. Practice-hub and lifelines
tablists now carry real tab↔tabpanel relationships in root and both `/app`
ports, `/app` also gaining roving tabindex and arrow-key nav. No content
change, `EDITION` unmoved. Adds the required Voicebox audio-generation
workflow doc and the `v2_4` orphan-audio trap.

## v2.21.2 — 2026-08-13 — "The fix was the bug"

QA fan-out caught a same-day regression: v2.21.0/v2.21.1's denominator-aware
best-score compare deleted real scores, because run length varies with crisis
disclosures (shrinks) and curveballs (grows) — including demoting a player for
using the crisis path. Both apps reverted to the original compare; the genuine
Level-2 staleness moved to a one-time `v3` migration. Also fixed: hub forgot
its module tab after a drill, locked cards were keyboard-unreachable, a
leaked timer, orphaned CSS, and a check script under-reporting its own size.

## v2.21.1 — 2026-08-13 — "Root gets the same correction"

Second root edit of the migration (`b5ed755`): root had the identical
stale-best-score bug `/app` fixed in v2.21.0, and root is the live product.
A stored `2/2` from the pre-v2.20.2 2-beat Level 2 outlived a `2/3` on the
3-beat deck. Now matches `/app` — different-denominator bests are
incomparable, not unbeaten. Verified on the live root app both directions.

## v2.21.0 — 2026-08-13 — "Checkpoint gets its own tab back"

Closes the parity audit's #1 finding (`f1af062`): `/app`'s practice entry
was the overlay's flat fallback list, not root's 3-tab step-5 hub — which
re-mixed checkpoint into the traffic ladder it was deliberately split out
of. New `PracticeHub.tsx`; flat list deleted; `.ll-seg` moved to shared
`shell.css`. Also fixed a stale-best-score bug that v2.20.2's denominator
change made live, and put the extraction verifier in front of `npm run
build` so root/`/app` drift can't ship silently.

## v2.20.2 — 2026-08-13 — "Level 2 gets a middle"

First-ever root `index.html` edit this migration (operator-approved,
scoped to one line): `PRX_LEVELS[2].ids` `[3,7]` → `[3,2,7]`, fixing the
3-review-confirmed 2-beat spike on practice Level 2. Reuses existing
reviewed content, no new dialogue. `PRX_VAR[7]`'s missing hostile variant
left open (needs new officer dialogue, operator's call). Live-verified
both languages; regression check added.

## v2.20.1 — 2026-08-12 — "The cleanup sweep was eating its own sibling"

Loop round after v2.20.0 (`20b12a9`): CRITICAL fix — /app's runtime cache
names started with `amparo-`, the exact prefix root's own daily cleanup
sweep deletes, so root was silently wiping /app's audio/img caches every
redeploy. Renamed. Also switched /img caching to StaleWhileRevalidate
(git-history-proven: filenames are stable but content isn't). From
blind-spot audit 2026-08-12-03, scoped at Move 6.1's new service worker.

## v2.20.0 — 2026-08-12 — "wargames/15 closes"

`/app` Phase 6 (`13c10ad`..`6527e4d`) — SW+manifest (Move 6.1) and the
full parity audit (Move 6.2), the last moves in the migration. Two new
findings: practice's entry screen is the wrong one (flat list instead of
root's 3-tab hub with checkpoint split out); print's beforeprint/afterprint
polish never ported. ~20 DEFERRED items at sub-item granularity, exceeding
the wargame's own >10 abort threshold — flagged for operator sign-off, not
silently passed. Every move 0.1-6.2 now shipped/verified/logged. See
`wargames/18-app-parity-report.md` and `notebook/amparo-app-migration-log.md`.

## v2.19.1 — 2026-08-12 — "Announce the crisis line; stop the stale echo"

Loop round after v2.19.0 (`2a4f375`): crisis message now announces to
screen readers (`role="alert"`); officer audio no longer leaks stale
play/error callbacks across beats. From 3 background reports (FG11,
module review 17, blindspot audit 2026-08-12-02) — other findings
re-characterized (matches root) or logged (content/low-probability).

## v2.19.0 — 2026-08-12 — "Phase 5 closes: the whole funnel practices out loud"

`/app` Phases 5.1-5.3 (`234cea5`..`2dc99cc`) — practice engine FSM, its UI +
audio, overlay a11y framework (focus trap/inert/Escape). Full funnel now
built end to end. Real bugs found and fixed: extractor silently dropped
hard-mode/checkpoint content; crisis-tier UI never rendered; two strings
had unescaped embedded markup; photo-upload controls were keyboard-
unreachable (root has this too, not backported). Two independent QA
passes (EN/TX+NY, ES/GA fresh-session) found zero further defects. See
`notebook/amparo-app-migration-log.md` for full per-move detail.

## v2.18.0 — 2026-08-12 — "The pack prints, the engine's on paper"

`/app` Phases 3-5.1 (`f0d4819`..`eaeac7e`), tagged as one batch after full
end-to-end QA. State map (Phase 3, 7 defects fixed pre-tag). You/docs +
Lifelines (Phase 4.1-4.2) — real bug found live: raw `STATES` lookup fell
back to NY's lifelines for 48 states; fixed via `content/statesResolved.ts`.
Print pack (Phase 4.3) — found root's own `PACK_EXTRA.con_h` defect (prints
literal "undefined" on page 6, live today); `/app` degrades gracefully
instead. Practice engine core FSM (Phase 5.1, no UI yet) — found the
extractor was silently dropping hard-mode/checkpoint content added via
post-literal assignment statements; fixed generically. See
`notebook/amparo-app-migration-log.md` for full per-move detail.

## v2.17.0 — 2026-08-11 — "A second app, standing beside the first"

The React/Vite strangler at `/app` begins. Operator decision supersedes
`wargames/14` row 1 (no-rebuild), with conditions — root untouched until proven
parity, content extracted verbatim, flags dark, product palette, no
accounts/billing/analytics.

- `wargames/15-react-strangler-migration.md` — the battle plan. 7 phases, ~18
  moves, fork triggers, abort conditions, verification suite, red-team record.
  Fed by three read-only recon passes (full `index.html` parity inventory,
  infra/deploy, constraint cross-reference). Self-graded 8/8.
- **Phase 0** (`e21d019`) — `sw.js`: `/app` passthrough guard, prefix-scoped
  cache cleanup, pathname-anchored asset matcher. Fixes two red-team landmines
  (root shell cache-poisoning; daily deploy wiping `/app`'s precache while it
  still claimed offline support). Cache stays `amparo-v3` on purpose.
  `tools/sw-routing-check.mjs` — 12 assertions, fails 5/5 against the old file.
- **Phase 1** (`f21c1bf`) — `app-src/` source + committed `app/` build. react +
  react-dom only (27 packages, 0 vulns). No root `package.json` by design.
  Tokens copied from `index.html:36-43`. `noindex`. Live: `/app/` 200, inherits
  root CSP unchanged, root `index.html` byte-identical.
- Baseline to beat later: 60.2 KB gzip for an empty shell vs 112 KB brotli for
  the whole live app.
- ES `k30`/`k33` re-verified on Voicebox v0.5.0 — all three presets still
  mispronounce; fault localised to the two words; nothing shipped.

## v2.16.1 — 2026-08-11 — "The dead mic path can't come back hot"

- SpeechRecognition transcript layer gated off by default (`prxSTT`,
  localStorage `amparo_stt`). Path was already unreachable — record-console
  UI removed in `6651f47` — but would have returned vendor-transiting the
  day a console was rewired. No user audio ever left the device; verified
  by git -S, not memory.
- Stale "nothing is uploaded" comment rewritten; "(type or speak)" string
  fixed to "(type it)" — speak hasn't been offered since the chat rebuild.
- `wargames/14`: outside Convex+Clerk+React master-spec collision analysis
  banked (rejected vs settled decisions; credits recorded; key rotation
  flagged). Found the SR issue.

## v2.16.0 — 2026-08-11 — "One conversation, not a menu and a chat"

Practice hub redesign, driven by convening the wargame-01 expert panel
(encounter designer, level designer, systems designer, game master/scenario
designer, tutorial designer, game accessibility specialist, instructional
designer, stress-inoculation psychologist) live over NLM against the full
notebook — not worked from memory.

- Scenario select: tile grid → vertical card list. Thumbnail + title +
  one-line description + tone-accent stripe (green/orange/red = the real
  hostility ladder). Subtitle surfaces that officer wording varies per run
  (Move 6 — `PRX_VAR`'s ~45 variants existed, were never told to the user).
- Run screen: tile grid no longer re-renders above the chat. Compact header
  (back chip, level name, score ring) replaces it. Root cause of the
  reported issue — user saw all level boxes repeat every screen inside a run.
- Score ring: always "g/a", never bare count; decoration only, never
  color-alone signal. `PRX_UNSCORED` levels (hard mode, checkpoint's dark
  siblings, both final-scenario tracks) render no ring — consistent with the
  existing no-scoreboard rule on their debrief screens.
- No EDITION bump — no officer line, citation, or scored answer touched.

## v2.0.0 — 2026-07-29 — "Get the site live and safe"

The pre-tag build-up commits, in order:
- `c73d034` — Amparo bilingual traffic-stop rights pack landing page (the
  original product)
- `07a5fe5` — split preview/action layout on the print step, demoted
  post-print actions to a grouped rail
- `8b306d4` — voice practice drill: TTS officer, hostility levels, no-mic by
  design
- `c795ec3` — rehearsal callout, pacing bar, on-device self-playback recording
- `3c50806` — state-accurate sign-ticket card, constitutional citations on
  practice cards

**Then, tagged v2.0.0** (bundled as one release):
- Web app manifest + 4 icon sizes — installability. Load-bearing, not
  cosmetic: iOS evicts storage for non-installed sites after ~7 days idle, and
  the product's pitch is "set it up once, need it months later at the
  roadside."
- Service worker precaches manifest + icons for a cold offline start.
- `vercel.json`: CSP, HSTS, X-Frame-Options DENY, no-referrer,
  Permissions-Policy, SRI on the GSAP CDN script.
- Removed a dead "quick exit" that never wiped anything and left captured
  licence photos one Back-gesture away via bfcache.
- Accessibility: Escape/focus-trap/focus-restore on all overlays; prep drill
  keyboard-operable (Enter/Space); emergency-contact fields properly labelled
  (previously announced the placeholder instead of the question); canvas carry
  card given real alt text; gold-text contrast raised 1.71:1 → 7.24:1; practice
  voice toggles padded to 44px.
- **EDITION bumped to 2026-C.** Immigration guidance corrected (voluntary
  departure / stipulated removal named explicitly; added the caveat that
  silence can lengthen a stop rather than end it). New checkpoint rehearsal
  level, built only on settled law (Martinez-Fuerte 1976, Ortiz 1975,
  Brignoni-Ponce 1975, 8 U.S.C. §1357, 8 C.F.R. §287.1) including that leaving
  a checkpoint is a federal felony (18 U.S.C. §758). "Practice genuinely lowers
  your risk" reworded to what the evidence actually supports.
- Gated practice levels shown as **locked**, not hidden.
- Carry card: fill-in recall card rendered to a saveable PNG.

**Known limits at this tag:** only TX/GA/NY covered; no state attorney-reviewed;
Upsolve v. James open question for the scored engine — unaddressed here.

---

## v2.1.0 — 2026-07-30 — "50 states, kill the docs step, fix the funnel"

- `3c71d4c` — all 50 states + DC selectable. TX/GA/NY keep cited statutes; the
  rest show the verified federal floor (Mimms, Rodriguez, Berghuis/Salinas, 4th
  Amendment), marked "federal ✓" — no state statute invented anywhere.
- `2670957` — **document-capture step removed entirely.** Flow: 5 steps → 4
  (state, you, lifelines, print). 493 lines / 32 functions of camera engine
  deleted. Reasoning at the time: drivers already carry their documents.
  *(Reversed in judgement later — see the transcript section: the one user who
  completed the funnel had used this exact step. Not re-added as of this
  writing; flagged as open.)*
- `1e2fd0e` — custom 404 (deer-in-headlights, in the site's own palette, home
  button + route into Practice). Focus-group review (6 personas) found the
  price banner ("$19 after launch") sitting on the state picker — precisely
  where the drop happens — and it was pulled; replaced with the on-device
  privacy line. Pending-state tag reworded from "FEDERAL ONLY" (reads as
  broken) to "federal ✓" (reads as verified). Micro-interactions added
  throughout, compositor-only (transform/opacity), reduced-motion safe.

---

## v2.2.0 — 2026-07-31 — "Fix the DNS outage, fix analytics honesty"

- `bde93d9`, `68b5cc9`, `b88c4bf`, `413a69d` — **the site was down.**
  `www.amparohq.com` had been pointed at PostHog's own managed reverse proxy —
  a hostname collision, since a domain cannot be both the website and the
  analytics proxy. Fixed by moving the proxy to `ph.amparohq.com` and
  restoring `www` to Vercel.
- `457bc38` — analytics routed through the `ph.amparohq.com` proxy once it
  verified `valid`.
- `b5442b5` — daily statute source check + honest freshness badge added (see
  below; this is the first version of it, later hardened in v2.4.0).
- `c1b3bbc` — `sr_pack_printed` fixed to count one event per print. Android
  Chrome fires `beforeprint` more than once per print; production data showed
  a real user's two events 686ms apart, meaning every historical print count
  had been inflated.

---

## v2.3.0 — 2026-07-31 — "Documentation only, no user-facing change"

- `d369cb2` — `CHANGELOG.md` added, generated from tag annotations (not
  commit subjects — annotations carry the real release notes). Fixed 4 bugs
  in the generator skill itself: hardcoded project name from a different repo,
  mangled backticks in a here-string, mojibake em-dash (PowerShell 5.1 reads a
  BOM-less UTF-8 script as ANSI), and it was reading the commit at each tag
  instead of the tag's own annotation.

---

## v2.4.0 — 2026-07-31 — "The daily check actually runs, and cannot lie"

- `07c43c1` — GitHub Action for the daily statute check went live (09:17 UTC +
  manual dispatch). Blocked for a while by a git-credential mismatch: `gh auth
  refresh` had granted `workflow` scope, but git was still authenticating with
  a different, older PAT via `credential.helper=manager`. Fixed with `gh auth
  setup-git`.
- `5fd7292`, `8c7b9b2`, `ef43be9` — **source hosts hunted from a real Actions
  runner**, not locally. FindLaw and Justia 403 GitHub's datacenter IPs while
  answering a residential IP fine — which is exactly why local testing had
  been misleading. `public.law` serves the runner reliably; TX and NY switched
  to it. Georgia has no working source from CI (public.law has no GA
  subdomain; every alternative 404s/503s/serves a JS shell) — GA is only
  genuinely checked on a local run.
- `d406d2e` — **fixed a false-assurance bug the first cloud run exposed.**
  With all four sources 403ing, the job still wrote `lastChecked: today` and
  the site displayed a green "sources auto-checked daily" badge while nothing
  had been checked. `lastChecked` now only advances when at least one source
  is actually reached; otherwise the old date carries forward and
  `lastAttempt` records the run separately.
- `4d27254`, `480956e`, `0634442` — the daily cron firing on schedule,
  unattended, exactly as designed.
- `a85b0e8` — removed the temporary source-prober tooling once its job was
  done (findings preserved in `research/law-watch.json`'s `_comment` array).

---

## v2.5.0 — 2026-08-02 — "Fix the bounce: the state picker was the problem"

- `fc2f46b` — `wargames/01-panel-and-roadmap.md`: the expert panel, blind
  spots, and the roadmap synthesised from the real user transcript + PostHog
  data + an outside AI's product prompt.
- `3b4918c` — **the state picker was the bounce driver, verified not assumed.**
  Real 30-day PostHog data: 72 people landed, 4 ever picked a state — a 94.5%
  drop, far worse than the ~50% PostHog's aggregate bounce metric showed.
  Reproduced the cause on a real mobile viewport: `.state-grid` had
  `max-height:52vh; overflow-y:auto`, a scrollable box nested inside a page
  that already scrolls (a scroll-trap), and Texas — one of only three states
  with real cited statutes — sat alphabetically at position **44 of 51** inside
  it, with no search. Fixed by removing the nested scroll, floating TX/GA/NY to
  positions 1–3 under a "Fully cited" heading, and adding a client-side search
  filter (zero network calls — nothing typed leaves the page).
  **Deliberately not built:** geolocation auto-detect, which would send
  coordinates to a reverse-geocoding API and break the on-device promise.
  Logged as an explicit fork rather than shipped silently.
- `notebook/` — the NotebookLM source documents moved into the repo so their
  paths survive across sessions and are versioned alongside the code.

**Open at this tag:** GA still unreachable from CI; no state attorney-reviewed;
Upsolve v. James unresolved for the scored practice engine; the
document-capture step's removal now looks wrong for the reason recorded in
`amparo-friend-answers-followup.md` (the user wanted it, but needed privacy —
the fix is skippable-and-resumable, not removal).

---

## v2.6.0 — 2026-08-02 — "The safety net had a hole, and the boot path never ran"

- `9a65eed` — **`sr_step_viewed`.** All ~30 existing `sr_*` events recorded
  actions; none recorded a step being *seen*. So "56 people saw the picker and
  left" was indistinguishable from "only 6 ever rendered it," and v2.5.0's
  picker fix was unfalsifiable. Fired from `render()` rather than `go()` so a
  restored or deep-linked first paint counts; `stepChanged` dedupes re-renders
  and language toggles (`sr_pack_printed` had already been burned by exactly
  that class of double-fire in v2.2.0). Plus a **feedback path for the 95% who
  leave** — `usageFeedback` existed but only appeared for a returning user who
  had already printed. The stuck-strip sits on every wizard step, four fixed
  reasons, only a reason slug transmitted. With autocapture permanently off,
  this is the only possible substitute for rage-click data.
- `2bb2d9d` — **four defects found by a blind-spot panel** (trauma-informed
  practitioner, analytics engineer, privacy engineer — none of those disciplines
  had ever read this code). All the same shape: a claim true when written and
  silently invalidated later, or a safety net that existed but was unreachable.
  1. **`restore()` was never called at boot** — two call sites, its own
     definition and `demoExit()`. Autosave, resume, and the first-visit Spanish
     auto-detect were all dead. **A Spanish-dominant phone landed in English the
     entire time**, and an earlier audit this same day had marked that problem
     "already fixed" on the strength of code that existed but was unreachable.
  2. **Session replay ran on steps 0–1 with no masking.** The scoping argument —
     those screens are "structurally un-recordable" — was true when step 1 was
     51 buttons. v2.5.0 added a text input and nobody revisited it.
  3. **The crisis net missed the natural spelling of its own trigger.** No
     apostrophe stripping, so `"I can't go on"` was not intercepted while
     `"I cant go on"` was. The phrase list was also duplicated and drifted (the
     typed path missed three phrases, two Spanish), and a disclosure was scored
     as a **miss** — a yellow square in the results grid, carried into the
     shareable summary.
  4. **`sr_crisis_phrase_shown` removed.** Properties were clean; the event's
     *existence* transmitted that a session disclosed suicidal ideation.
  Also: a freeze is no longer answered with escalation (12s of silence used to
  re-speak the hostile officer line), and consent to escalation is per-level
  instead of one global boolean that silently consented level-3 finishers to
  Hard Mode and the checkpoint.
- `notebook/` — UPL attorney engagement memo (sendable), focus group 02 (twelve
  simulated members walked step-by-step), and `wargames/02-consensus-roadmap.md`
  (20 ranked items, unioning the wargame 01 panel with new seats).

**No legal content changed. EDITION remains 2026-C.**

**Open at this tag:** six UI/UX fix specs designed but unapplied; GA still
unreachable from CI; no state attorney-reviewed; Upsolve v. James unresolved for
the scored practice engine.

---

## v2.7.0 — 2026-08-03 — "Rehearsal is the product"

Landing headline repositioned around rehearsal, not the pack. New step 5
"Practice" hub with live progress. Step 3 (lifelines) cut from 2449px to
667px via a segmented carousel. Print screen unified to one label covering
both print and PDF outcomes. Spanish lifeline names, the language-toggle
no-op, and frozen-English aria-labels all fixed. UPL opinion still pending —
step 5 promotes the scored engine, a deliberate call logged in `wargames/02`.

## v2.7.1 — 2026-08-03 — "The hub nobody could reach"

Fixed defects v2.7.0 introduced: the practice hub had exactly one entry
point and vanished once a user had any progress — found by a focus group
run against the shipped build. Printed packs now stamp their EDITION so a
content correction triggers a reprint warning. A `controllerchange` bug was
double-firing `$pageview` on every first visit. PostHog Surveys disabled.
React/Next rebuild and cloud TTS both rejected on measured evidence.

## v2.7.2 — 2026-08-03 — "Hard mode absorbs the hard stop"

"The hard stop" and "Hard mode" merged — the former recycled 100% of its
beats from other levels, the unwinnable ending moved onto the latter's
original content. Ladder now 4 numbered rungs + unnumbered Checkpoint, with
a version-stamped localStorage migration for existing users. Hub tabs added
[Traffic stop][At your door] — door tab is an honest "not built, here's why"
empty state pending attorney + DV-clinician review
(`notebook/amparo-door-module-research-2026-08-03.md`). Progress bar added.
Mute for the officer voice, full score fractions, search aria-label.

## v2.7.3 — 2026-08-03 — loop verification pass

No code changes — tags the state a `/amparo-loop` verification run (focus
group, module review, blind-spot audit) executes against, subject: the
mute fix from v2.7.2. Backfills this doc and CHANGELOG.md for v2.7.0–2.7.2,
which were pushed without an entry in either.

## v2.7.4 — 2026-08-03 — three fixes the v2.7.3 loop's own agents found

Unreachable dialogue lines pruned, stale post-merge comments fixed, Hard
Mode's hub-card score leak closed, and a CRITICAL race where muting mid-line
could itself trigger the officer's voice via the TTS fallback. Design-only
final-boss module scaffolded alongside (not shipped) — see
`wargames/10-final-boss-module-scaffold.md`.

## v2.8.0 — 2026-08-04 — "The recorded voices finally play"

The pre-recorded officer clips had never played on any level but Checkpoint —
`PRX_VAR`/`PRX_HARD` had no `id` field, so everything fell to browser TTS. 53
ids wired. Double-voice bug fixed (two independent causes). 18 Spanish clips
generated via Voicebox native presets, 2 rejected on pronunciation. Two final
scenarios and the door module fully plumbed but flag-dark pending attorney and
DV-clinician review.

## v2.8.1 — 2026-08-04 — "Ten personas said no, and not one said the price"

Synthetic 10-persona panel + UI/UX researcher synthesis run against the live
site: pain points, and would-they-pay-$3.99-for-a-module-script. All 10 said
no, zero for price reasons — payment-trail risk, no institutional backing,
duplicate of free content, wrong-shaped for the user, incomplete state
coverage. Shipped the two fixes buildable without legal content: a
state-pick-to-print-step fast path, and a reworded federal-only state screen
leading with what's verified before the gap. DV clinician engagement memo
drafted for the door module, unsent, alongside the UPL memo.

## v2.9.0 — 2026-08-04 — "The door has words now — and they stay behind the flag"

Door module (ci 70-75) drafted end to end: setters, officer lines, options,
coach lines, model answers, EN + ES; 24 edge-tts clips in the app's canonical
voices, 24/24 Whisper round-trip verified; hub card + tab + CSS door badge
wired behind `DOOR_MODULE_ENABLED`. Officer lines modeled on the six-video
bodycam batch's corroborated patterns (`amparo-door-raid-research-2026-08-04.md`).
DV-critical beats 71/73 drafted bothGood (never a miss); clinician markers
stay. Flag stays FALSE — flip still requires attorney + DV-clinician sign-off
in the same commit. Both memo appendices updated to disclose the draft.

**⚠️ REVERTED in `df974b7`** — the door-module content from this tag is not in
`main`. Pulled at Michael's direction: the draft paraphrased phrasing patterns
from the bodycam research instead of using the source clips, which was not the
approach asked for. Flag was never on; nothing reached users. `PRX_DOOR` is back
to placeholders, the 24 clips and `tools/gen_door_voices.py` are deleted. The
research survives at `notebook/amparo-door-raid-research-2026-08-04.md`.
`git checkout v2.9.0 -- .` still restores the draft if it is ever wanted.

## v2.10.0 — 2026-08-10 — "Four answers from the only real user, all four closed"

Every change traces to one of four direct answers from the one real user, and
nothing in it was invented. (1) Download worked but he wanted AirPrint and never
knew the button already does it — `window.print()` opens the OS dialog where
AirPrint lives; label now names it. (2) Nothing in the product brought him back
— he remembered, and had promised feedback; added a `.ics` reminder, the only
channel that reaches a closed app with no server, account or push token, landing
tomorrow evening because he named privacy as the blocker. (3) The gold practice
CTA got lost in a dense screen at the moment his task completed — now scrolls
itself into view. (4) Document capture returns as an optional overlay rather
than the wizard step v2.1.0 removed: native OS-camera file input, no
`getUserMedia`, ~90 lines instead of 493, photos persisted under `sr_docs` so
the reminder has somewhere to land, print pockets only when photos exist.

The join: not somewhere private → reminder → resume → add them. Three of the
four were placement or labelling defects, not missing features. Two pre-existing
CSS defects fixed in passing (`.btn` width overflow in flex rows, `.docrow .dt`
missing `min-width:0` at 320px in Spanish).

## v2.11.0 — 2026-08-11 — "A real map, and a stepper that actually steps"

State picker rebuilt twice in one session: a tile cartogram first, replaced
outright once the actual ask was "like this, not rectangular" — real
geographic US map from public-domain path data (Wikimedia Blank US Map), 51
jurisdictions, runtime label placement off each shape's bounding box. Sliver
states (RI/DE/DC/NJ/CT/MA/NH) get their label pulled outside the polygon and
wired as a full click/hover peer — the label *is* the tap target there.
Alphabetical button list removed entirely; map is the one picker. Stepper's
completed nodes are now clickable nav back to that section via the existing
`goM()`; current/future nodes stay inert. Found and fixed app-wide: `[hidden]`
was a silent no-op on `.linkbtn` (author rule beat the UA default).
`index.html` 458 → 502 KB.

## v2.11.1 — 2026-08-11 — "The map hands off properly now"

Two fixes on the v2.11.0 picker, both found by using it. **Search-fade
regression:** typing a state name stopped dimming the map — `filterStates()`
tagged non-matches correctly, but the entrance wave's
`animation-fill-mode:forwards` held `opacity:1` in the animations cascade
layer, which outranks ordinary author rules regardless of specificity, so
`.nomatch{opacity:.1}` could never win from first paint. Fixed by dropping the
animation class once the wave lands. **Confirmation + handoff:** the confirmed
chip now shows the state's own silhouette above ✓ + name (bounding boxes for
all 51 measured once and baked in as `SM_BOX`, no layout pass), and the
map→chip transition went from a 0.18s cut to three beats over ~900ms.

⚠️ Gotcha worth remembering: the silhouette needs **two** injection points —
`render()` for an already-collapsed load, and `setStateCollapsed()` for the
click, because picking a state only toggles classes and never re-runs
`render()`. Reload-only testing hides this completely; the chip renders empty
on every real click.

## v2.12.0 — 2026-08-11 — "The pick travels with you"

The chosen state used to vanish once the picker collapsed after step 1 —
every later step silently depended on a choice the user could no longer see.
A pill in the eyebrow row on steps 2-5 now carries the confirmation chip's
own silhouette plus abbreviation and full name, opposite the step counter;
tapping it calls `goM(1)`, matching v2.11.0's clickable-stepper contract.
Reuses `smShape()`/`SM_BOX` — no new geometry. Under 380px the name drops,
silhouette + abbreviation carry it. From the reference mockup's row 1 (state
should persist through the flow); the mockup's module dashboard was NOT
rebuilt (already shipped, step 5, since v2.7.0), and its paid-script
completion screen was NOT built (contradicts the 10-persona pricing panel —
all 10 declined $3.99, none on price).

## v2.12.1 — 2026-08-11 — "The room feels the tone now"

Practice card gets a tone-atmosphere border glow (amber curt, red hostile)
plus a red vignette + animated scanline for Hard Mode, closing the last gap
from the mockup pass — Hard Mode had a red tab badge and warning banner, but
the beat screen itself looked identical to a calm level while playing it.
`box-shadow` only, never touches text color, so no retheming of shared
templates needed. Reset unconditionally at the top of `practiceRender()`,
before its several early-return debrief paths, so a debrief never inherits a
stale `hardmode-live` class. Not built: a ring turn-counter from the same
mockup — the existing linear demeanor bar already carries that information.

⚠️ Gotcha: first draft named the DOM handle `card`, colliding with the
function's pre-existing `const card=prxCard(ci)` (the beat's content object)
— a function-scope redeclaration that silently failed the whole inline
script to parse. Caught by running the extracted script through
`node --check` before trusting browser tests. Renamed to `atmCard`.

## v2.12.2 — 2026-08-11 — "The card says yes before the screen turns"

Hub scenario cards confirm the tap with a green pulse (~260ms) before the
practice overlay covers them — reference mockup row 3 ("card highlights green,
scenario selected"). Cards route through `prPick()`: pulse, then `prStart()`
launches; reduced motion launches immediately; a busy flag eats double-taps so
`practiceOpen()`'s spoken line can't stack. Locked cards keep their empty
onclick. This was the one remaining row-3 gap — every other screen in the
mockup is already live (map v2.11, state pill v2.12.0, tone atmosphere v2.12.1,
typed/voice/custom input long-standing, hub dashboard v2.7.0). Paid completion
screen (mockup 4x4) NOT built — contradicts the 10-persona pricing panel.

## v2.13.0 — 2026-08-11 — "Checkpoint gets its own tab"

A fixed Border Patrol checkpoint applies in all 50 states and has nothing to
do with a traffic stop's state-cited content, but it was buried as the last
card in the traffic ladder. Hub goes from 2 tabs to 3: Traffic stop |
Checkpoint | At your door. Traffic keeps the 4 numbered rungs + progress bar;
checkpoint gets its own card + context note; door unchanged (index 2 now).
Hub-grouping change only — same level 4, same content, same in-overlay tabs.

## v2.14.0 — 2026-08-11 — "The officer reacts to how you answer"

Divergent turns: `prxDiverge()` re-deals the NEXT beat's variant after each
answer — the reference mockup's core mechanic ("different next turn loads"),
its last unbuilt piece. Direction capped per level by the consent design:
L1 good answer de-escalates to a calm-pool line, mistake keeps curt (hostile
never enters L1 — no consent gate there); L2 mistake→hostile / good→curt but
inert today (the arrest beat ci 7 has zero hostile variants — logic kept,
tone-pool-driven, lights up when one is authored); L0 static (promised calm,
verified byte-identical); L3+ fixed tracks. Selection only from the same
closed static bank, each variant with its own recorded-voice id — no new
content, and UPL memo §2.2 gained a sentence disclosing the mechanic so
counsel keeps reading an accurate description. Curveballs never re-dealt;
crisis (tier x) answers never steer tone. No new UI — demeanor meter and
bubble colour already read tone per beat.

## v2.14.1 — 2026-08-11 — "Five fixes the loop's own agents found"

All five from the v2.14.0 verification pass. (1) Score-history index
mismatch: `prRun` skips crisis beats, `prDeck` doesn't — wrong officer line
per score square and wrong rail-dot colour after any crisis disclosure;
fixed with parallel `prRunIdx[]` through all five reset sites, verified with
a real crisis beat mid-run. (2) Reduced-motion double-tap double-fired the
overlay — first fix attempt also wrong (synchronous reset, same-tick clicks
slip through); caught only by re-testing the actual double-click. (3)
Demeanor tone label was `aria-hidden` — now a polite live region. (4)
`smCap()` hardcoded `'federal ✓'` → `_t.s_pending`. (5) Dead duplicate
`prxBack()` (hoisting-shadowed) deleted.

⚠️ Gotcha pair worth remembering: shared-index reads over `prRun`/`prDeck`
misalign after crisis beats (use `prRunIdx`), and busy-flag guards reset
synchronously are no-ops against same-tick double-clicks.

## v2.15.0 — 2026-08-11 — "The rehearsal room matches the roadside"

Practice overlay goes dark — card, bubbles, choice cards, coach boxes, tabs,
rail, results, footer. Extends the recording console/officer-panel palette
(gold `#F3D48A`, muted `#8fa0bd`, green `#4ade80`) rather than inventing a
second scheme. Scoped to `#practiceOverlay` via explicit overrides, not a
global `--navy` flip (it's both dark text AND dark button bg — flipping it
breaks the selected tab). Six other `.ab-card` overlays + print pack verified
still light. Caught in visual testing: `.prx-key` inherited text colour,
rendering the model answer's highlighted phrases unreadable on dark — fixed
with explicit ink. Tone atmosphere (v2.12.1) re-tuned for dark ground.

---

## Quick lookup: "what tag has the fix for X"

| If you're looking for… | It's in |
|---|---|
| Installability / manifest / a11y fixes | v2.0.0 |
| Checkpoint level / corrected immigration copy | v2.0.0 (EDITION 2026-C) |
| All 50 states selectable | v2.1.0 |
| Document-capture step removed | v2.1.0 |
| Custom 404 / focus-group copy fixes | v2.1.0 |
| The site-down DNS incident and its fix | v2.2.0 |
| Print-count double-fire fix | v2.2.0 |
| CHANGELOG.md itself | v2.3.0 |
| Daily statute check actually running in CI | v2.4.0 |
| public.law host switch (GA still unreachable from CI) | v2.4.0 |
| The panel / blind spots / roadmap doc | v2.5.0, `wargames/01-panel-and-roadmap.md` |
| State-picker search / priority order / scroll-trap fix | v2.5.0 |
| The UX audit that found the 94.5% drop | v2.5.0, `notebook/amparo-ux-audit-2026-08-02.md` |
| `sr_step_viewed` / step-view instrumentation | v2.6.0 |
| Feedback path for people who never convert | v2.6.0 |
| `restore()` never ran at boot (Spanish auto-detect was dead) | v2.6.0 |
| Session-replay masking on steps 0–1 | v2.6.0 |
| Crisis-phrase apostrophe bug + list drift | v2.6.0 |
| Freeze no longer answered with escalation | v2.6.0 |
| Per-level consent to escalation | v2.6.0 |
| UPL attorney engagement memo | v2.6.0, `notebook/amparo-upl-engagement-memo.md` |
| Consensus roadmap (20 ranked items) | v2.6.0, `wargames/02-consensus-roadmap.md` |
| Focus group 02 (12 members, step-by-step) | v2.6.0, `notebook/amparo-focus-group-02-walkthrough.md` |
| Step 5 practice hub / rehearsal-first landing | v2.7.0 |
| Lifelines carousel (2449px → 667px) | v2.7.0 |
| Practice hub reachability fix | v2.7.1 |
| Pack EDITION staleness check | v2.7.1 |
| Duplicate `$pageview` on first visit | v2.7.1 |
| Hard-stop/Hard-mode level merge + progress migration | v2.7.2 |
| Door module empty state / DV research | v2.7.2, `notebook/amparo-door-module-research-2026-08-03.md` |
| Officer-voice mute | v2.7.2, verified again at v2.7.3 |
| `.claude/skills/amparo-loop/` (this verification sequence) | v2.7.3 |
| Orphaned `PRX_VAR` hostile lines / stale merge comments | v2.7.4 |
| Hard Mode hub-card score leak | v2.7.4 |
| Mute-race CRITICAL fix (mute could itself trigger audio) | v2.7.4 |
| Final-boss module scaffold (2 scenarios, design-only) | v2.7.4, `wargames/10-final-boss-module-scaffold.md` |
| Recorded voices never played / TTS everywhere | v2.8.0 |
| Double-voice on entering a module | v2.8.0 |
| Spanish audio 49 → 58 per voice | v2.8.0, `notebook/amparo-spanish-audio-recording-list.md` |
| Final scenarios + door module built (flag-dark) | v2.8.0 |
| 10-persona panel + UX researcher synthesis, $3.99 pricing test | v2.8.1 |
| State-pick fast-path to printable pack (`skipToPack()`) | v2.8.1 |
| Federal-only state-screen copy reframe | v2.8.1 |
| DV clinician engagement memo | v2.8.1, `notebook/amparo-dv-clinician-engagement-memo.md` |
| Bodycam batch research (6 videos, /watch-bulk) | v2.9.0, `notebook/amparo-door-raid-research-2026-08-04.md` |
| Door module full draft (script + options + audio, flag-dark) | v2.9.0 |
| Door audio d70-75 (24 clips, edge-tts, verified) | v2.9.0, `tools/gen_door_voices.py` |
| Door hub card / tab / `.doorbg` badge wiring | v2.9.0 |
| **Door module draft REVERTED (not in main)** | `df974b7`, after v2.9.0 |
| Real-user 4-answer session (print, return, CTA, photos) | v2.10.0 |
| `.ics` "remind me tomorrow" finish-later reminder | v2.10.0, `downloadFinishReminder()` |
| AirPrint named on the print button | v2.10.0 |
| Practice CTA scrolls into view after printing | v2.10.0 |
| Document capture rebuilt as an overlay (not a wizard step) | v2.10.0, `openPapers()` / `sr_docs` |
| Window-card photo pockets restored (only when photos exist) | v2.10.0 |
| Geographic US state map (real shapes, replaces alphabetical list) | v2.11.0 |
| Sliver-state labels as full tap targets (RI/DE/DC/NJ/CT/MA/NH) | v2.11.0 |
| Stepper's completed nodes clickable — jump back to a section | v2.11.0 |
| `[hidden]` app-wide fix (was a no-op on `.linkbtn`) | v2.11.0 |
| Map search-fade regression (`forwards` beat `.nomatch`) | v2.11.1 |
| Confirmed chip shows the state silhouette (`SM_BOX`, `smShape()`) | v2.11.1 |
| Map→chip handoff choreographed (~900ms, 3 beats) | v2.11.1 |
| Chosen state travels via eyebrow pill (steps 2-5), tap returns to step 1 | v2.12.0 |
| Practice card tone-glow + Hard Mode scanline atmosphere | v2.12.1 |
| Hub scenario-card green-pulse confirm before overlay (`prPick()`) | v2.12.2 |
| Checkpoint split into its own hub tab, out of the traffic ladder | v2.13.0 |
| Divergent turns — officer's next line reacts to the answer (`prxDiverge()`) | v2.14.0 |
| L2 arrest beat (ci 7) has no hostile variant — escalation leg inert | v2.14.0 note |
| Crisis-beat score-history misalignment (`prRunIdx[]`) | v2.14.1 |
| Reduced-motion double-tap guard (same-tick clicks) | v2.14.1 |
| Demeanor label screen-reader fix + `smCap` i18n + dead `prxBack` | v2.14.1 |
| Loop reports: FG-08, `wargames/12`, blindspot-audit-2026-08-11 | v2.14.1 window |
| Dark practice card (scoped `#practiceOverlay` palette) | v2.15.0 |
| `.prx-key` dark-mode contrast fix | v2.15.0 |

To restore any version exactly:
```bash
git checkout v2.2.0 -- .        # restore files at that tag, keep history
git reset --hard v2.2.0         # discard everything after that tag
```
