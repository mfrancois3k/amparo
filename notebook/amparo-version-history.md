# Amparo — version history & reference index

Purpose: a lookup table. "Which version was it when X happened" → find it here,
then `git checkout vX.Y.Z -- .` in the repo restores exactly that state.

Repo: `C:\Users\mfran\Ai-Foundations\Amparo` — tags are annotated, dates below
are the actual tag creation dates (`git for-each-ref`), not estimated.

---

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

To restore any version exactly:
```bash
git checkout v2.2.0 -- .        # restore files at that tag, keep history
git reset --hard v2.2.0         # discard everything after that tag
```
