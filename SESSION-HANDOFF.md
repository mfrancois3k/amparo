# Session handoff — Amparo traffic engine build (2026-08-19 → 2026-08-20)

Paste this into a new chat to continue. Repo: `C:\Users\mfran\Ai-Foundations\Amparo`
(github.com/mfrancois3k/amparo, public). Everything below is committed and pushed.
The plan of record is `wargames/32-facebook-traffic-engine.md` (revision 4) +
`LEDGER.md`. Read those two files first — they carry the full reasoning.

## What Amparo is

Free bilingual (EN/ES) traffic-stop rights tool at amparohq.com. Prints a glovebox
pack: window card, documents, state rules quoted from statutes, what to say.
Practice arena at /arena/ with drills (traffic stop, step-out, passenger,
admission trap, last 30 seconds, checkpoint; "door" drills HELD for attorney +
DV-clinician review — never promote them). 3 states verified: TX, GA, NY.
`research/state-law-matrix.md` forbids publishing unverified state law.

## What got built this session (all live in production)

**Site went from 1 URL to 111 pages.**
- `tools/build-pages.mjs` — generates /rights/ + /derechos/ pages for all 51
  jurisdictions from the STATES data in index.html. 63 indexable, 48 noindexed
  as too thin (data-driven: verified rules or state legal-aid directory = indexable).
  /about/ + /how-we-verify/ EN+ES. Sitemap auto-generated. `--check` for CI.
- `feed.xml` — RSS, 29 items, discovery link on every page.
- 62 per-page OG share images (`tools/render-og.mjs`), verified vs unverified
  states visually distinct.
- First-touch attribution in index.html (PostHog `ft_*` super-properties —
  utm_* are RESERVED names in PostHog and get clobbered at send time; that bug
  was found and fixed).

**Facebook engine (live, posting daily).**
- Page: "What To Say to Police" (id 1331025183416568, category Education website).
- `tools/news-post.mjs` — daily post generator. THE RULE: news chooses WHICH
  scenario to post, never WHAT the post says. Google News RSS + optional Google
  Alerts feeds (research/alert-feeds.json) counted as timing signals;
  allowlist-then-blocklist filters (Spanish blocklist as thorough as English);
  no individual cases ever (no named arrests/lawsuits). Legal text verbatim from
  STATES/BASE_RULES_*. CTA deep-links to /arena/?sit=<drill>.
  FIRST POST PUBLISHED 2026-08-20 (es/ck, 136 checkpoint signals).
- Workflow `.github/workflows/daily-post.yml` fires 15:32 UTC daily; has a
  `verify` dispatch mode (unpublished draft, catches bad tokens).
- Secrets FB_PAGE_ID + FB_PAGE_TOKEN stored (page token, never expires —
  took 6 failed attempts; tools/fb-token.mjs now auto-resolves user→page tokens).
- `tools/render-card.mjs` — 1080x1350 post cards from SVG via headless Chrome
  (never a generative model — text fidelity on statute quotes).

**Growth discovery (weekly cron, Mondays 08:41 UTC).**
- `tools/citation-gaps.mjs` — mines Wikipedia {{Citation needed}} as topic queue.
  READS ONLY, never edits (COI policy; a block poisons the domain as a citable source).
- `tools/discover-targets.mjs` — outreach targets via Marginalia (keyless,
  throttles ~50 queries; 10-per-run cursor) + GDELT for republisher crawl (B2).
- `tools/answer-bank.mjs` — 10 paste-ready EN/ES community replies, legal text
  verbatim, tests assert absences (recording/phone-search NOT covered = not verified).
- `tools/question-monitor.mjs` — Reddit RSS → human queue. NEVER auto-replies.
  Finding: r/legaladvice is post-incident traffic, wrong moment for Amparo;
  the `unanswerable` list is the real value (product research).

**Monetization (built, OFF).**
- Script Pack artifact: printable checklist + flashcards generated from SCEN
  data (the drill they finished) — arena renderScriptPack(). Nothing authored.
- Guest fulfilment: success_url carries {CHECKOUT_SESSION_ID}; Convex
  verifySession asks Stripe if paid; /redeem endpoint; entitlement in
  localStorage. Redirect never trusted. `tools/test-fulfilment.mjs` (16 checks)
  asserts PAYMENTS_LIVE stays false while REVIEW.attorneys is empty.
  FTC v. DoNotPay (Jan 2025, $193k): selling legal output with no attorney
  retained to test accuracy. That is the gate.
- Convex migrated dev→prod this session: functions + schema now on
  stoic-falcon-22 (was dev grandiose-armadillo-240 carrying live traffic).
  Arena CHECKOUT_URL + built /app bundle + CSP all repointed (CSP lists both
  origins transitionally). `app-src/.env.production` exists because
  `convex dev` rewrites .env.local back to dev. Stripe keys NOT copied to prod
  (webhook secret is per-endpoint; prod needs its own webhook).

## Strategy (wargame rev 4 — research-driven, supersedes earlier revisions)

Three reversals, all evidence-cited in §14 of the wargame:
1. **Card-first, not page-first.** ILRC: 10M Red Cards since Nov 2024. UWD's
   Notifica app: ~8,500 installs despite massive PR, discontinued. Design for
   the WhatsApp forward, not the download. 54% of US Latino adults use WhatsApp.
2. **Spanish-first search.** Live SERP: English "know your rights traffic stop
   texas" = 7 law firms, unwinnable. Spanish = PDFs + a Peruvian news site
   ranking for a Texas query. Vacuum.
3. **Local affiliates, not national orgs.** ILRC states it does not vet outside
   content. CLINIC has 290 field offices. Labor Rights Week (last week of Aug —
   NOW) convenes consulates + community orgs via DOL Consular Partnership Program.

Track E (new): WhatsApp-shaped card, ILRC-format 3.5x2in print PDF, WhatsApp Channel.
Track F: 10 accounts only the operator can open (GSC, Bing WMT, WhatsApp Channel,
beehiiv, sending-domain DNS, Ahrefs WMT, Google Alerts, F5Bot, Cloudflare Pages
mirror, attorney per state). Excluded deliberately: Meta ads verification
(attaches home address to immigration-adjacent campaign), TikTok API (unaudited
clients post private-only).

## Revenue sequence (do not reorder)

artifact DONE → fulfilment DONE → **attorney signs an edition (BLOCKER)** →
PAYMENTS_LIVE=true → then scale traffic. Traffic before step 3 burns the
audience. REVIEW.attorneys in index.html is empty for TX/GA/NY.

## Open tasks, priority order

1. **HUMAN: attorney sign-off** for TX/GA/NY editions. Gates all revenue, gates
   legal-aid adoption (their lawyers check first), gates YMYL authority.
2. **HUMAN: Track F accounts** — esp. Google Search Console (only free EN/ES
   rank data; 16-month retention), beehiiv (2,500 subs free, unblocks C2 email
   capture), sending-domain DNS (H8), WhatsApp Channel.
3. **Track E build**: WhatsApp card renderer (adapt render-card.mjs), ILRC-format
   3.5x2in print PDF, per-state EN/ES.
4. **HUMAN: local outreach** — one CLINIC field office / promotora program in
   TX or GA, timed to Labor Rights Week (LAST WEEK OF AUGUST — time-sensitive).
   Answer bank at growth/answer-bank.md is the paste-ready material.
5. **C2 email capture** — blocked on H8 (sending domain). Offer is "email me my
   link" NOT a PDF (no PDF generator exists; print is window.print()).
6. Move C1/C4 (two evergreen pieces + pitches; aggregator submissions) — HUMAN.
7. Drop dev-deployment CSP entries after cache turnover; check dev Convex for
   saved packs before it resets; Cloudflare Pages mirror (Vercel Hobby is
   non-commercial-only — matters the day payments flip).
8. Optional: muapi MCP needs MUAPI_API_KEY env var (registered in .mcp.json);
   google-alerts MCP registered; wire real Alert feeds into
   research/alert-feeds.json (google.com/alerts → RSS).

## Infrastructure notes / traps discovered

- **Vercel Attack Challenge Mode is ON** — 403s curl/scripts but verified bots
  (Googlebot etc.) pass via IP+rDNS verification. Not an SEO problem. Don't "fix".
- **NotebookLM Amparo notebook (944d5ba5…) is FULL at 52 sources** — writes fail
  with a misleading INVALID_ARGUMENT. Growth notebook: 8d34f4af-aa7c-4a27-929c-480ddfc3fde1
  (holds wargame 32 rev4, LEDGER, answer bank). nlm CLI: `source add --file` is
  broken (use --text, ~24k char cap, split on headings); `source delete` takes
  source ids only; re-auth via CDP method in notebook/HANDOFF.md.
- **npm global PATH is broken**: prefix D:\npm-global but PATH has
  D:\npm-global\bin (doesn't exist) — no global CLI is callable by name; use
  full paths (e.g. node D:/npm-global/node_modules/muapi-cli/bin/muapi).
- **MCP servers don't run in GitHub Actions** — interactive only. Publish loop
  stays plain fetch in Actions; MCP for analyze/decide only.
- Bash-tool heredocs mangle backslashes (a \b became literal 0x08 in a regex
  once) — use the Write tool for anything with escapes.
- Marginalia throttles ~50 queries; Reddit RSS rate-limits hard (2 searches/run
  cursor); GDELT 1 req/5s.
- HELD_SITS={door:1} in arena — door drills unreachable by deep link too.
- Deep links live: /arena/?sit=trap|last30|step|pass|traffic|ck (validated,
  held drills refused).

## Standing rules (learned the hard way, do not relax)

1. Legal text is only ever lifted verbatim from STATES/BASE_RULES_*/SCEN —
   no model ever writes a legal sentence.
2. News chooses WHICH scenario; never WHAT the post says. No individual cases.
3. Never advertise a held drill. Never auto-reply in communities — automation
   finds, a person answers.
4. Credentials never in chat (5 FB tokens burned this session; SETUP-FACEBOOK.cmd
   and tools/fb-setup-secrets.mjs exist so values move machine-to-machine).
   App Secret was exposed once — WAS RESET? VERIFY with operator.
5. Honesty pattern: claim only what is checkable (edition + source-check date,
   never "attorney-reviewed" while REVIEW.attorneys is empty). v2.26.1 is the
   precedent.
