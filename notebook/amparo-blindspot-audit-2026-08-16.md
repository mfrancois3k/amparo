# Amparo blind-spot audit — v2.22.5 Welcome changes + PostHog test-traffic exposure

**Agent C of `/amparo-loop`, run standalone. Lens: principal engineer.**
Territory: performance, service worker, analytics honesty, error handling —
what a hostile reviewer would find first.

**Methodology.** Every finding below was checked against source at the cited
line, or by running the real command and pasting its real output. Nothing here
is inferred from the commit message alone. `tools/extract-app-content.mjs
--verify` was run three times: on the live working tree as found, on a fresh
`git clone` of the same commit, and on a fresh clone of the prior commit — to
separate "this shipment broke something" from "this was already broken."

---

## 1. MEDIUM — `extract-app-content.mjs --verify` fails on this machine right now, but not because of the shipped content

**Verdict: CONFIRMED failing, but NOT a content regression from v2.22.5.**

Ran from repo root, live working tree, first command of the session, nothing
touched beforehand:

```
$ node tools/extract-app-content.mjs --verify
FAIL t.en.json — differs from a fresh extraction (drift)
FAIL t.es.json — differs from a fresh extraction (drift)
extract --verify:
  meta.json          sha256:3d7ed25049e60cce  0.7 kB
  states.json        sha256:521fce1b7633ce6f  37.8 kB
  ...(8 other files all PASS, matching hashes)...
  i18n: 474 top-level keys, 527 deep paths, EN/ES structure identical
  strings verified present in index.html: 2483 (2340 byte-identical, 143 via source escapes/entities)
2 FILE(S) DRIFTED
```

Only `t.en.json` and `t.es.json` fail — exactly the two files `ed71378`
touched to add `w_lifelines_shortcut`. That looks like the shipped change
broke the gate. **It didn't.** Byte comparison shows why:

```
$ git show HEAD:app-src/src/content/t.en.json | wc -c   → 39628
$ wc -c app-src/src/content/t.en.json                    → 40215   (+587 bytes)
```

587 is exactly the line count of the file. The working-tree copy has 587 CR
bytes (`\r\n`); the committed blob and the tool's fresh output are pure `\n`.
The `w_lifelines_shortcut` string itself is present and byte-identical in both
languages — this is a pure line-ending artifact from `core.autocrlf=true`
(confirmed `git config --get core.autocrlf` → `true`, no repo-local override,
no `.gitattributes`), not a content mismatch.

**Why only these two files, and why it's still worth fixing:** the other 8
extracted files have apparently never been rewritten by a git checkout since
they were first written to disk (still pure LF), while `t.en.json`/`t.es.json`
were the two files this session's commit actually touched, which is enough to
trip line-ending conversion on next checkout. Proven not to be innocent luck:
a genuinely fresh `git clone` of this exact commit into scratch, run
immediately, fails **all 10 files**, and cloning the *prior* commit
(`9bf1386`, before this loop's changes) fails the same all-10 way. So the gate
has never reliably passed on a clean Windows checkout — this predates
v2.22.5, and the shipped edit just happened to touch the two files whose
working-tree copies currently carry CRLF.

**Real consequence:** `app-src/package.json` wires this into the actual build
— `"build": "npm run verify:content && tsc -b && vite build"` — so `npm run
build` in `app-src/` will hard-fail at the first step on this machine right
now. No CI workflow currently runs this (only `.github/workflows/law-watch.yml`
exists, for the daily statute check), so nothing downstream is silently
green — but the local build is currently red for a reason unrelated to
content correctness, which is exactly the failure mode the tool's own comment
(`extract-app-content.mjs:82-90`) warned about for a *different* file
(`index.html`) and fixed there, but never applied to the output-side
comparison at `extract-app-content.mjs:383-384`:

```js
const onDisk = readFileSync(path, 'utf8');
if (onDisk !== text) { failures++; ... }   // no \r\n → \n normalization here
```

**Fix (not applied, out of scope for an audit):** normalize `onDisk` the same
way `html` is normalized three lines up (`.replace(/\r\n/g, '\n')`) before the
comparison. One line, same pattern already in the file.

---

## 2. Welcome screen changes (pilotBanner + lifelines shortcut link) — no regressions found

**pilotBanner on Welcome:** `index.html:1672` places `.pilot` as a sibling of
`#stepper`/`#screen`, outside the per-step `innerHTML` swap — it was always
rendered in the DOM; only `display:none` on step 0 was removed
(`index.html:3220`, was `_pilot.style.display=step===0?'none':'block'`, now
unconditionally `'block'`). Confirmed by diffing `ed71378`. Because it lives
outside `#screen`, it cannot collide with the resume-flow's
`window.__resumeStep` button, which renders inside `#screen`'s step-0 markup
(`index.html:3279`) — that button is untouched and still conditionally
rendered exactly as before. No shared layout assumption broken; `.pilot` has
its own margin (`margin:10px 0 4px`) independent of step-0 content.

**`w_lifelines_shortcut` accessibility:** it's a native `<button
class="linkbtn">` (`index.html:3281`), not a div with a click handler, so it's
keyboard-reachable by default tab order with no `tabindex` overrides anywhere
near it. DOM/focus order on step 0: resume button (conditional) → primary CTA
(`w_btn`, gold) → **new shortcut link** → try-a-sample (`w_try`, ghost) →
lawnote → sample/share/about/doc links. That puts the new link immediately
after the primary CTA in tab order, matching its visual position directly
underneath it — no order/position mismatch. `.linkbtn` CSS gives it
`min-height:44px` (meets touch-target minimum) and default focus outline is
untouched: grepped every `outline:none` rule in the file and none target
`.linkbtn` or a bare `button:focus`.

**Content-extraction hash-match:** see Finding 1 — the string itself is
correctly extracted and matches in both `t.en.json`/`t.es.json`; the
`--verify` failure is a line-ending artifact, not a missed string.

---

## 3. `phLifelineClick` — no interference with link navigation, `idx` is reliable

**`target="_blank"` / native navigation:** `index.html:4011`:

```js
`<a class="ll-contact" href="${c.href}" onclick="phLifelineClick(${idx})"${c.type==='web'?' target="_blank" rel="noopener noreferrer"':''}>`
```

`phLifelineClick` (`index.html:3957-3961`) only calls `ph(...)` (the PostHog
wrapper) — it never calls `event.preventDefault()`, never `return false`s,
and its own definition takes no `event` parameter at all. An inline `onclick`
handler only blocks the browser's default action if it explicitly returns
`false` (or the caller does `preventDefault`); this one does neither, so the
`<a>`'s own `href`/`target`/`rel` behavior is untouched — `tel:` links still
open the dialer, `web` links still open in a new tab with `noopener
noreferrer` intact.

**`idx` reliability:** the code's own comment already anticipated and
addressed the exact failure mode asked about — `phLifelineClick` re-indexes
`STATES[data.state||'NY'].lifelines` fresh at click time rather than closing
over a stale reference, specifically because `llTab()` rebuilds the whole
track via `innerHTML` on every language toggle. Confirmed by source read: the
`lifelines` array per state is a static literal (`index.html:2535-2556`),
never sorted, filtered, or reordered anywhere before being handed to
`.map((L,idx)=>...)` at `index.html:4015` — the one place that does `.filter`
on `st.lifelines` is the print-pack renderer (`index.html:4321`), a completely
separate code path from the interactive tab, so it can't desync the indices
used for click tracking. Language toggle changes only the *displayed text*
(`L.d_en`/`L.d_es`) on the same array objects, never the array order. The one
scenario this doesn't cover — `data.state` itself changing between render and
click — isn't reachable without a re-render (changing state requires
returning to the State step, which unmounts this screen), so it's not a real
window.

---

## 4. HIGH — no code-level exclusion of localhost/dev/preview traffic from PostHog; the "9-16 visitors/month" figure's integrity rests entirely on a manual, one-time query filter

**Verdict: CONFIRMED as a gap by reading the full init; CANNOT verify the
PostHog project's dashboard-level "internal and test users" filter, because
the `posthog` MCP connector is not authorized in this session** (it requires
OAuth via `/mcp` or `claude mcp` interactively — this session is
non-interactive). Everything below is what's checkable from source.

Root's PostHog init (`index.html:1618-1651`) has exactly one environment
guard:

```js
(function(){
  if(!/^https?:/.test(location.protocol)) return;   // only skips file:// loads
  ...
  posthog.init('phc_...', {
    api_host: PH_HOST,
    autocapture:false, capture_pageview:true,
    disable_session_recording:true, disable_surveys:true,
    capture_dead_clicks:false,
    session_recording:{maskAllInputs:true,maskTextInputs:true},
    person_profiles:'identified_only'
  });
})();
```

That guard only excludes opening `index.html` as a local file
(`file://...`). It does **not** exclude:

- **`http://localhost:...`** — any local dev/preview server (Vite, a static
  server, etc.) is served over `http:`, which passes the regex and initializes
  PostHog normally. Every local dev hit counts as a real visitor.
- **Vercel preview deployments** (`*.vercel.app` branch previews) — those are
  `https:`, indistinguishable from production traffic to this guard.
  `vercel.json` was checked and defines no header/env-based opt-out either.
- **The operator's own QA visits to the live production URL** — nothing in
  this init identifies or opts out the operator. `person_profiles` is set to
  `'identified_only'`, but grepped the entire codebase (root + `app-src`) for
  `posthog.identify(` and found **zero calls** — no visitor, including the
  operator, is ever identified, so there's no property (email domain, user
  id, etc.) a PostHog dashboard filter could key off without a manual,
  event-level rule instead.

Separately confirmed: **`/app` (the React port) has no PostHog integration at
all** — grepped `app-src/src/**` and the built `app/index.html` /
`app/assets/*.js` for `posthog`, zero matches anywhere. So today's entire
"9-16 unique visitors/month" figure is root-only; `/app` traffic (if any) is
currently untracked in either direction — neither inflated nor undercounted,
just invisible.

The only per-event suppression that exists is the demo-mode check inside the
`ph()` wrapper itself (`index.html:1652`: `if(window.isDemoActive &&
isDemoActive()) return;`), which stops the in-product "Try a sample" walkthrough
from polluting funnel events — a different, narrower thing than dev/test
*visitor* exclusion.

**What this means concretely:** the CHANGELOG's "(30 days, test-account
traffic excluded)" for this session's pull describes how *that one query* was
filtered when it was run — not a standing rule. There is no code guard and no
verifiable persisted PostHog filter stopping the next person who opens the
dashboard's default view, or the next scheduled/automated pull, from folding
localhost dev traffic, Vercel preview-branch traffic, or the operator's own
unfiltered QA clicks back into whatever "unique visitors" number decisions
get made from next time. Given the actual numbers are already tiny (9 Welcome
/ 3 State per the CHANGELOG), even a handful of uncounted dev hits would be a
large relative distortion.

**Not fixed here** (audit only, per task scope) — the fix is cheap either
way: add a `location.hostname` check (`localhost`, `127.0.0.1`, `*.vercel.app`
preview pattern) alongside the existing `file:` guard, and/or configure and
*save* a PostHog project-level "Filter out internal and test users" rule so
it's not re-applied by hand on every pull. The dashboard-level piece can't be
confirmed as present or absent without PostHog access, which isn't available
in this session — flagging that as an open verification item, not a closed
one.

---

## Summary table

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | MEDIUM | `extract-app-content.mjs --verify` fails locally (t.en/t.es, CRLF artifact); pre-existing on Windows, not caused by this shipment, but currently breaks `npm run build` in `app-src/` | Confirmed, root cause identified, not fixed |
| 2 | — | pilotBanner-on-Welcome and the new shortcut link | No regression found |
| 3 | — | `phLifelineClick` navigation interference / `idx` staleness | No bug found; both explicitly handled in source |
| 4 | HIGH | No code-level localhost/preview/operator-traffic exclusion in PostHog init; dashboard-level filter unverifiable this session (PostHog MCP not authorized) | Confirmed gap; real risk to the visitor-count figure decisions are resting on |
