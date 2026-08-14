# Amparo blind-spot audit — 2026-08-13 (05) — `share-sheet`

Agent C of the standing `/amparo-loop`. Lens: principal engineer — performance,
service worker, privacy/analytics honesty, error handling, and anything a
hostile reviewer would find first.

Primary target: the new share sheet (`#shareOverlay`, v2.22.0 `8d93d39` +
v2.22.1 `f9d7806`), verified structurally and behaviourally but never visually.

Everything below was checked against source at HEAD (`872eed3`) or against a
live run at `http://127.0.0.1:8931/index.html`. Where I could not verify
something, it says so.

---

## Findings, ranked

### 1. HIGH — the target row overflows on every real phone, and two targets are 0% visible with no scroll affordance

`index.html:415-416`

```css
.sh-row{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.sh-row::-webkit-scrollbar{display:none}
```

Measured live at 375×812 (mobile preset) with `navigator.share` present — i.e.
the shape every real phone gets:

```
{"win":375,"tiles":6,"scrollW":474,"clientW":295,"overflow":179,
 "visible":[{"lb":"WhatsApp","pctVisible":100},
            {"lb":"Messages","pctVisible":100},
            {"lb":"Facebook","pctVisible":100},
            {"lb":"X","pctVisible":47},
            {"lb":"Copy link","pctVisible":0},
            {"lb":"More","pctVisible":0}]}
```

Without `navigator.share` (desktop) it is still 394 vs 295 — `overflow:99`,
Copy link 0% visible.

The scrollbar is suppressed in both engines (`scrollbar-width:none` +
`::-webkit-scrollbar{display:none}`) and the chevron arrows were deliberately
dropped. So the **only** cue that the row scrolls is a half-cut fourth tile.

This is a regression introduced between the two releases, not an original sin.
`8d93d39`'s commit message justifies dropping the chevrons with:

> Dropped the chevron scroll arrows: four targets only overflow on the
> narrowest phones

That was true of four tiles. `f9d7806` added Facebook and X — six tiles — and
did not revisit it. 179px of overflow on a 375px phone is not "the narrowest
phones."

What is actually lost: **"More"** — the `navigator.share` tile, the only route
to Signal, Telegram, AirDrop, and the encrypted channels this audience is most
likely to use — is completely invisible on the device where it is the *only*
tile that works well. X is half-cut. Copy is survivable because the second Copy
button in the `.sh-link` row below is fully visible.

Cheapest fix, no new state: `flex-wrap:wrap;justify-content:center` on
`.sh-row`, delete the overflow. Six 74px tiles wrap to 3×2 inside 295px. No
scroll position to keep truthful, so the original reason for dropping the
chevrons is satisfied rather than contradicted.

> Note on evidence: `computer{action:"screenshot"}` will not composite the
> overlay in this preview (GSAP ticker frozen — see the testing note), so this
> is `getBoundingClientRect`/`scrollWidth` from real layout, not a picture.
> Layout is computed correctly even when paint is not, so the numbers hold.

---

### 2. MEDIUM-HIGH — `prxShareCert` treats a cancelled share as a save, and writes the file anyway

`index.html:5601-5618`

```js
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],text:_t.prx_share_taunt+' https://www.amparohq.com'});
      return;
    }
  }catch(e){}
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='amparo-rights.png';
  document.body.appendChild(a); a.click(); a.remove();
  ...
  if(btn) btn.textContent=_t.cert_saved;
```

The bare `catch(e){}` swallows `AbortError`. So: tap "Share certificate", the
native sheet opens, tap **Cancel** — and a PNG carrying the user's level and
score is written to Downloads anyway, and the button says "Saved."

Its sibling eleven lines above gets this exactly right (`index.html:5569`):

```js
}catch(e){ if(e&&e.name==='AbortError'){ if(note) note.textContent=''; return; } }
```

This is the same family as the print banner that asserted "Pack sent to your
printer" on Cancel — already found, already fixed, already written into the
handoff as hard rule 3. It survived because the share-sheet commit explicitly
carved these two file-share paths out and left them alone
(`index.html:5920-5922`: *"File shares (carry card, mastery certificate)
deliberately do NOT route here"*). The carve-out is correct; the code it
carved out was not audited.

Fix is one line, copied verbatim from `carrySave`.

---

### 3. MEDIUM — three share events count intent, not delivery, and one of them says "shared"

The event **body** is honest — that part is clean, see §B below. The event
**names and firing points** are not.

| Site | Event | Fires when |
|---|---|---|
| `:5954` → `:5973` | `sr_share_via{target}` | the anchor's `onclick`, **before** navigation — regardless of whether WhatsApp/X is installed or the compose screen is ever sent |
| `:5993` | `sr_share_via{target:'native'}` | **before** `await navigator.share`; `:5994`'s `catch(e){}` swallows the cancel, so a cancelled native share is counted |
| `:5624` | `sr_drill_shared` | when the debrief's Share button **opens the sheet** — before the user has picked anything at all |
| `:5998` | `sr_share_tapped` | same, and honestly named |
| `:5603` | `sr_badge_shared` | before the certificate share, same cancel-blindness as §2 |

`sr_drill_shared` is the sharp one. Before v2.22.0 it sat immediately next to a
real `navigator.share()` call, so "shared" was at least approximately true. It
now measures "opened a dialog." That is precisely the "3 printed = 3 opened a
print dialog" shape this project already got burned on and wrote into the hard
rules.

No browser reports share completion, so the *signal* cannot be fixed — same
conclusion as the print funnel. But the *name* can, and `sr_drill_shared`'s
meaning changed in a release that shipped four days ago, so there is no
established funnel to protect. `sr_share_via` is brand new in v2.22.0 and could
be `sr_share_target_tapped` at zero cost.

---

### 4. MEDIUM-LOW — clipboard failure is completely silent

`index.html:5977-5990`. Verified live: `navigator.clipboard.writeText` rejected
with `NotAllowedError`, and:

- **no** `sr_share_via{target:'copy'}` event fired (this is the only branch in
  the sheet with no analytics at all — copy failures are invisible in the
  funnel);
- the button label stayed `"Copy link"` — no change of any kind;
- the fallback *did* run — `#shLink` was focused with `selectionStart:0,
  selectionEnd:24` — but nothing tells the user that happened.

The comment says the fallback exists "rather than tapping a button that appears
to do nothing." On the `.sh-row` Copy tile, the field it selects is a separate
element in a row *below* the tiles, so from the user's point of view the button
still appears to do nothing. Wants one line of text or an `aria-live`
announcement, not a redesign.

Clipboard denial is not exotic on the target device — iOS Safari denies
`writeText` outside a trusted gesture, and privacy browsers deny it outright.

---

## What is clean — stated plainly, not padded

### A. Privacy / leak surface — clean, proven both ways

Planted sentinels in every user-entered field the product has, then opened a
real practice share:

```js
data.name='ZZSENTINELNAME'; data.state='TX';
data.contacts=[{name:'ZZSENTINELCONTACT',phone:'555-0000'}];
localStorage.setItem('sr_docs', JSON.stringify({lic:'data:image/png;base64,ZZSENTINELPHOTO'}));
prxShareRun(null);
→ sentinelInSheet: false
```

Traced to source as well: both call sites build their payload from constants
only — `shareAmparo` (`:5996-6000`) uses a hardcoded sentence and hardcoded
URL; `prxShareRun` (`:5619-5626`) uses `_t['prx_lvl'+n]`, the derived
`prRun` grid, the score, and `_t.prx_share_taunt`. **No name, contact, document
photo, or state string reaches any href, any target, or the clipboard.**

### B. `sr_share_via` is honest about what it records

Intercepted `posthog.capture` live:

```json
[["sr_share_via",{"target":"x","lang":"en"}],
 ["sr_share_via",{"target":"fb","lang":"en"}]]
```

Destination and language, nothing else. The message body — which on the
practice share carries the grid, level and score — never appears in any event.
The comment at `:5971-5972` claiming exactly this is accurate.

`sr_drill_shared`/`sr_share_tapped` do carry `{state}`, but that is the
pre-existing 42-event contract, coarse, and not a share-sheet regression.

Also confirmed at `:1620-1631`: `autocapture:false`,
`disable_session_recording:true`, `capture_dead_clicks:false`. Nothing is
scraping the sheet's DOM.

### C. Facebook vs X — the operator's claim is CONFIRMED

Live `href` values off the rendered anchors:

```
fb : https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.amparohq.com
x  : https://x.com/intent/tweet?text=Amparo%20%F0%9F%9A%94%20%F0%9F%98%8C%20Calm%20stop
     %0A%F0%9F%9F%A9%F0%9F%9F%A9%F0%9F%9F%A8%202%2F3%0ADo%20you%20know%20your%20rights
     %20at%20a%20traffic%20stop%3F&url=https%3A%2F%2Fwww.amparohq.com
wa : https://wa.me/?text=<full message + url>
sms: sms:?&body=<full message + url>
```

Facebook's URL carries **only** `u` — the homepage, nothing else. X carries the
full text: level name, the 🟩/🟨 grid, and the score. WhatsApp and SMS the same.

The asymmetry is real and it happens to run in the safe direction — the one
public-broadcast target is the one that carries least. All three text-carrying
targets drop the user into a composer that requires a second, deliberate tap, so
nothing is published silently. The source comment at `:5939-5942` documents this
correctly and warns the next agent not to "fix" it by hunting for a `quote`
param — good; that param was removed by Facebook years ago and adding it back
would be a no-op that *looks* like it works.

### D. CSP — no change needed, and nothing is being silently relied on

Checked against `vercel.json`. All four targets are top-level `<a>` navigations,
not fetches. Nothing in the deployed policy governs link navigation:
`navigate-to` is absent (and is a dead spec), `form-action 'self'` does not
apply to anchors, and `default-src 'self'` does not restrict navigation. No new
script, connect, or img origin is introduced — the Facebook and X marks are
inline `<svg>` elements, so `img-src` is not implicated either.

Supporting headers that do matter and are already correct:
`Referrer-Policy: no-referrer` (Facebook and X learn nothing about the referring
page), `Cross-Origin-Opener-Policy: same-origin`.

Service worker: `sw.js:43-56` bails on anything not same-origin, so the
cross-origin navigations never reach it. `sms:` never does either. No SW change
needed; no cache name change needed (`C='amparo-v3'` unchanged is correct —
navigations are network-first).

### E. `rel` / reverse tabnabbing — correct

All four anchors verified live: `target="_blank"`, `rel="noopener noreferrer"`.

### F. `esc()` usage in the generated innerHTML — correct

The only unescaped interpolations in `:5952-5961` are:

- `href="${x.href}"` — every dynamic component passed through
  `encodeURIComponent` first; verified `/[<>"&]/.test(enc) === false`, so no
  attribute break is reachable;
- `${x.ic}` — the two brand SVGs, developer constants, deliberately raw;
- `shareVia('${x.k}')` — developer constants.

`_shShare.url` and every visible label go through `esc()`.

One latent note, no action needed today: `esc` (`:2899`) escapes `& < > "` but
**not** `'`. That is safe in every current context (all `esc()` output lands in
double-quoted attributes or text nodes), but `onclick="shareVia('${x.k}')"`
would break if `k` ever became dynamic. It shouldn't.

### G. `_shShare` staleness — not a leak

Both `_shShare` and `#shareBody`'s innerHTML survive `shareClose()` — confirmed
(`staleBodyRetained:true`, `staleShShare:"PAYLOAD-A"`). But `shareOpen`
unconditionally reassigns both, verified by reopening with an empty text:

```
leakedOldText:false   waHref:"https://wa.me/?text=https%3A%2F%2Fwww.amparohq.com"
```

The only residue is a practice score sitting URL-encoded in four `href`
attributes of a `display:none` subtree. Session recording and autocapture are
both off, `ovItems()` filters on `offsetParent!==null` so keyboard can't reach
it, and nothing else reads the DOM. Not worth code.

### H. `navigator.share` absent — degrades correctly

With `navigator.share` undefined the "More" tile is simply not rendered:
5 tiles, exactly one `button.sh-t` (`shareCopy`). No dead button, no throw.
This was the whole point of the release and it works.

### I. Overlay accessibility — correct, verified live

With `window.SRMotion` nulled so the `else fin()` path runs:

```
open        → {open:true, focus:"ab-x", inert:true}
afterEscape → {open:false, inert:false, focusRestored:true, focusNow:"on"}
```

Focus enters the dialog, `#appRoot` goes inert, Escape closes, inert is
removed, and focus returns to the exact element that opened it. The new overlay
is correctly wired into the central `OVERLAYS` map (`:6148`).

> An earlier run of mine showed `inert` sticking after close. That was my own
> polluted state — `practiceOverlay` was still open and `ovTop()` correctly
> held inert for it. Re-tested from a clean load; **not a bug.** Recording it
> so the next agent doesn't rediscover the false positive.

### J. Check suites — green at HEAD

```
content verify: PASS  (2477 strings present, 2333 byte-identical)
app-storage-check: PASS (14)   sw-routing-check: PASS (12)
practice-engine-check: PASS (22)
```

### K. `__srClosing` — pre-existing, and I do not think it is a real user risk

Per the testing note, `SRMotion.overlayOut` (`:1468-1483`) latches
`ov.__srClosing = true` and only clears it in `onComplete`. In this preview the
GSAP ticker is frozen so close can never complete — but that is a preview
artefact, identical on untouched overlays.

For a real user backgrounding a tab mid-close: GSAP's ticker resumes on
`visibilitychange` and its default lag smoothing clamps the jump, so the
timeline completes and `fin()` runs. I am **not** counting this as a finding.
The one adjacent real edge — reopening within the 240ms close window makes the
freshly-opened sheet fade back out — is generic to all seven overlays, needs a
sub-quarter-second double tap, and predates this work.

---

## Low / notes

- **`target="_blank"` on the `sms:` anchor** (`:5938`) buys nothing — a custom
  scheme handler does not need a new browsing context — and on desktop it
  leaves an orphan `about:blank` tab. **Unverified on device.** I also could
  not verify the `sms:?&body=` form itself on iOS/Android from here; the
  comment's cross-platform claim is the commonly cited one and I did not find
  cause to dispute it, but nobody has tested it on hardware.
- **The SMS tile renders unconditionally**, including on desktop where it is
  usually dead weight — and, per finding 1, it is occupying one of only three
  fully-visible slots on a phone.
- **`.sh-t` has `:active` and `:focus-visible` but no `:hover`** (`:417-421`).
  No pointer feedback on desktop.
- **Overlay `aria-label` is static bilingual** — `"Share Amparo / Comparte
  Amparo"` (`:1740`) — and does not follow `lang`, so a screen reader reads
  both languages. This is the pre-existing pattern for all seven overlays, not
  new here.
- **The extraction invariant's cost, made concrete.** A root-only share-sheet
  change forced a full `/app` rebuild that renamed **10 hashed chunks**
  (`git diff --stat v2.21.11..HEAD`), so every prepaid `/app` user re-downloads
  the 21-entry precache for a feature `/app` does not have. The 7 new `sh_*`
  keys also shipped, unused, into `app/assets/index-DiPVu8n9.js`. This is the
  "prepaid users re-download each release" objection from the original no-React
  reasoning showing up as a measurable number rather than a prediction.
- **Size delta is fine.** `index.html` 564,234 → 579,677 raw; 152,535 →
  155,349 brotli (+2.8 kB) for the whole share sheet.

---

## Suggested order

1. `.sh-row` wrap (finding 1) — CSS-only, one declaration swap, fixes the
   thing that actually ships broken on every phone.
2. `prxShareCert` AbortError (finding 2) — one line, copied from `carrySave`,
   and it is an honesty violation of a rule this project already wrote down.
3. Rename `sr_drill_shared` (finding 3) — free right now, expensive later.
4. Clipboard failure feedback (finding 4).
