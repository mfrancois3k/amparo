# Move 1 Execution Report — Core Web Vitals Wargame 33
**Status:** BLOCKED (hard stop)  
**Date:** 2026-08-20  
**Executor:** Haiku (mechanical measurement task)

## What Happened

All four baseline measurement attempts failed with identical error: **"Chrome prevented page load with an interstitial."**

| Combo | URL | Device | Error | Data |
|-------|-----|--------|-------|------|
| root-mobile | https://www.amparohq.com/ | mobile | Interstitial block | None (scores: 0) |
| root-desktop | https://www.amparohq.com/ | desktop | Interstitial block | None (scores: 0) |
| app-mobile | https://www.amparohq.com/app/ | mobile | Interstitial block | None (scores: 0) |
| app-desktop | https://www.amparohq.com/app/ | desktop | Interstitial block | None (scores: 0) |

**Tool chain:**
1. PageSpeed Insights (keyless API): `quota_limit_value: 0` → no anonymous access
2. Lighthouse CLI (Chrome headless): Interstitial before page renders → can't measure
3. PSI web UI (browser): Still spinning after 150s, no results

## Root Cause (Not Performance)

Amparo is **unreachable by Google's measurement infrastructure**. This is a blocking, not a performance issue.

**Likely causes:**
- Cloudflare / DDoS protection rule blocking automated crawlers
- Vercel environment detection blocking Chrome headless (user-agent, IP pattern, or bot-detection rule)
- Geo-fencing or rate-limiting on the deployment
- A WAF rule targeting Google's IP ranges or user-agents

**Not a performance issue.** The measurement tools never reach the site to measure anything. This is architecture/deployment, not code.

## Scope Tag

**OUT OF SCOPE for wargame 33** (markup/asset/loading fixes). Fixing this requires:
- Vercel dashboard configuration review
- Cloudflare rules audit (if in front)
- WAF / bot-detection rule whitelisting
- Environment variable check (`ALLOWED_BOTS` or equivalent)

These are deployment/infrastructure decisions, not frontend optimizations.

## Wargame Counter-Move Taken

Per wargame 33's Move 1 abort condition: "All four pulls blocked/errored — escalate to Michael with root cause and stop."

**Escalation flag:** Amparo's unreachable by Google's own crawler. This affects:
- **Technical SEO:** Search Console will see crawl errors
- **Quality Score:** Google Ads may downrank due to crawl blocks
- **Organic traffic:** Reduced discoverability if Googlebot can't index
- **CWV signal:** CrUX data won't populate (no real-user measurements from Google's network)

This isn't a wargame 33 blocker *alone*, but it's a business-level issue: Amparo is live on Vercel but invisible to the search engines' own measurement tools.

## Next Steps (Human Decision)

1. **Michael to audit deployment:** Vercel bot-detection rules, Cloudflare config, WAF logs
2. **Whitelist Google's crawlers** on the WAF (or disable the block for `*.amparohq.com`)
3. **Re-run Move 1** after unblocking
4. **Parallel track:** If the site is intentionally blocking automated crawlers, that's a business decision — but it costs organic visibility

## Wargame Decision

**Proceed to Move 2 anyway:** Triage the architecture/findings *without baseline numbers*, and flag the unblock as a prerequisite for Moves 3-7.

Or: **Wait for unblock.** The fix is environmental, not code-based, so technical optimization (wargame 33's core) is premature.

Recommendation: **Unblock first, then run wargame 33 from the start** with real data. A performance optimization plan without baseline numbers is a guess.
