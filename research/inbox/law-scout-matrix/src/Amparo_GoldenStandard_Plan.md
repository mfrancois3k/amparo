# AMPARO MATRIX — GOLDEN STANDARD EXPANSION PLAN

> Goal: Transform the current 8-job statute survey into the definitive, AI-ready, user-facing legal research utility for state-level police-practices and traffic-stop law. This document catalogs blindspots, prescribes new data, and specifies the website features + components needed to integrate everything so Claude (and any AI co-pilot) can reason over the full dataset.

---

## ✅ RESEARCH COMPLETION CHECKLIST

> All research that doesn't involve website building is COMPLETE. Claude can now build the website on top of this verified dataset.

- [x] **Dataset B — Case Law Companion** (`src/Amparo_DatasetB_CaseLaw.md`) — 14 federal overlay cases (Rodriguez, Caballes, Whren, Johnson, Brendlin, J.L., Hiibel, Schneckloth, Robinette, Terry, Mimms, Wilson, Bumper, Miranda) + 11 state cannabis-odor cases (CO, WA, MI, PA, VT, IL, MA, FL, NJ, MO + null states). All verified via court opinion pages.
- [x] **Dataset C — Plain-Language Summaries** (`src/Amparo_DatasetC_PlainLanguage.md`) — All 50 states + DC, 8th-grade reading level, covering all 8 jobs. Top 10 strongest-protection states detailed + abbreviated summaries for all 51.
- [x] **Dataset D — Officer Requirements** (`src/Amparo_DatasetD_OffenseRequirements.md`) — Universal federal floor + state-specific duties for Jobs 1, 3, 7, 8. Tiered by strength (Tier 1 strongest, Tier 3 federal floor only).
- [x] **Dataset E — Defense Strategy Playbook** (`src/Amparo_DatasetE_DefenseStrategy.md`) — 7 defense strategies (cannabis-odor suppression, stop-duration/dog-sniff, consent-search, reason-for-stop, duty-to-intervene, racial profiling, BWC access). Elements, burden, key cases, government counterarguments + rebuttals.
- [x] **Dataset F — Recording & Refusal Rights** (`src/Amparo_DatasetF_RecordingRefusal.md`) — One-party vs. all-party consent (all 51), right to record police (1st Amendment, all circuits), implied consent/breathalyzer refusal penalties (all 51), stop-and-identify statutes (24 states), universal citizen rights during stops.
- [x] **Dataset G — Complaint & Oversight Directory** (`src/Amparo_DatasetG_ComplaintDirectory.md`) — 7 complaint paths, 51 POST councils (with URLs), 20 major civilian review boards, ACLU affiliates (all 50), DOJ Civil Rights Division, §1983 litigation framework with statute of limitations by state.
- [x] **Dataset H — Bill Tracker & Update Pipeline** (`src/Amparo_DatasetH_BillTracker.md`) — 13 pending bills (ME, SC, GA, IL, MO, TN, NY, GA, MI, TX, PA, MS), 25+ recent enactments (2020-2025), quarterly re-verification schedule, confidence scoring system, monitoring resources.
- [x] **Master Index & Claude System Prompt** (`src/Amparo_MasterIndex.md`) — Single entry point indexing all 15 research files, blindspot resolution map (25/27 resolved), Claude system prompt with 10 anti-hallucination rules, query routing table.
- [x] **Website Sitemap & Structure** (`src/Amparo_Sitemap.md`) — Full URL structure (~790 pages), navigation, page specs for all key pages (Home, Ask Amparo, State Profiles, Topic Deep-Dives, Compare, Rights Card, Defense Portal, Case Law, Bills, Methodology), SEO strategy with target keywords, competitive advantage analysis vs. Justia/FindLaw/Nolo/ACLU, mobile + accessibility specs.

**BLINDSPOTS RESOLVED: 25 of 27** (2 out of scope: immigration consequences, cross-state reciprocity)
**REMAINING FOR CLAUDE: Website build** (entities, API, pages, components, workflows — all data is ready)

---

## PART 1 — CURRENT STATE AUDIT

### What exists today (8 jobs, 50 states + DC, 100% verified)
| Job | Coverage | Verified | Nulls |
|-----|----------|----------|-------|
| 1. Pretextual stops / cannabis-odor bars | 51 | 10 | 41 |
| 2. K-9 sniff limits | 51 | 0 | 50 (case law) |
| 3. Reason-for-stop duty | 51 | 5 | 46 |
| 4. Ticket vs arrest (citation-in-lieu) | 51 | 49 | 1 |
| 5. Footage access (BWC) | 51 | 23 | 27 |
| 6. Police-practices (profiling bans) | 51 | 28 | 22 |
| 7. Consent-to-search limits | 51 | 6 | 45 |
| 8. Duty to intervene | 51 | 22 | 28 |

**Format:** Markdown research files in `src/`. No web interface, no database, no search, no API.

---

## PART 2 — BLINDSPOTS (27 identified)

### A. DATA GAPS — Missing columns that users need

| # | Blindspot | Why it matters | Impact |
|---|-----------|---------------|--------|
| 1 | **No actual statute text** — only 15-word summaries | Users cannot cite the real language; AI cannot quote verbatim | CRITICAL |
| 2 | **No case law companion** — Rodriguez, Caballes, state supreme court rulings | 41 of 50 states' cannabis-odor protections are CASE LAW, not statute — currently invisible | CRITICAL |
| 3 | **No federal overlay** — 4th Amendment, Whren v. U.S., Rodriguez v. U.S., Illinois v. Caballes, Arizona v. Johnson | Federal law is the floor; users need to know when state law exceeds or falls below it | CRITICAL |
| 4 | **No penalty / remedy detail** — "exclusion" without scope | Users don't know if exclusion covers evidence, statements, or derivative evidence | HIGH |
| 5 | **No effective dates / enactment history** | Users can't tell if a statute is current; OH §3780.33 is from 2023, NY §222.05 from 2021 | HIGH |
| 6 | **No amendment tracking** | Laws change; no version control means stale data risk | HIGH |
| 7 | **No cross-job linkage** — RI §31-21.2-5 covers Jobs 1, 3, 7 but isn't linked | Users miss that one statute can cover multiple protections | HIGH |
| 8 | **No plain-language citizen summary** | Non-lawyers can't use the data; the 15-word descriptions are for lawyers | CRITICAL |
| 9 | **No officer-facing requirements** | Officers don't know what they MUST do (inform reason, advise consent, intervene) | HIGH |
| 10 | **No defense-strategy application** | Defense attorneys need to know HOW to use each statute in a motion to suppress | CRITICAL |
| 11 | **No evidence-suppression standards per state** | Whether failure to comply = exclusion, civil suit, or nothing | HIGH |
| 12 | **No recording rights (one/two-party consent)** | Citizens need to know if they can record their stop; 38 states are one-party | HIGH |
| 13 | **No stop-duration limits** | MT §46-5-403 has one; Rodriguez sets federal floor; users need state-specific | MEDIUM |
| 14 | **No passenger rights** | Arizona v. Johnson, Brendlin v. California — passengers have different rights | MEDIUM |
| 15 | **No refusal rights (breathalyzer, search, ID)** | Implied consent laws vary; refusal consequences vary (license suspension vs. nothing) | HIGH |
| 16 | **No immigration consequences** | Traffic stops can trigger immigration holds in some states | MEDIUM |
| 17 | **No complaint / oversight mechanisms** | Where to file when rights are violated (civilian review boards, POST complaints) | HIGH |
| 18 | **No qualified immunity standards** | Whether officers can be personally sued for violations | MEDIUM |
| 19 | **No recent bill tracking** | Pending legislation that could change the landscape (ME HP1057, SC H.3829, IL SB0042) | MEDIUM |
| 20 | **No court interpretation notes** | How courts have applied each statute (e.g., State v. Gray for OH §3780.33) | HIGH |
| 21 | **No cross-state reciprocity** | Whether one state's protections apply to out-of-state drivers | LOW |
| 22 | **No data source provenance / confidence** | Users don't know how fresh each entry is or its verification method | HIGH |
| 23 | **No state agency / POST policy links** | Agency policy often fills statutory gaps (DC MPD General Order 901.07) | MEDIUM |
| 24 | **No searchable statute index** | Users can't find "what statute covers X in state Y" without reading every file | CRITICAL |
| 25 | **No jurisdiction-by-jurisdiction comparison** | Can't compare 3 states side by side on all 8 jobs | HIGH |
| 26 | **No mobile-optimized citizen rights card** | The highest-impact user need — a printable/shareable per-state rights summary | CRITICAL |
| 27 | **No AI-ready structured data (JSON/API)** | Claude can't query the data programmatically; it's locked in markdown | CRITICAL |

### B. STRUCTURAL GAPS — How the data is stored

| # | Blindspot | Fix |
|---|-----------|-----|
| S1 | Data lives in markdown, not a database | Migrate to entities (Base44) so it's queryable, filterable, API-exposed |
| S2 | No relationships between statutes and jobs | Entity relationships: Statute ↔ Job, Statute ↔ State, Statute ↔ CaseLaw |
| S3 | No versioning / audit trail | Track verification date, source URL, verifier, last-checked date |
| S4 | No import/export for AI tools | JSON API + MCP server for Claude/ChatGPT integration |
| S5 | No real-time update pipeline | Scheduled workflow to re-verify statutes quarterly |

---

## PART 3 — ROBUST DATA ADDITION PLAN

### Phase 1: Core Data Expansion (8 new columns / datasets)

#### Dataset A — Full Statute Text (all 51 jurisdictions × 8 jobs)
- Extract verbatim text for every verified statute (not summaries)
- Store as `statute_text` field, max ~2000 chars per section
- Include subsection markers (a), (b), (c) for precision
- Source: official legislature pages (already have URLs)

#### Dataset B — Case Law Companion (priority: cannabis-odor states)
For the 41 states where cannabis-odor protection is CASE LAW, document:
- Case name, citation, year, court
- Holding (1-2 sentences)
- Key quote (verbatim, ≤500 chars)
- Whether it's binding statewide or intermediate appellate
- States to prioritize: CO (People v. Zuniga), WA (State v. Grande), MI (2025 SCt), PA, VT (State v. Berard), MO, IL (People v. Molina), MA (Commonwealth v. Criseno), FL DCA
- Federal overlay cases: Rodriguez v. U.S. (K-9 timing), Illinois v. Caballes (dog sniff), Whren v. U.S. (pretext), Arizona v. Johnson (passengers), Brendlin v. California (passenger seizure), Caballes (dog sniff not a search), Florida v. J.L. (anonymous tip)

#### Dataset C — Citizen Plain-Language Summary (all 51 × 8 jobs)
For each state, a 3-sentence plain-English summary:
- "Can police stop you for X?" → Yes/No/It depends
- "Can police search your car based on Y?" → Yes/No/With consent
- "What are your rights during a traffic stop in [STATE]?"
- Reading level: 8th grade
- Bilingual: English + Spanish (for top 10 Hispanic-population states)

#### Dataset D — Officer Requirements Checklist (all 51 × applicable jobs)
What the officer MUST do:
- Job 3: Must state reason for stop (5 states)
- Job 7: Must advise right to refuse consent (OR only)
- Job 8: Must intervene to stop excessive force (22 states)
- Must carry BWC (Job 5 — 23 states)
- Must document pretextual basis (RI only)
- Format: checklist per state

#### Dataset E — Defense Strategy Playbook (all verified statutes)
For each verified statute, document:
- Motion to suppress template reference
- Elements the defense must prove
- Burden of proof (on defendant or state)
- Standard (preponderance vs. clear and convincing)
- Key cases applying the statute
- Common government counterarguments + rebuttals

#### Dataset F — Recording & Refusal Rights (all 51)
- One-party vs. two-party consent for recording (38 one-party, 12 two-party)
- Right to record police in public (all states per federal 1st Circuit)
- Breathalyzer refusal consequences (implied consent, license suspension duration)
- Search refusal: does refusal create RAS? (varies by state)
- ID refusal: stop-and-identify statutes (Hiibel v. Nevada)

#### Dataset G — Complaint & Oversight Directory (all 51)
- Civilian review board existence + contact
- POST council complaint process + URL
- Internal affairs procedure
- State AG civil rights division
- ACLU state affiliate
- Statute of limitations for §1983 claims

#### Dataset H — Bill Tracker & Update Pipeline
- All pending bills referenced in research (ME HP1057, SC H.3829, IL SB0042, NY Cariol's Law, GA HB 107, MI SB 1093, TX SB 1224)
- Status, sponsor, last action, next checkpoint
- Scheduled workflow: quarterly re-scan of all 51 legislatures

### Phase 2: Relationship & Metadata Layer

#### Entity Schema (Base44 database)

```
State (51 records)
  - code, name, region, one_party_consent, civilian_review_board_url, post_council_url

Job (8 records)
  - id, name, description, federal_overlay_case

Statute (one per state × job where verified)
  - state_code, job_id, section, title, full_text, plain_summary,
    officer_requirement, defense_strategy, remedy, remedy_scope,
    effective_date, enacted_by, source_url, case_law_ids[],
    verification_date, verification_method, confidence_score,
    last_checked_date, amendment_history[]

CaseLaw
  - state_code, case_name, citation, year, court, holding, key_quote,
    binding_scope, related_statute_id, related_federal_case

Bill
  - state_code, bill_number, title, sponsor, status, last_action,
    next_checkpoint, summary, would_enact, url

ComplaintPath
  - state_code, agency, type, url, phone, process_summary
```

#### Relationships
- Statute ↔ State (many-to-one)
- Statute ↔ Job (many-to-many — RI covers Jobs 1, 3, 7)
- Statute ↔ CaseLaw (many-to-many)
- Statute ↔ Bill (track what could amend it)
- State ↔ ComplaintPath (one-to-many)

### Phase 3: Verification & Freshness

- Every statute: `verification_date`, `last_checked_date`, `confidence_score` (1-5)
- Scheduled workflow: quarterly re-verify all 408 statute entries (51 × 8)
- Change log: diff old vs. new text, flag for human review
- Source provenance: official legislature > Justia > FindLaw > secondary

---

## PART 4 — WEBSITE FEATURE SUGGESTIONS

### Feature 1 — Interactive State Map (homepage hero)
- Click any state → state profile page
- Color-coded by protection level (green = strong, yellow = partial, red = none)
- Toggle between 8 jobs to see the map recolor
- Mobile: collapsible list instead of map

### Feature 2 — State Profile Page (one per state, 51 pages)
- All 8 jobs for that state in one view
- Plain-language citizen summary at top
- Officer requirements checklist
- Defense strategy section (collapsed by default)
- Case law companion sidebar
- Complaint & oversight directory
- Downloadable PDF "Know Your Rights" card
- "Last verified: [date]" badge on every statute

### Feature 3 — Multi-State Comparison Tool
- Select 2-5 states
- Side-by-side table across all 8 jobs
- Highlight differences (stronger/weaker protections)
- Export comparison as PDF or CSV
- Use case: defense attorney comparing where to file a motion

### Feature 4 — Topic Deep-Dive Pages (8 pages, one per job)
- National overview of the job
- Map of which states have/don't have it
- Federal overlay case
- Top 5 strongest statutes
- Plain-language explainer
- Related case law
- Pending bills

### Feature 5 — AI-Powered Search ("Ask Amparo")
- Natural language query: "Can police in Texas search my car for marijuana smell?"
- Returns: state, statute, case law, plain summary, defense strategy
- Powered by Claude over the structured dataset (see Part 6)
- Cites sources for every answer
- "I don't know" when data is null (no hallucination)

### Feature 6 — Know Your Rights Card Generator
- User selects their state
- Generates a mobile-optimized, printable card:
  - Top 5 rights during a traffic stop in [STATE]
  - What to say / what not to say
  - Recording rights
  - Complaint filing info
- Downloadable as PDF or save to phone
- Shareable link

### Feature 7 — Defense Attorney Toolkit (gated/pro feature)
- Motion to suppress template library (per job, per state)
- Case law citation generator (Bluebook format)
- Elements checklist for each statute
- Burden of proof reference
- Expert witness directory (optional)

### Feature 8 — Officer Reference Mode
- Toggle: "I'm an officer" vs "I'm a citizen"
- Officer view: what you MUST do in each state
- Citizen view: what you can expect / demand
- Same data, different framing

### Feature 9 — Update Tracker & Alerts
- "What changed this quarter" digest
- Email alerts when a statute in your saved states changes
- Bill tracker with status updates
- RSS feed for legal researchers

### Feature 10 — Citation & Export Center
- Export any statute, case, or comparison in:
  - Bluebook legal citation
  - APA
  - Plain link
  - PDF
  - JSON (for AI tools)

### Feature 11 — Data API & MCP Server (for Claude / AI co-pilots)
- REST API: GET /api/statutes?state=TX&job=1
- MCP server endpoint so Claude can query the dataset directly
- Structured JSON responses with full statute text + metadata
- Rate-limited, API-key gated
- This is the feature that makes the data "AI-ready"

### Feature 12 — Methodology & Provenance Page
- How data is collected, verified, updated
- Confidence scoring explained
- Source hierarchy
- Limitations (case law vs statute, agency policy)
- This builds trust = golden standard

---

## PART 5 — COMPONENT SUGGESTIONS

### Core UI Components (build in `src/components/`)

| Component | Path | Purpose |
|-----------|------|---------|
| `StateMap.jsx` | `src/components/StateMap.jsx` | Interactive US map, color-coded by job protection level. Uses react-leaflet or SVG. Click → state page. |
| `StateProfileCard.jsx` | `src/components/StateProfileCard.jsx` | Summary card for a state showing all 8 job statuses with badges. |
| `ProtectionLevelBadge.jsx` | `src/components/ProtectionLevelBadge.jsx` | Green/yellow/red badge: "Strong", "Partial", "None", "Case Law". |
| `StatuteViewer.jsx` | `src/components/StatuteViewer.jsx` | Full statute text with subsection highlighting, source link, verify date. |
| `ComparisonTable.jsx` | `src/components/ComparisonTable.jsx` | Side-by-side multi-state comparison across all 8 jobs. |
| `JobFilter.jsx` | `src/components/JobFilter.jsx` | Filter chips for the 8 jobs; updates map + list. |
| `StateSearchBar.jsx` | `src/components/StateSearchBar.jsx` | Autocomplete search by state name or statute section. |
| `PlainLanguageSummary.jsx` | `src/components/PlainLanguageSummary.jsx` | 8th-grade reading-level summary with expandable legal detail. |
| `OfficerChecklist.jsx` | `src/components/OfficerChecklist.jsx` | What officers must do, checkbox format. |
| `DefenseStrategyPanel.jsx` | `src/components/DefenseStrategyPanel.jsx` | Collapsible: motion template, elements, burden, cases. |
| `CaseLawSidebar.jsx` | `src/components/CaseLawSidebar.jsx` | Related cases with holdings + key quotes. |
| `RightsCardGenerator.jsx` | `src/components/RightsCardGenerator.jsx` | Form → PDF generation of per-state rights card. |
| `CitationExporter.jsx` | `src/components/CitationExporter.jsx` | Export button: Bluebook, APA, PDF, JSON, link. |
| `UpdateTracker.jsx` | `src/components/UpdateTracker.jsx` | Recent changes feed with diffs. |
| `BillTrackerCard.jsx` | `src/components/BillTrackerCard.jsx` | Pending legislation status card. |
| `ComplaintDirectory.jsx` | `src/components/ComplaintDirectory.jsx` | Where to file complaints, by state. |
| `ConfidenceBadge.jsx` | `src/components/ConfidenceBadge.jsx` | Shows verification date + confidence score. |
| `AskAmparo.jsx` | `src/components/AskAmparo.jsx` | AI search chat interface (Claude-powered). |
| `ProvenanceFooter.jsx` | `src/components/ProvenanceFooter.jsx` | Source, verify date, methodology link on every statute. |
| `ViewModeToggle.jsx` | `src/components/ViewModeToggle.jsx` | Citizen vs Officer vs Attorney view toggle. |

### Page Structure (build in `src/pages/`)

| Page | Path | Route | Purpose |
|------|------|-------|---------|
| `Home.jsx` | `src/pages/Home.jsx` | `/` | Hero + interactive map + 8 job deep-dive links |
| `StateProfile.jsx` | `src/pages/StateProfile.jsx` | `/state/:code` | Full profile for one state |
| `JobDeepDive.jsx` | `src/pages/JobDeepDive.jsx` | `/job/:jobId` | National view of one job |
| `Compare.jsx` | `src/pages/Compare.jsx` | `/compare` | Multi-state comparison tool |
| `AskAmparo.jsx` | `src/pages/AskAmparo.jsx` | `/ask` | AI-powered search |
| `RightsCard.jsx` | `src/pages/RightsCard.jsx` | `/rights-card` | Generate + download rights card |
| `DefenseToolkit.jsx` | `src/pages/DefenseToolkit.jsx` | `/defense` | Pro tools (gated) |
| `Methodology.jsx` | `src/pages/Methodology.jsx` | `/methodology` | How data is verified |
| `ApiDocs.jsx` | `src/pages/ApiDocs.jsx` | `/api-docs` | API + MCP server documentation |

### Data Layer (Base44 entities)

| Entity | Path | Records |
|--------|------|---------|
| `State` | `base44/entities/State.jsonc` | 51 |
| `Job` | `base44/entities/Job.jsonc` | 8 |
| `Statute` | `base44/entities/Statute.jsonc` | ~408 (51×8, minus nulls) |
| `CaseLaw` | `base44/entities/CaseLaw.jsonc` | ~150 (estimated) |
| `Bill` | `base44/entities/Bill.jsonc` | ~30 (pending) |
| `ComplaintPath` | `base44/entities/ComplaintPath.jsonc` | ~150 (51×~3) |

### Backend Functions (for AI + data ops)

| Function | Path | Purpose |
|----------|------|---------|
| `QueryStatutes` | `base44/functions/QueryStatutes/entry.ts` | API: filter statutes by state/job/keyword |
| `AiSearchAnswer` | `base44/functions/AiSearchAnswer/entry.ts` | Claude-powered natural language search over dataset |
| `GenerateRightsCard` | `base44/functions/GenerateRightsCard/entry.ts` | Build PDF rights card for a state |
| `ExportCitation` | `base44/functions/ExportCitation/entry.ts` | Bluebook/APA/JSON export |
| `ReverifyStatutes` | `base44/functions/ReverifyStatutes/entry.ts` | Scheduled: re-check statute pages for changes |

### Workflows (automated)

| Workflow | Path | Trigger | Action |
|---------|------|---------|--------|
| `QuarterlyReverify` | `base44/workflows/QuarterlyReverify.jsonc` | scheduled (quarterly) | Re-verify all statutes, flag changes |
| `BillStatusUpdate` | `base44/workflows/BillStatusUpdate.jsonc` | scheduled (weekly) | Check pending bill statuses |
| `ChangeAlertEmail` | `base44/workflows/ChangeAlertEmail.jsonc` | entity (Statute updated) | Email users who saved that state |

---

## PART 6 — CLAUDE CO-PILOT INTEGRATION (AI-Ready Prompt System)

### Goal
Make the dataset queryable by Claude (and any AI co-pilot) so it can answer user questions with zero hallucination, full citation, and state-specific accuracy.

### Architecture
```
User Question → AskAmparo UI → AiSearchAnswer backend function
  → QueryStatutes (fetch relevant statutes + case law from DB)
  → Claude (InvokeLLM) with structured context + system prompt
  → Answer with citations → UI renders with source links
```

### System Prompt for Claude (the "golden standard" prompt)

```
You are Amparo, the authoritative AI assistant for state-level police-practices
and traffic-stop law in the United States. You answer ONLY from the provided
dataset. You NEVER speculate, project, or generalize.

RULES:
1. If the dataset contains a verified statute for the user's state and topic,
   cite it verbatim with the section number and source URL.
2. If the dataset marks a state as "null" for a topic, say: "No enacted statute
   found in [STATE] for [topic]. Protection may exist via case law — see case
   law companion." Do NOT invent a statute.
3. If the dataset includes case law for a null state, cite the case (name, year,
   holding) and note it is case law, not statute.
4. Always provide: (a) the plain-language summary, (b) the officer requirement,
   (c) the citizen right, (d) the defense strategy if applicable, (e) the
   source URL, (f) the verification date.
5. If the user asks about a topic not in the 8-job dataset, say: "This is
   outside the Amparo dataset. I can only answer about: [list 8 jobs]."
6. Never give legal advice. End every answer with: "This is legal information,
   not legal advice. Consult a licensed attorney in [STATE]."
7. If multiple states are relevant, answer for each separately.
8. Flag any statute older than 12 months since verification with: "Note: This
   statute was last verified [date]. Confirm currency before relying on it."

DATASET CONTEXT (injected per query):
- State: [user's state]
- Job/Topic: [identified topic]
- Statutes: [full text from DB]
- Case Law: [related cases from DB]
- Federal Overlay: [relevant SCOTUS cases]
- Plain Summary: [from DB]
- Officer Requirement: [from DB]
- Defense Strategy: [from DB]

OUTPUT FORMAT:
1. Direct answer (1-2 sentences, plain language)
2. The statute / case (verbatim quote with citation)
3. What this means for you (citizen)
4. What officers must do
5. If defending: how to use this
6. Sources (URLs + verify dates)
7. Disclaimer
```

### MCP Server (for external Claude / ChatGPT integration)
- Expose the dataset as an MCP server (see `get_capability_guide("app_mcp")`)
- Tools: `search_statutes`, `get_state_profile`, `compare_states`, `get_case_law`
- Enables Claude Desktop, ChatGPT, or any MCP client to query Amparo directly
- This makes the dataset the industry-standard reference for AI legal assistants

### Blindspot Mitigation in the Prompt
The prompt explicitly handles every blindspot from Part 2:
- #1 (no statute text) → dataset now has full text, prompt quotes verbatim
- #2 (no case law) → dataset now has case law, prompt cites it for null states
- #3 (no federal overlay) → prompt includes SCOTUS cases
- #8 (no plain language) → dataset has plain summary, prompt leads with it
- #9 (no officer requirements) → dataset has checklist, prompt includes it
- #10 (no defense strategy) → dataset has playbook, prompt includes it
- #22 (no provenance) → prompt always cites source + verify date
- #27 (no AI-ready data) → MCP server + structured API solves this

---

## PART 7 — IMPLEMENTATION ROADMAP

### Phase 1 (Weeks 1-2): Data Foundation
1. Create 6 entities (State, Job, Statute, CaseLaw, Bill, ComplaintPath)
2. Import existing 8-job research into Statute entity (from markdown)
3. Build QueryStatutes backend function + API
4. Build Home page with StateMap component

### Phase 2 (Weeks 3-4): Core User Experience
5. Build StateProfile page + all 20 components
6. Build JobDeepDive pages (8)
7. Build Compare tool
8. Add plain-language summaries (Dataset C) — top 20 states first

### Phase 3 (Weeks 5-6): AI Integration
9. Build AiSearchAnswer function with Claude system prompt
10. Build AskAmparo chat UI
11. Set up MCP server for external AI access
12. Test with 100 sample queries, tune prompt

### Phase 4 (Weeks 7-8): Advanced Features
13. Build Rights Card Generator (PDF)
14. Build Defense Toolkit (gated)
15. Add case law companion data (Dataset B)
16. Add recording/refusal rights (Dataset F)

### Phase 5 (Weeks 9-10): Automation & Trust
17. Build QuarterlyReverify workflow
18. Build BillStatusUpdate workflow
19. Build Methodology + Provenance pages
20. Add confidence scoring + verify dates to all entries

### Phase 6 (Ongoing): Data Enrichment
21. Add complaint directory (Dataset G)
22. Add defense strategy playbooks (Dataset E)
23. Spanish translations (top 10 states)
24. Quarterly re-verification cycle

---

## PART 8 — SUCCESS METRICS (Golden Standard Criteria)

| Metric | Target |
|--------|--------|
| State coverage | 51/51 (100%) |
| Job coverage | 8/8 (100%) |
| Statute text verbatim | 100% of verified statutes |
| Case law companion | 100% of null states with case law |
| Plain-language summaries | 100% of statutes |
| Verification freshness | <90 days for all entries |
| AI answer accuracy | 0% hallucination rate (cite or say null) |
| Source citation | 100% of answers include URL + verify date |
| API availability | 99.9% uptime |
| MCP integration | Live for Claude + ChatGPT |

---

## SUMMARY

The current research is a strong **statute-only** foundation. To become the **golden standard**, Amparo needs:

1. **Full statute text** (not summaries) — so AI can quote verbatim
2. **Case law companion** — so the 41 null states aren't actually "no protection"
3. **Plain language + officer + defense layers** — so all 3 audiences are served
4. **Structured database** (not markdown) — so it's queryable + API-ready
5. **Interactive website** (map, profiles, compare, search) — so users can self-serve
6. **AI search with anti-hallucination prompt** — so Claude answers with citations only
7. **MCP server** — so any AI co-pilot can query the dataset
8. **Automation** (quarterly re-verify, bill tracking) — so data stays current
9. **Provenance + methodology** — so it's trusted as the authoritative source

This plan transforms Amparo from a research document into the **definitive, AI-native, user-facing legal utility** for state police-practices law — the golden standard for the niche.