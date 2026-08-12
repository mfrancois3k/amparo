# Wargame 15 — React strangler at /app: the battle plan

**Date:** 2026-08-11
**Status:** WARGAME — simulated course of action. Nothing here has been executed.
**Executor:** mid-tier model (Sonnet-class), per the model-routing table in `wargames/01` §PART 5. Legal-content moves: **none exist in this plan**; if the executor believes a move requires authoring an officer line or legal phrase, that belief is itself an abort condition.
**Recon:** three read-only recon passes completed 2026-08-11 — (R1) full parity inventory of `index.html` (Appendix A), (R2) infra/deploy recon of `vercel.json`/`sw.js`/repo shape, (R3) constraint cross-reference of wargames/02/05/13/14, FG-09, blindspot audits, HANDOFF, plus digest of the 525KB outside master-prompt export.

---

## 0. Charter, supersession, and what this wargame is NOT

**Supersession note.** `wargames/14` §2 row 1 recorded the React rebuild as REJECTED against measured numbers. On 2026-08-11 the operator explicitly selected **"Strangler at /app"** (interactive decision, offered against a "Park it" recommendation). That operator decision supersedes row 1 — with the conditions below, which were part of the option as offered and accepted:

1. Root `index.html` stays live, untouched, and the default entry until **documented parity** (a future, separate decision + wargame — NOT this one).
2. The existing attorney-reviewable content bank (`T`, `STATES`, `BASE_RULES`, `PACK_EXTRA`, `PRACTICE`, `PRX_*`) is ported **verbatim by mechanical extraction** — never retyped, never "improved," never model-authored. Every officer line and legal phrase in /app must hash-match its source in `index.html`.
3. Feature flags port dark: `FINAL_SCENARIOS_ENABLED=false`, `DOOR_MODULE_ENABLED=false`, all `TODO_ATTORNEY`/`TODO_DV_CLINICIAN` placeholders intact.
4. Product palette (cream/navy/gold `:root` tokens). The outside blueprint's `neutral-950`/`amber-500`/`#09090b` values are banned constants.
5. No Clerk, no Convex, no Stripe, no accounts, no new analytics (see §2 — /app beta ships **zero** analytics).
6. All five HANDOFF hard rules apply unreduced.

**New adjudication (first recorded here):** the outside spec's **"Emergency SOS GPS broadcast"** (master-prompt export, spec v3.0/v5.0) is **REJECTED** — geolocation broadcast is a flat hard-rule-2 violation ("NEVER add anything that sends user data off-device"). No future version of the /app work may include it without its own operator-level decision against that rule.

**Non-goals of this wargame:** flipping `/` to `/app` (separate wargame after parity evidence); monetization anything; new scenario content; SR/record-console resurrection; fixing root-app open issues inside migration commits (root fixes ship separately — but see §1.3 for the banked UX fixes /app must *incorporate in its port* so it doesn't re-ship known defects).

**The 429 excluded lines.** The master-prompt export contains 429 model-authored officer/civilian dialogue lines (including bodycam-derived door-raid scripts from identified real cases — the exact `df974b7` REVERTED territory) and RAG-synthesis prompt templates. All EXCLUDED. The only material adopted from it: the rehearsal-loop FSM shape, the component seam map, and two React-free concepts (mute-as-engine-state, pre-flight audio gate).

---

## 1. Definition of done, and standing decisions inside the port

### 1.1 Done (for this wargame's mission)
A committed `/app` build, live on the production origin, that:
- serves at `https://www.amparohq.com/app/` with root byte-identical to before (except the Phase-0 `sw.js` patch),
- reaches **checklist parity** against Appendix A (every system either ported, or explicitly logged as deferred with a reason),
- passes the verification suite in §6,
- has never written to a root-owned storage key, never fired an analytics event, never contained a non-hash-matched content string.

### 1.2 Storage rule during beta
`/app` treats the six root keys (`sr_save`, `sr_docs`, `amparo_prx`, `amparo_muted`, `amparo_voice`, `amparo_stt`) as **read-only** (it may read them to prefill/preview) and writes only `app_*`-prefixed keys. Consequence accepted: state diverges between the two apps during beta. Unification is promotion-wargame scope. Rationale: a write bug in a beta app must not be able to corrupt a live user's saved pack.

### 1.3 Banked UX fixes the port must include (in /app, not root)
These are already-flagged findings; porting the defect when the fix is known would be re-shipping a known bug:
- **Pre-flight audio gate** (FSM `PRE_FLIGHT_CHECK` + mute as first-class engine state) — closes the mute-before-first-audio gap flagged FG-06→FG-09.
- **Tone-tier text prefixes** on scenario descriptions ("Calm: / Escalates: / Hostile:", EN+ES) — FG-09 golden #1 (stripe must not be color-only).
- **Real `disabled`** (or equivalent out-of-tab-order treatment) on locked scenario cards — FG-09 golden #2 / blindspot audit.
- **Score semantics preserved exactly**: count+denominator always, `PRX_UNSCORED` never renders a score, hard-mode debrief scoreless.
- Locked-cards-visible policy: keep current behavior (visible + disabled) and mark it as a deliberate choice in code comment (FG-09 golden #5 asked for the decision to be explicit).

---

## 2. Analytics decision (pre-answered)

**/app beta sends nothing.** No PostHog init, no `$pageview`, no `sr_*` events. Reasons: (a) the funnel's history of denominator corruption (`controllerchange` double-fire, v2.7.1) — a second app double-reporting into the same project is the same class of corruption; (b) root PostHog config carries five load-bearing privacy flags plus replay-scoping and demo-quarantine behaviors that a stock React integration silently drops; (c) beta traffic is developer traffic — it would only pollute. Event parity becomes a **promotion-wargame** item with a deliberate design (likely: same `ph()` wrapper semantics ported, distinct `$app_version`-style property, never a second project).

---

## 3. The moves

### PHASE 0 — Preconditions (root-side, before any /app code exists)

#### Move 0.1 — Verify the Vercel project shape
- **Action:** confirm project settings: framework preset, build command, output dir, root dir. Via Vercel dashboard or MCP `get_project` for the Amparo project.
- **Expected observation:** framework "Other", no build command, no output dir — pure static from repo root (matches `DEPLOYMENT.md:151-153`).
- **Failure → signal → counter-move:** settings show a configured build step → someone changed the project → STOP; reconcile with operator before anything else (a build step would try to build `app-src/` and could break root deploys).
- **Fork trigger:** if MCP/dashboard unavailable this session → proceed to Move 0.2 anyway (it's root-static-safe) but do NOT execute Phase 1 until settled.
- **Verification run:** screenshot/quote of project settings in the work log. Pass = "Other"/no-build confirmed.

#### Move 0.2 — Harden the root service worker (the three landmines)
- **Action:** exactly three edits to `sw.js`, nothing else:
  1. Top of the `fetch` handler: `if (new URL(e.request.url).pathname.startsWith('/app')) return;`
  2. Activate cleanup `ks.filter(k => k !== C)` → `ks.filter(k => k.startsWith('amparo-') && k !== C)` (stops deleting foreign caches — the /app Workbox precache would otherwise be wiped by the **daily** law-watch deploy).
  3. Asset matcher `url.includes('/audio/')||url.includes('/img/')` → pathname-anchored `startsWith('/audio/')||startsWith('/img/')` (plus keep the og.png case).
  Commit alone (`fix: scope root service worker away from /app + prefix-scoped cache cleanup`), push, let it deploy.
- **Expected observation:** deploy live; DevTools → Application → SW shows the new `sw.js` (served no-store, updates immediately); on next visit `controllerchange` reload fires once; root offline behavior unchanged (toggle offline → root shell loads from cache).
- **Failure → signal → counter-move:**
  - Root offline broken after patch → precache list touched by mistake → `git revert` the commit (root SW is one file; revert is total rollback).
  - SW not updating → `/sw.js` caching header changed → check `vercel.json:20-24` untouched.
- **Fork trigger:** none. This move is unconditional and must complete + deploy **before** Move 1.2.
- **Abort condition:** any edit outside `sw.js` proves necessary → stop, flag (the promise of this phase is "root untouched except sw.js").
- **Verification run:** (1) prod visit, DevTools offline toggle → root loads; (2) `curl -sI https://www.amparohq.com/sw.js | grep -i cache-control` → no-store; (3) grep deployed sw.js for `/app` guard. Pass = all three.

### PHASE 1 — Scaffold (invisible to users)

#### Move 1.1 — Vite scaffold in `app-src/`, build into committed `/app`
- **Action:** `npm create vite@latest app-src -- --template react-ts`. Dependencies: `react`, `react-dom` ONLY (no lucide-react, no clsx, no tailwind-merge, no idb — add a dependency only when a move needs it). `vite.config.ts`: `base: '/app/'`, `build.outDir: '../app'`, `emptyOutDir: true`. `app-src/.gitignore`: `node_modules`, no ignore on `../app`. **No `package.json` at repo root, ever** — Vercel framework autodetection keys off it and could flip the project from zero-config static.
- **Expected observation:** `npm run build` inside `app-src/` emits `app/index.html` + `app/assets/index-<hash>.js|css`; `git status` shows only `app/` + `app-src/` additions.
- **Failure → signal → counter-move:** build emits absolute `/assets/...` URLs (base misconfigured) → open `app/index.html`, asset hrefs must start `/app/assets/` → fix `base`, rebuild.
- **Fork trigger:** if the operator insists on Tailwind (blueprint specified it): allowed, but the theme must map the product tokens (`--navy #1B2A4A`, `--gold #E8B84B`, `--cream #FAF6EE`, ok/line/ink values from `index.html:36-43`) and any literal `neutral-*`/`#09090b`/`#121212`/`#FFB000` in a diff is a review-blocker. Default path: plain CSS with the copied `:root` block.
- **Verification run:** clean clone → `cd app-src && npm ci && npm run build` → byte-identical `app/` (deterministic build). Pass = rebuild reproduces committed output.

#### Move 1.2 — First deploy of /app + serving verification
- **Action:** commit `app/` + `app-src/` (message: `feat: /app strangler scaffold — beta shell, root untouched`), push, wait for deploy.
- **Expected observation:** `curl -sI https://www.amparohq.com/app/` → `200`, `content-type: text/html`; `curl -s https://www.amparohq.com/ | sha256sum` unchanged vs pre-deploy; CSP header present on /app response (root's CSP — fine: `script-src 'self'` already covers hashed same-origin chunks, verified against `vercel.json:9`).
- **Failure → signal → counter-move:**
  - `/app/` 404 → Vercel static dir-index behavior differs from assumption → add to `vercel.json`: `"rewrites":[{"source":"/app","destination":"/app/index.html"},{"source":"/app/(.*)","destination":"/app/index.html"}]` — but see fork below first.
  - Root page changed → something touched root → STOP, revert, investigate.
- **Fork trigger:** bare `/app` (no slash) redirect behavior — if it 404s while `/app/` works, add only the first rewrite above; do not add the SPA catch-all until client routing exists (Phase 3+), because filesystem-first means it's harmless but untested surface.
- **RECON NEEDED (carried):** exact preview-URL header check — run `curl -sI <preview>/app/ | grep -i content-security-policy` on the FIRST preview deploy before promoting to main. Settles per-path header inheritance definitively.
- **Verification run:** the two curls above + browser visit shows Vite placeholder. Pass = 200 + root hash unchanged.

#### Move 1.3 — Beta banner + noindex
- **Action:** /app shell renders a permanent beta note ("Preview build — the live app is at amparohq.com", EN+ES, linking to `/`) and `<meta name="robots" content="noindex">` in `app-src/index.html`.
- **Expected observation:** banner visible on every /app screen; `curl -s .../app/ | grep -i robots` shows noindex.
- **Failure → counter-move:** none meaningful; cosmetic.
- **Why it exists (hard rule 3):** /app must never present itself as the finished product while unproven; and it must not enter search results and split the funnel.
- **Verification run:** grep + eyeball. Pass = both present in EN and ES.

### PHASE 2 — Shared foundations (extraction, not authorship)

#### Move 2.1 — Mechanical i18n + content extraction pipeline
- **Action:** write `tools/extract-app-content.mjs` (Node, stdlib only): parses `index.html` and emits JSON into `app-src/src/content/`: `t.en.json`, `t.es.json` (the `T` object, anchored by pattern `const T={` … not line numbers), plus `states.json` (`STATES`, `US_STATE_NAMES`, `BASE_RULES_*`, `BASE_LIFELINES`, `QR`, `QR_URL`), `pack-extra.json`, `practice.json` (`PRACTICE`, `PRX_LEVELS`, `PRX_OPT`, `PRX_VAR`, `PRX_CURVE`, `PRX_CITES`, `PRX_SIGN`, `PRX_TONE`, `PRX_DIVERGE`, `PRX_UNSCORED`, `PRX_DO`, crisis list), `map.json` (`US_PATHS`, `SM_LBL`, `SM_BOX`). Extraction = evaluate the object literals in a sandboxed context or regex-slice + `JSON.parse` after quoting — whichever, the OUTPUT is verified, not the method.
- **Expected observation:** key counts: `t.en` ≈ 518, `t.es` ≈ 517 (R1 measured); every extracted officer line string-equal to source.
- **Failure → signal → counter-move:** parse breaks on a template literal or function value inside an object → extract that object by evaluating `index.html`'s script in `node --experimental-vm-modules` sandbox with DOM stubs; if a value is a function (e.g. inside SCEN overrides), store it as data + port the logic separately and note it in the work log.
- **Fork trigger:** if any bank resists mechanical extraction after 2 hours → fall back to importing `index.html` itself at build time (fetch + regex at build) is NOT allowed (fragile); instead: copy-paste the literal block VERBATIM into a `.js` data module and record its source line range + `git hash-object` of the slice in a comment. Manual copy is acceptable; manual *retyping* is not.
- **Abort condition:** any extracted string requires "fixing" (typo, tone, wording) → stop; content edits happen in `index.html` first (possibly EDITION-relevant), then re-extract.
- **Verification run:** `node tools/extract-app-content.mjs --verify` mode: re-extract and diff against committed JSON (idempotence), plus print SHA-256 per bank. Executor logs the hashes. Pass = idempotent + counts match R1.

#### Move 2.2 — Storage adapter
- **Action:** `app-src/src/services/storage.ts`: typed read-only getters for the six root keys (shape-validated like `restore()` does — whitelist state/lang), `app_*` read-write for /app's own state, all try/catch-wrapped (sandboxed-viewer behavior preserved). Include the `amparo_prx` v1→v2 migration logic **read-side only** (interpret old shapes; never write back).
- **Expected observation:** unit check (plain node script or vitest — executor's choice, keep it one file): seeding fake `sr_save`/`amparo_prx` v1 and v2 shapes yields correct parsed state; writes only ever touch `app_*`.
- **Failure → signal → counter-move:** temptation to "migrate" root keys → forbidden by §1.2 → reads interpret, never rewrite.
- **Verification run:** run the check + grep the built bundle for `localStorage.setItem` calls — every literal key must match `/^app_/`. Pass = both.

#### Move 2.3 — Design tokens + base CSS
- **Action:** copy `:root` variables (`index.html:36-43`) and the reduced-motion/`sr-motion` convention into `app-src/src/index.css`. Port typography/base rules as needed per screen (not wholesale — screens pull what they use).
- **Expected observation:** /app shell visually reads as Amparo (cream page, navy ink, gold accents).
- **Failure → counter-move:** hex drift → the banned-constants review grep (`#09090b|#121212|#FFB000|neutral-`) in CI/verify step.
- **Verification run:** grep app-src for banned constants → zero hits. Pass = zero.

### PHASE 3 — First vertical slice: welcome + state selection

#### Move 3.1 — Welcome screen
- **Action:** port step-0 welcome (B3 in Appendix A): h1/sub, four feature rows, trust chips, sample-pack link, CTAs. Unported destinations link to the root site (absolute `/`), labeled as such. Language toggle (EN/ES pill, `aria-pressed`) wired to the extracted JSON; persisted to `app_lang`.
- **Expected observation:** /app welcome renders both languages; toggle re-renders in place.
- **Failure → signal → counter-move:** missing string key at runtime → extraction gap → add to extractor, re-run, never inline a literal.
- **Verification run:** toggle EN↔ES, diff visible strings against root's welcome (same words). Pass = string-identical.

#### Move 3.2 — Geographic state map component
- **Action:** port the map (C2): render `US_PATHS` paths + `SM_LBL` labels from `map.json`; every path `role=button` + keyboard; sliver-state labels as peer tap targets; search filter; picked-state collapse. Implementation guidance (from the documented bugs in source): label placement uses `getBBox()` → must run in `useLayoutEffect` after mount, on a visible SVG; entrance wave fires ONCE (ref flag), never on re-render; search filtering toggles classes, does not re-mount 51 paths.
- **Expected observation:** map renders all 51 targets; tap → collapse to silhouette + "Not your state?"; search narrows; keyboard operable.
- **Failure → signal → counter-move:**
  - Labels stack at 0,0 → `getBBox` before layout → move measurement to `useLayoutEffect`/`requestAnimationFrame` after mount.
  - Entrance wave re-fires on every keystroke (the exact "feels clunky" bug the source documents fixing) → animation armed from a `useRef(false)` latch, not from render.
- **Fork trigger:** if React re-render semantics still fight the imperative choreography after one focused day → wrap the EXISTING vanilla map code (extracted verbatim) inside a single React component that owns a ref container and never re-renders (`memo` with no props) — the strangler pattern applied one level down.
- **Verification run:** click TX/GA/NY + one pending state + one sliver label (RI); search "tex"; all on mobile viewport 375px. Pass = selection works all five ways, no console errors.

### PHASE 4 — Second band: You / docs / lifelines / print

#### Move 4.1 — You step + document capture overlay
- **Action:** port C3 + D1: contact fields (persist to `app_save`), skip affordances, docs overlay with native `<input type="file" accept="image/*" capture="environment">` — **no getUserMedia** (design history: the 493-line guided capture engine was deleted in v2.1.0; its absence is a decision, not a gap). Port `docsShrink` canvas downscale (1100px/0.72 JPEG) and quota-failure rollback + alert. Photos to `app_docs` (own key, wipeable independently — same promise as root).
- **Expected observation:** photo add/replace/remove works; quota path testable by filling storage in DevTools.
- **Failure → signal → counter-move:** photos accidentally colocated with `app_save` → violates the delete-photos-alone promise → separate key, verified by grep.
- **Verification run:** add photo → reload → persists; delete-all → `app_save` untouched (DevTools). Pass = both.

#### Move 4.2 — Lifelines step
- **Action:** port C4: segmented tabs, snap track + dots, lifeline cards with tel:/https detection, situation cards from extracted `SCEN` (incl. TX overrides), Continue never gated.
- **Expected observation:** parity with root step 3 in both languages.
- **Verification run:** side-by-side EN and ES vs root. Pass = content-identical, "Coming soon" entries inert.

#### Move 4.3 — Print system
- **Action:** port F5 with the SAME architecture: one hidden print DOM built by a `buildPrint()` port (JSX or template strings — but user-entered values must go through escaping; JSX gives it free), print CSS copied from `index.html:1030-1112`, thumbnails = clone print DOM + scale by `clientWidth/(8.27*96)` (do NOT re-render pack as separate component trees — the source documents that thumbnails and print must not be able to drift). `window.print()`, `beforeprint` build-on-demand, the 4-second Android double-fire debounce, afterprint honest banner + flag writes to `app_save`.
- **Expected observation:** print preview from /app produces a 6-page PDF visually matching root's (headers, window card, wallet cards, edition footer "Edition 2026-C — replace after 07/2027" on every page).
- **Failure → signal → counter-move:** print CSS scoping breaks under Vite CSS handling → keep print CSS in a plain global stylesheet (not CSS modules), imported once.
- **Fork trigger:** if pixel drift vs root is more than layout-trivial → diff the two print DOMs (they share extraction data; drift means the builder port diverged) — fix builder, never patch with print-CSS overrides.
- **Verification run:** print-to-PDF root vs /app, same TX demo data, page-by-page eyeball + page count = 6 + edition footer present. Pass = no content differences, layout differences ≤ cosmetic.

### PHASE 5 — Practice engine

#### Move 5.1 — Engine core as an explicit FSM
- **Action:** port G2/G5/G6/G7 on the FSM shape adopted from the digest: `IDLE → PRE_FLIGHT → OFFICER_SPEAKING → AWAITING → EVALUATING → BEAT_COMPLETE → DEBRIEF`, with `isMuted` as first-class state (§1.3). Deck building (`prxBuildDeck` port: fixed tracks for 3–7, tone-pool variant deal for 0–2, date-seeded curveball splice), divergence (`PRX_DIVERGE` selection-only), per-level consent gates (`prWarnOk` semantics), lock guard **in the transition function** (the source warns: styling helpers don't refuse — the guard does; same here: locks live in the FSM, not the UI).
- **Expected observation:** a deck for L0–L4 builds identically to root given the same date seed (compare beat ci sequences).
- **Failure → signal → counter-move:** crisis-beat score misalignment (the prRunIdx lesson) → port `prRunIdx` mapping exactly; verify with a simulated crisis beat mid-run.
- **Abort condition:** any beat/option/coach string in the ported engine fails hash-match vs extraction → stop (content drift).
- **Verification run:** deterministic-deck test (fixed date): root vs /app deck ci sequences equal for all 5 live levels × 3 runs. Pass = equal.

#### Move 5.2 — Practice UI + audio
- **Action:** port G8/G11: scenario-select card list (with §1.3 fixes: tone-tier text prefixes, real `disabled` on locked), chat thread, demeanor meter (aria-live), score ring (`g/a` always, unscored never), results/debrief screens (hard-mode scoreless), audio player with the double-fallback latch (clip 404/play-rejection → single TTS fallback), absolute `/audio/<lang>/<voice>/<id>.mp3` paths (no bundling — 240 files stay shared with root, immutable-cached), mute/gender/ES-voice-lang controls, idle-freeze choice offer (12s, choice not escalation), typed-answer path with the same accent/apostrophe-insensitive matcher, crisis detection on both paths (tier x, 988 line, **no analytics — trivially true, /app has none**). **No record console, no SpeechRecognition** — the gate stays dead in /app exactly as in root; do not port `PRX_SR` at all.
- **Expected observation:** full L0 run start-to-results in EN and ES; audio plays from shared /audio; mute prevents ALL audio including TTS fallback (the documented double-gate bug).
- **Failure → signal → counter-move:** audio ids break → the filename contract (`v<beat>_<i>`, `c<i>`, `h<ci>`, `k3x`) was altered → ids come from extraction, never regenerate.
- **Fork trigger:** ES voice mode beats k30/k33 → TTS fallback is CORRECT behavior (human read pending, HANDOFF issue #4) — do not "fix."
- **Verification run:** scripted run-through per level 0–4: complete, check score/streak/best writes to `app_prx` mirror root semantics (denominator, unscored suppression). Pass = all five levels complete with correct scoring behavior + zero root-key writes.

#### Move 5.3 — Overlay/a11y framework
- **Action:** port H1/H2 semantics with ONE system (whether hand-rolled like source or a single headless library): focus trap, Escape closes topmost by z-order, focus restore, `inert` background, `esc()`-equivalent escaping wherever template strings survive.
- **Expected observation:** keyboard-only full pass: welcome → state → you → print → practice L0.
- **Verification run:** the keyboard pass + axe-style scan (no criticals). Pass = both.

### PHASE 6 — /app PWA + the parity audit

#### Move 6.1 — /app service worker + manifest (LAST, not first)
- **Action:** add `vite-plugin-pwa`: SW scoped `/app/` (emitted at `/app/sw.js`, default scope = its directory — no header needed), Workbox precache of build assets, runtime cache-first for `/audio/**` and `/img/**` (own cache name, `workbox-*` prefix — safe from root cleanup after Move 0.2). Manifest: explicit `"scope":"/app/"`, `"start_url":"/app/"`, `"id":"/app/"`, product colors, own icons.
- **Expected observation:** second visit to /app offline-capable; root SW untouched (its /app passthrough guard means first-visit /app requests go to network).
- **Failure → signal → counter-move:** root offline shell serves for /app deep links offline before /app SW installed → known + accepted beta behavior (documented in Move 0.2 design); no counter-move needed.
- **RECON NEEDED:** iOS dual-manifest behavior (two home-screen installs, per-app scope) — settle with a device test on real iOS Safari; **non-blocking** for beta (installability of /app is not a beta requirement; root remains the installable app).
- **Verification run:** DevTools: two SW registrations, scopes `/` and `/app/`; offline toggle → /app loads; root loads. Pass = both offline.

#### Move 6.2 — Parity audit + evidence pack
- **Action:** walk Appendix A end-to-end; for each system mark PORTED / DEFERRED(reason) / N-A(reason — e.g. A1 cowork meta, F6 dormant email stays root-side, I1 quick-exit stays unbuilt-by-design). Run the full verification suite (§6). Write the results to `wargames/16-app-parity-report.md` (next number at time of execution — adjust to the actual next free number).
- **Expected observation:** no system silently absent — every row has a verdict.
- **Abort condition:** >10 DEFERRED rows without operator sign-off → the "beta" is a fragment, not a parity candidate; stop and review scope.
- **Verification run:** the report itself + suite results. Pass = suite green, report committed. **The mission ends here.** Root flip requires: this report + operator decision + its own wargame.

---

## 4. Fork summary (all triggers in one table)

| # | Trigger observed | Route |
|---|---|---|
| F1 | Vercel project has a build command configured | STOP before Phase 1; reconcile with operator |
| F2 | `/app/` 404s on preview | Add dir-index rewrite; SPA catch-all only when routing exists |
| F3 | React fights the map's imperative choreography > 1 day | Wrap extracted vanilla map verbatim in a no-rerender ref component |
| F4 | Root shell/cache misbehaves post-0.2 | `git revert` the sw.js commit (single-file rollback) |
| F5 | A content bank resists mechanical extraction > 2h | Verbatim copy-paste with source-range + slice hash recorded; never retype |
| F6 | Operator insists on Tailwind | Allowed with product-token theme; banned-constant grep enforced |
| F7 | Print output drifts beyond cosmetic | Fix the builder port; never patch via print-CSS overrides |
| F8 | ES k30/k33 fall to TTS | Correct behavior — do not fix |

## 5. Abort conditions (stop and flag, never improvise)

1. Any move seems to require **authoring or editing an officer line, legal phrase, statute text, or citation** — including "just fixing a typo."
2. Any change to root `index.html` beyond nothing (Phase 0 touches `sw.js` only; `vercel.json` only under F2).
3. Any /app write to a root-owned storage key, or any network request leaving the origin (except the shared same-origin asset/statute-status fetches).
4. Extraction hash mismatch on any content bank at any later phase (drift detection).
5. Vercel project settings differ from static/no-build and can't be reconciled same-session.
6. Bundle exceeds **300KB gzipped JS** for the app shell+engine (web-rules budget) — flag with numbers; operator decides.
7. Flags: any diff flipping `FINAL_SCENARIOS_ENABLED` / `DOOR_MODULE_ENABLED` or removing a `TODO_ATTORNEY` / `TODO_DV_CLINICIAN` placeholder.

## 6. Verification suite (run at 6.2, and per-move as listed)

1. **Root integrity:** `curl -s https://www.amparohq.com/ | sha256sum` unchanged across every /app deploy (except the one sw.js deploy).
2. **Content integrity:** extractor `--verify` idempotence + per-bank SHA-256 log; spot-diff 20 officer lines EN+ES against `index.html`.
3. **Storage audit:** DevTools localStorage snapshot after a full /app session — six root keys byte-identical to before; all new keys `app_*`.
4. **Analytics silence:** network tab across a full /app session — zero requests to posthog hosts from /app pages.
5. **Deterministic decks:** fixed-date deck comparison, 5 levels × 3 runs, root vs /app.
6. **Print parity:** 6-page PDF diff (TX demo data), edition footer on all pages.
7. **Offline:** DevTools offline → root loads (root SW) AND /app loads (after Move 6.1).
8. **A11y:** keyboard-only full pass + no critical axe findings.
9. **Perf:** Lighthouse on `/app/` (mobile): LCP < 2.5s, CLS < 0.1, JS ≤ 300KB gz. Log numbers next to root's for the promotion decision.
10. **Banned constants:** grep for `#09090b|#121212|#FFB000|neutral-|posthog|clerk|convex|stripe|SpeechRecognition` in `app-src/` → zero hits (posthog/clerk/convex/stripe as import names).

## 7. Red-team record

**Attack that failed:** "The root CSP will block the Vite bundle — hashed chunk filenames aren't allowlisted." Checked against `vercel.json:9`: `script-src 'self'` covers ALL same-origin scripts regardless of filename; Vite builds need no inline scripts; Tailwind/plain CSS is build-time static under `style-src 'self'`. The attack found nothing — CSP requires zero changes for /app to function.

**Attack that succeeded → patch #1:** "The daily law-watch cron commits → deploys → root SW `activate` deletes every cache not named `amparo-v3` → the /app Workbox precache is wiped **every single day**, and /app's offline promise silently dies while still being claimed (hard-rule-3 failure mode)." This kills any naive /app-PWA-first plan. Patches now structural: Move 0.2 ships the prefix-scoped cleanup BEFORE any /app code exists, and /app's own SW is deliberately LAST (Move 6.1) so no window exists where /app claims offline capability it loses nightly.

**Attack that succeeded → patch #2:** "A user visits /app while online; the root SW's navigation handler stores the /app HTML under its `CORE` key; the root app's offline fallback now serves the WRONG app to every offline visitor." Real — `sw.js:48` writes every successful navigation over the cached root shell. Patch: the `/app` passthrough guard is line one of Move 0.2 and Phase 0 must fully deploy before Move 1.2 creates any reachable /app URL.

**Attack that succeeded → patch #3:** "The executor, seeing '/app is a fresh app', inits PostHog with defaults to 'keep the funnel data flowing' — autocapture on, replay everywhere, second `$pageview` stream corrupting the funnel denominators exactly like the v2.7.1 bug." Patch: §2 pre-answers it — /app beta ships zero analytics, and verification #4 makes silence a tested property, not a hope.

## 8. Self-grade vs the 8-point standard

1. Expected observation per move — ✅ every move.
2. Most-likely failure + signal + counter-move — ✅ every move (some cosmetic moves carry a single trivial one, stated as such).
3. Every fork has a trigger — ✅ §4, eight forks, all observable conditions.
4. RECON NEEDED marked with exact check — ✅ two carried (preview CSP curl; iOS dual-manifest device test) + Move 0.1's settings check.
5. Abort conditions — ✅ §5, seven.
6. Verification spelled out — ✅ per-move + §6 suite with pass criteria.
7. Red-team pass recorded — ✅ §7: one failed attack, three successful → three structural patches.
8. Executable blind — ✅ believed: every judgment pre-made (analytics, storage, palette, Tailwind fork, SW ordering, content extraction rules). The executor's only escalations are the abort conditions, which are stop-and-flag by design. *(House deviation: no LEDGER.md — this repo's convention is the wargame doc itself carrying the grade; noted, not fixed.)*

---

## Appendix A — Parity inventory (recon R1, verbatim)

*The complete system inventory of `index.html` (v2.16.1-era, 5,880 lines). Every row is a parity checklist item for Move 6.2.*

### A. Shell/boot: A1 cowork-artifact meta (N-A candidate) · A2 head/meta/PWA installability (iOS 7-day eviction is why installability exists) · A3 CSS design system + dark practice card as scoped overrides (NOT a var retheme — documented) · A4 GSAP+SRI+SRMotion with no-GSAP degradation first-class · A5 PostHog with five load-bearing privacy flags + replay scoped to steps 0-1 + demo quarantine · A6 sw.js (amparo-v3; network-first nav; audio/img cache-first; skipWaiting+claim+guarded reload) · A7 vercel.json CSP/HSTS/headers · A8 404.html branded page · A9 robots/sitemap/og/manifest · A10 law-watch pipeline (relative fetch of law-status.json; silent-fail-by-design)

### B. Splash/landing: B1 splash+layered LOGO with quick path for returning users · B2 header/brand/lang toggle/pilot banner/disclaimer · B3 welcome (trust chips, resume chip, sample pack, share, About, hard-truth link) · B4 stepper with clickable completed nodes + travelling state pill (SM_BOX silhouette) · B5 stale-edition + usage banners (packFreshness; never stacked) · B6 "I'm stuck" strip · B7 About overlay (REVIEW config, edition-locked badges) · B8 hard-truth doc overlay (Castile/Wright, sourced)

### C. Wizard: C1 nav core (`go/goM`, `_navBusy`, sr_step_viewed slugs) · C2 state step — geographic map (US_PATHS/SM_LBL/SM_BOX, sliver-label peer targets, entrance wave off real centroids, getBBox label placement, search filter, collapse/expand ×3 code paths, fast path skipToPack) · C3 You step (contacts, equal-weight skip, finish-later) · C4 lifelines (segmented tabs, snap track, SCEN 7+7 with TX overrides, Continue never gated) · C5 print preview (clone-DOM thumbnails ×6, one gold action, post-print rail, print help, feedback tap) · C6 practice hub (3 module tabs; door tab renders honest "unbuilt and why"; sequential locks; unscored best suppression)

### D. Document capture: native file input only (no getUserMedia — 493-line capture engine deleted v2.1.0, decision not gap), docsShrink 1100px/0.72, quota rollback + alert, own `sr_docs` key so photos wipe independently, restore validates `data:image/` prefix

### E. Persistence: `data` object + print-cycle flags + isDemo quarantine; **six keys**: sr_save (whitelist-validated restore, Spanish auto-detect, resume chip) · sr_docs · amparo_prx (**two migrations: v1 flat shape; v2 level-index remap 4→3/5→4** — port byte-for-byte or returning users' progress remaps wrong) · amparo_muted · amparo_voice · amparo_stt (read-only, nothing writes it)

### F. Content/legal/pack: F1 STATES TX/GA/NY full rules+statute quotes+per-state lifelines; US_STATE_NAMES 51; BASE_RULES federal floor; pending-flag synthesis (one flag drives map/grid/print/freshness/restore) · F2 REVIEW + EDITION="2026-C"/ED_REPLACE edition-locked attorney badges · F3 QR per cited state, text fallback only for others · F4 PACK_EXTRA pages 4-6 incl. checkpoint section + notice-of-claim deadlines · F5 buildPrint 6 pages + placement strips + beforeprint 4s debounce + afterprint honest banner · F6 email function (dormant, emailEnabled:false — carry as flagged-off, not absent) · F7 .ics writer ×2 callers (reprint at ED_REPLACE; finish-later tomorrow 19:00) — the ONLY off-app channel · F8 sample/demo mode with analytics+persistence quarantine · F9 restart / print-for-family / update-stale flows

### G. Practice engine: G1 intro + prep drill + tap-to-place recall (own mini-engine, 4 events, gates first-ever run) · G2 decks/levels (L0-L4 live; L5/L6/L7 dark), PRX_UNSCORED Set, prxBuildDeck (fixed tracks vs tone-pool deal, date-seeded curveball) · G3 flags + dark scaffolding (warn texts, debriefs, unlock chain — port dark or the flag flip becomes a rebuild) · G4 37 variant lines + 10 curveballs + PRX_SIGN per-state card 5 + PRX_CITES · G5 PRX_OPT g/b/coach/react (+bothGood hard-mode, checkpoint never-drive-away) · G6 run FSM (prWarnOk per-level consent; prRunIdx crisis-skip alignment) · G7 divergence v2.14 (selection-only; L2 hostile leg inert — flagged, correct) · G8 audio (240 mp3s, filename contract, double-fallback latch, TTS tone rate/pitch, officer defaults EN in ES mode, idle-freeze choice, mute double-gate; SR layer gated OFF v2.16.1 — do not port) · G9 typed path (same matcher, skip never penalized) · G10 crisis detection (12 phrases, NFD+apostrophe normalize, tier x, no analytics BY DESIGN) · G11 practiceRender (select list v2.16, warn gates, results/debriefs incl. scoreless hard mode, live beat: chat thread/ring/rail/demeanor aria-live/controls) · G12 carry card (canvas PNG, share-file→download→long-press ladder) · G13 share cert + Wordle-style run share · G14 streak = days practiced, never perfection

### H. Overlay/a11y: central manager (7 overlays, z-aware Escape, focus trap/restore, inert background) · KACT keyboard helper · esc() XSS guard (JSX replaces it — but NOT in ported template strings)

### I. Quick-exit: REMOVED feature; the lesson is the spec — never re-add without wipe-before-navigate (bfcache restored licence photos)

### J. Assets: 240 mp3 (en/f 62, en/m 62, es/f 58, es/m 58; ES missing k30/k33 deliberately; orphans v0_4… exist; c0-c8 double as canonical fallbacks) · img: icons, officer-f/m.jpg, scene-1..4.jpg · og.png

### K. Totals: T keys ≈518 EN / ≈517 ES (true bilingual total ≈2×); 6 localStorage keys; **42 analytics events** (payloads never free text; crisis + demo deliberately non-events); 240 audio files

### L. Fifteen systems recon found beyond the brief's list — all folded into rows above (stuck strip, demo quarantine, resume/auto-ES, replay scoping, email wiring, prep drill, idle redesign, prx migrations, a11y framework, 404/law-watch/headers/meta, orphan audio + c-id double-duty, placement strips + claims block, finish-later ics, stepper nav + pill, dark practice card)

## Appendix B — Constraint sheet (recon R3, condensed)

Hard rules 1-5 (HANDOFF) verbatim-condensed + 15 constraints with sources: rebuild-supersession (§0 above), no-identity-stack (wargames/05: token-only, "no name, no email, no IP"), UPL sequencing (memo before revenue; scored engine is the exposed component), no new scenario content (df974b7 precedent; both gate memos unsent), flags stay dark, cream/navy/gold, SR stays gated, no cloud TTS/push, fixed data tiers + key migrations, privacy copy changes ship same-commit, no convincing stubs, duress-wipe/covert-recording stay dead, SW/offline contract, minimal impersonal analytics, roadmap alignment (migration advances nothing in wargames/02's top 10 — the memos remain move #1 and this work must not displace them).
