# Amparo CWV Findings — Pre-Baseline Triage
**Date:** 2026-08-20
**Status:** PARTIAL — static-recon only, NOT Move 2 proper

## Why this doc is partial

Wargame 33's real Move 2 extracts findings from Move 1's four PSI/Lighthouse reports.
Move 1 is blocked (`amparo-cwv-move-1-blocked-2026-08-20.md`) — no measurement tool can
currently reach amparohq.com. This doc scope-tags only the **static, grep-verified**
findings already in `wargames/33-core-web-vitals-fix-pass.md`'s recon section. It is not
a substitute for live data: severity/impact ranking is impossible without real LCP/INP/CLS
numbers, and PSI may surface issues invisible to static reading (render-blocking chains,
actual paint timing, real opportunity byte-savings). Re-triage once Move 1 unblocks.

## Scope-tagged findings

| Finding | Scope tag | Reason |
|---|---|---|
| Root `index.html` 675,145 bytes, no bundler/tree-shaking | **structural-ceiling** | Fixing requires a build-tooling change (bundler adoption) — out of this mission's markup/asset/loading scope. Blocked on the `/app`-promotion decision (HANDOFF #10) to fully resolve. |
| `<img>` tags carry no `loading=`/`fetchpriority=` attributes (static assets, e.g. `img/officer-${prxGender}.jpg`) | **in-scope** | Markup-only fix, no layout/behavior risk if applied correctly. This is Move 4b's primary target. |
| Runtime user-photo `<img>` tags (`data.lic_f` etc.) lack sizing | **out-of-scope** | Geometry unknowable ahead of render; "fixing" would require a document-capture behavior change, not a passive markup tweak. |
| Zero `rel="preconnect"`/`rel="preload"` anywhere, including for `cdnjs.cloudflare.com` (GSAP host) | **in-scope** | Move 4a already covers this — additive, zero-risk, doesn't need PSI confirmation to justify. |
| GSAP script already has `async` + SRI | **not a finding** | Confirmed correct at recon time. Do not touch. |
| `vercel.json` CSP ships `'unsafe-inline'`, not nonce-based | **out-of-scope** | Pre-existing, shipped, deliberate scope exclusion. Flagged as a standing tension with this operator's `web/security.md` preference, not actioned here. |
| `/app/index.html` (built output) already Vite-standard: module script defers natively, budget within HANDOFF's measured 91.5 KB gz | **structural-ceiling (informational)** | Likely already CWV-healthy. Real comparison needs Move 1's data — cannot confirm "healthy" without a number. This is exactly why Move 2 can't fully run yet. |
| `cowork-artifact-meta` inert JSON block (~230 bytes, pre-`<html>`) | **in-scope (trivial)** | Move 5's target — mechanical grep-confirm-delete, no PSI dependency. |
| 15× `<h1>` in source, 1 mounted at a time (client-rendered SPA) | **UNRESOLVED — RECON NEEDED per wargame text** | Cannot confirm whether this trips a PSI "missing/multiple h1" diagnostic without Move 1's actual Diagnostics output. Do not act on this until Move 1 runs — could easily be a non-issue. |

## What's actually unblocked right now (no PSI dependency)

- **Move 4a** (Haiku-tier, zero-risk preconnect) — safe to run immediately per the wargame's own red-team-patched instruction ("doesn't wait on Move 1/2"). Not yet executed this session.
- **Move 5** (Haiku-tier, dead-code cleanup) — safe to run immediately, self-contained grep-check.
- **Move 3** (Haiku-tier, branch/worktree) — safe to run immediately, no data dependency.

## What's genuinely blocked (cannot run honestly without fabricating data)

- **Move 4b** — "for each in-scope item from Move 2, apply the minimal markup fix" — the in-scope items above (image loading attributes) *could* technically be applied now since they don't strictly need PSI to identify (grep already found them), but Move 4b's own RECON NEEDED clause requires confirming above-the-fold status via live DevTools inspection before touching `loading=` attributes — applying `loading="lazy"` to an above-the-fold image makes LCP *worse*, and there's no baseline to catch that regression against. Applying this blind risks a silent regression with no way to detect it.
- **Move 6** — no baseline exists to compare against. A before/after table needs a *before*.
- **Move 7** — nothing to commit yet that Move 6 has verified as a net improvement.

## Recommendation

Run Moves 3, 4a, 5 now (all Haiku-tier, all zero-risk, all spec-approved to run without Move 1 data) to get free, safe value banked. Hold 4b/6/7 until Move 1 unblocks — per the wargame's own abort condition, forcing them without real numbers "defeats the entire point of this mission."
