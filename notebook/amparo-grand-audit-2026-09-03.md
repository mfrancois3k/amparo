# Amparo grand audit — 2026-09-03

Scope: every served surface after the v2.28.0 engine refactor. Method: Lighthouse
(mobile, production), one browser pass at phone and dark-mode viewports, and
three parallel audits written to their own files:
`amparo-blindspot-audit-2026-09-03.md` (38 findings),
`amparo-content-audit-2026-09-03.md` (disclosure, SEO, Spanish, 41-row punch
list), and `amparo-focus-group-26-grand-audit.md` (10 personas; see its own
file, it ran last). This file is the synthesis: what was fixed the same day,
what is open, and what only the owner can decide.

## Lighthouse, mobile, production (before the fixes)

| Surface | A11y | Best practices | SEO | Failing audits |
|---|---|---|---|---|
| `/` | 87 | 100 | 100 | `#deal` prohibited ARIA, `#dealTrigger` no name, kinetic-text contrast (mid-animation artifact) |
| `/rehearse` | 96 | 96 | 100 | 37 contrast items (gold labels, fine print), console 404s (fonts under the rewrite) |
| `/aid` | 90 | 100 | 100 | footer contrast, heading order |
| `/app` | 100 | 100 | 63 | noindex by design |

## Fixed today (all in v2.28.0)

Exposure and correctness
- Internal docs, backend source and agent config were served on the domain
  (`/research/RESEARCH-STATUS.md`, `/app-src/convex/http.ts`, `/.mcp.json`,
  `/.claude/launch.json`, 72 MB of `scrollcraft/builds`). `.vercelignore`
  extended. No secret was exposed (`.mcp.json` carries an env placeholder).
- Arena under `/rehearse`: fonts and officer audio 404'd (relative paths). Root-absolute now.
- Root service worker: every navigation overwrote the pack's offline copy; only `/pack` is stored now.
- `/checkout` and `/redeem`: per-client rate limit (10/h, 60/h); error bodies no longer echo Stripe messages.
- Fulfilment: Lob receives 4x6 postcard documents (the bare 3.5x2 face would have printed small on a blank card with no address zone); dead orders logged and listed (`orders.listDead`).
- Daily post bot, answer bank, card selftest read the renamed root page again (`pack.html`).
- Generated JSON pinned to LF; both `--check` tools line-ending agnostic (they false-alarmed on Windows).
- CI: `.github/workflows/tests.yml` runs the suites, guards and generator check on every push; the law-watch bot regenerates the pages that print its date.

Legal posture and content
- HUD compiler: no state-specific sentence without a citation. 28 lines that rested on findings-level groupings with an unverified cell now print universal or "not yet verified" wording (AR/MN/NV firearm, CO/MS unmarked, RI sign, MA/UT firearm, CA/DC/IA firearm).
- One two-tier sentence for the 48 unverified states on `/rights/*`, with a link into the Arena's state panel; `/about` and `/how-we-verify` describe the real four-tier standard (Verified / Checked / Likely / Unverified) and the four-source watch list; price truth on `/`, `/about` (preview until attorney review); "24 scenarios" → 21 levels.
- The law-watch review flag renders on the state page it concerns: **GA §40-5-29 has been "changed / needs review" since 2026-09-02** with GitHub issues #1–#4 open. A person has to re-read it.
- Spanish: usted throughout the HUD (the Arena, aid page and cards already were); Spanish state names in titles and notices; "Me detuvieron ahora" (reads as "they arrested me") → "Me está parando la policía"; "tomar" → "alcanzar"; footage retention units translated.
- Pack: the analytics comment now states the truth (masked two-screen replay exists; see the decision below).
- Accessibility: contrast on gold labels and fine print, dark-mode ladder, aid heading order, homepage ARIA; state panel collapsed by default on phones (it buried the drills 3 screens down).
- SEO: `/pack` in the sitemap, OG tags on `/` and `/rehearse`, canonical on `/rehearse`, cache headers on hashed assets.

## Open, ranked by leverage

1. **Law-watch coverage (L).** 4 sources watched; 230 sections cited on HUD lines. The matrix carries no source URLs, so a generated watchlist needs a new column. Until then `/how-we-verify` says so plainly.
2. **Rights-page expansion (M, decision).** 24 states (48 pages) are noindexed as thin. `data/hud.json` has cited, provisional lines for all of them. Rendering them (VERIFIED-only filter, notice above the block, new badge in `render-og.mjs`) would make every state page indexable for its highest-intent query. Tradeoff: crawlable exposure of paraphrased, unwatched, un-lawyered claims the Arena already ships behind a notice. Content audit §2 has the plan.
3. **Offline for the Arena (M).** The root SW skips `/arena` by design; the Arena has no SW; `/data/hud.json` is fetched live. At the roadside with no signal the state panel is empty. Either an Arena-scoped worker or inline the bank the way `/app` does.
4. **Dead-order handling (M).** Logged and listed now; nobody is emailed and there is no refund path. A Resend hook on `dead` and a written refund rule before payments go live.
5. **Attorney pipeline (M, the real blocker).** `review.attorney` is false on 51 states and nothing on the site invites a licensed attorney to claim one. A `/review` page (per-state matrix export, sign-off form) turns Bar (b) from a wall into a queue.
6. **Spanish native read (S).** The 41-row punch list in the content audit; the usted conversion is done, the idioms are not.
7. **Homepage analytics (decision).** The new homepage loads no PostHog; the pack does. The top of the funnel is dark. Adding the same anonymous event counts is consistent with the pack's stance; leaving it dark is consistent with the Arena's.
8. **Clerk dev-instance key in production `/app` (S, owner).** Open since 08-19.
9. **`verify:content` (S).** Broken since eb82570; a task chip exists to repoint the extractor.
10. **Perf (S).** Homepage: render-blocking stylesheet, two parser-blocking scripts, 6.4 MB media with a 1.2 MB 30-frame burst.

## Decisions only the owner can make

- **Session replay on the pack.** A masked replay of the first two screens exists and ships to PostHog. Either disclose it in the privacy copy or remove `srReplayGuard()`. The comment now tells the truth; the copy does not mention it.
- **"Laminated".** The ladder, the price line and the product name promise a laminated card. Lob prints 4x6 cardstock, not laminated. Keep the word only with a laminating provider (Gelato offers lamination on some products) or change the copy before `FULFILLMENT_PROVIDER` is set.
- **Rights-page expansion** (item 2 above).
- **Homepage analytics** (item 7 above).

## Method notes

Every finding in the three reports was verified against source or a command
output; unverified items are marked in each report. Nothing legal was authored:
every HUD sentence traces to a matrix cell or a cited finding, and the compiler
now refuses to print a state claim without one.
