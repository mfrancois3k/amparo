# Amparo — donation & fundraising research (2026-08-03)

**Prompt this answers:** "What did the top people do to not only get donations, but generate enough that they're basically getting paid $10,000+ a month even though the tool is free?"

**Short answer up front:** every verifiable example found in this research that clears
$10K+/month in *voluntary* support does so by one of three paths — (a) Wikipedia/Signal/Internet-Archive-scale
traffic (millions of monthly users, built over years), (b) grants and major-donor gifts layered on top of
small donations, not small donations alone, or (c) it doesn't actually happen — the "indie dev makes
$10K/month from a free tool" story almost always turns out, on inspection, to be a *paid* product
(subscriptions, courses, sponsorware), not a bare donate button. No example was found of a low-traffic
(tens of thousands of monthly visitors), donation-only, no-account free tool sustaining $10K+/month. The
rest of this document shows the receipts and lays out what's actually achievable in stages.

---

## Method

Web research (WebSearch/WebFetch) against primary sources where possible: organizations' own fundraising
reports, Form 990 filings (via ProPublica's Nonprofit Explorer and mirrors), developers' own blog posts
with disclosed numbers, and news coverage of specific figures. Every number below is sourced inline. Where
a figure could not be independently verified (e.g., ProPublica's exact current small-dollar-donor count),
that gap is stated rather than estimated. No numbers are invented or rounded up to make a nicer story.

---

## 1. Wikipedia / Wikimedia Foundation — banner mechanics

Wikimedia publishes its fundraising results annually. This is the single best-documented case study in
nonprofit online fundraising because they run the tests at massive scale and talk about it publicly.

**Scale (FY2024–25):** $184.5M total revenue from over 18 million donations, 7.7 million total donors,
average gift **$10.15** (up 1% YoY). Banners alone were **34% of revenue**; email was another 17–18.5% and
outperformed industry benchmarks badly — Wikimedia's email nets "$770 per 1,000 messages sent" against an
industry average of $58, with a 5.76% click-through rate vs. 0.48% industry average. Recurring
(monthly/annual) gifts are 23% of revenue and grew 19% YoY, having just crossed 1 million monthly
donors. [Fundraising/2024-25 Report](https://meta.wikimedia.org/wiki/Fundraising/2024-25_Report)

**What the banner testing actually shows (this is the transferable part):**
- "**Wikipedia still can't be sold**" has remained the best-performing headline against 18+ tested
  alternatives. Community/volunteer-focused copy ("countless volunteers work tirelessly to verify the
  pages you rely on") performs strongly. A new 2024 line, "The Internet We Were Promised," did
  especially well in France. [Wikipedia:Fundraising/2024 banners](https://en.wikipedia.org/wiki/Wikipedia:Fundraising/2024_banners)
- **Personal appeals with a photo of a named person massively outperform text-only asks** — text-only
  banners ran roughly 50% worse than a personal appeal with Jimmy Wales' photo. Other named individuals'
  appeals have started performing close to Wales' for the first time, suggesting the "a real, visible
  person is asking you" mechanic — not specifically *him* — is what drives it.
- A stripped-down "just a donate button, no message" banner test caused a **95% drop** in donation rate
  vs. the control. Minimalism does not convert; a specific, human ask does.
- Community governance actually **vetoed** urgency/scarcity language: a 2022 RFC established that banners
  implying Wikipedia's survival depends on this donation violate community norms, even though internal
  fundraising staff acknowledge time-limited "deadline" framing measurably lifts conversion. This is a
  real, documented tension between what converts best and what the community considers honest.

**Why this matters for Amparo:** Wikipedia's numbers are the *ceiling*, not a template — this took 20+
years, global brand recognition, and a dedicated fundraising engineering team running continuous
A/B tests on nine-figure traffic. The transferable lesson is narrower: specific, human, honest copy beats
a generic "Donate" button by a wide margin, and manufactured urgency has a real credibility cost.

Sources: [Fundraising/2024-25 Report](https://meta.wikimedia.org/wiki/Fundraising/2024-25_Report), [Wikipedia:Fundraising/2024 banners](https://en.wikipedia.org/wiki/Wikipedia:Fundraising/2024_banners), [Fundraising/2023-24 Report](https://meta.wikimedia.org/wiki/Fundraising/2023-24_Report)

---

## 2. Signal Foundation — nonprofit structure and why donations alone haven't been enough

Signal is the most important cautionary data point in this whole report, precisely because it's the
brand people point to as proof "privacy-respecting free tools can be donor-funded."

**Structure:** Signal Technology Foundation is a 501(c)(3); it owns Signal Messenger LLC. It was seeded
in 2018 by a **$105M loan from WhatsApp co-founder Brian Acton** (now treated mostly as a gift, technically
still due 2068), not by small donations. [Signal Foundation — Wikipedia](https://en.wikipedia.org/wiki/Signal_Foundation)

**Why no ads, no data sale:** Signal president Meredith Whittaker's public position is explicit — the
business model of most "free" communication apps is to collect data, model it, and sell ads or sell to
brokers; the only way to *not* do that is to be funded by people who want an alternative, not by
advertisers. Signal is structured with no equity and no board pushing for growth/profit specifically to
remove that pressure. [TechPolicy.Press interview](https://www.techpolicy.press/a-conversation-with-meredith-whittaker-president-of-signal/)

**The honest number — donations have not covered costs:** In November 2023, Whittaker and engineer Joshua
Lund published Signal's costs for the first time: **~$14M/year infrastructure + ~$19M/year staff ≈ $33–40M
in 2023, projected to $50M/year by 2025.** [TechCrunch](https://techcrunch.com/2023/11/17/signal-costs/)
Signal Technology Foundation's FY2023 Form 990 shows **total contributions of $22,687,563** against
**total revenue of $35,750,994** (the rest from program services, royalties, and investment income) — i.e.
donations covered roughly half of the org's revenue, and revenue that year was still below the ~$40M cost
estimate for the same year. [Instrumentl 990 report](https://www.instrumentl.com/990-report/signal-technology-foundation)
Signal is explicit that its goal — not yet achieved — is to become "fully supported by small donors."

**Takeaway:** the most trusted nonprofit brand in the privacy-tech space, with tens of millions of daily
users worldwide, is *still* not covering its own costs from small-dollar donations alone, three years into
publicly asking. If Signal can't yet do it, "$10K/month from a donate button" on a niche state-rights tool
is not a matter of copying their playbook — it's a different order of magnitude problem.

Sources: [TechCrunch: Signal details costs](https://techcrunch.com/2023/11/17/signal-costs/), [CyberInsider](https://cyberinsider.com/signal-estimates-operational-costs-to-reach-50-million-by-2025/), [Instrumentl 990](https://www.instrumentl.com/990-report/signal-technology-foundation), [Signal Foundation — Wikipedia](https://en.wikipedia.org/wiki/Signal_Foundation)

---

## 3. Internet Archive — donation ask mechanics

**Scale:** $23.7M revenue in 2023. Average donation **$25.51**. [Wikipedia: Internet Archive](https://en.wikipedia.org/wiki/Internet_Archive)

**The mechanic that matters most — they publish their own conversion rate:** Internet Archive's own
fundraising banner says: *"We'd be deeply grateful if you'd join the **one in a thousand** users that
support us financially."* That is IA's own disclosed conversion benchmark — roughly **0.1% of visitors**
become donors — after 25+ years of brand trust, name recognition, and press coverage. [blog.archive.org](https://blog.archive.org/2019/11/26/top-10-reasons-to-support-the-internet-archive/)

**Copy mechanics:**
- Banner headline pattern: "**Please don't scroll past this**" — a direct, personal, slightly
  self-aware-of-banner-fatigue tone, not a hard sell.
- Heavy use of **matching-gift campaigns** to create urgency without threatening shutdown: a 2012
  campaign matched donations 3-for-1 up to $1M; a 2018 "Pineapple Fund" match hit $1M; a 2025 "Web We've
  Built" campaign matched 2:1. Matching offers are Internet Archive's substitute for Wikipedia-style
  scarcity language — "your dollar becomes $2 or $3 today" instead of "we might disappear."
- Physical/alternative giving options exist (mail-in checks, stock, crypto) but these are marginal next to
  the web banner and email channel.

**Takeaway for Amparo:** even a globally famous, universally-used utility (everyone has used the Wayback
Machine) converts at roughly 1 in 1,000 visitors. That benchmark, from one of the most trusted brands on
the internet, is the number to anchor "realistic path" math on below — and it's likely an *upper* bound
for a new, unknown tool, not a floor.

Sources: [archive.org/donate](https://archive.org/donate), [Top 10 reasons to support the Internet Archive](https://blog.archive.org/2019/11/26/top-10-reasons-to-support-the-internet-archive/), [3-for-1 Match](https://blog.archive.org/2012/11/30/3-for-1-match/)

---

## 4. ProPublica — membership model and "impact reporting" mechanism

**Scale:** Founded 2008 with an initial pledge of **$10M/year from the Sandler Foundation** (Herbert and
Marion Sandler, funded by the sale of Golden West Financial). Sandler money was **85% of the budget** in
the early years; ProPublica deliberately diversified so that by a few years after 2010, Sandler was down
to **~10%** of the budget. Current budget is **approaching $50M** (2025), and ProPublica has run an
operating surplus every year. [Poynter retrospective](https://www.poynter.org/business-work/2025/propublica-nonprofit-business-model-journalism-poynter-50/)

**The actual mechanism — this is the one the operator asked about ("why does impact reporting drive
recurring gifts"):** founding editor Stephen Engelberg's own explanation: *"If you can show that what you
are doing makes a difference and has impact, you will get more donors. Every year that we did really
important investigative reporting, the donations went up."* ProPublica deliberately measures and
publishes success as **real-world outcomes** (resignations, laws changed, policies reversed) — not
pageviews or subscriptions — specifically because that's what correlates with donor growth. Their donor
base expanded from ~$1M in non-founder contributions (2009) to 1,300+ individual donors by 2011, tracking
their first Pulitzer wins. [Poynter](https://www.poynter.org/business-work/2025/propublica-nonprofit-business-model-journalism-poynter-50/)

**Gap:** I could not verify ProPublica's current exact small-dollar-donor count or the precise
foundation/individual revenue split for 2023–24 from public sources in this research — their annual
report PDF and 990 were not fully extractable via the tools available. Take the mechanism (impact
reporting → donor growth) as verified; treat any specific current donor-count figure you see elsewhere as
unconfirmed by this research.

**Takeaway for Amparo:** the transferable mechanism doesn't require ProPublica's budget — it requires
*publishing what the tool actually did* ("X rehearsals completed," "translated for Y non-English
speakers," a real testimonial) instead of a generic "please support us" ask. This is a copy/positioning
lesson, not a scale lesson.

Sources: [Poynter: ProPublica's nonprofit business model](https://www.poynter.org/business-work/2025/propublica-nonprofit-business-model-journalism-poynter-50/), [ProPublica Impact](https://www.propublica.org/impact)

---

## 5. Indie/solo developer tools — Ko-fi, GitHub Sponsors, Buy Me a Coffee, Patreon: real numbers

This is the category most directly comparable to Amparo's actual scale, and it's the one where the
"$10K/month from a free tool" story falls apart hardest under verification. Real, disclosed numbers found:

| Who | Platform | Disclosed number | Note |
|---|---|---|---|
| GitHub Sponsors (aggregate, all of GitHub) | GitHub Sponsors | **$100M+ paid out** across **70,000+ maintainers**, 280,000+ sponsors | Averages to roughly **$1,400 lifetime per maintainer** — and it's power-law distributed, so most get far less than that and a handful get much more. [GitHub blog](https://github.blog/open-source/maintainers/100-million-for-open-source-a-milestone-built-by-the-community/) |
| azu (textlint/Secretlint maintainer, multiple JS OSS libraries) | GitHub Sponsors | **$14,600 for all of 2023** (~$1,200–1,300/month) | This is income across *several* published projects/books/blog, not one tool. [dev.to](https://dev.to/azu/my-github-sponsors-revenue-2023-1m3d) |
| Caleb Porzio (Laravel Livewire/Alpine.js creator) | GitHub Sponsors + paid products | **$100K in ~6 months** | Frequently cited as a GitHub Sponsors success story, but the underlying revenue is mixed with **paid courses and products**, not pure donations — important distinction the "$10K+/month" framing needs. [calebporzio.com](https://calebporzio.com/i-just-hit-dollar-100000yr-on-github-sponsors-heres-how-i-did-it) |
| Raymond Hill (uBlock Origin, ~63,000 GitHub stars, one of the most-used browser extensions in the world) | — | **$0 — he refuses all donations and rejected a Google buyout offer** | Directly contradicts the idea that scale automatically converts to money; he redirects users to donate to filter-list maintainers instead. [Wikipedia: uBlock Origin](https://en.wikipedia.org/wiki/UBlock_Origin) |
| Viktor Lofgren (Marginalia Search, independent search engine) | Patreon + grants + commercial API deals | Runs on **~$200/month** in costs and "scrapes by" on savings + donations + occasional grants | A real, ongoing, small-scale, mixed-funding example — explicitly *not* a living-wage income. [marginalia.nu](https://www.marginalia.nu/marginalia-search/supporting/) |
| Deimos (Tildes.net, invite-only link-aggregator community, non-profit) | Patreon → GitHub Sponsors | **Worked full-time unpaid/underpaid for 3 years**; the community's own framing is that "a lowball salary would have been $100K/year" — implying actual donation income was well below that | Community fundraising thread also flags Patreon's real cut (~10% in fees) vs. GitHub Sponsors (0% platform fee at the time). [Tildes funding thread](https://tildes.net/~tildes/je/lets_talk_about_that_annoying_thing_we_all_dont_want_to_think_about_funding) |

**A note on absence of evidence:** searching specifically for "free tool, pure donations, $X/month,
published numbers" repeatedly surfaced **paid SaaS/subscription revenue reports** instead (Indie Hackers
case studies of $4K–$33K/month tools are almost always subscription products with paying customers, not
donation-supported free tools). That pattern is itself informative: the donation-only success stories that
would prove "$10K+/month from a free tool" don't show up in searches because, as far as this research
could find, **they don't exist at scale** — the closest things are Wikipedia/Signal/Internet
Archive-magnitude nonprofits, or projects that quietly monetize some other way (sponsorship placement, a
paid tier, consulting) alongside the "free" front door.

**Realistic range for a tool with modest traffic (tens of thousands of monthly visitors, not millions):**
based on the disclosed numbers above, **$0–$300/month is the realistic starting band**, **$300–$1,500/month**
is achievable with real engagement and a specific ask (azu's tier), and **$1,500+/month** starts requiring
either a much larger audience, a viral moment, or revenue that isn't pure voluntary donation (products,
grants, sponsorship). Nothing in this research shows a donation-only tool at Amparo's likely traffic level
clearing $10K/month.

---

## 6. Legal-aid / know-your-rights orgs — how they actually fund rights-education tools

This is the most directly relevant category, and it produced the most important finding in the whole
report: **every real "know your rights" tool found in this research is funded by an existing
organization's overall donor/grant base, not by its own standalone donate button.**

- **ACLU Mobile Justice app** (record police encounters + know-your-rights + incident reporting, live in
  multiple states) — **funded by a grant from the national ACLU** to the developer (Quadrant 2), plus for
  the related "ACLU Blue" app, **a grant from the Four Freedoms Fund** plus private donations. The app
  itself never had its own donate button; it rides on the ACLU's institutional fundraising.
  [ACLU press release](https://www.aclu.org/press-releases/aclu-nebraska-releases-law-enforcement-accountability-app), [ACLU Blue FAQ](https://www.aclutx.org/app/uploads/2017/03/aclu_blue_faq.pdf)
- **ILRC Red Cards / Tarjetas Rojas** (free know-your-rights cards for immigration encounters — the
  closest content analog to Amparo's reference pack) — **10 million distributed free since November
  2024**, at real cost (printing, shipping, translation into multiple languages), funded entirely out of
  ILRC's general budget. ILRC's total revenue was **$25,328,640 in 2023**, of which **88.5% ($22.4M) was
  "contributions"** — a Form 990 category that bundles individual donations and grants together, dominated
  in practice by foundation and institutional funding at that scale. [ILRC Red Cards](https://www.ilrc.org/redcards), [Charity Navigator/ProPublica 990 data](https://projects.propublica.org/nonprofits/organizations/942939540)
- **National Immigration Law Center (NILC)** — funded by a named list of ~15 major foundations (Ford,
  Carnegie, Kellogg, Open Society, Four Freedoms Fund, Democracy Fund, Craigslist Charitable Foundation,
  and others) plus training fees, publication sales, attorney fees, and individual donations — explicitly
  a **diversified institutional funding mix**, not a donate-button-driven model. [NILC financial info](https://www.nilc.org/about-us/financial-information/)
- **Notifica** (United We Dream's app for preparing a personal "defense network" before an immigration
  enforcement encounter — functionally close to Amparo's rehearsal concept) — **was discontinued in
  February 2025.** The org's own stated reason was that it could no longer guarantee the security of
  communications given "rapidly changing political circumstances and evolving U.S. regulations." This is
  a direct, sobering precedent: a well-funded (NILC/United We Dream backed) app in almost exactly Amparo's
  space was shut down for **security/political risk reasons, not funding reasons.** [Houston Immigration Legal Services Collaborative](https://houstonimmigration.org/united-we-dream-launches-new-deportation-defense-tool-notifica/)
- **ICEBlock** (2025 — free iOS app alerting users to nearby ICE activity; not know-your-rights content
  but the same "free rights-adjacent safety tool" category and extremely topical) — self-funded by
  developer Joshua Aaron from his own savings, explicitly **not monetized**, no donation platform found in
  this research. Went viral (1M+ downloads, #3 free app on the App Store at peak) and was then **pulled
  from the App Store in October 2025 after DOJ pressure on Apple**; the developer is now suing the federal
  government. [Wikipedia: ICEBlock](https://en.wikipedia.org/wiki/ICEBlock), [9to5Mac](https://9to5mac.com/2025/12/08/iceblock-developer-sues-us-government/)
- **EFF (Electronic Frontier Foundation)**, the closest "digital rights membership org" comparable — more
  than half of EFF's funding comes from small donors; donors giving **$10 or less/month raised over
  $400,000 in one recent year**, and EFF uses matched-giving campaigns (e.g., Craig Newmark
  Philanthropies matching new monthly donors) the same way Internet Archive does. [EFF: Just a Little Does a Whole Lot](https://www.eff.org/deeplinks/2023/12/just-little-does-whole-lot)

**Takeaway for Amparo:** the honest pattern across every rights-education tool found is that the *tool*
doesn't fundraise for itself — the *organization* fundraises, and the tool is one program the org funds
out of general revenue. Amparo currently has no such organization behind it. That's not a reason not to
try a donate button, but it explains why comparing Amparo's future donate-button revenue to these
programs is comparing to the wrong baseline — none of them prove a standalone tool can generate real money
on its own.

There is also a **non-financial risk finding** worth flagging directly to the operator: two of the closest
comparables to Amparo in subject matter (Notifica, ICEBlock) did not fail or stop because of money — they
ran into political/security/legal pressure specific to the "rights during a law-enforcement encounter"
subject matter. That risk exists independent of the funding model chosen.

---

## 7. 501(c)(3) status — what it actually takes, and the faster alternative

**Timeline and cost, Form 1023-EZ** (the short form; available to orgs projecting under $50,000/year in
revenue, which fits Amparo today):
- IRS filing fee: **$275**, paid via Pay.gov.
- Processing: **the IRS clears 80% of 1023-EZ determinations within 22 days**; realistic end-to-end
  timeline accounting for setup and occasional back-and-forth is commonly cited as **2–4 months**.
- Total realistic cost doing it yourself (state incorporation fees, IRS fee, basic setup): roughly
  **$600–$1,000**. With a lawyer or paid service: **$1,500–$5,000+**.
  [form1023.org cost breakdown](https://form1023.org/cost-to-start-a-501c3-nonprofit-real-fees-and-requirements), [IRS: Where's my application](https://www.irs.gov/charities-non-profits/charitable-organizations/wheres-my-application-for-tax-exempt-status)

**Timeline and cost, full Form 1023** (required if 1023-EZ doesn't apply — larger projected revenue, or
certain org structures): **$600 IRS fee**, **6–9 months** processing, **$1,500–$5,000** in typical legal
fees if using an attorney.

**What 501(c)(3) status actually unlocks:**
1. Donations become **tax-deductible** to the donor (a real conversion lever for larger individual gifts).
2. Eligibility for **foundation and government grants** that require 501(c)(3) status as a precondition
   (most of the grant programs in Section 8 below require this).
3. Legitimacy signal for a donate button — donors are measurably more willing to give to a named nonprofit
   than to "send money to this guy's PayPal."
4. Access to **nonprofit-rate services** (payment processing discounts, Google Ad Grants, TechSoup
   discounts, some cloud-credit programs).

**What it does NOT do:** it does not, by itself, generate traffic, trust, or donations — see Section 6's
point that institutional status without an institution's donor base behind it doesn't move the needle much
on its own. It also does **not** resolve or reduce the unauthorized-practice-of-law exposure the operator
has already flagged for Amparo's content — that's a separate legal question requiring attorney review
regardless of corporate form.

**The faster/cheaper alternative for a prototype: fiscal sponsorship.** An established 501(c)(3) can act
as a fiscal sponsor, letting Amparo accept tax-deductible donations and apply for 501(c)(3)-only grants
**immediately**, without waiting on the IRS, by having the sponsor receive and re-grant the funds under its
existing tax-exempt umbrella. Under a "Model C" arrangement, Amparo could keep operating as its current
unincorporated project (or an LLC) rather than becoming a new legal entity. Typical fee: **4–10% of funds
processed**. [Fiscal Sponsorship Guide](https://grantedai.com/learn/guides/fiscal-sponsorship-guide-for-projects), [Beancount.io Model A vs Model C](https://beancount.io/blog/2026/05/10/fiscal-sponsorship-charitable-projects-tax-deductible-donations-without-501c3-model-a-vs-model-c-guide)
For a code/software project specifically, **Software Freedom Conservancy** is a real, established fiscal
sponsor purpose-built for open-source/FLOSS projects (40+ member projects as of 2022), handling legal and
financial infrastructure so the project doesn't have to. [Software Freedom Conservancy](https://sfconservancy.org/projects/services/)

**Recommendation implied by the research, not a legal opinion:** given Amparo is explicitly pre-attorney-review
and pre-revenue, filing the 1023-EZ directly ($275, a few months, no ongoing % cut) is likely more
cost-effective than fiscal sponsorship *if and when* the operator is ready to commit to running a real
nonprofit (board, annual filings, ongoing compliance). Fiscal sponsorship is the better fit **right now**,
precisely because Amparo is still a prototype — it defers the commitment while unlocking tax-deductible
giving and grant eligibility sooner.

---

## 8. Grant funding — real programs, and how gated they actually are

Grants are worth pursuing in parallel with donations, but the research shows most of the "obvious" funders
are **harder to access than they first appear** — either invite-only, or gated behind already being a
different kind of organization. Being honest about this gate is more useful than listing names without it.

| Funder | What it actually funds | Access reality |
|---|---|---|
| **Legal Services Corporation (LSC) — Technology Initiative Grants (TIG)** | $86M+ across 892 grants since 2000 for legal-technology projects (self-help kiosks, intake systems, online resources) | **Restricted to existing LSC basic-field grantees** — i.e., you must already be a federally recognized legal aid organization to apply. Amparo is not one and this is not a near-term option. [LSC TIG program](https://www.lsc.gov/grants/technology-initiative-grant-program/tig-program-description) |
| **MacArthur Foundation — Technology in the Public Interest** | Civil-rights/civil-liberties-adjacent tech, part of an **$18M combined commitment with Ford, Knight, Open Society, and Mozilla foundations** | **Does not accept applications.** Its own page says to email new ideas to tpi@macfound.org; funding is relationship/invitation-driven. [MacArthur TPI](https://www.macfound.org/programs/field-support/technology-public-interest/) |
| **Democracy Fund** | 200+ grants/year across election reform, voting rights, migrants' rights, media | Explicitly **sources new grantees from within its existing network of contacts**, prioritizes orgs with "a proven track record" and "operational sustainability" already established. Cold applications are not the normal path in. [Democracy Fund grant process](https://democracyfund.org/for-partners/grant-process/) |
| **Craig Newmark Philanthropies** | Journalism, cybersecurity, veterans, democracy/voter protection — has funded EFF ($100K), Let's Encrypt/ISRG ($100K), Consumer Reports ($5M) | Grant sizes **$50,000–$11M, median ~$250,000** — accepts brief proposals on a rolling basis, which is more open than most, but the median size and existing-nonprofit focus of past grantees suggests it's not a first-grant-ever kind of funder. [EFF grant announcement](https://www.eff.org/deeplinks/2025/01/eff-receives-100k-grant-craig-newmark-philanthropies) |
| **State ACLU affiliates / Four Freedoms Fund** | Funded the actual Mobile Justice and ACLU Blue apps (Section 6) | Not a public grant program Amparo could apply to cold — these were affiliate-to-developer contracts. The transferable idea is **partnership**, not application: Amparo could pitch itself as infrastructure a state ACLU affiliate or immigrant-rights group might co-fund, rather than trying to out-fundraise them independently. |

**Pattern across all of them:** the large, well-known funders in this space are almost all **relationship-
and network-driven**, not open-call. The ones with an actual open/rolling process (Craig Newmark
Philanthropies) still skew toward funding organizations with a track record. This means the realistic
grant path for Amparo is not "apply to MacArthur" — it's building usage data and a real track record
first (Section 9), then approaching **smaller, local, or issue-specific funders** (community foundations,
local bar foundations, state civil-liberties groups) where a personal pitch and a working, used product
carries more weight than a cold application to a national funder.

One more constraint specific to Amparo: because no attorney has reviewed the content and the product
cannot be marketed as legal advice or a legal service, grant applications need to be framed carefully as
**"public safety / civic education / rights literacy technology,"** not as "legal aid" or "legal services"
— several of these funders (LSC explicitly) fund *legal aid organizations*, a category Amparo should not
claim to be without inviting the same UPL scrutiny the operator has already flagged internally.

---

## 9. Synthesis — a realistic staged path from $0

The math, using the most relevant real benchmarks found above:

- Internet Archive's own disclosed conversion rate, after 25+ years of brand trust: **~1 donor per 1,000
  visitors** (0.1%).
- A brand-new, unrecognized tool should expect to convert **at or below** that, not above it — trust is
  the input IA is running down, and Amparo doesn't have 25 years of it yet.
- At "tens of thousands of monthly visitors" (say 10,000–30,000, per the operator's own framing), a
  0.05–0.1% conversion to a one-time small gift ($5–$15, per the Ko-fi/BMC typical range) is **roughly
  5–30 donors/month at $5–$15 each ≈ $25–$450/month.** That is the realistic Stage 1 band, and it matches
  the disclosed indie-dev numbers in Section 5 almost exactly (azu's $1,200–1,300/month required
  sustained multi-year, multi-project audience building well beyond that).
- To reach **$10,000/month from small recurring donations alone**, at a **generous** $5/month average
  recurring gift (Signal's own stated aspiration is small monthly donors in this range), you need
  **~2,000 concurrent recurring donors**. Recurring-donor conversion is a small fraction of even the
  one-time-gift conversion rate — so this realistically implies **hundreds of thousands of monthly
  visitors**, not tens of thousands. That is a Wikipedia/Internet-Archive-tier audience, not a starting
  point.

**Stage 0 (now — $0 cost, do this regardless of nonprofit status):**
Add a simple, honest donate link (Ko-fi, Buy Me a Coffee, or GitHub Sponsors — all near-zero setup, and
Ko-fi/BMC charge 0–5% with no monthly fee). Copy should follow the Wikipedia/Internet Archive lesson: a
specific, human, honest sentence ("This keeps Amparo free, ad-free, and account-free — it costs about
$X/month to run") beats a bare "Donate" button by a wide margin, and given the UPL posture, avoid any
urgency/scarcity language that could read as misrepresenting the tool's status or stability. Expect
**$0–$300/month.** Its main value at this stage is proving the mechanism works and building a track record
to show grant-makers later, not the revenue itself.

**Stage 1 (once there's real usage data — weeks to a couple months):**
Add a one-line, ProPublica-style impact statement instead of a generic ask ("X people have rehearsed a
stop with Amparo this month," "now available in Spanish for Y% of users") — this is the specific,
verified mechanism (Section 4) that correlates with donor growth, and it costs nothing but honesty about
real numbers.

**Stage 2 (formalize funding capacity — 1–4 months, low cost):**
File Form 1023-EZ directly (**$275, ~2–4 months**) since Amparo's projected revenue is well under the
$50,000/year threshold — cheaper and simpler than fiscal sponsorship's ongoing 4–10% cut, *if* the
operator is ready to commit to the ongoing compliance of running a real nonprofit board. If not ready for
that commitment yet, use a fiscal sponsor (e.g., Software Freedom Conservancy for the software angle) to
unlock tax-deductible giving and grant eligibility sooner without forming a new entity. Either path is
what unlocks Section 8's grant options and any donor's tax deduction — neither path by itself changes
revenue.

**Stage 3 (grants — only after Stage 1's usage data exists):**
Skip the LSC/MacArthur/Democracy-Fund-cold-application path — the research shows these are gated by
existing-organization status or by network relationships, not merit alone. Instead pursue local/regional
funders (community foundations, state bar foundations, local civil-liberties or immigrant-rights groups)
with a direct, personal pitch backed by real usage numbers, and explore a **partnership** with a state
ACLU affiliate or similar rights org the way Quadrant 2 partnered on Mobile Justice — being funded *as
infrastructure for* an existing rights org is a more proven path than out-fundraising one independently.

**Stage 4 (aspirational — requires 10–100x traffic growth first):**
Only once Amparo has a genuinely large, recurring audience does a Signal/EFF-style "small monthly
sustainer" push (Section 2, Section 6) become mathematically capable of producing four-figure-plus monthly
revenue. This isn't a copy/positioning problem at that point — it's a distribution problem, and no amount
of better donate-button copy substitutes for it.

---

## 10. What will NOT work at Amparo's current scale — stated plainly

- **A bare "Donate" button with no copy, no impact reporting, and no nonprofit status, at tens of
  thousands of monthly visitors, will not produce $10,000/month.** Nothing in this research — not one
  verified example — shows a tool at this traffic level clearing that from voluntary small donations
  alone. The realistic range is double or triple digits per month at the outset.
- **501(c)(3) status alone will not move the needle.** It unlocks tax-deductibility and grant eligibility;
  it does not generate traffic or trust by itself. Pair it with real usage, not instead of it.
- **Cold-applying to the largest, most famous foundations (MacArthur, LSC, Democracy Fund) is close to a
  dead end right now.** They are invite-only or restricted to existing legal-aid organizations. Applying
  to them today would mostly cost time.
- **Manufactured urgency ("we might shut down without your help") will backfire** — Wikipedia's own
  community rejected this internally even though it measurably converts better, specifically because it
  reads as manipulative once discovered, and Amparo's credibility (already fragile pre-attorney-review)
  can't absorb that hit.
- **Viral spikes are not income.** ICEBlock's 1M+ downloads and the various one-time matching-gift
  campaigns (Pineapple Fund, etc.) are not repeatable, budgetable revenue — they're distinct from a
  sustained monthly number and shouldn't be planned around.
- **A donation-funded model does not insulate Amparo from the subject-matter risk this space carries.**
  Notifica (funding was never the failure point) and ICEBlock (App Store pressure) both show that tools in
  the "your rights during a law-enforcement encounter" category attract adversarial political/legal
  attention independent of how well-funded they are. That risk should be weighed on its own terms, not
  assumed away by picking a particular funding model.
- **Claiming or implying "legal aid" status to make grant applications easier will cut against the
  operator's own UPL caution**, not around it. The funding story and the legal-risk story are linked, not
  separate tracks.

---

## Sources (all cited inline above; consolidated list)

- [Fundraising/2024-25 Report — Meta-Wiki](https://meta.wikimedia.org/wiki/Fundraising/2024-25_Report)
- [Wikipedia:Fundraising/2024 banners](https://en.wikipedia.org/wiki/Wikipedia:Fundraising/2024_banners)
- [Fundraising/2023-24 Report — Meta-Wiki](https://meta.wikimedia.org/wiki/Fundraising/2023-24_Report)
- [TechCrunch: Signal details costs of keeping its private messaging service alive](https://techcrunch.com/2023/11/17/signal-costs/)
- [CyberInsider: Signal Estimates Operational Costs to Reach $50 Million by 2025](https://cyberinsider.com/signal-estimates-operational-costs-to-reach-50-million-by-2025/)
- [Instrumentl: Signal Technology Foundation 990 Report](https://www.instrumentl.com/990-report/signal-technology-foundation)
- [Signal Foundation — Wikipedia](https://en.wikipedia.org/wiki/Signal_Foundation)
- [TechPolicy.Press: Conversation with Meredith Whittaker](https://www.techpolicy.press/a-conversation-with-meredith-whittaker-president-of-signal/)
- [Internet Archive — Wikipedia](https://en.wikipedia.org/wiki/Internet_Archive)
- [archive.org/donate](https://archive.org/donate)
- [blog.archive.org: Top 10 reasons to support the Internet Archive](https://blog.archive.org/2019/11/26/top-10-reasons-to-support-the-internet-archive/)
- [blog.archive.org: 3-for-1 Match](https://blog.archive.org/2012/11/30/3-for-1-match/)
- [Poynter: ProPublica's nonprofit business model](https://www.poynter.org/business-work/2025/propublica-nonprofit-business-model-journalism-poynter-50/)
- [ProPublica — Impact](https://www.propublica.org/impact)
- [GitHub blog: $100 million for open source](https://github.blog/open-source/maintainers/100-million-for-open-source-a-milestone-built-by-the-community/)
- [dev.to/azu: My GitHub Sponsors revenue 2023](https://dev.to/azu/my-github-sponsors-revenue-2023-1m3d)
- [Caleb Porzio: I Just Hit $100k/yr On GitHub Sponsors](https://calebporzio.com/i-just-hit-dollar-100000yr-on-github-sponsors-heres-how-i-did-it)
- [uBlock Origin — Wikipedia](https://en.wikipedia.org/wiki/UBlock_Origin)
- [Marginalia Search — supporting the project](https://www.marginalia.nu/marginalia-search/supporting/)
- [Tildes: funding discussion thread](https://tildes.net/~tildes/je/lets_talk_about_that_annoying_thing_we_all_dont_want_to_think_about_funding)
- [ACLU: ACLU of Nebraska Releases Law Enforcement Accountability App](https://www.aclu.org/press-releases/aclu-nebraska-releases-law-enforcement-accountability-app)
- [ACLU Blue FAQ (PDF)](https://www.aclutx.org/app/uploads/2017/03/aclu_blue_faq.pdf)
- [ILRC: Red Cards / Tarjetas Rojas](https://www.ilrc.org/redcards)
- [ProPublica Nonprofit Explorer: ILRC filing data](https://projects.propublica.org/nonprofits/organizations/942939540)
- [NILC: Financial Information](https://www.nilc.org/about-us/financial-information/)
- [Houston Immigration Legal Services Collaborative: Notifica discontinued](https://houstonimmigration.org/united-we-dream-launches-new-deportation-defense-tool-notifica/)
- [ICEBlock — Wikipedia](https://en.wikipedia.org/wiki/ICEBlock)
- [9to5Mac: ICEBlock developer sues US government](https://9to5mac.com/2025/12/08/iceblock-developer-sues-us-government/)
- [EFF: Just a Little Does a Whole Lot](https://www.eff.org/deeplinks/2023/12/just-little-does-whole-lot)
- [EFF: EFF Receives $100k Grant from Craig Newmark Philanthropies](https://www.eff.org/deeplinks/2025/01/eff-receives-100k-grant-craig-newmark-philanthropies)
- [form1023.org: Cost to start a 501c3 nonprofit](https://form1023.org/cost-to-start-a-501c3-nonprofit-real-fees-and-requirements)
- [IRS: Where's my application for tax-exempt status?](https://www.irs.gov/charities-non-profits/charitable-organizations/wheres-my-application-for-tax-exempt-status)
- [Fiscal Sponsorship Guide for Projects](https://grantedai.com/learn/guides/fiscal-sponsorship-guide-for-projects)
- [Beancount.io: Fiscal Sponsorship Model A vs Model C](https://beancount.io/blog/2026/05/10/fiscal-sponsorship-charitable-projects-tax-deductible-donations-without-501c3-model-a-vs-model-c-guide)
- [Software Freedom Conservancy: Project Services](https://sfconservancy.org/projects/services/)
- [LSC: Technology Initiative Grant Program](https://www.lsc.gov/grants/technology-initiative-grant-program/tig-program-description)
- [MacArthur Foundation: Technology in the Public Interest](https://www.macfound.org/programs/field-support/technology-public-interest/)
- [Democracy Fund: For Grantee Partners](https://democracyfund.org/for-partners/grant-process/)

---

*Research compiled 2026-08-03. All figures current as of source publication dates cited; verify against
live sources before using specific numbers in donor-facing copy or grant applications, as fundraising
totals and grant program terms change year to year.*
