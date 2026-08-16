# Amparo blind-spot audit — v2.22.8 (pack zoom) + v2.22.9 (state legal-aid directories)

**Agent C of `/amparo-loop`, run standalone. Second round today — covers what
shipped AFTER `notebook/amparo-blindspot-audit-2026-08-16.md` (which audited
earlier work today). Lens: principal engineer.** Every finding below was
checked against source at the cited line or a real command/network output —
nothing is inferred from a commit message alone.

Commits in scope: `19b3a34` (feat: tap-to-zoom pack pages, v2.22.8) and
`ed4d23c`/`3464ad4`/`b9038ef` (feat: verified state legal-aid directories,
v2.22.9).

---

## 1. Pack-zoom scoping bug — CONFIRMED fixed, both codebases clean

**Root (`index.html`):** `packZoomOpen` (line 4068) and `packZoomClose` (line
4087) sit at column 0, sandwiched directly between two other confirmed
top-level functions — `phLifelineClick` (ends line 4057) above and
`let _llTab=0` (line 4090) below — with no enclosing `function`/brace between
them. They are genuinely top-level, not nested inside `render()`. The
in-source comment (lines 4063-4067) documents the original bug and how it was
caught (calling `window.packZoomOpen` in a live browser, not re-reading the
diff) — that failure mode is not reproducible now.

**`/app` (`app-src/src/components/PackZoomOverlay.tsx`):** a proper React
component, not string-templated `onclick` HTML, so the original root bug
class (functions invisible to the global scope) cannot occur here at all —
different architecture sidesteps the bug rather than re-risking it.

**Overlay coexistence (`useOverlayA11y.ts`, `PrintStep.tsx`):** `/app` now has
two overlay types, `DocsOverlay` (`papersOpen` state) and `PackZoomOverlay`
(`zoomPage` state), both declared independently in `PrintStep.tsx:30,33` with
no shared gate. Traced every setter: `setPapersOpen(true)` only fires from the
`docrow` div's onClick/onKeyDown (`PrintStep.tsx:111-113`); `setZoomPage(n)`
only fires from a thumbnail's onClick/onKeyDown (`PrintStep.tsx:87-89`). Both
triggers are descendants of `<div id="app-root">` (`App.tsx:66`). Each
overlay's `useOverlayA11y(cardRef, true, onClose)` call marks `#app-root`
`inert` for its entire mount lifetime (`useOverlayA11y.ts:48`,
`root?.setAttribute('inert','')`) and only removes it on unmount
(`useOverlayA11y.ts:71`). `inert` disables both pointer interaction and
focusability of the whole subtree, so once either overlay is open, the
trigger for the *other* overlay is unreachable by mouse, touch, or keyboard —
they cannot both be opened through the UI. `useOverlayA11y.ts:14-22`'s own
comment already documents this reasoning (no z-order "topmost wins" logic
needed because /app's overlays are never nested).

One theoretical, pre-existing gap, not introduced by this shipment: `inert` is
applied inside a plain `useEffect` (fires after paint, not
`useLayoutEffect`), so there's a one-frame window after an overlay mounts
before the background becomes inert. This same pattern already existed for
`DocsOverlay` before `PackZoomOverlay` was added — it isn't a new regression
from this round, just an existing micro-race neither overlay closes.

**Verdict: no regression, no new bug. Both fixes hold up under direct source read.**

---

## 2. `extract-app-content.mjs --verify` — now PASSES cleanly (real output below)

Ran from repo root, current working tree, right now:

```
$ node tools/extract-app-content.mjs --verify
  meta.json          sha256:3d7ed25049e60cce  0.7 kB
  states.json        sha256:4438128c9aa862bb  46.7 kB
  pack-extra.json    sha256:ac85e174d475a332  32.7 kB
  ui.json            sha256:9ddbfd6d0e843027  0.9 kB
  icons.json         sha256:2f6190d5063c0860  7.8 kB
  map.json           sha256:071fd5243b8dbdcc  45.6 kB
  prep.json          sha256:6c05920cb399ac87  4.4 kB
  practice.json      sha256:02866f56e6a1fc3c  44.5 kB
  t.en.json          sha256:dd6265b722ffce33  38.1 kB
  t.es.json          sha256:159a94002842598e  40.4 kB
  i18n: 475 top-level keys, 528 deep paths, EN/ES structure identical
  strings verified present in index.html: 2588 (2445 byte-identical, 143 via source escapes/entities)
PASS — content matches index.html
```

This resolves the CRLF-artifact gate failure the prior audit (round 1, same
day) flagged as MEDIUM. `npm run build` in `app-src/` is unblocked on this
machine right now.

---

## 3. Root vs `/app` lifelines synthesis — verified identical for all 51 states, not just spot-checked

The task assumed the merge logic was "written twice, once in each codebase."
It isn't, quite — `app-src/src/content/statesResolved.ts:31` imports
`STATE_LEGAL_AID` directly from `states.json`, which is the extraction
tool's output of root's own `index.html` object (confirmed byte-identical:
diffed all 24 keys programmatically, `0 diffs`, same 24-key set in both
files). So the *data* is single-sourced; only the *merge algorithm*
(`Object.keys(...).forEach` in root vs `Object.fromEntries(Object.keys(...).map(...))`
in `/app`) is duplicated.

Ran both algorithms against the same extracted `states.json` and diffed the
resulting `lifelines` array for **all 51 states** (not a sample):

```
total states compared: 51 diffs: 0
```

All 24 newly-verified states produce a 6-entry lifelines array
(`[legal-aid entry, ...5 BASE_LIFELINES]`) identically in both codebases, and
the legal-aid entry itself matches name-for-name. **No drift, confirmed
exhaustively rather than spot-checked.**

---

## 4. HIGH — 5 of the 24 verified legal-aid URLs are missing `www.` and will 404 or fail TLS for real users tapping the link as generated by the app

**Verdict: CONFIRMED via live network requests (WebFetch, cross-checked with
`curl` using a real browser User-Agent where WebFetch's own result was
ambiguous).**

Root's `lifeContact()` (`index.html:4039-4046`, mirrored in
`app-src/src/screens/*` for the lifeline tab) builds the clickable link as
literally `'https://' + p` — no `www.` normalization, no redirect handling
before use. So whatever string sits in a `p:` field in `STATE_LEGAL_AID` is
exactly the URL a real user's tap constructs and opens.

Tested every `p:` value bare (as the app would construct it) and, where it
failed, retested with `www.` prepended:

| State | `p:` value (as shipped) | Bare result | `www.` result |
|---|---|---|---|
| AL | `alabamalegalhelp.org/find-legal-help/directory` | **404** | 200, real directory (15 orgs, matches `d_en`) |
| CA | `lawhelpca.org/find-legal-help` | **TLS handshake fails** — server returns a certificate for a *different* domain bundle entirely (SAN list has `www.lawhelpca.org` but not the bare host) | 200, real directory (58 counties, matches `d_en`) |
| MS | `mslegalservices.org/find-legal-help/directory` | **404** | 200, real directory (45 orgs, matches `d_en`) |
| NC | `lawhelpnc.org/get-help-from-a-lawyer` | **404** | 200, real directory (100 counties, matches `d_en`) |
| PA | `palawhelp.org/find-legal-help/directory` | **404** | 200, real directory (161 orgs, matches `d_en`) |

For CA specifically, a real browser would show a certificate-warning
interstitial rather than a clean 404 — worse UX for a legal-aid tool than a
plain 404, since it looks like a security threat rather than a broken link.

**These are not fabricated domains** — the `www.` variant of every one of
these five is a legitimate, live, correctly-described resource matching its
`n`/`d_en`/`d_es` fields exactly (verified by content, not just status code).
The bug is specifically the omitted `www.` prefix in the five `p:` strings,
combined with the app's link-builder doing no normalization.

**Not a fatal break for the end user** — `STATE_LEGAL_AID` entries are
prepended ahead of the existing `BASE_LIFELINES` (index.html:2712-2715), so
these 5 states still show working national fallback links below the broken
one. But a legal-aid product putting a 404/cert-error link at the *top* of
its most locally-relevant resource, for someone anxious enough to be using
the tool, is the kind of thing a hostile reviewer finds in minutes.

**19 of 24 states checked clean** (9 confirmed 200 directly: KY, MA, DC, AZ,
FL, IL, MD, plus LA and VA — the latter two initially returned `403` from
WebFetch specifically, traced to WebFetch's own fetcher being bot-blocked;
confirmed with `curl -A "Mozilla/5.0...Chrome/120..."` that both return a
clean `200` for a real browser UA, so those two are **false alarms**, not
bugs). 10 states (IN, MI, MN, MT, OH, OR, SC, TN, WA, WI) were not
individually re-verified this round beyond the exhaustive data-identity check
in Finding 3 — flagging as not yet spot-checked rather than assuming clean.

**Fix (not applied — audit only, per task scope):** prepend `www.` to the five
`p:` values in `index.html`'s `STATE_LEGAL_AID` (AL, CA, MS, NC, PA), then
`node brain/brain.js` is irrelevant here but re-run
`tools/extract-app-content.mjs` (no `--verify` flag) to regenerate
`states.json` so `/app` picks up the fix automatically via the existing
single-source-of-truth pipeline confirmed in Finding 3 — no `/app`-side edit
needed.

---

## Summary table

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | — | Pack-zoom scoping (root top-level fix; `/app` PackZoomOverlay/useOverlayA11y overlay coexistence) | No regression found; both clean |
| 2 | — | `extract-app-content.mjs --verify` | Now PASSES cleanly (real output captured) |
| 3 | — | Root vs `/app` lifelines synthesis for 24 new states | Verified identical for all 51 states (exhaustive, not sampled) |
| 4 | HIGH | 5 of 24 verified legal-aid URLs (AL, CA, MS, NC, PA) omit required `www.` — 404 or TLS failure for real users; CA fails as a cert warning, not just a 404 | Confirmed via live requests; not fixed (audit scope); 10 states not yet individually re-checked |
