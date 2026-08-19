# 32 — Amparo's free organic traffic engine (Facebook demoted to Track D)

**Wargame, not a plan. 2026-08-19, post-v2.26.1. Revision 2 — organic-first.**
Mission brief: [`tasks/32-facebook-traffic-engine.md`](../tasks/32-facebook-traffic-engine.md).
Executor: a mid-tier model (Sonnet) running this blind, plus one human (Michael) for the moves
marked **HUMAN ONLY**.

Revision 2 supersedes revision 1 (paid-Facebook-first). The operator's added requirement — *"I
still want this altered so it's automatic so I don't need to do anything"* — plus five videos and
a second recon pass moved the centre of gravity. Paid Facebook is no longer the primary channel;
it is Track D, deferred and optional. Revision 1's paid moves survive in §6, unchanged in
substance but re-numbered.

Recon, all read-only, all verified against current source: root `index.html`, `arena/index.html`,
`app-src/convex/stripe.ts`, `vercel.json`, `sitemap.xml`, `robots.txt`, `law-status.json`,
`research/state-law-matrix.md`, `research/law-watch.json`, `tools/law-watch.mjs`,
`.github/workflows/law-watch.yml`, `package.json`, `CHANGELOG.md` v2.26.1,
`wargames/31-paywall-meets-ladder.md`, Meta SIEP policy, the Notion "Facebook Automation Guide",
and two `/watch-bulk` digests covering five videos.

---

## 1. The six facts that shape every move

| # | Fact | Evidence | Consequence |
|---|---|---|---|
| 1 | **There is no paid product.** `PAYMENTS_LIVE=false`; no entitlement granted; no Script/Deep Pack artifact exists. | `CHANGELOG.md` v2.26.1 | Objective is traffic → completed free pack → owned email. Any ad or page promising a paid pack is a hard abort. |
| 2 | **`sitemap.xml` contains exactly one URL.** The entire product is one page. | `sitemap.xml`, verified | Zero surface for the highest-intent free query in the category ("know your rights traffic stop [state]"). This is the root cause of Facts 4 and 5 both. |
| 3 | **`robots.txt` already declares the strategy, and it is unexploited.** "The rights content here is the only crawlable know-your-rights material in this category (every competitor is a native app). Crawling it is the point." | `robots.txt`, verbatim | The moat is written down and worth nothing at one URL. Closing the gap between the stated strategy and the shipped sitemap is the single highest-leverage move available. |
| 4 | **Every free channel gates on publication posture, not traffic.** Credentialed About page, editorial policy, multiple attributed articles, neutral tone, real article URLs. Stated independently by all three organic videos. | `watch-bulk-amparo-organic/digest.md` | Amparo currently reads as a tool site. One fix — a publishing surface — unblocks LLM citation, aggregators, trade press and search simultaneously. |
| 5 | **State content cannot be mass-generated.** Only TX/GA/NY are live. `research/state-law-matrix.md`: "No row enters `STATES` in `index.html` until it is (a) VERIFIED against primary statute text, and (b) reviewed by an attorney licensed in that state." | `research/state-law-matrix.md`, verbatim | Programmatic 50-state SEO is **blocked**, correctly, by Amparo's own standard. The engine scales on *format and language*, not on unverified states. |
| 6 | **Facebook paid carries a category risk organic does not.** Meta's SIEP category covers civil-and-social-rights advocacy: ID verification, "Paid for by" disclaimer, no detailed targeting, no ZIP, 15-mile minimum radius, 18–65+. | Meta Transparency Center | **SIEP is an *ads* policy.** Going organic-first removes the entire constraint, along with payment method, ID verification and budget approval. This is why Track D is deferred, not merely deprioritised. |

**Two more recon results that changed specific moves:**

- **`vercel.json` has no `rewrites` or `routes` block — only `headers`.** So `/api/*` has no
  routing conflict, and `package.json` is already named `amparo-api` and describes itself as deps
  for Vercel functions. But the CSP lists **no Facebook origin** in `script-src` or `connect-src`,
  and sets `object-src 'none'`, `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`. A
  browser Pixel would require weakening that CSP. Server-side CAPI needs only `connect-src 'self'`,
  already allowed. **Consequence: Move D1 keeps CAPI as the only route and drops the Pixel fallback.**
- **No PDF generator exists anywhere.** Printing is `window.print()` at `index.html:3562`; the
  label `v_print_pdf` ("Print (AirPrint) or save as PDF") leans on the OS dialog's Save-as-PDF
  destination, and a comment at `index.html:1948` documents a real user hitting exactly that
  confusion. **Consequence: Move C2's offer is "email me my link", never "email me the PDF."**
  Promising a non-existent file is Fact 1's failure mode repeating.

---

## 2. The automation ladder — the honest answer to "I don't want to do anything"

This is the load-bearing section of revision 2. The request is achievable, but not in the shape it
was asked in, and the videos say so themselves.

**Every one of the five videos bottlenecks on a human at the moment of placement, and each states
it explicitly.** Wikipedia bans undisclosed automated promotional editing — a block would
permanently poison amparohq.com as a citable domain. Aggregator submissions are human editorial
review with 2–3 week latency and unpublished criteria. Trade-press editors screen for AI-written
submissions and the penalty is permanent ("they're going to ignore you and anything else you come
with in the future"). And Amparo's own `state-law-matrix.md` requires an attorney per state.

**These gates are not friction to be engineered away. They are the thing that makes the channel
worth having** — they are why a placement compounds instead of decaying, and in Amparo's case
they are also what keeps the legal content true.

So the achievable shape is **front-loaded, not absent**:

| Tier | What | Ongoing effort |
|---|---|---|
| **Zero-touch forever** (Tracks A + B) | Generated pages, sitemap, JSON-LD, RSS, outreach-target discovery, republisher crawl, citation-gap topic mining, scheduled organic posting from already-verified content | **None.** Runs on cron after it is built. |
| **One-time human sprint** (Track C) | Create the FB page; write two evergreen bilingual pieces; press send on pitches; submit to aggregators once | **~1 weekend, once.** Then the backlinks and republication cascade compound unattended forever. |
| **Permanently human** (irreducible) | Attorney review per new state; approving any spend | **Per new state only.** Zero if the engine runs on the 3 verified states. |

**Read the bottom row carefully: if Amparo ships no new states, the permanently-human column is
empty.** The engine runs on TX/GA/NY plus non-jurisdictional content indefinitely with no ongoing
work at all. Adding states is a growth choice that costs attorney time — that is the real trade,
and it is Michael's to make, not the executor's.

---

## 3. TRACK A — the publishing surface (fully automatable, unblocks everything)

### Move A1 — Capture the traffic signal with what is already installed

- **Action:** on load in root `index.html`, read `utm_source`, `utm_medium`, `utm_campaign`,
  `utm_content` and `ref` from `location.search`; persist to `localStorage` under `amparo_attr`
  (first-touch — do not overwrite an existing value); register them as PostHog super-properties so
  every subsequent event carries them; and capture three events: `pack_started` (state chosen),
  `pack_printed` (print button), `email_captured` (Move C2). PostHog is already live in root with
  key `phc_y5LzPeRZJpRMFYEt7EZgeCewBoBDWC3GvW5fBFveMf6K` behind the `ph.amparohq.com` proxy.
- **Why this and nothing more:** organic-first needs no Meta Pixel and no Conversions API. PostHog
  is installed, is CSP-allowed (`connect-src` lists `https://ph.amparohq.com`), and already carries
  the privacy posture v2.26.1 wrote. **No new endpoint, no CSP change, no privacy-copy rewrite.**
  Meta CAPI is deferred to Move D1 and is only built if Track D ever runs.
- **Expected observation:** visiting `?utm_source=test&utm_medium=organic` then completing a pack
  shows `pack_started` and `pack_printed` in PostHog Live Events, each carrying
  `utm_source: "test"`. `localStorage.amparo_attr` holds the first-touch object.
- **Most-likely failure → signal → counter-move:**
  - Events fire but carry no UTM → super-properties registered after the first `capture()` →
    register before any capture call, in the same block that reads the query string.
  - Second visit overwrites first-touch → the write is unconditional → guard on
    `if (!localStorage.amparo_attr)`.
  - Nothing appears in PostHog at all → the proxy at `ph.amparohq.com` is failing → root already
    documents a fallback to `us.i.posthog.com`; check the DNS/cert note in `index.html` before
    assuming the code is wrong.
  - `pack_printed` never fires → `onclick="window.print()"` at `index.html:3562` is inline and has
    no hook → wrap it, do not replace it; the button's gold/ghost state logic depends on `hasPrinted`.
- **Fork trigger:** if PostHog is unreachable for more than 24h, take Route B — log the same three
  events to a Convex table via the existing guest-write pattern (`app-src/convex/http.ts:39,45`).
  Do **not** add a second analytics vendor.
- **RECON NEEDED:** none. R1 (Vercel routing), R2 (splash gate) and R4 (PDF) are settled — see §7.
- **Abort condition:** if capturing attribution would require storing anything that identifies a
  person, stop. First-touch UTM values are campaign metadata, not user data; keep it that way.
- **Verification run:** load `?utm_source=test&utm_medium=organic` → check `localStorage` →
  pick a state → print → confirm both events in PostHog with the UTM attached → reload with
  different UTMs → confirm first-touch did **not** change. **Pass = all five.**

### Move A2 — Turn one URL into a real publishing surface

- **Action:** generate static pages at build time from data Amparo already holds, and regenerate
  `sitemap.xml` from the same source so it can never drift.
  1. **Per-state rights pages, verified states only:** `/rights/tx`, `/rights/ga`, `/rights/ny`
     and their Spanish twins `/derechos/tx|ga|ny`. Six URLs. Content comes **only** from the
     `STATES` object already shipped in `index.html` — the attorney-reviewed rows. Fact 5 forbids
     anything else.
  2. **Non-jurisdictional pages**, which need no per-state attorney review because they make no
     state-law claim: what a window card is; how to prepare documents before you drive; what the
     pack contains; the bilingual angle. EN + ES.
  3. **A methodology page** — see Move A3.
  4. Each page: `<title>`, meta description, canonical, `hreflang` pairing EN↔ES, JSON-LD
     (`Article` + `FAQPage` where the content is Q&A shaped), and a visible link into the app
     carrying `?utm_source=organic&utm_medium=page&utm_content=<slug>`.
  5. Regenerate `sitemap.xml` from the generated file list. Never hand-edit it again.
- **Format:** follow the source-synthesis structure the organic batch identified — a title that
  answers the claim directly, attributed statements, a source link per claim, and a reference
  section. That is what makes a page LLM-quotable, and Amparo's statute citations already supply
  the references.
- **Expected observation:** `sitemap.xml` lists ~15–20 URLs instead of 1. Each renders standalone
  with no JS required for its main text. Google Rich Results Test validates the JSON-LD.
- **Most-likely failure → signal → counter-move:**
  - Generated state text drifts from `index.html`'s `STATES` → two sources of truth → generate
    from `STATES` at build; never transcribe. If `STATES` cannot be imported cleanly, extract it to
    a JSON file that both consume — one source, two readers.
  - Pages render blank without JS → content injected client-side → these must be static HTML;
    the whole point is crawlability (Fact 3).
  - `hreflang` rejected → self-referential tag missing → each page must reference both itself and
    its twin.
  - Thin-content penalty risk → a page per state that says almost nothing → **do not generate a
    page for a state without real verified content.** Three good pages beat fifty empty ones, and
    Fact 5 already forbids the fifty.
- **Fork trigger:** if the build cannot import `STATES` without a build step (root `index.html`
  has none per `package.json`), take Route B — a small Node generator script run by a GitHub
  Action that reads the extracted JSON and writes the HTML files, committed like `law-status.json`
  already is.
- **RECON NEEDED:** R5 — is `STATES` a clean parseable object literal in root `index.html`, or is
  it interpolated? Check: read the `STATES` declaration before writing the generator.
- **Abort condition:** any generated page would state a rule for a state not marked VERIFIED in
  `research/state-law-matrix.md`. Stop. This is the one rule the whole product rests on.
- **Verification run:** build → confirm sitemap URL count → fetch each page with JS disabled and
  confirm the rights text is present → run one EN and one ES page through the Rich Results Test →
  confirm each links into the app with its UTM. **Pass = all four.**

### Move A3 — Clear the publisher gate (Fact 4), using the rigor that already exists

- **Action:** publish the three pages every free channel screens for.
  1. **About, with credentials** — who is behind Amparo, what the attorney-review standard is, how
     states get added.
  2. **Editorial and verification policy** — this writes itself from `research/state-law-matrix.md`:
     the VERIFIED / LIKELY / UNVERIFIED confidence ladder, the rule that nothing ships without
     primary-statute verification plus a licensed attorney, and the daily source check that
     `law-watch.mjs` already runs. Include the honest limitation the script's own header states:
     it detects *source-page change*, it does not verify the law.
  3. **A methodology / corrections page** — publish the finding that the widely-copied Wikipedia
     "stop and identify" list is **wrong on four of the ten states researched**, with the Missouri
     worked example (Mo. Rev. Stat. §84.710(2) governs St. Louis and Kansas City police departments
     only, not the state; confirmed against revisor.mo.gov).
- **Why move 3 matters more than it looks:** it is simultaneously the credibility artifact that
  clears Fact 4's gate, a genuinely novel research finding that trade editors want (Track C's data
  angle), and precisely the "source synthesis" artifact the LLM-citation video describes — without
  touching Wikipedia at all.
- **Expected observation:** three static pages, linked from the footer of every generated page and
  from root, each with a named author and a last-reviewed date.
- **Most-likely failure → signal → counter-move:**
  - The About page overclaims credentials → v2.26.1's exact failure mode, on the page where trust
    is the product → state only what is true; "reviewed by an attorney licensed in that state" is
    already a strong claim and it is real.
  - The corrections page reads as an attack on Wikipedia → reframe as source-transparency: here is
    what we checked, here is the primary source, here is why we differ.
  - The corrections page makes state-law claims → **it does**, so it goes through the same attorney
    gate as any state content before publishing.
- **Fork trigger:** if attorney review of the corrections page is not available, publish About and
  the editorial policy alone. They clear Fact 4's gate; the corrections page is the bonus.
- **RECON NEEDED:** R6 — which states in `state-law-matrix.md` are marked VERIFIED versus LIKELY?
  Check: read the confidence column before quoting any of it publicly. **Only VERIFIED rows may
  appear on a public page.**
- **Abort condition:** publishing any LIKELY or UNVERIFIED row as fact.
- **Verification run:** load all three pages → confirm each names an author and a review date →
  confirm zero LIKELY/UNVERIFIED claims appear → confirm footer links from a generated state page.
  **Pass = all four.**

### Move A4 — Ship the RSS feed (the one unattended aggregator channel)

- **Action:** generate `/feed.xml` at build from the generated page list, and append an item when
  `law-watch.mjs` reports a changed source **after** a human has re-reviewed it. The existing
  workflow already commits `law-status.json` daily at 09:17 UTC and opens a review issue on change
  — extend that job, do not build a second one.
- **Expected observation:** `/feed.xml` validates as RSS 2.0 and lists every generated page.
  Feedly accepts the URL on first try.
- **Most-likely failure → signal → counter-move:**
  - Feed is nearly empty forever → `law-status.json` shows `sourcesWatched: 4`, `needsReview: []`
    → **this is expected and must be planned for.** A statute-change feed emits a handful of items
    a *year*. Seed the feed with the generated pages so it has real content from day one, and treat
    statute changes as a bonus item type, not the feed's substance.
  - Aggregator rejects for low cadence → the feed is not a news feed → that is honest; Amparo is a
    reference, not a newsroom. Do not manufacture cadence with filler. Take the rejection.
- **Fork trigger:** if two aggregators reject for cadence, **stop submitting to aggregators** and
  keep the feed for Feedly and direct subscribers only. Do not start a content calendar to satisfy
  an aggregator — that converts a zero-touch asset into a recurring obligation, which is exactly
  what §2 exists to prevent.
- **RECON NEEDED:** none.
- **Abort condition:** none.
- **Verification run:** validate the feed → subscribe in Feedly → confirm items render with title,
  link and description. **Pass = all three.**

---

## 4. TRACK B — unattended discovery (cron, zero ongoing touch)

### Move B1 — Weekly outreach-target discovery

- **Action:** a weekly GitHub Action (mirror `law-watch.yml`'s shape) running the five operators
  the organic batch identified, across Amparo's niches, in both languages, and writing deduped
  domains into a Convex or Supabase table with the guidelines fields extracted.
  - Operators, verbatim: `<niche> + write for us`, `+ submit a story`, `+ contribute`,
    `+ submit a guest post`, `+ editorial guidelines`.
  - Niches: immigration rights, legal aid, civil rights, Latino community news, driver education,
    public defender, know your rights, traffic safety, nonprofit tech, bilingual services.
  - Crawl SERP pages 1–5 — pages 3–5 hold the low-competition targets.
  - Per target extract four fields: word count, tone, topics accepted, links-in-body vs bio-only.
- **Expected observation:** first run yields ≥40 deduped domains with guidelines parsed for the
  majority.
- **Most-likely failure → signal → counter-move:**
  - Search API rate-limited or costed → 100 queries/week is small but not free → run monthly, not
    weekly; the target list is slow-moving and there is no benefit to freshness here.
  - Guidelines page not parseable → PDF or JS-rendered → store the URL with a `parse_failed` flag;
    do not block the row.
  - Table fills with irrelevant domains → operators are too broad → tighten by requiring the niche
    term in the page body, not just the query.
- **Fork trigger:** if fewer than 15 relevant domains after two runs, the niche list is wrong, not
  the operators. Reseed from Move B2's republisher data before adding more queries.
- **RECON NEEDED:** R7 — which search API is available and at what cost? Check: whether an existing
  key (Firecrawl is present in `.firecrawl/`) covers SERP results, before provisioning anything new.
- **Abort condition:** none. This move never contacts anyone; it only builds a list.
- **Verification run:** inspect the table → confirm ≥40 rows, deduped by domain, with ≥50% having
  parsed guidelines. **Pass = all three.**

### Move B2 — The republisher crawl (the only compounding-forever asset)

- **Action:** after any Track C placement lands, a scheduled job searches the exact headline weekly
  and adds every republishing domain to the target table. Sibling verticals republish each other,
  so the link graph expands with no further input.
- **Expected observation:** within 30 days of a placement, ≥1 republisher found.
- **Most-likely failure → signal → counter-move:**
  - Zero republishers → the piece was not picked up, or the headline is too generic to search →
    search a distinctive quoted phrase from the piece instead of the headline.
  - Republishers strip the byline link → the backlink did not transfer → record it anyway; the
    citation still feeds LLM training corpora even without a link.
- **Fork trigger:** none.
- **RECON NEEDED:** none.
- **Abort condition:** none.
- **Verification run:** run once against a known-published third-party article to confirm the crawl
  finds its known republishers. **Pass = it finds at least one.**

### Move B3 — Citation-gap topic generator (mining only, no edits)

- **Action:** query the MediaWiki API for `[citation needed]` claims — `Category:All articles with
  unsourced statements` plus `{{Citation needed}}` transclusions — filtered to Amparo's keyword set
  (traffic stop, Miranda, Fourth Amendment, consent search, stop and identify, police encounter,
  immigration checkpoint). Use the results as a **topic queue only.**
- **Explicitly out of scope: editing Wikipedia.** Undisclosed automated or promotional editing
  violates Wikipedia's COI and bot policy; a block or spam-blacklist entry would permanently
  destroy amparohq.com as a citable domain — the exact asset Tracks A and C exist to build. The
  corpus is free to read. Reading it is the whole move.
- **Expected observation:** a ranked list of unsourced claims in Amparo's domain, refreshed monthly,
  usable as evergreen article topics.
- **Most-likely failure → signal → counter-move:**
  - Claims are too broad to write about → the keyword filter is catching category pages → filter to
    claims whose surrounding paragraph contains a jurisdiction or a statute reference.
  - Every claim needs legal review → **yes, it does** → this queue feeds Track C's human sprint; it
    does not auto-publish. That is the design, not a defect.
- **Fork trigger:** if the queue produces no claim that survives Fact 5's verification standard,
  drop this move entirely. It is the least load-bearing in the document.
- **RECON NEEDED:** none.
- **Abort condition:** any move toward automated Wikipedia editing.
- **Verification run:** run once → confirm ≥10 in-domain claims returned, each with article URL and
  claim text. **Pass = both.**

---

## 5. TRACK C — the one-time human sprint, then done

**This is the whole irreducible human cost of the organic engine.** Roughly a weekend. After it,
Tracks A and B run unattended and the placements compound forever.

### Move C1 — HUMAN ONLY: two evergreen bilingual pieces, and press send

- **Action (Michael):** write two pieces and pitch them to targets from Move B1.
  - **Piece 1, the data angle:** the Wikipedia-is-wrong-on-four-of-ten-states finding from
    `state-law-matrix.md`. Genuinely novel, verifiable, and exactly what a trade editor wants.
  - **Piece 2, the resource angle:** the bilingual traffic-stop pack, aimed at immigration,
    legal-aid and Latino verticals.
  - Pitch = 4 parts: short specific headline; one credibility line; 1–2 sentences on reader
    relevance; close with an offer to send a draft. Never include: an attachment, a link to the
    story, a long backstory, or links to other writing.
- **Why a human writes these:** the trade-press channel screens for AI-written submissions and the
  penalty is permanent blacklisting of the sender across future pitches. Amparo's advantage here is
  real — free, non-commercial and bilingual defuses the top rejection reason — and it is not worth
  trading for a weekend of writing time.
- **Expected observation:** 2 pieces, 6–12 pitches sent, ≥1 placement within 60 days.
- **Most-likely failure → signal → counter-move:**
  - No replies → pitches went to the wrong desks → re-sort targets by `links-in-body` (from B1);
    bio-only outlets are lower value but far higher acceptance.
  - Editor asks for exclusivity → normal → accept for piece 1, decline for piece 2; the resource
    piece is worth more republished than exclusive.
  - A placement misstates the law after editing → **this is the real risk of the whole track** →
    request copy approval on any legal claim before publication, in the pitch, in writing.
- **Fork trigger:** if zero placements after 12 pitches, stop pitching and rely on Tracks A + B.
  Do not scale outreach volume — the channel rewards fit, not throughput.
- **RECON NEEDED:** none.
- **Abort condition:** any outlet publishes an Amparo legal claim without the attorney-reviewed
  wording. Request correction immediately.
- **Verification run:** confirm each pitch matches the 4-part structure and omits the 4 forbidden
  elements. **Pass = all pitches conform.**

### Move C2 — The email ask: "email me my link", not the PDF

- **Action:** at the pack-complete step, offer to email a link back to the completed pack. One
  field, one button, EN + ES. Store via the existing Convex guest-write pattern
  (`app-src/convex/http.ts:39,45`) — no new list vendor. Fire Move A1's `email_captured`.
- **The offer is a link, not a file.** Recon settled it: no PDF generator exists anywhere; printing
  is `window.print()` at `index.html:3562`, relying on the OS dialog's Save-as-PDF destination.
  Promising a PDF would be Fact 1's failure mode repeating on a smaller scale.
- **Expected observation:** submitting returns 200, the row lands in Convex, the email arrives
  within 60s, `email_captured` fires with first-touch UTM attached.
- **Most-likely failure → signal → counter-move:**
  - Mail lands in spam → sending domain lacks SPF/DKIM/DMARC → **HUMAN ONLY (H8)**; must be done
    before this move counts.
  - Convex write rejected → auth required → use the guest pattern; do not invent a second auth shape.
  - Nobody submits → the ask arrives before the value → place it after the pack is on screen, never before.
- **Fork trigger:** if capture is under 8% of completed packs after 200 completions, demote the ask
  to a secondary link and keep print as the primary action. A list bought with a worse product
  experience is not worth it.
- **RECON NEEDED:** none. R4 settled — see §7.
- **Abort condition:** if delivering the pack by email would mean transmitting user document data
  off-device, stop. That contradicts the product.
- **Verification run:** submit EN → receive → submit ES → receive Spanish copy → unsubscribe →
  confirm suppression. **Pass = all four.**

### Move C3 — HUMAN ONLY: the Facebook page, organic only

- **Action (Michael):** create the Page. Executor supplies setup.
  - **Topic name, not the product name** — a know-your-rights page that points to Amparo.
  - **An education/public-service category, NOT "News personality."** The Notion guide's demo uses
    News personality; for police-stop content that reads as a news/opinion outlet.
  - Post from Track A's generated pages — content that is already attorney-verified. **Never the
    scraped-repost loop from the Notion guide.** For a legal-trust product that trades the moat for
    reach.
  - Cadence: 3/day on a US-timezone window, scheduled from the existing page inventory. Each post
    links with `?utm_source=facebook&utm_medium=organic&utm_content=<slug>`.
- **No Business Manager, no ad account, no payment method, no ID verification.** Organic only —
  that is what removes Fact 6 entirely.
- **Expected observation:** after 14 days, per-post reach varies by >5× between best and worst.
  That variance is the seed-audience gate working, and it is free creative testing.
- **Most-likely failure → signal → counter-move:**
  - All posts flat near zero → no audience yet → expected for ~2 weeks; do not change strategy
    before day 14. The documented failure mode of this channel is abandonment, not bad content.
  - Reach collapses on link posts → link-heavy posts are down-ranked → alternate link-in-first-
    comment and measure the difference explicitly.
  - A post is flagged → copy drifted toward advocacy → posts must describe the artifact, not argue
    a position.
- **Fork trigger:** if after 30 days no post exceeds 3× median reach, the hook library is wrong,
  not the cadence. Do not add volume.
- **RECON NEEDED:** R8 — which education/public-service Page category exists at creation time?
  Meta's list changes. Check the picker and log the chosen string.
- **Abort condition:** Page restricted → appeal; never open a second Page.
- **Verification run:** day 14, export per-post reach → ≥30 posts, zero missed days, ≥5× spread.
  **Pass = all three.**

### Move C4 — HUMAN ONLY: aggregator submissions, one hour, one time

- **Action (Michael):** submit to Ground News (burger menu → "Suggest a source"), Flipboard,
  News Break, Smart News, Apple News. Feedly needs no submission — it ingests Move A4's feed
  directly. Set a day-21 reminder; if silent, email editors once via Contact us.
- **Expected observation:** confirmation or silence. Criteria are unpublished; 2–3 week latency is
  normal.
- **Most-likely failure → signal → counter-move:**
  - Rejected for not being a news publisher → **correct, Amparo is a reference** → do not
    manufacture a newsroom to qualify. Take the rejection and keep Feedly.
- **Fork trigger:** two rejections for cadence → stop submitting (see Move A4's fork).
- **RECON NEEDED:** none.
- **Abort condition:** none.
- **Verification run:** confirm each submission acknowledged or logged as sent. **Pass = all logged.**

---

## 6. TRACK D — paid Facebook, deferred and optional

Track D runs **only** if Michael chooses to spend, and only after Tracks A–C have produced proven
hooks. It carries every cost organic does not: payment method, ID verification, SIEP exposure
(Fact 6), attorney sign-off on ad claims, and per-change approval. Revision 1's moves survive here.

- **Move D1 — Meta CAPI, server-side only.** Build `api/capi.js` sending `fbc` +
  `client_ip_address` + `client_user_agent`; no PII ever. `vercel.json` has no routing conflict
  and `connect-src 'self'` already permits it. **The browser-Pixel fallback from revision 1 is
  removed** — recon showed it requires adding `connect.facebook.net` to both `script-src` and
  `connect-src`, weakening a deliberately tight CSP, on top of the privacy-copy rewrite.
- **Move D2 — the category test.** One ad, minimum budget, no declared category, submitted to find
  out. Three outcomes: approved / rejected citing SIEP / approved with restrictions. Outcome
  decides Route A (full targeting) or Route B (ID verification, disclaimer, broad only). Recon
  cannot settle this from outside Meta; the submission **is** the check.
- **Move D3 — first spend.** `{{DAILY_BUDGET}}` default $20/day across three ad sets varying only
  by language/audience: English broad US; **Spanish broad US** (permitted under SIEP and Amparo's
  strongest lever); English restricted to TX/GA/NY. Creatives come only from organic winners.
- **Move D4 — the scale/kill ladder.** CPL ≤ 0.7× median with ≥20 conversions → scale +20%, no more
  than every 72h. 0.7–1.5× → hold 7 days. ≥1.5× with ≥20 conversions → kill. Link CTR <0.5% after
  2,000 impressions → kill creative. Frequency >2.5 in 7 days → rotate. <20 conversions → no decision.
- **Move D5 — the approval gate.** Every budget change and new ad set requires Michael's written
  approval. The agent proposes; it never mutates. This gate has no bypass.
- **Move D6 — the agent, decomposed.** Five deterministic steps — research angles / make creative /
  filter / test / propose. Inference only at steps 1, 2 and 5. **Step 3's banned-term filter is a
  deterministic string check, never an LLM** — a filter that "usually" catches an unapproved legal
  claim is not a filter. **No step ever holds a write-capable ads token.**

---

## 7. Abort conditions (document-level)

1. **Any page or post states a rule for a state not marked VERIFIED** in `state-law-matrix.md`.
   The rule the entire product rests on.
2. **Any move toward automated Wikipedia editing.** A block permanently poisons amparohq.com as a
   citable domain — destroying the asset Tracks A and C exist to build.
3. **Any ad or page promises the Script Pack or Deep Pack.** Fact 1 — it does not exist.
4. **An outlet publishes an Amparo legal claim in non-attorney-reviewed wording.** Request
   correction immediately.
5. **A tracking or channel requirement would make a privacy claim less true.** v2.26.1 exists
   because that already happened once.
6. **An aggregator or channel would require a recurring content calendar.** That converts a
   zero-touch asset into a permanent obligation — the exact thing §2 exists to prevent.
7. **Page or ad account restricted.** Appeal. Never open a second one.
8. **Any automated system found holding a write-capable ads token** (Track D only).

## 8. Verification runs, consolidated

| When | Run | Pass |
|---|---|---|
| After A1 | Load with UTMs, complete a pack, reload with different UTMs | Both events in PostHog with UTM attached; first-touch unchanged on reload |
| After A2 | Build; fetch pages with JS disabled | Sitemap ~15–20 URLs; rights text present without JS; JSON-LD validates EN+ES; app links carry UTMs |
| After A3 | Load all three posture pages | Author + review date on each; zero LIKELY/UNVERIFIED claims; footer-linked from a state page |
| After A4 | Validate feed; subscribe in Feedly | RSS 2.0 valid; items render with title, link, description |
| After B1 | Inspect target table | ≥40 deduped domains; ≥50% with parsed guidelines |
| After B2 | Run against a known third-party article | Finds ≥1 known republisher |
| After B3 | Run once | ≥10 in-domain claims with URL and claim text |
| After C1 | Review each pitch | 4-part structure; none of the 4 forbidden elements |
| After C2 | Submit EN, submit ES, unsubscribe | Both delivered in correct language; suppression works |
| Day 14 of C3 | Export per-post reach | ≥30 posts; zero missed days; ≥5× spread |
| After C4 | Check submission log | All submissions acknowledged or logged |
| Track D only | Per revision 1's table | Unchanged |

## 9. Red-team pass

**Attack 1 — "Organic-first is just avoiding the thing the operator asked for. He said Facebook is
the primary channel."**
*Failed.* He said Facebook is the primary channel and then said make it automatic so he does
nothing. Those two requirements are in direct conflict: paid Facebook requires a payment method, ID
verification, attorney-reviewed ad claims, and per-change approval (Fact 6) — an irreducibly
manual, irreversible-spend channel. Organic Facebook survives as Move C3 and is still the primary
*social* channel. What moved is the ordering, and the ordering moved because the automation
requirement forced it. Track D exists, fully specified, the moment he wants to spend.

**Attack 2 — "Track A generates six state pages from three states. That is a thin-content SEO
penalty and a wasted build."**
*This one landed.* The first draft of Move A2 leaned on per-state pages as the volume play, which
is precisely the programmatic-SEO pattern search engines penalise — and Fact 5 caps the count at
three states, making it thin by construction.
**Patch applied:** Move A2 was rebalanced so per-state pages are the *minority* of the surface, with
non-jurisdictional pages (window card, document prep, pack contents, the bilingual angle) carrying
the volume — none of which need per-state attorney review, so they scale without touching Fact 5.
An explicit failure line was added: *do not generate a page for a state without real verified
content; three good pages beat fifty empty ones.* Move A2's abort condition was tightened to name
the VERIFIED requirement directly.

**Attack 3 — "The RSS feed is a dead asset. `sourcesWatched: 4` and `needsReview: []` means it
emits nothing, and you are shipping a feed to satisfy a video."**
*Partly landed, and the document now says so.* A statute-change feed genuinely emits a handful of
items a year.
**Patch applied:** Move A4 was rewritten to seed the feed from Track A's generated pages so it has
substance from day one, with statute changes as a bonus item type rather than the feed's substance.
A fork was added that stops aggregator submission after two cadence rejections, and an abort
condition (§7 #6) now forbids starting a content calendar to satisfy an aggregator — which was the
real trap the attack pointed at.

## 10. RECON NEEDED index

| # | Question | Exact check | Blocks | Status |
|---|---|---|---|---|
| R1 | Does `vercel.json` routing conflict with `/api/*`? | Read `vercel.json` | D1 | **SETTLED** — no `rewrites`/`routes` block exists, only `headers`. No conflict. CSP permits `connect-src 'self'` but no Facebook origin, which is why D1 drops the Pixel route. |
| R2 | Is `#splash` timer- or condition-gated? | Read the splash IIFE | A2 | **SETTLED** — timer-based with a returning-user quick path: `quick = !!(sr_save && s.step>0)`; 700ms vs 1500ms, or instant on `pointerdown` (`index.html:1846`). |
| R3 | Do Amparo's legal/privacy strings make claims a page would inherit? | Read the `ab_privacy` set | A3 | Open |
| R4 | Does a PDF of the pack exist? | Grep the print path | C2 | **SETTLED** — no. `window.print()` only (`index.html:3562`); the OS dialog supplies Save-as-PDF. Offer must be a link. |
| R5 | Is `STATES` a cleanly parseable object literal? | Read its declaration in root `index.html` | A2 | Open |
| R6 | Which `state-law-matrix.md` rows are VERIFIED vs LIKELY? | Read the confidence column | A3 | Open — **only VERIFIED may be published** |
| R7 | Which search API is available, at what cost? | Check whether the existing Firecrawl setup covers SERP results | B1 | Open |
| R8 | Which education/public-service Page category exists? | Read the picker at creation; log the string | C3 | Open |
| R9 | Does Meta classify Amparo as SIEP? | **Move D2 is the check.** Unsettleable otherwise | D3 | Open, Track D only |

## 11. Placeholders

| Placeholder | Default | Owner | Blocks |
|---|---|---|---|
| Page name (topic, not "Amparo") | — | Michael | C3 |
| Sending domain / from-address (H8) | — | Michael | C2 |
| `{{DAILY_BUDGET}}` | $20/day | Michael | D3, Track D only |
| `{{CPL_CEILING}}` | $3.00/email — **unmeasured, see R9 rationale** | Michael | D4, Track D only |

## 12. Self-grade against `SUCCESS.md`

| # | Criterion | Status |
|---|---|---|
| 1 | Every move states its expected observation | **Pass** — A1–A4, B1–B3, C1–C4; Track D summarised, full text in revision 1 history |
| 2 | Failure → signal → counter-move on every move | **Pass** — all 11 Track A–C moves, most with several |
| 3 | Every fork has a trigger | **Pass** — A1, A2, A3, A4, B1, C1, C2, C3, C4; B2/B3 state "none" explicitly |
| 4 | Unsettled assumptions marked RECON NEEDED with the exact check | **Pass** — R1–R9 indexed; R1, R2, R4 settled this pass with findings recorded |
| 5 | Abort conditions exist | **Pass** — 8 document-level, plus per-move |
| 6 | Verification spelled out with pass criteria | **Pass** — §8 |
| 7 | Survived a red-team pass; records the attack that failed and the patch | **Pass** — §9, three attacks, one failed, two landed and patched |
| 8 | Executable blind | **Pass with one caveat** — Track C is HUMAN ONLY by design; the executor stops and flags. All of Tracks A and B are unambiguous and unattended. |
