# LEDGER.md · wargame runs

## 32 — Facebook as Amparo's primary traffic engine

- **Date:** 2026-08-19
- **Mission brief:** `tasks/32-facebook-traffic-engine.md`
- **Draft:** `wargames/32-facebook-traffic-engine.md`
- **War-gamer:** Opus 5 · **Intended executor:** Sonnet + Michael (HUMAN ONLY moves)
- **Recon inputs:** root `index.html`, `arena/index.html`, `app-src/convex/stripe.ts`,
  `CHANGELOG.md` v2.26.1, `wargames/31-paywall-meets-ladder.md`, Meta SIEP policy,
  Notion "Facebook Automation Guide", `/watch-bulk` digest of 2 videos.

### Self-grade

All 8 `SUCCESS.md` points pass; #8 with a stated caveat (the HUMAN ONLY block is
deliberately not model-executable — the executor stops and flags). Full table in the
draft's §8.

### Patches from the red-team pass

| Attack | Outcome | Patch |
|---|---|---|
| "Skip the organic lab, just run ads" | Failed | None needed — the arithmetic of Facts 1+2 defeats it |
| "Move 3's framing is a dodge that fails review anyway" | **Landed** | Meta identity verification (H3) moved forward from contingency to unconditional prerequisite; Move 3's fork rewritten to forbid softening copy further; Move 8 relabelled from "confirm the framing works" to "submit to find out" |
| "`{{CPL_CEILING}}` is invented" | **Partly landed** | Ceiling marked as placeholder-with-rationale, not a measured number; Move 10 explicitly forbids raising it to justify spend |

### Open placeholders

| Placeholder | Default in use | Owner | Blocks |
|---|---|---|---|
| `{{DAILY_BUDGET}}` | $20/day | Michael (H7) | Move 9 |
| `{{CPL_CEILING}}` | $3.00/email — **unmeasured, see R9** | Michael | Move 10 |
| Page name (topic, not "Amparo") | — | Michael + Move 5 branding prompt | Move 5 |
| Disclaimer entity (Route B only) | — | Michael (H4) | Move 9 |
| Sending domain / from-address | — | Michael (H8) | Move 4 |

### Known ceilings recorded during recon

- Root `index.html` is 669 KB as a single page. Not refactored for this campaign; logged as a
  landing-performance risk with Move 2's Route B as the escape hatch.
- `PAYMENTS_LIVE=false` and no Script/Deep Pack artifact exists — the campaign's revenue
  objective is blocked on fulfilment, not on marketing.
- No owned social accounts exist (`grep` finds only `facebook.com/sharer`, `x.com/intent`).
  Starting from zero followers is confirmed.
- R6 (does Meta classify Amparo as SIEP?) is unsettleable from outside Meta. Move 8 is the
  check. No other move assumes an answer.

### Execution status — 2026-08-20

| Move | State | Note |
|---|---|---|
| A1 attribution | **done** | first-touch `ft_*` super-properties; two send-time bugs found and fixed in verification |
| A2 publishing surface | **done** | 1 url -> 111 pages, 51 jurisdictions, 63 indexable |
| A3 publisher posture | **done** | /about/ + /how-we-verify/ EN+ES; states the attorney gap outright |
| A4 RSS | **done** | 29 items, English only, discovery link on every page |
| B1 outreach discovery | built, dormant | needs `FIRECRAWL_API_KEY`; exits 0 without it |
| B2 republisher crawl | built, dormant | same key; also needs a landed placement to crawl for |
| B3 citation mining | **live** | weekly, no key required, 26 claims on first run |
| C1 two pieces + pitches | **HUMAN ONLY** | trade press blacklists detected-AI submissions, permanently |
| C2 email capture | **BLOCKED** | no `RESEND_API_KEY` and no sending domain (H8). Offer is "email me my link" — recon settled that no PDF generator exists |
| C3 Facebook page | **done by operator** | page live, secrets stored, posting proven via unpublished draft |
| C4 aggregator submissions | **HUMAN ONLY** | ~1 hour, once; Feedly needs none — it ingests A4's feed |
| D1-D6 paid | deferred | unchanged; runs only if the operator chooses to spend |

**Open blocker:** the stored Facebook token is `type USER` expiring 2026-08-20
04:00 UTC. All scopes correct, posting verified working. The browser "Extend
Access Token" step never applied across four attempts — the Access Token Tool
renders the extended token BELOW the button while the original stays above it.
Resolved by moving the `fb_exchange_token` exchange into
`tools/fb-setup-secrets.mjs`, driven by `SETUP-FACEBOOK.cmd`, which collects
the App Secret without displaying it.

**Recon closed this round:** R1, R2, R4 (no PDF generator — `window.print()`
only), R5 (`STATES` is a clean literal), R6 (only TX/GA/NY are VERIFIED),
R7 (no search API key configured), R8 (Education website category).

### Revision 3 — execution status, end of 2026-08-20

Revision 2 was graded before anything ran. This is the state after execution.
Full narrative in `wargames/32-facebook-traffic-engine.md` §13.

| Move | State | Evidence |
|---|---|---|
| A1 attribution | **live** | first-touch `ft_*` super-properties; two send-time bugs found in verification and fixed |
| A2 publishing surface | **live** | 111 pages, 51 jurisdictions, 63 in sitemap, 48 noindexed as too thin |
| A3 publisher posture | **live** | `/about/` + `/how-we-verify/` EN+ES; states the attorney gap outright |
| A4 RSS | **live** | 29 items, English only, discovery link on every page |
| B1 outreach discovery | built, **no yield yet** | keyless via Marginalia; last run throttled, first real yield expected on the Monday cron |
| B2 republisher crawl | built, **idle** | keyless via GDELT; nothing to crawl for until a placement lands |
| B3 citation mining | **live** | weekly, no key, 26 claims on first run |
| C1 two pieces + pitches | **not started** | HUMAN ONLY — trade press blacklists detected-AI submissions |
| C2 email capture | **blocked** | no sending domain (H8), no `RESEND_API_KEY` |
| C3 Facebook page + posting | **live** | page created, token stored, posting verified, generator replaced — see below |
| C4 aggregator submissions | **not started** | HUMAN ONLY, ~1 hour once; Feedly needs none, it ingests A4 |
| D1–D6 paid | **never entered** | no ad account, no spend; **Move D2's SIEP test was never run**, so Fact 6 stays a live unknown |

### Patches this round

| What | Why |
|---|---|
| Move C3's generator replaced | The statute-quote format was factually perfect and would have got no reach. The honesty constraint had been allowed to determine the creative. Replaced with scenario-led posts timed by news, on the rule that the news picks WHICH scenario and never supplies WHAT is said. |
| Track B search provider | Firecrawl (key) → Marginalia + GDELT (keyless). Seven providers measured against a CI runner; five were blocked outright. |
| Two new abort conditions | Never react to an individual case; never advertise a held drill (`HELD_SITS={door:1}`). |
| Six unplanned tools | Token handling consumed most of the execution time and burned several credentials. See §13c. |
| `verify` mode on the daily workflow | So a new token's first act is an unpublished draft, not a surprise public post. Caught wrong-token storage three times. |

### Open items, ranked by what they block

1. **H5 attorney sign-off — unchanged and now larger.** In revision 1 it blocked ad spend. It now
   sits behind 63 indexable pages and a daily post, all pointing at TX/GA/NY content that has not
   met `state-law-matrix.md`'s own standard. `/how-we-verify/` states the gap honestly; stating it
   is not closing it.
2. **H8 sending domain** — one DNS setup unblocks C2 entirely.
3. **`/arena/` deep links** — no `URLSearchParams` in the file, so every drill CTA lands on the
   menu rather than the drill. Highest-value conversion fix outstanding.
4. **C1 / C4** — the one-time human sprint. Everything upstream of it is now built.
