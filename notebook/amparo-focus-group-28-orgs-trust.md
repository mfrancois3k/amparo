# Focus group 28 — the org page sells a facilitator guide nobody wrote, the honesty page rounds 184 up to 230, and the sitemap advertises the pages that don't exist yet

**Standalone run, 2026-09-13.** Follows `amparo-focus-group-26-grand-audit.md` (FG26)
and `amparo-focus-group-27-offline-lawwatch.md` (FG27). Neither is re-litigated.
FG26's five goldens (HUD reachability, the two "your state" encodings, `href="../"`
exits, paid-artifact overpromising, small trust breaks on the pay screen) and FG27's
five (the "checked" receipt, `sw-routing-check` unwired, two Panic HUDs, the cite-dialect
mismatch, the self-mutating gap test) are **not re-counted** — this file checks only what
the v2.29.4–2.29.7 window changed, plus the brand-new `/organizations` B2B surface and the
static trust/privacy pages, against the tree as it stands today. Attorney/lawyer review is
excluded as a finding per standing instruction; it is in scope only where a UI string makes
a claim *about* review.

**Build under test.** `main` @ `247f0d3` (2026-09-13, *"feat(organizations): dedicated
/organizations + /organizaciones B2B page"*), the tip of the v2.29.7 tag's lineage. Working
tree carries a batch of **untracked, not-yet-committed** work-in-progress —
`privacy/index.html`, `privacidad/index.html`, `new/organizations.html`,
`new/ready-kit.html`, `new/commerce.*`, and the Higgsfield cinema assets. Where a finding
rests on an untracked file, it says so explicitly and is weighted as *staged, not yet live*.

**Method.** Direct read/grep only, no live browser (FG19–27 precedent); one exception —
`node -e` was run against the committed `data/hud.json` to recompute the distinct-cite count
independently rather than trust any prose number (§7). Read in full: `organizations/index.html`,
`organizaciones/index.html`, `about/index.html`, `how-we-verify/index.html`,
`como-verificamos/index.html`, `privacy/index.html`; read by targeted grep: `new/index.html`
(coverage/privacy/nav/org copy), `arena/index.html` (pressure meter, org panel, privacy panel),
`new/aid.html` (analytics init), `pack.html` (PostHog init), `vercel.json`, `sitemap.xml`,
`CHANGELOG.md`.

**Seating (ten of thirteen in `.focus-group/members.md`).** Retiree who distrusts unearned
confidence → Tony (GA); federal-only-state honesty → Ana (AZ); precision-in-Spanish, "reads
as written" → Marisol (NY); payment-trail / no-cloud → Luis (TX); Spanish-first, distrusts
data collection → Rosa (GA); the buyer who hates flaky products, org-forwarder proxy → Dana
(TX); rideshare, does she ever find it → Keisha (Atlanta); non-driver who hunts pages sideways
→ Wes (Brooklyn); PTSD, wants the non-simulated route → Nia (NY); low-vision screen reader →
Omar (Phoenix). **Not seated:** Marcus, Ray, Devin — this window's diff (orgs, trust copy,
privacy, the pressure relabel) doesn't touch their territory (budget/voice-data, firearm
content, the teen results screen) closely enough to earn a fresh seat; none of their prior
findings are re-litigated.

---

## 0. What actually changed in this window, verified

| Claim (from the brief / CHANGELOG) | Verified | Where |
|---|---|---|
| `/pack` backtick boot-freeze fixed | TRUE (not re-audited; boot scripts parse per v2.29.4 note) | `CHANGELOG.md` v2.29.4 |
| Homepage privacy copy now discloses anonymous PostHog counts + scopes the on-device claim | TRUE | `new/index.html:539-540` ("Your words and photos never leave your phone"; "We count anonymous, non-identifying usage — how many packs get built, and in which state") |
| Homepage coverage headline changed from "Works in all 50 states" to a federal-rights framing | TRUE | `new/index.html:544` (`stateTitle:"Federal rights everywhere. Three states cited to statute."`), ES `:658` |
| Arena "BPM/heart rate" relabeled to a simulated pressure meter | PARTLY — label + tutorial fixed, live meter still reads as a pulse (golden-adjacent, §module 1) | `arena/index.html:668` (`pressLbl` = "PRESSURE"), `:819` ("simulated, not your real heart rate") |
| Brand-new `/organizations` + `/organizaciones` B2B pages, mirroring the `/about` static pattern, email/invoice lead path | TRUE | `organizations/index.html`, `organizaciones/index.html`; mailto `orgs@amparohq.com` at `:97` |
| Org page carries the three real packages (Starter $149, Chapter $499, Enterprise custom) | TRUE, and they match the Arena's own org copy | `organizations/index.html:80-94`; `arena/index.html:737-738` |
| "both URLs added to sitemap.xml" (CHANGELOG v2.29.7) | **FALSE** — see golden #3 | `sitemap.xml` (grep `organiz` = 0) |
| Distinct statute cites in `data/hud.json` | 184 (independently recomputed, §7) — **not** the 230 the trust page publishes | golden #1 |

---

## 1. Ten persona reactions

### 🧑 Tony, 61 — GA, retired postal worker, distrusts unearned confidence

The honesty page is the one I respect most in this whole product, so I read it closely, and
it has a number wrong. *"The 230 sections cited on the Arena and Panic HUD lines are not yet
on that watch list"* (`how-we-verify/index.html:66`). The product's own data file carries
**184** distinct cites, not 230 (`data/hud.json`, recomputed §7). It's the exact number FG27
already caught drifting in the code comments — it has now made its way onto the page a
careful reader trusts *because* it counts things honestly. When the page whose whole job is
"we don't overstate" overstates its own denominator by a quarter, that's the one place you
can't afford it.

### 🧑 Dana, 52 — TX suburb, the buyer, hates flaky products

I'd forward the organizations page to my kid's school in a heartbeat — it reads clean and the
prices are right there. Then I read what a school *receives*: *"Facilitator guide (PDF),"*
*"Workshop slide deck and projector/group practice mode"* (`organizations/index.html:72-73`).
None of that exists — no PDF, no deck, and there is no group/projector mode in the Arena at
all (grep across the repo = 0, §7). The "honest status" note only promises to sort out timing
and price for the *printed packs* before charging (`:100`); it says nothing about the guide,
the deck, or the mode not being written. "Flaky" is a page that lists a facilitator guide as a
deliverable before anyone has written a facilitator guide.

### 🧑 Ana, 31 — Phoenix AZ, US citizen, wants the coverage framed honestly

I came to see whether the coverage story is straight, and it's told three different ways in
three places. The homepage: *"Federal rights everywhere. Three states cited to statute"* over
a legend reading *"All 50 states — federal rights"* (`new/index.html:544,546`). The honesty
page: *"all 51 jurisdictions"* carry a "Checked" line and *"every such line carries its
citation"* (`how-we-verify/index.html:59`). So is it 50 or 51? And are three states cited, or
are all fifty-one lines cited with only three *verified*? Both are defensible sentences; they
just aren't the same sentence, and I had to open two pages to notice. Arizona is covered
honestly — that part passes — but "how many states does this cover" has no single answer here.

### 🧑 Marisol, 29 — NY, green-card holder, precision is my whole complaint

The Spanish organizations page reads as written, not translated — *"Responde una persona, no
un sistema de ventas"* is a real sentence (`organizaciones/index.html:98`). Credit for that.
But `como-verificamos/index.html:66` carries the same wrong number as the English —
*"Las 230 secciones citadas"* — so the error is bilingual now, shipped twice. And the
dedicated privacy page (the one titled *"What Amparo stores"*) says flatly *"Marketing
analytics and session recording are disabled"* (`privacy/index.html:63`) while the homepage I
just came from says it counts anonymous usage. Precision means the privacy page and the
homepage can't disagree about whether analytics run.

### 🧑 Luis, 27 — TX, DACA, warehouse, no payment trail, no cloud

The org page's lead path is a `mailto:` — no form posts to a server, nothing at Stripe until
an invoice is agreed (`organizations/index.html:97,100`). That's the right shape for someone
like me; I can email from an address that isn't tied to my name. Where I stop: the page says
*"no member data ever collected"* (`:56`) in the same breath as a CTA that dumps my name, org,
email, group size and **state** into the founder's inbox (`:97`). The participants' data isn't
collected — true — but *my* data as the organizer plainly is, and no privacy line on the page
says what happens to it. "No data collected" next to a form that collects my data is the kind
of sentence that makes me close the tab.

### 🧑 Rosa, 44 — GA, Spanish-first, distrusts anything that wants data

*"Con factura, sin recolectar datos de miembros"* (`organizaciones/index.html:56`) is exactly
the promise my church would want to hear before running a taller. I believe it for the people
in the room. But the page that is supposed to explain what Amparo stores — `/privacidad/` —
is not even finished: it's an untracked file that isn't in the product yet (§7), while the
*sitemap already lists it* for Google to find (`sitemap.xml`). A privacy page advertised to
search engines before it's shipped is backwards from how a trustworthy thing behaves.

### 🧑 Keisha, 34 — Atlanta, rideshare, thirty seconds between fares

I'd only ever land on the org page if a fleet dispatcher sent me the link — and a search
engine will never send me, because `/organizations` and `/organizaciones` are **not in the
sitemap** (`sitemap.xml`, grep = 0), even though the CHANGELOG swears they were added
(`CHANGELOG.md` v2.29.7: *"both URLs added to sitemap.xml"*). The pages that *are* in the
sitemap under those slots are `/privacy/` and `/privacidad/`, which don't exist in the shipped
build yet. The new page that could actually make money is the one hidden from search; the
unfinished ones are the ones advertised.

### 🧑 Wes, 38 — Brooklyn, non-driver, enters everything sideways

Sideways is how I find things, so I found the seam. The homepage links to `/organizations`
with no trailing slash (`new/index.html:798,1008`); the committed trust pages link to
`/about/` *with* a slash; `vercel.json` has no `cleanUrls`, no `trailingSlash`, and no rewrite
for either org URL. It probably resolves via Vercel's directory-index default — but nobody has
confirmed it does, and the inconsistent slashing is the exact kind of thing that 308-redirects
or 404s depending on a config nobody set on purpose (RECON, §7). And the `/privacy` page I dug
up contradicts the homepage on whether analytics run. When I enter sideways I read the pages
against each other, and this quarter they don't agree.

### 🧑 Nia, 41 — NY, survived a violent stop, PTSD

The relabel helped: the tutorial now says the meter is *"simulated, not your real heart rate"*
(`arena/index.html:819`). But that sentence lives only in the tutorial. On the live screen,
during a drill, I see a red ❤️ next to a number that beats faster as I answer badly
(`:668` renders "❤️ 72 PRESSURE"; `updateHeart()` at `:1615` sets the pulse animation to
`60/BPM`). If I skipped or forgot the tutorial — which is exactly what someone in my state does
— a beating heart and a rising number reads as *my* heart rate being measured, which is the
one thing the app swore it wasn't doing. The honest disclaimer isn't where the claim is made.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

The new static pages are the most accessible surfaces in the product: real `<h1>/<h2>`
landmarks, `<ol>/<ul>` structure, a single `<main>`, honest contrast tokens, a working
dark-mode block (`about/`, `how-we-verify/`, `organizations/` all share it). No complaints
there — this is how the whole product should have been built. Where I stop is the same place
Nia does: the pressure meter is an emoji plus a bare `<span id="bpmN">` with no label a screen
reader can announce as anything but a number (`arena/index.html:668`), and the "PRESSURE"
label is a `<small>` that my reader may skip. The one honest word on that widget is the one
most likely not to be read aloud.

**Tally.** Zero unconditional yeses. The static pages earn real credit from Omar, Luis, Rosa
and Marisol for craft and tone. Every "where I stop," though, lands on one of four things: a
number the trust page got wrong (Tony, Marisol), deliverables the org page hasn't built (Dana),
a coverage/analytics story that changes between pages (Ana, Marisol, Wes), or a discoverability
error that hides the shipped page and advertises the unshipped one (Keisha, Rosa, Wes).

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. The honesty page publishes "230 sections" — the real number is 184, in both languages

**Evidence.** `how-we-verify/index.html:66`: *"The 230 sections cited on the Arena and Panic
HUD lines are not yet on that watch list."* `como-verificamos/index.html:66` carries the same
figure in Spanish (*"Las 230 secciones citadas"*). Recomputed independently against the
committed `data/hud.json` (§7): **51 states, 184 lines carrying a cite, 184 distinct cites** —
matching FG27's count and `research/law-watch-gaps.md`, and **not** matching 230. The 230 is
the stale figure FG27 flagged in `tools/law-sources.mjs:4` and `research/law-sources.json:14`
(§6 of FG27); it has since propagated onto the public trust page, in both languages.

**Impact.** Highest by integrity cost. This is the one page whose entire purpose is "we state
exactly what we have and have not done," and it overstates the size of its own unmonitored
gap by 25%, twice. Tony and Marisol both stop here; it is the single clearest gap between what
the repository knows (184) and what the site tells a reader (230).

**Cheapest fix that holds.** Change the two "230"s to 184, or — better, since the number will
drift again — render the sentence from `hudCites(...).size` the way the gap report already
does, so the page can never disagree with the data file. Copy change plus, at most, one small
build substitution. No research required.

### 2. The organizations page sells a facilitator guide, a slide deck, and a projector mode that do not exist

**Evidence.** `organizations/index.html:70-75` lists, under *"What organizations receive"*:
*"Printed bilingual glovebox packs,"* *"Facilitator guide (PDF),"* *"Workshop slide deck and
projector/group practice mode,"* *"Optional co-branding."* The Arena's own org panel says the
same (`arena/index.html:737-738`: *"facilitator guide PDF," "workshop slide deck, projector
practice mode"*). Grep across the repo for `facilitator|projector|slide deck|slide-deck`
outside `notebook/` returns **only these copy strings** — no PDF, no deck file, no
group/projector code path anywhere in `arena/index.html` or `pack.html` (§7). The page's
"honest status" note (`:100`) discloses only that *printed-pack* orders are arranged by email
and invoice before charging; it is silent on the guide, the deck, and the mode not being
written. This is FG26 golden #4's failure mode (paid artifact promises more than exists) on a
new B2B surface that has a real lead-to-invoice path.

**Impact.** Dana's whole reaction. The first $499 "Chapter" buyer pays for a co-branded slide
deck and a projector practice mode believing they are finished products; today they are
sentences. Unlike the consumer ladder (which is honestly gated "in review, not for sale"),
the org packages carry live prices and an active email CTA with no equivalent "not built yet"
hedge on the non-print deliverables.

**Cheapest fix that holds.** Either (a) mark the unbuilt items as roadmap in the same honest
voice the Deep Pack already uses in the Arena (*"planned, not yet available"*), so only the
printed packs read as shippable today; or (b) build the facilitator guide PDF before it is
advertised as a deliverable. The copy fix is one edit in each of `organizations/`,
`organizaciones/`, and the Arena's `oS`/`o1b`/`o2b` strings (`arena/index.html:847`).

### 3. The sitemap advertises the two pages that aren't shipped and omits the two that are — and the CHANGELOG claims the opposite

**Evidence.** `CHANGELOG.md` v2.29.7 states the org build *"and both URLs added to
sitemap.xml."* `sitemap.xml`, committed at the very same commit `247f0d3`, contains **no**
`/organizations` or `/organizaciones` entry (grep `organiz` = 0). It **does** contain
`<loc>…/privacy/</loc>` and `<loc>…/privacidad/</loc>` (`sitemap.xml`) — pages that exist only
as **untracked** files in the working tree and are not part of the committed/shipped build
(§7). So the flagship new revenue surface is invisible to search engines, the two unfinished
privacy pages are advertised to them, and the CHANGELOG asserts a change that was not made.

**Impact.** Keisha never finds the org page; Rosa correctly reads "privacy page in the sitemap
but not in the product" as backwards. This is both a discoverability miss on the one page built
to bring in money and a claim-vs-reality break in the release notes — the kind of thing that,
uncaught, makes every other CHANGELOG line less trustworthy.

**Cheapest fix that holds.** Add the two org `<loc>` entries to `sitemap.xml`; remove (or hold)
the two `/privacy` entries until those pages are actually committed and deployed. Two-line
diff. Longer term, a one-line CI check that every `<loc>` resolves to a committed file would
have caught both halves.

### 4. The privacy story disagrees across surfaces, and /aid meters users with no disclosure at all

**Evidence.** PostHog `capture_pageview:true` fires on the homepage (`new/index.html:66`),
`/pack` (`pack.html:1272`), and `/aid` (`new/aid.html:42`). The homepage and `/pack` disclose
this ("We count anonymous, non-identifying usage," `new/index.html:540`). **`/aid` discloses
nothing** — its only mention of analytics is an HTML *comment* (`new/aid.html:27-30`); no
visible privacy line tells the reader it is metered (grep for visible "analytics/anonymous/
usage" in `new/aid.html` body = 0). Meanwhile the dedicated `/privacy` page states the flat
opposite: *"Marketing analytics and session recording are disabled"* (`privacy/index.html:63`).
The Arena is internally consistent (no PostHog; *"No analytics, no cookies here,"*
`arena/index.html:847`). So across five surfaces the analytics claim ranges from disclosed
(home, pack) to silent (`/aid`) to denied (`/privacy`).

**Impact.** This is the brief's explicit "is the privacy story internally consistent" question,
and the answer is no. Marisol and Wes both catch it. `/aid` is the after-the-stop help page —
the most sensitive branch of the funnel to meter silently — and it is the one with zero
disclosure. `/privacy`, whichever way it's parsed ("marketing" vs "product" analytics), tells
a plain reader analytics are off while three pages run them.

**Cheapest fix that holds.** (a) Reconcile `/privacy` before it ships: say what the homepage
says — anonymous pageview counts via PostHog, replay off — not "analytics disabled." (b) Add
the one-line anonymous-usage disclosure to `/aid` that the homepage already carries. Copy only.

### 5. "How many states are covered" is stated three different ways

**Evidence.** Homepage: *"Federal rights everywhere. Three states cited to statute"*
(`new/index.html:544`) above a legend *"All 50 states — federal rights"* / *"Statute-level
citations"* (`:546`). `about/index.html:64`: *"It does not claim nationwide coverage. Three
states are verified. Every other state page shows the federal rules…"* `how-we-verify/`
:58-59: three states *"Verified"*; a *"Checked"* tier covering *"all 51 jurisdictions,"* where
*"every such line carries its citation."* So the count is **50** (homepage legend) vs **51**
(verify page), and the word *cited* means *three* on the homepage but applies to *all fifty-one*
Checked lines on the verify page (only three of which are *Verified*).

**Impact.** Ana's whole reason for being here. None of the three sentences is wrong on its own;
together they give a reader no single answer to "does this cover my state, and how well." The
50/51 drift is DC; the "cited" ambiguity is the meaningful one — a lay reader can't tell
"cited" (verify page, 51) from "cited to statute" (homepage, 3).

**Cheapest fix that holds.** Pick one sentence and reuse it verbatim on all three surfaces —
e.g. *"Federal rights in all 51 US jurisdictions; three states (TX, GA, NY) verified against
primary statute, the rest cited but not yet verified."* Align the homepage legend to 51 (or
say "50 states + DC"). Copy only.

---

## 3. What must change in the practice MODULES specifically (structure, not officer dialogue)

1. **Move the pressure-meter disclaimer onto the live meter.** `arena/index.html:668` shows
   "❤️ [n] PRESSURE" with a pulse animation (`updateHeart()`, `:1615`); the honest
   *"simulated, not your real heart rate"* text sits only in the tutorial (`:819`). Put a short
   form of it on or beside the live widget, or drop the ❤️ and the heartbeat animation so the
   thing labeled "PRESSURE" stops looking like a pulse. (Golden-adjacent; the single most
   visible residue of the v2.29.6 relabel.)
2. **Give the meter a screen-reader label.** `#bpmN` is a bare number; "PRESSURE" is a
   `<small>` a reader may skip (Omar). An `aria-label` like "simulated pressure level" on the
   meter container makes the honest word the announced word.
3. **Fix the Arena org panel in lockstep with the org page.** `arena/index.html:737-738,847`
   restates the same unbuilt deliverables (facilitator guide PDF, slide deck, projector practice
   mode) as golden #2. Either hedge them as roadmap or link out to `/organizations` instead of
   re-asserting them inside the practice surface.
4. **Decide whether the practice modules are part of the org offer at all.** The org page sells
   a *"projector/group practice mode"* that the Arena does not implement. If group/projector
   practice is a real product direction, it's a module feature to spec; if not, it should leave
   the sales copy. Don't advertise a practice mode the practice engine doesn't have.
5. **Carryover, not re-counted (still open from FG26/27):** the two "your state" encodings and
   the `href="../"` exits (FG26 #2/#3), the "(Checked)" label with no coverage clause (FG27 #1),
   and `sw-routing-check` unwired from CI (FG27 #2). Flagged here only so the module backlog
   stays visible; none is re-litigated as new.

---

## 4. Missing / broken things the personas expect, each checked before claiming

| Expected | Verified state | Who |
|---|---|---|
| The org page's non-print deliverables to exist | Facilitator guide PDF / slide deck / projector mode: 0 files, 0 code paths (grep §7) | Dana |
| The shipped org URLs to be discoverable | `/organizations`, `/organizaciones` absent from `sitemap.xml` (grep = 0) | Keisha |
| The sitemap to list only shipped pages | `/privacy/`, `/privacidad/` listed but untracked/unshipped (`sitemap.xml`; `git status`) | Rosa, Wes |
| Analytics disclosed wherever they run | `/aid` fires PostHog with no visible disclosure (`new/aid.html:42` vs body grep = 0) | Marisol |
| One privacy claim, not three | `/privacy` "analytics disabled" vs homepage "we count anonymous usage" | Marisol, Wes |
| One coverage sentence across pages | 50 vs 51; "cited" = 3 vs 51 (home / verify) | Ana |
| A privacy line for the org lead data collected via mailto | none on `organizations/index.html` despite name/org/email/state capture (`:97`) | Luis |
| The trust-page numbers to match the data | 230 published vs 184 actual | Tony |
| Clean org-URL routing | no `cleanUrls`/`trailingSlash`/org rewrite in `vercel.json`; homepage links no-slash `/organizations` — resolves by directory-index default, unconfirmed (RECON) | Wes |

Not repeated from FG26/FG27 (still open there, untouched by this window): HUD reachability,
the "(Checked)" receipt, the cite-dialect mismatch, `sw-routing-check` in CI.

---

## 5. Blind-spot questions a top UX researcher would ask, not asked in rounds 26/27

**BS-1. Which page is the canonical privacy statement — the homepage's in-page `#privacy`
section, or `/privacy`?** They already disagree (golden #4), and nothing on either declares
itself authoritative. When a user, a journalist, or a partner quotes "Amparo says analytics
are disabled," which sentence are they entitled to rely on? Decide, then make the other page
defer to it.

**BS-2. The free consumer funnel is instrumented; the paid org funnel is completely dark.
Was that a decision?** PostHog fires on `/`, `/pack`, `/aid`. The org pages, the about page,
and how-we-verify are pure static HTML with no analytics — so the one path that leads to money
(`/organizations` → `mailto`) produces zero data about whether anyone reads it, scrolls the
packages, or clicks the CTA. The product measures the thing it gives away and not the thing it
sells.

**BS-3. "No member data ever collected" sits above a form that collects the organizer's data —
who reconciles that, and what happens to the lead emails?** `organizations/index.html:56` vs
`:97`. The claim is true for *participants* and false-sounding for the *organizer*. Has anyone
written where an `orgs@amparohq.com` lead — name, org, email, group size, state — is stored,
for how long, and whether that inbox is subject to the same "we don't keep what we don't need"
posture as the rest of the product?

**BS-4. Are any trust-page numbers generated from source, or are they all hand-typed?** The
230/184 error (golden #1) is the second time (after FG27's code comments) the same wrong number
has been transcribed by hand. If every figure on `/about` and `/how-we-verify` is hand-maintained,
they will keep drifting from `data/hud.json` every time the bank changes. Which numbers on the
trust pages are computed, and which are a person's memory of a number?

**BS-5. Before advertising a "Chapter — $499" package with a co-branded deck and a projector
mode, is the build order write-then-sell or sell-then-build?** If the first buyer's invoice
funds the first facilitator guide, the page is describing a product that only exists once
someone pays for it — which is a different promise than the printed-pack "arranged by email"
note discloses. Name the build order.

**BS-6. Does `/organizations` (no trailing slash, no `cleanUrls`) actually resolve in
production?** The homepage's own CTA links there. This has not been confirmed against a live
Vercel deploy this round (RECON) — and it is the click that turns a reader into a lead. Load it
once on the real host.

---

## 6. A small thing worth naming: the "230" has now drifted onto a third surface

FG27 §6 flagged the stale **230** in `tools/law-sources.mjs:4` and
`research/law-sources.json:14` while the generated truth was 184. Those two comments are still
230 today (unchanged), and the number has since been transcribed by hand onto
`how-we-verify/index.html:66` and `como-verificamos/index.html:66`. One stale figure has become
four, two of them now public and bilingual. This is the concrete argument for BS-4: a number
that isn't computed from the data will keep spreading to every new page that quotes it.

---

## 7. Verification log

- Commit under test: `247f0d3` (2026-09-13, tip of the v2.29.7 lineage). Working tree has
  untracked WIP: `privacy/`, `privacidad/`, `new/organizations.html`, `new/ready-kit.html`,
  `new/commerce.*`, cinema assets (`git status --short`). Findings on untracked files are
  weighted *staged, not live* and say so.
- Node over committed `data/hud.json`: **51 states, 184 lines carrying a cite, 184 distinct
  cites** — matches FG27 and `research/law-watch-gaps.md`; contradicts the "230" on
  `how-we-verify/`, `como-verificamos/`, `tools/law-sources.mjs:4`, `research/law-sources.json:14`.
- PostHog init confirmed with `capture_pageview:true`, `autocapture:false`,
  `disable_session_recording:true` on: `new/index.html:61-70`, `pack.html:1263-1281`,
  `new/aid.html:37-46`. `arena/index.html`: no PostHog (grep = 0); privacy panel `:847` says
  *"No analytics, no cookies here."*
- Grep-negatives (absence, not intent): `facilitator|projector|slide deck` outside
  `notebook/` = only the org-copy strings in `organizations/`, `organizaciones/`, `arena/`,
  `new/` (no PDF, no deck file, no group/projector code); `organiz` in `sitemap.xml` = 0;
  `/privacy` in `sitemap.xml` = 2 (`:376,:394`); visible analytics disclosure in
  `new/aid.html` body = 0 (only the `:27-30` comment); `cleanUrls`/`trailingSlash` in
  `vercel.json` = 0; org rewrite in `vercel.json` = 0.
- Coverage strings: `new/index.html:544` (`stateTitle`), `:546` (`stateLegendAll`,
  `stateLegendCited`), ES `:658`; `about/index.html:64`; `how-we-verify/index.html:58-59`.
- Pressure relabel: `arena/index.html:668` (`pressLbl`="PRESSURE"), `:819` tutorial disclaimer,
  `:1615` `updateHeart()` pulse animation, `:1408/:1631` `window.__BPM` still the internal var.
- CHANGELOG cross-check: v2.29.7 entry claims *"both URLs added to sitemap.xml"* —
  contradicted by `sitemap.xml` (grep §above). v2.29.5/2.29.6 privacy and relabel claims
  verified above.
- **RECON, not asserted:** whether `/organizations` (no trailing slash, no `cleanUrls`)
  resolves on the live Vercel host (BS-6); whether the untracked `/privacy` pages will deploy
  from the current branch (they are in the sitemap regardless); whether `orgs@amparohq.com`
  lead handling has any written retention policy (BS-3) — no such doc found this session.
- Excluded per standing instruction: attorney-review as a finding. In scope and flagged: UI
  strings describing coverage, verification status, and analytics, because those are copy.

## 8. Signature

Ten seated personas from `.focus-group/members.md` — Tony, Dana, Ana, Marisol, Luis, Rosa,
Keisha, Wes, Nia, Omar. Five goldens, five module items, nine missing/broken expectations,
six blind spots, one self-referential drift (the "230" now on four surfaces, two of them
public and bilingual). Every `file:line` was opened this session against `247f0d3`; the
184-vs-230 count was recomputed independently, not quoted from any single source.
