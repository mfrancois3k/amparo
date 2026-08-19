# Blind-spot audit — Practice Arena (v2.23.0/v2.23.1)

Date: 2026-08-18 · Lens: principal engineer / hostile reviewer · Scope: `arena/index.html`, `arena/audio/`, `arena/fonts/`, root `sw.js`, root `index.html` hub link, `app-src/src/screens/practice/PracticeHub.tsx`.

Every finding below was verified against source or command output. Nothing here is speculative unless marked.

---

## HIGH — findings that would embarrass the project

### H1. The "Privacy — the honest version" modal is dishonest (stale, wrong direction)
`arena/index.html:673` (EN) / `:678` (ES), string `p2`:

> "Fonts currently load from Google Fonts (your IP is visible to Google when the page loads). The production version will self-host fonts."

**False.** Fonts ARE self-hosted: 9 `@font-face` rules all point at `fonts/f0.woff2`–`f8.woff2` (`arena/index.html:8–49`), and a grep for `https?://` across the whole file returns **zero** external URLs. The modal that brands itself "the honest version" ships a claim that was true in the design bundle and false in the shipped page. It understates the app's own privacy — the one direction that's merely embarrassing rather than harmful — but on a product whose entire pitch is trust, the privacy modal being wrong at all is the headline finding. Fix: replace `p2` (EN+ES) with the self-hosted statement.

### H2. The share message claims "works offline" — the arena does not work offline
`arena/index.html:674` (`famMsg`): "…free, private, **works offline**. My readiness is at {R}%…" (ES equivalent at `:679`).

Verified behavior: the arena registers **no** service worker (0 hits for `serviceWorker` in the file), and root `sw.js:62` deliberately returns early for `/arena` and `/arena/*` — all request modes, navigations and subresources alike — so nothing under `/arena/` is ever cached by the root SW. Offline, a visit to `/arena/` is a browser network-error page. The guard is correct (it exists to stop the CORE cache-poisoning bug and it does; audio/fonts under `/arena/audio/`, `/arena/fonts/` are excluded from root SW handling entirely, so they can't leak into `amparo-v3` either). But the family-challenge copy tells recipients the thing works offline. Either give the arena its own scoped SW or delete "works offline" from `famMsg`.

### H3. Storage-blocked browsers get a dead page (boot-time uncaught throw)
- `arena/index.html:1031` — the initial `localStorage.getItem` is try-wrapped. Good.
- `arena/index.html:1036` — `saveA()` is a bare `localStorage.setItem`, no guard.
- `arena/index.html:1038–1042` — the streak IIFE runs at top-level script eval and calls `saveA()` whenever `A.streak.last !== today` — i.e. **on every first visit and every new day**.

In a browser where storage access throws (Chrome with cookies blocked, some private modes), that `setItem` throws uncaught during script evaluation, and everything below line 1042 — all UI wiring, `renderArena`, every click handler — never executes. Result: a fully painted, fully dead page. Secondary: with a full quota, every answer click throws inside `commit()` after `saveA()` (state silently not saved, console noise). One try/catch inside `saveA()` fixes both.

### H4. Fake checkout contradicts its own demo label with fabricated confirmations
The pay modal DOES carry a disclaimer — `arena/index.html:657` "Design demo — no card is charged. Stripe / Apple Pay goes here in production." (ES present at `:680`, `payDemo`). Credit where due. But what happens on "Pay $3.99" (`payNow` handler, `:1380–1385`):

1. Reads the optional email field, does nothing with it except echo it back.
2. Shows "**Purchase confirmed!**" (`payOkT`, `:662`).
3. `payOkSub` (`:675`/`:680`) fabricates "**receipt sent to {email}**" — there is no network code in the entire file (0 hits for `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`), so no receipt is or can be sent.
4. "⬇ Download your PDF pack" is `window.print()` (`:664`) — which prints the **same free glovebox card** (`buildPrintCard`, `:1474`) the free flow prints. The $3.99 "Script Pack" and the free pack are literally the same artifact.

Hostile-reviewer take: on a legal-rights product aimed at vulnerable users, a checkout that says "Purchase confirmed! receipt sent to you@example.com" — with a small-print demo note above the fold and a falsehood below it — is a trust liability even as a demo. Minimum fix: change `payOkT`/`payOkSub` to demo-honest copy ("Demo complete — in production your receipt would go to …") and drop the fake receipt line. The changelog already flags checkout as a known follow-up; the *fabricated confirmation strings* are the part the changelog doesn't cover.

### H5. "Wipe my data" and `p4` overclaim scope
`p4` (`:673`): "'Wipe my data' below erases **everything Amparo stored on this device**." `wipeQ` (`:673`): "Erase ALL Amparo data on this device…"

The handler (`:1489`) removes exactly `amparoArena` and `amparoGuidedFlow`, then reloads. It correctly does **not** touch root's `sr_save` (verified: those are the only two `removeItem` calls in the file) — which is the right engineering call (the arena shouldn't nuke the pack builder's save), but it means "ALL Amparo data on this device" is false on amparohq.com, where root, `/app`, and `/arena` share the device and all brand themselves Amparo. Root's `sr_save` (state, ZIP, language) and `/app`'s storage survive the wipe. Fix the string ("erases everything the *Arena* stored"), or link out to the root wipe.

---

## MEDIUM

### M1. `amparoGuidedFlow` is a phantom key — read and wiped, written by nothing
Repo-wide grep (`*.html`, `*.js`, `*.ts`, `*.tsx`): the only file that mentions `amparoGuidedFlow` is `arena/index.html` (`:1045` read, `:1489` remove). No surface ever writes it. The "pull state from guided flow" branch is dead code from the design bundle; the state carryover that actually works is the `sr_save` → `P2F` fallback (`:1049–1054`). Delete the dead branch (and the wipe entry), or note why it stays.

### M2. Self-XSS: user free text rendered via innerHTML
`answer()` pushes raw user text into `A.hist` (`:1274`, `h.y`) and `renderArena` renders history with string-concatenated `chat.innerHTML = html` (`:1146–1151`). Typing `<img src=x onerror=alert(1)>` into the free-text box executes it. Mitigations that make this LOW-ish in practice: no server, no cookies, nothing to exfiltrate, `A.hist` is reset to `[]` on every load (`:1031`) so it doesn't persist, and the only attacker is the user. Still: it's the one place untrusted input meets innerHTML, and a one-line escape (`textContent`-based) closes it. Same pattern is safe elsewhere — `payEmailIn` is echoed via `textContent` (`:1382`), scene line via `textContent` (`:1134`).

### M3. Free-text matcher generosity (known, confirmed)
`submitFree` (`:1346–1356`): `hit = overlap>=2 || KEY.some(k=>lower.includes(k))` — the global `KEY` list (`:682`) accepts "silent/lawyer/consent/…" on **any** turn and then plays that turn's canned good-answer feedback, which may describe a different action than the user typed (the v2.23.1 changelog's "announcing movement" observation). Confirmed in source; already queued for the module design review. Also note: `overlap>=2` against words >3 chars means short correct answers ("I do not consent") can pass only via `KEY` — the two mechanisms mask each other's failure modes.

---

## VERIFIED CLEAN (receipts)

- **Audio pipeline is exactly as advertised.** Reconstructed all 24 scenarios in Node (`const SCEN=[…]` at `:683–830` plus the two `SCEN.push(` blocks at `:831`, `:903`), computed `djb2(lang+':'+line).toString(36)` for every officer line: **100 unique EN + 98 unique ES = 198 keys; all 198 files in `arena/audio/` matched; 0 missing, 0 orphans.** The changelog's `u8sk0j.mp3` ES spot-check key exists. No officer line contains HTML (the `innerHTML→textContent` decode at `:1154` is defensive only).
- **Fallback chain can't loop or leak.** `speakOfficer` (`:1191–1201`): one `Audio` at a time; `stopVoice` pauses and derefs the old one. On 404 both the error event and the `play()` rejection can fire `onerror`, but the `__officerAudio!==a` guard (`:1196`) makes the second call a no-op — no double-speak, no loop. TTS fallback checks `'speechSynthesis' in window` first (`:1197`); everything try-wrapped.
- **Silence choke point holds.** All four user actions funnel to `stopVoice()`: choice click and typed submit via `answer()` (`:1250`), mic start directly (`:1364`), freeze-timeout via `answer()` (`:1166`), plus sound-off (`:1481`) and run-done (`:1155`).
- **SW guard covers all modes.** `sw.js:44` exits non-GET; `:62` exits `/arena` + `/arena/*` before the navigate/asset branches, so arena HTML can never poison `CORE` and arena subresources never enter `amparo-v3`. Same-origin check present; query strings irrelevant (pathname test). Theoretical only: a case-variant path (`/Arena`) would bypass — matters only if the host serves it, which Netlify-style hosts don't.
- **P2F postal→FIPS map (`:1050`) — all 51 entries correct** against Census state FIPS, including the gaps (no 03/07/14/43/52) and DC=11. `ST_NAMES` (`:1055`) keys align.
- **Privacy p1 ("no account, no server, no analytics, no cookies") is TRUE for the arena.** Zero hits in `arena/index.html` for `ph(`, `posthog`, `gtag`, `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`. The only analytics touch is ROOT's hub link firing `ph('sr_arena_opened',{state,lang})` before navigation (`index.html:3678`) — note it does send the user's chosen state+lang to PostHog from the root page; `ph()` respects demo mode (`index.html:1672`).
- **p3/micQ opt-in claim matches the code.** Mic is gated: no `SpeechRecognition` → `alert(micNo)` (`:1361`); first use → `confirm(micQ)` before anything starts, `A.micOk` persisted (`:1362`); recognition object is per-click, `onend`/`onerror` both clear the live state (`:1367–1368`). Nothing records or stores audio.
- **No mojibake.** 0 occurrences of U+FFFD and 0 of the classic `â€`/`Ã©`/`Â¿`/`Ã±` misdecode sequences. The QA note's lead is dead. (The lone "TODO" grep hit at `:678` is Spanish "TODOS".)
- **No `console.log`, no `TODO` comments, no `#__bundler_err`** — the bundler error sink appears nowhere in the repo (repo-wide grep: 0 hits); it was evidently stripped during unbundling.
- **/app hub card** (`PracticeHub.tsx:180–183`) links `/arena/` with the extracted `hub_arena` strings and, correctly, no analytics call (the app surface has its own conventions).

## Unverified / out of scope
- `DUTY_INFORM` and `STOP_ID` FIPS lists (`:1058–1059`) carry their own "verify with counsel before launch" comment — legal accuracy of *which states* belong on those lists was NOT verified here; that is attorney-review work, and the in-app About text (`ab3b`) already says attorney review is pending.
- Voice quality/content of the 198 MP3s (hashes verified, audio not listened to).

## Suggested fix order
1. H1 `p2` string (one-line edit, both langs) — the privacy modal must not be wrong.
2. H2 `famMsg` "works offline" (delete two words ×2 langs, or ship an arena SW).
3. H3 try/catch in `saveA()` (one line).
4. H4 demo-honest `payOkT`/`payOkSub` strings.
5. H5 wipe copy scope; M1 delete phantom `amparoGuidedFlow` branch; M2 escape `h.y`.
