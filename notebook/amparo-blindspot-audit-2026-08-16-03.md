# Amparo blind-spot audit — 2026-08-16 (round 3)

Scope: v2.22.13 "ZIP/county, pre-filled directory search" — the optional ZIP/county
field on step 2 (You), its `zipParam` feed into the Lifelines directory link for
NY/SC/DC, and its print on the physical wallet card. Principal-engineer lens per
the task brief: performance, service-worker/caching correctness, analytics
honesty, error handling, privacy/security posture, and anything else a hostile
reviewer would flag.

Every claim below was checked against the actual source (`index.html`, the
`app-src/` React port) or a real command/diff. Anything I could not directly
verify is labeled UNVERIFIED.

---

## 1. CRITICAL — root's `persist()` never saves `data.zip`; it is lost on every reload

**Verified in `index.html`.**

`saveInfo()` (line 4317) sets `data.zip` from the input and calls `persist()`.
`restore()` (line 3854) reads it back with `data.zip=s.zip||""`. Both sides
assume `zip` round-trips through `localStorage`. It doesn't:

```js
// index.html:3828-3834
function persist(){
  if(isDemo) return;
  try{
    const {state,name,ec,ecp,ec2,ecp2,att,email,skipped}=data;   // <-- no `zip`
    localStorage.setItem('sr_save', JSON.stringify({state,name,ec,ecp,ec2,ecp2,att,email,skipped,lang,step,hasPrinted,printedAt,printedEdition,printFeedbackGiven,usageFeedbackGiven}));
  }catch(e){}
}
```

The destructure allowlist in `persist()` is the pre-v2.22.13 field list —
`zip` was added to `data`, to the input's `oninput` handler, to `restore()`,
to `demoExit()`/`restart()`'s clear list, and to the wallet-card print template,
but this one allowlist was missed. Confirmed against the shipping diff
(`git diff v2.22.12 v2.22.13 -- index.html`): every other `zip`-touching line
appears in the `+` diff; the `persist()` function does not appear in the diff
at all, meaning it shipped unchanged and still excludes `zip`.

**Impact:** `data.zip` lives correctly in memory for the remainder of the
current page session (typing it, seeing it feed the Lifelines link, printing
immediately afterward — all fine, in-memory). But this app's whole
`sr_save`/`restore()` mechanism exists specifically to survive a reload: the
resume-chip flow (`window.__resumeStep`, restore():3864) and the stale-pack
reprint flow (`updateStalePack()` → `goM(3)`, i.e. straight back to Lifelines)
both depend on a real localStorage round-trip. For any user who fills in ZIP,
leaves (closes the tab, background-kills the PWA, comes back tomorrow), and
resumes or reprints — `data.zip` silently comes back as `""`. The wallet card
prints without the ZIP/county line even though the user entered it, and the
Lifelines link silently degrades from the filtered `?coverage_area=10001`
URL back to the plain, unfiltered one — with no error, no warning, nothing
that tells the user their data didn't stick.

This directly undercuts the feature's own promise: `i_zip_note` tells the
user "Printed on your pack for reference" — true only if they print in the
same session they typed it. It also directly undercuts the CHANGELOG's
framing ("never a dead field even for the other 45 states... it's printed on
the pack either way") — for a *returning* user in *any* state, it can become
a dead field despite being entered.

**Fix is a one-line allowlist addition**: add `zip` to the destructure in
`persist()` (and to the object literal passed to `JSON.stringify`). Root
cause, one call site — every save path (`saveInfo()`, the field's own
`oninput`) already routes through this single `persist()` function, so this
is the only place that needs the fix.

**app-src (`/app`) does NOT have this bug** — verified in
`app-src/src/services/storage.ts` and `YouStep.tsx`: `writeApp('you', next)`
always writes the complete `YouInfo` object (name/ec/ecp/ec2/ecp2/att/**zip**)
on every keystroke, with no field allowlist to fall out of sync. Only the
hand-authored root file has this class of bug, because it's the only side
that maintains a manual field list instead of persisting the whole object.

---

## 2. MEDIUM — the top-level privacy banner is no longer strictly true for the 3 zipParam states

**Verified in `index.html` and `app-src`.**

The pilot banner, shown on every screen: `"Free. Nothing you enter leaves
your phone — no account, no upload."` (index.html:1692, 1856; App.tsx:108).

For NY/SC/DC, clicking the enhanced Lifelines link does send the typed
ZIP/county to a third-party site as a URL query parameter
(`lawhelpny.org/find-legal-help?coverage_area=10001`, confirmed live per the
CHANGELOG). This is user-initiated (an explicit click on a link, not a
background request Amparo itself fires — confirmed: the href is built
client-side for display only; nothing calls `fetch`/`XHR` with the ZIP), and
it's a reasonable, expected behavior for a "search my area" link, comparable
to typing a query into any search box. But it is a real, if narrow,
contradiction of the banner's absolute wording: something the user typed
*does* leave the phone, to a third party, once they tap that specific link.

The field-level copy (`i_zip_note`) does disclose this in softer language —
"it also pre-fills the search on Lifelines" — which a careful reader could
infer means the ZIP travels with that click, but it never says so as
plainly as "leaves your device" or "sent to lawhelpny.org." The top-level
banner itself carries no caveat and is shown unconditionally, including on
the very screen with the ZIP field.

A hostile privacy reviewer would flag the gap between "nothing you enter
leaves your phone" (stated as an absolute, on every screen) and the actual
behavior of one specific optional field once its one specific link is
tapped. Recommend either scoping the banner's wording ("nothing you enter is
stored or uploaded by us" is still true) or adding an explicit one-line
caveat to `i_zip_note` naming the destination domain.

---

## 3. Verified GOOD — session replay structurally excludes the ZIP field

**Verified in `index.html`.** PostHog session recording (`ph.amparohq.com`
proxy) is explicitly scoped off after step 1 by `srReplayGuard(n)`
(index.html:3890-3898): `if(n>=2){ ...posthog.stopSessionRecording(); return; }`,
called from `go(n)` *before* `step=n` is set, and again at module load
(`srReplayGuard(step)`, line 4567). The ZIP field lives on step 2 (You,
confirmed at index.html:3444-3469), so recording is stopped before that
screen is ever rendered — the field was never in scope to begin with, this
isn't a masking rule that could silently regress. `session_recording:
{maskAllInputs:true, maskTextInputs:true}` is also set globally as defense
in depth (index.html:1667) with a code comment explicitly documenting that
this was pinned after a prior near-miss (the step-1 search input). No new
gap introduced by this feature.

Analytics events that fire near the Lifelines link
(`phLifelineClick`/`sr_lifeline_link_clicked`, index.html:4071-4074) send
only `{state, name, type, lang}` — confirmed `zip` is not included in any
`ph(...)` call anywhere in the file (`grep -n "ph('sr_"` — 40 call sites
checked, none reference `data.zip`).

---

## 4. Verified GOOD — no XSS, no URL-structure injection

- Root's wallet-card print template escapes the field:
  `${data.zip?`<b>...ZIP / county:</b> ${esc(data.zip)}<br>`:''}`
  (index.html:4468-4469).
- app-src's `PrintPack.tsx` renders `{you.zip}` via JSX, which auto-escapes
  (line 236).
- Both sides build the outbound href with `encodeURIComponent(zip)`
  (index.html:4157; `LifelinesStep.tsx:135`), so a ZIP value containing `&`,
  `#`, or other URL-structural characters can't break out of the query
  string or redirect to an attacker-controlled origin — it can only ever
  become the value of the one whitelisted `zipParam` key, on the one
  hardcoded `c.href` origin baked into `STATE_LEGAL_AID`/`STATES`.

---

## 5. Verified GOOD — app-src's "read zip once" pattern is safe

`LifelinesStep.tsx:55`: `const [zip] = useState(() => readApp<YouInfo>('you', EMPTY_INFO).zip)`
is documented in-file as "read once, not reactive." I checked whether this
could go stale (user edits ZIP, goes back to You, edits again, returns to
Lifelines without a fresh read) — it can't: `App.tsx:141-166` renders each
step behind `route.name === 'x' ? <XStep/> : null`, so `LifelinesStep`
fully unmounts on navigating away and remounts (re-running the `useState`
initializer) on navigating back. Confirmed by reading the actual route
switch, not assumed from the "read once" comment.

---

## 6. Verified GOOD — no service-worker/caching correctness issue

Read `sw.js` in full. Root's service worker serves page navigations
**network-first** (`e.request.mode === 'navigate'` → `fetch()` first, cache
only as offline fallback; index.html and this whole feature are inline in
that single navigated document). This means the shipped ZIP feature reaches
every online user immediately on next load with no cache-version bump
needed — verified this is the existing, intentional design (there's an
in-file comment explaining the earlier cache-first bug this replaced), not
something this feature had to account for. `/app`'s own build/service
worker is a separate Workbox-based precache (guarded off explicitly by root's
SW at `sw.js:56`); its hashed-chunk cache-busting is a build-pipeline
concern, not something this hand-authored feature touches — UNVERIFIED
whether a fresh `/app` production build was actually run and deployed after
this change (no build log inspected), but the mechanism itself is sound by
inspection.

---

## 7. Verified GOOD — NY/SC/DC parity between root and `/app`

`index.html` and `app-src/src/content/states.json` carry identical
`zipParam` values for the three live states:
- NY: `"coverage_area"` (index.html:2597; states.json:194)
- DC: `"location"` (index.html:2689; states.json:388)
- SC: `"location"` (index.html:2705; states.json:485)

`statesResolved.ts` synthesizes the other 48 states the same way root does
at runtime (confirmed against the in-file comment documenting a prior real
bug where this synthesis was missing), so `zipParam` presence/absence tracks
correctly across both surfaces for all 51 entries, not just the 3 cited
states.

---

## 8. Not re-verified this round (already covered by round -02 / prior rounds)

Print-pack QR codes, the `pack_zoom_close` aria-label, and the Welcome
shortcut routing were the subject of v2.22.10-12 and this round's own prior
audits; nothing in v2.22.13's diff touches those code paths, so they were
not re-checked here.

---

## Summary

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | `persist()` never saves `data.zip` — silently lost on reload/resume in root | CRITICAL | Confirmed via source + shipping diff; not yet fixed |
| 2 | Pilot banner's absolute "nothing leaves your phone" wording is inaccurate for the 3 zipParam states once the link is clicked | MEDIUM | Confirmed; disclosure exists but is soft and not on the banner itself |
| 3 | Session replay excludes the ZIP field/screen | — | Verified safe, no action needed |
| 4 | No XSS / URL-injection surface from the ZIP value | — | Verified safe, no action needed |
| 5 | app-src's non-reactive ZIP read is safe due to full remount on navigation | — | Verified safe, no action needed |
| 6 | Root's SW is network-first; no cache-bump needed for this change | — | Verified safe, no action needed |
| 7 | zipParam parity between root and `/app` for NY/SC/DC | — | Verified identical |

**Recommended fix, in priority order:** add `zip` to the destructured
allowlist in `persist()` (index.html:3831) and to the object passed to
`localStorage.setItem` on the next line. One line, one function, fixes the
only real regression found this round.
