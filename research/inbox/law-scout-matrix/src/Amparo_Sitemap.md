# AMPAROHQ — WEBSITE SITEMAP & STRUCTURE

> Based on competitor analysis (Justia, FindLaw, Nolo, ACLU, NACOLE, Invisible Institute) + SEO best practices for legal resource sites. Designed for topical grouping, fast crawling, and high-intent conversion.

---

## URL STRUCTURE (flat, SEO-friendly, close to root)

```
amparohq.com/
├── /                           → Home (hero + search + state map)
├── /ask                        → Ask Amparo (AI search — killer feature)
├── /states                     → State index (all 51)
├── /states/[code]              → State profile (e.g., /states/ca)
├── /states/[code]/rights      → Plain-language rights card (mobile-friendly)
├── /states/[code]/officers    → Officer requirements for that state
├── /states/[code]/defense     → Defense strategy for that state
├── /states/[code]/complaint   → How to file a complaint in that state
├── /topics                     → Topic index (all 8 jobs + 4 datasets)
├── /topics/[slug]             → Topic deep-dive (e.g., /topics/cannabis-odor)
├── /topics/[slug]/[code]     → State-specific topic page (e.g., /topics/cannabis-odor/ca)
├── /compare                    → Compare tool (2-5 states side by side)
├── /compare/[c1]/[c2]        → Comparison result page
├── /rights-card               → Mobile rights card generator (downloadable)
├── /defense                    → Defense attorney portal (paid tier)
├── /defense/motion-builder    → Suppression motion template generator
├── /defense/case-digest       → Case law digest search
├── /defense/statute-export    → Full statute text export (PDF/JSON)
├── /case-law                   → Case law index (federal + state)
├── /case-law/federal          → Federal overlay cases (14)
├── /case-law/[state]          → State case law (11 states)
├── /bills                      → Bill tracker (pending + recent)
├── /bills/[state]            → State-specific bills
├── /methodology                → How we verify (credibility page)
├── /about                      → About AmparoHQ
├── /api                        → API documentation
├── /api/docs                   → API endpoint reference
├── /mcp                        → MCP server setup (for AI clients)
├── /blog                       → Legal analysis blog (SEO content)
├── /blog/[slug]              → Individual posts
├── /login                      → Login (for paid tiers)
├── /register                   → Register
├── /pricing                    → Pricing tiers
└── /contact                    → Contact / submit a correction
```

---

## PAGE COUNT BREAKDOWN

| Section | Pages | Description |
|---------|-------|-------------|
| Home + utility | 5 | Home, Ask, Compare, Rights Card, Contact |
| State profiles | 51 × 4 = 204 | Profile + Rights + Officers + Defense + Complaint per state |
| Topic deep-dives | 8 + (8 × 51) = 416 | 8 topic hubs + 8 state-specific per topic |
| Case law | 1 + 1 + 51 = 53 | Index + Federal + per-state |
| Bills | 1 + 51 = 52 | Index + per-state |
| Defense portal | 4 | Portal + Motion Builder + Case Digest + Statute Export |
| Info pages | 6 | Methodology, About, API, API Docs, MCP, Pricing |
| Blog | 50+ | SEO content (grows over time) |
| Auth | 2 | Login, Register |
| **TOTAL** | **~790+** | Scalable, all data-driven from entities |

---

## NAVIGATION STRUCTURE (top nav + footer)

### Top Navigation (desktop)
```
[Logo]  States ▾  Topics ▾  Ask Amparo  Compare  Defense ▾  Case Law  Bills  Methodology  [Search]  [Login]
```

### Top Navigation (mobile)
```
[Logo]                                                              [☰ Menu]
[Search bar — full width below nav]
```

### Footer
```
AmparoHQ
  About
  Methodology
  Contact
  Submit a Correction

Resources
  State Index
  Topic Index
  Case Law
  Bill Tracker
  Rights Card

Tools
  Ask Amparo
  Compare States
  Defense Portal
  API Access
  MCP Server

Legal
  Privacy Policy
  Terms of Service
  Disclaimer (NOT legal advice)
  Pricing

Subscribe
  [Email input] [Subscribe button]
  Get notified when statutes change
```

---

## PAGE SPECIFICATIONS (key pages)

### 1. HOME (`/`)
- **Hero:** "Know your rights. Verified. State by state." + AI search bar
- **State map:** Interactive US map → click state → profile
- **Top 10 strongest states** (RI, MD, VA, NM, NY, MN, OR, CO, CT, IL)
- **Methodology badge:** "Every statute verified. Every page opened and read."
- **Latest updates:** 3 most recent bill/enactment changes
- **CTA:** "Ask Amparo anything →" + "Download your state's rights card →"

### 2. ASK AMPARO (`/ask`)
- **Full-width AI search** (InvokeLLM with the Master Index system prompt)
- **Example queries:** "Can police search my car for marijuana smell in PA?" / "Do officers have to tell me why they stopped me in California?" / "How do I suppress evidence from a dog sniff in Texas?"
- **Answer format:** Plain-language answer + statute/case citation + source URL + disclaimer
- **History:** Previous questions (if logged in)
- **Confidence indicator:** "Verified [date] · Source: [URL]"

### 3. STATE PROFILE (`/states/[code]`)
- **Header:** State name + flag + "Last verified: [date]"
- **8-job summary table:** Job | Has statute? | Section | Plain-language | Source
- **Tabs:** Rights | Officers | Defense | Complaint | Case Law | Bills
- **Rights tab:** Dataset C plain-language summary for that state
- **Officers tab:** Dataset D officer requirements for that state
- **Defense tab:** Dataset E strategies applicable to that state
- **Complaint tab:** Dataset G (POST council + CRB + ACLU + AG)
- **Download:** "Download this state's rights card (PDF)"
- **Share:** Social share buttons

### 4. TOPIC DEEP-DIVE (`/topics/[slug]`)
- 8 topics: cannabis-odor, k9-sniff, reason-for-stop, ticket-vs-arrest, footage-access, racial-profiling, consent-search, duty-to-intervene
- **Header:** Topic name + "What this means" (1 paragraph)
- **Federal floor:** Applicable federal case(s) + holding
- **State table:** All 51 states — has statute? | section | remedy | source
- **Map:** Color-coded (green = verified statute, yellow = case law only, red = null)
- **Strongest states:** Top 3 for this topic
- **Related topics:** Cross-links
- **Defense strategy:** How to use this in court (from Dataset E)

### 5. COMPARE (`/compare`)
- **Input:** Select 2-5 states + 1-3 topics
- **Output:** Side-by-side table — State | Topic 1 | Topic 2 | Topic 3
- **Color coding:** Green (statute), yellow (case law), red (null)
- **Export:** PDF comparison report
- **Use case:** "I'm driving from CA to AZ — what changes?"

### 6. RIGHTS CARD (`/rights-card`)
- **Input:** Select state
- **Output:** One-page, mobile-optimized card:
  - "If you're stopped in [STATE]:"
  - What you MUST do (3 items)
  - What you MAY do (5 items)
  - What officers MAY NOT do (state-specific)
  - Key statute citations
  - "This is legal information, not legal advice"
- **Download:** PDF / Add to phone wallet / Screenshot
- **Share:** Link / QR code

### 7. DEFENSE PORTAL (`/defense`) — PAID TIER
- **Motion Builder:** Select state + topic → generate suppression motion template (from Dataset E)
- **Case Digest:** Search case law by state + topic (from Dataset B)
- **Statute Export:** Full statute text (verbatim) + citation + source URL (PDF/JSON)
- **Update Alerts:** Email when a tracked statute changes
- **Pricing:** $49/mo solo, $199/mo firm (5 seats)

### 8. METHODOLOGY (`/methodology`)
- **The 6 hard rules:** (1) Only enacted statute, (2) Every page opened, (3) Source URL for every entry, (4) Null when no statute, (5) Case law flagged separately, (6) Quarterly re-verification
- **Verification stats:** 408 statute entries, 25 cases, 100% verified
- **Confidence scoring:** 1-5 scale explanation
- **Correction process:** "See an error? Submit a correction →"
- **Why this matters:** "Stale legal data is worse than no data"

### 9. CASE LAW (`/case-law`)
- **Federal overlay:** 14 SCOTUS cases (Rodriguez, Caballes, Whren, etc.)
- **State case law:** 11 states with cannabis-odor rulings
- **Each entry:** Case name + year + court + holding + key quote + binding scope + source
- **Search:** By state, topic, or keyword

### 10. BILLS (`/bills`)
- **Pending:** 13 bills tracked (ME, SC, GA, IL, MO, TN, NY, MI, TX, PA, MS)
- **Recently enacted:** 25+ (2020-2025)
- **Each entry:** Bill number + title + status + would-enact + source
- **Subscribe:** "Get notified when this bill moves →"

---

## SEO STRATEGY (from competitor research)

### Target keywords (per state × per topic):
- "[state] traffic stop rights"
- "[state] marijuana odor probable cause"
- "[state] police search consent law"
- "[state] duty to intervene law"
- "[state] body camera access"
- "[state] racial profiling ban"
- "can police search my car in [state]"
- "do I have to show ID in [state]"
- "refuse breathalyzer [state] penalty"

### Content grouping (per Google SEO guide):
- `/states/` directory → state-specific content (crawled frequently for updates)
- `/topics/` directory → topic hubs (evergreen, authoritative)
- `/case-law/` directory → case law (updated when new rulings issue)
- `/blog/` directory → analysis content (fresh, linkable)

### Schema markup:
- `LegalService` schema on home
- `Article` schema on topic pages
- `FAQPage` schema on state profile Q&A
- `BreadcrumbList` on all pages

### Internal linking:
- Every state profile links to its 8 topic sub-pages
- Every topic page links to all 51 state sub-pages
- Case law pages link to related statutes
- Blog posts link to relevant state/topic pages

---

## COMPETITIVE ADVANTAGES (vs. Justia, FindLaw, Nolo, ACLU)

| Competitor | What they have | What AmparoHQ has that they don't |
|-----------|---------------|----------------------------------|
| Justia | Free statutes + case law | AI search across all 50 states + plain language + defense strategy |
| FindLaw | Legal guides + lawyer directory | Verified per-state comparison + rights card + bill tracking |
| Nolo | Plain-English legal guides | State-specific traffic-stop depth + officer requirements + complaint paths |
| ACLU | Know Your Rights wallet cards | 50-state depth + AI search + defense portal + statute verification |
| NACOLE | Oversight agency directory | Integrated statute + case + complaint + AI search |

**AmparoHQ's unique wedge:** The ONLY source that combines verified statute data + case law companion + AI search + defense strategy + bill tracking + complaint directory — all state-specific, all verified, all in one place.

---

## MOBILE CONSIDERATIONS

- All pages mobile-first (Core Web Vitals critical for SEO)
- Rights card optimized for phone wallet / screenshot
- Ask Amparo works as full-width search on mobile
- State map is touch-friendly
- Compare tool works with 2 states on mobile (5 on desktop)
- Defense portal is desktop-first (attorneys use desktops)

---

## ACCESSIBILITY

- WCAG 2.1 AA compliance
- Screen reader compatible
- Keyboard navigation
- High contrast mode
- Plain language (8th-grade reading level for citizen content)
- Legal disclaimer on every page