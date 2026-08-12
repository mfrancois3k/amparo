# Amparo blind-spot audit — /app strangler port, Phase 5 (Moves 5.1-5.3) — round 2

**Scope:** Principal-engineer hostile review of `/app` right after Phase 5 shipped
end-to-end: practice engine FSM (`practiceEngine.ts`), the full practice UI
(`PracticeStep`/`PracticeLevelSelect`/`PracticeBeat`/`PracticeDebrief`), officer
audio (`usePracticeAudio.ts`), and the overlay a11y framework
(`useOverlayA11y.ts` + `DocsOverlay.tsx`). The full funnel (welcome → state →
you → lifelines → print → practice) is now built end to end for the first time.

**Not repeated here** (already found and logged/fixed this migration — see
`notebook/amparo-app-migration-log.md` and
`notebook/amparo-blindspot-audit-2026-08-12.md`): the extractor gap that
dropped hard-mode/checkpoint content, the crisis-tier UI rendering bug, the
two content strings with unescaped embedded markup (`ab_founder_note`,
`prx_resource`), the photo-upload keyboard-accessibility gap, the
`practice-engine-check.mts` JSON-import-attribute invocation bug, and the
PrintPack `dangerouslySetInnerHTML` comment undercount.

**Methodology:** Read `usePracticeAudio.ts`, `useOverlayA11y.ts`,
`DocsOverlay.tsx`, `storage.ts`, `practiceEngine.ts`, `PracticeStep.tsx`,
`PracticeBeat.tsx`, `PracticeDebrief.tsx`, `PracticeLevelSelect.tsx`, `App.tsx`
directly. Ran `npx tsx tools/practice-engine-check.mts`,
`node tools/app-storage-check.mts`, `node tools/sw-routing-check.mjs`,
`node tools/extract-app-content.mjs --verify`, `tsc -b`, `vite build`. Grepped
source and the built `app/assets/*.js` chunks for network/analytics code.
Findings below are graded CONFIRMED (reproduced or directly verified in
source/output) or PLAUSIBLE-UNVERIFIED (reasoned from source + documented
platform behavior, not exercised live in a browser this session — flagged
explicitly where that applies, per the ground rules).

---

## 1. Officer audio: stale `Audio`/TTS callbacks can fire after navigation away

**Verdict: CONFIRMED as a code-level gap. The audible consequence (stray
speech on an unrelated screen) is PLAUSIBLE-UNVERIFIED — reasoned from the
HTMLMediaElement/Web Speech spec, not reproduced in a live browser this
session.**

`usePracticeAudio.ts:77-83`:
```ts
const stopAll = useCallback(() => {
  try {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (hasTTS) speechSynthesis.cancel()
  } catch { /* ignore */ }
  setSpeaking(false)
}, [])
```
`stopAll` pauses the current `Audio` object and drops the ref, but never
detaches its `onplay`/`onerror`/`onended` handlers (`speak()`,
`usePracticeAudio.ts:126-129`, attaches them per-call and never calls
`removeEventListener` or nulls them out). Per spec, calling `.pause()` while
an element's `.play()` promise is still pending typically rejects that
promise with `AbortError`, which is exactly the branch wired to the TTS
fallback:
```ts
let fell = false
const fallback = () => { if (fell) return; fell = true; setSpeaking(false); speakTTS(beat, useEs) }
a.onplay = () => { fell = true; setSpeaking(true) }
a.onended = () => setSpeaking(false)
a.onerror = fallback
a.play().catch(fallback)
```
Nothing about this fallback checks whether the beat it's closing over is
still the current one, or whether the component that requested it is still
mounted.

Confirmed reachable call sites where `stopAll`/a fresh `speak()` (which itself
calls `stopAll()` at the top, `usePracticeAudio.ts:118`) runs while a prior
`play()` may still be in flight:
- **Rapid re-tap of "hear it again"** (`PracticeBeat.tsx:95` and `:114`) — both
  call `audio.speak(beat, lang, !answered)` with no debounce or disabled state
  while already speaking.
- **`back()`** (`PracticeStep.tsx:95`, `practiceEngine.ts:305-316`) re-enters
  `OFFICER_SPEAKING` for the previous beat, and the effect at
  `PracticeStep.tsx:54-64` calls `audio.speak()` again for the new `idx`
  without first calling `audio.stop()`.
- **Unmounting `PracticeStep` entirely** — navigating `practice → print` via
  the header back button, or any other route change in `App.tsx`'s
  `<Suspense>` block, unmounts the component tree. `usePracticeAudio`'s own
  unmount cleanup (`usePracticeAudio.ts:151`) calls `stopAll()`, which has the
  same listener-leak: a pending `.play()` promise rejecting *after* unmount
  still runs `speakTTS()`, which calls `speechSynthesis.speak()` — real,
  audible browser TTS — with no mounted-check guard anywhere in the hook.
  `React.useState` setters called after unmount are silently no-ops in React
  18+, so `setSpeaking(false)` is harmless, but `speechSynthesis.speak(u)` is
  not a React state update — it is a real side effect that fires regardless
  of whether anything is listening to `speaking` anymore.

**Net risk:** a user who taps "hear it again" quickly, or backs up mid-clip,
or leaves the practice screen entirely while a clip is still loading/network-
slow, can end up hearing the *previous* beat's officer line — or TTS
narrating a beat — spoken over the next beat's audio, or over a completely
different screen. This is exactly the "could two beats' audio overlap"
question the phase's own risk list raised.

**Fix shape (not applied — flagging per audit scope):** give each `speak()`
call a monotonic generation id (or store the current beat's key in a ref) and
have `fallback`/`onplay`/`onended` no-op if the generation has moved on since
the callback was attached — the same patter, applied to `speechSynthesis`
too (an id captured before `speechSynthesis.speak()`, checked in
`onstart`/`onend`/`onerror`). Cheaper alternative: null out the old audio's
handlers (`a.onplay = a.onerror = a.onended = null`) inside `stopAll()` before
dropping the ref — stops the leak at the pause() call site directly.

---

## 2. `app_prx` write path: silent quota loss and no cross-tab reconciliation

**Verdict: CONFIRMED by source reading — this is exactly how the code is
built; the two consequences below follow directly from the read-once /
write-blind design (not reproduced with an actual quota-exceeded
`localStorage` or two real tabs this session).**

`PracticeStep.tsx:43` reads progress **once**, at mount:
```ts
const [state, setState] = useState<EngineState>(() => initialState(readApp<PracticeProgress>('prx', emptyProgress())))
```
and persists on every change via:
```ts
useEffect(() => { writeApp('prx', state.progress) }, [state.progress])   // PracticeStep.tsx:47
```
`writeApp` (`storage.ts:194-196`) is the **silent** writer — `try { ... }
catch { /* quota or sandbox — in-memory only */ }` — no return value, no way
for the caller to know a write failed. This is a deliberate, documented
choice (`storage.ts:198-204` explains `writeAppReporting` exists specifically
because `writeApp`'s swallow-and-continue is "wrong for that one call site" —
referring to `DocsOverlay`'s photo writes). **`app_prx` is not that one call
site it was made for** — it, and `app_mute`/`app_voice`/`app_voiceLang`, all
go through the silent path (`usePracticeAudio.ts:139,145,146`;
`PracticeStep.tsx:47`), confirmed by grep — no caller in `engine/` or
`screens/practice/` uses `writeAppReporting`.

Two concrete failure modes this enables, both silent to the user:

- **Quota exhaustion.** `DocsOverlay`'s own comment says "a modern phone photo
  is 3-8 MB [before downscale]... localStorage gives the WHOLE origin ~5 MB,
  shared with /app's own state" (`DocsOverlay.tsx:24`). If a user has filled
  most of that quota with document photos and then completes a practice run,
  `writeApp('prx', ...)` can fail with `QuotaExceededError`, silently caught.
  The debrief screen still renders the completed run correctly (React state
  is in memory, unaffected), so the user sees success — but nothing persisted.
  A reload, or the next session, shows the run as never completed: streak,
  best score, and level-unlock progress for that run are gone with no error
  ever surfaced. Contrast with the docs path, where the identical failure
  mode *is* surfaced (`quotaError` state → `t.d_quota` message,
  `DocsOverlay.tsx:52,70,103`) — the inconsistency is the finding, not just
  the theoretical quota risk.
- **Concurrent tabs, last-write-wins.** There is no `storage` event listener
  anywhere in `app-src/src` (grepped, zero hits) and no re-read of `app_prx`
  after mount. Two tabs on `/app`'s practice screen each hold their own
  in-memory `progress` starting from whatever was in `localStorage` when each
  tab mounted. If Tab A completes level 0 and Tab B (mounted earlier, so its
  in-memory `progress.done` still lacks level 0) later completes level 1, Tab
  B's `writeApp('prx', ...)` overwrites Tab A's key with a progress object
  that has level 1 done and level 0 **not** — Tab A's completion is
  overwritten and gone, no merge, no conflict signal to either tab. Nothing
  about `/app`'s design prevents a user from opening two tabs (e.g. one on
  phone browser tab-switch, one restored from a crashed session).

**Severity:** Low-Medium for the shipped beta specifically — `/app`'s own
storage-boundary rule already accepts that `/app` state can diverge and isn't
promoted to root without a separate decision (`storage.ts:6-8`), so this
isn't a "the real pack is at risk" bug the way a root regression would be.
But it is exactly the kind of silent-loss behavior hard rule 3 (don't claim
more than what was tested/guaranteed) exists to catch, and the debrief screen
actively displays a completed, "saved" run in the quota case that in fact
never made it to disk.

---

## 3. Verification tooling — now clean (previous Medium resolved)

Re-ran the check the first same-day audit flagged as broken
(`practice-engine-check.mts` throwing on plain `node` due to a missing JSON
import attribute):

```
$ npx tsx tools/practice-engine-check.mts
practice-engine-check: PASS (18 checks)
```

The script's own header comment now documents `npx tsx`, not plain `node`,
and explains why (`practiceEngine.ts` uses *named* JSON imports for
tree-shaking, and Node's native ESM JSON loader never produces named exports
even with the `type: "json"` attribute — only a bundler-style loader like
`tsx`/Vite's does). Check count is 18, up from the 17 recorded in the
migration log for Move 5.1 — consistent with new G9 (`matchTypedAnswer`) /
G10 (`isCrisisText`) coverage added in Move 5.2. The other three scripts also
re-ran clean this session:

```
app-storage-check: PASS (13 assertions)
sw-routing-check: PASS (12 assertions)
extract --verify: PASS — 2437 strings, EN/ES structure identical
```

`tsc -b && vite build` is clean; entry chunk **92.41 kB gz** (matches the
Move 5.3 log exactly), `PracticeStep-*.js` **17.82 kB gz**, lazy-loaded.

---

## 4. Analytics / network honesty — holds for Phase 5

**Verdict: CONFIRMED.**

Grepped `engine/`, `screens/practice/`, `hooks/`, `components/DocsOverlay.tsx`,
`screens/PracticeStep.tsx` for `fetch(`, `XMLHttpRequest`, `WebSocket`,
`EventSource`, `https?://` literals, and `posthog`/`analytics`/`gtag`/`sentry`
(case-insensitive): zero hits. Grepped the **built** `PracticeStep-*.js` and
`DocsOverlay-*.js` chunks for the same analytics terms: zero hits. Phase 5
ships no network calls and no analytics, consistent with every earlier phase.

---

## 5. Overlay a11y (`useOverlayA11y`) — no zero-focusable-item bug found

Checked the specific edge case the task called out: an overlay with zero
focusable items. `useOverlayA11y.ts:53-55` handles it explicitly — falls back
to focusing the container itself via a temporary `tabindex="-1"`. The Tab
handler (`:60-61`) also no-ops safely if `focusableItems` returns empty
(browser default Tab behavior applies instead of a broken trap). `DocsOverlay`
always renders a close button and at least the "Done"/clear controls, so this
path isn't reachable in the shipped overlay today, but the guard is real and
correct.

Checked `focusableItems`' `offsetParent !== null` filter against `.ov-card`'s
actual CSS (`app-src/src/styles/you.css:25-28`): `.ov-backdrop` is
`position:fixed`, but `.ov-card` itself is normally flowed inside it
(`overflow-y:auto`, not `display:none`/`visibility:hidden`), so
`offsetParent` is non-null for its children — no false-negative here. Not a
finding.

---

## Summary table

| Area | Finding | Verdict | Severity |
|------|---------|---------|----------|
| `usePracticeAudio.ts` | Stale `Audio`/TTS callbacks never detached on `stopAll()`; can fire after navigation, rapid re-tap, or `back()` | CONFIRMED (code); audible overlap PLAUSIBLE-UNVERIFIED (not reproduced live) | **Medium** |
| `app_prx`/`app_mute`/`app_voice` writes | Silent `writeApp` (not `writeAppReporting`) — quota failures lose a completed run with no user-visible error, inconsistent with `DocsOverlay`'s own quota handling | CONFIRMED (source) | **Low-Medium** |
| `app_prx` cross-tab | No `storage` listener, no merge — last tab to write wins, can silently drop another tab's completed level | CONFIRMED (source, no live two-tab repro) | **Low** |
| `practice-engine-check.mts` | Previously-flagged Medium (broken invocation) — now fixed, 18/18 pass via documented `npx tsx` | RESOLVED | — |
| Analytics/network, Phase 5 | Zero fetch/XHR/analytics in source or built chunks | CONFIRMED | — |
| `useOverlayA11y` zero-item case | Handled correctly; not reachable today but guard is real | CONFIRMED, not a defect | — |

---

## Bottom line

No CRITICAL issues. Two **Medium-and-below** items worth fixing before
Phase 5 code gets more entrenched, both in `usePracticeAudio.ts`/storage
write paths rather than the FSM itself (`practiceEngine.ts` remains pure and
clean — no storage, no DOM, confirmed again by grep):

1. The officer-audio hook has no generation/mount guard on its
   `Audio`/`speechSynthesis` callbacks, so a stale beat's clip or TTS
   fallback can fire after the user has moved on — to the next beat, a
   previous beat via `back()`, or clean off the practice screen entirely.
   Verified in source; not reproduced audibly in a live browser this
   session, so the actual audible consequence is flagged unverified even
   though the code path that would cause it is confirmed real.
2. `app_prx`'s only writer is the silent-failure `writeApp`, not the
   `writeAppReporting` function this project already built for exactly this
   problem (and already uses correctly for photo docs) — so a quota failure
   silently loses a completed practice run while the debrief screen still
   shows it as a success. No cross-tab reconciliation either, so two open
   tabs can silently clobber each other's progress.

Everything else audited this pass holds: the previously-broken check script
now runs clean and documents the fix; Phase 5 ships genuinely zero analytics
and zero network calls, verified against both source and the built bundle;
and the overlay a11y hook's zero-focusable-item edge case is handled
correctly even though it isn't reachable in the shipped `DocsOverlay` today.
