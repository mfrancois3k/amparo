# Changelog

Version history for Amparo. Every tag is a rollback point:
```bash
git checkout v2.6.0 -- .        # restore files, keep history
git reset --hard v2.6.0         # discard everything after
```

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

