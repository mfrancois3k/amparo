# Changelog

Version history for Amparo. Every tag is a rollback point:
```bash
git checkout v2.2.0 -- .        # restore files, keep history
git reset --hard v2.2.0         # discard everything after
```

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

