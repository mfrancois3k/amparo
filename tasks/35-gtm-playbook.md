# Task 35 — GTM playbook: order of operations, action prompts, blindspots, money

Written 2026-08-20. Companion to `wargames/32-facebook-traffic-engine.md` (rev 4) and
`LEDGER.md`, which stay the plan of record. This file adds the *operator* layer: what
Michael does in what order, the exact prompt to paste for each step, what the
Claude-Code-as-GTM-machine course actually transfers to Amparo, what it must **not**
transfer, and where the money is.

Excluded from the public deploy via `.vercelignore` (`tasks/`). Internal doc.

---

## 0. Translating the course to Amparo

The course's machine is: **skills → context → capability (CLI tools) → research →
sequenced outreach → scale via background agents → landing page → ads → CRM →
proposal**. Each layer transfers, but two of them invert for this project.

| Course layer | Transfers to Amparo? | Amparo form |
|---|---|---|
| Skills as `.md` persona files | Yes, already have it | `.claude/skills/amparo-loop`, plus 3 new skills in §6 |
| Context file for the business | Yes, already have it | `SESSION-HANDOFF.md` + `wargames/32` + `LEDGER.md` |
| CLI tools as capability | Partly | `tools/*.mjs` already are the CLIs. **Do not buy Instantly/Prospeo/LeadMagic** — see §8 |
| Deep research before outreach | Yes, strongest transfer | `tools/discover-targets.mjs` already does it; needs a partner-org pass |
| "so that" ladder (layer 3–4 copy) | Yes | The partner pitch is layer 4 already: *their* clients stop losing cases at the roadside |
| Cold email at volume, multi-inbox | **NO — inverts** | 25 orgs/week, human-sent, one domain, Spanish. §5 blindspots 1–3 |
| Lookalike sending domains | **NO — actively harmful** | Notario-fraud pattern. Send from `amparohq.com` only |
| Open tracking / pixels | No (course also says no) | Second reason here: surveillance optics with this audience |
| Landing page as conversion target | Yes, but the page exists and **leaks 94.5%** | Fix funnel before adding traffic. §5 blindspot 10 |
| Paid ads (Meta) | **NO** | US immigration = Meta "Social Issues" special ad category → ID + public "Paid for by" disclaimer with operator identity. Your existing exclusion is correct; this is the extra reason |
| Supabase headless CRM | Yes — **orgs only, never people** | §5 blindspot 3 |
| Premium proposal system | Yes | Reused for bulk/org licensing quotes and for agency clients |

The single largest structural difference: the course sells B2B software to buyers who
want to be sold to. Amparo has **two** audiences — end users (never marketed to
directly, never emailed, never enriched) and **partner organizations** (the only valid
outreach target). All outbound machinery in this playbook points at the second.

---

## 1. Money map — ranked by time-to-first-dollar

All revenue is downstream of one gate: **an attorney signs a state edition.**
`REVIEW.attorneys` in `index.html` is empty for TX/GA/NY, `PAYMENTS_LIVE` is `false`,
and `tools/test-fulfilment.mjs` asserts it stays false while that list is empty.
FTC v. DoNotPay (Jan 2025, $193k) is the precedent that set this gate. Nothing below
moves without it.

| # | Line | Gate | Realistic shape |
|---|---|---|---|
| 1 | **Agency work using this exact stack** | None — available today | The near-term cash. Amparo is the portfolio piece: "111 bilingual pages, autonomous daily social engine, RSS, OG pipeline, analytics — built solo." Sell that engine to immigration law firms and nonprofits who are losing Spanish-language search. §3 P5.1 |
| 2 | **Script Pack, consumer** | Attorney sign-off | Small ARPU, high volume needed. Built + fulfilment verified. Flip is one env change once the gate clears |
| 3 | **Bulk / org licensing** | Attorney sign-off | The real Amparo revenue shape. A legal-aid org or consulate buys N co-branded printed cards or a per-state pack. Nonprofits pay by **PO/check/invoice, not Stripe Checkout** — use Stripe Invoicing. RECON: ILRC Red Card bulk pricing as the comp — verify actual figure before quoting anyone |
| 4 | **Newsletter sponsorship** | beehiiv + list ≥ ~1k | Blocked on Track F DNS. Slow but compounding |
| 5 | **Grants / fiscal sponsorship** | 501(c)(3) or a fiscal sponsor | Slowest, largest. Also unlocks Google Ad Grants (501(c)(3) only) |

**Order rule that does not bend** (from `SESSION-HANDOFF.md`): artifact ✅ → fulfilment ✅
→ **attorney (BLOCKER)** → `PAYMENTS_LIVE=true` → *then* scale traffic. Traffic before
the attorney burns the audience you spent it to get.

**Commercial-hosting trap:** Vercel Hobby is non-commercial-only. The day payments flip,
the host is in breach. Vercel Pro or the Cloudflare Pages mirror must land **before**
`PAYMENTS_LIVE`, not after. It is a revenue blocker, not a chore.

---

## 2. Order of operations

Phases are ordered by *dependency*, not by appeal. Anything inside a phase is parallel.

### Phase 0 — Unblock (today, ~90 min, zero dependencies)
0.1 Verify the Meta **App Secret was actually reset** (it passed through chat once).
0.2 **Google Search Console** — verify `amparohq.com`. 16-month retention starts at
    verification, not retroactively; every unverified day is rank data permanently gone.
    Also confirm the Vercel 403 does not block the verification fetch.
0.3 Recon: does the **403 block Facebook + WhatsApp link-preview scrapers**? Card-first
    strategy dies silently if forwarded links unfurl blank. Highest-value 10 minutes here.
0.4 Fix the NotebookLM step in `.claude/skills/amparo-loop` — the `amparo` notebook is
    **full at 52 sources** and `source add --file` is broken, so the close-out ritual is
    currently a silent no-op. (Fixed in this same commit; see §7.)
0.5 Open the rest of Track F: Bing WMT, Google Alerts → real feeds into
    `research/alert-feeds.json`, F5Bot, beehiiv, sending-domain DNS.

### Phase 1 — Attorney pipeline + Labor Rights Week outreach (this week)
Time-boxed: Labor Rights Week is the last week of August, **now**. An attorney cannot be
secured inside that window, so Phase 1 outreach is **feedback-framed, not
authority-framed** — which is honest, matches the course's best CTA, and needs no gate.
1.1 Build the attorney target list (§5 blindspot 19 — the reviewer you need is a **state
    criminal-defense / traffic attorney**, not an immigration attorney).
1.2 Generate the per-state review packet (statutes verbatim, citations, edition hash,
    sign-off sheet). Scope it to ~2 hours of work so a flat fee is quotable.
1.3 Send 5–10 attorney asks. Parallel: 15–25 partner orgs, Spanish, human-sent.
1.4 Log every touch in the orgs CRM (Supabase, orgs-only schema).

### Phase 2 — Track E (mostly already built, **uncommitted**)
`tools/render-kyr-card.mjs` (283 lines) and `cards/` exist in the working tree from a
prior session and are not in git. They already produce the 1080×1080 WhatsApp cards
(EN + ES) and the Avery 5371 ten-up duplex print PDF, with a `--selftest` that
byte-matches every quoted line against the arena source. The card is deliberately
**state-agnostic** — the unverified-state notice lives on the site, where a state is
chosen. So Phase 2 is a review-and-ship pass, not a build.
2.1 Review + `--selftest` + commit the card renderer and outputs, **in their own commit**
    (wargame 33's discipline: do not sweep unrelated working-tree files together).
2.2 Decide whether per-state variants are wanted at all, given the state-agnostic
    rationale already written into the file's header.
2.3 WhatsApp Channel (human: needs a **non-personal phone number** — blindspot 17).

### Phase 3 — Fix the funnel before adding traffic
72 landed → 4 picked a state = **94.5% drop**, never diagnosed. The CWV pass (wargame 33)
tried and honestly failed to move it. Pouring Track E traffic into this is the most
expensive mistake available right now.
3.1 Instrument the state-picker step properly (PostHog funnel, not autocapture).
3.2 5-person hallway test, in Spanish, on a real mid-range Android, on cellular.
3.3 One change per pass, measured.

### Phase 4 — Flip revenue (gated on Phase 1.2 signature)
4.1 Attorney signature received → populate `REVIEW.attorneys` per state.
4.2 Move off Vercel Hobby (Pro or Cloudflare mirror).
4.3 Stripe **prod** keys + a prod-specific webhook secret (per-endpoint, does not carry
    over from dev). Stripe Tax on. Refund policy + support inbox live.
4.4 `PAYMENTS_LIVE=true`. Run `tools/test-fulfilment.mjs` (16 checks) before and after.

### Phase 5 — Scale (only after 4)
5.1 Agency offer packaged and sold (this can actually start at any time — it has no
    Amparo gate; it is listed here only because it competes for the same hours).
5.2 C2 email capture (needs DNS), C1/C4 evergreen pieces + aggregator submissions.
5.3 Org bulk licensing quotes via the proposal system.

---

## 3. Action prompts

Paste as-is, in order. Each assumes you are in `C:\Users\mfran\Ai-Foundations\Amparo`.
Prompts that end in a gate are written to **stop and ask** — do not remove that line.

### P0.3 — 403 vs link-preview scrapers (do this one first)
```text
Recon only, no fixes yet. SESSION-HANDOFF.md says Vercel Attack Challenge Mode is ON and
the live site returns 403 to automated traffic, and that verified bots pass via IP+rDNS.
I need to know whether that 403 breaks link previews, because the whole card-first
strategy in wargames/32 depends on a forwarded link unfurling correctly.

Determine, with evidence, whether each of these can fetch amparohq.com and its per-page
OG images: Facebook's crawler (facebookexternalhit), WhatsApp's preview fetcher,
Twitter/X's card fetcher, Google Search Console's verification fetch, and beehiiv.

Use the official debuggers where they exist (Facebook Sharing Debugger URL, etc.) rather
than curl with a spoofed UA — a spoofed UA proves nothing about IP+rDNS verification.
Report as a table: fetcher, method used, result, confidence. Mark anything you could not
actually test as UNVERIFIED rather than inferring it. Do not change any setting.
```

### P0.4 — repair the close-out ritual
```text
The NotebookLM step in .claude/skills/amparo-loop/SKILL.md is broken in two ways
documented in SESSION-HANDOFF.md: the `amparo` notebook is FULL at 52 sources (writes
fail with a misleading INVALID_ARGUMENT), and `source add --file` is broken so only
--text works with a ~24k char cap, split on headings.

Fix the skill so the close-out ritual actually lands: route to the Growth notebook
(8d34f4af-aa7c-4a27-929c-480ddfc3fde1), use --text with heading-split chunking under the
cap, and send only the NEW CHANGELOG section rather than the whole 121KB file. Add a
final step that refreshes the second brain index:
`node ../brain/brain.js refresh` from the vault root.
Keep the step non-blocking and keep the existing failure note behavior.
```

### P1.1 — attorney target list
```text
Build the attorney outreach list for TX, GA and NY. Read research/state-law-matrix.md and
the STATES data in index.html first so you know exactly what body of law is being
reviewed.

Critical framing: the quoted material is STATE TRAFFIC AND STOP-AND-IDENTIFY LAW —
criminal procedure, not immigration law. An immigration attorney may correctly decline
this as outside their competence. Target state criminal-defense / traffic-defense
attorneys first, bilingual where possible, with an immigration attorney as a second read
only on immigration-consequence framing.

For each state produce 8-12 candidates from: the state bar lawyer referral service, AILA
chapter members who also practice criminal defense, law school immigration or criminal
clinics, public-defender alumni now in private practice, and NIPNLG/Pro Bono Net
directories. For each: name, firm, state bar number if public, practice areas, bilingual
yes/no/unknown, why they fit, and the public contact route.

Rules: public professional sources only, no scraping of personal data, no email guessing
or enrichment tools. If you cannot verify a contact route from the firm's own site or a
bar directory, mark it UNVERIFIED rather than inventing one. Write to
growth/attorney-targets.md and a matching .json.
```

### P1.2 — attorney review packet
```text
Generate the per-state attorney review packet for TX (then GA, then NY) from the STATES /
BASE_RULES_* data in index.html. This is the artifact that turns an open-ended liability
ask into a ~2 hour reviewable job with a flat fee.

Each packet must contain, per state:
1. Every legal sentence Amparo publishes for that state, verbatim, with its statute
   citation, in EN and ES side by side.
2. What the site explicitly does NOT claim to cover (recording, phone search, etc.) —
   growth/answer-bank.md already asserts these absences in tests; reuse that list.
3. The exact user-facing strings that would change on signature (the REVIEW.attorneys
   honesty pattern), so the reviewer sees precisely what their name would attach to.
4. A sign-off sheet: edition version, git commit hash, date, state, scope of review,
   two signature options — public byline vs "reviewed by a licensed [STATE] attorney,
   name on file" — and an explicit line that this is content review, not the formation
   of an attorney-client relationship with site users.
5. A re-sign trigger clause: the signature covers this edition; a statute diff detected
   by tools/law-watch.mjs voids it for that state.

No model writes any legal sentence — everything is lifted verbatim from the data, per
standing rule 1. Write to notebook/attorney-packet-<STATE>-<date>.md and stop for my
review before anything is sent anywhere.
```

### P1.3a — attorney outreach email (draft only)
```text
Draft the attorney outreach email using the copywriting rules from the cold-email skills:
hook / bridge / soft CTA, 75-100 words, plain text, no small talk, no em dashes, one ask.

Facts you may use, all true and checkable: free bilingual tool, no ads, no data sale, 111
pages live, 3 states, statutes quoted verbatim, payments are OFF and stay off until an
attorney signs, and the ask is a scoped ~2 hour paid review of one state edition with a
choice of public byline or name-on-file.

Do not claim attorney review that does not exist. Do not imply endorsement by any
organization. Do not use a tracking pixel or a link shortener. Produce 3 variants and one
Spanish version. Write to growth/outreach-attorney.md — I send these by hand from Gmail,
not from a sequencer.
```

### P1.3b — partner org outreach (Labor Rights Week)
```text
Build the Labor Rights Week partner outreach batch. Read wargames/32 §14 for why local
affiliates beat national orgs, and growth/answer-bank.md for the paste-ready material.

Target set: 25 organizations maximum, in TX and GA only, drawn from CLINIC field offices,
promotora programs, consulate-adjacent community partners in the DOL Consular Partnership
Program, day-labor centers, and parish/school parent-liaison programs. Verify each one is
a real, currently-operating office with a public contact route.

Copy rules: Spanish first with an English version below it; the ask is FEEDBACK, not
adoption and not a sale — "would this be useful to the families you see, and what is
wrong with it"; no monetization mention at all; no attorney-review claim; one link, no
tracking; sent by a human from Gmail. Cap 25/week and log the cap in the file.

Also produce the one-paragraph Spanish phone script for anyone who calls back — and flag
clearly in your summary if a Spanish phone call is a commitment I cannot currently staff.
Write to growth/outreach-partners-<date>.md and stop before anything is sent.
```

### P1.4 — orgs CRM (Supabase)
```text
Set up the outreach CRM in Supabase for this project. Hard constraint that shapes the
whole schema: this database stores ORGANIZATIONS AND THEIR PUBLIC PROFESSIONAL CONTACTS
ONLY. It must be structurally impossible to store an end user of the site — no individual
records, no location tied to a person, no free-text notes field that invites it.

Schema: orgs, contacts (professional role + public email only), touches (channel, date,
what was sent, human sender), replies (sentiment + a bounded enum outcome, no verbatim
personal detail), suppression (permanent, checked before every future send), and
attorney_reviews (state, edition hash, status, date, signature option chosen).

Row Level Security on every table. Write the SQL migration to a file for me to run in the
Supabase SQL editor — do not attempt to apply it. Then write a short README documenting
the no-individuals rule and the retention policy, because that rule is the point.
```

### P2.1 — review and ship the existing Track E card work
```text
tools/render-kyr-card.mjs and cards/ are in the working tree, untracked, from a prior
session. Do not write a new renderer — review and ship what exists.

1. Run `node tools/render-kyr-card.mjs --selftest` and report the real output.
2. Verify every quoted line still byte-matches its source in arena/index.html after the
   changes made since that file was written.
3. Open cards/whatsapp-es.png and cards/wallet-cards-avery5371.pdf and check the claims
   in the file's own header: legible after WhatsApp re-compression, Avery 5371 grid
   correct, page 2 columns MIRRORED so a long-edge duplex flip aligns backs to fronts.
4. Confirm the state-agnostic decision documented in the header still holds against
   wargames/32 rev 4, or tell me why per-state variants are now needed.

Commit it in its OWN commit — do not sweep any other working-tree file in with it
(wargame 33 §red-team). Then stop and show me the selftest output before pushing.
```

### P2.2 — print-run readiness (only after P2.1)
```text
The Avery 5371 PDF already exists. What is missing is everything between a PDF and a
card in someone's hand. Give me, with real numbers where you can verify them and a
RECON tag where you cannot:

- What a partner org needs to print these themselves: stock weight, printer settings,
  the exact duplex flip setting, and a one-page instruction sheet in EN and ES.
- What a print shop would charge for 500 / 2,000 / 10,000, and what file format they
  want instead of an Avery-grid Letter PDF (bleed, crops, CMYK).
- Whether ILRC's actual Red Card bulk price is public, as the pricing comp for the
  org-licensing line in tasks/35-gtm-playbook.md §1.

Do not quote any figure you did not verify from a source you can cite.
```

### P3.1 — funnel diagnosis
```text
Diagnose the funnel drop before we add any traffic: 72 landed, 4 picked a state, 94.5%
lost. Wargame 33 tested a Core Web Vitals hypothesis, measured honestly, and failed to
move it — read that file first so you do not repeat it.

PostHog autocapture is OFF by design, so start by listing what events actually exist
today and what we therefore CANNOT currently answer. Then propose the minimum
instrumentation that would distinguish these hypotheses: (a) users never see the state
picker, (b) they see it and do not understand it, (c) they see it and their state is one
of the 48 unverified ones, (d) they bounce before interactive on cellular, (e) the 403 /
challenge interstitial hits real users on some networks.

Give me a ranked list with the cheapest discriminating test for each. No fixes this pass.
```

### P5.1 — agency offer (the line with no gate)
```text
Package the Amparo build as a sellable agency offer. What actually exists, all verifiable
from this repo: 1 URL grown to 111 pages generated from a data source, EN/ES throughout,
RSS, 62 per-page OG images rendered from SVG, an autonomous daily social publisher with
an editorial guardrail, weekly discovery crons, first-touch attribution, and a Convex
dev-to-prod migration.

Target buyer: immigration and criminal-defense firms and nonprofits who are invisible in
Spanish-language search — wargames/32 §14 has the live SERP evidence that English is
law-firm saturated while Spanish is a vacuum. That evidence IS the pitch.

Produce: the so-that ladder to layer 4, a one-page offer, three pricing tiers, and a
first-touch email at 75-100 words using the cold-email skill rules. Then tell me
honestly which parts of the Amparo build are genuinely transferable versus which were
one-offs I would be re-doing from scratch for each client.
```

---

## 4. Prompt workflow — the reusable loop

The course's real lesson is not any single prompt, it is the shape:

**Context → Capability → Recon → Confirm-gate → Small sample → Human verify → Scale →
Close-out.**

1. **Context.** Never start cold. Every prompt above names the files to read first
   (`wargames/32`, `SESSION-HANDOFF.md`, `research/state-law-matrix.md`). Cheaper and
   more accurate than re-deriving.
2. **Capability.** Prefer a `tools/*.mjs` script over a paid SaaS CLI. Scripts are
   testable, free, and reviewable. If a CLI is genuinely needed, install **project-level**
   (`npm i`, invoke via `npx`) — global installs are unusable on this machine, the npm
   prefix/PATH mismatch is documented in `SESSION-HANDOFF.md`.
3. **Recon.** For anything expensive or irreversible, run `/wargame` first. That is what
   `wargames/` is; it has already saved this project from at least two phantom fixes.
4. **Confirm-gate.** For any prompt where a misread costs hours, end with *"confirm you
   understand before building."* Used in the course, used above.
5. **Small sample.** 3 cards before 51. 5 emails before 25. One state before three. The
   course's single most useful habit.
6. **Human verify.** Legal text, anything that leaves the machine, anything with a
   credential. Standing rules 1–5 in `SESSION-HANDOFF.md` are all instances of this.
7. **Scale.** Background Sonnet agents for the bulk pass once the sample is approved —
   `/amparo-loop` steps 7–9 already do this. Use `/loop` to wrap a repeating pass rather
   than rebuilding interval logic.
8. **Close-out.** §7 below.

**Model routing:** Opus/Fable for wargames, funnel diagnosis, the attorney packet, and
anything touching legal exposure. Sonnet background agents for bulk generation, list
building, and review passes. Never a model for a legal sentence, at any tier.

---

## 5. Blindspots

Ordered by cost-if-ignored. Each has the fix inline.

1. **Cold-emailing nonprofits at volume will blacklist Amparo.** Legal-aid staff share
   listservs; one "this is spam" reply ends the affiliate track permanently.
   *Fix:* 25/week hard cap, human-sent from Gmail, Spanish, one ask, no step-2/step-3
   sequence, feedback framing.
2. **Lookalike sending domains are the notario-fraud pattern.** The course's core
   deliverability advice inverts here: this audience is actively targeted by
   impersonation scams. *Fix:* send only from `amparohq.com` with SPF/DKIM/DMARC, accept
   the lower volume ceiling.
3. **Never build a lead list of individuals.** No enrichment, no verification services, no
   "find the email of" for any end user. The CRM schema in P1.4 is written so it is
   structurally impossible. *Also:* an email list is a subpoena target — minimize what is
   stored, do not tie a state or a scenario to an address.
4. **Attorney sign-off is upstream of outreach credibility, not parallel to it.** The
   first question any legal-aid director asks is "who reviewed this?" *Fix:* Phase 1
   outreach is feedback-framed, which is honest without the signature and is also the
   course's highest-converting CTA.
5. **Labor Rights Week is closing now and the attorney cannot be secured inside it.**
   *Fix:* accept the split — outreach this week without an authority claim, signature
   later, second touch when it lands. That second touch is a genuine reason to write
   again, which is exactly what the course says a follow-up must be.
6. **Meta ads: US immigration is a "Social Issues" special ad category.** Requires ID
   verification and publishes a "Paid for by" disclaimer carrying operator identity, plus
   restricted targeting. The existing exclusion was right for the address reason; this is
   the second, larger reason.
7. **The Facebook page is rented land, and its admin is a personal profile.** One policy
   strike zeroes the traffic engine, and any harassment attaches to a real identity.
   *Fix:* Business Manager, a second admin, and treat WhatsApp Channel + RSS + beehiiv as
   the owned mirror — not as nice-to-haves.
8. **The 403 may be silently killing link previews.** Card-first strategy assumes a
   forwarded link unfurls. Untested. P0.3 is the highest-value 10 minutes in this file.
9. **Search Console retention is not retroactive.** Every day unverified permanently
   destroys rank data you will want when the Spanish-first bet is evaluated.
10. **The funnel loses 94.5% and nobody knows why.** More traffic multiplies the leak.
    Phase 3 exists for this. Do not skip it because Track E is more fun to build.
11. **Vercel Hobby is non-commercial-only.** The day `PAYMENTS_LIVE` flips, the host is in
    breach. Move first.
12. **Stripe prod needs its own webhook secret** (per-endpoint, dev's does not carry) plus
    Stripe Tax, a refund policy, and a support inbox — and the support inbox needs the
    same DNS that C2 email capture is blocked on. One DNS task unblocks three things.
13. **Nonprofits and consulates pay by PO/check, not Checkout.** Bulk licensing needs
    Stripe Invoicing and a W-9, or the deal dies at procurement.
14. **NotebookLM's Amparo notebook is full at 52 sources** and fails with a misleading
    error, so the "update NotebookLM after every task" ritual has been a silent no-op.
    Fixed in this commit — see §7.
15. **`source add --file` is broken; global npm CLIs are not callable by name** on this
    machine. Any course-style "just install the CLI globally" step fails. Project-level
    installs and full paths only.
16. **Buying the course's SaaS stack would burn roughly $150–250/month for ~25 emails a
    week.** Instantly, Prospeo and LeadMagic are correct for a 1,000-lead B2B motion and
    wrong for this one. Buy them for the *agency* line when a paying client exists. §8.
17. **WhatsApp Channel needs a phone number, and it must not be the personal one.**
    Get a second number before creating the channel; the number is hard to change later.
18. **Spanish-first outreach implies Spanish phone calls.** If a promotora calls back and
    nobody can hold the conversation, the relationship ends on that call. Decide staffing
    before opening the channel — P1.3b is written to surface this.
19. **The reviewer you need is a state criminal-defense / traffic attorney, not an
    immigration attorney.** The published material is stop-and-identify and traffic law.
    Bar competence rules and malpractice carriers make a mismatched attorney decline —
    which reads as "nobody will vouch for this" when the real problem was targeting.
20. **A signature covers an edition, not the site.** `tools/law-watch.mjs` will eventually
    detect a statute change in a signed state. Without an automated re-sign trigger, the
    site keeps displaying an attorney's name over text they never reviewed. That is the
    worst reputational failure available to this project. Routine spec in §6.
21. **URGENT, listed last only to keep the numbering stable: the entire Track E card
    build is untracked.** `tools/render-kyr-card.mjs` + `cards/` exist only in the
    working tree. A stray `git clean -fd`, a worktree switch, or a fresh clone loses the
    single highest-leverage asset in the strategy. Commit it today (P2.1).
22. **Google Ad Grants requires 501(c)(3).** If the nonprofit path is ever taken, that
    unlocks $10k/mo in search spend — the only paid channel that fits this project. Worth
    knowing before deciding entity structure.

---

## 6. Skills and routines

### Existing, keep
- `.claude/skills/amparo-loop` — the 9-step ship-and-verify pass. Amended in this commit
  (NotebookLM routing + second-brain refresh).
- `tools/daily-post.mjs` + `.github/workflows/daily-post.yml` — daily, 15:32 UTC.
- Weekly discovery cron (Mondays 08:41 UTC) — `citation-gaps`, `discover-targets`,
  `question-monitor`.
- `/wargame` before anything expensive. `/loop` to repeat a pass.

### To build — three skills, specs only
1. **`partner-outreach`** — encodes the rules that keep blindspots 1–3 from recurring:
   25/week cap, Spanish first, human send only, no pixel, no sequencer, orgs only,
   suppression checked before every send, feedback framing while `REVIEW.attorneys` is
   empty. Should refuse to draft a second follow-up to a non-replier.
2. **`attorney-packet`** — generates the P1.2 packet for any state from live repo data,
   including the edition hash and the exact strings that change on signature. Run once
   per state and again on every statute diff.
3. **`org-licensing-quote`** — the course's proposal system, aimed at bulk card orders:
   password-gated page, view logging into the orgs CRM, PO-friendly terms, per-unit
   pricing. Build only after Phase 4.

### To build — two routines
- **Re-sign trigger** (weekly, chained to `law-watch.mjs`): statute diff in a signed
  state → flip that state's badge to "update pending" in `index.html`, open an issue, and
  draft the re-review email to the signing attorney. This is blindspot 20's only real fix.
- **Outreach queue** (weekly, Monday): assemble next week's ≤25 orgs from
  `discover-targets` output, dedupe against `touches` and `suppression`, and leave a
  human-send queue. Never sends. Mirrors the `question-monitor` design: automation finds,
  a person answers.

---

## 7. Close-out ritual — run after every task

This is the "update NotebookLM, GitHub, second brain" loop, now working:

```bash
/amparo-loop <slug>
```

which does: verify the change is real → commit + semver tag + push → `CHANGELOG.md` →
`notebook/amparo-version-history.md` → **NotebookLM Growth notebook**
(`8d34f4af-aa7c-4a27-929c-480ddfc3fde1`, `--text`, heading-split, new section only —
the `amparo` notebook is full and silently rejects writes) → **second-brain reindex**
(`node brain/brain.js refresh` from the vault root, which is what makes the new doc
findable by `brain.js find`) → then three background agents: focus group, module design
review, blind-spot audit.

For strategy documents like this one, `LEDGER.md` gets the entry rather than the
CHANGELOG — the changelog tracks the shipped site.

---

## 8. Right-sized stack

| Need | Course answer | Amparo answer | Why |
|---|---|---|---|
| Lead sourcing | Prospeo | `tools/discover-targets.mjs` + manual verification | 25 orgs/week; a paid database is aimed at 1,000/week |
| Email verification | LeadMagic | Read it off the org's own site | Guessed addresses are the thing that gets you marked as spam here |
| Sequencer | Instantly | Gmail, by hand | No sequence exists — one email, one human, one ask |
| Multi-inbox warmup | 10 inboxes | One domain | Volume is the wrong lever for this audience |
| CRM | Supabase | Supabase, orgs-only schema | Correct transfer, with the schema constraint |
| Landing page | Build one | Exists; fix the funnel | Phase 3 |
| Ads | Meta | None | Blindspot 6 |
| Proposals | Password-gated page + view logging | Same, for bulk licensing | Correct transfer, after Phase 4 |

Net: the course's ~$200/month stack becomes ~$0/month for Amparo. Buy it when the
**agency** line has a client paying for that volume — that is the context it was designed
for, and the context where it pays for itself in one reply.
