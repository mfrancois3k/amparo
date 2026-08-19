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
