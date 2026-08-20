WARGAME ORDER. You are not executing this mission, you are wargaming it. A cheaper executor
(Sonnet, mostly — see the model-routing table you must produce) runs the brief below later.
Your job is the route it will follow.

Recon first, read-only: root `index.html` (current size, `<img>`/`<script>`/`<h1>` patterns,
the `cowork-artifact-meta` block at the top), `app/index.html` (built /app output), `vercel.json`
(the live CSP — note it already ships `'unsafe-inline'`, not nonce-based), `HANDOFF.md`'s bundle-size
table and the `/app` content-extraction invariant, this user's global `web/performance.md` and
`web/security.md` rules, `git status` (four files already sit modified, uncommitted, unrelated to
this mission — do not touch them), and the `/watch-bulk` digest at
`C:\Users\mfran\AppData\Local\Temp\claude\C--Users-mfran-Ai-Foundations-Amparo\059a50e7-00f7-490e-8e25-19d9d70355ea\scratchpad\watch-bulk-amparo-workflow-videos\digest.md`
(also staged at `C:\Users\mfran\Obsidian\raw\watched\batch-amparo-workflow-videos-2026-08-20\`) —
the video that inspired this mission was never actually watched (YouTube blocked the download
twice); only its creator-written description and the operator's own notes are real signal.

Then fight the mission on paper, move by move, and write it to `wargames/33-core-web-vitals-fix-pass.md`:

- every move states its expected observation, exactly what you should see if it worked
- every move carries its most likely failure, the cause it signals, and the counter-move
- every fork gets a trigger, if you observe X, take route B
- assumptions recon could not settle get marked RECON NEEDED with the exact check that settles it
- end with abort conditions, and the verification runs the executor must perform with what pass looks like for each

Also required (beyond the standard move anatomy), because the operator asked for these explicitly:
- an explicit **model-routing table** — which Claude model runs which move, and why
- an explicit **blindspots** section — real risks in this specific repo, not generic CWV advice
- a **value-maximization verdict** — is this worth doing now, given current traffic, or not

Write it so the executor can run the brief end to end without asking a single question.

=== THE MISSION BRIEF (the executor's orders, not yours) ===

Run a PageSpeed-Insights-driven Core Web Vitals / technical-SEO fix pass on Amparo
(https://www.amparohq.com/) — both the live root `index.html` and the `/app` React port —
using Claude Code, in the spirit of the workflow described in "Claude Code SEO: Make ANY Site
PERFECT (IN 10 MINS)" (Income Stream Surfers): gather PageSpeed Insights data first, hand
concrete tool-flagged issues to Claude Code (not an open-ended "improve SEO" prompt), fix in an
isolated branch, verify locally, iterate until targets are hit.

PRODUCT REALITY (do not work past it):
- Amparo is a free, bilingual (EN/ES), no-account, static PWA. Root `index.html` is a single
  hand-written file (675,145 bytes / ~659 KiB as of 2026-08-20 — grown from HANDOFF's recorded
  545.5 KB at v2.21.2 a week earlier; no bundler, no build step). `/app` is a separate Vite/React
  build with its own stricter CSP and its own bundle budget, already measured close to healthy.
- The core privacy promise ("your name, contacts and documents never leave your phone") is the
  product's only real moat. Nothing in this mission may add a network call that sends user data
  off-device. A technical-SEO scanner (e.g. HarborSEO, the paid tool the source video's creator
  uses) crawling the PUBLIC site's markup is a different privacy question than user data leaving —
  still make that choice consciously and say so, don't adopt a third-party scanner silently.
- CSP is already live in `vercel.json` and already permits `'unsafe-inline'` for script-src and
  style-src (not nonce-based, despite this operator's own security rules preferring nonces) plus a
  specific external-script allowlist (cdnjs.cloudflare.com for GSAP, PostHog, Stripe, Clerk,
  Convex). Any loading-strategy change must work inside this CSP as shipped — do not casually add
  more inline `<script>`/`<style>` to chase a perf win; that runs opposite to the security rule.
- No PageSpeed/Lighthouse data exists anywhere in this project's visible history. The size of the
  real opportunity is currently unknown — that is itself the first finding worth having.
- The 30-day funnel (72 landed -> 4 picked a state -> 3 printed, a 94.5% drop) has never been
  diagnosed as performance-caused — autocapture is off by design, there is no rage-click or
  element-level data. Treat a CWV fix as a reasonable bet, not a proven cure for this funnel.

CONSTRAINTS:
- Real users are checking this on a phone, often during or right before a traffic stop — weight
  mobile Core Web Vitals higher than desktop, more than a generic PSI triage would default to.
- Scope is markup, asset-loading, and CSP-compatible loading strategy ONLY. Do not touch the
  practice-engine (`PRX_*`), statute-rendering paths, or any user-facing copy/H1/meta text without
  checking it against hard rule 1 (never generate statute text or legal citations with a model) and
  the EN/ES + `/app` content-extraction invariant (`tools/extract-app-content.mjs`).
- Four files already sit modified and uncommitted from unrelated prior work: `app-src/index.html`,
  `app/index.html`, `arena/index.html`, `vercel.json`. Confirm with `git status` before Move 1.
  Do not stage, revert, or fold them into this mission's commit unless a move explicitly touches
  them for an in-scope CWV reason.
- Target numbers: this operator's own standing web-performance rule — LCP < 2.5s, INP < 200ms,
  CLS < 0.1, FCP < 1.5s, TBT < 200ms; landing-page JS budget < 150 KB gz, CSS < 30 KB gz.
- `git push` / triggering a real Vercel deploy is a HUMAN CONFIRM step, not autonomous. Commit
  locally, then stop and report — do not push without the operator's go-ahead.

DELIVERABLES the executor must produce:
1. Four PageSpeed Insights reports (root + /app, mobile + desktop) establishing the real baseline
   — the mission's first and cheapest deliverable, valuable even if nothing else ships.
2. A written findings/triage doc ranking every flagged issue by impact, tagged in-scope vs
   structural-ceiling vs out-of-scope, with the reasoning for each call.
3. An isolated branch or worktree containing only CWV-fix changes.
4. A before/after comparison (3-run average per side, not a single noisy sample) proving no
   regression on any of the five target metrics.
5. A local commit (not pushed) with a why-focused message, ready for the operator's review.
6. An explicit note on the `/app`-promotion signal if Move 1's data surfaces one (HANDOFF issue
   #10 stays a human decision — flag it, do not act on it).
