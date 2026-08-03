# Amparo — Blind-Spot Audit

**Date:** 2026-08-03
**Scope:** `index.html` (418,100 B / 4,660 lines), `sw.js`, `vercel.json`, `manifest.webmanifest`, `audio/`, `img/`
**Build audited:** `EDITION="2026-C"`, commit `a60717f`
**Method:** static read + live instrumentation in Chrome DevTools against a local server (`python -m http.server 8777`), CPU 6× throttled, Slow 4G, 393×851 mobile viewport
**Constraint honored:** no source file was edited. Audit only.

Two things are deliberately absent because they are already tracked: attorney engagement and UPL. Nothing below is a legal-content claim.

Anything I could not prove is tagged **NOT VERIFIED**. Everything else has a `file:line` or a captured runtime value.

---

## 1. Architecture verdict — do NOT migrate to React/Next.js + Tailwind

**Recommendation: reject the rebuild. Keep the single file.** This is not a close call, and the numbers say why.

### What the current build actually costs

| Measurement | Value | How obtained |
|---|---|---|
| `index.html` raw | 418,100 B | `wc -c index.html` |
| gzip | 138,740 B | `gzip -c index.html \| wc -c` |
| brotli | 112,006 B | `brotli -c index.html \| wc -c` |
| Network requests to be fully interactive | **1** | DevTools network panel |
| FCP @ 6× CPU, Slow 4G, served from SW cache | 2,136 ms | `performance.getEntriesByType('paint')` |
| `domInteractive` @ same | 2,144 ms | navigation timing |
| `responseEnd` @ same | 916 ms | navigation timing |
| `loadEventEnd` @ same | 3,141 ms | navigation timing |
| Long tasks | 0 | `performance.getEntriesByType('longtask')` |
| CLS | 0.00 | DevTools trace |

The ~1.2 s between `responseEnd` (916 ms) and `domInteractive` (2,144 ms) is pure parse-and-execute of the inline script on a 6×-throttled CPU, with **zero bytes on the wire** (`transferSize: 0` — the service worker served it). That is the honest cost of the single-file design and it is the one number worth optimizing. It is also the number a React rebuild makes strictly worse, because a framework adds runtime on top of the same application logic rather than replacing it.

### What the rebuild would cost

- **Offline-first regresses.** Today's offline story is one cache entry: `caches.add('./')` (`sw.js:6,22`). A Next.js build produces a hashed chunk graph — `_next/static/chunks/*.js`, route manifests, a build ID — and every deploy renames all of them. The precache manifest must be regenerated and re-downloaded in full on each release. Prepaid users pay for a full re-download on every deploy instead of a single conditional `GET /` that usually 304s (`vercel.json:40-43` sets `max-age=0, must-revalidate` on HTML).
- **The privacy moat gets harder to prove, not easier.** The moat is currently auditable by a journalist in one `view-source`. There is exactly one place a reviewer must check to confirm nothing is uploaded. After a bundler, that verification requires trusting a build pipeline, a lockfile, and a transitive dependency tree. The claim survives only as long as someone believes the build. Today it survives on inspection.
- **Distribution breaks.** The file works from `file://` today — `location.protocol` guards at `index.html:1247`, `:3437`, `:4557` explicitly degrade analytics, law-status and the SW when not on http(s). A single HTML file can be sideloaded, emailed, USB-copied, or handed to a community org. A Next.js app cannot.
- **A build step adds a failure mode with no upside here.** There is currently no state where the app fails to build. `git push` is the deploy (`DEPLOYMENT.md`).
- **Tailwind buys nothing.** The print stylesheet (`index.html:742-824`) is a paged-media layout in physical inches. Tailwind has no vocabulary for `8.27in`, `page-break-after`, or `.pocket{height:1.42in}`. It would be `[8.27in]` arbitrary values all the way down — more characters, same CSS.

### Where the third-party proposal is right

It is right that 4,660 lines in one file is uncomfortable, and right that a 1.2 s parse on a low-end device is real. Both are fixable **without** a framework:

1. **Defer the practice engine.** Lines ~3475-4470 (practice deck, TTS, recorder, transcript comparison) are ~1,000 lines that no user needs until they open the drill. Moving that block into `<script type="module" src="practice.js" defer>` and precaching it in `sw.js` cuts first-parse work while keeping offline behavior and the one-file audit story for the shell.
2. **Cut the analytics payload** — see H3. That is 361 KB, larger than any parse win available.

Ship those two. The rebuild buys developer ergonomics and charges the user for them.

---

## 2. Voice / TTS assessment

### Current stack — verified

Three layers, in priority order:

1. **Pre-generated neural clips (primary).** `index.html:3847`
   `new Audio(\`audio/${useEs?'es':'en'}/${prxGender}/${d.id}.mp3\`)`
   222 files, **6.2 MB total** — `audio/en/m` 62 files/1.9 MB, `audio/en/f` 62/2.1 MB, `audio/es/m` 49/1.2 MB, `audio/es/f` 49/1.2 MB. Authoring-time TTS, committed to the repo. Runtime cost: $0, no vendor, no network call to anyone but the origin.
2. **Browser `speechSynthesis` (fallback).** `index.html:3788, 3856-3869`. Fires only from `a.onerror` / `a.play().catch()` (`:3851-3852`). `prxPickVoice()` (`:3793-3798`) ranks device voices rather than taking the first, which is the right call.
3. **Browser `SpeechRecognition` (transcript, optional).** `index.html:3878, 3972-3988`.

### Where audio and transcripts go

| Artifact | Destination | Evidence |
|---|---|---|
| Officer clip | Origin only, then SW cache-first | `sw.js:40,56-63` |
| User recording | `URL.createObjectURL(Blob)` — memory only, revoked on advance | `index.html:4006`, `prxDropLast()` `:3960` |
| Transcript | In-page string `prxHeard`, compared locally, never sent | `:3979-3984`, `prxCompareShow()` `:3892-3930` |
| Crisis disclosure | **Deliberately not captured** | `:3905-3910` |
| Keyword hit | `ph('sr_practice_keywords_hit',{level,state,lang})` — no text | `:3929` |

Two things worth stating plainly because they are done correctly:

- The **transcript** path uses `window.SpeechRecognition`, which on Chrome/Android sends audio to Google's speech service. This is **disclosed in-product**, in both languages, at `index.html:1523` and `:1828`: *"Voice is transcribed by your browser's speech service and may leave your device — optional; Amparo stores nothing."* That is the honest framing and it is already shipped.
- The crisis path suppresses the analytics event *because the event's existence is itself a disclosure* (`:3905-3910`). That is a genuinely thoughtful call and should not be regressed.

### Cost of adding a cloud TTS vendor (ElevenLabs / Voicebox-style)

| Promise | Damage |
|---|---|
| **Offline** | Fatal. Runtime cloud TTS requires a live request per line. The drill is exactly the feature someone runs sitting in a parked car on a dead prepaid plan. The existing `onerror → speechSynthesis` fallback would fire constantly, so the "new voices" would be the ones users least often hear. |
| **Privacy** | Fatal to the current form of the claim. Runtime TTS needs an API key. A key in the client is public; a key on a server means Amparo now operates a backend that receives a request every time someone rehearses. That is a server-side log of who is practicing what, which is precisely the artifact the no-server design exists to not have. It also requires `connect-src` to admit a third-party host (`vercel.json:9`), which is currently locked to self + PostHog. |
| **Prepaid data** | Bad. Streaming TTS is ~15-30 KB per line, re-downloaded per playback, uncached. The current clips are cached-forever after first play (`vercel.json:46-49` `immutable`, `sw.js:56-63`). |

### The option that breaks neither promise

**Use the cloud vendor at authoring time, not runtime — which is exactly what the project already does.** The comment at `index.html:3800-3802` describes the correct architecture; "new voices for new modules" means generating more MP3s with a better vendor and committing them, not calling an API from the device.

Concrete plan for a new module:
1. Generate lines with whatever vendor sounds best. Confirm the licence permits redistribution of generated audio as static files.
2. Encode at 32-48 kbps mono Opus (`.opus`, Android Chrome supports it) or keep MP3 for iOS Safari compatibility. Current clips average ~28 KB; Opus would roughly halve that.
3. Commit to `audio/{lang}/{gender}/{id}` — the existing path convention needs no code change.
4. Add the new ids to whatever precache decision comes out of M3.

**Tradeoff, stated honestly:** authoring-time generation means voices are fixed at build time. No per-user voice choice beyond the existing m/f toggle, no dynamic lines, no runtime-composed sentences. Every new line costs a deploy and repo weight (~28 KB/clip; a 20-line module across 2 languages × 2 genders is ~2.2 MB). That is the price of the two promises, and it is worth paying. If a module genuinely needs dynamic speech, `speechSynthesis` already covers it on-device for free — use that rather than reaching for a vendor.

---

## 3. Findings

### CRITICAL

#### C1 — A pack printed under an older EDITION is never flagged as stale

**Severity: critical. Verified.**

`packFreshness()` compares only a hardcoded calendar date to now:

```js
// index.html:2170-2176
function edReplaceDate(){ const [m,y]=ED_REPLACE.split('/').map(Number); return new Date(y,m-1,1); }
function packFreshness(){
  const diff=edReplaceDate()-new Date();
  return { stale:diff<=0, soon:diff>0&&diff<=45*day };
}
```

`ED_REPLACE` is `"07/2027"` (`:2157`). The saved-pack record stores **no edition at all**:

```js
// index.html:2915
localStorage.setItem('sr_save', JSON.stringify({state,name,ec,ecp,ec2,ecp2,att,email,skipped,lang,step,hasPrinted,printedAt,printFeedbackGiven,usageFeedbackGiven}));
```

So the stale banner (`:2645-2656`) cannot fire on an edition change. It fires in July 2027 and not before.

**Why this matters more than it looks.** The project's own comment at `:2152-2156` says 2026-C *corrected* immigration guidance — voluntary departure / stipulated removal named, a caveat added about silence lengthening a stop, a risk claim reworded. The whole edition-locked attorney model at `:2139-2145` exists on the premise that a content change invalidates prior sign-off. That premise is enforced for the attorney badge (`isReviewed()` compares `a.edition===EDITION`, `:2158`) and **not enforced for the user's printed pack**. A user who printed 2026-A has superseded guidance in their glovebox and an app that says nothing.

**Fix (~3 lines).**
```js
// persist(): add edition to the saved record
localStorage.setItem('sr_save', JSON.stringify({..., edition:EDITION}));
// restore(): capture it
savedEdition = s.edition || null;
// packFreshness(): treat an edition mismatch as stale
return { stale: diff<=0 || (hasPrinted && savedEdition && savedEdition!==EDITION), soon: ... };
```
Guard on `hasPrinted` so an in-progress pack isn't nagged, matching the existing intent at `:2642-2644`. `updateStalePack()` (`:3202`) already exists as the remediation path — this only needs to be able to reach it.

---

### HIGH

#### H1 — Every first-time visitor gets a full page reload, and every first visit double-counts `$pageview`

**Severity: high. Verified in-browser.**

```js
// index.html:4561-4564
let _swReloaded=false;
navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(_swReloaded) return; _swReloaded=true; location.reload();
});
```

The guard prevents a *loop*, which is what the comment at `:4558-4560` set out to do. It does not prevent the **first** reload. `controllerchange` fires whenever `navigator.serviceWorker.controller` changes — including the very first time a worker claims an uncontrolled page, which is exactly what `self.skipWaiting()` (`sw.js:26`) plus `self.clients.claim()` (`sw.js:34`) forces on install.

Confirmed live. Registering the worker on a page that had no controller:

```
{ hadControllerBefore: false,
  log: ["controllerchange fired; controller now=true"],
  controllerAfter: true }
```

So on a brand-new visitor's very first load, the app renders, the worker installs and claims, `controllerchange` fires, and the page reloads underneath them. Consequences, in order of who cares:

- **The user** sees the splash and entrance animation run twice. On a throttled device the second pass costs another ~1.2 s of parse (measured `responseEnd → domInteractive` gap) plus a conditional `GET /` against `max-age=0, must-revalidate` (`vercel.json:40-43`) — usually a 304, but not free on a prepaid connection with high latency.
- **The funnel lies.** `capture_pageview: true` (`:1266`) means `$pageview` fires on both passes. Every first-time visitor is counted as two. Since ~97% of the audience is stated to leave on the first two screens, this inflates precisely the population the funnel is built to measure, and it inflates *new* visitors specifically — returning visitors already have a controller and reload only on a genuine worker update. Any landing-page conversion rate computed from `$pageview` is therefore understated, and the size of the error moves with the new-vs-returning mix.
- The reload also resets `srReplayGuard()`'s `srReplayDead` and restarts any in-flight replay session.

**Fix (one line).** Only arm the reload when a *previous* controller existed — i.e. a real worker update, which is the case the comment describes wanting to handle:

```js
if (navigator.serviceWorker.controller) {          // ← add
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_swReloaded) return; _swReloaded = true; location.reload();
  });
}
```

Note this also means historical `$pageview` counts are not comparable to post-fix counts. Worth annotating in PostHog on the day it ships rather than reading the step change as a traffic drop.

#### H2 — Session replay records the state picker and is not disclosed to the user

**Severity: high. Verified.**

```js
// index.html:2971-2980
function srReplayGuard(n){
  if(n>=2){ if(!srReplayDead){ srReplayDead=true; posthog.stopSessionRecording(); } return; }
  if(!srReplayDead && posthog.startSessionRecording) posthog.startSessionRecording();
}
```

Runtime confirmation: `posthog.config.disable_session_recording === true` at init, `$recording_status: "disabled"` on load — replay is off until the user taps through to step 1, at which point `startSessionRecording()` runs.

The engineering here is careful — scoped to two screens, hard-killed at step 2, `maskAllInputs:true, maskTextInputs:true` pinned explicitly at `:1273`, with an honest comment at `:2966-2969` recording that the original "structurally un-recordable" argument expired when v2.5.0 added a search input.

**The gap is the copy, not the code.** The privacy section (`:1563` EN, `:1868` ES) says:

> "We count anonymous events (like how many packs get printed, and in which state) to prove the tool is used"

A user reading that has no way to know a **screen recording with pointer/touch movement** is being uploaded. Masked inputs do not make it an event count. For an audience that includes people worried about ICE, "we record your screen on two pages" is exactly the sentence a hostile reviewer will quote against the banner at `:1298`.

**Fix.** Either (a) add one clause to `ab_privacy` in both languages naming replay, its two-screen scope and the masking, or (b) delete `srReplayGuard()` entirely and rely on the `sr_step_viewed` funnel, which already measures the same drop-off. Given the stated 97% drop-off is on screens with almost no interaction, option (b) costs little and removes the exposure and the vendor weight together.

#### H3 — PostHog downloads 361 KB across 6 requests on every visit — 86% of the app's own weight

**Severity: high. Verified.**

Captured from `performance.getEntriesByType('resource')`:

| Request | Decoded bytes |
|---|---|
| `/static/array.js` | 237,247 |
| `/static/surveys.js?v=1.410.4` | **97,944** |
| `/static/dead-clicks-autocapture.js?v=1.410.4` | **17,887** |
| `/static/web-vitals.js?v=1.410.4` | 6,720 |
| `/array/{key}/config.js` | 1,296 |
| `POST /flags/?v=2&compression=base64` | 0 |
| **Total** | **361,094** |

Amparo's own payload is 418,100 B uncompressed / 138,740 B gzip. The analytics vendor is **larger than the gzipped app**. For a product whose architecture is justified paragraph by paragraph on prepaid-data users, this is the largest unexamined line item in the build.

Two of these do nothing:
- `dead-clicks-autocapture.js` (17.9 KB) — runtime shows `$dead_clicks_enabled_server_side: false`. Downloaded, never used.
- `surveys.js` (97.9 KB) — see H4.

**Fix.** Add to `posthog.init()` (`:1257-1275`):
```js
disable_surveys: true,           // drops surveys.js — 97.9 KB
capture_dead_clicks: false,      // drops dead-clicks-autocapture.js — 17.9 KB
capture_performance: false,      // drops web-vitals.js — 6.7 KB
```
That reclaims ~122 KB per visit with no loss of any event the project actually reads. The remaining `array.js` (237 KB) is the price of PostHog; if that is still too much for the audience, the 35 events in use are all simple counters and would fit a `navigator.sendBeacon` one-liner to a single endpoint.

#### H4 — PostHog Surveys is live: a modal can be pushed into the app with no deploy and no review

**Severity: high. Verified.**

Runtime: `posthog.config.disable_surveys === false`, and `/static/surveys.js` (97,944 B) loads on every visit.

This means anyone with access to the PostHog project can render an arbitrary modal, with arbitrary text and arbitrary input fields, on top of any screen in Amparo — including in the middle of the practice drill, or on the printed-pack screen — without touching the repo, without a deploy, and without any of the review this project applies to its own copy. The CSP does not help; the script is already same-origin via the `ph.amparohq.com` proxy (`vercel.json:9`).

For a product that tells users nothing arrives from outside and nothing they type leaves, a vendor-controlled input surface is the single most embarrassing thing on this list if a journalist finds it.

**Fix.** `disable_surveys: true` in `posthog.init()`. One line. It also happens to be the largest single byte win in H3.

#### H5 — Nothing catches a crash: the user sees nothing and the operator learns nothing

**Severity: high. Verified.**

- `window.onerror` → `false`
- `window.onunhandledrejection` → `false`
- `$exception_capture_enabled_server_side` → `false`

There are 58 `try{}` blocks in `index.html`, and the defensive work inside `restore()` is good — `s.state` is whitelisted against `STATES` (`:2936`) and `s.lang` is whitelisted (`:2946`), both with comments explaining exactly which failure they prevent. `step` is deliberately not restored from storage, only surfaced as a resume chip (`:2945`), which closes the obvious brick.

But the uncovered surface is `render()` itself, a large `innerHTML`-building function. If it throws for any reason, the splash has already been removed (`:1394-1398` fires on a timer, independent of render), so the user is left looking at a header, a banner, and an empty `#screen`. There is no message, no retry, and no way for someone on a phone to know that clearing site data would fix it.

And because exception capture is off at both ends, **a crash affecting some fraction of Android users would be completely invisible to the operator.** The project's whole feedback apparatus — `sr_stuck_opened`, `sr_stuck_feedback` (`:4539-4542`) — is a manual proxy for telemetry that could be automatic.

**Fix.** Two things, both small:
```js
// 1. A visible, actionable failure state
window.addEventListener('error', e => {
  const s = document.getElementById('screen');
  if (s && !s.children.length) s.innerHTML = '<div class="card">…something went wrong. '
    + '<button class="btn" onclick="localStorage.clear();location.reload()">Start over</button></div>';
});
// 2. Turn on PostHog exception capture (project settings, or capture_exceptions:true)
```
Bilingual copy for the failure state should go through the existing `T[]` table, not be hardcoded.

---

### MEDIUM

#### M1 — The printed pack is laid out at A4 width for a US-Letter audience, with no `@page` rule

**Severity: medium.**

Verified computed width of `.pp` in the live print DOM: **`793.92px` = 8.27in = 210 mm = A4.** (`index.html:749`)

Verified absent: any `CSSPageRule` anywhere in the document (`[...document.styleSheets]` scan returned `atPageFound: false`). There is no `@page { size: letter; margin: … }`.

US Letter is 8.5 in wide. Chrome's default print margin is ~0.4 in per side, leaving ~7.7 in printable. The layout is 0.57 in wider than that. Height is fine — `min-height:9.7in` against ~10.2 in printable.

**What actually happens on paper — NOT VERIFIED.** Chrome's print preview defaults to a fit-to-printable-width scale, so the most likely outcome is the whole pack shrinking to ~93%, taking `.pbox li{font-size:10px}` to ~9.3px effective and `.stq{font-size:9.3px}` (`:807`) to ~8.7px. That is a legibility question for a document meant to be read in a car at night, not a layout break. Confirming it requires printing to PDF at Letter with default margins on Chrome, Safari and Android Chrome. Worth doing before treating this as settled.

**Fix.** Add an explicit page rule and match the content box to it:
```css
@page { size: letter; margin: 0.4in; }
.pp { width: 7.7in; }   /* 8.5in − 2×0.4in */
```
The pack is 6 pages (verified: `document.querySelectorAll('#printRoot .pp').length === 6`), so a width change should be re-checked against page breaks on all six.

#### M2 — Background fills are dropped on paper; no `print-color-adjust` anywhere

**Severity: medium.** Verified absent via a full stylesheet scan (`colorAdjustFound: false`).

Chrome, Edge and Safari default to `print-color-adjust: economy`, which drops background colors unless the user ticks "Background graphics." Affected fills, from the live print DOM:

- `.place` → `rgb(253,246,227)` — the "where this page goes" strip (`:758`)
- `.pbox` / `.pbox.warn` → cream (`:774,777`)
- `.r-item .n` → `rgb(232,184,75)` gold numbered badges (`:797`)

**Honest calibration: this degrades gracefully.** The palette is cream-on-white, so the loss is small, and every one of these elements also carries a border (`.pbox.warn` is distinguished from `.pbox` by `border-color: var(--gold)` vs `var(--line)`, and borders do print). The gold badge loses its fill but keeps navy digits on white. This is a polish issue, not a correctness one — which is why it is medium and not high.

**Fix.** One rule inside the existing `@media print` block (`:744-748`):
```css
.pp, .pp * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
```

#### M3 — "Works without internet" is shown when only the 6-entry shell is cached

**Severity: medium. Verified.**

Live cache contents immediately after `navigator.serviceWorker.ready`:

```
amparo-v3: [ "/", "/manifest.webmanifest", "/img/icon-192.png",
             "/img/icon-512.png", "/img/apple-touch-icon.png",
             "/img/icon-maskable-512.png" ]
```

Six entries. The chip fires on exactly that condition (`index.html:4565-4568`) and reads *"✈️ Saved on this device — works without internet"* (`:1465` / `:1770`).

Not in that cache: all **222 audio clips (6.2 MB)**, and `img/officer-*.jpg` / `img/scene-*.jpg` at first paint. Verified by direct `caches.match`: `audio/en/m/c0.mp3 → NOT IN SW CACHE`.

The design is a per-asset cache-first fill (`sw.js:56-63`), so clips cache **one at a time, after each has played once**. Officer photos do land in the cache after the first render — I confirmed `img/officer-m.jpg → IN SW CACHE` once the practice screen had drawn.

So: install → go offline → open a drill level you have not reached before → no clip → `a.onerror` → `prxSpeakTTS()` (`:3851`). The app stays functional, with a downgraded voice. **The claim isn't false, it's over-broad**, and the audience it's over-broad for is the one that can least afford to discover it in a parked car.

**Fix — pick one, don't do both:**
- *Cheap:* soften the chip to name what is saved — "the app and your pack are saved; officer voices download as you practice."
- *Complete:* precache one gender/language set (~1.9 MB) on install, and add a visible "download all voices (6 MB)" control on Wi-Fi. Do **not** silently precache 6.2 MB on a prepaid connection.

#### M4 — `sw.js` never changes, so `install` never re-runs; an offline-only user is frozen with no version signal

**Severity: medium.**

`const C = 'amparo-v3'` (`sw.js:5`) is a static constant and the file is byte-identical across deploys. Browsers only reinstall a worker when `sw.js` changes byte-for-byte, so the `install` handler (`:18-27`) does not re-run on a new release. The cached shell is refreshed only by the navigate handler's `c.put(CORE, clone)` (`:48`), which requires the user to be online *and* to make a navigation.

The `activate` handler deletes every cache whose key `!== C` (`:31-34`), so if the cache name is ever bumped it will correctly purge — but since it never is, that code has never executed in production. Same for the network-first navigation strategy: it is correct, and it is doing the work, which is why this is medium rather than high.

The residual risk: a user who installs the PWA and then stays offline is pinned to the build from their last online navigation, indefinitely, with the only version indicator being the `EDITION` string printed on the pack (`:3211`). Combined with **C1**, that user gets no signal from either channel.

**Fix.** Fold the app version into the cache name and bump it with `EDITION` (`const C = 'amparo-2026-C'`), so that a content release actually reinstalls the worker and re-primes the shell. Fixing C1 covers the user-facing half.

#### M5 — Dead email endpoint: a Netlify function path on a Vercel deployment

**Severity: medium (currently latent).**

```js
// index.html:3467
const r=await fetch('/.netlify/functions/send-pack',{method:'POST', …
// body includes: email, name, state, stateName, lang, edition, url
```

The repo has **no** `netlify.toml`, no `netlify/`, no `functions/`, no `api/`. `DEPLOYMENT.md` confirms the site is on Vercel ("This repo IS connected to Vercel"; apex resolves to Vercel anycast). The path would 404.

It is currently gated off — `REVIEW.emailEnabled: false` (`:2138`), with a comment that already understands the problem. Credit where due. But two things keep it on the list:

1. **The flag is a live landmine.** Flipping `emailEnabled` to `true` ships a button that cannot succeed on this host, showing every user *"Couldn't send right now — try again in a minute"* (`:1585`) forever.
2. **The privacy copy already describes the feature as if it exists.** `ab_privacy` (`:1563`, `:1868`) tells users *"If you choose to email yourself a receipt, only your name, state and email address pass through our email service"* — describing a data flow that has no implementation. A reviewer reading the copy and then the code finds a described upload path with no visible endpoint. That reads worse than it is.

**Fix.** Either delete `sendPackEmail()` and the `ab_privacy` clause together, or — if the feature is wanted — retarget the path to `/api/send-pack` for Vercel and add the function. Do not flip the flag before the endpoint returns 200.

#### M6 — The privacy-critical defaults are inherited, not pinned

**Severity: medium.**

Runtime inspection of `posthog.config` shows `ip: false` — PostHog is told not to geo-enrich. That is the right setting and it is a real privacy win.

**It is not in `posthog.init()`.** The call at `:1257-1275` pins `autocapture`, `capture_pageview`, `disable_session_recording`, `session_recording.mask*` and `person_profiles`. `ip` comes from `defaults:'2026-05-30'`. The comment at `:1261-1264` shows the project already understands this exact hazard for the other five settings — the reasoning just wasn't extended to `ip`.

A future `defaults` bump, or a decision to drop the `defaults` key, silently re-enables IP geolocation on a product used by people who have concrete reasons to not want their city attached to "practiced the ICE checkpoint drill in Spanish."

Related, and worth knowing rather than fixing: every event carries a default property set that includes `$device_id` (a persistent UUID — captured value `019fc886-a09f-7305-abb0-9c163aa556a7`), `$raw_user_agent`, `$timezone`, `$screen_width/height`, `$viewport_*`, `$browser_language`, `$os_version`. `property_denylist` is `[]`. Individually mundane; together a stable per-device fingerprint joined to `sr_state_selected {state}` and `lang`. The `ab_privacy` phrase "never who you are" is defensible — none of it is PII — but it is the claim a hostile reviewer will push on.

**Fix.** Add `ip: false` explicitly to `posthog.init()` next to the other five. If the per-device linkage is unwanted, `property_denylist: ['$raw_user_agent','$screen_width','$screen_height','$viewport_width','$viewport_height','$timezone']` costs nothing the project reads.

---

### LOW

#### L1 — Deprecated PWA meta tag
Console warning captured live: *"`<meta name="apple-mobile-web-app-capable" content="yes">` is deprecated. Please include `<meta name="mobile-web-app-capable" content="yes">`."* Add the modern tag alongside the Apple one; keep both.

#### L2 — GSAP SRI hash has no CI check
`index.html:829-831` pins `sha384-HOvlOYPIs/…` with `crossorigin` + `referrerpolicy="no-referrer"` — correct, and the comment at `:826-828` states the risk accurately. The fallback is also correct: the script is `async`, and the boot poller gives up after 400 ms (`:1393`) so a blocked or stalled CDN can never white-screen the page. Verified working — with GSAP absent the CSS-keyframe splash carries the load and `@media print{[data-sr-fx]{display:none!important}}` (`:1131`) keeps effects off paper.

The residual gap is process, not code: if anyone bumps the GSAP version without regenerating the hash, every animation silently stops and nothing fails loudly. A one-line CI check comparing the pinned hash against the fetched file would close it. The daily `law-watch.yml` workflow is the natural home.

#### L3 — Spanish TTS fallback can read Spanish with an English voice
`index.html:3861-3865`: if `prxVoiceEs` is `null` (no Spanish voice installed), `u.voice` is set to `null` while `u.lang='es-US'`. Platform behavior with a null voice and a non-default lang is inconsistent; some devices will read Spanish text with an English voice. Guard: if `es && !prxVoiceEs`, skip TTS rather than mispronounce — silence is better than a mangled rights script.

#### L4 — ~1.6 s forced-reflow window during boot
DevTools trace flagged a `ForcedReflow` insight spanning ~1.64 s of the startup window under 6× CPU throttle. The likely source is `SRMotion`'s `rect()` / `getBoundingClientRect()` calls interleaved with DOM writes (`index.html:844` and the FLIP-style measurement in `SR.screenIn`). No long tasks were recorded and CLS is 0.00, so user-visible impact is low. Worth a look only if the practice-engine deferral (§1) doesn't already move the needle.

---

### Verified healthy — state these if challenged

These were tested and hold up. Recording them so they don't get re-litigated.

| Area | Result | Evidence |
|---|---|---|
| **XSS in the printed pack** | Clean | Set `data.name = 'O\'Brien "Tester" <script>'`, ran `buildPrint()`. `#printRoot` contains the literal text `<script>`; `document.querySelector('#printRoot script')` → `null`. `esc()` at `:2364`. |
| **Raw interpolation into HTML** | One instance, and it is safe | Only `${data.email}` at `:3470`, assigned via `textContent`, not `innerHTML`. |
| **Corrupt localStorage** | Handled | `s.state` whitelisted against `STATES` (`:2936`); `s.lang` whitelisted (`:2946`); `step` deliberately not restored (`:2945`). |
| **CDN failure** | Handled | SRI pinned, `async`, 400 ms poll with CSS-keyframe fallback (`:1388-1403`). |
| **Android double `beforeprint`** | Handled | 4 s debounce with a comment citing the observed 686 ms production gap (`:3450-3456`). |
| **Stale recording attaching to the wrong card** | Handled | `prxTok` invalidation (`:3958-3960`, checked at `:4002`). |
| **Crisis disclosure** | Not transmitted | No analytics call, with the reasoning recorded (`:3905-3910`). Normalizer deduplicated across typed and spoken paths (`:3886-3891`). |
| **Overlay a11y** | Real, not just ARIA | Escape, focus trap, focus restore, `inert` on the background (`:4594-4657`). |
| **Demo mode analytics** | Suppressed | `ph()` short-circuits on `isDemoActive()` (`:1278`); one deliberate exception at `:3148`, documented. |
| **CLS** | 0.00 | DevTools trace, 6× CPU / Slow 4G. |
| **Long tasks** | 0 | `performance.getEntriesByType('longtask')`. |

---

## 4. Suggested order

Cheapest-first, weighted by exposure:

1. **H4** — `disable_surveys:true`. One line. Closes a remote-content injection surface and reclaims 98 KB.
2. **H3** — `capture_dead_clicks:false`, `capture_performance:false`. Two lines, ~24 KB more.
3. **C1** — edition in `sr_save` + edition comparison in `packFreshness()`. ~3 lines. Highest user-safety value on the list.
4. **H1** — controller guard on the SW reload. One line. Fixes a real first-visit cost and an analytics over-count.
5. **M6** — pin `ip:false` explicitly. One line.
6. **H2** — decide: disclose replay in `ab_privacy`, or drop `srReplayGuard()`.
7. **H5** — global error handler with a bilingual "start over" affordance; enable exception capture.
8. **M1 / M2** — `@page` + `print-color-adjust`, then verify all six pages on real Letter output.
9. **M3 / M4** — offline-claim honesty and cache-name versioning together.
10. **M5** — delete the email path or point it at `/api/`.

Items 1-5 are eleven lines of change and cover the two critical/high issues with the worst blast radius.

---

## Appendix — reproduction

```bash
cd C:/Users/mfran/Ai-Foundations/Amparo

# sizes
wc -c index.html                       # 418100
gzip   -c index.html | wc -c           # 138740
brotli -c index.html | wc -c           # 112006
find audio -type f | wc -l && du -sh audio   # 222, 6.2M

# absent-by-grep (all return nothing)
grep -n "print-color-adjust\|@page" index.html
grep -n "window.onerror\|unhandledrejection" index.html
ls -d api functions netlify .netlify 2>/dev/null

# live instrumentation
python -m http.server 8777 --bind 127.0.0.1
```

Then in Chrome DevTools against `http://127.0.0.1:8777/`. Note: the SW registration is gated on `location.protocol==='https:'` (`:4557`), so it must be registered manually for local testing:

```js
// H1 — first-visit reload, and M3 — what is actually precached
navigator.serviceWorker.addEventListener('controllerchange',
  () => console.log('controllerchange, controller=', !!navigator.serviceWorker.controller));
await navigator.serviceWorker.register('sw.js');   // hadControllerBefore === false
await navigator.serviceWorker.ready;
for (const k of await caches.keys())
  console.log(k, (await (await caches.open(k)).keys()).map(r => r.url));   // 6 entries

// H3 / H4 / M6 — analytics weight and configuration
performance.getEntriesByType('resource')
  .filter(r => /ph\.amparohq/.test(r.name))
  .map(r => [r.name, r.decodedBodySize]);          // 361,094 B across 6
posthog.config.disable_surveys;                     // false
posthog.config.ip;                                  // false (inherited, not pinned)

// H5 — error visibility
[!!window.onerror, !!window.onunhandledrejection,
 posthog.calculateEventProperties('probe',{}).$exception_capture_enabled_server_side];
// [false, false, false]

// M1 / M2 — print geometry
data.state='TX'; step=4; buildPrint();
getComputedStyle(document.querySelector('#printRoot .pp')).width;   // "793.92px" = 8.27in = A4
document.querySelectorAll('#printRoot .pp').length;                 // 6
[...document.styleSheets].some(ss => [...ss.cssRules]
  .some(r => r.constructor.name === 'CSSPageRule'));                // false
```

Perf numbers were taken with DevTools emulation at CPU 6×, Slow 4G, viewport `393x851x2.75,mobile,touch`, via `performance.getEntriesByType('navigation'|'paint'|'longtask')`.
