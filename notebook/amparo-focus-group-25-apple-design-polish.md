# Focus group 25 — the apple-design polish pass (v2.26.1 → v2.26.2)

**Scheduled step of the `/amparo-loop`, run standalone.** 2026-08-27. Follows
`amparo-focus-group-23-p0-round.md` (FG23) and
`amparo-focus-group-24-accounts-payments-feedback.md` (FG24). Neither is re-litigated here:
this round's diff touches nine lines of CSS and six function bodies in root `index.html`,
none of which intersect the matcher/swan-gate/supervision/account/payment systems those two
rounds tracked. Where this round's own change happens to touch that ground, it says so and
moves on rather than re-opening it.

**Build under test:** tag `v2.26.2`, commit `980d3d6` on `main` — *"fix: 44px lifeline tap
target + symmetric overlay close animation."* The newly-installed `apple-design` skill's
first pass against the homepage, two claimed fixes: (1) `.ll-contact` (the lifeline/hotline
phone number) grew a `::before` hit-area from a 34px tap target to the page's own 44px
floor; (2) six of nine modal overlays (`pintroOverlay`, `prepOverlay`, `papersOverlay`,
`packZoomOverlay`, `carryOverlay`, `practiceOverlay`) that used to cut instantly on close now
fade out via the same `SRMotion.overlayOut()` GSAP helper the other three (`docOverlay`,
`aboutOverlay`, `shareOverlay`) already used.

**A methodology note this round needs, stated plainly.** This agent's assigned worktree
(`worktree-agent-ace0fcba7cdc8cc8b`, HEAD `a649b15`) sits on an unrelated branch of
outreach-automation work and does not contain `980d3d6` —
`git merge-base --is-ancestor 980d3d6 HEAD` returns false, and `git log` on this worktree
never mentions it. The commit lives on `main`, checked out at this repo's other worktree,
`C:/Users/mfran/Ai-Foundations/Amparo`. Every source citation below was read from that
checkout, not this one; `git show 980d3d6 -- index.html` independently confirmed the diff
against both. Flagging this in the open because it is exactly the class of silent mismatch
this series exists to catch — grepping the wrong tree here would have produced a report
confidently claiming the fix doesn't exist.

**Method.** Every claim checked this session by direct read/grep of `index.html`
(6,636 lines), `vercel.json` (CSP), `CHANGELOG.md`, and, for one comparison, `arena/index.html`.
No live browser session, consistent with FG19–24 precedent — this round leaned on exact
`file:line` citation of CSS rules and function bodies instead. Attorney/lawyer review is
excluded per standing instruction; nothing this round touches is UPL-adjacent.

---

## 0. Verifying the two claims before building on them

| Claim | Verdict | Evidence |
|---|---|---|
| `.ll-contact` "sat at 34px" | **TRUE** | Pre-fix rule, unchanged: `.ll-contact{...min-height:34px;line-height:34px}` (`:403`). |
| "...under this page's own documented 44px floor" | **TRUE** | `:1071`'s own comment — "44px minimum hit areas without changing the visual design" — already governs `.linkbtn`(:1072), `.back`(:1073), `.lang button`(:1074), `.ab-x`(:1075), `.cam-x`(:1076), `.cam-side`(:1077), `.prx-vbtn`/`.prx-hear`(:1082), the mask toggle(:1090). Real, pre-existing convention. |
| Fixed with "the same ::before hit-area trick already used for the practice voice toggles" | **TRUE, exact reuse** | `.prx-vbtn::before,.prx-hear::before{content:"";position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:44px}` (`:1082`) vs. the new `.ll-contact::before{...height:44px}` (`:1087`) — identical shape, target swapped. |
| "6 of 9 modal overlays... cut instantly... 3 already faded" | **TRUE, exact count** | Nine `role="dialog"` overlays exist, no more: `pintroOverlay`(:1804), `prepOverlay`(:1810), `carryOverlay`(:1822), `docOverlay`(:1828), `papersOverlay`(:1842), `packZoomOverlay`(:1857), `aboutOverlay`(:1864), `shareOverlay`(:1889), `practiceOverlay`(:1896). `git show 980d3d6` touches exactly six close functions; `docOverlay`/`aboutOverlay`/`shareOverlay`'s `SRMotion.overlayOut()` calls (`:3384`,`:3390`,`:6404`) predate this commit. |
| "All 6 close functions engage the GSAP path and fall back correctly with SRMotion disabled" | **TRUE** | `SR.overlayOut` (`:1521-1536`) no-ops to a synchronous `done()` whenever `!OK()`, and `OK()` is false whenever GSAP hasn't armed, reduced-motion is set, or the overlay isn't open. All six new call sites share one guard: `if(window.SRMotion&&SRMotion.overlayOut) SRMotion.overlayOut(...,fin); else fin();` — no copy-paste drift. |

All five hold up to a literal read. The CHANGELOG's two side-claims — reduced-motion wiring
and safe-area insets were "already there" — are checked below (golden #4, BS-1): "already
there" turns out to mean different things on different surfaces.

---

## 1. Ten persona reactions

### 🧑 Devin, 16 — TX, Dana's son, the one who'd actually run this flow like a game

He does exactly what a 16-year-old does with a new "Start" button: taps it without reading
the paragraph above it. `onclick="practiceIntroClose();prepOpen()"` (`:3262`) fires both
calls on the same tick. `practiceIntroClose()` kicks off a GSAP timeline on `#pintroOverlay`
that completes at 290ms (card tween 0→220ms, backdrop tween 50→290ms, `:1534-1535`) and
returns immediately — it doesn't wait for its own animation.
`prepOpen()` runs on the very next line and sets `#prepOverlay` to `display:flex` with its
own fade-in. Both overlays share the same base `z-index:95` (`:412`; only `doc`/`carry`/
`share` get bumped to 97, `:421`) and DOM order puts `prepOverlay` after `pintroOverlay`
(`:1810` after `:1804`), so for about a quarter-second he sees the intro card sinking away
*underneath* the prep card rising in — two full-screen backdrops, two blurs, stacked. "You
made the X-button feel like Apple and left the biggest button on the page feeling like a
glitch." He finds the same thing going backward — `prepBack()` at step 0 does
`prepClose(); practiceIntroOpen();` (`:3308`) — and going forward out of prep:
`prepClose(); ph(...); practiceOpen();` (`:3359`). All three transitions in the practice
module's own onboarding chain do it. Before this release none of this was visible, because
open and close were both instant — the new fade is what makes the overlap visible at all.

**Verdict: the animation upgrade itself made his flow worse, not better, on first contact.**
He'd still play it — kids don't bounce off jank the way an adult reviewer does — but it's the
first thing he'd mention if asked.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

Two things, one bad and one genuinely good. The bad: the "Lifelines" carousel's page dots —
`.ll-dot{width:8px;height:8px;...}` (`:408`), `cursor:pointer`, `onclick="llGo(n)"` (`:4297`)
— sit in a 7px-gap row (`.ll-nav{gap:7px}`, `:407`) with no hit-area padding at all. It's the
exact same *category* of miss the CHANGELOG says this release fixed, one component over, in
the same card family. At 200% zoom the dots are easier to see and no easier to hit; a
screen-reader user tabbing through gets `aria-label`s that are correct (`_t.ll_dot`, `:4297`)
but land on an 8×8 target if they switch to touch. The good, and it's real: he traces the
focus-trap/Escape system (`:6604-6662`) against the new fades and it holds. Escape calls
`OVERLAYS[el.id]` — the *same* close function the X button calls (`:6654`), so it inherits
the animation automatically rather than snapping while the mouse path fades. Focus-restore is
gated on the `.open` class actually being removed (`MutationObserver`, `:6632-6648`), which
now only happens in the GSAP `onComplete`, so focus never jumps back to the trigger element
mid-fade. And during Devin's double-overlay overlap, `ovTop()`'s z-index sort correctly hands
Tab-trap and Escape to the *incoming* overlay, not the fading one — so the glitch he'd hit is
visual, not a keyboard trap. "The main app usually breaks my path when it adds motion. This
time it didn't — it just left one target the same size as everything else it used to ship
before it learned better."

**Verdict: no change on redo either way** — the a11y plumbing held, but a tap-target miss is
still a tap-target miss.

### 🧑 Rosa, 44 — GA, Spanish-first, distrusts anything that leaves the device

She checks the fix the way she checks everything: does it change what leaves the phone. The
44px pad itself is CSS — nothing to distrust there, and it's language-agnostic so the ES
build gets it automatically, no parity gap to find. But tapping the number she'd actually
call also fires `phLifelineClick(idx)` → `ph('sr_lifeline_link_clicked',{state:data.state,
name:L.n,type:c.type,lang:lang})` (`:4192-4195`) — a PostHog event, not a local counter. She
reads the analytics section's own comment first: *"NO autocapture, NO session recording... —
those never leave the device"* (`:1651-1652`). That sentence is true for what it names — but
the sentence right below it (`posthog.init(...)`, `:1665`) is a real network call to a
third-party host (`ph.amparohq.com`, proxying PostHog), and the *pageview* plus this *named
click event* absolutely do leave the device. `L.n` is the hotline's own name, not hers — but
for a state where the most relevant lifeline is a DV or immigration-specific line, "which
named hotline this anonymous browser tapped, in which state, in which language" is a real
data point about her, sent at the exact moment she reaches for help. `tel:` itself is honest
— it opens the native dialer and nothing else (`:4176`, confirmed: `{type:'tel',
href:'tel:'+digits}`, `:4183`) — that part she'd trust completely.

**Verdict: conditional.** The dialer promise is kept. The "never leaves the device" comment
is true of session replay and false of this specific tap, and this is the one tap in the
product where that distinction matters most.

### 🧑 Luis, 27 — TX, DACA, older Android, prepaid data, reads every claim literally

Two threads. First, he confirms Rosa's read independently and adds the mechanism: `ph()`
fires unconditionally regardless of network speed, but the *animation* she'd see is
conditional on a CDN script actually finishing first. Second, and this is his own find: the
symmetric close only exists when GSAP has loaded. The script tag is `async`
(`:1195-1197`, `cdnjs.cloudflare.com`), so `SR.arm()` (`:1475-1479`) may not have set
`ARMED=true` yet by the time a fast tapper reaches the practice flow on a slow connection.
Until it does, `OK()` is false and every one of the six new `overlayOut` calls takes the
`else fin()` branch — instant close, exactly like before this release. So the fix this round
shipped is not "closes now fade" — it's "closes now fade, if you're on a connection fast
enough that GSAP wins the race before you tap through." On his prepaid connection, some
sessions get the polish and some don't, unpredictably, and there is no CSS fallback
transition for the no-GSAP path the way there already is for *open* (`:413`,
`animation:camIn .35s`, pure CSS, works with zero JS). "The number you call mid-stop should
be easy to hit — that one's true no matter my signal. The rest of this fix isn't."

**Verdict: conditional-yes on the tap target, unresolved on the animation** — not because it's
wrong, but because whether he gets it at all depends on bars he doesn't control.

### 🧑 Tony, 61 — GA, checks whether it does what it says

He reads the CHANGELOG's list of things the pass "also checked... and found already there":
reduced-motion wiring, compositor-only properties, safe-area insets, focus-trap/Escape,
letter-spacing. He checks each rather than taking the sentence on faith. Reduced-motion: real
— `@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms
!important;...}}` (`:1056-1060`) neuters the CSS `camIn` keyframe globally, and the JS layer
has its own independent gate (`REDUCED`, `:1205`). Letter-spacing: real — large display text
runs tight/negative tracking (`h1{letter-spacing:-.4px}`, `:142`), small uppercase labels run
loose (`.eyebrow{letter-spacing:1.8px}`, `:120`; `.rail-label{letter-spacing:1.4px}`, `:310`)
— a consistent optical-sizing system, not cherry-picked examples. Safe-area insets: **only
half true.** `env(safe-area-inset-*)` appears exactly five times in the file, all inside
`.app`'s own padding and the `#camOverlay` capture flow (`:1066-1070`). The shared rule for
all nine `role="dialog"` overlays — the ones this exact commit edited — is flat
`padding:20px` (`:412`), no `env()` anywhere in it. `position:fixed;inset:0` doesn't inherit
an ancestor's padding, so the overlay this release touched is not one of the surfaces where
the "already there" claim is actually true. "Three of four checked out on the first read.
The fourth checked out for the page the last audit covered, not for the page this one did."

**Verdict: no on the claim, not on the fix.** The two shipped changes are real; the
inventory of what else was "checked" needed one more grep before it went in the changelog.

### 🧑 Dana, 52 — TX, runs drills with her son, checks that things actually work on her phone

She runs the intro→prep→practice sequence the way she runs everything with her kid: start to
finish, out loud, on her own iPhone. She hits Devin's overlap exactly where he found it — "it
looked like the screen hiccuped" — without knowing the mechanism, just that it wasn't smooth.
Separately, she holds her phone in landscape while reading a wider practice card and notices
the overlay's card sits close enough to the rounded display corner that she'd have said
something even before Tony named the CSS reason. She doesn't care that `env()` is missing —
she cares that on her actual device, in one orientation, the "polished" version feels less
finished than the plain rectangle it replaced.

**Verdict: yes on the phone-number fix — that's simply bigger and easier now.** Conditional on
the rest: "fix the hiccup before you tell people it's smoother."

### 🧑 Marcus, 19 — NY, broke, shares things that look sharp

His bar is simple: would he screenshot it. The tap-target fix is invisible by design (the
whole point is the number didn't get bigger-*looking*), so there's nothing to show off there
— fine, that was never going to be his story. The overlay fades, when they work cleanly
(`docOverlay`/`aboutOverlay`/`shareOverlay`, unchanged this round, and `carryOverlay`/
`packZoomOverlay`/`papersOverlay` in isolation), genuinely read as more expensive than before
— he'd have said so. Then he does what Devin did — taps through the practice intro fast — and
gets the double-modal flash. "That's the one thing in this whole update I'd actually clip and
send to a group chat, and not because it's good." His read is the commercial version of
Devin's UX one: the bug is *findable in one normal, fast tap-through*, which is exactly the
speed he and his friends use anything at.

**Verdict: unconditional yes on everything that doesn't have the flash; the flash is the kind
of clip that undoes goodwill from six fixes at once.**

### 🧑 Wes, 38 — Brooklyn, does not drive, ADHD, finds the seams by entering sideways

He doesn't take the front door into practice — he opens `packZoomOverlay` from the pack
preview, closes it, opens `carryOverlay`, closes it, jumps to `papersOverlay`, and only then
circles back to intro→prep→practice, out of the order any spec assumes. None of the
individually-fixed overlays break under that order — each one's `overlayOut` is self-
contained and the `__srClosing` guard (`:1524`) stops a double-fire if he mashes a close
button. What he notices instead is the *shape* of the miss: three separate function bodies
(`practiceIntroClose`, `prepClose`, `practiceClose`) each independently got the identical
five-line patch, copy-pasted, and the one place they interact with each other — the two
existing "close this, then immediately open that" call sites plus one more — is exactly where
nobody updated the *caller*. "You patched the six leaves and missed that three of them are
also branches other leaves hang off of." He'd also point out the `OVERLAYS` object's own
comment still says "seven close functions" (`:6602`) over a nine-entry object — dev-facing,
harmless, but the kind of stale count that's usually a sign nobody re-read the block after
the last two overlays joined it.

**Verdict: yes — held is still held, and he'd rather report the seam than pretend it isn't
there.**

### 🧑 Keisha, 34 — Atlanta, rideshare, thirty seconds between fares

She doesn't read any of the above — she just uses the product at the speed she uses
everything. Before this release, every overlay closed the instant she tapped X: zero cost.
Now every one of the nine costs 290ms on the way out (`SR.overlayOut`'s timeline: card tween
ends 220ms, backdrop tween ends 290ms, `:1534-1535`) on top of whatever it already cost on
the way in. She
flips through three pack pages in `packZoomOverlay` to compare states, backs out of
`papersOverlay`, and reopens `carryOverlay` — in the old build that's four instant snaps; in
the new one it's four ~290ms delays, over a second of pure animation time added to
a session she budgets in seconds, not minutes. Nothing is broken — every fade is smooth and
every fallback correct — it's simply not free, and it's the first product change in this
series that makes her specific persona *slower* in exchange for making it feel nicer to
someone with more time to notice.

**Verdict: no complaint about the fix — a real question about whether "feels expensive" and
"is fast" got weighed against each other for the cohort with the least patience in the room.**

### 🧑 Nia, 41 — NY, PTSD, motion-sensitive, avoids the simulation

Her first move on any product is the OS reduced-motion toggle, set before she opens the tab.
Under that setting, every one of tonight's six new fades correctly no-ops to an instant close
(`OK()` false because `REDUCED` is true, `:1204-1208`) — the product behaves exactly as it
did before this release, which is exactly what she wants. Her question is about *when* that
setting is read: `var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')`
followed by `var REDUCED = !!(mqReduce && mqReduce.matches)` (`:1204-1205`) — a single read,
once, at script-parse time. There is no `mqReduce.addEventListener('change', ...)` anywhere
in the file (grep for `matchMedia`/`onchange`/`addEventListener\('change'` returns nothing
of the kind). If she opens the tab with motion already off, she's fully covered. But the
moment she'd most plausibly reach for that switch is *mid-session* — if a scenario starts to
feel like too much and she goes looking for the setting that turns the movement off — and the
page has no way to notice she changed it without a reload. "The fix is right for the version
of me who plans ahead. I'm not always that version."

**Verdict: conditional, and this is the sharpest of her recurring notes** — not because
anything shipped wrong, but because the one moment this matters most is the one moment the
current design can't respond to.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The close-animation fix regresses the practice module's own onboarding chain — three transitions inside intro→prep→practice now show two full-screen overlays at once, on the exact flow the CHANGELOG says got smoother

**Evidence.** Three call sites chain a close directly into an open on the same tick, with no
wait for the close's own animation: `onclick="practiceIntroClose();prepOpen()"` (`:3262`,
the intro's own "Start" button), `prepClose(); practiceIntroOpen();` inside `prepBack()`
(`:3308`), and `prepClose(); ph('sr_prep_recall_done'); practiceOpen();` inside the recall
step's completion handler (`:3359`). `pintroOverlay`, `prepOverlay`, and `practiceOverlay`
all share the base `z-index:95` (`:412`) — only `doc`/`carry`/`share` are bumped to 97
(`:421`), specifically because *those* are meant to stack on top of another open overlay.
Before `980d3d6`, none of this was visible: both open and close were instant snaps, so
swapping overlays looked identical either way. After it, `practiceIntroClose()` starts a
290ms GSAP fade-out timeline and returns immediately (`fin` is passed as an async callback,
not awaited), and the very next line's `Open()` call renders a second full-viewport backdrop
(`rgba(9,14,26,.6)` + `blur(4px)`, `:412`) with its own fade-in directly on top of the first
one's fade-out. This is confined *exactly* to the practice module: grepping every
close-function name against every open-function name across the file turns up these three
sites and no others — `papersOverlay`, `packZoomOverlay`, and `carryOverlay` are never
chained into another overlay's open.

**Impact.** Highest of the round, for three reasons together. It is a regression — the
pre-fix instant-snap behavior didn't have this artifact, so the fix that was meant to remove
one seam (asymmetric open/close) introduced a different one (two overlays visible
simultaneously) in the exact three-step flow the task brief names as the product's "police-
stop rehearsal engine." It is total within its scope: 100% of the practice module's own
onboarding transitions show it, not an edge case. And it is invisible to exactly the checks
the commit cites — "no console errors" and "new CSS parses" are true and say nothing about
what two GSAP timelines running on two different full-screen elements look like layered.
Notably, it is *motion-conditional in the wrong direction*: reduced-motion users (Nia) and
users on a connection slow enough that GSAP hasn't armed yet (Luis) never see it, because
their closes are still instant — the glitch is exclusive to users experiencing the polish
this release was written to deliver.

**Cheapest fix that holds:** give the three close functions an optional callback fired from
inside their own `fin`, matching the shape they already use — e.g.
`function practiceIntroClose(next){ const o=...; const fin=()=>{ o.classList.remove('open');
if(next) next(); }; ... }` — and change the three call sites to
`practiceIntroClose(prepOpen)`, `prepClose(practiceIntroOpen)`, `prepClose(practiceOpen)` (a
callback already flows through `ph(...)` there too, so it moves inside `next`). Three
one-line signature changes, three one-line call-site edits, no new architecture — the pattern
the codebase already uses for `done`/`fin` everywhere else in this same commit.

### 2. The lifeline carousel's own page dots are the same sub-44px miss the commit just fixed one component over

**Evidence.** `.ll-dot{width:8px;height:8px;border-radius:50%;...cursor:pointer;...}`
(`:408`), rendered with `onclick="llGo(${n})"` inside `.ll-nav{gap:7px}` (`:4297`, `:407`) —
an interactive, functional carousel control (not a decorative marker; compare `.cam-dots
span`, `.sm-legend i`, `.lawcheck .dot`, `.tdots i`, none of which carry an `onclick` and are
correctly excluded from the 44px system). No `::before` hit-area, no padding, in the same
`.ll-*` card family whose `.ll-contact` sibling three lines above it just got exactly this
treatment in this exact commit.

**Impact.** Not catastrophic — the carousel is `scroll-snap`-based (`:395`), so swiping past
a missed dot still reaches every card — but it is the plainest evidence available that the
apple-design pass fixed the one tap target it went looking for rather than sweeping the
category. Sub-44px targets are Omar's and Keisha's shared failure mode (precision and speed,
respectively), and this one sits directly beside the fix that was supposed to set the
standard.

**Cheapest fix that holds:** the identical one-line pattern already used twice in this file —
`.ll-dot{position:relative}` / `.ll-dot::before{content:"";position:absolute;top:50%;
left:50%;transform:translate(-50%,-50%);width:44px;height:44px}` (circular target needs
centering on both axes, unlike the row-shaped `.ll-contact`/`.prx-vbtn` pattern). One rule.

### 3. The single highest-stakes tap in the product — now easier to hit — also fires a third-party analytics event, on the exact claim that "nothing leaves the device"

**Evidence.** `phLifelineClick(idx)` (`:4192-4196`) runs on every `.ll-contact` tap and calls
`ph('sr_lifeline_link_clicked',{state:data.state,name:L.n,type:c.type,lang:lang})`. `ph()` is
PostHog (`posthog.init(...)`, `:1665`, proxied through `ph.amparohq.com`, CSP-allowed in
`vercel.json:9`), a real network call to a third party, not a local counter. The section's own
comment two lines above the init call — *"NO autocapture, NO session recording... — those
never leave the device"* (`:1651-1652`) — is true of the things it names and silent about
custom named events and pageviews, both of which do leave the device by design (that's the
whole point of the analytics layer, stated honestly a few lines later: *"Counts events...
so usage can be proven to reviewers and partners"*, `:1650`). `person_profiles:'identified_
only'` (`:1684`) and zero `identify(` call sites (grep, this session) mean the event is not
tied to a durable identity — a real mitigation, and worth stating plainly. What is not
mitigated: `L.n`, the specific hotline's name, travels with the state and language at the
exact moment a user reaches for it. **RECON, not asserted:** whether PostHog's IP-geolocation
enrichment or IP retention is enabled at the org level is a dashboard setting, not visible
in this repo — the same category of open question FG24 flagged for Sentry.

**Impact.** This is the one tap the commit itself calls "the highest-stakes tap target in the
product." Rosa and Luis are both defined in `.focus-group/members.md` primarily by this exact
axis — what leaves the device, read literally. Nothing here is a fabrication on the scale of
FG23/24's UI-copy findings (this is a code comment, never shown to a user, and the mitigations
that exist are real), but it's precisely the sentence this specific pair of personas would
check first, on precisely the tap this release drew a circle around.

**Cheapest fix that holds:** either drop the event (the state/lang/type breakdown is probably
gettable from the surrounding `sr_lifelines_tab` and pageview data already, per the comment at
`:4186-4188` noting this was "the only Lifelines interaction that wasn't tracked" — it may not
need to be), or narrow the comment: the "never leaves the device" sentence should say what it
actually covers (session content, contacts, documents) rather than reading as a blanket
promise a literal reader would apply to every analytics call in the file.

### 4. "Safe-area insets... already there" is true for one surface and not for the one this release edited

**Evidence.** `env(safe-area-inset-*)` appears exactly five times in the file, all inside
`.app`'s own padding and the `#camOverlay` capture flow (`:1066-1070`). The shared base rule
for all nine `role="dialog"` overlays — `#aboutOverlay,#practiceOverlay,#docOverlay,
#prepOverlay,#pintroOverlay,#carryOverlay,#papersOverlay,#shareOverlay,#packZoomOverlay{
position:fixed;inset:0;...padding:20px}` (`:412`) — has no `env()` call anywhere in it.
`position:fixed;inset:0` does not inherit an ancestor's padding, so `.app`'s safe-area
handling provides no protection to these nine elements regardless of where they sit in the
DOM. On a device with rounded corners or a notch, in landscape especially, overlay content
can sit as close as 20px to geometry the rest of the page already accounts for.

**Impact.** Moderate rather than severe — device- and orientation-dependent, and centered
flex layout (`align-items:center;justify-content:center`) limits how often content actually
reaches the edge. But it's a precise instance of the same pattern as golden #3: a true-sounding
inventory claim in the CHANGELOG ("already there") that holds for the surface the *previous*
pass covered and hasn't been re-checked against the surface *this* pass edited.

**Cheapest fix that holds:** add `padding:max(20px, env(safe-area-inset-top))
max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom))
max(20px, env(safe-area-inset-left))` to the shared nine-overlay rule at `:412` — one
declaration, same `max()` pattern already used four times in `.app`/`.cam-*` (`:1066-1070`),
no per-overlay changes needed.

### 5. Nothing catches this class of gap before it ships — three separate near-identical patches this round, one systematic sweep, zero times

**Evidence.** Goldens #1, #2, and #4 are not three unrelated bugs; they're the same shape
three times. #2 is the 44px convention (`:1071`) applied everywhere except the one component
adjacent to the fix. #4 is the safe-area convention (`:1066-1070`) applied everywhere except
the nine overlays the fix touched. #1 is the `SRMotion.overlayOut` pattern applied
individually, six times, by copy-paste (`:3270`,`:3285`,`:3911`,`:4230`,`:5856`,`:6280` —
each an identical five-line block), with no check of what happens where two of those six
calls sit next to each other in the call graph. Root `index.html` has no build step by
design (`package.json:4` — "root index.html has no build step"), but the repo already has
precedent for small, targeted Node check scripts outside a build pipeline: `tools/
sw-routing-check.mjs` exists today for exactly this purpose on a different concern.

**Impact.** Structural rather than loud — this is the round's process finding, in FG24's
own tradition (its golden #1 made the same point about a changelog claim broader than its
sweep). Each individual fix this round was correct and minimal. What's missing is anything
that would have caught the sibling gap at the time of the fix rather than three release cycles
from now, when someone adds a tenth overlay or an eleventh small tap target and repeats the
pattern a fourth time.

**Cheapest fix that holds:** one script in the shape of `sw-routing-check.mjs` — regex over
`index.html` for (a) every `onclick`-bearing element under a certain pixel footprint without
a nearby `::before`/`min-height:44px` rule, and (b) every function assigned into the
`OVERLAYS` object whose body doesn't contain `SRMotion.overlayOut`. Run by hand before a
design-pass commit, not wired into anything — matches the size of the problem.

---

## 3. What must change in the practice modules specifically

Scoped to `pintroOverlay` → `prepOverlay` → `practiceOverlay`, the rehearsal engine embedded
in the homepage (distinct from the standalone `/arena` app FG22–24 covered — see BS-3 below).

1. **Fix the three chained close→open call sites** (`:3262`, `:3308`, `:3359`) — golden #1 in
   full. This is the one item on this list that is a real behavior change, not a
   confirmation.
2. **Do not regress the cleanup ordering already correct in `practiceClose()`.**
   `clearTimeout(prxIdleT); prxIdleN=0; prxRecCancel(); prxDropLast();
   if(prxAudio){...prxAudio.pause()...}; if(prxTTS){...speechSynthesis.cancel()...}`
   (`:6274-6277`) all run *before* the fade starts, not inside `fin`. The idle timer,
   any in-progress recording, and any officer audio are all stopped the instant the user
   commits to closing, not 290ms later while the overlay visually lingers. Correct today;
   whoever fixes item 1 should keep this ordering exactly as-is.
3. **Do not regress the focus-restore/Escape-retarget timing either.** Both are already
   correctly gated on the animation's actual completion (`MutationObserver` on the `.open`
   class, `:6630-6648`) rather than on the click that started the close. Verified holding even
   through the golden #1 overlap window — `ovTop()`'s z-index sort hands keyboard control to
   whichever overlay is topmost, which during the overlap is correctly the incoming one.
4. **Minor, dev-facing:** the `OVERLAYS` object's leading comment still says "seven close
   functions" (`:6602`) over what is now a nine-entry object (`:6604-6609`). Harmless today;
   worth a one-word fix the next time that block is touched so it doesn't mislead the next
   person who reads the comment before the code.

---

## 4. Blind-spot questions a top UX researcher would ask, not raised by the ten personas above on their own

**BS-1. Reduced-motion is read once, at script load — what happens to the user who reaches
for that setting mid-session, which is the moment it matters most?** `REDUCED` (`:1205`) is
set from a single `matchMedia(...).matches` read at parse time; grep for `addEventListener
\('change'` / `.onchange` / any second `matchMedia` call across the file returns nothing —
there is no listener that would let the page notice the OS preference change without a
reload. Nia's read above states the user story; this is the general form of it: any user who
opens the tab with standard settings and only *then* decides mid-scenario that the motion is
too much has no in-session way to get the calmer version of the product. The fix is a few
lines (`mqReduce.addEventListener('change', e => { REDUCED = e.matches; })`, with `ARMED`
allowed to un-set itself too) but the question worth deciding first is a product one: should
a distress signal this close to the practice engine ever require a page reload to act on?

**BS-2. The fix that was supposed to make closing feel as expensive as opening also made it
*take* as long as opening — was that cost weighed against the persona the product's own
"thirty seconds between fares" framing was built around?** Keisha's read above: every close
went from 0ms to a 290ms GSAP timeline (`SR.overlayOut`'s own tween durations, `:1534-1535`), on top of
whatever the open side already cost. A rushed user working through several overlays in one
session (comparing pack pages, checking the carry card, glancing at papers) now accumulates
real, felt latency that didn't exist last release. Nothing here argues the fades are wrong —
only that "feels fluid" and "is fast" are different goals, and this round optimized visibly
for the first without checking the second against the persona for whom seconds are the whole
product.

**BS-3. This pass was scoped to "the homepage" — does `arena/index.html`, the standalone
Practice Arena FG22–24 already found drifting independently from root on matcher and crisis
logic, now also carry an unaudited, unfixed version of the exact asymmetry this release just
spent a commit fixing?** Grepped this session: `arena/index.html` contains zero instances of
`SRMotion`, and exactly one narrow `@media (prefers-reduced-motion: reduce)` rule scoped to a
single animation class (`.ht`, `:436`) rather than a systemic gate like root's `OK()`. Its own
modal shell (`.modal{...animation:rise .3s ease both;...}`, `:383`) is CSS-only on open, with
no equivalent close treatment visible from this pass. **RECON, not asserted** — this session
did not trace arena's actual close functions to confirm the asymmetry, only confirmed the
fix infrastructure that would prevent it is entirely absent. If root's motion polish and
arena's stay on separate, uncoordinated tracks the way their matchers and crisis nets already
do (FG23 §3 item 4), that's a second instance of the same structural pattern, on a different
axis.

**BS-4. The GSAP CDN is `async` and unawaited — so the symmetric close this release shipped
is available only to users whose connection wins a race they can't see. Should a change whose
entire premise is "feels expensive" ever be allowed to correlate with bandwidth?** Luis's read
above, generalized: `OK()` requires `ARMED`, which requires the `cdnjs.cloudflare.com` script
to have both loaded and executed before a user reaches for a close button (`:1195-1197`,
`:1475-1479`). The *open* side has a pure-CSS fallback (`animation:camIn`, `:413`) that works
with zero JS, so open has always been consistent regardless of connection quality. Close does
not have an equivalent CSS transition for the no-GSAP path — it is either the full GSAP fade
or an instant snap, with nothing in between. For a product whose own stated audience includes
prepaid and older-Android users, is an experience that degrades unpredictably by connection
speed — rather than consistently by explicit preference, the way reduced-motion already does
it — the right shape for this specific fix?

**BS-5. The commit's own verification language — "no console errors, new CSS parses, all 6
close functions engage the GSAP path and fall back correctly" — describes exactly the kind of
check that cannot catch golden #1. What does "verified" mean for a change whose entire content
is what something looks like while it's happening?** Every claim in that sentence is true and
none of them requires watching two overlays exist on screen at the same time, which is the
only way golden #1 is visible at all — it produces no console error, breaks no fallback path,
and both stylesheets parse fine independently. Motion and layering bugs are, by nature, only
caught by someone watching the transition happen end-to-end along a realistic path (Devin's
fast first tap-through; Wes's out-of-order entry), not by the categories of check this commit
message lists. Is there a lightweight standing habit — even just "click through the three
onboarding transitions once, watching" — that belongs next to "no console errors" whenever a
commit touches anything with a duration on it?

---

## 5. Group read

**On the two shipped claims: both true, precisely as described, no exaggeration found in
either.** That's worth stating as plainly as the findings above — this is the first round in
the series where the header commit message survives a full literal read with zero
corrections needed to its own two bullet points.

**On what surrounds them: the same shape, three times.** Every one of goldens #1, #2, and #4
is a correct, narrow fix that stopped exactly at the edge of what it was asked to fix. The
44px convention, the safe-area convention, and the `overlayOut` pattern all already existed
in the file before this commit — none of them were invented this round, and none of them
were swept this round either. Golden #5 is the name for that: the product has good
conventions and no mechanism that checks a new component against them before it ships.

**Highest-leverage fix, this round's subject.** Golden #1 — it's the only regression in the
set (the product was arguably more consistent, if less pretty, before this commit, on this
one narrow question), it's total within the exact flow the task brief names as the
rehearsal engine, and its fix is three one-line signature changes using a pattern the
commit's own six edits already established.

**Highest-leverage fix, whole product, still unchanged from FG23/FG24.** Not re-verified this
round — out of scope for a source-only, CSS/motion-focused pass — but nothing here touches or
supersedes it.

**Who this round doesn't reach.** Ana, Marisol, and Ray are absent from this panel by design,
not oversight: none of tonight's findings are state-content, payment-trail, or
audience-boundary questions — the axes those three personas exist to represent. Their seats
are exactly where FG22/23 left them.

---

## 6. Verification log

- Read/grepped this session, main checkout (`C:/Users/mfran/Ai-Foundations/Amparo`, `main`
  @ `980d3d6`/`v2.26.2`): `index.html` in full (6,636 lines) via targeted offsets covering
  the CSS tap-target system (`:395-421`,`:1056-1094`), the `SRMotion` module in full
  (`:1198-1647`), the analytics init block (`:1649-1693`), all nine overlay declarations
  (`:1804-1896`), every close/open function touched by `980d3d6` plus their call sites
  (`:3253-3390`,`:3893-3920`,`:4175-4297`,`:4207-4232`,`:5826-5860`,`:6249-6281`), and the
  overlay accessibility system in full (`:6598-6662`); `vercel.json` in full (CSP);
  `CHANGELOG.md` v2.26.2 entry; `package.json`; `tools/*.mjs` listing. `git show 980d3d6 --
  index.html` read in full as the ground truth for the diff. `arena/index.html` grepped
  (not read in full) for `SRMotion`/`44px`/`prefers-reduced-motion` as a comparison point
  for BS-3.
- Read for context, this worktree: `.focus-group/members.md` (all 13 personas),
  `notebook/amparo-focus-group-23-p0-round.md`, `notebook/amparo-focus-group-
  24-accounts-payments-feedback.md`.
- Grep-negatives (absence checked, not assumed): `addEventListener('change'`/`.onchange`
  bound to `mqReduce` = 0; a second `matchMedia` call = 0; `identify(` in the analytics
  block = 0; a CSS close-transition fallback for the no-GSAP path = 0; any overlay pair
  besides pintro/prep/practice chaining a close directly into another overlay's open = 0.
- **Unverified / RECON:** whether PostHog's org-level settings retain or geolocate the IP
  behind `sr_lifeline_link_clicked` (dashboard setting, not in this repo — same category FG24
  flagged for Sentry); whether `arena/index.html`'s modal-close functions actually exhibit the
  asymmetry BS-3 infers from the absence of `SRMotion` there, versus some other mechanism this
  session didn't trace; live-device confirmation of golden #4's landscape/notch claim (argued
  from CSS, not observed on hardware).
- Excluded per standing instruction: generic attorney-review findings. Nothing this round
  surfaced is UPL-adjacent; no state-law content or officer/attorney dialogue was drafted
  anywhere in this report.

## 7. Signature

Ten personas from `.focus-group/members.md`: Devin, Omar, Rosa, Luis, Tony, Dana, Marcus,
Wes, Keisha, Nia — spanning language (Rosa, Spanish-first), documentation status (Luis,
DACA; Rosa, mixed-status household), device/budget (Marcus, broke; Luis, older Android/
prepaid; Keisha, no printer/rushed), driver vs. non-driver (Wes, non-driver; Devin, learner),
prior-trauma (Nia, PTSD), and disability (Omar, low vision/screen reader). Every `file:line`
in this report was opened this session, from the checkout that actually has `v2.26.2`. Five
goldens, four practice-module items, five blind spots. Attorney/lawyer review excluded per
standing instruction throughout.
