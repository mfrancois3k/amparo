# Move 1 — Measurement access report (CORRECTED)

**Date:** 2026-08-20
**Status:** Live-site measurement blocked; local measurement succeeded and produced real data.

> **This document was rewritten.** Its first version claimed the local Lighthouse failures proved
> a WAF was blocking Google's crawlers. That reasoning was wrong — the local failures had a
> different cause (Cloudflare WARP on this machine). A separate, independently-verified block does
> exist. Both are recorded below with the evidence for each, per repo hard rule 5.

## Two distinct problems, both real, different causes

### Problem 1 — Local machine cannot reach any Vercel-hosted host (Cloudflare WARP)

**Evidence (control test):**

| Host | Result |
|---|---|
| `example.com` | 200 |
| `google.com` | 200 |
| `vercel.com` | TLS handshake failure @0.06s |
| `nextjs.org` | TLS handshake failure |
| `sdk.vercel.ai` | TLS handshake failure |
| `www.amparohq.com` | TLS handshake failure @0.07s |

DNS resolver is `connectivity-check.warp-svc` (127.0.2.2); `warp-cli status` → `Connected`
(v2026.6.905.0). DNS resolves correctly (`cname.vercel-dns.com` → 66.33.60.35, 76.76.21.123);
the failure is at TLS, in 0.07s — far too fast for a server-side challenge.

**Conclusion:** Cloudflare WARP on this workstation breaks connections to Vercel's IP range.
Vercel's own marketing site fails identically, so this is **not** anything about Amparo.
This is what caused the four "Chrome prevented page load with an interstitial" Lighthouse errors.

**Impact:** local tooling cannot measure the *live* site from this machine. Nothing more.
**Fix:** exclude Vercel ranges in WARP, or toggle WARP off when measuring. Operator's call —
this is a system network setting, not changed autonomously.

### Problem 2 — The live site returns 403 to automated traffic

**Evidence:** fetched from Anthropic's infrastructure (a different network entirely, no WARP):

- `https://www.amparohq.com/` → **HTTP 403 Forbidden**
- `https://www.amparohq.com/robots.txt` → **HTTP 403 Forbidden**

`robots.txt` returning 403 shows the block is blanket, not path-scoped. Real users are clearly
unaffected (72 landed/30 days), so this targets automated/datacenter traffic specifically.

**Where it is NOT configured:** not in `vercel.json`, not in `package.json` — a repo-wide grep for
`firewall|botid|bot_protection|challenge|attack.?mode` returns nothing. DNS points straight at
Vercel (`cname.vercel-dns.com`), no Cloudflare proxy in front. So the rule lives in the **Vercel
dashboard** (Firewall / Bot Protection / Attack Challenge Mode).

**Could not read the setting:** Vercel MCP `list_teams` returns `[]` and `list_projects` fails; no
Vercel CLI auth file, no `VERCEL_*` token in env. **This needs Michael's dashboard.**

**Why it matters beyond this mission** — the repo's own `robots.txt` says, verbatim:

> the only crawlable know-your-rights material in this category ... Crawling it is the point.

A blanket 403 to automated traffic contradicts that stated intent.

**What is proven vs. not:**
- **Proven:** generic datacenter/automated fetches get 403.
- **Not proven:** whether *verified Googlebot* is allowlisted. Vercel's bot filtering normally
  permits verified search engines, so indexing may well be unaffected. Do not assume it is broken.
- **Likely:** PSI/Lighthouse — which runs from Google Cloud but is *not* verified Googlebot — is
  blocked. This fits the observed symptom: the PSI web UI accepted the job, then hung indefinitely
  with no polling requests, never returning a result.

## What was done instead

The wargame's own Move 6 counter-move authorizes the fallback used: *"fall back to local Lighthouse
CLI against a local static server serving the branch."* Amparo's root is a static file tree, so both
`main` (baseline) and `cwv-fix-pass` (fixed) were served locally and measured. **This produced real,
usable data** — see `amparo-cwv-findings-2026-08-20.md`.

Move 1 is therefore **not** a hard stop. It is a measurement taken by a documented fallback path,
with the specific metrics that path distorts called out explicitly in the findings doc.

## Hand-off to Michael

1. **Vercel dashboard → Firewall / Bot Protection** — find the rule returning 403 and decide
   whether it should exempt search engines and PSI. Weigh against `robots.txt`'s stated intent.
2. **WARP** — exclude Vercel IP ranges, or toggle off when running local perf tooling.
3. Once either is resolved, re-run Move 1 against the live URL to get production-accurate
   network-dependent numbers (LCP/FCP), and confirm the compression finding is the artifact the
   findings doc says it is.
