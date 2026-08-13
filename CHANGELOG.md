# Changelog

Version history for Amparo. Every tag is a rollback point:
```bash
git checkout v2.6.0 -- .        # restore files, keep history
git reset --hard v2.6.0         # discard everything after
```

## v2.21.5 — 2026-08-13

v2.21.5 — "Three more claims stopped outliving what they claimed about"

Same failure shape as v2.21.4, three more instances. None touch officer
dialogue or statute text — UI and status copy only.

**The print banner said "Pack sent to your printer" on Cancel.** `afterprint`
fires whether the user clicked Print or Cancel in the OS dialog — no browser,
in any implementation, exposes a signal to tell them apart. That means this
can't be fixed by moving the event or adding a check; the only honest fix is to
stop asserting an outcome nothing here can verify. The banner now reads "Your
pack is ready for the glovebox," true either way. Verified by dispatching
`afterprint` directly with no print ever invoked — the literal Cancel case —
and confirming the banner no longer claims delivery. `sr_pack_printed` itself
is left where it is: relocating it buys no accuracy, since `afterprint` has the
identical ambiguity, and renaming it would break continuity on an existing
PostHog funnel definition, which is the operator's call to make, not a fix to
land quietly.

**The statute-source badge said "auto-checked daily" through 11 of the last 14
days Georgia's source was unreachable.** `law-status.json` had computed and
shipped `reachedSources`/`sourcesWatched` the whole time; `renderLawCheck`
never read them. Now shows a distinct partial-check state ("3 of 4 were
reachable") beneath the existing flagged state, so a source that actually
changed still takes visual priority over one that was merely unreachable.
Verified live in all three states.

**`/app`'s ErrorBoundary fallback had no sentence.** It reused `c_retry`, the
*camera* retry string, because no generic error copy existed anywhere in the
463-key bank. Added `app_err_t` (EN+ES) through `index.html` and the extractor
like every other `/app` string. Verified by 404ing a real built chunk — the
sentence renders inside the existing `role="alert"` card.

No legal content changed. `EDITION` unmoved. All four check suites pass; `tsc`
clean.

## v2.21.4 — 2026-08-13

v2.21.4 — "Claims that outlived what they claimed about"

Three fixes from the v2.21.3 loop. All three are the same shape: something kept
asserting a thing after the thing stopped being true.

**The offline chip could lie about the core promise.** It appeared on
`serviceWorker.ready`, which only means a worker is *active*. `sw.js`'s install
deliberately swallows every cache failure (`c.add(...).catch(()=>{})`, twice) so
it can activate on a partial precache rather than not at all — the cost being
that `ready` resolves even when the shell was never stored. So "✈️ Saved on this
device — works without internet" could appear with nothing cached. That is the
product's central promise making a claim it never checked, the same failure as
the badge that read "sources auto-checked daily" while all four sources were
403ing. Now gated on `caches.match('./')`, verified in both directions: shell
cached → chip shows; worker active but shell absent → chip stays silent. Worth
knowing for the next person to test this: `index.html:5789` gates the whole
service-worker block on `location.protocol==='https:'`, so none of it runs on
`http://localhost`.

**The daily cron's "open a review issue" step had never fired.** It read
`changed=$?` after `node tools/law-watch.mjs | tee check.log`, which captures
*tee's* exit code, not the script's — and `law-watch.mjs:145` makes that exit
code the entire "a statute changed" signal. GitHub's default `run:` shell is
`bash -e {0}` with no pipefail, so nothing propagated it either. Reproduced in a
real shell before touching it. The site badge did still flip on drift, so this
was never total silence — but the channel to a *person* was dead from the day
the workflow was written. `${PIPESTATUS[0]}`.

**Root's hub tablist destroyed keyboard focus.** `hubTab()` calls `render()`, a
full innerHTML rebuild, so the button just activated is a different node
afterwards and focus fell to `<body>`. v2.21.3 had added `role="tab"` — the ARIA
contract — without the behaviour, which is arguably worse than the plain buttons
that preceded it, because a screen reader now announces tabs semantics the hub
did not honour. Now restores focus after the rebuild and carries roving tabindex
plus Arrow/Home/End, matching `/app`.

Also adds `role="alert"` to the `/app` ErrorBoundary fallback so a failure is
announced at all. This does not close the gap — `c_retry` is the *camera* retry
string and no generic error sentence exists in the 463-key bank.

No content changed. `EDITION` unmoved. All four check suites pass. Four findings
were left open deliberately and are recorded in HANDOFF, the sharpest being that
`sr_pack_printed` fires on `beforeprint` — so "3 printed" in the 72→4→3 funnel is
"3 opened a print dialog" — while `afterprint` fires on **Cancel** and still
commits `hasPrinted`, telling a user who cancelled that their pack was sent to
the printer.

## v2.21.3 — 2026-08-13

v2.21.3 — "Verified live, not read"

Three fixes from the standing task list, each checked in a running browser
rather than by reading the code — which is what caught that two of the three
were filed against stale line numbers.

`prx.best` was interpolated unescaped into `innerHTML` at two sites while a
third escaped it with `esc()`. Self-XSS only, since the value is app-written,
but the escaped sibling proves the intent and one of the two was on the results
screen. HANDOFF cited `5451`/`5569`; at v2.21.2 the real sites were **`5468`
and `5588`** — the numbers had drifted a release. Confirmed by planting an
`<img onerror>` payload into `prx.best` and rendering both: zero elements
created, payload rendered as literal text, handler never fired. `5401` was left
alone on purpose — it is `fillText` on canvas, not `innerHTML`, and escaping it
would corrupt the certificate image.

`/app` had no ErrorBoundary anywhere, so a throw in any screen white-screened
it. The new one sits **above** the Suspense boundary rather than inside it,
because a lazy chunk that fails to load rejects into the nearest boundary above
the one that suspended — and an offline chunk miss is the likeliest way it ever
fires. It uses only the already-extracted `t.c_retry`, so the rule that nothing
user-facing is hand-typed in `/app` still holds, and `console.error` is the
entire report because `/app` ships zero analytics behind a `connect-src 'self'`
CSP. Verified by renaming a real built chunk so its import 404s: the shell,
header and language toggle all survived, the fallback rendered, and restoring
the chunk let the retry recover the app completely.

The practice hub's tablist announced "tab" with nothing to relate it to — no
`aria-controls`, and the panel had no `tabpanel` role. Fixed in root and in both
`/app` ports. The same defect sat one screen over on the lifelines tablist,
whose `aria-controls` pointed at a `role="group"`; fixed there too rather than
leaving the sibling broken. `/app` additionally gets roving tabindex and
arrow/Home/End navigation, which root does not have — a deliberate divergence,
recorded so it is not later mistaken for drift.

No content moved: the extractor still verifies 2437 strings byte-identical, so
`EDITION` is unchanged and no attorney badge drops. All four check suites pass.
`app/` is rebuilt because the build output is committed.

Also lands `notebook/amparo-voice-generation-workflow.md` — the now-required
process for generating any audio, including the transcribe round-trip and an
orphan-id trap found today (`v2_4` has clips in all four voice folders and text
in `VOICE_LINES.md`, but no reference in `index.html`, so reusing that id would
silently ship audio of different words). HANDOFF corrected on three verified
points: the `/app` promotion's service-worker landmine, the stale bundle-size
figures, and that L2 divergence is inert in *both* directions, not just the
hostile leg.

## v2.21.2 — 2026-08-13

v2.21.2 — "The fix was the bug"

A fanned-out QA pass caught a regression shipped to the live product earlier
today. v2.21.0 and v2.21.1 changed the practice best-score compare to replace
a stored best whenever its denominator differed from the finished run's — the
reasoning being that Level 2's 2→3 beat change (v2.20.2) made a banked `2/2`
permanently unbeatable.

The premise was wrong. The run length is not a fixed property of a level:
crisis-tier beats are excluded from it, so **disclosing distress shrinks the
denominator**, and the daily curveball adds a beat on the first two levels, so
replaying **grows** it. The rule therefore fired during ordinary play and
deleted real scores — a `5/5` overwritten by a `1/6` on a routine replay, and
a `3/3` replaced by a `2/2` after a player typed a crisis phrase. That second
case is the one that matters: the app demoted someone for using the crisis
disclosure, which is the last thing here that should ever cost anyone
anything. Before the change, both scores survived.

Both apps are reverted to the original compare, which also closes a
root-vs-`/app` divergence on malformed stored values that the same review
found (root tolerated them; `/app` threw, and has no error boundary). The
genuine staleness problem is now handled where it belongs — a one-time
migration alongside the existing one, dropping a Level 2 best that can no
longer be expressed while keeping the completion and run count. The old test
asserted the wrong behaviour and was rewritten to pin the right invariant: a
worse run never displaces a best, whatever the denominators.

Also fixed from the same review wave: the practice hub forgot which module tab
you came from after a drill (finish a Checkpoint, return, land on the traffic
ladder — the exact thing the tab split exists to prevent); locked scenario
cards used the native `disabled` attribute, which dropped them out of the
keyboard tab order and suppressed the only text explaining the lock; a
leftover timer, some CSS orphaned by last release's deletion, and a check
script that under-reported its own size.

No EDITION bump — no legal content touched.

## v2.21.1 — 2026-08-13

v2.21.1 — "Root gets the same correction"

`/app` fixed its stale-best-score bug in v2.21.0; root had the identical
defect and, unlike `/app`, root is the live product. v2.20.2 changed Level
2's deck from 2 beats to 3, which made root's numerator-only best-score
compare wrong for real returning users: a stored `2/2` from the old deck
outlives a `2/3` forever, because `2 > 2` is false — so the hub displays a
best score the level can no longer produce. Root now matches `/app`: a best
recorded against a different deck length is incomparable, not unbeaten, so
it is replaced; same-shape comparisons are unchanged.

Second root edit of this migration. Verified against the running root app,
not just in isolation: seeded the exact returning-user state and confirmed
the previously-failing case now writes `2/3`, then confirmed a deliberately
worse same-shape run (`0/3` against a `3/3` best) still does not displace
it — with the run counter incrementing to prove the run actually executed
rather than silently no-op'ing. All inline scripts syntax-checked; full
check suite green.

No EDITION bump — no legal content touched.

## v2.21.0 — 2026-08-13

v2.21.0 — "Checkpoint gets its own tab back"

Closes the parity audit's #1 finding. `/app` had ported the wrong screen as
its practice entry point: the practice overlay's internal flat fallback
list, instead of root's actual step-5 hub. Root splits the Border Patrol
checkpoint into its own tab precisely because it "was reading as just
another traffic level buried at the end of the ladder" — and the flat list
is the exact shape it was split out of. Three separate reviews flagged it
(the parity audit, a module design review, and a focus group) before this
rebuild.

The hub now matches root: three module tabs (Traffic stop / Checkpoint / At
your door), a progress bar counting only the four numbered traffic rungs,
checkpoint's own context note in place of that bar, the door tab's honest
"Not built yet — and we won't fake it" panel, and the green pick-pulse that
lets a tapped card register before the next screen replaces it. The old flat
list is deleted rather than left reachable — keeping it as the in-run
"All scenarios" destination would have reintroduced the mixed-in checkpoint
one click deeper.

**Real bug fixed alongside it:** best scores were compared by numerator
only, which was safe until Level 2's denominator changed from 2 to 3 in
v2.20.2. A returning player's stored `2/2` survived a `2/3`, so the hub
would show a best score the level can no longer produce. A best recorded
against a different deck length is incomparable, not unbeaten — it's now
replaced outright, with same-shape comparisons unchanged.

**Content drift now has a gate.** The extraction verifier had no CI job, no
git hook, and no npm script — root-to-`/app` sync depended on someone
remembering to run it. Harmless while root was locked from edits; real once
v2.20.2 made root editable. `--verify` now runs as the first step of the
build, proven to fail it on injected drift before being trusted.

No EDITION bump — no legal content touched.

## v2.20.2 — 2026-08-13

v2.20.2 — "Level 2 gets a middle"

Three independent reviews across this migration (wargames 16, 17, 19) all
converged on the same finding: practice Level 2 ("Ordered out") was a
2-beat spike — straight from the exit order to the arrest, nothing between,
right behind the heaviest consent gate in the app. Fixed by inserting the
consent-to-search beat (`ci:2`) between them — reuses existing, already-
reviewed content; no new dialogue authored.

This is the first edit to root `index.html` in the entire migration. Root
has stayed untouched by policy since Move 0; asked the operator explicitly
before touching it, scoped to exactly one line
(`PRX_LEVELS[2].ids`: `[3,7]` → `[3,2,7]`).

The other open finding from the same reviews — the arrest beat (`ci:7`)
still has no hostile-tone variant, so the divergence mechanic stays a
no-op on Level 2's "bad pick" path — was explicitly left open. That fix
needs genuinely new officer dialogue, which this project never authors
(attorney-reviewable content only). Operator's call, logged.

Live-verified in both languages: Level 2 now runs 3 beats, correct tone
pool throughout, correct score/debrief. A regression check now pins the
exact beat sequence so this can't silently regress. Full check suite
(19/19) and build pass.

No EDITION bump — no legal *interpretation* changed, only which already-
reviewed beat plays in which slot.

## v2.20.1 — 2026-08-12

v2.20.1 — "The cleanup sweep was eating its own sibling"

Loop round after v2.20.0: a blind-spot audit scoped specifically at
Move 6.1's brand-new service worker found a CRITICAL bug contradicting
that move's own stated design goal. `/app`'s runtime cache names
(`amparo-app-audio`/`amparo-app-img`) both started with `amparo-` —
exactly the prefix root's own daily cache-cleanup sweep deletes (a
prefix test against everything but `amparo-v3`, not "every cache period"
as the original code comment misread it). Root's own redeploy cron was
silently deleting `/app`'s runtime caches every day. Renamed to
`app-audio-v1`/`app-img-v1`.

Also, proven by git history in the same audit: `/img` filenames are
stable but not content-hashed (`officer-f.jpg`'s bytes changed under the
same filename between two commits an hour apart) — switched `/img/**`
from a year-long `CacheFirst` to `StaleWhileRevalidate` so a real content
change gets picked up on the next load instead of never. `/audio/**`
stays `CacheFirst` (genuinely immutable content).

No EDITION bump — no legal content touched.

## v2.20.0 — 2026-08-12

v2.20.0 — "wargames/15 closes"

`/app` Phase 6 (`13c10ad`..`6527e4d`) — the last phase of the React
strangler migration. Move 6.1 gives `/app` its own service worker and
manifest (`vite-plugin-pwa`, scoped `/app/`, precached build assets,
runtime cache-first for shared `/audio`/`/img` under isolated cache names
that Move 0.2's root cleanup can never touch, and vice versa). Move 6.2 is
the full parity audit against wargames/15's original inventory — every
row of ~80 sub-items across 12 sections got a verdict.

Two genuinely new findings from the audit itself, previously unlogged:

- **Practice's entry screen is structurally the wrong one.** Root's actual
  step-5 hub is a 3-tab structure (Traffic ladder / Checkpoint / Door) —
  checkpoint was deliberately split out because it read as "just another
  traffic level." `/app` instead ported the practice overlay's internal
  fallback list, which mixes checkpoint back in. Both screens are real in
  root; `/app` built the wrong one as its primary entry point. Not fixed
  in the audit — a real build task, flagged for follow-up.
- Print's `beforeprint` debounce and `afterprint` confirmation banner were
  never ported. Print itself works; the confirmation layer around it
  doesn't exist yet.

Per the wargame's own abort condition (">10 DEFERRED rows without operator
sign-off"), the audit counts roughly 20 at sub-item granularity — stated
explicitly rather than silently passed. Most are consistent, previously-
logged, deliberate scope decisions (post-print rail, carry card, share
cert, About overlay); this is a flag for review, not a claim that
everything is done.

**This closes wargames/15.** Every move 0.1 through 6.2 shipped, verified,
and logged. What's left is a promotion decision, not migration work.

Live QA this cycle (Texas + Checkpoint level, previously untested combo,
run against the production build with the new service worker active) —
zero defects.

No EDITION bump — no legal content touched.

## v2.19.1 — 2026-08-12

v2.19.1 — "Announce the crisis line; stop the stale echo"

Loop round after v2.19.0: two independent live QA passes (zero defects)
plus three background reports (10-persona focus group, practice-module
design review, blind-spot architecture audit) surfaced two real, cheap,
in-scope fixes:

- Crisis-tier reveal (`PracticeBeat.tsx`) had no `aria-live` — the single
  highest-stakes sentence in the practice flow went unannounced to screen
  readers. Added `role="alert" aria-live="assertive"`.
- `usePracticeAudio`'s `stopAll()` dropped its `Audio` ref without
  detaching `onplay`/`onerror`/`onended` first, so a `pause()`-rejected
  `play()` promise could still fire the TTS fallback for a stale beat —
  reachable via rapid re-tap of "hear it again," back-navigation, or
  leaving the screen mid-clip.

Other findings re-characterized rather than fixed: the "mute unreachable
before first audio" gap matches root's own existing behavior exactly
(verified against root's source, not a regression); a missing
hostile-tone officer-line variant and Level 2's short beat count are
content-authoring gaps, not code; `app_prx`'s silent-fail storage write
and cross-tab reconciliation are logged as low-probability, no UI pattern
for the failure state yet.

No EDITION bump — no legal content touched.

## v2.19.0 — 2026-08-12

v2.19.0 — "Phase 5 closes: the whole funnel practices out loud"

`/app` Phases 5.1-5.3 (`234cea5`..`2dc99cc`) — the practice engine, its UI and
audio, and the overlay accessibility framework. This finishes Phase 5 of
`wargames/15`; the full funnel (welcome → state → you → lifelines → print →
practice) is now built end to end.

- **Practice engine core** (Move 5.1): the run FSM as pure state +
  transitions — deck building, per-level consent gates, crisis-skip score
  alignment, selection-only divergence. Found and fixed a real extractor gap
  along the way: hard-mode and checkpoint beat content was added by
  assignment statements the const-only slicer never saw, so it silently
  shipped without any of that content.
- **Practice UI + audio** (Move 5.2): level select, live-beat chat thread,
  demeanor meter, typed-answer matcher, crisis detection, results/debrief,
  and officer audio (clip-then-TTS double fallback, mute/gender/voice-lang).
  Found two real bugs via live verification: the crisis-tier reveal never
  actually rendered its message (fell through to a normal coach box), and
  two content strings with embedded `<br>`/`<b>` markup rendered as literal
  text.
- **Overlay/a11y framework** (Move 5.3): focus trap, inert background,
  bidirectional Tab-wrap, focus restore, Escape-to-close — via a portal so
  marking the app root inert doesn't also deafen the overlay. Found a real
  keyboard-accessibility failure present in root too (photo-upload controls
  were never in the tab order); fixed in `/app`, not backported to root.

Two independent QA passes this cycle — one in English against Texas/New
York with fresh and returning-user paths, one in Spanish against Georgia
with a genuinely fresh (cleared-storage) session — found zero further
defects. Full check suite (extractor, storage, service-worker, practice
engine — 18 checks) and build pass throughout.

No EDITION bump — no legal content touched.

## v2.18.0 — 2026-08-12

v2.18.0 — "The pack prints, the engine's on paper"

Six commits of `/app` strangler-migration work since v2.17.0 (Phases 3-5.1 of
`wargames/15`), first put through end-to-end QA and the loop as one batch —
the per-move discipline (build → full check suite → live browser verify →
log) held for each individual move as it shipped; this tag is what catches
the *versioning* up to where the code already was.

**Phase 3 — Welcome + state map.** Geographic SVG map (51 states, search
fallback) ported from `index.html`'s `US_PATHS`/`SM_BOX` banks. Seven defects
found and fixed across two independent review passes (code review + live
E2E) before this tag: dead CSS custom properties, a missing `aria-label` on
the language toggle that had been silently dropped by an earlier draft, and
others logged in `notebook/amparo-app-migration-log.md`.

**Phase 4 — You/docs, Lifelines, Print.**
- Document capture overlay: native `<input capture="environment">`, no
  `getUserMedia` — photos shrink client-side (1100px, JPEG 0.72) before
  landing in `app_docs`, own storage key so "delete my photos" can't touch
  the rest of the pack. Focus trap + Escape-closes + focus-restore, verified
  live this session.
- Lifelines step shipped with a real bug, caught by driving the app in a
  browser rather than re-reading the code: it read the raw 3-key `STATES`
  literal and fell back to New York's lifelines for the other 48 states.
  Root synthesizes all 51 at script load; `content/statesResolved.ts` now
  replicates that synthesis for `/app`. Re-verified live with California.
- Print pack: all six pages ported from `buildPrint()`, `dangerouslySetInnerHTML`
  used only on the two fields that carry real embedded markup from the
  extracted banks (statute-quote spans, claims `<b>` tag) — everything else
  is plain auto-escaped JSX. Found root's own defect along the way:
  `PACK_EXTRA` has no `con_h` key, so root's own printed pack has shown the
  literal word "undefined" as a box header on page 6 this whole time, in
  both languages. `/app` degrades that box to icon-only instead of
  hand-authoring replacement text or reproducing the glitch.

**Phase 5.1 — Practice engine core, as an explicit FSM.** `IDLE → PRE_FLIGHT
→ OFFICER_SPEAKING → AWAITING → BEAT_COMPLETE → DEBRIEF`, pure state +
transitions, no UI yet. Ports deck building (fixed tracks for hard
mode/checkpoint/dark levels, tone-pool deal + date-seeded curveball for the
first three), per-level consent gates (clearing one level's warning no longer
silently consents into the next), and the crisis-skip alignment between the
scored run and the deck index that a prior root version got wrong. Along the
way: the extraction tool itself was missing hard-mode and checkpoint beat
content entirely — `PRACTICE.en/es[20-22,30-33]` and `PRX_OPT[20-22,30-33]`
are added by assignment statements *after* the base `const` literals, which
the const-only slicer never saw. Fixed generically in the extractor, not
patched around. 17-check self-test in `tools/practice-engine-check.mts`.

**This session's QA pass:** full click-through on the current build — EN/ES
toggle, state map (Texas and New York), You step with the docs overlay
(open/Escape/focus-restore), Lifelines both tabs, Print pack with
state-specific statute text confirmed in the rendered DOM. Zero console
errors or warnings across the whole session (Vite HMR debug lines aside).

No EDITION bump — no legal content touched; the `con_h` fix is a rendering
degradation, not a content change.

## v2.17.0 — 2026-08-11

v2.17.0 — "A second app, standing beside the first"

The operator chose a React/Vite **strangler** migration at `/app` — explicitly
superseding the no-rebuild verdict banked in `wargames/14` row 1 earlier the
same day, with conditions: root `index.html` stays live, untouched, and the
default entry until documented parity; content is ported verbatim by
mechanical extraction, never retyped; flags stay dark; product palette; no
accounts, no billing, no new analytics.

`wargames/15-react-strangler-migration.md` is the battle plan — 7 phases, ~18
moves, each with its expected observation, failure/signal/counter-move, fork
triggers, abort conditions and verification runs, written so a mid-tier model
can execute it blind. Three read-only recon passes fed it: a complete parity
inventory of `index.html` (42 analytics events, 6 localStorage keys including
two `amparo_prx` migrations, 240 audio files, ~518 i18n keys per language), an
infra/deploy recon, and a constraint cross-reference. Self-graded 8/8.

**Phase 0 — root service worker hardened** (the precondition, shipped alone).
Its red-team pass found two landmines a naive plan would have hit blind:

1. The navigation branch stores *every* successful navigation under `CORE`, so
   one online visit to `/app` would have overwritten the cached root shell —
   the root app's offline fallback would then serve the wrong app.
2. `activate` deleted every cache on the origin, which would have wiped
   `/app`'s Workbox precache — and a cron deploys daily, so `/app` would have
   silently lost offline capability once a day while still claiming to have
   it. That is exactly the quiet-false-claim failure mode of hard rule 3.

Third fix: the asset matcher was a substring test on the whole URL, so any
third-party URL merely containing `/img/` was cached as an immutable asset.
Cache name deliberately stays `amparo-v3` — bumping it would force every
existing user to re-download the shell. `tools/sw-routing-check.mjs` runs the
real worker against stubbed globals (12 assertions); verified meaningful by
failing 5/5 against the previous version.

**Phase 1 — `/app` beta shell.** Source in `app-src/`, committed build output
in `app/`. React + react-dom only: 27 packages, 0 vulnerabilities. No root
`package.json` — that would trip Vercel's framework auto-detection and put
root deploys at risk. Design tokens copied verbatim from `index.html:36-43`.
`noindex` so the beta cannot split the funnel. The bilingual preview banner is
the *only* hand-written user-facing copy allowed in `/app`; everything else
arrives via the Phase 2 extractor, hash-matched.

Verified live: `/app/` and bare `/app` both 200; `/app` inherits root's CSP and
needs no `vercel.json` change (a carried RECON NEEDED, now settled); root
`index.html` byte-unchanged since v2.16.1.

Bundle baseline, recorded before it grows: **191 KB raw / 60.2 KB gzip** for a
shell that does nothing yet, against **112 KB brotli** for the entire live app.
That gap is the number the eventual promotion decision has to answer for.

**Also:** the ES `k30`/`k33` audio gap was re-verified rather than inherited.
Voicebox has moved to v0.5.0 with a profile system, so all three Spanish
presets were retested and every clip round-tripped through
`voicebox.transcribe`. All still fail — `¿Ciudadanía?` → "Siu d'Avanía" /
"Tiu d'Avanía" / "Siu d'Abanía", `Oríllese` → "Poríese". Two new facts: the
inverted `¿?` is not the cause (the bare word fails identically), and the rest
of the k33 sentence renders perfectly, localising the fault to `Oríllese`
alone. No clips shipped; the TTS fallback stands until a human records them.

No EDITION bump — no legal content touched anywhere in this release.

## v2.16.1 — 2026-08-11

v2.16.1 — "The dead mic path can't come back hot"

An outside master-spec review (banked whole in `wargames/14`) surfaced one
finding that survived verification: the practice engine still carries a
browser-SpeechRecognition transcript layer that ships mic audio to
Google/Apple servers on most platforms. Git trace showed the record-console
UI reaching it was removed in `6651f47` — so **no user audio has left the
device** — but the path would have returned hot the day anyone rewired a
console, under a comment claiming "nothing is uploaded."

- New `prxSTT` gate (localStorage `amparo_stt`, default OFF) on the SR
  construction — the vendor-transit layer now requires an explicit opt-in
  that no UI currently offers. Rebuild rules (default-off toggle +
  bilingual vendor disclosure) banked in the code comment and wargames/14.
- The comment above `PRX_SR` rewritten to state reality — the
  quiet-false-claim failure mode this project has been burned by before.
- `prx_own_sum` promised "(type or speak)"; speak hasn't existed since the
  chat rebuild. Now "(type it)" / "(escríbelas)".
- `wargames/14-spec-v5-collision-analysis.md`: the outside Convex+Clerk+
  React master spec measured against settled decisions — verdicts banked
  so none of it gets re-litigated from scratch. Key hygiene: the pasted
  Stripe test + Clerk keys need rotating (operator action).

No EDITION bump — no legal content touched.

## v2.16.0 — 2026-08-11

v2.16.0 — "One conversation, not a menu and a chat"

Practice hub redesigned around an eight-role expert panel (wargame 01's game
roles + instructional/psych roles), convened live over NLM against the full
Amparo notebook rather than worked from memory.

**Scenario select** is now a vertical card list — thumbnail, title, one-line
"what happens," tone-accent stripe (green → orange → red, the same escalation
ladder the officer actually walks) — replacing the flat tile grid. Subtitle
tells the user the officer's wording changes every run (`PRX_VAR`'s ~45
variants existed since the divergent-turns work but were never surfaced —
Move 6 from wargame 01).

**During a run**, the tile grid is gone entirely. A compact header (back
chip, level name, score ring) replaces it — officer chat is the whole screen,
the way image-1 of the reference mockup showed it. Previously every run
screen re-rendered the full level grid above the chat, which read as "why am
I seeing all these boxes again."

**Score ring** always shows count *and* denominator ("3/5"), never a bare
count — the exact bug a v2.14.1 fix already covered elsewhere, now guarded
here too. Ring is SVG decoration; the number is the signal, colour is never
the only carrier (game-accessibility catch). Hard mode, checkpoint's unscored
siblings, and the two dark final-scenario tracks (`PRX_UNSCORED`) never
render a ring — a score there would imply the escalation was earned, which
was already the house rule for the debrief screens.

No EDITION bump: presentation-only, zero officer lines or citations touched.

## v2.15.0 — 2026-08-11

v2.15.0 — "The rehearsal room matches the roadside"

Practice overlay goes dark — card, bubbles, choice cards, coach boxes, tabs,
rail, results screen, footer. Palette extends what the recording console and
officer panel already used (gold `#F3D48A`, muted `#8fa0bd`, green
`#4ade80`), not a new scheme. Scoped explicitly to `#practiceOverlay` via
targeted overrides — flipping the global `--navy` var would have made the
selected tab white-on-white, since it does double duty as text AND button
background. Six other overlays sharing `.ab-card`, and the printable pack,
verified to stay light.

Caught in visual testing: `.prx-key` (the model answer's highlighted
phrases) inherited text colour and rendered light-on-light on the dark
card — unreadable, on the exact words the user is there to rehearse. Fixed
with explicit dark ink.

Tone atmosphere (v2.12.1) re-tuned for the dark ground.

## v2.14.1 — 2026-08-11

v2.14.1 — "Five fixes the loop's own agents found"

From the v2.14.0 verification pass (focus group 08, `wargames/12`, blind-spot
audit 2026-08-11):

1. **Score-history mismatch** (pre-existing, worst): `prRun` skips
   crisis-tier beats, `prDeck` doesn't — after any crisis disclosure the
   summary showed the wrong officer line per square and the rail dots the
   wrong colour. Fixed with a parallel `prRunIdx[]` map through all five
   reset sites; verified by triggering a real crisis beat mid-run.
2. **Reduced-motion double-tap** double-fired the practice overlay — and the
   first fix attempt was also wrong (synchronous flag reset; same-tick
   clicks slipped through), caught by re-testing the actual double-click.
3. **Demeanor tone label un-hidden** for screen readers — the only textual
   tone signal, `aria-hidden` right as divergence made tone the feedback.
   Now a polite live region.
4. `smCap()` hardcoded English `'federal ✓'` → uses `_t.s_pending`.
5. Dead duplicate `prxBack()` deleted.

## v2.14.0 — 2026-08-11

v2.14.0 — "The officer reacts to how you answer"

Divergent turns — the reference mockup's core mechanic, its last unbuilt
piece. The deck was dealt once at open; now `prxDiverge()` re-deals the next
beat's variant after each answer, direction capped per level by the consent
design ("escalation is chosen, never sprung"):

- **Level 1:** good answer de-escalates — next line drawn from the calm pool;
  mistake keeps it curt. Hostile stays out (no consent gate on L1).
- **Level 2** (consent-gated): mistake draws hostile, good answer curt. Inert
  today — the arrest beat has no hostile variant — lights up when one is
  authored.
- **Level 0** stays static (promised calm, verified). Levels 3+ fixed tracks.

Selection only: every pickable line is the same static, attorney-reviewable
bank with its own recorded voice. Corpus stays closed and finite; UPL memo
§2.2 discloses the mechanic. No new UI — the demeanor meter already reads
tone per beat, so the officer visibly settling is the feedback.

## v2.13.0 — 2026-08-11

v2.13.0 — "Checkpoint gets its own tab"

A fixed Border Patrol checkpoint is a different encounter from a traffic
stop — different rules, applies in all 50 states (unlike the state-cited
traffic content) — but it was buried as the last card in the traffic ladder.

Hub goes from two tabs to three: **Traffic stop | Checkpoint | At your
door**. Traffic tab keeps the four numbered rungs + the progress bar;
checkpoint tab shows the one card with a context note; door tab unchanged.

Hub-grouping change only — same level, same content, same in-overlay tab
strip.

## v2.12.2 — 2026-08-11

v2.12.2 — "The card says yes before the screen turns"

Hub scenario cards confirm the tap with a green pulse (~260ms) before the
practice overlay covers them — from the reference mockup's row-3 flow. The
overlay used to swallow the tap instantly; the pick never registered.

Cards route through `prPick()`: pulse, then `prStart()` launches. Reduced
motion launches immediately. Busy flag eats double-taps (two `prStart()`
would stack `practiceOpen()`'s spoken line twice). Locked cards keep their
empty onclick.

Every other screen in the mockup is already live — map (v2.11), state pill
(v2.12.0), tone atmosphere (v2.12.1), typed/voice input (long-standing), hub
dashboard (v2.7.0). Paid completion screen (mockup 4x4) NOT built —
contradicts the 10-persona pricing panel.

## v2.12.1 — 2026-08-11

v2.12.1 — "The room feels the tone now"

Practice card gets a tone-atmosphere border glow (amber curt, red hostile),
plus a red vignette + animated scanline for Hard Mode — the beat screen used
to look identical to a calm level while playing it, badge and banner aside.

Border glow via `box-shadow` only, never touches text color. Card is a
stable parent, so setting its className no-ops on same-beat re-renders.
Reset unconditionally before `practiceRender()`'s several early-return
debrief paths, so a debrief never inherits a stale Hard Mode class.

Not built: a ring turn-counter from the reference mockup — the existing
linear demeanor bar already carries that information.

## v2.12.0 — 2026-08-11

v2.12.0 — "The pick travels with you"

The chosen state now stays visible after step 1 instead of vanishing when the
picker collapses. A pill in the eyebrow row on steps 2-5 carries the same
silhouette shown at confirmation, plus abbreviation and full name — tapping
it jumps back to step 1, matching the clickable-stepper contract from
v2.11.0.

Placed opposite the step counter so it reads as carried-over context, not a
competing control. Animates in a beat after the card. Under 380px the full
name drops; silhouette + abbreviation still answer "which state." Reuses
`smShape()`/`SM_BOX` from v2.11.1 — no new geometry.

Not built: the module dashboard from the reference mockup already exists
(step 5, since v2.7.0). Not built: a paid-script completion screen from the
same mockup — contradicts the 10-persona pricing panel (all 10 declined
$3.99, none on price).

## v2.11.1 — 2026-08-11

v2.11.1 — "The map hands off properly now"

**Search-fade regression.** Typing a state name had stopped dimming the rest
of the map. `filterStates()` was tagging non-matches correctly — the failure
was purely visual. The entrance wave used `animation-fill-mode: forwards`,
and a finished animation's held `opacity:1` sits in the animations cascade
layer, which outranks ordinary author rules regardless of specificity. So
`.nomatch{opacity:.1}` could never win, from first paint. The map now drops
the animation class once the wave lands.

**Confirmation shows the state.** The confirmed chip is the state's own
silhouette above ✓ + name — same artwork the map just animated, cropped to
that state's bounding box (all 51 measured once and baked in, no layout pass).

**Handoff is choreographed.** The map→chip transition was a 0.18s cut; now
three beats over ~900ms — pick lifts off the map as the country recedes, the
plate leaves exactly as the DOM swap hides it, silhouette lands before the
name. "Not your state?" reverses it.

Note for future work: the silhouette needs **two** injection points —
`render()` for a session that loads already-collapsed, and the click path
separately, because picking a state only toggles classes and never re-runs
`render()`. Testing via reload alone hides this; the chip is empty on every
real click.

## v2.11.0 — 2026-08-11

v2.11.0 — "A real map, and a stepper that actually steps"

**State picker.** The alphabetical button list is gone; a real geographic US
map is the one way to pick a state now. Public-domain path data (Wikimedia's
Blank US Map), 51 jurisdictions, labels placed at runtime from each shape's
own bounding box. Sliver states (RI, DE, DC, NJ, CT, MA, NH) get their label
pulled outside the polygon and wired as a full click/hover target — for those
states the label *is* the tappable state. Hover writes the name + coverage
tier to a caption bar; TX/GA/NY stay gold; selection retracts to the same
confirmed-chip flow the button list always used.

**Stepper.** The five-dot State/You/Lifelines/Print/Practice stepper's
completed nodes now jump back to that section — same `goM()` every Back
button calls. Current and future steps stay inert (standard breadcrumb
contract). Real buttons, translated `aria-label`s, keyboard parity.

Found in passing: `[hidden]` was a silent no-op on `.linkbtn` app-wide (an
author `display:block` rule beat the UA default). One global rule fixed it
everywhere the attribute is used, not just the map.

`index.html` 458 → 502 KB (the map's path data).

## v2.10.0 — 2026-08-10

v2.10.0 — "Four answers from the only real user, all four closed"

The one real user answered four direct questions about his own session. Every
change here traces to one of them; nothing was invented.

**1 · Print worked, AirPrint didn't announce itself.** He wanted to AirPrint and
never realised the button already does that — `window.print()` opens the OS
dialog where AirPrint lives. Label now names it, both languages.

**2 · Nothing brought him back.** He remembered, and he'd promised feedback. A
personal obligation is not a retention mechanic. Added a downloadable `.ics`
reminder — the only channel that reaches a closed app with no server, account,
or push token. Lands tomorrow evening, because he named privacy as the blocker.
No guilt, no streak.

**3 · The practice CTA got lost.** *"I saw a lot of buttons but while being busy
and distracted I just might not have clicked."* The button was already right; it
arrived at the bottom of a dense screen the moment his task completed. Now
scrolls itself into view.

**4 · Document capture returns.** Useful and liked — what stopped him was doing
it in public. Back as an optional **overlay**, not the wizard step v2.1.0
removed: native OS-camera file input, no `getUserMedia`, ~90 lines instead of
493. Photos persist under their own key (`sr_docs`) so the reminder has
somewhere to land. Printed window card gets pockets back only when photos exist.

The join is the point: not somewhere private → reminder → resume → add them.
Three of the four were placement or labelling defects, not missing features.

Also fixed: `.btn` at `width:100%` overflowing inside flex rows, and
`.docrow .dt` missing `min-width:0` at 320px in Spanish. Both pre-existing.

## v2.9.0 — 2026-08-04

v2.9.0 — "The door has words now — and they stay behind the flag"

The door module (ci 70-75) went from placeholder scaffold to a complete,
testable draft: authored setters, officer lines, response options, coach
lines, and model answers in EN + ES; 24 audio clips in the app's canonical
voices, 24/24 round-trip-verified; hub card, tab, and CSS door badge wired
behind `DOOR_MODULE_ENABLED`.

Officer lines are modeled on phrasing patterns corroborated by a six-video
bodycam research batch (`notebook/amparo-door-raid-research-2026-08-04.md`),
never verbatim from identifiable incidents. The two DV-critical beats are
drafted so neither choice is ever marked a mistake; clinician-review markers
stay.

**The flag stays FALSE.** The flip still requires attorney + DV-clinician
sign-off in the same commit. What changed is what reviewers receive: a
concrete, playable draft instead of a blank page.

> **⚠️ REVERTED — this release's door-module content is no longer in `main`.**
> Pulled at Michael's direction in `df974b7`: the draft paraphrased phrasing
> patterns from the bodycam research rather than using the source clips, which
> was not the approach asked for. The flag was never on and nothing reached
> users. `PRX_DOOR` is back to `TODO_ATTORNEY` / `TODO_DV_CLINICIAN`
> placeholders; the 24 audio clips and `tools/gen_door_voices.py` are gone.
> The research that informed it survives in
> `notebook/amparo-door-raid-research-2026-08-04.md`.
> Recorded here rather than left to mislead a future session.

## v2.8.1 — 2026-08-04

v2.8.1 — "Ten personas said no, and not one said the price"

A synthetic 10-persona panel plus a UI/UX researcher synthesis, run against
the live site, asked about pain points and a hypothetical $3.99 module-script
purchase. All 10 declined — for ten different reasons, none of them price:
payment-trail risk, no institutional backing, content already free elsewhere,
wrong-shaped for the user, incomplete state coverage.

Shipped the two findings buildable without touching legal content: a
fast-path from the state-pick screen straight to the printable pack
(`skipToPack()`), and a reworded federal-only state screen that leads with
what's verified across all 50 states before the cited-vs-federal gap. Same
facts, reordered — EDITION unchanged.

Also drafted a DV clinician engagement memo for the door module (unsent,
alongside the UPL memo).

## v2.8.0 — 2026-08-04

v2.8.0 — "The recorded voices finally play"

**The recorded voices had never played.** `PRX_VAR` and `PRX_HARD` carried no
`id` field, so the deck builder read `undefined` on every variant and the engine
fell through to browser TTS on every level except Checkpoint. `git log -S`
confirms the ids were never written — not lost. All 53 wired, index alignment
verified first.

**Double voice, two independent causes.** `prStart()` called `practiceOpen()`
(which speaks level 0) and then `prxTab()` (which speaks the target level) — two
overlapping lines on every hub card but the first. Separately, a missing clip
fires *both* `onerror` and a `play()` rejection, and each called the TTS
fallback. Both fixed.

**18 new Spanish clips**, generated through Voicebox's local API using native
kokoro Spanish presets. Each was transcribed back and compared to source;
`k30`/`k33` failed across all three Spanish voices and were deleted rather than
shipped — a Border Patrol agent mispronouncing "ciudadanía" is worse than a
correct robotic fallback. `audio/es/` 49 → 58 per voice.

**Built, dark behind flags:** the two final scenarios (levels 5/6) and the door
module (level 7) — decks, locks with the sequential rule, warn branches,
unscored guards, debrief branches, both languages. Every officer line is
`TODO_ATTORNEY`; two door beats are `TODO_DV_CLINICIAN`. `PRX_UNSCORED` and
`PRX_LEVEL_IDS` replace the scattered `i===N` literals that caused the original
score leak.

Nothing user-facing changed. Open: attorney review, DV-clinician review, two
voice performances, `k30`/`k33` Spanish, UPL opinion.

## v2.7.4 — 2026-08-03

v2.7.4 — "Three fixes from the mute-fix loop's own agents"

**Pruned unreachable dialogue + stale comments.** The v2.7.2 level merge left
8 officer lines mathematically unreachable — traced by hand which levels can
select which beat/tone combination, corrected the source agent's count by one
in the process. Fixed two comments still calling the ladder "level 5/level 6"
after the merge changed the numbering. Caught and reversed a self-inflicted
syntax error mid-edit (a premature comment close took the whole script down)
before it ever reached a commit.

**Hard Mode's hub card was leaking a score.** The results screen has always
deliberately shown no score for the swan/unwinnable level; the newer hub card
never got the same guard, so a played Hard Mode showed "🟩 3/3" on the one
screen designed to say nothing scored happened there.

**CRITICAL — the mute button could trigger the sound it exists to stop.**
Muting mid-line paused the in-flight audio, which rejected its own play()
promise, which fell through to the TTS fallback with no mute check — so
tapping mute could make the officer's line speak a second time, unmuted.
Fixed at the single call site; also gated the recorded-answer auto-playback,
same underlying gap.

Design-only, not shipped: a two-scenario "final boss" module — see
`wargames/10-final-boss-module-scaffold.md`. Gated on attorney review, two
voice performances, and the UPL opinion.

## v2.7.3 — 2026-08-03

v2.7.3 — "Loop verification pass, subject: officer-voice mute"

Nothing new shipped in code beyond what v2.7.2 already covered — this tag
marks the state a verification loop (10-persona focus group, module design
review, blind-spot audit) is being run against. Loop subject: the officer-
voice mute shipped in `8ce9639`, persisted, gating both the MP3 and TTS
output paths at the single `prxSpeak()` entry point.

Also backfills three tags that were pushed without a CHANGELOG entry —
`.claude/skills/amparo-loop/` codifies this sequence going forward so that
doesn't happen again.

## v2.7.2 — 2026-08-03

v2.7.2 — "Hard mode absorbs the hard stop; progress becomes visible"

**Level merge.** "The hard stop" and "Hard mode" collapsed into one.
Correcting the record: the unwinnable ending ("you did everything right and
the officer stays hostile anyway") belonged to "The hard stop", not "Hard
mode" as stated earlier in this project. The merge kept Hard mode's beats
because they were the only original late-game content — "The hard stop"
recycled 100% of its beats from levels 1 and 3 — and moved the unwinnable
ending onto them. Ladder is now four numbered rungs plus an unnumbered,
ungated Checkpoint. A version-stamped, idempotent localStorage migration
re-points every returning user's saved progress onto the new indices; the
deleted level's result is dropped, never remapped.

**Module tabs.** Hub now shows [Traffic stop] [At your door], reusing the
segmented control from step 3. The door tab is an honest empty state — not
built, and why: pending attorney review, and because a knock at the door is
frequently a domestic-violence call. Full research in
`notebook/amparo-door-module-research-2026-08-03.md`.

**Progress visibility.** "{n} of 4 done" with a fill bar under the tabs, plus
a green completed-state on cards. Checkpoint deliberately excluded from the
count.

**Also in this line:** mute for the officer voice (persisted, gates both
audio paths), full score fractions instead of a truncated integer, an
aria-label on the state search input.

Open: door module unbuilt by design; UPL opinion still pending.

## v2.7.1 — 2026-08-03

v2.7.1 — "The hub nobody could reach, and the pack that didn't know its own edition"

Fixes for defects introduced or exposed by v2.7.0, all found by a focus
group and a blind-spot audit run against the shipped build.

**Reachability.** The step-5 practice hub had exactly one entry point,
behind printing AND behind having completed zero scenarios — so it vanished
the moment progress existed. Six of ten personas could never reach the
screen the new headline promises. Now reachable from the landing page, from
both post-print branches, and resumable.

**Honesty.** A printed pack never recorded which EDITION it was printed
under, so a content correction never triggered a reprint warning — now
stamped at print and checked. Every first visit reloaded because
`controllerchange` had no existing-controller check, inflating the exact
population the 94.5% drop is measured from. PostHog Surveys was never
disabled and defaulted on — a remotely-injectable modal with input fields,
in a product that promises nothing leaves your phone. Off, with dead-click
capture.

**Settled.** React/Next + Tailwind rebuild rejected on measured evidence.
Cloud TTS rejected; voices stay authoring-time MP3s + on-device speech.

## v2.7.0 — 2026-08-03

v2.7.0 — "Rehearsal is the product"

The through-line of this release: the app kept presenting itself as a pack
generator that also had practice, when practice was always the point.

**Repositioned.** Landing headline now leads with rehearsal ("Practice the
stop before it happens") in both languages. Practice moved from the fourth
of four bullets to the first. New step 5, "Practice", in the stepper and as
a real screen: a hub listing the six existing scenarios with live progress
and lock state.

**Funnel and layout.** Step 3 went from 2449px (3.5 screens) to 667px (1.0
screen): lifelines became a peek-card carousel, then lifelines and scenarios
collapsed into one segmented track. State picker retracts to the picked
state. Print screen: one label covers both outcomes ("Print or save as
PDF"), and the print button demotes to ghost once printed so Practice is the
only gold action.

**Honesty and correctness.** Spanish lifeline names never translated —
affecting ~47 states and the printed pack. The language toggle could
silently no-op. Dialog aria-labels were frozen in English while
`documentElement.lang` was correctly maintained. `document.title` appeared
nowhere in the JS.

Open at this tag: UPL opinion still pending — step 5 promotes the scored
engine in the core funnel, shipped on the operator's explicit decision with
the gate still logged in `wargames/02`.

## v2.6.0 — 2026-08-02

v2.6.0 — "The safety net had a hole, and the boot path never ran"

Two shipped features and four defects that made the product quietly claim more
than it did.

Shipped
- sr_step_viewed: the funnel could see THAT people left, never WHERE. All ~30
  existing sr_* events recorded actions; none recorded a step being seen, so
  "56 saw the picker and left" was indistinguishable from "only 6 rendered it,"
  and v2.5.0's picker fix was unfalsifiable. Fired from render() so a restored
  or deep-linked first paint counts, deduped so re-renders and language toggles
  don't double-count.
- A feedback path for the 95% who leave. usageFeedback already existed but only
  appeared for a returning user who had already printed — the ~5% who convert.
  The new stuck-strip sits quietly on every wizard step: four fixed reasons plus
  the existing mailto. Only a reason slug is ever transmitted. With autocapture
  permanently off for privacy, this is the only possible substitute for
  rage-click data.

Fixed
- restore() was never called at boot. Two call sites: its definition and
  demoExit(). Autosave, resume and the first-visit Spanish auto-detect were all
  dead code — a Spanish-dominant phone landed in English the whole time.
- Session replay ran on steps 0-1 with no masking configured. The scoping
  argument ("those screens are structurally un-recordable") was true when step 1
  was 51 buttons; v2.5.0 added a text input and nobody revisited it. Masking now
  pinned at init.
- The crisis safety net missed the natural spelling of its own trigger: the
  normalizer never stripped apostrophes, so "I can't go on" was not intercepted
  while "I cant go on" was. The phrase list was also duplicated and drifted —
  the typed path missed three phrases the voice path caught, two of them
  Spanish. And a disclosure was scored as a MISS, rendering as a yellow square
  in the results grid and carried into the shareable summary.
- sr_crisis_phrase_shown removed. Clean properties, but the event's existence
  transmitted off-device that a session disclosed suicidal ideation, and at this
  traffic volume it could inform no decision.
- A freeze is no longer answered with escalation. Twelve seconds of silence used
  to re-speak the hostile officer line; it now offers replay and exit at equal
  weight.
- Consent to escalation is per-level. One global boolean meant clearing level 3
  silently consented you to Hard Mode and the checkpoint, and their own warnings
  never displayed.

Docs: UPL attorney engagement memo (sendable), consensus roadmap unioning the
wargame 01 panel with new seats (20 ranked items), focus group 02 (twelve
simulated members, step-by-step).

No legal content changed. EDITION remains 2026-C.

Open at this tag: the six UI/UX fix specs are designed but unapplied; GA still
unreachable from CI; no state attorney-reviewed; Upsolve v. James unresolved for
the scored practice engine.

## v2.5.0 — 2026-08-02

Amparo v2.5.0 — Edition 2026-C

Fixed the actual bounce driver, found by verifying the data rather than
trusting the dashboard number.

PostHog's aggregate bounce metric read ~50%. The real 30-day funnel: 72 people
landed, 4 ever picked a state — a 94.5% drop concentrated on one screen.

Reproduced the cause on a real 375x812 viewport instead of guessing:
- .state-grid carried max-height:52vh + overflow-y:auto — a scrollable box
  nested inside a page that already scrolls. On touch, the gesture is captured
  by the inner box and the screen reads as stuck.
- Texas, one of only three states with real cited statutes, sat alphabetically
  at position 44 of 51 inside that trapped box. NY was 33rd, GA 11th.
- No search across 51 buttons.

Fix:
- Nested scroll removed; the page's own scroll carries the list.
- TX/GA/NY always render first under a "Fully cited" heading; the other 48 sit
  below under "Federal rights". Positions are now 1-3.
- Client-side search filtering by name or abbreviation. Zero network calls —
  nothing typed leaves the page, consistent with the rest of the product.

Deliberately NOT built: geolocation auto-detect. It would require sending
coordinates to a reverse-geocoding API, breaking "nothing you enter leaves your
phone" — the specific promise this audience trusts the product on. Recorded as
an explicit fork for a human decision, not shipped by default.

Also: NotebookLM source documents moved from a session scratchpad into
notebook/ so their paths survive across sessions and stay versioned with the
code. Includes the auth gotchas (nlm needs --cdp-url in a sandboxed shell;
cookie-only import fails without a CSRF token; nlm <= 0.8.6 hardcodes the
retired notebooklm.google.com domain).

Open at this tag
- Georgia still unreachable from CI for the daily statute check.
- No state is attorney-reviewed for this edition.
- Upsolve v. James (2d Cir. 2025) unresolved for the scored practice engine.
- The document-capture removal (v2.1.0) now looks wrong: the user wanted the
  feature but needed a private moment for it. The fix is skippable-and-
  resumable, not removal.

## v2.4.0 — 2026-07-31

Amparo v2.4.0 — Edition 2026-C

The daily statute check now actually runs, and cannot lie when it doesn't.

- GitHub Action is live (09:17 UTC daily + manual). Getting it pushed needed
  `gh auth setup-git`: the token had `workflow` scope, but git was configured
  with credential.helper=manager and was authenticating with a different,
  older PAT from Windows Credential Manager.

- Sources moved to public.law for TX and NY. Probed from a real runner rather
  than guessed: FindLaw and Justia 403 GitHub's datacenter IPs every time
  while answering a residential IP normally, which is exactly why local
  testing was misleading. Georgia stays on FindLaw — public.law has no Georgia
  subdomain and every other GA source tested (lawserver, onecle, elaws,
  casetext, legis.ga.gov) 404s, 503s or serves a JS shell. GA is therefore
  only genuinely checked on a local run.

- Fixed a false-assurance bug the first cloud run exposed: with all four
  sources 403ing, the job still wrote lastChecked = today and the site showed
  a green "sources auto-checked daily" badge while nothing had been checked.
  lastChecked now advances only when at least one source is actually reached;
  otherwise the old date carries forward and lastAttempt records the run. No
  date means no badge, because no badge is honest and a date is not.

Verified on the runner: 3 of 4 sources reached, hashes matched, status file
committed and live.

Still open
- 3 states carry real statute citations; 48 show the verified federal floor.
- No state is attorney-reviewed for this edition.
- Upsolve v. James (2d Cir. 2025) open for the scored practice engine.

## v2.3.0 — 2026-07-31

Amparo v2.3.0 — Edition 2026-C

Documentation release. No user-facing change since v2.2.0.

- CHANGELOG.md, generated from tag annotations, covering v2.0.0 onward.

Generating it exposed four bugs in the changelog-generator skill, fixed at
source: a hardcoded project name from another repo, backticks mangled inside a
here-string, an em dash emitted as mojibake because Windows PowerShell 5.1
reads BOM-less UTF-8 as ANSI, and release notes taken from the commit at each
tag instead of the tag's own annotation. Its SKILL.md also documented a
preserve-manual-entries behaviour that was never implemented; the doc now says
the file is overwritten.

Carried over from v2.2.0, still open
- The GitHub Action that runs the daily statute check is STILL not in the repo.
  The push token lacks `workflow` scope, so .github/workflows/law-watch.yml
  remains local-only and law-status.json does not refresh. The freshness badge
  on the site is therefore frozen at its last manual run.
- 3 states carry real statute citations; 48 show the verified federal floor.
- No state is attorney-reviewed for this edition.
- Upsolve v. James (2d Cir. 2025) still open for the scored practice engine.

## v2.2.0 — 2026-07-31

Amparo v2.2.0 — Edition 2026-C

Analytics correctness and a daily source watch.

- sr_pack_printed now counts one event per print. Android Chrome fires
  beforeprint more than once; production data showed a real user's two events
  686ms apart, so every historical print count was inflated. Debounced 4s so a
  genuine reprint still registers.
- Daily statute source check (tools/law-watch.mjs) plus an honest freshness
  badge. It detects when a source statute page's TEXT changes and flags it for
  a human. It does not claim the law was verified — the site states "sources
  checked" and "attorney review" as two separate facts, because only one of
  them is something a script can do.
- Analytics routed through the ph.amparohq.com reverse proxy.
- Custom 404, focus-group copy fixes on the state picker, micro-interactions.

Known limits
- The GitHub Action that runs the daily check is NOT in the repo yet: the push
  token lacks `workflow` scope. File is at .github/workflows/law-watch.yml and
  must be added separately. Until then law-status.json does not refresh.
- 3 states carry real statute citations; 48 show the verified federal floor.
- No state is attorney-reviewed for this edition.
- Upsolve v. James (2d Cir. 2025) still open for the scored practice engine.

## v2.1.0 — 2026-07-30

Amparo v2.1.0 — Edition 2026-C

- Document-capture step removed entirely (4-step flow: state, you, lifelines,
  print). Drivers already carry their documents; the camera prompt was mid-flow
  friction for the most privacy-sensitive users. 493 lines and 32 functions of
  capture engine deleted with it.
- All 50 states + DC selectable. TX/GA/NY keep cited statutes; the rest show the
  verified federal floor (Mimms, Rodriguez, Berghuis/Salinas, 4th Amendment),
  marked "federal ✓" — no state statute is invented anywhere.
- Custom 404 in the site palette, with a home button and micro-animations.
- Price messaging removed from the state picker, replaced with the on-device
  privacy promise, per focus-group review of the 97% drop-off.
- Micro-interactions throughout, compositor-only, reduced-motion safe.

Known limits: only 3 states attorney-researched; 10 more staged in
research/state-law-matrix.md. No state is attorney-REVIEWED for this edition.
Upsolve v. James (2d Cir. 2025) still open for the scored practice engine.

## v2.0.0 — 2026-07-29

Amparo v2.0.0 — Edition 2026-C

Installability
- Web app manifest plus icons: the app can now be installed to a home screen.
  This was load-bearing, not polish — iOS evicts storage for non-installed
  sites after roughly 7 days idle, and the product's whole pitch is "set it up
  once, need it months later at the roadside."
- Service worker precaches the manifest and icons so a cold offline start works.

Security and privacy
- vercel.json: CSP, HSTS, nosniff, DENY framing, no-referrer, Permissions-Policy.
- Subresource integrity pinned on the GSAP CDN script.
- Removed a dead "quick exit" that never wiped anything and left captured
  licence photos one Back gesture away via bfcache.
- Session replay scoped in code to the landing and state-picker screens only,
  and permanently latched off from the contacts step onward, so documents, the
  camera and the printed pack are un-recordable by construction.
- PostHog: IP anonymisation on, input masking on, media blocked, console and
  network capture off.

Accessibility
- Escape, focus trap, focus restore and background inert across all overlays.
- Prep drill operable by keyboard (Enter and Space).
- Emergency-contact fields properly labelled; they had been announcing the
  placeholder instead of the question.
- Canvas carry card given real alt text built from the user's own answers.
- Gold-as-text contrast raised from 1.71:1 to 7.24:1.
- Practice voice toggles padded to a 44px hit area.

Content
- Immigration guidance corrected: voluntary departure and stipulated removal
  named explicitly, and the caveat that silence can lengthen a stop rather than
  end it.
- New checkpoint rehearsal level built on settled law — Martinez-Fuerte (1976),
  Ortiz (1975), Brignoni-Ponce (1975), 8 USC 1357, 8 CFR 287.1 — including that
  leaving a checkpoint is a federal felony under 18 USC 758.
- Gated practice levels shown as locked rather than hidden.
- Carry card: a fill-in recall card rendered to a saveable PNG.
- "Practice genuinely lowers your risk" reworded to what the evidence actually
  supports: it lowers how threatening you appear.

Known limits
- Coverage is still TX, GA and NY. research/state-law-matrix.md holds ten more
  states of sourced findings, none of them shippable yet.
- No state is attorney-reviewed for this edition; every badge is dropped.
- Upsolve v. James (2d Cir., 9 Sep 2025) is an open question for the scored
  practice engine and should be reviewed before per-state content widens.

