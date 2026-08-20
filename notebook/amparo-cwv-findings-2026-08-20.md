# Amparo Core Web Vitals — Findings & Triage (Move 2)

**Date:** 2026-08-20 · **Wargame:** 33 · **Move:** 2 (triage) on real Move 1 data
**Measurement:** Lighthouse 12 CLI, local static server, 3 runs averaged per combination

## Provenance — read this before trusting any number below

The live site could not be measured. Two independent causes, both verified, both written up in
`amparo-cwv-move-1-blocked-2026-08-20.md`: Cloudflare WARP on this workstation blocks Vercel's
entire IP range, and the live site returns **403 to automated traffic** (confirmed from a separate
network — `robots.txt` is 403 too).

So Move 1 used the fallback the wargame itself authorizes (Move 6: *"fall back to local Lighthouse
CLI against a local static server"*). Amparo's root is a static file tree, so `main` and
`cwv-fix-pass` were each served locally and measured.

**What that distorts, and what it does not:**

| Metric class | Local validity | Why |
|---|---|---|
| TBT, main-thread work, script eval/parse, CLS | **Valid** | CPU- and layout-bound. Localhost changes nothing. |
| LCP, FCP, Speed Index | **Optimistic floor** | Zero network latency. Real mobile will be *worse*, not better. |
| "Enable text compression" | **Invalid — artifact** | Python's `http.server` sends no `Content-Encoding`. Vercel compresses automatically and nothing in `vercel.json` disables it; HANDOFF records the real figures: **545.5 kB raw / 180.9 kB gz / 145.7 kB br**. |
| "Efficient cache policy" / document latency | **Mostly artifact** | Local server sends no cache headers; `vercel.json` already sets `max-age=31536000, immutable` for `/img` and `/audio`. |

## Baseline — root `/`, mobile, 3-run average

| Metric | Measured | Target | Verdict |
|---|---|---|---|
| Performance score | **48** | — | — |
| LCP | **6,034 ms** | <2,500 ms | ❌ 2.4× over — *and this is the zero-latency floor* |
| TBT | **923 ms** | <200 ms | ❌ 4.6× over |
| FCP | **4,087 ms** | <1,500 ms | ❌ 2.7× over |
| CLS | **0** | <0.1 | ✅ perfect |
| TTI | **6,034 ms** | — | — |
| SEO score | **100** | — | ✅ |
| Best practices | **100** | — | ✅ |

Per-run: perf 46/50/47 · LCP 6143/5909/6050 · TBT 1046/813/911 · FCP 4000/4014/4246 · CLS 0/0/0.
**TBT ranged 813–1,265 ms across runs (±35%)** — this is exactly why the wargame's red-team pass
mandated 3-run averages. Any single-sample before/after claim here would be noise.

## What the real data overturned

The wargame's static (grep-based) recon guessed images were the target. **They are not.** Three
assumptions died on contact with data:

1. **CLS is already 0.** The "no `width`/`height` on `<img>`" finding captures *nothing* — there is
   no layout shift to fix. This was Move 4b's main justification.
2. **The LCP element is not an image.** It is `body > div#splash > div.stag` — a 341×17px **text
   div** in the splash screen. `fetchpriority` / eager-loading on images cannot move LCP.
3. **The `<h1>` concern was a non-issue**, exactly as the wargame's RECON NEEDED flag anticipated.
   SEO scores **100**. Drop it — do not "fix" what was never flagged.

**Where the time actually goes** (main-thread breakdown, ms):

| Category | Time |
|---|---|
| Script evaluation | 1,507 |
| Other | 1,123 |
| **Style & layout** | **1,093** |
| Rendering | 312 |
| Script parse & compile | 298 |
| Parse HTML & CSS | 117 |

And the third-party split — **not** what was assumed:

| Entity | Main-thread blocking | Transfer |
|---|---|---|
| **`ph.amparohq.com` (PostHog)** | **573 ms** | 94.7 kB |
| Cloudflare CDN (GSAP) | 36 ms | 26.3 kB |

PostHog is ~62% of all third-party blocking and roughly **half of total TBT**. GSAP — the script the
wargame spent the most words on — costs 36 ms and is already correctly `async` + SRI.

## Findings, scope-tagged

| # | Finding | Real? | Scope tag | Reasoning |
|---|---|---|---|---|
| 1 | PostHog blocks main thread 573 ms | **Yes** | **in-scope** | Script *loading* change, not content. Biggest single addressable win. Highest priority. |
| 2 | Style & layout 1,093 ms; 89 kB unused CSS | Yes | **structural-ceiling** | Needs CSS splitting/purging — a build step this repo doesn't have. |
| 3 | Script evaluation 1,507 ms; 174 kB unused JS | Yes | **structural-ceiling** | The 675 kB single-file monolith. No bundler, no tree-shaking. Ties to the `/app`-promotion decision (HANDOFF #10). |
| 4 | Unminified JS (110 kB) / CSS (21 kB) | Yes | **structural-ceiling** | Requires a build step. Hand-editing minified source is not viable. |
| 5 | Legacy JS to modern browsers (7.9 kB) | Yes | structural-ceiling | Same — transpile target is a build concern. |
| 6 | Missing preconnect (61 ms) | Yes | **in-scope — DONE** | Fixed in Move 4a (`13338c1`), both hosts. Validated against real data: PostHog *is* loaded, so the `ph.amparohq.com` preconnect is well-aimed. |
| 7 | "Enable text compression" — 446 kB / 2,100 ms | **No — artifact** | **not a finding** | Local-server artifact. Vercel serves brotli (145.7 kB). Largest reported "opportunity" and it is false. Would have been a wasted fix pass. |
| 8 | Cache policy / document latency | Mostly artifact | **not a finding** | `vercel.json` already sets immutable long-cache for `/img` + `/audio`. |
| 9 | Image `loading`/`fetchpriority`/dimensions | Yes, but inert | **descope** | CLS already 0; LCP element is text. Captures nothing measurable. |
| 10 | Multiple `<h1>` in source | **No** | **not a finding** | SEO 100. RECON NEEDED flag resolved: non-issue. |
| 11 | Live site 403s automated traffic | **Yes** | **out-of-scope — escalate** | Dashboard-side, not repo. Contradicts `robots.txt`'s stated "crawling is the point". See the Move 1 report. |
| 12 | `cowork-artifact-meta` dead block | Yes | **in-scope — DONE** | Removed in Move 4a/5 commit (`13338c1`). |

## Revised recommendation

The wargame's gate was: *"Full investment in Moves 3-7 is justified if Move 1 shows something
dramatic (e.g. LCP > 4s on mobile)."* **LCP is 6.0 s at a zero-latency floor. The gate is met.**

But the *shape* of the work changes completely from what the wargame drafted:

- **Do:** address PostHog's 573 ms. It is the single largest in-scope lever, roughly half of TBT,
  and it is a loading-strategy change — no content, no copy, no statute text, no extraction
  pipeline. Options to evaluate (needs its own recon, not a blind edit): defer init until after
  first paint / idle, or load the SDK on interaction. **Constraint: the analytics contract in
  `index.html` is deliberate and privacy-load-bearing — five settings are explicitly marked
  load-bearing in comments. Any change must preserve event capture, not silently drop it.**
- **Drop:** Move 4b as drafted. Image attributes capture nothing here. Keeping it would have been
  busywork that measured as noise.
- **Escalate:** the 403, and the structural CSS/JS ceilings — the latter are genuinely the biggest
  numbers on the board (1,093 ms + 1,507 ms) but every one of them requires a build step this
  project has deliberately not adopted. That is the `/app`-promotion decision, not this mission.

**Honest framing on business value, unchanged from the wargame:** at 72 landed/30 days, the absolute
gain this month is small, and the 94.5% funnel drop is still not shown to be performance-caused.
The 403 finding is plausibly worth more than the entire perf pass, because it touches discoverability
rather than the experience of visitors who already arrived.

---

# Move 6 — Before/after (3-run averages, all 12 runs)

| Group | n | Perf | LCP | TBT | CLS | FCP |
|---|---|---|---|---|---|---|
| baseline · mobile | 3 | 48 | 6,034 | 923 | 0 | 4,087 |
| **fixed · mobile** | 3 | 45 | 6,056 | 1,214 | 0 | 4,023 |
| baseline · desktop | 3 | 95 | 1,245 | 107 | 0 | 750 |
| **fixed · desktop** | 3 | 94 | 1,262 | 121 | 0.0001 | 752 |

## Verdict: FAIL by Move 6's own criterion — logged, not spun

Move 6's pass condition is *"at least one target metric measurably improved, zero regressions."*
Nothing here is measurable in either direction. **TBT across all 12 runs ranged 81–1,529 ms.** Every
delta above sits inside that noise band. Per Move 6's abort condition, this is logged as
**"attempted, no clean win found this pass."**

**Why this is an instrument problem, not a bad fix.** Move 4a added `preconnect`, whose entire
benefit is saved DNS + TCP + TLS setup time to a cross-origin host. The measurement ran against
`127.0.0.1`, which has none of those costs — Lighthouse itself modeled the saving at just **61 ms**,
already below the noise floor before a single run happened. Measuring a network optimization in a
zero-network environment cannot show a win. On a real 4G handset, preconnect to two cross-origin
hosts is typically worth 100–300 ms.

**Decision:** keep commit `13338c1`. It is additive, inert-if-wrong, and now *better* justified than
when written — the data proved PostHog is genuinely loaded and costs 573 ms, so the
`ph.amparohq.com` preconnect is aimed at a real cost. But **no performance win is claimed**, and none
should be reported to anyone. Re-measure against the live site once the 403 and WARP are resolved;
that is the only environment where this fix can be honestly evaluated.

**Move 7:** the commit already exists and is correctly scoped (one file, `index.html`, attribute and
dead-code changes only). It is **not pushed** — that remains the human-confirm gate. Nothing further
to land this pass.
