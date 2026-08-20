# Wargame 33 — Core Web Vitals fix pass (root + /app)

Mission brief: `tasks/33-core-web-vitals-fix-pass.md`. War-gamer: Sonnet 5. Intended executor:
Sonnet (mechanical moves may drop to Haiku — see the model-routing table). Date: 2026-08-20.

## Recon findings (read-only, verified against source — not assumed)

- Root `index.html`: **675,145 bytes (~659 KiB)** as of this commit (`2aff921`, "Meta domain
  verification tag"), up from HANDOFF's recorded 545.5 KB at v2.21.2 one week earlier. No bundler,
  no build step — every byte ships as authored.
- `<h1>` appears **15 times** in the source, one per screen-state template string. Only one mounts
  into the live DOM at a time (this is a client-rendered SPA, screens swap via `innerHTML`) — so a
  JS-executing scanner (PSI/Lighthouse) sees exactly one `<h1>` per scan, whichever screen is active.
  **This is very likely a non-issue, not a bug** — confirmed as a RECON NEEDED item below rather than
  asserted either way, because a raw (non-JS) crawler would see none or the wrong one.
- `<img>` tags: mix of static bundled assets (`img/officer-${prxGender}.jpg`, line 6187) and
  runtime user content (license/document photos rendered from in-memory `data[...]`/`data.lic_f` —
  the user's own captured photos, never uploaded anywhere). **None carry `loading=` or
  `fetchpriority=` attributes.** Only the QR code image (line 4539) has real `width`/`height`
  attributes; one other uses inline `style="width:...;height:..."` (line 4523, not a true
  layout-reservation attribute). This is a real, verified gap.
- GSAP script (line 1190-1192) **already has `async`** and SRI (`integrity=`) — confirmed correct,
  not a gap. Do not "fix" this.
- Zero `rel="preload"` or `rel="preconnect"` anywhere in root `index.html`, including for
  `cdnjs.cloudflare.com` (the GSAP host) — a real, verified gap.
- `vercel.json`'s CSP is live and **already ships `script-src 'self' 'unsafe-inline' ...` and
  `style-src 'self' 'unsafe-inline'`** — not nonce-based, contrary to this operator's own
  `web/security.md` preference. This is pre-existing, shipped, and out of this mission's scope to
  change — but it means inline critical-CSS/script tricks are technically *permitted* by the CSP
  as it stands, which pulls in the opposite direction from the security rule. Flagged, not touched.
- `app/index.html` (built `/app` output): `<script type="module" crossorigin src=.../index-*.js>`
  (module scripts defer natively) + one render-blocking stylesheet link, both already Vite-standard
  and within HANDOFF's measured budget (91.5 KB gz / 76.7 KB br entry). `/app` is likely already
  close to CWV-healthy; **root is the higher-value target.**
- Lines 1-9 of `index.html`: a `<script type="application/json" id="cowork-artifact-meta">` block
  (~230 bytes) sits *before* `<html lang="en">` — inert JSON, `type="application/json"` never
  executes. Looks like leftover tooling metadata, not product code. Trivial, free, optional cleanup
  — see Move 5. Not load-bearing to the mission either way.
- `git status` at mission-authoring time: `app-src/index.html`, `app/index.html`,
  `arena/index.html`, `vercel.json` sit modified and uncommitted, from unrelated prior work. These
  are off-limits unless a move below explicitly says otherwise.

## Overall short-circuit (read before Move 3)

Moves 1-2 are cheap, close to zero-risk, and resolve a real unknown (no PSI data has ever been
gathered for this project). Moves 3-7 are real engineering time. **If Move 1's data comes back
already meeting every target in the brief's Constraints section (LCP<2.5s, INP<200ms, CLS<0.1,
FCP<1.5s, TBT<200ms) on both root and /app, mobile and desktop — stop after Move 2, log the clean
bill of health in `LEDGER.md`, and do not manufacture Moves 3-7 for their own sake.**

---

### Move 1 — Baseline: run PageSpeed Insights on both surfaces, both device profiles

- **Action:** run PageSpeed Insights (web UI at pagespeed.web.dev, or the PSI v5 API) against
  `https://www.amparohq.com/` and `https://www.amparohq.com/app/`, both `mobile` and `desktop`
  strategy. Save all four full reports (JSON if via API, saved page/screenshots if via web UI) into
  the mission's working notes.
- **Expected observation:** four reports, each carrying numeric LCP, INP (or the older FID on some
  report versions), CLS, FCP, TBT, plus an "Opportunities" and "Diagnostics" list.
- **Most-likely failure -> cause -> counter-move:**
  - PSI API call returns 403/quota error -> no API key configured for volume use -> fall back to
    the web UI, manually transcribe the Core Web Vitals numbers and the Opportunities/Diagnostics
    list into the findings doc.
  - Mobile score is dramatically worse than desktop (common; mobile runs a simulated slow
    connection + throttled low-end CPU) -> this is expected PSI behavior, not a bug -> record both,
    but weight mobile higher in triage per the brief's Constraints (real users are on phones,
    often mid-stop).
- **Fork trigger:** if `/app/`'s Lighthouse performance score beats root `/`'s by more than 15
  points on the *same* device profile, that is a real data point for HANDOFF's still-open
  "/app-promotion decision" (issue #10). Record it verbatim in the findings doc under a clearly
  labeled "For the /app-promotion decision, not this mission" heading. Do not act on it, do not
  let it change this mission's scope.
- **RECON NEEDED:** does the live `<h1>` scanning concern (15 in source, 1 mounted at a time)
  actually show up as a PSI/Lighthouh "Document doesn't have a valid `<h1>`" or "multiple h1"
  diagnostic? Check: read Move 1's own Diagnostics output for root `/`. If no such diagnostic
  appears, the concern was a non-issue — drop it from the findings doc entirely rather than
  "fixing" something PSI never flagged.
- **Abort condition:** PSI is unreachable on both API and web UI after two tries on each — stop,
  flag in `LEDGER.md` under mission 33, do not proceed to Move 2+ without real numbers. Fixing
  blind defeats the entire point of this mission.
- **Verification run:** four saved reports exist, each with real numeric values (not error pages,
  not "N/A" placeholders) for all five target metrics. Pass = all four present and numeric.

### Move 2 — Triage: rank findings, tag scope, write the findings doc

- **Action:** from Move 1's four reports, extract every flagged Opportunity/Diagnostic, dedupe
  across mobile/desktop, and write a findings doc (e.g. `notebook/amparo-cwv-findings-2026-08-20.md`
  matching this repo's `notebook/` naming convention) ranking each by estimated impact. Tag every
  item one of: **in-scope** (markup/asset/loading, fixable this pass), **structural-ceiling**
  (real, but requires a build-tooling or architecture change out of this mission's scope),
  **out-of-scope** (touches practice-engine, statute content, or user-facing copy — hard rule 1 /
  extraction-invariant territory).
- **Expected observation:** a written doc where every flagged item has a scope tag and a one-line
  reason for that tag.
- **Most-likely failure -> cause -> counter-move:**
  - PSI flags "reduce unused JavaScript" against the single 675 KB hand-written `index.html` with
    no bundler/tree-shaking -> this is structural, not a quick fix -> tag **structural-ceiling**,
    note it requires the `/app`-promotion decision to fully resolve, do not attempt a partial
    bundler retrofit.
  - PSI flags "serve images in next-gen formats" against the user-uploaded license/document
    photos (`data[...]`/`data.lic_f`, in-memory, never uploaded anywhere) -> these can't be
    pre-compressed at build time; a real fix would mean client-side compression before the photo is
    stored, which is a *behavior* change to document-capture, not a passive optimization -> tag
    **out-of-scope**, note it as a separate future decision, do not silently change how captured
    photos are stored.
- **Fork trigger:** if the same finding appears against both root and `/app`, check whether `/app`
  inherited it from root via the content-extractor (`tools/extract-app-content.mjs`) — if so, fixing
  root's `index.html` propagates on the next extract; do not hand-duplicate the fix inside
  `app-src/`.
- **RECON NEEDED:** does any in-scope item touch code inside the practice-engine (`PRX_*`) or any
  statute-rendering path, even incidentally (e.g. an image inside a practice-card component)? Check
  each in-scope item's surrounding code before Move 4 touches it; re-tag to out-of-scope if so.
- **Abort condition:** none — this is a synthesis move, always completable from Move 1's data.
- **Verification run:** findings doc reviewed; every item has a scope tag and a reason. Pass = zero
  untagged items. **This is also the short-circuit checkpoint — re-read the Overall short-circuit
  section above before continuing to Move 3.**

### Move 3 — Isolate: create the fix branch or worktree

- **Action:** `git worktree add ../amparo-cwv-fix -b cwv-fix-pass` (fall back to a plain
  `git checkout -b cwv-fix-pass` on the existing tree if worktree tooling is unavailable).
- **Expected observation:** new branch/worktree exists; `git status` inside it shows a clean
  checkout with no unexpected modifications.
- **Most-likely failure -> cause -> counter-move:** branch name collision (`cwv-fix-pass` already
  exists from a prior partial attempt) -> suffix with the date, `cwv-fix-pass-2026-08-2x`.
- **Fork trigger:** none.
- **RECON NEEDED:** none.
- **Abort condition:** the four pre-existing uncommitted files (`app-src/index.html`,
  `app/index.html`, `arena/index.html`, `vercel.json`) show up as modified inside the NEW
  branch/worktree too (expected if using a plain branch on the same tree, not a worktree) — this is
  fine to observe, but Move 7's commit must not include them. If using `git worktree add`, a fresh
  worktree checks out from the last *commit*, so these uncommitted changes will simply be absent
  there — confirm which situation applies before Move 4.
- **Verification run:** `git worktree list` (or `git branch`) shows the new branch; `git status`
  reviewed and understood before proceeding.

### Move 4a — Zero-risk fixes (start immediately, do not wait on Move 1/2)

- **Action:** add `rel="preconnect"` for `cdnjs.cloudflare.com` (confirmed GSAP host from recon)
  near the top of `<head>`. Confirm GSAP's existing `async` attribute is untouched (line ~1190-1192
  at mission-authoring time — line numbers will have shifted if Move 5 already ran; search for the
  `cdnjs.cloudflare.com/ajax/libs/gsap` string instead of trusting the line number).
- **Expected observation:** one new `<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>`
  line; no other change; page renders identically.
- **Most-likely failure -> cause -> counter-move:** none realistically — this is additive and inert
  if wrong. If PostHog's actual ingest domain is confirmed reachable from this page (check
  `vercel.json`'s CSP `connect-src` list for the real PostHog host in use), add a second preconnect
  for it; if unconfirmed, skip rather than guess a domain.
- **Fork trigger:** none.
- **RECON NEEDED:** none — this move is safe to run before Move 1's data comes back, per the
  red-team patch below.
- **Abort condition:** none.
- **Verification run:** view-source shows the new preconnect line; page loads with no console
  errors.

### Move 4b — PSI-prioritized fixes (waits on Move 2's findings doc)

- **Action:** for each **in-scope** item from Move 2, apply the minimal markup fix. Primary
  expected class: add `loading="lazy"` to below-the-fold static images, `fetchpriority="high"` +
  eager loading to any confirmed above-the-fold hero image, and explicit sizing (`width`/`height`
  attributes, or `aspect-ratio` CSS where the image's box is otherwise flex/responsive-sized) to
  static images only — not to runtime user-photo `<img>` tags whose aspect ratio is unknowable
  ahead of render (tagged out-of-scope in Move 2 already).
- **Expected observation:** diff touches only `<img>` attributes and possibly a few lines of CSS —
  no JS logic changes, no CSP changes.
- **Most-likely failure -> cause -> counter-move:**
  - Adding fixed `width`/`height` to an image inside a flex-sized container (e.g. the document-capture
    thumbnail pattern at line ~4523) breaks the existing responsive layout -> signal: visual
    overflow or squish on manual check -> counter-move: use `aspect-ratio` CSS on the wrapper
    instead of fixed pixel attributes; if that also fights the existing layout, skip that specific
    image and note it in the findings doc as "layout-coupled, needs a design pass," don't force it.
  - `loading="lazy"` applied to an image that is actually above-the-fold on the first screen a new
    visitor sees (the Welcome/state-picker screen) -> signal: re-measured LCP (Move 6) gets *worse*,
    not better -> counter-move: revert `loading="lazy"` on that specific image; per the RECON NEEDED
    below, above-the-fold status must be confirmed before this move, not assumed.
- **Fork trigger:** if a flagged image is user-uploaded runtime content, skip pre-compression and
  dimension-forcing entirely (already tagged out-of-scope in Move 2) — attributes only where
  geometry is knowable ahead of render.
- **RECON NEEDED:** which images are actually above-the-fold on the Welcome screen (`_t.w_title`,
  the default entry state)? Check by loading the live site and inspecting DevTools' paint order /
  Coverage panel, or by reading the CSS/render path around the Welcome screen. Do not lazy-load
  anything confirmed there.
- **Abort condition:** an in-scope fix turns out to require touching code inside `PRX_*` or a
  statute-rendering path that Move 2's RECON NEEDED check missed — stop, re-tag it out-of-scope,
  do not proceed on that item. This mission's scope is markup/asset/loading only.
- **Verification run:** `git diff` reviewed — confirms attribute/markup-level changes only; manual
  click-through (Welcome -> state pick -> practice -> carry card) confirms no visual regression.

### Move 5 — Optional trivial cleanup: dead `cowork-artifact-meta` block

- **Action:** `grep -rn "cowork-artifact-meta"` across the repo (excluding `node_modules`,
  `.git`). If the only hit is the definition itself at the top of `index.html`, delete that
  9-line `<script type="application/json" id="cowork-artifact-meta">...</script>` block.
- **Expected observation:** file is ~230 bytes smaller; page renders identically (the block is
  inert JSON that never executes).
- **Most-likely failure -> cause -> counter-move:** the grep turns up a second reference somewhere
  (build tooling, an external integration reading that element by id) -> do NOT delete; drop this
  move, it was based on a false premise.
- **Fork trigger:** none beyond the grep check above.
- **RECON NEEDED:** the grep itself — this move IS its own recon check, run it fresh, do not trust
  this document's earlier claim that nothing references it (this doc could be stale by the time it
  executes).
- **Abort condition:** none — fully optional, skip cleanly if the grep finds a live reference.
- **Verification run:** page loads identically before/after (visual spot-check); `wc -c index.html`
  shows the expected ~230-byte drop.

### Move 6 — Re-measure and compare

- **Action:** deploy the branch to a Vercel preview (check deployment protection isn't blocking
  PSI's crawler — read-only check via the Vercel MCP's `get_project_deployment_protection`, don't
  change it) or run Lighthouse CLI locally against `vercel dev` / a static server. Run **three times
  per surface per device profile** and average — a single sample is not reliable (PSI/Lighthouse lab
  data is noisy run-to-run). Compare against Move 1's baseline.
- **Expected observation:** an averaged before/after table for all four combinations
  (root/app x mobile/desktop), all five target metrics.
- **Most-likely failure -> cause -> counter-move:**
  - No measurable improvement, or a regression on any metric -> isolate which specific Move
    4a/4b fix caused it by reverting one change at a time and re-measuring, rather than reverting
    the whole branch at once.
  - Preview URL isn't publicly crawlable (Vercel preview protection defaults to SSO-gated on some
    plans) -> fall back to local Lighthouse CLI against a local static server serving the branch.
- **Fork trigger:** if all four combinations hold steady or improve with zero regressions on any of
  the five metrics -> proceed to Move 7. If any metric regresses on any combination -> apply the
  isolate-and-revert counter-move above, re-measure, do not proceed to Move 7 with a net-negative
  change.
- **RECON NEEDED:** none beyond Move 1's established baseline format.
- **Abort condition:** after two rounds of isolate-and-revert, a clean net improvement still can't
  be shown on at least one metric with zero regressions elsewhere -> stop, log "attempted, no clean
  win found this pass" in `LEDGER.md`, do not force a merge for the sake of closing the mission.
- **Verification run:** the before/after table itself, 3-run-averaged each side. Pass = at least one
  target metric measurably improved, zero regressions on any of the five.

### Move 7 — Land it (commit only — push is HUMAN CONFIRM)

- **Action:** `git status` and `git diff --staged` reviewed to confirm only in-scope files are
  staged (the four pre-existing unrelated modified files must NOT be swept in unless a move above
  explicitly touched them for an in-scope reason). Commit locally with a why-focused message. Stop.
  Report the commit hash, the before/after table, and the findings doc to the operator. **Do not
  `git push` and do not trigger a deploy — that step requires the operator's explicit go-ahead**,
  per this environment's standing rule that pushing code is a human-confirm action, not autonomous.
- **Expected observation:** one local commit on `cwv-fix-pass`, clean `git status` afterward, no
  unrelated files included.
- **Most-likely failure -> cause -> counter-move:** `git add` swept up the pre-existing unrelated
  changes -> signal: `git diff --staged` shows hunks in files this mission never touched (e.g. a
  Stripe/Clerk-related change inside `app-src/index.html`) -> counter-move:
  `git restore --staged <file>`, re-commit only the CWV-fix diff.
- **Fork trigger:** if the findings doc (Move 2) or fix diff touched a version-relevant file
  (CHANGELOG.md-worthy), note that a version bump is a *separate* operator decision, not automatic
  — do not bump EDITION or tag a release from this mission; this pass touches no legal content.
- **RECON NEEDED:** none.
- **Abort condition:** none — this is the landing move. If blocked by a pre-commit hook failure,
  stop and report the failure; do not `--no-verify`.
- **Verification run:** `git log -1` shows the new commit with the expected file list; the
  operator's own re-check (a live spot PSI run, only after THEY push and deploy) is the final
  confirmation this survives the real pipeline — not this mission's job to run.

---

## Model-routing table

| Move | Model | Why |
|---|---|---|
| 1 — run PSI, save output | **Haiku** | Mechanical: hit a tool, save its output. No judgment calls. |
| 2 — triage & scope-tag findings | **Sonnet** | Maps generic PSI findings onto Amparo's actual architecture (fixable vs. structural vs. out-of-scope) — a real judgment call each time. |
| 3 — branch/worktree | **Haiku** | Pure mechanical git command. |
| 4a — zero-risk preconnect | **Haiku** | Additive, inert-if-wrong, no judgment. |
| 4b — markup/loading fixes | **Sonnet** | Main coding work; must reason about layout coupling, above/below-fold status, and CSP compatibility. |
| 5 — dead-code cleanup | **Haiku** | Mechanical grep-confirm-then-delete. |
| 6 — re-measure, isolate regressions | **Sonnet** | Judgment: which fix caused a regression, revert-and-retest loop. |
| 7 — land the commit | **Sonnet** | A sweep-in mistake here (unrelated files) is costly and easy to make carelessly. |
| Anything that forks toward `/app`'s content-extraction pipeline or root's `sw.js` cache-name logic | **Escalate to Opus — do not let Sonnet freelance** | Two proven historical bug classes in this exact repo (the `amparo-`-prefix cache collision, the extraction-invariant break that shipped robotic TTS instead of recorded audio for months). This mission shouldn't reach either, but if a fork leads there, escalate rather than improvise near a known landmine. |
| The `/app`-promotion signal, if Move 1's fork trigger fires | **No model — flag to Michael** | HANDOFF issue #10 is an explicit standing human decision, not an execution task. |

## Blindspots (beyond the invariants already folded into the moves above)

- **PSI/Lighthouse noise:** lab scores vary run-to-run from network jitter and machine load. A
  single before/after sample can show a false "improvement." Move 6 already mandates a 3-run
  average — this is the patch, not just a warning, because a red-team attack on this exact point
  landed (see below).
- **CSP tension:** the live CSP already permits `'unsafe-inline'`. A common CWV tactic — inlining
  critical CSS or a bootstrap script — would technically work under this CSP as shipped, but moves
  the codebase further from this operator's own nonce-based-CSP preference. Nothing in this mission
  needs that tactic; flagging so a future mission doesn't reach for it without noticing the tension.
- **Mobile weighting:** the real user profile (checking this during or right before a traffic stop,
  often on a phone, possibly rattled) argues for weighting mobile CWV numbers above what a generic
  PSI triage defaults to. Baked into Move 1/2's instructions, restated here so it isn't lost.
- **The funnel drop may not be a performance problem at all.** 72 landed -> 4 picked a state is a
  drop at the *first* screen. If Move 1 shows that screen already scoring well, that's a strong
  signal the real funnel problem lives elsewhere (per HANDOFF's own UX audit) — say so plainly in
  the findings doc rather than continuing to chase marginal perf gains past the point they can
  explain the funnel.
- **Copy scope-creep:** a thin meta description or a "short H1" finding can tempt a fix that
  rewrites user-facing copy. For this product, any user-facing string needs the same EN/ES parity
  and (if shared with `/app`) extraction-pipeline sync as any other string. Move 2's RECON NEEDED
  step exists specifically to catch this before Move 4 touches anything copy-adjacent.
- **Third-party scanner privacy tension**, restated from the brief: crawling the public site with an
  external SEO tool is not the same privacy question as user data leaving the device, but it is a
  conscious choice this mission should name if it ever adopts one (it doesn't, currently — PSI
  itself is Google's own public tool, not a third-party data-out concern in the same sense).

## Value-maximization verdict

**Do Moves 1-2 now. Gate Moves 3-7 on what Move 1 actually shows — do not commit to the full pass
up front.**

Reasoning: no PSI data has ever existed for this project, so the size of the real opportunity is
currently unknown, and finding out is nearly free (Move 1-2 are recon, not engineering). Against
that: current traffic is genuinely small (72 landed/30 days), so the *absolute* value captured by a
perf fix this month is small, and the funnel's real bottleneck is unproven to be performance at all.
Full investment in Moves 3-7 is justified if Move 1 shows something dramatic (e.g. LCP > 4s on
mobile) — otherwise, the confirmed-safe, near-zero-risk items (4a, 5) are worth shipping regardless
of how dramatic the numbers are, since they cost almost nothing, but the riskier judgment-heavy
work (4b, 6) should scale to what the data actually shows, not run on the assumption that CWV is
this project's next priority. CWV also feeds two channels already live in this project (Facebook ad
Quality Score, per wargame 32; organic/RSS discoverability, per LEDGER's A2/A4) — so this is not
wasted motion even at current traffic, just not the highest-leverage item on the board by default.

## Self-grade against SUCCESS.md

| # | Point | Status |
|---|---|---|
| 1 | Every move states its expected observation | Pass — all 7 moves (4 split into 4a/4b) |
| 2 | Most-likely failure + cause + counter-move | Pass — every move, several with 2 failure modes |
| 3 | Every fork has a trigger | Pass — no judgment calls left open |
| 4 | Unsettled assumptions marked RECON NEEDED with the exact check | Pass — 4 instances, each with a concrete check |
| 5 | Abort conditions exist | Pass — every move states one (several "none" where genuinely inapplicable) |
| 6 | Verification spelled out | Pass — every move, including the 3-run-average requirement |
| 7 | Survived a red-team pass | Pass — see below |
| 8 | Executable blind | Pass, with the same caveat pattern as wargame 32: `git push`/deploy is HUMAN CONFIRM by design, not a gap in the plan |

## Red-team pass

| Attack | Outcome | Patch |
|---|---|---|
| "Skip PSI, go straight to the obvious fixes — you already found missing image attributes and zero preconnects by grep, why wait on a tool to confirm what you can already see?" | **Partly landed** | Split Move 4 into 4a (zero-risk, starts immediately, doesn't wait on Move 1/2) and 4b (PSI-prioritized, riskier, waits for triage). Move 1/2 stay mandatory regardless — "obviously missing" isn't the same as "impactful," and there's no baseline to prove improvement or catch a regression without them. |
| "The executor will just re-add `async` to the GSAP script since it looks like a natural fix." | Failed | Recon already confirmed GSAP has `async` + SRI. Move 4a explicitly says verify via string search, don't re-add. No patch needed — the plan already had this right. |
| "PSI/Lighthouse numbers are noisy enough that the executor could 'prove' an improvement that's actually run-to-run variance and claim a false win." | **Landed** | Move 6's verification run now requires a 3-run average per surface per device profile, not a single sample — written into the move itself, not left as a blindspot-only warning. |
| "Nothing stops the executor from sweeping the four already-uncommitted, unrelated files into this mission's commit." | **Landed** | Move 3's abort condition and Move 7's counter-move both now explicitly name the four files and require checking `git status`/`git diff --staged` before committing. |
| "A single `git worktree add` might not actually isolate from those four uncommitted files if they're not yet committed to the branch point." | **Landed** | Move 3's abort condition now explains the difference (worktree checks out from the last commit, so uncommitted changes are simply absent there; a plain branch on the same tree will still show them) and tells the executor to confirm which situation applies before Move 4. |
