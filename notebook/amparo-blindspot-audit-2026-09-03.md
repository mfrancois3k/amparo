# Amparo blind-spot audit — 2026-09-03

Read-only audit against HEAD `1a46f8d` (2026-09-02) plus the working tree as read between 06:05 and 06:25 EDT. A parallel session was editing the worktree during the audit (124 modified paths by the end: `arena/index.html` font paths, `.github/workflows/law-watch.yml` regenerate step, the 111 generated pages, `CHANGELOG.md`, `tools/build-jurisdictions.mjs`). Findings say "HEAD" or "worktree" where it matters. Live checks are `curl` against `https://www.amparohq.com` on 2026-09-03. Line numbers are worktree at time of reading.

Excluded by instruction: "no attorney has reviewed the content". Correction to the briefing: the homepage (`new/index.html`) loads no PostHog at HEAD or in the worktree (`grep -c posthog` = 0 both); `pack.html` is the surface that does (`pack.html:1249`).

Severity: CRITICAL / HIGH / MEDIUM / LOW. Effort: S (< 1 h), M (half day), L (days).

---

## 1. Broken promises, silent failures, dead paths

**F1 — HIGH — Internal working documents and backend source are publicly served.**
Evidence (live, 200 OK): `/research/RESEARCH-STATUS.md` (line 19: "**Zero states are shippable.**", line 23 cites *Upsolve v. James* as gating the content), `/research/state-matrix.md` (122 KB), `/SESSION-HANDOFF.md` (line 65 discusses *FTC v. DoNotPay*), `/CHANGELOG.md` (125 KB), `/DEPLOYMENT.md`, `/app-src/convex/http.ts` (full Stripe/Convex backend source, served as `video/mp2t`), `/app-src/.env.production`, `/app-src/package.json`, `/.mcp.json` (local machine paths `D:/npm-global`, `C:/Python311`), `/.claude/launch.json`, `/.agents/skills/.../SKILL.md`, `/docs/engine/PLAN.md`, `/growth/answer-bank.json`, `/content/facebook/2026-08-20.json`, `/scrollcraft/builds/amparo-home-cutlist/parts/nav.html`, `/tools/law-watch.mjs`. `.vercelignore` excludes only `notebook/ tasks/ wargames/ LEDGER.md SUCCESS.md`; its own comment says the goal is to keep "unresolved legal-exposure notes" off the deploy. Tracked-but-not-site weight: `scrollcraft/` 72.8 MB (30 files), `og/` 13.7 MB, `research/` 2.3 MB, `app-src/` 1.3 MB, `.claude/`+`.agents/` 1,382 files. `.env.local` files are correctly absent (404).
Fix: extend `.vercelignore` to `research/ app-src/ tools/ docs/ growth/ content/ scrollcraft/ .claude/ .agents/ .design-handoff/ .focus-group/ *.md .mcp.json skills-lock.json`; keep `scroll-intro/` and `new/`. — S

**F2 — HIGH — `/rehearse` has no officer voice in production; the failure is swallowed.**
`arena/index.html:1443` builds `new Audio('audio/'+key+'.mp3')` (relative). Under the `/rehearse` rewrite (`vercel.json`) that resolves to `/audio/<key>.mp3`, which is the pack's directory (2 files) not `arena/audio/` (204 files, zero overlap: `comm -12` = 0). Live: `/audio/1065n0j.mp3` 404, `/arena/audio/1065n0j.mp3` 200. `a.onerror` and `a.play().catch` both discard the error (lines 1446-1447). The fine print at `arena/index.html:642` promises "Officer lines are pre-recorded audio served with this site", the homepage's primary CTA is `/rehearse` (`new/index.html:368,384,899,969`), and the printed Armor card back points buyers at `amparohq.com/rehearse` (`app-src/convex/lib/armorCard.ts:97`). At HEAD the same bug hits all 27 `url("fonts/…")` declarations (live `/fonts/f0.woff2` 404); the worktree edit in flight fixes the fonts only, not line 1443.
Fix: `new Audio('/arena/audio/'+…)`; add the rewrite path to `tools/test-arena-deeplink.mjs` as a relative-URL lint. — S

**F3 — HIGH — The daily Facebook post workflow has been failing since the `index.html` → `pack.html` rename.**
`gh run list --workflow daily-post.yml`: run 33669639330 (2026-09-02) `failure`; its log line 164: `Error: ENOENT: no such file or directory, open '/home/runner/work/amparo/amparo/index.html'`. Root cause: `tools/news-post.mjs:320`, `tools/daily-post.mjs:95`, `tools/answer-bank.mjs:165,197`, `tools/render-kyr-card.mjs:224` still read `ROOT/index.html`; only `tools/extract-app-content.mjs:48` and `tools/build-pages.mjs:64` were moved to `pack.html`. `node tools/daily-post.mjs --selftest` reproduces the ENOENT locally. `answer-bank.mjs` runs Monday under `continue-on-error: true` (`weekly-discovery.yml:58`), so that break will be invisible. Whether anyone received a failure notification: UNVERIFIED.
Fix: one `SRC = pack.html` constant shared by the five tools (or a `tools/lib/source.mjs`), and add `node tools/daily-post.mjs --selftest` to a CI job that runs on push. — S

**F4 — HIGH — `pack.html` records session replay while the same file's analytics header says replay never leaves the device.**
`pack.html:1229-1234`: "What never leaves: autocapture, session recording, and any name/contact/photo/document". `pack.html:3259-3268` `srReplayGuard()` calls `posthog.startSessionRecording()` on steps 0-1. The user-facing privacy text `ab_privacy` (`pack.html:1698`) says "We count anonymous events … never what you typed" and does not mention replay; `pilotBanner` (`pack.html:1482,1620`) says "Everything stays on this phone". A hostile reviewer with view-source needs 30 seconds to put these two comments side by side.
Fix: either delete `startSessionRecording` (autocapture is already off; step 0-1 funnel is answerable from `capture_pageview`), or rewrite the header comment and `ab_privacy` to disclose replay on the first two screens with masking. — S

**F5 — HIGH — The Arena's "no server, no analytics" claim is contradicted by its own error reporting and redeem call.**
`arena/index.html:700`: "No account, no server, no analytics, no cookies." `arena/index.html:642,797`: "the Arena itself has no account and uploads nothing." Line 1481-1482 registers `error`/`unhandledrejection` listeners that inject `/sentry.js` and ship the error queue to `o4509837098221568.ingest.us.sentry.io` (`tools/sentry-entry.js:18`); line 1910 POSTs to `stoic-falcon-22.convex.site/redeem` when returning from Stripe. The Sentry scrubbing (`sentry-entry.js:80-124`) is real, but "uploads nothing" is not the same claim as "uploads scrubbed crash reports when something breaks".
Fix: change the copy to what is true ("no analytics; a crash report with no personal data is sent only if the page breaks; the pay path talks to our server"). — S

**F6 — HIGH — Physical Armor is sold as a "laminated glovebox card"; the fulfilment code orders a Lob 4x6 postcard with the wrong artwork.**
`app-src/convex/lib/products.ts:37` names the Stripe line item "laminated glovebox card + Master Script"; `arena/index.html:811,816` repeats "A laminated glovebox card mailed to you". `lib/providers.ts:37-45` POSTs `size: '4x6'` to `api.lob.com/v1/postcards` (postcard stock, not laminated). `fulfillment.ts:75` passes `armorCardHtml` (a 3.5x2 in face, `armorCard.ts:34`) as the postcard `front`/`back`; the postcard-safe renderer `armorPostcardHtml` (`armorCard.ts:121`, 6.25x4.25 in with the 2.5 in address zone) is called only from tests (`grep armorPostcardHtml` → `armorCard.test.mts` only). Gated today by `PAYMENTS_LIVE=false` (`arena/index.html:1784`), but `tools/test-fulfilment.mjs` passes 29/29 without noticing either mismatch.
Fix: route Lob through `armorPostcardHtml`, and change the product name/copy to "printed 4x6 card" or pick a laminated SKU (Gelato) before flipping payments. — M

**F7 — MEDIUM — Silent failure on the money path: any Stripe error during redeem becomes "no such session" and the buyer sees nothing.**
`stripe.ts:144-146` catches every error from `sessions.retrieve` (network, rate limit, bad key) and returns `404 'no such session'`. `arena/index.html:1913` maps any non-2xx to `null` and `clean()`s the URL with no message. The comment at 1917-1920 says "never fail silently" for `held`; every other failure fails silently.
Fix: in the arena, on `!j` show the `heldPaid`-style alert with the receipt-email instruction; in `verifySession`, distinguish `StripeInvalidRequestError` (404) from everything else (503). — S

**F8 — MEDIUM — Dead payment paths that read like live ones.**
`stripe.ts:33 createCheckout` (signed-in checkout, `success_url /app/?checkout=success`) is never called: the app's only Convex calls are `api.packs.get/save/remove` (`grep -o 'api\.[a-z]+\.[a-z]+' app-src/src`). `purchases.ts:7 mine` is never called. `checkout=success` has zero readers in `app-src/src`. `stripe.ts:69-70` promises "a later sign-in can claim the session id" — no claim function exists (`grep -rn claim app-src/convex` → nothing). Guest purchases are recorded with `userId: 'guest'` (`stripe.ts:95`) and are unreachable by `purchases.mine` forever.
Fix: delete `createCheckout` and `purchases.mine` or wire them; delete the "claim" comment until a claim mutation exists. — S

**F9 — MEDIUM — `/aid` page comment says "NOT LIVE"; it is live, linked from the homepage and in the sitemap.**
`new/aid.html:10`; `sitemap.xml` lists `/aid`; `new/index.html:899,970` link it. The same comment says data is "lifted verbatim from index.html … via states-data.js" — `new/states-data.js` is a hand-copied snapshot (last commit `3824652`, 2026-09-01) with no generator or check; today `STATE_LEGAL_AID`, `BASE_LIFELINES`, `US_STATE_NAMES` are byte-identical to `pack.html` (scratch comparison), so no drift yet.
Fix: generate `states-data.js` from `pack.html` inside `tools/build-pages.mjs` (it already extracts those literals) and delete the comment. — S

**F10 — MEDIUM — The generated pages' "last checked" footer lags `law-status.json` by design; `--check` can never pass; `feed.xml` churns every rebuild.**
At HEAD the 111 generated pages print "Cited legal sources last checked 2026-09-01" while `law-status.json.lastChecked` is `2026-09-02` (scratch rebuild diff, `rights/tx/index.html:56`). The cron (`law-watch.yml`) committed the JSON daily without running `build-pages.mjs`. `tools/build-pages.mjs:268,298,423` set every feed entry's `pubDate` to `lastChecked` and `lastBuildDate` to today, so every entry republishes on every rebuild and `--check` is non-deterministic across days. The worktree edit in flight adds a regenerate step to the workflow; it does not address the feed dates.
Fix: read the date at page-load from `/law-status.json` (pack.html already does, `pack.html:3948`) instead of baking it into 111 files, or stop embedding a moving date in static pages; give feed entries a real content date. — M

**F11 — MEDIUM — Both drift checks report every artifact stale on this machine, so nobody can trust them.**
`node tools/build-pages.mjs --check` → 111 stale; `node tools/build-jurisdictions.mjs --check` → 5 stale. Cause: `git config core.autocrlf = true`, index LF / worktree CRLF (`git ls-files --eol`: `i/lf w/crlf`), and both checks use strict string equality (`build-pages.mjs:484`, `build-jurisdictions.mjs:180-182`). A scratch rebuild diffed CR-insensitively shows the jurisdiction artifacts are current and the pages differ only by the date in F10. The `npm test` case "committed artifacts are current" passes because it normalises; the CLI does not.
Fix: normalise `\r\n` → `\n` on both sides before comparing in both `--check` paths (2 lines); add a `.gitattributes` with `* text=auto eol=lf` for generated dirs. — S

**F12 — MEDIUM — The Georgia statute source has been flagged "changed" for 20 days with four open review issues and no re-baseline.**
`law-status.json` `needsReview: [GA §40-5-29]`; first present in commit `d3a0f12` (2026-08-14). `gh issue list --label legal-review`: #1 (08-14), #2 (08-16), #3 (08-20), #4 (09-02), all OPEN. Every pack visitor has seen `lawchk_flag` ("A source statute changed on {d} and is under review", `pack.html:1717`) since mid-August. The issue body still instructs "update `STATES` in `index.html`" (`law-watch.yml:79`), a file that no longer exists.
Fix: read GA §40-5-29 on FindLaw, `node tools/law-watch.mjs --write`, commit, close #1-#4; fix the issue-body path. — S

**F13 — LOW — Homepage "Amparo for Organizations" button is a dead link.**
`new/index.html:962` `href="https://www.amparohq.com/orgs"`; live `/orgs` → 404.
Fix: point at the arena's orgs modal or the `mailto:`; or ship `/orgs`. — S

**F14 — LOW — Root `package.json` describes `/api` serverless functions that do not exist and pins an unused `stripe` dependency.**
`package.json:3` "Dependencies for Vercel serverless functions under /api"; `ls api` → no such directory; nothing at root imports `stripe`. `app-src/vite.config.ts:12-14` warns a root `package.json` risks tripping Vercel framework detection.
Fix: drop `dependencies`, keep `scripts`. — S

---

## 2. Offline and the moment of need

Trace of `sw.js` (root, scope `/`, registered only from `pack.html:4248` — `grep -rl serviceWorker.register --include=*.html` → `pack.html` only) and `app/sw.js` (Workbox, scope `/app/`).

| Route | Second visit, no network | Why |
|---|---|---|
| `/pack` | HTML only if it was the **last** same-origin navigation; audio clips only if already played; `gsap` (cdnjs), `scroll-intro/*`, `us-paths.js` never | F15, F16 |
| `/` | Never works: no SW registration on the page; CSS/JS/map/media never cached | F16 |
| `/aid` | Never: no SW registration; `states-data.js` never cached → empty directory lists | F16 |
| `/rehearse`, `/arena/` | Never: `sw.js:62` returns early for `/arena`, no arena SW exists, `/data/hud.json` network-only (`arena/index.html:2147` comment assumes a SW that is not there) | known |
| `/app/` | Yes: 24-entry Workbox precache + `NavigationRoute` (`app/sw.js`); audio cache-first at runtime | — |

**F15 — HIGH — One online visit to any other page overwrites the pack's offline copy.**
`sw.js:75-81`: every successful same-origin `navigate` is stored under the single key `CORE` (`'./'` = `/`); offline, every navigation is answered from that one key (`sw.js:80`). Visit `/pack` (cached), then `/` or `/aid` or `/rights/tx/` online → `CORE` now holds that page; open `/pack` offline → you get the homepage shell with no CSS (`/scroll-intro/scrollcraft.css`), no engine, no map, because line 97's fallback never `put`s anything. The `/app` and `/arena` guards (`sw.js:56,62`) exist precisely because of this, but `/pack`, `/aid` and the 111 generated pages have no guard. The homepage's own line 453 promises "Loads once, then works with no signal".
Fix: cache navigations under their own URL (`c.put(e.request, clone)`, fall back to `caches.match(e.request)` then `CORE`), and precache `pack.html`'s three external deps. — S

**F16 — HIGH — The "Saved on this device — works without internet" chip is shown on the first visit while the cache holds the homepage.**
`sw.js:21-26` precaches `'./'` at install; under the `vercel.json` rewrite `/` is `new/index.html`, so the precached shell is the homepage. `pack.html:4248-4253` waits for `ready`, does `caches.match('./')`, finds that hit, and shows `offline_ready` ("✈️ Saved on this device — works without internet", `pack.html:1662`). The navigation that loaded `/pack` was not under SW control, so `/pack` itself is not cached until the second online visit.
Fix: precache `/pack` explicitly (`c.add('/pack')`) and have the chip check `caches.match('/pack')`. — S

**F17 — MEDIUM — Installed PWA opens to the marketing intro, not the pack.**
`manifest.webmanifest`: `start_url: "/"`, `id: "/"`; only `pack.html:38` links the manifest (the homepage has no `<link rel=manifest>`). Installing from `/pack` therefore produces an icon that launches the 6.4 MB cinematic homepage (`du -sk new/assets` = 6444 KB), on a page that does not work offline (F15).
Fix: `start_url: "/pack"` in the root manifest. — S

**F18 — MEDIUM — `/aid` is the page for "the worst day of their year" and is the least offline-capable surface.**
`new/aid.html:19-20` states the intent; it depends on `/new/states-data.js` (35 KB) for every list and hotline, is never precached, and has no SW registration. Offline it renders headings with empty lists.
Fix: inline `states-data.js` into `aid.html` (it already inlines everything else) and add `/aid` to the SW precache. — S

---

## 3. Security and abuse

**F19 — MEDIUM — `/checkout` and `/redeem` are unauthenticated, CORS `*`, and unthrottled; each call is a paid Convex action plus a Stripe API call.**
`http.ts:49-53` CORS `*`; `http.ts:61-98` creates real Checkout Sessions for any `product` (server-priced, so no price tampering); `http.ts:113-135` `/redeem` calls `sessions.retrieve` per request. `grep -rni ratelimit app-src/convex` → nothing. The comment at `http.ts:103-105` argues "nothing is written"; the cost is Convex action invocations and Stripe rate limit (100 req/s live) shared with the webhook. Today `STRIPE_SECRET_KEY` is unset in prod (arena preview mode), so `/checkout` answers 503.
Fix: `@convex-dev/rate-limiter` (token bucket per IP from `request.headers.get('x-forwarded-for')`) on both routes before the key is set; restrict `Access-Control-Allow-Origin` to `https://www.amparohq.com`. — S

**F20 — LOW — `/checkout` returns raw exception messages to the client.**
`http.ts:84-95`: `msg = e.message` is JSON-encoded into the 500 body. Stripe SDK messages can include request ids and masked key prefixes.
Fix: return a fixed string for the 500 branch. — S

**F21 — MEDIUM — Production `/app` ships a Clerk development-instance key.**
`app/assets/SavePack-DQ9FHZQy.js` contains `pk_test_ZGl2aW5lLXN3aW5lLTE4LmNsZXJrLmFjY291bnRzLmRldiQ` → base64 `divine-swine-18.clerk.accounts.dev$`; `vercel.json` CSP and `app-src/index.html:35` whitelist that dev domain. Flagged in the 2026-08-19 and 2026-08-27 audits as open; still open. Clerk dev instances are user-capped and not intended for production traffic (limits: UNVERIFIED for this account).
Fix: create the production Clerk instance, set `VITE_CLERK_PUBLISHABLE_KEY` in `app-src/.env.production`, update both CSPs, rebuild. — M

**F22 — MEDIUM — Document photos sit in `localStorage.sr_docs` as base64 with no lock, and "wipe" leaves other keys behind.**
`pack.html:3089` stores the licence/registration photos as data-URLs; `/app` reads the same key (`app-src/src/services/storage.ts:179-187`). Anyone who picks up the phone and opens `/pack` sees them. The pack's wipe (`docsClear` 3100, `clearSave` 3247) removes `sr_docs`/`sr_save` only; `amparo_ft` (PostHog first-touch attribution, `pack.html:1342`), `amparo_lang`/`amparo_state` (`new/aid.html:236,241`), `amparo_ent` (`arena/index.html:1804,1811`) and `app_*` keys survive. The Arena's wipe (`arena/index.html:2100`) removes `amparoArena` and `amparoGuidedFlow` only while `arena/index.html:703` promises it "erases everything the Practice Arena stored on this device" — the paid-entitlement flag `amparo_ent` stays.
Fix: one `wipeAll()` that enumerates every key the three surfaces write (a shared list), and a plain sentence on the docs screen that the photos live unencrypted on this phone until wiped. — S

**F23 — LOW — CSP allows a second Convex deployment that nothing in the build uses.**
`vercel.json` `connect-src` lists `grandiose-armadillo-240.convex.cloud/.site`; the shipped bundle references only `stoic-falcon-22` (`app-src/.env.production`; the `happy-otter-123` string in the bundle is the Convex SDK's example URL). `script-src 'unsafe-inline'` is required by the inline-script architecture and is accepted, not a finding.
Fix: drop the unused host. — S

**F24 — LOW — Secrets: none found in tracked files.**
`git grep` for `sk_live_|sk_test_|whsec_|pk_live_|AKIA|ghp_|xox[bp]-|EAA…` over tracked files: only the public PostHog project key (`pack.html:1249`) and the Clerk dev publishable key (F21). `.env.local` and `app-src/.env.local` are gitignored and 404 live. Sentry DSN in `tools/sentry-entry.js:18` is public by design.

**F25 — UNVERIFIED — `Cross-Origin-Opener-Policy: same-origin` (`vercel.json`) severs `window.opener`; if the Clerk instance has popup OAuth providers enabled, sign-in popups in `/app` will not complete.** Not testable without a Clerk dashboard login.

---

## 4. Ops

**F26 — HIGH — A physical order that goes `dead` tells no one and is excluded from the only retry tool.**
`lib/queue.ts:51-60`: `dead` after a 4xx from the printer, a missing shipping address (`lib/dispatch.ts:55-57`), or 8 failed attempts. `orders.ts:44-51 listOpen` returns `queued` + `failed` only; `fulfillment.ts:96-102 retryOpen` therefore never re-dispatches `dead`. No email, no Sentry, no GitHub issue, no `console.log` (`fulfillment.ts:24` "Nothing in this file logs" is deliberate). The buyer has paid (purchase row committed, `lib/commit.ts:44-47`) and the only place the row exists is the Convex dashboard's `orders` table, which nobody is paged to open.
Fix: schedule a daily `internal.orders.deadCount` cron (`convex/crons.ts`) that posts to the existing Sentry project (`captureMessage`) or Resend when `dead > 0`; add `dead` to `listOpen` behind a flag. — S

**F27 — MEDIUM — No refund or dispute path; a refunded order still ships and its entitlement never revokes.**
The webhook handles `checkout.session.completed` only (`stripe.ts:166`; `grep -rni refund app-src/convex` → two comments). A `charge.refunded` or `charge.dispute.created` before dispatch leaves the `orders` row `queued` and Lob prints it; the arena's `amparo_ent` flag is local and permanent.
Fix: handle `charge.refunded` → patch matching order to `dead` with `lastError: 'refunded'`; document "refund = Stripe dashboard + cancel Lob job by `providerOrderId`" in `DEPLOYMENT.md`. — M

**F28 — HIGH — Law-watch covers 4 of 230 cited sections, and nothing in the repo can generate the other 226.**
`research/law-watch.json` has 4 sources; `data/hud.json` carries 230 distinct `cite` values (node count). Source URLs exist nowhere machine-readable: `research/state-matrix.md` 0 URLs, `research/archive/` 0, `research/statute-text/` (51 files) 0, `research/reference|briefs|case-law|inbox|tools` 0, `data/jurisdictions.json` 0, `data/hud.json` 0. The matrix cells carry `VERIFIED §15-5-30 -- …` (cite + summary), never the page that was read. A generated watchlist therefore needs (a) a cite→URL resolver per publisher (public.law for the states it covers, FindLaw/Justia elsewhere, each with its runner-IP behaviour noted in `law-watch.json._comment`), (b) an `anchor` per section, (c) a baseline run — and the current checker fetches serially with a 2.5 s delay (`law-watch.mjs:45`), so 230 sources ≈ 10+ minutes per run.
Fix: add a `url` column (or `source:` line per cell) to the matrix during the next verification pass, extend `parse.mjs` to emit it into `jurisdictions.json`, and have `law-watch.mjs` read the watchlist from there. — L

**F29 — MEDIUM — The human half of the law-watch loop is not running (see F12).** Four unanswered issues in 20 days means the daily job is producing a badge, not a review.

---

## 5. Delivery

**F30 — HIGH — No CI job runs any test; the five workflows are cron/social jobs on Node 20, and the tests need Node ≥ 22.6.**
`.github/workflows/*`: `daily-post`, `fb-cleanup-tests`, `fb-diagnose`, `law-watch`, `weekly-discovery` — none runs `npm test`, `tools/test-fulfilment.mjs`, `tools/test-arena-deeplink.mjs`, `tools/build-pages.mjs --check` or `build-jurisdictions.mjs --check`. All pin `node-version: '20'`; `package.json` `test` runs `node --test …*.test.mts`, which requires type stripping (Node 22.6+ flag, 23.6+ default). Locally on Node 24.14.1: `npm test` 71/71 pass; `test-fulfilment` 29/29; `test-arena-deeplink` 16/16; `sw-routing-check` 12/12; `app-storage-check` 14; `practice-engine-check` 24 — none of it gates a push.
Fix: one `ci.yml` on `push`/`pull_request`, Node 24, running the six commands above plus the two `--check`s (after F11). — S

**F31 — MEDIUM — `app-src` cannot be built by its own scripts.**
`app-src/package.json` `build` = `npm run verify:content && tsc -b && vite build`; `node ../tools/extract-app-content.mjs --verify` exits with "could not locate in index.html: FINAL_SCENARIOS_ENABLED, DOOR_MODULE_ENABLED, … PRX_CRISIS" (23 literals removed from the page in `eb82570`, 2026-08-28). `check` chains the same step. The committed `/app` was produced by calling `vite build` directly.
Drift result: a scratch `npx vite build --outDir <tmp>` produces identical filenames and identical bytes after CR normalisation for all 23 assets, `sw.js` and `index.html` → **no drift between `app-src/src` and `/app` at HEAD**. The 4 "differing" files were CRLF in the worktree (`git ls-files --eol app/assets/index-D-jia7wA.js` → `i/lf w/crlf`).
Fix: trim `extract-app-content.mjs`'s required-literal list to what `pack.html` still defines, or drop `verify:content` from `build` and keep it in `check`. — S

**F32 — MEDIUM — Arena test coverage is two static-regex scripts, not wired into `npm test`.**
`package.json` `test` globs `*.test.mts` only; `tools/test-arena-deeplink.mjs` (16 regex assertions over the page source) and `tools/test-fulfilment.mjs` (29, same style) are run by hand. Nothing exercises a drill, the redeem flow, the HUD panel, or the `/rehearse` path (which is how F2 shipped). No Playwright/agent-browser journey exists for any surface (`.claude/launch.json` only serves `new/` on 4599).
Fix: one Playwright smoke per route (`/`, `/pack`, `/rehearse`, `/aid`, `/app/`) asserting no console errors, no 404s in the network log, and one audio element reaching `canplay` on `/rehearse`. — M

**F33 — LOW — `law-watch.yml:79` and `daily-post.yml:40` still instruct edits to `index.html`.** — S (covered by F3/F12 fixes)

---

## 6. Performance

Measured with `wc -c`, `gzip -c | wc -c`, `du -k`, and live `curl` headers.

**F34 — MEDIUM — Homepage critical path: 92 KB HTML (30 KB gz, 60 KB of it inline JS), one render-blocking stylesheet and two parser-blocking scripts.**
`new/index.html:35` `<link rel=stylesheet href=/scroll-intro/scrollcraft.css>` in `<head>` (20 KB / 6.8 KB gz); `:397` `<script src=/us-paths.js>` (42 KB / 13.4 KB gz) and `:989` `<script src=/scroll-intro/scrollcraft.js>` (60 KB / 18.2 KB gz), both without `defer`/`async`; the page body is `<main id="app"></main>` (`:395`) rendered entirely by the 60 KB inline script, so nothing paints until all of it has parsed. No `preload`/`preconnect` hints (`grep` → none).
Fix: `defer` both external scripts and move the map data behind a dynamic import when the map act is warm; inline the ~3 KB of scrollcraft CSS the first viewport needs. — M

**F35 — MEDIUM — Homepage media: 6.4 MB under `new/assets`; the 30-frame hands sequence (1.2 MB) is fetched in one burst.**
`du -k new/assets` = 6,444 KB: `motion/kb-card.mp4` 1,968 KB, `kb-mirror.mp4` 1,800 KB (mobile variants 476/408 KB, chosen by `data-sc-src-mobile`, `preload="none"` — good), `motion/hands/f-01…30.webp` ≈ 40 KB each. `scroll-intro/scrollcraft.js:815-818` calls `loadSeq` for all 30 frames as soon as the act is within 3 viewports, so a reader who scrolls at all pays 1.2 MB before the sequence is on screen. On prepaid data (the audience the copy names at `new/index.html:453`) that is the cost of one scroll.
Fix: load frames 1, 15, 30 first and the rest lazily in scroll order; or replace the sequence with the existing `-m.mp4` on mobile. — M

**F36 — MEDIUM — Cache headers: content-hashed `/app/assets/*` and all arena/homepage media are served `max-age=0, must-revalidate`; only `/audio` and `/img` are immutable.**
Live: `/app/assets/index-D-jia7wA.js` (282 KB) `cache=public, max-age=0, must-revalidate` — 23 revalidations per `/app` load; `/new/assets/motion/kb-card-m.mp4` (486 KB) `max-age=0`; `/arena/audio/*.mp3` (204 clips) and `/arena/fonts/*.woff2` `max-age=0`; `vercel.json`'s immutable rule covers `/(audio|img)/(.*)` only. Conversely the root `/audio/…` 404 page is served `immutable, max-age=31536000` (F2's broken URL gets a year-long negative cache in the browser).
Fix: add `/app/assets/(.*)`, `/arena/(audio|fonts)/(.*)`, `/new/assets/(.*)` to the immutable rule (all are hashed or rename-on-change). — S

**F37 — LOW — `/data/hud.json` is 192 KB (165 KB minified) for a panel that needs one state's ≈ 3.2 KB.**
`arena/index.html:2150` fetches the whole file on every visit after the 1 h `max-age`; 51 states × avg 3,178 bytes. Fine on wifi, 192 KB per hour on prepaid data for a panel most visitors never open.
Fix: emit `data/hud/XX.json` per state from `build-jurisdictions.mjs` and fetch one. — S

**F38 — LOW — Single-file surfaces: `pack.html` 441 KB / 151 KB gz (4,435 lines), `arena/index.html` 241 KB / 75 KB gz (2,207 lines), `og.png` 597 KB with `max-age=0`.** No blocking issue; the parse cost is the price of the no-build-step architecture. — (no fix proposed)

---

## Top 5 by leverage

1. **F1** — Extend `.vercelignore` (S). Removes "Zero states are shippable", the DoNotPay note, the Convex source and 90 MB of build artefacts from the public site in one commit.
2. **F2 + F36** — `/arena/audio/` absolute path and an immutable rule for arena/app assets (S). Restores the product's core feature on its primary URL and stops the browser caching the 404.
3. **F15 + F16 + F17** — Per-URL navigation caching, precache `/pack`, `start_url: /pack` (S). Makes the one offline promise the site depends on true instead of last-page-wins.
4. **F3 + F30 + F11** — Shared source constant for the five tools, CR-normalised `--check`, one CI job on Node 24 (S). Turns a daily silent failure into a red check before it ships again.
5. **F26 + F4** — Dead-order alert cron and delete session replay (S). The two findings most likely to end up in someone else's screenshot: a paid order nobody knows about, and a "never leaves the device" comment above `startSessionRecording()`.
