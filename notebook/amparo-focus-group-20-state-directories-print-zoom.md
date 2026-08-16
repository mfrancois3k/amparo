# Amparo focus group 20 — the QR code that didn't follow the directory (v2.22.5 → v2.22.9)

**Agent A of the `/amparo-loop`, run standalone.**
Build under test: HEAD `b9038ef` (docs commit for tag **v2.22.9**), `EDITION="2026-E"` unchanged.
Verified by direct source read — `index.html` and `app-src/src/**` at HEAD — plus `git show`/`git log -p`/`git diff` for
history, blame, and per-commit stat, `CHANGELOG.md` for the project's own claims, and
`notebook/amparo-directory-feasibility-2026-08-16.md` for the research this round's content is built on.
A local static server + browser session was attempted for live verification (same methodology as FG16–18); the
click tool did not reliably trigger in-app navigation in this environment (repeated `left_click`/`ref` timeouts
against a client-side SPA with no network activity to signal "settled" — a tool-environment issue, not an app
symptom observed on screen). Abandoned in favor of exhaustive source verification, consistent with FG19's
precedent for rounds where live access isn't available. Every claim below is grep/read-confirmed against actual
file content, not inferred from commit messages or prior reports.

**Excluded by instruction, not re-reported as new:** attorney/lawyer review in any form.

---

## 0. What is actually new, verified — and a scope correction

### 0.1 The brief named two tags; four shipped

The task brief frames "what shipped since FG19" as v2.22.8 and v2.22.9. `git log` shows **four** tags landed in that
gap: **v2.22.6** (`0b4bce8`, TX/GA/NY link to their own directories + a new `BASE_LIFELINES` national-finder entry
for the other 48 states), **v2.22.7** (`70cfa0e`, a fix batch), **v2.22.8** (`19b3a34`, tap-to-zoom), **v2.22.9**
(`3464ad4`/`ed4d23c`, the 24-state `STATE_LEGAL_AID` expansion). None of the four were covered by a focus-group
round — FG19 stopped at v2.22.5. This report keeps its 10 personas and 5 goldens scoped to the brief's actual
subject (v2.22.8 + v2.22.9, confirmed as the current round's diff), but §0.2 below is worth reading first because
v2.22.7 already fixed two of FG19's five open goldens, and not saying so would misrepresent the current build.

### 0.2 FG19's own goldens, re-checked against current source

- **FG19 golden #2 (no click-tracking for the Welcome shortcut) — FIXED**, in v2.22.7. `index.html:3366`:
  `onclick="ph('sr_welcome_shortcut_clicked',{lang:lang});goM(1)"` — confirmed present, matches CHANGELOG v2.22.7's
  claim verbatim.
- **FG19 golden #3 (stale CSS comment describing pre-fix pilotBanner behavior) — FIXED**, in v2.22.7.
  `app-src/src/styles/shell.css:65-70` now reads correctly and explicitly documents its own correction: *"This
  comment previously described the opposite, now-reversed behavior — found stale by the 2026-08-16 loop's focus
  group."*
- **FG19 golden #1 (the "lower-commitment doorway" link still calls the identical full-flow handler, `goM(1)`,
  instead of the real fast-lane pattern `skipToPack()` already provides) — STILL OPEN.** Re-checked at HEAD:
  `index.html:3366` still calls `goM(1)`; `skipToPack()` (`:4268`) remains a separate, unused-by-this-link
  function. Not re-ranked as a new golden this round (out of scope for v2.22.8/9's diff), but flagged here so it
  isn't silently dropped.
- **FG19 goldens #4/#5** (stepper chrome, unlabeled shared-handler siblings) — not re-verified this round; #4's
  underlying premise (stepper visible on Welcome) doesn't hold at current source (`index.html:3053`:
  `el.style.display = step===0 ? 'none' : 'flex'`, unchanged since v2.22.5 by `git show ed71378`), so it is not
  carried forward without re-derivation. Not investigated further this round — out of scope.

---

## 1. Ten persona reactions

Selected to span the two things this round's diff actually touches — print-pack readability (v2.22.8) and
state-directory coverage (v2.22.9) — not the full FG17-19 panel. Coverage note up front: of `.focus-group/members.md`'s
13 personas, 11 live in TX/GA/NY (the three states with full researched content, unaffected by `STATE_LEGAL_AID`).
Only **Ana** and **Omar** (both Phoenix, AZ) live in one of the 24 newly-covered states — the panel's real ability
to test this round's headline feature is thin by construction, not by selection.

### 🧑 Ana, 31 — Phoenix AZ, wants to know the app covers her state

Arizona is one of the 24. She reaches Lifelines and, for the first time, sees something that isn't the generic
national finder: **AZLawHelp.org — "filterable by county"** sits first in her list, ahead of the same
`LawHelp.org — find help in your state` entry that used to be the only option (`index.html:2685`,
`STATE_LEGAL_AID.AZ`; splice order confirmed at `:2713`). "This is exactly what I wanted last time I looked —
proof the state actually has something, not a form letter." She'd also be the one to notice, without prompting,
that right under the AZ-specific box sits a second, generically-worded box that says almost the same thing
("pick your state to find legal aid organizations") — "why are there two of these now."

Redo? Yes, clean win for her specific ask. Would flag the duplicate listing (golden #4) unprompted.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

Two features, two different outcomes. The `STATE_LEGAL_AID` entry reads fine to him — it's a normal lifeline row,
same markup, same tag badges as every other entry, nothing special-cased badly. Then he reaches Print and tabs to
a thumbnail: `role="button" tabindex="0"`, correctly announced. He activates it. The overlay opens — and here his
exact recurring pattern (FG18, FG19: "a working control one screen from a broken twin") shows up a third time, in
a brand-new feature on its first day. The dialog's `aria-label` is the same static string
*"Page preview / Vista previa de la página"* no matter which of the six pages he opened — confirmed,
`index.html:1760`, never touched by `packZoomOpen()` at `:4068-4086`. He can't tell from the announcement alone
whether he's looking at the rights card or the legal-rail page; a sighted user gets the real page name in
`packZoomTitle`'s visible text every time. Then he tabs to the close button: `<button class="ab-x"
onclick="packZoomClose()">✕</button>`, no `aria-label`, no `textContent` set from anywhere — and the project's own
content bank has a string sitting right there, `pack_zoom_close:"Close preview"` (`:2170`), written in the exact
commit that shipped this button, never once referenced by name anywhere in `index.html`. "The button that's
supposed to make the pack more readable is the one button that doesn't tell me what it does."

Redo? Yes for the `STATE_LEGAL_AID` content. No, for the second round in a row, on the new print/preview surface
specifically — different defect than FG18's, same shape.

### 🧑 Dana, 52 — TX suburb, the panel's completionist

TX is cited, so `STATE_LEGAL_AID` doesn't touch her directly — she'd go looking anyway, on principle, and land on
the printed pack's Lifelines page. She'd catch the freshness header first: *"YOUR LIFELINES — verified
7/16/2026"* (`index.html:2214`) sits over TX's content same as always, unremarkable for her own state. But she'd
ask the obvious follow-on question, because it's exactly her pattern from FG16-19: "if I pick a state that just
got its directory added last night, does the pack still say July 16th?" It does — the same static string prints
over every state's lifelines block (`:4436`), including the 24 states whose `STATE_LEGAL_AID` entries the code's
own comment dates to *2026-08-16*, one month after the header that prints above them. "The date on the page is
older than the thing the date is supposed to be describing."

She'd separately notice the QR gap (golden #1) by comparing her own TX pack (has a QR code, `:4394`) against a
hypothetical AZ pack (doesn't — `QR`/`QR_URL` only key TX/GA/NY, `:2849-2850`) via the sample-pack preview. "You
built the scan-it convenience for three states and the type-it-by-hand version for twenty-seven."

Redo? Yes. Refer? Yes — same strongest-holding verdict as FG16-19, two new concrete instances this round.

### 🧑 Rosa, 44 — GA, Spanish-first, distrusts anything collecting data

GA is cited, unaffected directly by `STATE_LEGAL_AID`. She'd use the print-pack zoom feature exactly as intended —
tapping through the six thumbnails before deciding whether to spend paper — and it works cleanly for her: Spanish
captions (`v_pg1`-`v_pg6`) render correctly in the enlarged view, same as the small thumbnail, confirmed 1:1
string reuse. She would not personally hit the `aria-label`/`pack_zoom_close` gap (she doesn't use a screen
reader) and wouldn't independently notice AZ's new directory (not her state). A clean, quiet pass for the feature
she'd actually use.

Redo? Yes, unaffected either way by this round's specific defects.

### 🧑 Marisol, 29 — NY, green-card holder, reads what's actually promised

NY is cited. She'd apply the same literalism she brought to FG17/18's share-sheet preview to this round's
CHANGELOG instead: *"24 states checked and honestly ruled out — not skipped"* (`CHANGELOG.md`, v2.22.9 entry). She'd
open the cited research doc and find the sentence doesn't hold evenly: 22 of the 24 are described as confirmed
negatives (static lists, hotline forms, no location search) but two — NV and OK — are described in that same doc,
in the project's own words, as *"left unverified rather than defeated"* and *"left unverified rather than
assumed"* (`notebook/amparo-directory-feasibility-2026-08-16.md:127,132`), because their real candidate sites are
blocked by bot detection, not because they were checked and found lacking. "'Ruled out' and 'we couldn't get past
Cloudflare' are two different findings. The summary line flattens them into one, the same shape as the Facebook
exception I found in the share sheet — a claim that's true for most of what it covers and silently not true for
a couple of the twenty-four."

Redo? Yes on the research rigor itself (the individual verifications are real and well-sourced). The complaint is
narrower: the one-line summary claim, not the underlying work.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, no printer, always between fares

GA is cited, and she doesn't print, so neither headline feature reaches her directly — said plainly rather than
invented. She'd be the one to ask the sharpest version of Dana's QR question, though, because it's her exact
failure mode from FG16 (offline chip) and FG18 (`sms:` blank tab): "If I ever DO get a pack printed for me — a
shelter, a clinic, wherever — and I'm in one of the twenty-four states, I'm typing a URL off a piece of paper with
my thumbs between fares instead of scanning it. That's the one feature that would've actually helped someone in my
exact spot, and it's the one that didn't get built for my state."

Redo? Unaffected either way — the QR gap is a real miss for her hypothetical case, not her actual one this round.

### 🧑 Wes, 38 — Brooklyn, doesn't drive, hunts the pack on purpose

NY is cited. He's the panel member most likely to open the zoom overlay purely out of curiosity, off the intended
path — and he'd find it functionally solid: reuses the exact same `#printRoot .pp` nodes the thumbnails already
clone from (`index.html:4069`, confirmed identical selector to the thumbnail-build code), so there's no risk of
the zoomed view drifting from what actually prints, a real "single source of truth" property he'd credit
correctly. He'd hit the same `aria-label` gap Omar does if he were testing with a screen reader, but he isn't; from
a sighted, curious user's seat, this feature reads as exactly what it claims to be.

Redo? Yes. He'd take this as a genuine, if narrow, quality win — consistent with his FG19 read on the pilotBanner.

### 🧑 Marcus, 19 — NY, broke, shares things that look sharp

NY is cited. He'd use the zoom feature the way it's meant to be used — checking a page looks right before deciding
whether it's worth printing on a machine he doesn't personally own — and wouldn't register the a11y gap at all,
same shrug energy as his FG19 read on the Welcome shortcut. "Didn't even think about it, just tapped through the
pages and they looked like the pages." A useful low bar: for a sighted, non-completionist user, nothing about
either feature reads as broken.

Redo? Yes, unaffected by this round's findings.

### 🧑 Luis, 27 — TX, DACA, prepaid data, distrusts anything cloud/trackable

TX is cited. He wouldn't personally need `STATE_LEGAL_AID`, but he'd read the new entries' promise the way he reads
everything — literally, and checking what actually happens on tap. `lifeContact()` (`:4039`) correctly builds
`https://` links from the bare domains in `STATE_LEGAL_AID` (e.g. `alabamalegalhelp.org/...` → a real link, not a
dead string), and `phLifelineClick` tracks the tap the same generic way as every other lifeline — no special-case
bug for the new entries. He'd credit that specifically: "at least the new links actually go somewhere and I'm not
the one who has to guess." He'd separately clock the print-pack QR gap the same way Dana and Keisha do, from his
own angle: on his older Android with prepaid data, a QR scan is often faster and cheaper than typing a full URL
one-handed, so the 24-state gap costs him disproportionately if he's ever handed a pack from a state other than
his own.

Redo? Yes on the mechanics being sound. Standing objections elsewhere unchanged.

### 🧑 Nia, 41 — NY, PTSD, wants a non-simulated checklist route

NY is cited; the print/zoom and directory changes don't reach her practice-avoidance path at all — she confirms,
unprompted, that neither headline feature touches Print in a way that forces simulation exposure, and neither
changes her standing FG16-19 conditions. Genuinely unaffected, said plainly rather than manufactured.

Redo? Still no for hostile content, unrelated to this round. Unaffected either way by both features.

**Who this round doesn't reach.** Devin, Tony, Ray, Marisol's household — TX/GA/NY residents whose standing
conditions are untouched by a print-preview feature and a 24-state directory expansion that excludes their own
already-researched states. Not re-tested; FG19 verdicts carried forward, not re-asserted.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The print-pack's own QR-code convenience — the exact mechanism this project built two versions ago for "scan instead of type" — was not extended to the 24 states that just earned a real, scannable-worthy directory

**Evidence.** `QR`/`QR_URL` (`index.html:2849-2850`) key exactly three states: TX, GA, NY. The printed pack's
Lifelines page (`:4394-4396`) only renders a `<div class="qrbox">` when `QR[data.state]` is truthy — for the other
48 states, including the 24 that `STATE_LEGAL_AID` (`:2683-2707`) just gave a real, specific, county/ZIP-searchable
directory, nothing renders. The lifeline text entry itself does print (`:4437`, filtered only on the `soon` tag,
which `STATE_LEGAL_AID` entries don't carry), so a California user's printed pack correctly lists
`lawhelpca.org/find-legal-help` as readable text — with no way to reach it except typing it by hand.

**Impact.** v2.22.6's own CHANGELOG entry framed the QR mechanism as specifically valuable for "county-searchable
directory pages" — precisely the class of resource `STATE_LEGAL_AID` now provides for 24 more states. The
convenience gap is largest for exactly the persona this whole directory pass was motivated by (a real stranger
without reliable phone access, per v2.22.6/9's own commit history) and for anyone relying on the physical pack
over the live app — Keisha's and Luis's read independently, above.

**Cheapest fix that holds:** generate QR codes for the 24 `STATE_LEGAL_AID` entries the same way TX/GA/NY's were
built (same `QR`/`QR_URL` shape, same render branch at `:4394`) — no new component, no new template, reuse of the
exact mechanism already proven for three states.

### 2. `pack_zoom_close` — a string authored specifically for this feature, in the commit that shipped it — is defined twice and used nowhere in root; `/app` used it correctly the same day

**Evidence.** `git log -S"pack_zoom_close"` shows the string was introduced in exactly `19b3a34` (v2.22.8), both
languages (`index.html:2170,2518`). `grep -n "pack_zoom_close" index.html` returns only those two definition
lines — zero call sites. The close button it was clearly named for renders as
`<button class="ab-x" onclick="packZoomClose()">✕</button>` (`:1762`), with no `aria-label` and no
`.textContent=_t.xxx_close` assignment (the pattern every other translated close button in this file uses —
`:3110`, `:3264`, `:6162`). `grep -c "setAttribute('aria-label'" index.html` returns zero project-wide — there is
no other mechanism that could be applying it dynamically. `/app`'s `PackZoomOverlay.tsx:45` uses the identical
string correctly: `<button className="ov-x" onClick={onClose} aria-label={t.pack_zoom_close}>✕</button>`.
Separately, root's dialog `aria-label` (`:1760`) is a static, generic string identical across all six pages —
`/app`'s equivalent (`PackZoomOverlay.tsx:41`) is `aria-label={caption}`, the actual page name, dynamic per open.

**Impact.** A screen-reader user on root gets an unlabeled close control and an identical announcement for six
visually-distinct pages, on the surface built specifically to make pack content *more* legible before printing —
the inverse of the feature's own goal, for exactly the users who benefit most from labeled controls. Root is this
project's more mature, first-shipped surface by convention; here `/app` — normally the one playing catch-up —
built the more correct version of the same day's feature.

**Cheapest fix that holds:** two one-line changes in `packZoomOpen()`/the dialog markup — set
`.ab-x.setAttribute('aria-label', _t.pack_zoom_close)` (or `.textContent`, matching the existing pattern) and
`document.getElementById('packZoomOverlay').setAttribute('aria-label', _t['v_pg'+n])` alongside the existing
`packZoomTitle.textContent` line already in the function.

### 3. For the 24 `STATE_LEGAL_AID` states, the new state-specific entry and the pre-existing generic national finder now sit back-to-back in the same list, un-deduped, describing near-identical resources

**Evidence.** `STATE_LEGAL_AID[k]` is spliced as `[{...extra,tags:["free","safe"]}, ...BASE_LIFELINES]`
(`index.html:2713`), and `BASE_LIFELINES`'s first entry (`:2657`) is *"LawHelp.org — find help in your
state... Pick your state to find legal aid organizations near you, often filterable by county"* — the exact
LawHelp Network infrastructure that most `STATE_LEGAL_AID` entries (e.g. `AZLawHelp.org`, itself part of the
LawHelp Network) are the state-specific landing page for. A California or Arizona user now sees two
directory-finder entries, same tags, adjacent positions, both true, one of them functionally redundant with the
other for their specific state.

**Impact.** Not a correctness bug — both links work — but the exact "does the codebase know two things are the
same thing" gap FG19 golden #5 named for code paths, recurring here as content. Ana's read above: a real user
notices without being prompted. Doesn't confuse anyone into a wrong action, but clutters the shortest, most
trust-critical list in the product (Lifelines) for the 24 states this round was built to help most.

**Cheapest fix that holds:** when a `STATE_LEGAL_AID` entry exists for a state, drop the generic `LawHelp.org —
find help in your state` line from that state's rendered list (keep it only for the 24 states with no
state-specific entry) — a one-line filter at the same splice site, no content rewrite needed.

### 4. The release's own summary claim — "24 states checked and honestly ruled out — not skipped" — is looser than the research it cites

**Evidence.** `CHANGELOG.md`'s v2.22.9 entry states the line verbatim. The cited backing document,
`notebook/amparo-directory-feasibility-2026-08-16.md`, describes 22 of the 24 as confirmed negatives (static
lists, hotline intake, topic-only triage) but describes NV and OK differently, in the document's own words:
NV — *"left unverified rather than defeated"* (`:127`); OK — *"left unverified rather than assumed"* (`:132`) —
both because a real candidate site exists but is blocked by bot detection, not because it was evaluated and found
lacking.

**Impact.** Lower magnitude than goldens #1-3 — nothing user-facing changes, and the underlying research is
genuinely careful (the project explicitly refused to bypass bot detection, the correct call per its own standing
rules). Included because it's a small, source-confirmable instance of this project's most recurring finding shape
(FG16's "claims outliving what they verify," recurring in FG17-19 in the code and copy; here it's the release
summary itself, one level up from the code).

**Cheapest fix that holds:** split the CHANGELOG line into two counts — "22 confirmed, 2 blocked by bot detection
and left unverified" — a rewording, no code change, no re-research needed.

### 5. Nothing in the product or its content data distinguishes a "verified absence" state from a "not yet researched" one — for any of the 24 or the original 48

**Evidence.** `STATE_LEGAL_AID` (`:2683`) and the fallback branch (`:2709-2715`) treat every non-cited,
non-`STATE_LEGAL_AID` state identically — `BASE_LIFELINES` only, no field or flag distinguishing "checked in the
2026-08-16 pass and found to have no qualifying tool" (22 states) from "genuinely unverified, blocked"
(NV, OK) from "not in scope for this pass at all" (a status that no longer exists post-v2.22.9, but existed for
all 48 before it, and will exist again the moment a 49th piece of research needs representing).

**Impact.** Lowest magnitude here, listed because it's the structural root of golden #4 and would resurface the
next time this directory gets extended: without a status field, every future research pass has to re-derive
"what's already been checked" from a notebook file rather than the data model itself, the same "keep extracting,
never resolve" shape FG14/FG18 named for orphaned strings, here applied to research provenance instead.

**Cheapest fix that holds:** none required to ship correctly today — worth a `status` field
(`verified | unverified | unresearched`) on the fallback path only if a fourth research pass is planned; premature
to build for a research cadence that doesn't have a second confirmed instance yet.

---

## 3. What must change in the practice MODULES specifically

**Nothing — stated plainly, not invented.** `git show --stat` on both round commits (`19b3a34`, `ed4d23c`) touches
`index.html`, `PrintStep.tsx`, `PackZoomOverlay.tsx` (new), `useOverlayA11y.ts` (comment only, no logic change —
confirmed via diff), `print.css`, `states.json`, `statesResolved.ts`, `t.en.json`/`t.es.json`, and
`tools/extract-app-content.mjs`. `StateStep.tsx`, `YouStep.tsx`, `LifelinesStep.tsx`, `PracticeStep.tsx`,
`DocsOverlay.tsx`, and `practiceEngine.ts` appear in the stat output only as bundler-hashed build artifacts
(`app/assets/*.js`), never as source changes. No defect is reported *inside* any practice module this round —
same conclusion as FG19 for its round, for the same reason (the diff genuinely didn't reach them).

---

## 4. Blind-spot questions a top UX researcher would ask, not repeated from FG06–FG19

**BS-1. Two versions shipped fixes for two of FG19's five open findings (goldens #2 and #3) with no
focus-group or audit pass verifying them until this round, three versions later — is "the next round will catch
it" being relied on as the verification step, rather than a check at ship time?** Both fixes hold up under this
round's re-check (§0.2) — this isn't a report of a regression. The question is about process, not outcome: v2.22.6
and v2.22.7 shipped, and shipped correctly, in a gap this project's own review cadence didn't cover at all. If
either fix had been subtly wrong (the same way FG18 found the clipboard-failure "verified live" claim was
narrower than it looked), it would have shipped to real users for two full versions before any process caught it.
Is there a lighter-weight check — even a one-line self-verification against the finding's own evidence, run at
tag time — that doesn't require waiting for the next full focus-group round to confirm a fix actually closed what
it claimed to close?

**BS-2. This round is the first time `/app` shipped the more accessible version of a same-day feature and root
shipped the less accessible one — every prior instance in this project's history ran the other direction. Is
there a step that checks whether a same-day root/`\/app` pair actually match in *quality*, not just in
presence?** `extract-app-content.mjs --verify` (referenced in v2.22.7's CHANGELOG fix) checks that content
*strings* match between root and `/app` byte-for-byte. It would not have caught golden #2 here, because the
strings match — `pack_zoom_close` exists correctly in both `t.en.json` and `index.html`'s content bank. What
differs is which surface actually *calls* the string. Is there a lint-shaped check (grep every content-bank key
against its usage sites, per surface) that would catch "defined in both, wired in one" the way `--verify` already
catches "defined in one, missing in the other"?

**BS-3. Three independent, un-reconciled "when was this verified" signals now coexist in the same file — a
static print-header date (`lifelines_print`, unchanged since before FG01), a code-comment-only research date
(`STATE_LEGAL_AID`'s "Added 2026-08-16" comment, `:2672`), and a daily cron file (`law-status.json`) — and none of
them reference each other. Is "when this claim was last true" being tracked as one concept anywhere, or does each
new content type invent its own ad hoc freshness convention the moment it ships?** Golden #4 is the printed
symptom; this is the structural question behind it. A future fourth freshness mechanism (say, a per-state
`verifiedDate` field) would be the natural fix for golden #4/#5 both — but nothing currently forces that
conversation to happen before it's needed.

**BS-4. The QR mechanism was deliberately-scoped to three states in v2.22.6's own commit message ("zero new data
pipeline, zero new liability" — a real, considered reason). Was extending it to the 24 `STATE_LEGAL_AID` states in
v2.22.9 explicitly considered and deferred, or simply not on the list this pass?** Worth asking plainly because
the two are different failure modes with different fixes: a deliberate scope cut that should be logged as an open
item (the pattern this project already uses well — v2.22.4's "record two open design forks") versus a genuine
blind spot where the QR mechanism's existence wasn't cross-referenced against the new content type at all. Golden
#1 doesn't distinguish between these from the diff alone; only the operator knows which one happened.

---

## 5. Group read

**Would-evaluate-favorably verdict: 8 yes/conditional-yes (Ana, Rosa, Wes, Marcus, Luis, Nia, Keisha, Dana — Dana
conditional pending goldens #1/#4) / 1 conditional with a real, specific objection (Omar) / 1 conditional on
research-summary precision alone (Marisol).** Nobody found either feature broken in the sense of not working —
every mechanism traced (zoom clone-and-scale, `lifeContact()` URL building, event tracking, print rendering) does
exactly what its own commit message claims. The gaps found are all in what each feature *didn't* extend to: the
zoom overlay's readability improvement didn't extend to its own close button's accessible name; the directory
expansion's core value (a real link) didn't extend to the QR convenience mechanism already built for the same
purpose two versions ago.

**Biggest objection by theme.** Both features are structurally sound and both stopped one step short of full
parity with something the project already had: root's zoom dialog vs. `/app`'s better-labeled twin (golden #2),
and TX/GA/NY's scannable pack vs. the 24 new states' type-it-by-hand pack (golden #1). Same shape as FG19's
finding about the Welcome shortcut — new machinery built correctly, not fully wired to the older machinery sitting
right next to it in the same file.

**Highest-leverage fix, this round's subject specifically.** Golden #1 — extend the existing `QR`/`QR_URL`
mechanism to the 24 `STATE_LEGAL_AID` states. Same generation pattern already proven for three states, reaches the
persona (print-reliant, phone-averse) this whole directory pass was originally motivated by.

**Highest-leverage fix, across the whole product regardless of surface.** Unchanged from FG16-19: `/app`'s
colour-only print confirmation (`PrintStep.tsx:119`, re-read this round — still `className={\`btn ${printed ?
'ghost' : 'gold'}\`}`with no text or role change, confirmed not touched by either round-under-test commit).

**Who this still isn't for.** Not evaluated this round — Tony, Ray, Devin, and every TX/GA/NY-resident persona's
standing conditions are untouched by a print-preview feature and a directory expansion that, by definition,
excludes their own states. FG19 verdicts carried forward, not re-asserted without evidence.

---

## 6. Signature

Agent A, `/amparo-loop`, standalone run. Ten personas from `.focus-group/members.md`: Ana, Omar, Dana, Rosa,
Marisol, Keisha, Wes, Marcus, Luis, Nia — chosen for this round's actual subject (print-pack zoom + 24-state
legal-aid directories), with an explicit note that 11 of the panel's 13 personas live in states this round's
headline feature doesn't reach.

All source citations are `index.html` and `app-src/src/**` at HEAD (`b9038ef`, v2.22.9) unless noted, verified by
direct grep/read/`git show`/`git log -S`, not assumed from commit messages. `CHANGELOG.md` and
`notebook/amparo-directory-feasibility-2026-08-16.md` quoted directly where their own claims are the subject of a
finding. Live browser verification was attempted and abandoned for a tool-environment reason (documented in the
preamble), not an app defect; no finding in this report depends on unverified live behavior. Attorney/lawyer
review excluded per instruction throughout, including as a blind spot.
