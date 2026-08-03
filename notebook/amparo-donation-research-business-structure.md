# Amparo — Donation infrastructure & business-structure assessment

**Date:** 2026-08-03
**From:** Business consultant read — advisory only, not legal advice
**Scope:** Answers the operator's question about entity structure and donation
infrastructure, framed against `wargames/02-consensus-roadmap.md` and
`notebook/amparo-upl-engagement-memo.md`. Where a question is actually a legal
question, it is flagged for counsel and not answered here — see §2.

**Constraint respected:** no recommendation below requires editing `index.html`.
This is an advisory memo. It also does not require sending anything, forming
anything, or spending anything — every action item is a "when," not a "now."

---

## Bottom line, up front

**Don't build donation infrastructure right now. Send the UPL memo and pursue
the organizational endorsement instead — both are already sitting drafted and
ranked above this on your own roadmap, and both are cheaper than what you're
asking about.** A donation button at 72 visitors/month, pre-endorsement,
pre-UPL-opinion, on a product whose own research shows its audience will not
leave a payment trail on this category of app, will not produce $10,000/month.
It will more likely produce $0/month and a second version of the $19-banner
mistake — a monetization signal placed in front of an audience that reads any
payment surface as a threat, on a product that hasn't yet earned the trust to
ask. The $10k/month operators you're pattern-matching against are not doing
what you'd be doing; see §3 for exactly why the comparison doesn't transfer.

If you do only one thing after reading this: don't do anything here. Do items
2 and 4 from the consensus roadmap instead. Revisit this memo in 6 months.

---

## 1. Legal entity structure options

Four options, compared on cost, timeline, and what each actually unlocks —
not what it sounds like it unlocks.

| Structure | Setup cost | Setup timeline | Ongoing cost | Unlocks | Does NOT unlock |
|---|---|---|---|---|---|
| **Sole proprietor + personal donate link** (Venmo/Cash App/PayPal.me, your name) | $0 | Same day | Full self-employment tax (~15.3%) + income tax on every dollar, commingled with your personal finances | The fastest possible path to a live button | No liability shield. No tax deductibility for donors. Binds an anonymous, no-account, no-data rights tool to your personal financial identity — see §5, this is actively the worst fit for this specific product's trust architecture, not just a neutral "cheap option." |
| **Single-member LLC** | $50–500 (state-dependent formation fee) | Days to ~2 weeks | $100–800/yr — registered agent plus state annual/franchise fee (e.g., California charges an $800/yr *minimum* franchise tax regardless of revenue; check your own state) | Personal liability shield. Worth having independent of the donation question, given the product's subject matter — this is the one entity question worth asking counsel about even if donations never happen (the UPL memo's own Q12 already asks this). | Does not make donations tax-deductible by default (an LLC is a pass-through, not a charity). Does not touch UPL exposure at all. |
| **501(c)(3), formed directly** | $275 filing fee (Form 1023-EZ — Amparo's projected receipts are comfortably under the $50k/yr threshold that requires the long form) + $50–500 state nonprofit incorporation | 2–4 weeks IRS processing for 1023-EZ once state incorporation is done (add 1–3 weeks for that step). The long-form 1023 (not needed here) runs 3–6 months, 12+ with follow-up. | Annual Form 990, a board (most states require 3+ directors — "just Michael" doesn't qualify), a conflict-of-interest policy, and **charitable-solicitation registration in every state you solicit from** — a site asking for donations nationally technically triggers this in ~40 states and is the most commonly-ignored compliance burden in small nonprofits | Tax-deductible donations, grant eligibility | **Does not resolve or shield UPL exposure** — see §2, this is the section that matters most. Standing up governance for a solo operator at 72 visitors/month is the nonprofit-formation equivalent of building 20 workers on day one. |
| **Fiscal sponsorship** (e.g., Players Philanthropy Fund, Social Good Fund) | Sponsor's application + agreement, no IRS filing (you operate under their existing exemption) | Days to a few weeks | PPF: ~6% of deposits. Social Good Fund: ~7–10%, plus a refundable $29/mo admin charge until you clear $5k/yr raised. General market range: 5–15%. | Tax-deductible donations and grant eligibility immediately, with none of the board/bylaws/990 overhead | Same UPL gap as above — a sponsor's tax status does not extend to Amparo's conduct. **Also practically gated**: sponsors run their own risk review before taking on a project, and one with an open, self-disclosed, unresolved UPL question (which is literally what the engagement memo says) is a harder yes than a clean one. This is realistically a *post-opinion* option, not a today option. |

**Recommendation: do none of these yet.** Two independent reasons converge on
the same answer:

1. **The UPL memo already asks the right question and you haven't sent it.**
   Section 4, Q11 asks whether "a structural change — separating the practice
   engine into a distinct offering, changing who publishes it, partnering with
   a legal-aid organization" would reduce exposure, and Q12 asks directly
   "would you recommend forming one [an entity]." You are about to pay an
   attorney $1–2K to answer exactly this question with real authority. Forming
   an LLC or nonprofit *before* that answer arrives risks building the wrong
   structure and redoing it — possibly at real cost if it's a 501(c)(3) with a
   board already seated.
2. **There is no revenue yet to justify the overhead.** A board, a 990, and
   state charitable registrations are fixed costs that don't scale down.
   Against the revenue numbers in §3, none of these structures pay for their
   own overhead in the first year, most likely the first two.

If you form anything before the opinion lands, the single-member LLC is the
only one with a rationale independent of donations at all — a liability shield
for an operator publishing quasi-legal-adjacent guidance is worth having on
its own merits. That's a $50–500 decision, not a research project. Everything
else on this table should wait for the attorney's answer to Q11/Q12.

---

## 2. Does accepting donations interact with the UPL exposure?

Distinct question from charging for the product, and the honest answer has
two parts: a business-structure observation I can make directly, and a legal
question I will not answer — because it is one, and pretending otherwise would
be worse than saying "ask counsel."

### What changes mechanically the moment a donate button ships

The UPL memo's Section 1 states, as a fact supporting the whole engagement:
*"Free. There is no payment integration anywhere in the codebase, and none is
planned pending this opinion."* A donation button — even one fully
disconnected from access, even one that never gates a single feature — makes
that sentence false the day it ships. The memo's Q9 already asks the attorney
whether the product's *free-with-no-payment-mechanism* status matters to the
analysis, and whether a future paywall would change the answer. A voluntary,
access-unconnected donation option sits in the gap between "free with no
payment mechanism" and "charged" that Q9 doesn't quite cover. **Before sending
the memo, add one question to Section 4** — something like: *"Does adding a
purely voluntary donation option, not gating any feature and not required for
access, change any answer above — including the 'free' framing this analysis
currently relies on?"* This costs nothing (the engagement is already priced
for the scope of Section 4; one more yes/no/it-depends question is marginal)
and avoids paying for a second engagement later when you've already shipped a
donate button and need to ask the same thing retroactively.

### Whether nonprofit status changes the UPL calculus — flagged for counsel, not answered here

I am not going to render an opinion on this, because it's a legal question and
I'd be fabricating authority to answer it with confidence either way. What I
can do as a business consultant is point at what's already sitting in your own
file, because it argues against assuming the answer is "yes, nonprofit status
helps":

**Upsolve, Inc. was a nonprofit.** Your own memo's Section 3 already states
this — Upsolve trained volunteers to give "free, nonprofit, well-intentioned
'what to say' guidance" to people being sued over debt. That is close to
verbatim the fact pattern your memo is asking counsel to evaluate for Amparo.
The Second Circuit's September 2025 ruling — confirmed independently, not just
from your memo — vacated the injunction that had protected Upsolve's program
and remanded the case, holding that New York's UPL statutes are content-neutral
and survive intermediate scrutiny. The practical result: nonprofit status,
free delivery, and good intent did not, on their own, exempt Upsolve's conduct
from UPL enforcement in the circuit that covers New York — one of Amparo's
three cited states. That's not a hypothetical risk; it's the specific,
already-cited precedent your engagement memo is built around.

This doesn't settle the question — your prompt is right that some states treat
nonprofit legal-aid-adjacent work differently, and Amparo forming or
fiscally-sponsoring under a 501(c)(3) is a materially different fact pattern
from Upsolve's volunteer-staffed advocacy program in at least one respect: UPL
analysis generally turns on the *conduct* (is this activity the practice of
law), not on the *tax status* of who's doing it. A 501(c)(3) letterhead does
not change a single mechanical fact in Section 2 of your memo — the scored
engine still does the same lexical keyword matching, still returns the same
green/amber result, regardless of what entity publishes it. So the realistic
range of outcomes is "nonprofit status is close to irrelevant to this specific
mechanical question" to "nonprofit status matters in specific states for
specific reasons your memo doesn't yet ask about" — and you don't know which,
and neither do I.

**Action:** the memo's Q11/Q12 gesture at this but don't ask it directly. Add
an explicit question: *"Does operating as, or through, a 501(c)(3) or
fiscally-sponsored nonprofit change your analysis in any state — including any
state-specific nonprofit or legal-aid carve-outs you're aware of?"* That's the
version of this question worth $1–2K of attorney time. Anything I said instead
would be a guess wearing a suit.

---

## 3. Realistic revenue modeling — be a skeptic

Your prompt is right to name the survivorship-bias problem directly, so here's
the arithmetic instead of a vibe.

### The benchmark, not the outlier

A real, checkable data point from an indie developer using Buy Me a Coffee on
a general-audience tool: **1 donation per 4,206 visitors — a 0.024%
conversion rate** ([Indie Hackers](https://www.indiehackers.com/post/1-4206-conversion-rate-on-buy-me-a-coffee-1ed21a2288)).
That's already the realistic baseline for a *trust-neutral* tool, not the
success story. The $10,000+/month examples you're thinking of are the ones
where the story got told because they're the outlier — they almost always
share one of three traits Amparo currently has none of, or is structurally
unable to build:

1. **Scale.** Hundreds of thousands of monthly actives, so even a 0.02%–0.1%
   conversion produces real absolute numbers. Amparo has 72/month.
2. **A parasocial or creator relationship** — a newsletter, a YouTube channel,
   a podcast — where the "donation" is patronage of an ongoing relationship
   with a person, not gratitude for a single-use utility. Amparo has no such
   channel, and its no-account, no-email, no-tracking design (the entire point
   of the product) makes building one structurally harder than for almost any
   other kind of project: you cannot email past visitors, cannot retarget,
   cannot build a list. **The privacy moat is a genuine fundraising-infrastructure
   cost.** That's worth naming plainly as a real tradeoff you already made
   correctly for the mission, not a defect to engineer around.
3. **High-frequency recurring use.** Tools people touch daily or weekly build
   reciprocity that sustains recurring small-dollar giving. A rights-rehearsal
   tool is closer to a fire extinguisher than a newsletter — used rarely, and
   the whole point is that most users hope never to need it "for real." That's
   the opposite of the habitual-touch relationship recurring donation revenue
   depends on. (This is also a reason a Patreon-style recurring ask is a worse
   fit here than a one-time donation — recurring billing requires a stored
   card on file with a processor, which is a *deeper* payment trail than a
   one-time gift, directly worse against the objection in §5.)

### What Amparo's own numbers say

Adjusting the 0.024% general benchmark downward to account for the
payment-trail aversion your own focus-group research documents (§5 has the
specifics — this isn't ordinary software wariness, it's a status-independent
refusal specific to this product category), a defensible working range is
**0.01%–0.05% conversion**, not higher, until there's evidence otherwise.

| Horizon | Traffic assumption (tied to roadmap items 4 & 6 landing or not) | Conversion (adjusted) | Expected donation revenue |
|---|---|---|---|
| **Today** | 72/mo | 0.01–0.05% | ~0.01–0.04 donations/mo → **$0, most months** |
| **6 months** | 75–150/mo (UPL opinion likely resolved; items 4/6 not yet executed) | same | **$0–5/mo** |
| **12 months** | 150–600/mo *if* item 4 (endorsement) and item 6 (distribution decision) both land well | 0.02–0.08% (modest trust lift from an endorsement) | **$0–25/mo** |
| **24 months** | 600–3,000/mo — a genuinely good, non-guaranteed outcome requiring sustained organic/earned growth with no paid marketing (current constraint) | 0.02–0.1% | **$10–150/mo**, plausibly low hundreds in a standout case |

None of these paths reach $10,000/month, and it isn't close. Reverse-engineer
it directly: at a $15 average one-time gift, $10K/month needs ~667 donors/month.
At a generous 0.5% conversion — roughly 20x the adjusted ceiling above, and
implausible for this category without a distribution partner doing the
convincing — that's **133,000 monthly visitors**. At the more realistic
0.02–0.05% range, it's **1.3–3.5 million monthly visitors**. Either way,
that's **1,800x to 45,000x current traffic**. That is not a "grow steadily and
it compounds" trajectory from 72 visitors/month — it's a different project,
reached (if ever) through institutional adoption, media attention, or a large
partner org distributing it, not through funnel optimization of a personal
site.

### The more useful redirect

If the actual goal is meaningful money for the mission rather than a specific
mechanism, **the higher-leverage lever is already ranked #4 on your own
roadmap and isn't a donate button.** An endorsing legal-aid org, NAACP
chapter, or immigrant-rights group doesn't just fix the "nobody vouches for
it" blocker (the single most-cited conversion blocker in your own focus-group
data, ahead of everything else by count) — it's also a plausible *funding*
conduit: in-kind support, a small grant, or fiscal sponsorship routed through
an organization that already has donor relationships and grant eligibility,
without you building any donation infrastructure yourself. A donate button
aimed at 72 anonymous monthly visitors is the least-leveraged fundraising
mechanism available to this project. Grant-seeking through a partner org,
enabled by item 4, is a much higher-leverage path, and it's already on your
list.

---

## 4. Where is the operator's time best spent right now?

Direct answer: **chasing donation infrastructure is premature, and it's not a
close call.**

- **Nothing on your own consensus roadmap mentions donations.** The 20-item
  ranked list in `wargames/02-consensus-roadmap.md` closed the pricing
  question explicitly — the economy-designer seat's finding was "nothing to
  price. The pricing fork resolved to 'free pending UPL,' and there is still
  no payment integration in the codebase... recorded as closed, not
  deferred." That finding is from the same session as this request. Donation
  infrastructure would be new scope that your own panel, looking at the same
  facts, didn't rank.
- **The growth skeptic's math applies directly, and it gets worse for
  donations than for funnel changes.** The roadmap itself says 72 visitors/
  month can't validate a conversion-rate change without a multi-month wait per
  decision. §3 above shows a donation conversion rate needs *orders of
  magnitude* more traffic than a funnel A/B test to produce a measurable
  dollar figure — you would be building and instrumenting a revenue channel
  you structurally cannot get a read on for a year or more at current traffic.
- **Opportunity cost is concrete, not abstract.** Item 2 (send the UPL memo —
  it's already drafted, ready today, ~$1–2K) and item 4 (organizational
  endorsement outreach — ~M effort, no code) both rank above every code item
  on your list, are both cheaper than a donation integration, and both do more
  for the project's survival than a donate button could. Time spent
  researching payment processors is time not spent sending an email that's
  already written.
- **There's a sequencing risk beyond opportunity cost.** Asking for money
  before item 4 lands means asking strangers to extend financial trust to a
  product that, by your own research, nobody currently vouches for. That's
  backwards — see §5 for why it's likely to cost trust rather than gain
  revenue.

**Recommendation: park this. Revisit after item 2 (UPL opinion) and item 4
(endorsement) have landed, and only if item 6 (the distribution decision)
has actually produced traffic in the hundreds-to-thousands/month range.**
Until then, "$10K+/month in donations" isn't a target this project's current
structure supports building toward — it's not the right thing to plan
infrastructure around yet, full stop.

---

## 5. What a donation ask must not do

The $19-banner failure is the template for exactly how this goes wrong, and
the mechanism transfers cleanly from "price" to "ask." Recap of what actually
happened, because the lesson is specific, not general: the banner sat on the
state picker — precisely the step where the funnel already loses the most
people — and read, to Luis, as "eventually this asks for a card," which he
called disqualifying even though the price itself never touched him
personally. **The signal did the damage, not the number.** Two focus-group
personas make the underlying constraint explicit and non-hypothetical: Luis
("has the money, will not leave a payment record on a police-and-immigration
app") and Marisol, who gives the same hard no *despite being legally
secure* — meaning, per the project's own analysis, "the objection is about the
category of product, not the buyer's status." A donation ask sits inside that
exact same category. Concretely, a donation feature must not:

1. **Appear anywhere inside the wizard, the state picker, or the practice
   engine** — especially not near level 5 or level 6 (the checkpoint
   scenario). That's where trust is thinnest and stakes highest; the $19
   banner's fatal flaw was placement, not amount. If it exists at all, it
   belongs on a page a user must proactively navigate to (an About/Support
   page), never in the sightline of someone mid-rehearsal.
2. **Use any language implying a future or contingent paywall** — "free for
   now," "help us keep this free," "support us so we can add more." Luis's
   objection wasn't to $19; it was to the *read* that a payment relationship
   was coming. Any donation copy that can be parsed as "eventually this costs
   something to use" reproduces the disqualifying signal at any dollar amount,
   including "optional."
3. **Redirect off amparohq.com without disclosing it first.** Every donation
   processor (Stripe, PayPal, Ko-fi, Buy Me a Coffee) takes the user to a
   different domain to enter payment details. That must be stated plainly
   before the click — "you'll leave amparohq.com to give via [processor]" —
   not discovered mid-flow. The product already has the right model for this:
   `prx_rec_note_sr` discloses the one place voice data may leave the device,
   honestly and at the point of use. A donation redirect deserves the same
   treatment, not a banner that implies a guarantee the mechanism can't back.
4. **Introduce a second, silent data-collection surface.** Most donation
   platforms default to collecting donor email/name for receipts and often
   nudge toward a mailing-list opt-in. That is a real data-collection channel
   bolted onto a product whose entire brand promise is zero collection. If
   this ships, the disclosure needs to name exactly what the processor
   collects, with the same rigor already applied to the mic feature — and the
   mailing-list default should be off, not opt-out.
5. **Bind the ask to a named individual.** A personal Venmo/Cash App/PayPal.me
   link is a worse choice than a faceless "Donate" button, not a cheaper
   version of the same thing — it converts an anonymous rights tool into "give
   money to Michael," which is a weaker trust signal for this exact audience
   (per item 4's own finding: what moves Rosa, Tony, and Marisol is an
   *organization* vouching, not a person asking) and personally identifies the
   operator to anyone who transacts, cutting against the same anonymity the
   audience is relying on when they use the product.
6. **Ship before item 4.** A donation ask from a product nobody vouches for is
   asking for financial trust before social trust exists. If this happens at
   all, the better sequencing is to route it *through* an endorsing
   organization's own donation page rather than building one on amparohq.com —
   which also resolves points 3–5 almost automatically, since the org, not
   Michael, becomes the named recipient and the domain the money moves through.
7. **Contaminate the funnel instrumentation you just shipped.** Item 1
   (`sr_step_viewed` + the stuck-strip feedback path) was just built and
   verified this session specifically to make the funnel legible. A donation
   CTA must not compete with or dilute those events, or you'll be back to not
   being able to tell what's actually happening on the 95% of visits that
   don't convert.

---

## External benchmarks used in this memo

Pulled from a live search on 2026-08-03; verify independently before relying
on any of these for a filing decision:

- Form 1023 / 1023-EZ fees and IRS processing times — [Wylie Advisory: Form 1023 vs 1023-EZ (2026)](https://wylieadvisory.com/blog/1023-vs-1023-ez), [Beacon Nonprofit: How long does it take to get 501(c)(3)?](https://www.beaconnonprofit.com/blog/how-long-does-it-take-to-get-501c3-status/)
- Nonprofit formation cost range — [Inc Authority: How much does it cost to start a nonprofit? (2026)](https://www.incauthority.com/blog/how-much-does-it-cost-to-start-a-nonprofit/)
- Players Philanthropy Fund fee structure — [PPF: Fiscal Sponsorship](https://ppf.org/fiscal-sponsorship/)
- Social Good Fund fee structure — [Social Good Fund: Sponsorship Rates](https://www.socialgoodfund.org/fiscal-sponsorship/sponsorship-rates/)
- General fiscal-sponsor fee range (5–15%) — [Charity Charge: What is a Fiscal Sponsorship?](https://www.charitycharge.com/nonprofit-resources/fiscal-sponsorship/)
- Indie donation-conversion benchmark (1/4,206 ≈ 0.024%) — [Indie Hackers](https://www.indiehackers.com/post/1-4206-conversion-rate-on-buy-me-a-coffee-1ed21a2288)
- *Upsolve, Inc. v. James* outcome, confirmed independent of the project's own memo — [Justia case record](https://law.justia.com/cases/federal/appellate-courts/ca2/22-1345/22-1345-2025-09-09.html), [Pro Bono Institute: Setback for Justice Advocates in Upsolve Litigation](https://www.probonoinst.org/2025/10/07/setback-for-justice-advocates-in-upsolve-litigation/)

**Housekeeping note, not part of the analysis:** this file should be added to
the NotebookLM sources per the existing backlog item (roadmap item 20 already
tracks "re-add new notebook documents as sources") — not done here since it
requires the `nlm` CLI flow described in `notebook/README.md`, which is a
separate action from this memo.
