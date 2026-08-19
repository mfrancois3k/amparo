# Blind-spot audit #2 — Practice Arena v2.24.0

Date: 2026-08-18 · Lens: principal engineer / hostile reviewer · Scope: `arena/index.html` (1561 lines) after ~10 rounds of same-day string surgery. Every finding verified against source bytes or a real Node run (script extracted to scratchpad, `node --check` passes; UI banks, SCEN data and the matcher were evaluated and attacked programmatically). Prior audit: `notebook/amparo-blindspot-audit-2026-08-18.md`.

---

## HIGH

### H1. The rebuilt free-text matcher is still polarity-blind — "yes, search my car, I consent" scores CORRECT on 10 refusal turns
`arena/index.html:1391-1393`. The v2.24.0 fix (changelog item 1) replaced the global KEY list with per-turn majority overlap:

```js
const gw=[...new Set(goodC.t[L].toLowerCase().replace(/[^a-záéíóúñü\s]/g,' ').split(/\s+/).filter(w=>w.length>3))];
const overlap=gw.filter(w=>lower.includes(w)).length;
const hit=gw.length>0&&overlap>=Math.ceil(gw.length/2);
```

The `w.length>3` filter deletes **"do", "not", "don't" (→ "don"/"t")** — the entire negation. "“I do not consent to a search.”" reduces to `gw=['consent','search']`, need=1. Ran the shipped algorithm against all 200 good lines (both langs): the attack string **"yes go ahead and search my car, I consent" scores a HIT — full credit plus the good-answer feedback — on 10 distinct EN turns**: routine t3, step1 t3, step2 t1, step2 t2, step4 t1, hard t1, pass2 t2, pass3 t2, l301 t2, l304 t3. On a rights trainer, typing *consent to a search* is graded as correctly *refusing* one. This is the same class of bug the release notes claim fixed ("the old list scored 'yes go ahead and search, I consent' as correct" — it still does, on the turns where it matters most). ES survived my attack strings, but the mechanism is identical. Fix: check for negation asymmetry (if the good line contains a negator and the user text affirms, force miss), or drop the length filter to >=2 and require the negator word itself.

### H2. "Today's drill" bypasses the door hold — held content reachable starting Aug 26
`arena/index.html:1544-1554`. The daily-drill IIFE builds `flat=SIT.flatMap(...)` with **no `HELD_SITS` filter** — door1–door4 sit at flat indexes 4–7 of 24. `day%24` lands on them **Aug 26–29, 2026** (and every 24 days after). The button renders the door title with no 🔒, and its onclick sets `A.sit=pick.sit;A.lvl=pick.lvl` directly — none of the guards fire (the `HELD_SITS[A.sit]` reset at `:1363` runs only at load; the sidebar's `held` alert at `:1106` and `nextUnfinished`'s filter at `:1359` are not on this path). One click = full un-reviewed door-knock scenario, the exact content v2.24.0 item 3 says "saved states and auto-advance can't land there." All other A.sit writers verified clean: load-time crafted localStorage (`sit:'door',lvl:2`) is reset at `:1363` before first render; sidebar click blocked `:1106`; `nextUnfinished` filters `:1359`; mPressure doesn't touch sit; resume bar only scrolls `:1537`. Fix: `SIT.filter(s=>!HELD_SITS[s.id]).flatMap(...)`.

### H3. `answering` soft-lock — one wrong answer + any navigation bricks all inputs until reload
`arena/index.html:1275-1313`. On a wrong answer, `answering=true` and the only resets are the retry prompt's own buttons (`commit()` via #sayGo, or #retryGo). But the prompt lives inside #chat, and **every navigation path rebuilds chat and destroys it without resetting the flag**: sidebar scenario click (`:1106`), level tab (`:1136`), language toggle (`:1092`), gentle toggle (`:1508`), drill button (`:1554`). After that, `answer()` returns early forever — choice buttons, typed submit, mic, and the freeze-timeout are all dead; the clock's freeze path even `clearInterval`s itself against the no-op. Reproduce: answer wrong → click any level tab → click any response: nothing. Fix: `answering=false` at the top of `renderArena()` (it is only ever entered with a fresh prompt), or in each navigation handler.

## MEDIUM

### M1. Swan consent gate only guards the level tabs — auto-advance and the drill walk straight into hard mode
The `hardQ` confirm lives solely in the tab onclick (`:1136`). `nextUnfinished()` (`:1355`) — reached from "Practice another scenario" (`mAgain :1364`) and post-checkout (`payOkClose :1427`) — sets `A.lvl` to the first unfinished level, which after three completions **is** the swan level, and renders it with no confirm. Same for the daily drill when `pick.lvl===3` (6 of 24 days) and for a saved/crafted `A.lvl:3` at load. Contradicts changelog item 5 ("ask consent before entry"). The no-confetti half is solid (`:1331` checks `isSwanLvl` at finish). Also: `window.__swanOK` is one global — a single yes unlocks every swan level all session (may be intended; note it).

### M2. 650 ms commit race corrupts the next run
`window.__answerTO=setTimeout(commit,650)` (`:1314`) is **never cleared** by any navigation. Click a correct answer, then switch scenario/level/language within 650 ms: `commit()` runs against the NEW run — pushes a history entry pairing your old answer with the new scenario's turn-0 officer line, advances `A.turn` to 1 (skipping the new run's first beat), and saves. Fix: `clearTimeout(window.__answerTO)` alongside the existing `clearInterval(window.__pressT)` in navigation handlers, or guard commit with a run token.

### M3. String-surgery residue: three orphaned i18n keys, incl. the last "receipt" trace
Programmatic diff of both banks (155/155 keys, symmetric): `payEmail` ("Email for your receipt (optional)" / "Correo para su recibo (opcional)"), `pauseL`, `resumeL` are referenced by nothing (no `T()`, no `data-i18n`, no dynamic path — every other bank key verified used). `payEmail` is the leftover of the H4 checkout fix — the input is gone from the DOM, the string stayed. Delete all three ×2 langs. Also dead: `const sr=` (`:1319`), `const m=` (`:1466`), and the static pre-JS label on #payDl still reads "⬇ Download your PDF pack" (`:668`) until `applyLang()` swaps in "🖨 Print the free pack" — a no-JS/flash-of-old-copy lie.

### M4. Pre-drill safety modal list contains a dead id and skips `last30`
`:1151` gates on `['traffic','pass','trap','hard','step']` — but `'hard'` is a *level* id, not a sit id (dead entry), and `last30` (a traffic-stop situation) never gets the physical-safety modal. Probably harmless for last30's content; the `'hard'` string is leftover from an older id scheme either way.

## VERIFIED CLEAN (receipts)

- **v2.24.0 H4 (checkout):** `payNow` (`:1421`) goes straight to `payOkT` "Preview complete — no charge was made" + honest `payOkSub`; no email input in the DOM (0 hits for `payEmailIn`); the only "receipt"/"recibo" in the file is the orphaned string in M3. No fabricated confirmation anywhere.
- **v2.24.0 crisis net:** `PRX_CRISIS` + `prxIsCrisisArena` (`:689-694`). The accent-strip regex shipped as **literal** U+0300–U+036F in the char class — hexdumped the bytes: `5b 0300 2d 036f 5d`, functionally identical to the `\u` escapes; NOT mangled. Ran the shipped function: "quiero morír", "NO AGUANTO MÁS", "suicídio", "can't go on" all detected; "I do not consent" clean. Checked before scoring (`:1377`), reply never enters `A.hist` or the share card. Gap (LOW): word-order variants miss — "me quiero quitar la vida" ≠ "quitarme la vida".
- **Voicebox-only audio:** 0 `speechSynthesis` refs. `speakOfficer` (`:1222`): one Audio, `stopVoice` on every answer/mic/sound-off path; 404 → `onerror` + `play().catch` both null the ref (guarded by `__officerAudio===a` — no loop, no retry, no unhandled rejection; only the browser's native resource-load line in console). Silent beat with text on screen, exactly as the changelog says.
- **M2 XSS re-check:** `escT(h.y)` (`:1177`) is the only user-text→innerHTML sink. #sayIn's value is read but never rendered (`:1312`); scenSearch input is used only in `.includes()` filters (`:1099`), never rendered; share canvas uses `fillText` (markup-inert) for `A.handle`; mic transcript routes through the same escaped path. Officer/feedback strings interpolated into innerHTML are all authored data.
- **Supervision banner:** persistent `#supBanner` re-toggled every render (`:1153`), text from `supOn` — no coaching-adjustment promise in the string (dumped it).
- **Hygiene:** `node --check` passes on the extracted script; 0 CR bytes (pure LF); 0 duplicate function definitions; old global `KEY` list fully gone (comment-only mention); all 60 `getElementById` targets exist in the DOM; all `T()`/`data-i18n`/`data-i18n-ph` keys resolve in BOTH langs; `famMsg` no longer claims offline; `wipeQ` scoped to "Practice Arena data".
- **Matcher crash-safety:** every reachable turn (main + branch) has ≥1 `g` choice — `goodC` can't be undefined; min `gw.length` is 1 (step3 t4 "Silence."), so the `gw.length>0` guard never trips into the zero case. Sub-note (LOW): on that turn "I stay silent" misses — only text containing the substring "silence" scores.

## LOW / notes
- `submitFree` clears the input even when `answer()` no-ops mid-`answering` — typed text silently discarded.
- #sayGo accepts any non-empty text ("x") as proof you re-typed the strong line.
- Overlap uses `String.includes` (substring, not word-boundary): "consented" matches "consent" — mostly benign given H1 dwarfs it.
- `flowState`/`amparoGuidedFlow` phantom-key branch (`:1057`) still present — prior audit M1, unaddressed, unchanged.

## Fix order
1. H1 negation guard in `submitFree` (the release's headline fix is still open on its own test case).
2. H2 one-line `HELD_SITS` filter in the drill IIFE — **before Aug 26**.
3. H3 `answering=false` in `renderArena()`.
4. M2 `clearTimeout` alongside the pressure-timer clears; M1 route swan entries through the consent gate; M3/M4 residue deletion.
