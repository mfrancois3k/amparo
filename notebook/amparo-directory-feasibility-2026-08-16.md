# Pro bono directory feasibility — 2026-08-16

## Why this exists

A real stranger (Rob Hannes, via Facebook Messenger) asked the operator to help find a
pro bono lawyer in southern Hudson Valley, NY, through the Amparo site. The operator
asked for a cron job that builds a per-state, per-county directory of pro bono lawyers.

## What was researched, and why the literal ask isn't what shipped

Checked whether LSC.gov or LawHelp.org expose a public, structured (CSV/JSON/API)
dataset of legal-aid organizations with contact info and county service areas —
something a cron job could safely re-fetch.

- **LSC.gov**: the only downloadable structured dataset found (Basic Field Allocation
  Results, `lsc.gov/grants/basic-field-grant/basic-field-allocation-results`) is
  *funding allocation data* — grantee name, dollar amounts, poverty population — not
  contact info or addresses. Their actual locator (`lsc.gov/what-legal-aid/find-legal-aid`)
  is an interactive map/search widget with no documented public API.
- **LawHelp.org**: no public API or bulk dataset found. It's a live, actively maintained
  directory run by Pro Bono Net (a nonprofit), not a static export.

Building a cron job here would mean either scraping an interactive map widget (fragile,
ToS-uncertain) or standing up Amparo's own maintained copy of lawyer/org contact data
(the exact "referral service" liability pattern flagged earlier this session — stale or
wrong contact info is a real safety problem for this audience, and curating/verifying
individual providers risks lawyer-referral-service regulation in most states).

## What shipped instead

No cron job. No new data pipeline. No new liability surface. Instead:

- Verified (WebFetch/WebSearch, live) that TexasLawHelp.org, LawHelpNY.org, and
  GeorgiaLegalAid.org each already run their own maintained, county-searchable
  directory pages: `texaslawhelp.org/directory` (county filter dropdown), 
  `lawhelpny.org/find-legal-help` (county/ZIP search), `georgialegalaid.org/find-legal-help`
  (county-based intake routing). Amparo's existing TX/GA/NY lifelines pointed at their
  *homepages* instead — upgraded to the actual directory subpages.
- Added one new entry to `BASE_LIFELINES` (the fallback all 48 non-researched states
  use): `lawhelp.org/find-help`, LawHelp.org's own national state-by-state finder,
  also run by Pro Bono Net. Previously the 48 states with no researched lifelines had
  no LawHelp entry at all — only ACLU, 211, MigraWatch, 988.
- Updated the printed pack's QR codes (`QR_URL`) for TX/GA/NY to the same deep-linked
  directory pages, so scanning the physical card lands on the county search tool
  directly instead of a homepage.

This achieves the actual goal — someone like Rob Hannes finds county-specific pro bono
help — by linking to institutions that already build and maintain exactly that, on
their own infrastructure, for free, forever. Zero scraping, zero cron, zero new content
Amparo has to keep accurate.

## What was deliberately not built

A "county" input field on Amparo's own forms. Every linked tool above (LawHelp state
sites, 211) already asks for county/ZIP itself, on their own site, once a visitor
clicks through — adding a duplicate county field to Amparo's own UI with nothing real
behind it would be exactly the "convincing stub" pattern this codebase's own Welcome.tsx
comment already warns against. Revisit only if a future feature needs Amparo itself to
know the user's county for something Amparo does directly.
