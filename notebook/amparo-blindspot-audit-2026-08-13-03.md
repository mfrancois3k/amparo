# Amparo blind-spot audit — root service worker, analytics honesty, the daily cron, the print path (v2.21.3)

**Agent C of `/amparo-loop small-fixes`. Lens: principal engineer.**
Territory: performance, service worker, analytics honesty, error handling, data
integrity — what a hostile reviewer would find first.

**Not repeated here.** Everything already fixed in v2.21.3 (`prx.best` escaping,
the `/app` ErrorBoundary, the two tablists) and everything already logged as
known (zero attorneys / two unsent memos, `k30`/`k33`, the `/app` promotion
decision and its SW landmine, L2 divergence being inert both ways, the `v2_4`
orphan audio). Also not repeated: the five prior audits' findings — the
`PRX_LEVELS` consumer sweep, dead `PRX_LEVELS[*].rate`, the `--verify` trigger
gap (fixed), the root↔`/app` best-score divergences, the `.ll-seg` move, the
`app/` freshness question.

**Methodology.** Every finding below was executed or read at source, never
inferred. I ran the real `sw.js` install and activate handlers inside a stubbed
service-worker VM with deliberately failing caches (scripts in scratchpad,
output reproduced verbatim); reproduced the workflow's exit-code behaviour in a
real shell; reconstructed 18 historical `law-status.json` commits with
`git show`; read every `localStorage` writer, every `catch` shape, every `ph()`
call site and every `step` assignment in `index.html`. All four check suites
were re-run fresh this session and pass (`--verify` 2437 strings,
`sw-routing-check` 12 assertions).

---

## 1. HIGH — "works without internet" is a claim about service-worker *registration*, not about whether anything is actually cached. A failed install still shows the chip.

**Verdict: CONFIRMED by executing the real install handler, not by reading it.**

`sw.js:18-27` swallows every cache failure and then resolves anyway:

```js
e.waitUntil(caches.open(C).then(c =>
  c.add(CORE).catch(() => {}).then(() =>
    Promise.all(EXTRA.map(u => c.add(u).catch(() => {})))
  )
).catch(() => {}));      // <-- the outermost catch: waitUntil can never reject
self.skipWaiting();
```

Because the outermost promise always fulfils, the worker **always activates**,
whether or not a single byte was cached. `index.html:5803-5805` then reveals the
chip on `navigator.serviceWorker.ready` — which resolves on an *active worker*,
with no reference to cache contents:

```js
navigator.serviceWorker.register('sw.js').then(reg=>{ … return navigator.serviceWorker.ready; }).then(()=>{
  const el=document.getElementById('offlineReady');
  if(el){ el.textContent=t().offline_ready; el.style.display='block'; }
}).catch(()=>{});
```

`offline_ready` (`index.html:1819`) reads:
**"✈️ Saved on this device — works without internet"**

Ran the real handler with a `caches.add()` that always rejects:

```
caches.add() attempts : 6 (all rejected)
install waitUntil     : RESOLVED
=> worker activates?  : YES — with an EMPTY cache
offline navigation    : undefined (browser shows network error)
```

The last line is the user's actual experience: `sw.js:74`'s
`.catch(() => caches.match(CORE))` resolves to `undefined` on a cache miss, so
`respondWith(undefined)` yields the browser's network-error page. Not a
degraded app — no app.

**Why this is the top finding.** It is hard rule 3 exactly — *"NEVER claim
verification that didn't happen… the failure wasn't the check breaking, it was
breaking quietly while still making its claim."* Same shape, applied to the
product's most load-bearing promise. A driver reads "works without internet",
believes the pack is on the phone, and finds out it isn't at a roadside stop
with no signal. That is the single worst moment this product has.

**Honest scoping — three things that limit it.** (a) `sw.js:72` re-caches `CORE`
on every successful navigation, so the *next online page load* heals it. (b)
Root is a SPA — `render()` swaps `#screen`, it does not navigate — so healing
requires a reload or a return visit, not just continued use. (c) The failure
needs a flaky install (network drop mid-install, a Vercel 5xx, storage
pressure). Low frequency, worst-case landing, and completely invisible.

Also note `sw.js`'s comment at `:19-20` explains why the icons are added
individually and allowed to fail — that reasoning is correct for the *icons*.
It was extended to `CORE` as well, and `CORE` is the whole app.

**Fix shape (not applied — audit scope).** Gate the chip on the cache, not the
registration. `caches` is available in page context, so this is one line:

```js
navigator.serviceWorker.ready
  .then(() => caches.match('/'))          // CORE, resolved from the page
  .then(hit => { if (!hit) return; /* …reveal chip… */ });
```

No chip is the correct failure mode here, exactly as `renderLawCheck` already
reasons for the law badge (`index.html:4259-4261`: *"A 'last checked' date that
might be days old is worse than none"*). The same principle just wasn't applied
to the offline chip.

**Coverage gap that let it through:** `tools/sw-routing-check.mjs` exercises
`fetch` routing and `activate` cleanup. It never invokes the `install`
handler — grep for `install` in that file returns only comment text. The
install path has zero test coverage.

---

## 2. HIGH — the daily statute workflow's "open a review issue" step **can never fire**. `$?` after a pipe is `tee`'s exit code, not the checker's.

**Verdict: CONFIRMED by running the construct in a real shell.**

`tools/law-watch.mjs:145` makes the exit code *the* signal, deliberately:

```js
// Never fail the build for an unreachable site — only for a real change, so the
// workflow can open an issue when something genuinely moved.
process.exit(changed.length ? 1 : 0);
```

`.github/workflows/law-watch.yml` then throws that signal away:

```yaml
run: |
  set +e
  node tools/law-watch.mjs | tee check.log
  echo "changed=$?" >> "$GITHUB_OUTPUT"
```

`$?` after a pipeline is the exit status of the **last** command — `tee`, which
exits 0. Reproduced directly:

```
$ set +e; node -e "process.exit(1)" | tee /dev/null; echo "changed=$?"
changed=0
$ set -o pipefail; node -e "process.exit(1)" | tee /dev/null; echo "changed=$?"
changed=1
```

`pipefail` is **not** set here: the workflow specifies no `shell:` key, and
GitHub Actions' default for a `run:` step on Linux is `bash -e {0}`. (The
`-eo pipefail` form applies only when `shell: bash` is stated explicitly.)
`set +e` disables errexit and does not enable pipefail.

So `steps.check.outputs.changed` is permanently `0`, and
`if: steps.check.outputs.changed == '1'` has never been true. `git log` on the
workflow shows one commit — `07c43c1`, 2026-07-31 — and no fix since. **The
notification channel for a statute change has never worked.**

**Honest scoping.** This is not total silence. `law-watch.mjs:133` writes
`needsReview` into `law-status.json`, the workflow commits that file, and
`renderLawCheck` (`index.html:4270-4276`) flips the badge to `lawchk_flag`
("A source statute changed and is under review"). So a real change *does* reach
the live site. What is dead is the channel designed to reach **a person** —
the GitHub issue with the source URL and the re-baseline instructions. The
operator would only learn of a statute change by loading their own site and
noticing the badge changed colour, or by reading a committed JSON diff.

**Fix shape:** capture node's status directly rather than through the pipe —

```yaml
node tools/law-watch.mjs | tee check.log
echo "changed=${PIPESTATUS[0]}" >> "$GITHUB_OUTPUT"
```

or add `shell: bash` to the step (which brings `pipefail`). One line either way.

---

## 3. MEDIUM-HIGH — the badge says "Statute sources auto-checked daily" while one of the four sources has been unreachable on **11 of the last 14 days**. `reachedSources` is computed, committed, and never read.

**Verdict: CONFIRMED by reconstructing every historical `law-status.json`.**

The badge string (`index.html:1965`):

> **"Statute sources auto-checked daily — last check {d}.** This checks whether
> the source text moved, not that the law is correct."

The second sentence is scrupulous about *what kind* of check it is. Neither
sentence says anything about *how many* sources were reached. `renderLawCheck`
(`index.html:4265-4278`) reads only `lastChecked` and `needsReview` —
`reachedSources` and `sourcesWatched` are written by `law-watch.mjs:130-131`,
committed daily, and never consulted by any renderer (grep: zero hits in
`index.html` outside the JSON).

Every committed `law-status.json`, reconstructed with `git show`:

```
2026-08-13 reached=3/4 {"ok":3,"unreachable":1}
2026-08-12 reached=3/4 {"ok":3,"unreachable":1}
2026-08-11 reached=3/4 {"ok":3,"unreachable":1}
2026-08-10 reached=4/4 {"ok":4}
2026-08-09 reached=3/4 {"ok":3,"unreachable":1}
2026-08-08 reached=4/4 {"ok":4}
2026-08-07 reached=4/4 {"ok":4}
2026-08-06 reached=3/4 {"ok":3,"unreachable":1}
2026-08-05 reached=3/4 {"ok":3,"unreachable":1}
2026-08-04 reached=3/4 {"ok":3,"unreachable":1}
2026-08-03 reached=3/4 {"ok":3,"unreachable":1}
2026-08-02 reached=3/4 {"ok":3,"unreachable":1}
2026-08-01 reached=3/4 {"ok":3,"unreachable":1}
2026-07-31 reached=3/4 {"ok":3,"unreachable":1}
```

The unreachable one is Georgia — `research/law-watch.json` documents it
explicitly (FindLaw 403s Actions runner IPs; every alternative GA host tested
404s, 503s or serves a JS shell). **HANDOFF open issue #7 already knows GA
403s the runner.** What is new here is the *badge* consequence, which #7 does
not state: a Georgia user reads "Statute sources auto-checked daily" on a page
citing O.C.G.A. §40-5-29, and that source has in fact not been checked since
2026-08-10 — three days, and on 11 of the last 14.

The honesty guard in `law-watch.mjs:118-128` was built for exactly this class of
problem, but it only covers the **all-four-fail** case:

```js
lastChecked: reached ? today : (previous?.lastChecked ?? null),
```

One reachable source out of four advances `lastChecked` to today and earns the
full-confidence badge. Partial failure is invisible by construction.

This is the closest thing in the current codebase to the named precedent — the
badge that read "sources auto-checked daily" while all four sources were 403ing.
The data needed to tell the truth is already computed and already shipped to the
browser; only the render ignores it.

**Fix shape:** `renderLawCheck` already has `st.reachedSources` and
`st.sourcesWatched` in hand. Either qualify the string when
`reachedSources < sourcesWatched`, or — stronger, and truer to how the badge is
meant to work — suppress the badge on the *state currently being shown* when
that state's source was unreachable. That requires per-source status in
`law-status.json`, which `law-watch.mjs` already has in `results` and currently
collapses into `counts`.

---

## 4. MEDIUM — the conversion event fires when the print **dialog opens**, and a **cancelled** dialog commits the entire post-print state machine, including "Pack sent to your printer".

**Verdict: CONFIRMED by reading both handlers and every `hasPrinted` consumer.**

Printing is the conversion event — 3 of 72 users. Both ends of it are wrong in
the same direction.

**(a) `sr_pack_printed` fires on `beforeprint`** (`index.html:4290-4300`), i.e.
when the OS print dialog is *about to open*. The debounce there is careful and
correct (Android Chrome double-fires; the comment records a real 686 ms
production observation), but it debounces the wrong thing precisely. The funnel
line "72 landed → 4 picked a state → **3 printed**" actually means *3 opened a
print dialog*. At n=3, the true print count could be 3, or it could be 0.

**(b) `afterprint` commits everything, and it fires on Cancel too.** The comment
at `:5782-5785` names the problem and then reaches the wrong conclusion:

```
/* afterprint fires on Cancel too — browsers can't tell us the outcome.
   So the banner speaks honestly ("sent to your printer"), … */
```

`done_t` (`index.html:1975`) is **"Pack sent to your printer"** — a positive
assertion of an event that did not happen when the user cancelled. And it is not
only a string. `index.html:5819-5820`:

```js
if(!hasPrinted){
  hasPrinted=true; printedAt=Date.now(); printedEdition=EDITION; persist();
```

A cancelled dialog therefore, permanently and on disk:

| Consumer | Effect of a cancelled print |
|---|---|
| `:3365` | print button demoted `gold` → `ghost` — the primary CTA stops looking primary |
| `:3367` | `postPrintActions` rail revealed |
| `:3387` | print-feedback ask shown ("how did printing go?") to someone who printed nothing |
| `:3166` | usage banner armed (gated on `hasPrinted`) |
| `:2610` | `printedEdition` recorded → future EDITION bump raises a stale-pack banner for a pack that never existed |

So a user who opens the dialog, sees the printer isn't connected, and cancels is
told their pack was sent, is never nudged to print again, and is counted as a
conversion.

**This one has no clean measurement fix** — browsers genuinely do not report
print outcome, and the comment is right about that. It is a *labelling and
state-commit* problem, not a measurement one:

- Keep the event (renaming breaks historical continuity) but add
  `{outcome:'dialog_opened'}` so the funnel can't be misread later, and record
  the caveat next to the 72→4→3 figure in the session log.
- Change `done_t` to something true for both branches (e.g. "Print dialog
  closed — if nothing came out, tap print again"), which also gives the user a
  recovery path they currently don't have.
- Consider gating the `hasPrinted` commit on an explicit confirmation rather
  than on `afterprint`.

---

## 5. MEDIUM — any shell version bump deletes every cached audio clip, contradicting the reason `sw.js` gives for caching them at all.

**Verdict: CONFIRMED by executing `activate` against a simulated `C` bump.**

`sw.js:1-4` states the design intent:

> *Audio/img: cache-first (immutable, and prepaid-data users must not re-pay for
> clips they've already played).*

But audio goes into the **same** cache as the shell (`sw.js:83`,
`caches.open(C)`), and `activate` deletes every `amparo-*` cache that isn't the
current `C` (`sw.js:38`). Simulated the next bump (`amparo-v3` → `amparo-v4`)
against the real handler:

```
caches deleted on activate: [ 'amparo-v3' ]
amparo-v3 held ALL cached audio (sw.js:83 puts assets into C) -> DELETED: every clip re-downloads
/app workbox precache      -> survives (the v2.21 fix holds)
```

`audio/` is **6.5 MB across 240 clips**. `C` has already been bumped twice
(`e5bb03c` v1 → `77d8525` v2 → `4671e41` v3), so this has already been charged
to every prepaid-data user twice, silently. The `/app` precache protection added
in `e21d019` holds — that part is fine.

**Fix shape, and a trap in it.** The obvious fix is a second, unversioned cache
for `/audio` + `/img`. But `activate`'s filter is
`k.startsWith('amparo-') && k !== C`, which deletes **any** second root cache on
the very next activation — so the assets cache must be added to that filter's
exception *in the same change*, and `tools/sw-routing-check.mjs:103` asserts the
current single-survivor behaviour and would need updating too. Anyone who adds a
root cache without touching all three places ships a cache that deletes itself
daily.

**Not a finding: unbounded cache growth.** I checked for it because it was in
the brief. The asset cache is bounded by the asset set — `audio/` 6.5 MB +
`img/` 156 KB + `og.png` 597 KB ≈ 7.3 MB absolute ceiling, and only clips
actually played are stored. There is no growth problem.

---

## 6. MEDIUM — document capture fails **completely silently** when the image can't be decoded. The quota path is handled honestly; the decode path is not.

**Verdict: CONFIRMED by reading the full capture chain.**

Credit where due first: the quota case is handled *well*, and better than the
brief assumed. `docsSave` (`index.html:3540-3548`) returns a boolean, and
`docPick` (`:3583-3593`) rolls back and tells the user:

```js
const prev=data[key];
data[key]=url;
if(!docsSave()){ data[key]=prev; docsSave(); alert(t().d_quota); return; }
```

`setItem` is atomic, so a failed write leaves the previous `sr_docs` intact —
there is no mid-way partial-write corruption. That question is closed.

The gap is one line earlier. `docsShrink` (`:3562-3578`) reports **every**
decode/read failure as `cb(null)`:

```js
img.onerror=()=>cb(null);
fr.onerror=()=>cb(null);
```

and `docPick` discards it without a word:

```js
docsShrink(f,url=>{
  if(!url) return;        // <-- no message, no state change, no retry hint
```

The user taps "Tap to add", the OS camera opens, they take a photo, they return
to the app — and **nothing happens**. The row still reads "Pending". No error,
no explanation, no indication whether to try again. The most likely trigger is
real: `docPick:3582` accepts anything matching `/^image\//`, which includes
`image/heic` and `image/heif`; Android devices with HEIF capture enabled hand
back exactly that, and Chrome on Android cannot decode HEIC in an `<img>`, so
`img.onerror` fires. Low-memory canvas allocation failures land in the same
branch.

The asymmetry is what makes it a finding: the same function tells the user about
a storage failure and says nothing about a conversion failure, and the
conversion failure is the more likely of the two.

**Fix shape:** give `cb(null)` a message. There is already a suitable pattern
(`alert(t().d_quota)`); this needs a sibling string, in both languages.

---

## 7. LOW — `demoOpen()` sets `step=4` directly, bypassing `srReplayGuard`. The "replay never runs past step 1" invariant is violated; it is safe today only because the data on screen happens to be fake.

**Verdict: CONFIRMED by sweeping every `step` assignment.**

Session replay is scoped to steps 0-1 by `srReplayGuard` (`index.html:3706`),
called from exactly two places — `go()` (`:3716`) and the post-restore call
(`:4255`). The comment at `:3695-3700` claims the sensitive screens are
*"structurally un-recordable rather than relying on a masking rule to hold."*

`demoOpen` (`:3972`) breaks that structure:

```js
step=4; render(); // render directly — go() would persist, and demo never persists
```

The stated reason (avoid persisting demo data) is valid; the side effect —
skipping the replay guard — appears unintended. A first-time visitor sits at
step 0 with replay **active**, taps the sample, and lands on step 4 (lifelines)
with recording still running.

**Why this is LOW and not higher, stated precisely.** Every value rendered at
that moment is synthetic — `demoOpen` overwrites the pack with
`'Maria Sample'` / `'Luis Sample'` / `(555) 010-*` before rendering, so no real
personal data is captured. `demoExit` (`:3980`) does call `restore()` before
`step=0; render()`, but step 0 is a screen where replay is legitimately allowed,
and the guard latch (`srReplayDead`) means a user who had already passed step 2
this session cannot have replay restarted at all.

So: a real invariant violation with no current data exposure. It is worth
closing because the safety currently rests on "the demo data is fake", not on
the structure the comment claims — and the next person to add a real field to
step 4, or to make the sample show partial real data, will silently start
recording it.

**Fix:** `srReplayGuard(4);` before `step=4`. One line, no behaviour change today.

---

## 8. LOW — `persist()` swallows a storage failure silently while `docsSave()` reports one.

`persist()` (`index.html:3644-3650`) is `try { setItem('sr_save', …) } catch(e){}`.
If that write fails, the user's **name, both emergency contacts, attorney number
and step position** silently stop being saved, and they find out on reload.

The design note at `:3514-3515` documents the intent ("if storage is
unavailable… the app silently falls back to in-memory only"), so this is a known
choice, not an oversight — and it is the right choice for sandboxed viewers,
where an alert on every keystroke would be intolerable. Reported only for the
asymmetry: the *photo* path decided that failure is worth telling the user
about, and the *contacts* path decided the opposite, in the same file, for the
same underlying failure. One of the two is wrong. Note also the ordering
dependency: `docPick` calls `docsSave()` first and `persist()` second
(`:3587`, `:3590`), so a photo that just consumed the last of the quota produces
a successful save, no alert, and a silently dropped contacts write.

---

## 9. Checked and NOT a finding — the daily cron racing a human push

The brief asked. `law-watch.yml` does `git add` / `git commit` / `git push` with
no `pull --rebase` and no retry, so a race with a human push **does** fail. But
the failure is honest in both directions: the step fails loudly (red X in
Actions), `law-status.json` simply isn't updated that day, and the site's badge
shows an older `lastChecked` date — which is the truth. `git diff --staged
--quiet && exit 0` also correctly skips no-op commits. The worst case is a
missed day that the badge accurately reports as a missed day. Not worth changing.

---

## 10. Checked and NOT findings — stated plainly rather than padded

- **PostHog privacy configuration is solid.** `index.html:1587-1607`:
  `autocapture:false`, `disable_session_recording:true` (replay off by default),
  `session_recording:{maskAllInputs:true,maskTextInputs:true}`,
  `disable_surveys:true`, `person_profiles:'identified_only'`. The five
  privacy-critical options are pinned explicitly rather than left to whatever
  the runtime-fetched SDK defaults to, and the comment explains why.
- **The crisis path is never recorded.** I specifically chased the worst case —
  a user typing suicidal ideation (`PRX_CRISIS`, `:4961`) while replay is live,
  where `maskAllInputs` would hide the input but the rendered 988 response is
  DOM text and would not be masked. Traced the full entry chain: the practice
  hub is `step===5` (`:3420`), reached only via `goM(5)`→`go(5)`→
  `srReplayGuard(5)`, which stops recording and latches `srReplayDead`.
  `practiceIntroOpen`/`prepOpen`/`practiceOpen` are all downstream of that.
  Replay is provably dead before any practice screen renders. Good design.
- **The SpeechRecognition path is correctly dark.** `:4943-4953` — vendor-server
  transit is documented, `prxSTT` defaults false, the UI that reached it was
  removed, and the re-enable conditions are written down. Nothing to fix.
- **The email path is dead and correctly gated,** but its comment is stale.
  `sendPackEmail` (`:4302-4315`) POSTs `{email, name, state, …}` off-device —
  the one code path in the app that would break the core promise. It is
  unreachable: `REVIEW.emailEnabled:false` (`:2570`) hides both the input
  (`:3287`) and the button (`:3375`). Two notes: the flag comment says *"flip to
  true ONLY after deploying `/.netlify/functions/send-pack`"*, but this deploys
  on **Vercel** (no Netlify artifacts exist anywhere in the repo — `find` returns
  nothing), so that instruction can't be followed as written; and flipping it is
  a core-promise decision, not a deployment step. Worth a comment rewrite before
  someone reads it as a to-do.
- **Cache growth is bounded** (see §5) — ~7.3 MB ceiling, not a leak.
- **All four suites pass fresh this session**, and `git status` is clean except
  one untracked wargames file.

---

## Summary table

| # | Area | Finding | Verified how | Severity |
|---|---|---|---|---|
| 1 | Service worker | A failed install still activates; "works without internet" is shown on `serviceWorker.ready`, not on cache contents. Offline navigation → browser error page | Executed real `install` handler with rejecting `caches.add` | **High** |
| 2 | Daily cron | `changed=$?` after `\| tee` is tee's status; the "open a review issue" step has never been able to fire | Reproduced pipeline semantics in a real shell; `git log` on the workflow | **High** |
| 3 | Analytics/claim honesty | Badge says "sources auto-checked daily" while GA was unreachable 11 of 14 days; `reachedSources` computed, committed, never read | Reconstructed 14 `law-status.json` commits via `git show` | **Medium-High** |
| 4 | Print / conversion | `sr_pack_printed` fires on dialog *open*; `afterprint` commits `hasPrinted`+`printedEdition`+"Pack sent to your printer" on **Cancel** | Read both handlers + all 5 `hasPrinted` consumers | **Medium** |
| 5 | Service worker | Any `C` bump deletes all cached audio (6.5 MB / 240 clips), contradicting sw.js's own stated reason for caching it; already charged twice | Executed `activate` against a simulated v3→v4 bump | **Medium** |
| 6 | Error handling | Image decode failure in `docsShrink` → `cb(null)` → `docPick` returns with zero user feedback (HEIC on Android is the live trigger). Quota path is handled correctly | Read the full capture chain | **Medium** |
| 7 | Privacy invariant | `demoOpen` sets `step=4` bypassing `srReplayGuard`; safe only because demo data is synthetic | Swept every `step` assignment | **Low** |
| 8 | Error handling | `persist()` swallows quota silently while `docsSave()` alerts — asymmetric treatment of the same failure | Read both writers | **Low** |
| 9 | Daily cron | Push race fails loudly and the badge degrades honestly | Read workflow | — (not a defect) |
| 10 | Privacy / analytics | PostHog config, crisis path, STT gating, email gating all verified sound | Traced each chain | — (not defects) |

---

## Bottom line

Two HIGHs, and they are the same failure twice: **a claim that outlives the
thing it was making a claim about.**

`sw.js` can fail to cache a single byte and the app will still tell the user
"works without internet" — proven by running the handler, not by reading it.
And the daily statute check has, since the day it was written, been unable to
open the review issue that is its entire notification mechanism, because a `tee`
in the pipeline eats the exit code that carries the signal. Neither breaks
loudly. Both keep making their claim.

The third finding is the same shape at lower stakes and is the one the operator
will recognize fastest: the badge reads "Statute sources auto-checked daily"
while Georgia has been unreachable on 11 of the last 14 days. `law-watch.mjs`
already computes `reachedSources: 3, sourcesWatched: 4`, already commits it,
already ships it to the browser — and `renderLawCheck` doesn't look at it. The
honesty guard that exists (`lastChecked` only advances if something was reached)
was built for the all-four-fail case and has no opinion about partial failure.

The print finding matters out of proportion to its severity because of n=3. The
funnel's terminal number is not "3 printed" — it is "3 opened a print dialog",
and a user who cancels that dialog is told their pack was sent, is marked
`hasPrinted` on disk, has their primary CTA demoted, and is asked for feedback
about a print that never happened. The browser genuinely cannot tell us the
outcome; the fix is to stop asserting one.

What I did **not** find, and want on the record because I went looking: the
privacy architecture holds. Session replay is off by default, masked, latched
dead before any practice screen, and provably absent from the crisis path.
Document photos handle quota with a rollback and an honest alert. The
SpeechRecognition path is dark and documented. The one code path that would send
personal data off-device is flag-gated off. The moat is intact — it is the
*claims layer* around it that has drifted, in three separate places, in the same
direction.
