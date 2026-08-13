# Amparo — focus group 16: the fix that closed one gap and revealed its own shadow (v2.21.4–v2.21.7)

Date: 2026-08-13. Run against `031d70e` (HEAD), tag `v2.21.7`. Working tree
clean at read time (`git status` empty), so every claim below traces to
committed source, a live-served build, or an independent transcription — not
to a commit message's word. Subject: the four-release run since FG15 last
reviewed `469ed17` (v2.21.3) — `70958f1`/v2.21.4 (offline-chip honesty, cron
pipe-exit fix, root hub focus+keyboard restore), `a964f58`/v2.21.5 (print
banner honesty, Georgia partial-check badge, ErrorBoundary sentence),
`bcd2645`/v2.21.6 (restore `v2_4`, EDITION→2026-D), `3983f9d`/v2.21.7 (restore
`v0_4`/`v0_5`/`v1_4`/`v1_5`/`v4_4`, EDITION→2026-E).

**Method note.** Every "confirmed correct" and every finding below was
checked one of four ways: direct source read (`git show`, `grep`, `node -e`
bank dumps), a live-served build at `127.0.0.1:8080` with
`document.activeElement`/`aria-*`/`tabIndex`/dispatched `KeyboardEvent`s read
before and after real interaction, `npm run check` run to completion in
`app-src/` (all four suites: content, storage-14, sw-routing-12,
engine-21 — **PASS**, string count now **2465** verified present, up from
2437 at v2.21.3), or independent Whisper transcription via
`voicebox.transcribe` of restored audio clips never touched by this round's
verification claims. One of my own test scripts was caught and fixed
mid-session: an initial `prxBuildDeck(level)` call silently ignored its
argument (`prxBuildDeck` takes no parameter — it reads the module-scope
`prLevel` global), so a first "Level 0 vs Level 1" comparison was actually
testing Level 0 twice. Rebuilt correctly with `prLevel` set and restored
after each run; the corrected 3,000-deck-per-level sweep is what golden
context below relies on, not the first (wrong) one. Attorney/UPL review, the
two unsent memos, and `ci:7` remaining empty are excluded from findings per
instruction — known, tracked, not new.

---

## 0. What's actually new this round, verified against source, live, or by transcription

| System | File | What it is |
|---|---|---|
| Offline-chip honesty | `index.html:5825-5843` | Chip used to appear on `serviceWorker.ready` alone (worker *active*, not *cached* — install swallows every `c.add().catch(()=>{})` failure). Now gated on `caches.match('./')`. Verified by source; `sw.js`'s own `CORE='./'` and install/activate handlers checked line by line — the fix targets the right cache key. |
| Cron review-issue signal | `.github/workflows/law-watch.yml:28-38` | Read `changed=$?` after a `tee`d pipe — always `0`, `law-watch.mjs`'s real exit code (`:145`, `process.exit(changed.length?1:0)`) discarded. Now `${PIPESTATUS[0]}`. Correct fix for the stated shell semantics; not independently re-derivable without a real GH Actions run, but the bash mechanics check out. |
| Root hub tablist focus + keyboard | `index.html:3870-3893` | **LIVE-verified two ways.** (1) `hubTab(1)` called on a focused `hubTab1`: node identity changed (`sameNode:false`, confirming `render()` still rebuilds), but `document.activeElement` after is the **new** `hubTab1` button, not `<body>`. (2) `ArrowRight` dispatched on a focused `hubTab1` moved both DOM focus and `_hubTab` to `2`. Both were FG15's golden #1 and #2 (partially); both close clean. |
| Print banner honesty | `index.html:1978`,`2323`,`5896-5920` | `done_t` was `"Pack sent to your printer"` / `"Paquete enviado a la impresora"` — asserted on `afterprint`, which fires identically on Print and Cancel. Now `"Your pack is ready for the glovebox"` / `"Tu paquete está listo para la guantera"` — true regardless of dialog outcome. **LIVE-verified**: dispatched `afterprint` with no real print invoked; banner rendered the new, outcome-neutral text. |
| Georgia partial-check badge | `index.html:4298-4320` | `renderLawCheck` now reads `st.reachedSources`/`st.sourcesWatched` (computed and shipped in `law-status.json` since before this fix, never read) and shows `"Statute sources checked daily — {r} of {w} were reachable…"` under a `.lawcheck.partial` state, subordinate to the existing `.flag` state. **LIVE-verified against the real, current `law-status.json`** (not synthetic data): `reachedSources:3, sourcesWatched:4, counts.unreachable:1` — Georgia genuinely still 403s the runner — and `renderLawCheck()` produced exactly `"Statute sources checked daily — 3 of 4 were reachable on the last check, August 13, 2026…"` with `className="lawcheck partial"`. This is a real, currently-true, honest statement replacing a real, currently-false one. |
| ErrorBoundary sentence + announcement | `ErrorBoundary.tsx:44-51`, `index.html:1978,2323` | `app_err_t` ("This screen didn't load. Your pack is safe — try again." / Spanish alongside) added through `index.html` and re-extracted, `role="alert"` added to the fallback `<div>`. FG15 golden #3, closed. |
| `v2_4` restored (ci:2, consent-to-search, hostile) | `index.html:4508-4515`, `practice.json` | Text/audio recovered from git (`f205531`), not model-authored. **Independently transcribed** (not taking the commit's word): EN `voicebox.transcribe` on `audio/en/m/v2_4.mp3` returned *"Both there's nothing in there. This takes two minutes. Can I search it or not?"* — "Both" for "If" is Whisper `base`-model noise on a fast leading consonant, not content drift (the rest is a clean match). ES transcription of `audio/es/m/v2_4.mp3` returned **byte-for-byte** `"Si no hay nada ahí, esto toma dos minutos. ¿Puedo revisar o no?"` — including the inverted question mark. Reachability **re-confirmed** via a corrected 3,000-deck live sweep of `prxBuildDeck()` at `prLevel=2`: `v2_4` genuinely drawn (`ciSeen` includes `7`; `seen` includes `v2_4` alongside `v3_4`), consistent with the commit's own claim that a random Level-2 build can land on it without divergence. |
| `v0_4`/`v0_5`/`v1_4`/`v1_5`/`v4_4` restored (NOT reachable) | `index.html:4495-4519`, `practice.json` | Same recovery method. **Independently transcribed**: `audio/en/m/v0_5.mp3` → *"Oh, I've asked twice. License the registration. Hand them over."* against claimed *"I've asked twice. License and registration. Hand them over."* — filler "Oh," and an article/conjunction swap, same noise class as `v2_4`'s. **Reachability claim independently re-verified, not re-run from the commit's own numbers**: corrected 3,000-deck sweep at `prLevel=0` produced only `_0`/`_1`-suffixed (calm-tone) ids, zero hostile; at `prLevel=1`, only `_2`/`_3`-suffixed (curt-tone) ids across `ci` `[0,1,2,4,5,8]` — `v4_2`/`v4_3` drawn, `v4_4` never. The "restored but not currently playable" framing in the source comments and HANDOFF is accurate, confirmed independently rather than trusted. |

**Confirmed correct, not findings** — each checked rather than assumed:
`sw.js`'s `CORE`/cache-key shape supports the offline-chip fix as written;
`npm run check` passes clean at HEAD (all four suites, 2465 strings
verified); `REVIEW.attorneys` is genuinely empty in both banks, so both
EDITION bumps this round are confirmed-inert, not merely claimed inert;
`app-src/src/registerSW.ts`'s `onOfflineReady` callback is **not** a repeat
of root's old bug — it's `vite-plugin-pwa`'s own Workbox precache-completion
event, driven by the actual manifest rather than a single-URL probe, so
`/app`'s equivalent "works without internet" chip (`offline_ready`, same
string, same claim) never had the defect root just fixed; the print-banner
fix's platform-limitation comments (`index.html:5896-5905`) correctly explain
*why* this cannot be fixed by moving the event, matching what a browser
actually exposes; and all six restored `PRX_VAR` entries are present in
**both** `index.html` and `app-src/src/content/practice.json`, byte-identical
en/es text, confirmed by direct diff rather than assumed from the extractor
passing.

**New finding — root's lifelines tablist is now the one `.ll-seg[role=tablist]`
left with no keyboard support, and the gap is fresh, not inherited.** Before
v2.21.4, root's hub and lifelines tablists were **uniformly** incomplete —
neither had roving `tabindex` or arrow-key handling, so "one shared
segmented-control grammar" (the phrase `/app`'s own CSS comments use) was at
least symmetrically unfinished within root. v2.21.4 fixed the hub only.
**LIVE-verified**: with the lifelines tablist rendered (`step=3`),
`document.getElementById('llTab0').getAttribute('onkeydown')` is `null`, both
tabs carry `tabindex="0"` (no roving), and dispatching a real `ArrowRight`
`KeyboardEvent` on a focused `llTab0` moves nothing — `document.activeElement`
stays `llTab0`, `_llTab` stays `0`. Root's hub tabs, same file, same CSS
class, same commit era, now do all of this correctly. `llTab()`
(`index.html:3893-3924`) already does the safe, non-destructive `innerHTML`
patch that `hubTab()` had to be taught to imitate — so unlike the hub fix,
lifelines wouldn't even need a focus-restoration workaround, only the
`onkeydown` handler and roving `tabindex`. This is not the FG15 finding
restated: FG15 compared root's hub to `/app`'s hub and to `/app`'s lifelines;
this is root's own two tablists, post-fix, diverging from each other for the
first time.

---

## 1. Ten persona reactions

**Selection rationale.** This round's subject is honesty-copy (four strings
rewritten or added, one badge state added) and content restoration (six
hostile officer lines, one reachable, five not). The panel weights toward
personas who read status copy literally, distrust unearned claims, or are the
direct subject of the restored hostile content — while keeping the
institutional-trust and analytical lenses that this project's hard rule 3 was
written for. Marcus, Devin, Ray sit out: no share surface, no new
game-loop-shape surface (hostile content this round is either invisible —
five lines — or reachable exactly where it already was — one line), no
audience-boundary surface moved.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

- **`v2_4` is the exact sentence her standing objection is about, and it is
  now genuinely live, not just present in a bank.** *"If there's nothing in
  there, this takes two minutes. Can I search it or not?"* is the officer
  escalating a request into pressure after a wrong answer — precisely the
  "chosen, never sprung" mechanism she has judged this product on for four
  rounds. Verified reachable (the 3,000-deck sweep drew it), not merely
  present.
- **The five NOT-reachable restorations are the more important signal to
  her, and the project got the honesty of that framing right.** A restored
  hostile line sitting inert in a bank, marked as inert in a source comment
  she could ask someone to show her, is a materially different thing than
  one quietly shipped as playable. She would want the state of the world
  described exactly as it is — this round does that.
- **None of the four honesty-copy fixes touch her directly** — she is not
  the persona who reads a print banner or a statute badge closely — but she
  would recognize the shape (a claim scoped back to what's actually true) as
  the same discipline that made her trust the checkpoint-tab split.
- **Redo? Still no for hostile content. Refer? Conditional yes** —
  unchanged, and for the first time in three rounds nothing new works
  against her.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

- **The hub focus fix is real and closes his round-15 headline finding.**
  Measured, not assumed: activating a hub tab now returns focus to the new
  node with the same id, and arrow keys move both focus and selection.
  `role="alert"` on the ErrorBoundary card means a failed screen is now
  announced instead of silently going nearly empty.
- **And the fix's own success is what exposes the new finding.** He would
  find root's lifelines tablist by touch within seconds of testing the hub:
  same class, same `role="tab"`, same visual segmented control — and Tab,
  then arrow keys, do nothing. Before this round that would have been
  consistent (both broken); now it's a control that works one screen and
  not the next, on the same site, with no way for him to predict which.
  **A working example sitting one screen away from a broken one is a worse
  experience than two broken ones**, because it teaches an interaction model
  that then fails silently.
- **The tablists are still unnamed — four for four.** He hears "tab list"
  with no indication of what it selects, on both the hub (his round-15
  finding 5) and now, freshly relevant, on lifelines too, since that's the
  screen still missing keyboard nav as well.
- **Which first? The lifelines gap** — it is the cheaper of the two things
  keeping his round from closing clean, and `llTab()`'s existing
  non-destructive patch means the fix doesn't even carry the complexity the
  hub fix needed.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

- **Every new or changed string this round reads as written, not
  translated, dumped and read myself.** `app_err_t`: *"Esta pantalla no
  cargó. Tu paquete está seguro — inténtalo de nuevo"* — natural, reassuring
  in the same breath, matching the voice Marisol clocked in `d_quota` and
  `em_fail` last round. `lawchk_partial`: *"Fuentes legales revisadas a
  diario — 3 de 4 estuvieron accesibles…"* — precise, not hedgy.
  `done_t`: *"Tu paquete está listo para la guantera"* — the same casual,
  correct "guantera" the product already uses elsewhere.
- **The restored hostile lines are bilingual and both languages were
  transcribed back out of the actual audio, not just read from the bank —
  I'd want to know that happened, and it did.** `v2_4`'s Spanish clip
  transcribed to the exact source text, inverted question mark and all.
  That is a level of care her son's Spanish deserves and doesn't always get
  in this kind of product.
- **The Georgia badge is now honest in a state that isn't even hers**, and
  she'd notice the pattern regardless: this project fixes a badge the
  moment it catches itself making an unverified claim, in any state.
- **Redo? Yes.** Unchanged; nothing here cost her anything.

### 🧑 Marisol, 29 — NY, green-card holder, Spanish-first, night shifts

- **Her lens is register, and every new string passes it.** `done_t`'s
  Spanish doesn't just translate "ready for the glovebox" — it keeps the
  same slightly-warm, practical register the English has. `app_err_t`
  doesn't reach for a generic "algo salió mal" (something went wrong,
  the flat, translated-sounding default she's flagged before) — it names
  what's actually true ("this screen didn't load") and reassures about the
  one thing she'd worry about first (the pack is safe), same structure as
  the English.
- **`lawchk_partial`'s Spanish is the one she'd examine hardest, and it
  holds.** "Estuvieron accesibles" (were reachable) is the correct
  register for a technical/administrative fact — not dumbed down, not
  stiffly bureaucratic either. This is a genuinely hard sentence to get
  right in Spanish (a partial-success status with a fraction in it) and it
  reads like someone who writes Spanish, not someone who translates it.
- **Her standing payment-trail objection is untouched.** No surface here
  touches it, and this report does not manufacture one.
- **Redo? Yes on content quality** — the strongest round yet for her lens
  specifically because every new string is short, functional, and easy to
  get wrong, and none of them are.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, between fares, highest real need

- **The offline chip fix is aimed directly at her and she'd never see it
  fire wrong, which is the point.** Her phone, her parking-lot signal —
  "works without internet" now only shows when it's actually cached. She
  wouldn't notice the fix; she'd just never get burned by the old bug,
  which is the correct outcome for a hygiene fix.
- **None of the honesty copy costs her anything, and none of it saves her
  time either.** She is a toucher on a phone, not a keyboard user reading a
  status badge — the tablist keyboard work, the Georgia badge wording, are
  invisible to her by profile, said plainly rather than manufactured.
- **The print banner fix is a small net positive for her specifically.**
  "Ready for the glovebox" instead of asserting the printer succeeded means
  she isn't told something false if she backed out of the OS dialog on a
  spotty connection — a real scenario for her, not a hypothetical.
- **Nothing in this round touches the thing that actually costs her**,
  which FG15 already named: the ErrorBoundary's reload-to-Welcome recovery
  path. Naming again only to say it's unchanged, not as new.
- **Redo? Yes, unchanged. Fourth round running where nothing lands
  squarely on the persona with the highest real need — but for the first
  time, nothing lands badly on her either.** A wash that isn't a loss is
  progress for her specifically.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

- **The "restored but not reachable" framing is exactly the kind of
  precision she tracks, and it's correct.** She is the persona most likely
  to notice "the bank has six new hostile lines" and assume all six are
  live. They aren't, the source comments say so at each of the five, and
  independently re-running the deck sweep confirms it. She'd back this
  disclosure the same way she backed the FG13 stale-best revert — the
  accurate answer over the flattering one.
- **The print banner rewording is a small loss for her specifically, and
  she'd clock it.** She is the parent who prints, drills, reprints — "sent
  to your printer" was actually usually true for her, since she completes
  the OS dialog. The new copy is honest for everyone but slightly less
  informative for the one persona who reliably does print. She'd take the
  trade — a claim that's sometimes false is worse than one that's always
  vague — but she'd notice it's a trade, not a pure improvement, for her.
- **She'd want the Georgia badge's honesty extended to a person, not just a
  badge.** "3 of 4 reachable" is accurate; it doesn't say whether anyone is
  going to fix the fourth. That's the cron's job (open issue #7,
  unchanged), and she'd ask about it in the same breath as praising the
  badge.
- **Redo? Yes. Refer? Yes** — unchanged, still her strongest-holding
  verdict across the loop.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

- **This round is the clearest demonstration yet of the exact discipline
  hard rule 3 exists for, and it's his home turf.** The Georgia badge is
  the literal descendant of the incident that produced the rule — "sources
  auto-checked daily" while sources 403'd — and this round fixes the same
  shape again, this time proactively (found by the loop, not by an
  incident) and with live, current data confirming the fix is not
  theoretical: Georgia is unreachable *right now*, and the badge says so
  *right now*.
- **The offline chip and the print banner are the same instinct applied
  twice more in one release window.** Three honesty fixes in four commits
  is the pattern he'd read as an institution behaving like an institution —
  catching its own overclaims before a person has to.
- **Nothing here moves his standing condition**, because nothing here is
  an institution putting its name on the product — it's the product being
  more careful about what it says. Related but distinct in his own
  accounting.
- **Redo? Once, if an institution backs it. Refer? Still no** — unchanged
  across twelve rounds, and he'd say so plainly rather than let the good
  work here move a verdict that isn't about this.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, analytical side entry

- **He'd find the lifelines/hub asymmetry in exactly the way I did — by
  testing the fix, not just reading it — and he'd catch my own first
  mistake too.** Calling `prxBuildDeck()` with an argument it silently
  ignores is precisely his failure mode to flag: code that accepts an
  argument syntactically (JavaScript doesn't error on extra params) while
  ignoring it semantically. He'd grep `function prxBuildDeck(){` and note
  the empty parens before running anything.
- **The four honesty fixes read to him as one commit-message pattern
  worth naming: each one is "a claim outliving the thing it claimed
  about," verbatim from `a964f58`'s own commit body, applied three times
  in one release.** He'd note that the pattern-recognition is now explicit
  in the project's own commit messages, not just an FG observation — the
  operator is naming the shape before shipping the next instance of it.
- **The restoration commits' self-caveats are the most defensible content
  changes this loop has reviewed.** Recovered-not-authored, transcribed
  round-trip before shipping, reachability independently claimed and (per
  this round) independently reproducible. He'd have no diff-level objection
  to any of the six.
- **Redo? Yes. Refer? Conditional** — unchanged.

### 🧑 Ana, 31 — Phoenix AZ, "products that look half-finished" allergy

- **This is the best example yet of her allergy's actual target — not gaps,
  but gaps between what's claimed and what's true — being addressed at the
  source instead of patched at the symptom.** Four separate claims (offline
  capability, print outcome, statute freshness, error state) each got
  scoped back to what the code can actually verify, rather than getting a
  more confident-sounding wrapper. That is the opposite of what usually
  produces her complaint.
- **The five inert restorations are logged at the point of restoration,
  not left for a future reviewer to discover — the exact fix for FG14's
  "cut that was logged incorrectly" pattern.** Each entry's source comment
  states its own unreachability and why, in the same commit that adds it.
  Nothing here is a silent gap.
- **And she'd still name the lifelines tablist, precisely because the
  hub's own fix is what created the gap.** Her allergy isn't tuned to "this
  was never done" — root's lifelines tabs were never claimed to have
  keyboard nav until they inherited `role="tab"` in v2.21.3. It's tuned to
  "this now announces a contract it doesn't keep," and that's true of
  lifelines today in a way it wasn't three releases ago.
- **Redo? Yes for what's built. Refer? Leaning conditional — trending
  toward yes** — four consecutive rounds now where the discipline held
  under a fresh test each time.

### 🧑 Luis, 27 — TX, DACA, warehouse shift lead, older Android, prepaid data

- **`v2_4` is his fear made concrete, and its honesty holds up under his
  scrutiny specifically.** The scenario is an officer escalating pressure
  to search a vehicle — "can I search it or not" as a demand dressed as a
  question — and it is now genuinely reachable, not decorative. He'd want
  to know it's reachable before trusting the practice engine teaches
  anything about it, and it is, independently confirmed.
- **The five inert restorations are the more interesting case for him,
  and not in a way that reassures him by default.** His threat model is
  "does this thing behave differently than it claims." A hostile line
  sitting in the bank, unreachable, described as unreachable — that's
  honest today. But it means the bank now contains content whose
  reachability depends entirely on future level-design choices nobody has
  made yet. He wouldn't call this dishonest; he'd ask who reviews it if
  and when it *does* become reachable, since an attorney review happens
  per-EDITION and this content just bumped EDITION twice without ever
  having been played.
- **The offline-chip fix is squarely his conditions.** Prepaid data,
  spotty coverage, a claim about working offline that used to fire on
  nothing cached — fixed, and fixed in the direction that costs him
  nothing (silence instead of a false promise) rather than the direction
  that would have cost him a false sense of security.
- **His standing objection is untouched.** Redo? Unchanged.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Give root's lifelines tablist the same keyboard support its hub sibling just got

**Evidence.** **LIVE, measured.** With the lifelines screen rendered
(`step===3`, `index.html:3309-3316`): `document.getElementById('llTab0')
.getAttribute('onkeydown')` → `null`. Both `llTab0` and `llTab1` carry
`tabindex="0"` with no roving. Dispatching a real `KeyboardEvent('keydown',
{key:'ArrowRight'})` on a focused `llTab0` changes nothing —
`document.activeElement` stays `llTab0`, `_llTab` stays `0`. Contrast, same
file, same round: `hubTab0/1/2` (`:3446-3448`) now carry `tabindex="${…?0:-1}"`
and `onkeydown="hubTabKey(event,i)"`, and both LIVE tests (focus survival on
activation, ArrowRight moving focus+selection) pass. `llTab()`
(`:3893-3924`) already patches `tr.innerHTML` plus the two buttons' classes
and `aria-selected` in place — the *safer* of root's two update strategies,
per FG15's own finding — so this fix doesn't need the focus-restoration
workaround `hubTab()` needed; it needs only the `onkeydown` handler and
roving `tabindex`, ported from the hub almost verbatim.

**Impact.** Before v2.21.4 root's two `.ll-seg[role=tablist]` instances were
uniformly incomplete, which is a real defect but at least a consistent one.
v2.21.4 fixed exactly one of them. A screen reader or keyboard user who
learns "arrow keys work on this control" from the hub and then meets the
identical-looking, identically-labeled control two steps earlier in the same
flow with no arrow-key response is worse off than before the hub was fixed,
because the working instance is what teaches the wrong expectation. Omar's
finding by name, Wes's by diff. Cheapest fix on this list relative to its
value: one file, one function that already does the hard part.

### 2. Give `/app`'s print confirmation more than a colour swap

**Evidence.** `PrintStep.tsx:30,41`: `printed` state flips on `afterprint`.
Its only two readers, unchanged since FG15: `:115`
`className={\`btn ${printed?'ghost':'gold'}\`}` and `:119`, the inverse.
Grepped again this round — no third reader, no text change, no `role`
addition. Meanwhile root's equivalent, in the **same release window**,
went from asserting an outcome ("Pack sent to your printer") to a true,
outcome-neutral sentence ("Your pack is ready for the glovebox") — verified
live by dispatching `afterprint` with no print invoked.

**Impact.** This was FG15 golden #5 and is not re-litigated as new — the
underlying defect (a WCAG 1.4.1 colour-only confirmation) is unchanged, and
the fix is still the smallest of the two products' options: a `role="status"`
one-line text swap using an existing extracted string family. What's fresh
this round is the contrast: three of this release's four commits exist
specifically to stop claims from outliving what they verify, and did so in
root's print flow by name. `/app`'s print flow sits one door down from that
exact fix, untouched, still conveying success or failure by colour alone —
invisible to Omar entirely, easy for Dana to miss.

### 3. Decide what the orphaned `prx_ld*`/`prx_sel_sub`/`prx_locked` strings are for, or delete them

**Evidence.** `node -e` dump, re-run this round: `prx_ld1`–`prx_ld5`,
`prx_sel_sub`, `prx_locked` are all still present, fully bilingual, in both
`t.en.json` and `t.es.json`. Grep of `app-src/src` (excluding `.json`):
**zero renderers**, unchanged from FG15. `--verify`'s 2465-string PASS
includes all seven — they are legitimately used in root's in-run flat list
(`index.html:5472`), so the extractor's root↔bank equality check has no way
to flag them, exactly as FG15's BS-2 described.

**Impact.** Not re-ranked as new, but re-verified rather than assumed
carried-forward, and worth a slot because none of this round's four
honesty-and-restoration commits touched the one piece of dead-but-translated
content already on record. `/app` still has no screen that tells a user
what a scenario *is* before they enter it; Keisha's decide-fast case and
Rosa/Marisol's "translated work nobody will see" case are both still live.

### 4. Name the four tablists

**Evidence.** Re-checked this round, unchanged from FG15: `.ll-seg
[role=tablist]` carries no `aria-label` in root's hub, root's lifelines,
`/app`'s hub, or `/app`'s lifelines. Three of those four instances got other
ARIA or keyboard work in this exact release window (root's hub: focus +
keyboard; the honesty fixes ran through the same files); the accessible-name
gap wasn't part of any of it.

**Impact.** Smallest fix on this list — four one-attribute edits, likely
using strings that already exist near `hub_title`/`l_sub`. Ranked below #3
because it degrades rather than hides anything; ranked at all because three
adjacent a11y items closed around it this round while it didn't move.

### 5. Derive the hub progress denominator once

**Evidence.** `index.html:3469`:
`_t.hub_progress.replace('{n}',rungsDone).replace('{t}',4)` — literal `4`.
`PracticeHub.tsx:127`: same shape, `.replace('{t}', '4')` on one line,
`rungsDone / RUNGS.length * 100` on the next. Unchanged since FG14 first
flagged the shape, FG15 re-flagged it as the last open sub-item of FG14
golden #5. Verified still present at `031d70e` in both banks.

**Impact.** Lowest magnitude here — a verification/cleanup item, not a
defect a user would notice. Included because it is the same
two-expressions-of-one-fact pattern that produced the FG13 stale-best bug,
now open across three rounds and two commits' worth of surrounding hub
work that never touched it.

---

## 3. What must change in the practice MODULES specifically

**Scoped to `screens/practice/` (or root's step-5 hub/overlay equivalent),
`PracticeStep.tsx`, `engine/`, and their content banks.**

- **Port `hubTabKey`'s pattern to root's `llTab()`** (golden #1) —
  `index.html:3315` region. `llTab()` already avoids `hubTab()`'s
  destroy-and-rebuild problem, so this is strictly a keydown handler +
  roving `tabindex`, no focus-restoration logic needed.
- **Give `/app`'s `PrintStep.tsx` print confirmation a text state, not
  just a colour** (golden #2) — `:30,41,115,119`. `role="status"` plus one
  existing or newly-extracted line.
- **Resolve the orphaned `prx_ld*`/`prx_sel_sub`/`prx_locked` strings**
  (golden #3, unchanged from FG14/FG15) — render on hub cards or delete
  with a logged note.
- **Add `aria-label` to all four `.ll-seg[role=tablist]` instances**
  (golden #4).
- **Derive `hub_progress`'s denominator once** (golden #5) —
  `index.html:3469`, `PracticeHub.tsx:127-128`.
- **Carry-forward, verified closed this round:** root hub tab focus loss
  (FG15 golden #1) and root hub keyboard nav (FG15 golden #1's second half)
  — both **LIVE**-confirmed fixed. FG15 golden #2 (`← All scenarios` on
  PRE_FLIGHT) and golden #3's `role="alert"`/sentence half — **not
  re-verified this round**, out of this round's actual diff scope
  (`PracticeStep.tsx:108` untouched by any of the four commits reviewed
  here); do not assume closed without checking `PracticeStep.tsx` directly
  next round.
- **Carry-forward, unchanged, operator's own explicit decision (not a new
  finding):** the good leg of Level 2 divergence is still a structural
  no-op (targets `curt`, both beats already have `curt` variants and now
  one `hostile` each, so the "already there" short-circuit still fires
  first). `ci:7` genuinely empty — excluded from findings per instruction,
  named only as still-open.
- **New, worth a decision rather than a fix:** five hostile `PRX_VAR`
  entries (`v0_4`,`v0_5`,`v1_4`,`v1_5`,`v4_4`) now exist, bilingual, with
  audio, EDITION-bumped, and are unreachable by any live path. They are
  correctly logged as such at the point of restoration. The open question
  is process, not content: when (if ever) does `PRX_LEVELS`/tone-pool
  design change to reach them, and does that redesign get its own attorney
  review pass distinct from the EDITION bump that already happened for
  content nobody can currently play? See BS-3 below.

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06–FG15

**BS-1. Four honesty fixes shipped in one release window, all in the same
shape — has anyone written the general rule down, or is it being
rediscovered per-instance?** `a964f58`'s own commit body names the pattern
explicitly ("a claim outliving the thing it claimed about") and applies it
three times. That is real progress — the operator is now pattern-matching
proactively rather than waiting for FG or an incident to find each instance.
But the pattern was found here in: a chip gated on the wrong signal, a badge
that stopped checking what it read, a banner asserting an unverifiable
outcome, and (retroactively) an EDITION-review system that assumes a filled
`REVIEW.attorneys` entry means what it says. Is there a checklist item —
"does this UI element assert something it hasn't actually checked this
render?" — anywhere in the review process, or does each instance still need
a human or an FG round to notice it individually? Four in one release is a
good append rate for an ungoverned process and a concerning one if the
process should have caught them together.

**BS-2. The hub fix demonstrates that fixing an ARIA gap can widen a
different one — has the project checked whether any of its *other*
completed a11y fixes created a fresh asymmetry the same way?** This round's
own headline finding (lifelines vs. hub) is a direct instance: a correct,
verified, LIVE-tested fix to one of two identical-looking controls. The
generalizable question BS-6 in FG15 asked was "what else is markup-correct
and behavior-broken" — this round answers a piece of that question by
finding the same shape one level up: what happens when *one instance* of a
markup-correct-behavior-broken pair gets fixed and its sibling doesn't. The
stepper's clickable completed nodes and the state pill (both still
**UNVERIFIED**, flagged in FG15 and still not measured) are the obvious next
places this could recur, precisely because they're the kind of control that
tends to get touched one call site at a time rather than as a shared
component.

**BS-3. Restoring content and bumping EDITION are now decoupled from
reachability — does the attorney-review gate need to know the difference?**
`EDITION` moved twice this round for six lines, five of which cannot
currently be played by any user. `isReviewed(st)` checks only
`a.edition===EDITION` — it has no concept of "this edition contains inert
content that doesn't need review yet" versus "this edition contains live
content that does." That's harmless today (zero attorneys, so the check is
moot either way), but the day an attorney *does* review an edition, they
will be asked to sign off on five lines of hostile dialogue nobody can
currently reach, mixed in with the state-cited content that's actually
serving users. Is that intended — review everything in the bank regardless
of reachability, on the theory that reachability is a level-design detail
that shouldn't gate legal review — or should the review scope be
reachability-aware? Nobody has answered this, and the next EDITION bump
that touches an actually-reachable line will make the answer matter for the
first time.

**BS-4. The four check suites still catch none of what this round's own
headline finding was — has the gap BS-1 identified in FG15 changed at all,
or only grown?** FG15's BS-1 found 47 static assertions and zero behavioral
ones, on a release where root's keyboard nav was broken. This round: `npm
run check` is now 2465 content strings plus the same three suites, still
zero DOM/behavioral assertions, and it passed clean on a build where root's
lifelines tablist has an ARIA contract its behavior doesn't honor — the same
shape, unchanged detection gap, one release later. The four honesty fixes in
this round were all found by a human explicitly asking "does this claim
match reality" and checking live — none would have been caught by
`extract-app-content.mjs --verify`, `app-storage-check`, `sw-routing-check`,
or `practice-engine-check` either, because none of those suites read a
rendered DOM, a network response, or a cache. Two consecutive loop rounds
have now found their highest-value items entirely outside the automated
gate. At what point does that stop being an acceptable gap and start being
the thing the next engineering pass should close before the next content
pass?

**BS-5. Independent transcription caught real (if minor) noise in every
clip checked — has anyone quantified the false-positive rate of trusting a
`base`-model Whisper round-trip as the restoration safety check?** Both
spot-checked EN clips this round produced small mismatches against their
claimed source text (`"Both"` for `"If"`; an inserted `"Oh,"` and an
article/conjunction swap) that are clearly transcription noise, not content
drift — the Spanish clip for the same line came back byte-exact. That's
reassuring for these six lines specifically, since the noise pattern is
consistent and low-stakes. But the standing workflow
(`amparo-voice-generation-workflow.md`) treats a matching transcript as the
restoration's actual verification step for every future clip, and this
round is the first time anyone has independently re-run that check rather
than trusting the commit's own transcript match. Two clips is not a
sample size that establishes a false-negative rate (a transcript that
matches when the audio is actually wrong). Worth a slightly larger spot
audit before the workflow is trusted at scale for the two remaining
authoring tasks (`ci:7`, and eventually `v8_4`/`v8_5`).

**BS-6. The calibration log is still empty, seven rounds after FG15 first
asked what one real session would cost.** Verified again this round:
`.focus-group/members.md`'s last line is unchanged —
`Calibration log: (add real-user feedback here as it arrives)`. This
round's two live-keyboard findings (hub fix confirmed working, lifelines
gap confirmed broken) were produced by scripting a headless-adjacent
browser and reading `document.activeElement`/dispatching synthetic
`KeyboardEvent`s — closer to a real interaction than source-reading alone,
but still not a human using a screen reader or a physical keyboard under
real conditions. The question FG15 asked stands unanswered a second round
running.

---

## 5. Group read

**Would-evaluate-favorably verdict: 8 yes/conditional-yes (Rosa, Marisol,
Dana, Wes, Ana, Luis, Nia, Keisha) / 1 neutral, standing condition unchanged
(Tony) / 1 conditional with a real ongoing complaint (Omar).** This is the
best-received round since FG14 — a genuine hygiene release, verified as one,
with no persona reporting a new cost. Keisha in particular moves from
"nets out badly" (FG14, FG15) to "a wash that isn't a loss" — the first
round in three where nothing lands on the highest-real-need persona at all,
in either direction.

**Biggest objection by theme.** The one real new finding this round is a
mirror image of FG15's: FG15 found *declarations shipped ahead of behavior*
(ARIA promised, mechanics missing) — this round found *a fixed behavior
creating a fresh asymmetry with its own unfixed twin*. Both are the same
underlying cause (accessibility work done per-control rather than
per-shared-component), expressed one step later in the same codebase. The
lifelines/hub gap did not exist before v2.21.4 in the form found here — it
is a direct, traceable side effect of a correct fix, not a pre-existing
defect this round happened to notice.

**Highest-leverage fix, this round's subject specifically.** Golden #1 —
root's lifelines keyboard gap. Cheapest fix on the list (one function
already does the hard part), most directly caused by this round's own
changes, and the only item that makes an inconsistency worse the longer it
sits, since the hub is now the example that teaches the wrong expectation.

**Highest-leverage fix, across the whole product regardless of surface.**
Golden #2 — `/app`'s colour-only print confirmation. Unchanged from FG15's
ranking of the same item, but the honesty work this round did everywhere
else in the print flow — root's own banner — makes the gap harder to
justify leaving as-is next round.

**Who this still isn't for.** Tony — no institutional backing, unchanged
across twelve rounds, and he would say so himself rather than let four good
fixes move a verdict about something else entirely. Nobody nets out badly
this round for the first time since FG13.

---

## 6. Signature

Generated by Amparo Focus Group 16 (v2.21.4–v2.21.7 "honesty fixes and
restores" review, ten-persona panel). Agent A of the standing `/amparo-loop`
verification, slug `honesty-fixes-and-restores`.
**Panel:** Nia, Omar, Rosa, Marisol, Keisha, Dana, Tony, Wes, Ana, Luis.
Marcus, Devin, Ray sit out with reasons stated.
**Scope:** `70958f1` (v2.21.4), `a964f58` (v2.21.5), `bcd2645` (v2.21.6),
`3983f9d` (v2.21.7). FG15 goldens #1 (root hub focus+keyboard) verified
closed, **LIVE**. FG15 goldens #2/#3's `PracticeStep.tsx` half not
re-verified this round — out of this round's actual diff, do not assume
closed. FG15 golden #5 (print colour-only) and golden #4 (unnamed
tablists) re-verified still open, re-ranked, not presented as new. FG14
golden #3 (orphaned strings) re-verified still open. Attorney/UPL review,
the two unsent memos, and `ci:7` excluded from findings per instruction.
**Verdict date:** 2026-08-13.

Every finding is tied to committed source at `031d70e`, to a live-served
build measured via `document.activeElement`/`aria-*`/`tabIndex`/dispatched
`KeyboardEvent`s, to a completed `npm run check` run (4/4 suites, 2465
strings), or to independent `voicebox.transcribe` output compared against
claimed source text. One methodology error in this session's own testing
(`prxBuildDeck(level)` silently ignoring its argument) is disclosed above
rather than silently corrected, per this project's own standing instruction
to verify before asserting — including verifying one's own verification.
