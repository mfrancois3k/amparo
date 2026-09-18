# Focus group 29 — the locked design system bans the motion it ships in the same commit, and the Spanish half of the site got none of it

**Standalone run, 2026-09-18.** Follows `amparo-focus-group-27-offline-lawwatch.md` (FG27)
and `amparo-focus-group-28-orgs-trust.md` (FG28). Neither is re-litigated — FG27's five
goldens (the "checked" receipt, `sw-routing-check` unwired, two Panic HUDs, the cite-dialect
mismatch, the self-mutating gap test) and FG28's five (the 230-vs-184 trust-page number, the
unbuilt org deliverables, the sitemap/CHANGELOG mismatch, the privacy-story disagreement, the
three-different coverage sentences) are not re-counted. This file checks only the scroll-reveal
feature and its accompanying design-system commit, against the tree as it stands today.
Attorney/lawyer review is excluded as a finding per standing instruction.

**Build under test.** `main` @ `bc97671` (2026-09-18, *"feat(rights): scroll-reveal animation
on rights hub + all 52 state pages"*), the tip of the v2.30.0 tag's lineage. Working tree carries
only unrelated pre-existing modifications (`CHANGELOG.md`, `notebook/amparo-version-history.md`);
nothing touching this commit's own files is uncommitted.

**Method.** Direct read/grep only, no live browser (FG19–28 precedent). Read in full:
`rights/index.html`, `rights/ga/index.html`, `rights/al/index.html`, `rights/ny/index.html`,
`design-system/amparo/MASTER.md`. Read by targeted grep across all 53 English `rights/`
files and all 53 Spanish `derechos/` files (reveal-class counts, guard-CSS presence, script
hashes), `arena/index.html` (reveal/IntersectionObserver presence), `app-src/package.json`
and `app-src/src/**` (framer-motion install vs. usage), `CHANGELOG.md` and
`notebook/amparo-version-history.md` (v2.30.0 entries), `.claude/skills/ui-ux-pro-max/data/motion.csv`.

**Seating (ten of thirteen in `.focus-group/members.md`).** Spanish-first, distrusts anything
that separates languages → Rosa (GA); parent/buyer, the printable-glovebox use case → Dana (TX);
retiree, distrusts unearned confidence and manufactured urgency → Tony (GA); federal-only-state
honesty, her own page carries the disclaimer this round touches → Ana (AZ); DACA/prepaid,
whatever ships to `/app` he can't reach anyway → Luis (TX); broke, distrusts data collection,
notices "sharp" visuals → Marcus (NY); rideshare, thirty seconds between fares → Keisha
(Atlanta); PTSD, sensitive to anything that moves without being asked → Nia (NY); non-driver,
enters everything sideways and compares pages against each other → Wes (Brooklyn); low-vision
screen reader user → Omar (Phoenix). **Not seated this round:** Marcus's usual budget/voice-data
lens is repurposed here for privacy-of-motion instead; Devin, Ray, Marisol — this window's diff
(motion only, on the English rights pages) doesn't touch teen-practice, firearm, or
Spanish-precision territory closely enough to earn a fresh seat over Rosa, who already covers
the Spanish axis for this specific finding.

---

## 0. What actually changed, verified

| Claim (commit message / CHANGELOG v2.30.0) | Verified | Where |
|---|---|---|
| Every section of the rights hub + all 52 state pages fades/lifts on scroll except the hero | TRUE for the 53 English pages | `rights/index.html:49-53`, identical CSS block confirmed byte-identical across all 52 state files (script tail `md5sum` = 1 unique hash across 52 files) |
| One-shot, no re-trigger scrolling back up | TRUE — `io.unobserve(e.target)` immediately after `.add('in')`, every file | `rights/ga/index.html:70` |
| `prefers-reduced-motion` shows content instantly, no transition | TRUE, present in all 52 state files + hub | grep `prefers-reduced-motion` = 52/52 + hub |
| `@media print` forces full visibility | TRUE, present in all 52 state files + hub | grep `@media print` = 52/52 + hub |
| `:focus-within` reveals before a keyboard user tabs into it | TRUE, present in all 52 state files + hub | grep `focus-within` = 52/52 + hub |
| `.js` (and all hiding) only applied when `IntersectionObserver` exists | TRUE — one-line head script gates the class add | `rights/ga/index.html:6` |
| "The skill correctly classified this site as a low-motion, high-trust Accessible & Ethical pattern" (CHANGELOG v2.30.0) | The pattern name is real, but its own anti-pattern list contradicts what shipped — see golden #1 | `design-system/amparo/MASTER.md:189` |
| **Not claimed anywhere in the commit, CHANGELOG, or version-history entry: whether `/derechos/` (the Spanish mirror) received the same treatment** | It did not — 0 of 52 Spanish state pages and the Spanish hub carry any `.reveal` class, guard CSS, or script | see golden #2 |
| `framer-motion` added "for the React app going forward" | Installed, zero import sites | `app-src/package.json:21`; `grep -rc framer-motion app-src/src` = 0 everywhere |

---

## 1. Ten persona reactions

### 🧑 Rosa, 44 — GA, Spanish-first, house cleaner, distrusts anything that separates languages

I opened my own page — `derechos/ga/` — after reading the English one, because that is how I
check whether something is really for me. Nothing moves. No fade, no lift, and the page's own
`<script>` tags for `.js`/`IntersectionObserver` simply aren't there (`derechos/ga/index.html`,
full read: zero instances of `class="reveal"`, zero `IntersectionObserver`, `lang="es"`, real
translated content — not a stub). I'm not asking for the motion; I don't care about it either
way. What I notice is that when this product ships something new, it ships it to English first
and Spanish gets nothing, again, with no note anywhere saying "coming to Spanish next." That's
the same complaint I'd have whether the feature was good or bad.

### 🧑 Dana, 52 — TX suburb, the parent who prints the card for the glovebox

The print guard is real and it's exactly right: `@media print{.reveal{opacity:1!important;
transform:none!important}}` (`rights/ga/index.html:53`) means if I hit Ctrl+P the instant the
page loads — before any scroll, before the reveal script even runs — everything still prints.
I checked that logic against the CSS, not just the claim, and it holds. Where I'd ask a
question: the whole card's content on my son's page is ONE `<div class="reveal">`
(`rights/ny/index.html:62` — the entire seven-rule list plus the CTA is a single observed
element), not "sections" the way the commit message describes. For the screen experience that
means the whole card snaps in as one block partway down the scroll, not rule-by-rule. Harmless
for print, but it's not the granular reveal the words "every section" led me to picture.

### 🧑 Tony, 61 — GA, retired postal worker, distrusts unearned confidence

I read `design-system/amparo/MASTER.md` because the CHANGELOG made a point of saying it was
generated and locked the same day as this feature, specifically to keep the site's "low-motion,
high-trust" character. Its own Anti-Patterns list says, in plain text: **"❌ Motion effects"**
(`design-system/amparo/MASTER.md:189`), right next to "❌ Ornate design" and "❌ AI purple/pink
gradients." The commit that generated this file, in the same breath, shipped a fade-and-lift
transform/opacity animation onto every section of 53 pages (`rights/ga/index.html:49-53`).
That's not a subtle drift — it's a document telling the product not to do the thing it just did,
written and committed in the same twenty minutes (`MASTER.md:10` generated 05:13:17; commit
`bc97671` at 05:44:44). I don't distrust the animation. I distrust a "locked" rulebook that
contradicts itself before its ink is dry.

### 🧑 Ana, 31 — Phoenix AZ, US citizen, wants her state framed honestly

Arizona is one of the 48 unverified-state pages, so my page carries the disclaimer note —
*"Arizona's own rules are checked against the statute text, not yet reviewed by a
Arizona-licensed attorney"* — and that note is not its own element. It's the first child inside
the exact same `<div class="reveal">` that also holds the entire rule list and the CTA button
(same structure as `rights/al/index.html:62`, confirmed for my own state's file). Before this
commit, that sentence was just always on the page. Now it starts at `opacity:0`, waits for me to
scroll roughly half a screen further, and only then appears — bundled with, and no more
prominent than, the CTA button below it. FG27's golden #1 asked this product to make the
verification-status language *more* visible, not gate it behind motion. This commit didn't touch
the wording, but it did change *when* the sentence is legible, and that's a step in the wrong
direction for the one sentence on the page that matters most on an unverified state.

### 🧑 Luis, 27 — TX, DACA, older Android, prepaid data, distrusts anything cloud

My own state (TX) is verified, so my page has no disclaimer note to worry about. What I noticed
instead: `app-src/package.json:21` now lists `framer-motion` — installed, `^13.4.0` — and it is
imported by exactly zero files in `app-src/src` (checked directly, not assumed). That's the
React app FG27 already found nobody can reach from any live page (`href="/app"` count = 0
outside `app-src/`). So the money and the bytes went into installing an animation library for
the one surface I still can't get to, in the same release that shipped real, working motion to
the pages I actually land on. If `/app` is ever going to matter, I'd rather the investment be
"make it reachable" before "give it a motion library it doesn't use yet."

### 🧑 Marcus, 19 — NY, broke college student, distrusts apps that phone home

My first question with anything that watches scroll position is always "is this being counted
somewhere." I grepped for it directly: zero instances of `posthog`, `analytics`, or `gtag`
anywhere in `rights/index.html`, `rights/ga/index.html`, or `rights/al/index.html`. The
`IntersectionObserver` here only ever toggles a local CSS class — it doesn't call anything, log
anything, or send anything. That's the right way to build a scroll effect on a page like this,
and I'd rather this be true than assumed. Separate note, not a complaint: the fade genuinely
looks sharp — the kind of small polish that makes a free legal page look like somebody's actual
job, not a template. That matters more to a sixteen-year-old deciding whether to trust it than
the legal reasoning does.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, thirty seconds between fares

I timed what this costs someone in my position, not just whether it's "pretty." The transition
is `.5s ease-out` (`rights/ga/index.html:49`) on both opacity and transform. That means every
section — the whole rule block, the footer — takes up to half a second after it crosses 15% into
view before it's fully legible. On the hub page specifically, that's the *state list itself*:
both `<ul>` sections carry `class="reveal"` (`rights/index.html:62,65`), so if I land on
`/rights/` already scrolled (a deep link, a bookmark) and the verified-states list or the
50-state list is positioned right at the threshold, I could be looking at half-opacity text for
a beat while I'm trying to find Georgia. It's not disqualifying — a lot of it is already visible
on load, above the fold — but "half a second of blur on the thing I'm scanning for" is exactly
the kind of cost that's invisible to whoever built this at a desk and real to someone doing this
between fares.

### 🧑 Nia, 41 — NY, survived a violent stop, PTSD

I have `prefers-reduced-motion` set at the OS level, and I checked that this respects it —
it does, cleanly (`@media(prefers-reduced-motion:reduce){.js .reveal{opacity:1;transform:none;
transition:none}}`, present in every file). But that protection only exists for someone who
already knows that setting exists and turned it on before today. Someone in my exact situation
who has never touched that OS setting gets the full fade-and-lift, on a page whose entire reason
to exist is telling someone what to do during a moment of fear. I didn't find anything in this
diff that's reckless — it's a mild, short animation, not a game mechanic — but "the safety net
only catches people who already knew to ask for one" is a pattern this product has had before
(FG26/FG27's Panic HUD access is the same shape of problem, at a different layer).

### 🧑 Wes, 38 — Brooklyn, does not drive, enters everything sideways

I compare pages against each other, so I opened view-source on the hub and on a state page side
by side. The hub has four separate `.reveal` targets — the verified list, the 50-state list, the
CTA, the footer (`rights/index.html:61,64,67,68`). Every one of the 52 state pages has exactly
two — one enormous div wrapping the entire rule list plus CTA, and the footer
(confirmed: `grep -c 'class="reveal"'` = 2 for all 52 files, no exceptions). So "every section...
fades in" describes the hub's actual behavior and not the state pages', which fade in as one
block twice. Nobody would notice this without opening both files, which is exactly how I look at
everything here.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

I checked whether this touches me at all, and it mostly doesn't, which is worth saying plainly:
`opacity:0`/`transform:translateY()` do not remove content from the accessibility tree the way
`display:none` or `visibility:hidden` would, and nothing here sets `aria-hidden` on `.reveal`
elements (grep for `aria-hidden` in any `rights/*/index.html` = 0). So a screen reader reads the
disclaimer, the rules, and the CTA in document order regardless of whether they've visually
"revealed" yet — the whole animation is a sighted-user concern only, and that's the correct way
to have built it. Where I'd still flag something: at 200% zoom the `translateY(16px)` and the
CTA sitting inside the same reveal block as the rule list means a low-vision sighted user
scrolling slowly could see the block still mid-transition right as they reach for the button —
a half-second target that's still finishing its lift. Small, but on a page whose CTA is the one
conversion action, I'd rather buttons never be mid-animation when a slow scroller arrives at them.

**Tally.** No one calls this reckless or broken — the reduced-motion, print, and focus-within
guards all hold up under direct inspection, and the feature is genuinely well-built at the CSS
level. Every persona's real objection is about scope and consistency: what got the treatment
(English only), what didn't get separated from it (the one sentence that matters most on 48
pages), and what the same commit says about itself (a design system that forbids what it ships).

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The design system generated and locked in this commit bans, in writing, the exact motion this commit ships

**Evidence.** `design-system/amparo/MASTER.md:189`, under "Anti-Patterns (Do NOT Use)": **"❌
Motion effects."** The same file's Style Guidelines section (`:167-173`) names the pattern
"Accessible & Ethical," picked for a government/legal/public-safety product. `CHANGELOG.md:26-28`
(v2.30.0 entry) states outright: *"The skill correctly classified this site as a low-motion,
high-trust 'Accessible & Ethical' pattern rather than a flashy marketing one."* In the same
commit, `rights/index.html:49-53` and the identical block in all 52 state files add a
`.5s ease-out` opacity+transform transition to every `.reveal` element — a motion effect, by any
reading of the term the document itself uses. `MASTER.md` is dated generated 2026-09-18 05:13:17;
the commit lands at 05:44:44 the same morning — roughly 31 minutes apart, both authored in the
same session.

**Impact.** This is not a stylistic quibble — it's a generated governance document contradicting
the very code it was created to accompany, inside one commit, discoverable by opening both files.
Tony's reaction is the sharpest version of this: a product whose selling point is "we tell you
the truth about what we've verified" just shipped a rulebook that fails its own rule on day one.
It also raises the question of whether "locked" means anything if nobody checks new work against
it before committing.

**Cheapest fix that holds.** Either (a) remove "❌ Motion effects" from the anti-pattern list and
replace it with the actual constraint this feature demonstrates is fine — something like
"subtle, guarded, one-shot reveal motion only; no looping, no attention-seeking, no
motion without a reduced-motion/print/focus fallback" — or (b) if the anti-pattern is meant
literally, revert the CSS transition and keep only the opacity toggle with no transform/duration
(a true "instant show," not a decorative effect). No new research needed; this is a one-paragraph
edit to a markdown file plus a decision about which of the two documents is wrong.

### 2. The scroll-reveal shipped to all 53 English pages and zero of the 53 Spanish pages, and nothing in the commit says so

**Evidence.** `grep -c 'class="reveal"'` across all 52 files under `derechos/*/index.html` and
`derechos/index.html` returns **0**, every time — no `.reveal` class, no guard CSS
(`prefers-reduced-motion`, `@media print`, `focus-within`), no `IntersectionObserver` script, and
no `.js`-class head script. `derechos/ga/index.html` was read in full to confirm this isn't a
missing-file or redirect situation: it's a complete, real, translated page (`lang="es"`, its own
`<title>`, its own body text) that simply predates this feature entirely. The commit message,
`CHANGELOG.md` v2.30.0, and `notebook/amparo-version-history.md`'s v2.30.0 entry all describe the
change as "the rights hub + all 52 state pages" with no mention of English vs. Spanish, and no
mention that `/derechos/` was intentionally excluded or is coming in a follow-up.

**Impact.** This is the single largest scope gap in the round. Every prior focus group has
flagged this product's Spanish-first audience (Rosa, Marisol) as the actual center of the target
niche, not an afterthought — and a UI feature shipped to 100% of the English tree and 0% of the
Spanish tree, silently, is exactly the pattern that erodes the trust this product depends on for
that audience. It's also a maintenance debt: the two trees are already diverging in more than
translation, and nothing tracks that divergence.

**Cheapest fix that holds.** Port the same `.reveal` markup, the identical CSS block, and the
identical inline script to all 52 `derechos/*/index.html` files and the Spanish hub — the code is
already language-agnostic (no English strings inside the CSS/script). This is a mechanical
copy, not new design work, since the English implementation is byte-identical across all 52 of
its own files already.

### 3. The one sentence every unverified state depends on to describe its own limits is now motion-gated, on 48 of 51 jurisdictions

**Evidence.** `rights/al/index.html:62`: the entire `<div class="reveal">` wraps, in this order,
the `.note` disclaimer (*"Alabama's own rules are checked against the statute text, not yet
reviewed by a Alabama-licensed attorney"*), the seven-rule `<ol>`, the `.aid` legal-help list,
and the CTA — as one single observed target. The same structure was independently confirmed on
Arizona's own page (Ana's seat). Georgia, New York, and Texas — the three verified states — have
no `.note` at all, so this specifically affects the 48 states/DC that carry the disclaimer FG27's
golden #1 already flagged as under-surfaced relative to what it needs to communicate. Before this
commit, that sentence rendered immediately with the rest of the page. After it, the sentence is
governed by the same 15%-visibility threshold and `.5s` fade as the CTA button beside it.

**Impact.** This doesn't break anything the guards were built to protect (reduced-motion, print,
and focus-within all still surface it correctly) — but it moves the honesty-critical sentence
further from "always immediately true" toward "true once a scroll-and-timing condition is met,"
on the exact 48 pages where FG27 already found the surrounding language does less work than the
words suggest. Deferred visibility of a legal caveat, even briefly, is the wrong direction for a
product whose stated project is closing exactly that gap.

**Cheapest fix that holds.** Split the `.note` out of the shared `.reveal` wrapper into its own
un-gated block (or its own `.reveal` element with `threshold:0` so it fires the instant any pixel
is visible) so the disclaimer is never behind the same timing as decorative content. One
structural change to the state-page template, applied once, propagated to all 48 files the same
mechanical way the reveal feature itself was.

### 4. The "locked" design system's palette and fonts already don't match the pages it exists to govern

**Evidence.** `design-system/amparo/MASTER.md:19-37` specifies Primary `#0F172A`, Accent/CTA
`#0369A1`, and (`:42-49`) EB Garamond + Lato as the heading/body fonts. Every actual rights page
uses a different, hand-maintained palette and font stack: `--accent:#1B2A4A` (navy),
`--gold:#E8B84B`, body font `Georgia,'Times New Roman',serif`
(`rights/ga/index.html:24,26`) — and the CSS comment directly above it says why: *"Amparo's real
palette, taken from const LOGO and the app's own CSS."* Someone had to override the generated
system with the real one, in a comment, in the same file the system was supposedly written to
govern.

**Impact.** A "locked" reference document that's already wrong about the one thing every page on
the site actually uses (its colors and type) can't do the job the CHANGELOG describes — *"future
page work should generate against that system rather than drift per-component."* If a future
page (or a future agent) followed `MASTER.md` literally, it would produce a page in the wrong
navy, the wrong accent color, and the wrong fonts on day one, creating exactly the drift the
document exists to prevent.

**Cheapest fix that holds.** Regenerate (or hand-edit) `MASTER.md`'s color table and font section
from the values already in `rights/ga/index.html:22-26` — the real palette is a six-line CSS
comment away, not new research. This is the second time in two rounds a "single source of truth"
document has shipped already wrong (FG28 golden #1: the trust page's 230-vs-184); the fix pattern
is the same — generate the number/value from the real source instead of hand-typing it.

### 5. "Every section fades in" is true on the hub (4 targets) and false on every state page (2 targets, one of them the entire page)

**Evidence.** `rights/index.html` has four independent `.reveal` targets: the verified-states
list (`:61-63`), the federal-states list (`:64-66`), the CTA paragraph (`:67`), and the footer
(`:68`) — each animates in on its own. Every one of the 52 state pages, without exception
(confirmed by grep, no outliers), has exactly two: one `<div class="reveal">` wrapping the
entire disclaimer-plus-rules-plus-legal-aid-plus-CTA block, and the footer. The commit message's
own description — *"Every section of the rights hub and all 52 state pages now fades and lifts
in on scroll"* — reads as one uniform behavior; the actual granularity is two different
implementations depending on which of the 53 pages you're on.

**Impact.** Low risk on its own (nothing breaks), but it's an internal-consistency gap inside a
single commit whose stated purpose is a clean, repeatable, "locked" pattern. It compounds golden
#3 (the monolithic wrapping is what buries the disclaimer) and is the kind of thing that would
surprise whoever next tries to add a fifth reveal target to a state page expecting the hub's
per-section granularity and finding the state template doesn't support it without refactoring.

**Cheapest fix that holds.** Split each state page's single wrapper into two or three
`.reveal` targets — disclaimer/note (if present), rule list, legal-aid+CTA — matching the hub's
granularity. Same template, same CSS, no new selectors; purely where the `<div class="reveal">`
open/close tags land in the existing markup.

---

## 3. What must change in the practice modules / Arena (structure, not officer dialogue)

The Arena itself is untouched by this commit — confirmed zero instances of `class="reveal"` or
`IntersectionObserver` in `arena/index.html`. Nothing here is a regression. What personas raised
that touches the modules going forward:

1. **Decide, in writing, whether motion belongs on safety-critical surfaces at all**, before it
   reaches the Arena. Golden #1 shows the design system says no; this commit says yes, on the
   rights pages. If the Arena or `/rehearse` ever gets similar scroll motion, that decision needs
   to be made once, not inherited by copy-paste the way `.reveal` propagated across 52 state
   files.
2. **If/when the Arena adopts any reveal-style motion, the safety line and the "(Checked)"/
   verification-status text must be their own un-gated element**, never bundled into a larger
   observed block — this is golden #3's lesson, worth stating before the Arena's own safety copy
   (already flagged as under-surfaced by FG27 golden #1) inherits the same structure.
3. **`framer-motion` is now installed in `app-src` with zero usage.** Before it's used to animate
   the React Panic HUD, resolve FG27 golden #3 (two independently-maintained Panic HUD
   implementations) first — adding a motion library to only one of the two diverging
   implementations is a third point of divergence, not a fix.
4. **Carryover, not re-counted (still open from FG26/27/28):** the "(Checked)" receipt with no
   coverage clause, `sw-routing-check` unwired from CI, the two Panic HUDs, the pressure-meter
   screen-reader label, the org-page unbuilt deliverables. None of today's diff touches these;
   flagged only so the module backlog stays visible.

---

## 4. Missing / inconsistent things the personas expect, each checked before claiming

| Expected | Verified state | Who |
|---|---|---|
| The new feature to reach the Spanish half of a bilingual site | 0 of 52 `derechos/*` state pages + Spanish hub carry any part of it | Rosa |
| A "coming to Spanish" note, if this was a staged rollout | No mention of `/derechos/` in the commit message, CHANGELOG, or version-history entry | Rosa |
| The verification-status disclaimer to be at least as visible as before, not less | Bundled into the same opacity-gated block as the CTA on 48/51 state pages | Ana |
| A design system that matches the production palette it claims to govern | `MASTER.md` colors/fonts (`#0F172A`/`#0369A1`/EB Garamond+Lato) vs. actual (`#1B2A4A`/`#E8B84B`/Georgia) | Tony |
| A design system that doesn't forbid the feature shipped alongside it | "❌ Motion effects" (`MASTER.md:189`) vs. the shipped `.5s` transition | Tony |
| Consistent reveal granularity across the hub and state-page templates | Hub: 4 targets; every state page: 2 targets, one covering the whole body | Wes |
| framer-motion installed with an actual use site | 0 import sites in `app-src/src` | Luis |

Not repeated from FG26/27/28 (still open there, untouched by today's diff): HUD reachability,
the "(Checked)" receipt, the cite-dialect mismatch, `sw-routing-check` in CI, the org-page unbuilt
deliverables, the 230-vs-184 trust-page number, the three coverage sentences.

---

## 5. Blind-spot questions a top UX researcher would ask, not asked in rounds 26–28

**BS-1. Was `MASTER.md` checked against its own anti-pattern list before this commit, or is
"locked" just "generated once"?** Golden #1 — a document forbidding motion effects was generated
roughly thirty minutes before a commit that ships them. If nobody re-reads a "locked" design
system against the code that ships alongside it, locking it accomplishes nothing except giving a
false sense that drift is now prevented.

**BS-2. Was excluding `/derechos/` a scoping decision (ship English first, Spanish next sprint)
or an oversight?** Nothing in the commit, CHANGELOG, or version-history entry mentions Spanish at
all, in either direction. Silence is itself informative: a deliberate staged rollout would
normally say "English shipped, Spanish follows" somewhere in the record. It doesn't.

**BS-3. Should a legal-status disclaimer ever be gated behind the same visual treatment as
decorative content, even when every individual guard (reduced-motion, print, focus-within) is
implemented correctly?** Golden #3 isn't a bug in any single guard — it's a structural choice
(what got wrapped together) that none of the guards were designed to catch, because the guards
answer "does it eventually become visible correctly," not "should this specific sentence ever be
gate-able at all."

**BS-4. Who is `design-system/amparo/MASTER.md` actually for, if it doesn't match the 53 pages it
was generated to accompany?** If a future contributor (human or agent) builds a new page by
reading `MASTER.md` literally, they will produce something visually inconsistent with everything
already shipped. Is the intended source of truth the markdown file or the CSS comment inside
`rights/ga/index.html:22-23` that says "this is the real palette"? Both currently claim the
role.

**BS-5. Now that `framer-motion` is installed, what's the plan for it?** It has zero call sites
today. If it's meant for the React Panic HUD (FG27 golden #3), that decision — and its relation
to the vanilla-JS Arena `#panicView` that already works, is offline, and is more accessible —
needs to be made before any animation code is written there, not after.

**BS-6. Has anyone verified the print path from a device that never finished running the reveal
script at all** — e.g., a share-sheet "Print" invoked mid-load, or a browser extension that
blocks the second inline `<script>` but not the first? The CSS guard (`@media print`) should
cover this by construction, but FG27 already found that a claim's own verification method
("Chrome DevTools offline emulation") mattered more than the claim itself; the same discipline
applies here before calling the print path unconditionally solved.

---

## 6. A small thing worth naming: this is the third round in a row where a generated or hand-typed number/rule shipped already wrong

FG27 §6 found the stale "230" in code comments; FG28 golden #1 found the same "230" transcribed
by hand onto two public trust pages. This round, golden #4 finds a third instance of the same
underlying failure mode — a generated document (`design-system/amparo/MASTER.md`) whose values
(colors, fonts) don't match the source of truth (`rights/ga/index.html`'s own CSS) it claims to
govern, discovered the same day it was created. None of the three are related in content, but
all three are the same shape of mistake: a document meant to prevent drift was never checked
against the thing it describes before being trusted.

---

## 7. Verification log

- Commit under test: `bc97671` (2026-09-18, `git log -1 --format=%ci` = `2026-09-18
  05:44:44 -0400`). Working tree carries only pre-existing, unrelated modifications
  (`CHANGELOG.md`, `notebook/amparo-version-history.md`); confirmed via `git status --short`.
- `grep -c 'class="reveal"'` across all 52 `rights/*/index.html` files: uniformly **2**, no
  exceptions. Across all 52 `derechos/*/index.html` files and `derechos/index.html`: uniformly
  **0**, no exceptions.
- `derechos/ga/index.html` read in full (first 10 lines) to confirm it is real, complete,
  translated content (`lang="es"`, its own title/description) and not a stub or redirect —
  ruling out "the Spanish page doesn't exist yet" as the explanation.
- Script-tail `md5sum` across all 52 `rights/*/index.html` files: **one** unique hash — the
  IntersectionObserver IIFE is byte-identical everywhere it appears in the English tree.
- Guard-CSS presence (`prefers-reduced-motion`, `@media print`, `focus-within`) checked by grep
  across all 52 English state files: present in all 52, no exceptions.
- `design-system/amparo/MASTER.md` read in full (216 lines); anti-pattern list at `:185-199`;
  color table at `:19-37`; font section at `:40-50`; generation timestamp at `:10`.
- `rights/ga/index.html:22-26` read directly for the real palette/font values used in
  production, cross-checked against `MASTER.md`'s values — confirmed mismatched on both axes
  (color and typeface).
- `app-src/package.json:21` confirmed `"framer-motion": "^13.4.0"` present;
  `grep -rc framer-motion app-src/src` returned 0 for every file searched (no output = no
  matches in any file).
- `arena/index.html` grepped for `class="reveal"` and `IntersectionObserver`: 0 both — confirmed
  the Arena is untouched by this commit, not a claim taken on faith.
- Grep-negatives (absence, not intent): `posthog|analytics|gtag` in `rights/index.html`,
  `rights/ga/index.html`, `rights/al/index.html` = 0 (Marcus's concern, ruled out); `aria-hidden`
  in any `rights/*/index.html` = 0 (Omar's concern about AT-tree removal, ruled out — content
  stays in the accessibility tree regardless of opacity).
- `CHANGELOG.md:9-28` and `notebook/amparo-version-history.md:11-16` (v2.30.0 entries) read in
  full; neither mentions `/derechos/`, Spanish, or bilingual scope in either direction.
- **RECON, not asserted:** actual on-device timing of the `.5s` transition relative to a real
  user's scroll speed (Keisha's estimate is derived from the CSS value, not measured against a
  live device or browser this session had access to); whether Vercel's build step does anything
  to `rights/`/`derechos/` beyond serving the committed HTML as-is (no build step found in
  `package.json` for these directories, consistent with FG27's same finding for `arena/`).
- Excluded per standing instruction: attorney-review as a finding. In scope and flagged: the
  verification-status disclaimer's visibility timing, because that is a structural/motion
  question, not the legal review itself.

## 8. Signature

Ten seated personas from `.focus-group/members.md` — Rosa, Dana, Tony, Ana, Luis, Marcus,
Keisha, Nia, Wes, Omar. Five goldens, four module items, seven missing/inconsistent items, six
blind spots, one recurring shape of mistake (a governance document already wrong about the thing
it governs, the third instance in three rounds). Every `file:line` above was opened this session
against `bc97671`; the Spanish-tree gap and the design-system mismatch were both confirmed by
direct grep/read, not inferred from the commit message.
