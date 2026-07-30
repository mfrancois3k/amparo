# Deployment & DNS

## Current status: the live site is down (DNS, not the build)

As of 2026-07-30, `https://www.amparohq.com/` returns **404**. The app is fine —
this is a DNS record pointing at the wrong place.

### Diagnosis

```
$ nslookup -type=NS amparohq.com
amparohq.com   nameserver = ns1.vercel-dns.com
amparohq.com   nameserver = ns2.vercel-dns.com     <- Vercel runs this zone

$ nslookup amparohq.com
Addresses: 64.29.17.1, 216.198.79.65               <- Vercel anycast

$ curl -sI https://amparohq.com/
HTTP/1.1 308 Permanent Redirect
Location: https://www.amparohq.com/                <- apex sends everyone to www

$ nslookup -type=CNAME www.amparohq.com
www.amparohq.com  canonical name =
    bc818ffa37b4c0fc474f.cf-prod-us-proxy.proxyhog.com   <- NOT Vercel

$ curl -sI https://www.amparohq.com/
HTTP/1.1 404 Not Found
Server: cloudflare                                  <- dead end
```

**The loop:** apex is on Vercel and 308-redirects every visitor to `www`; `www` is
a CNAME to a third-party Cloudflare proxy with no site behind it. So *every*
visitor lands on a 404. There is no path to the app through this domain.

### ROOT CAUSE (confirmed via the PostHog API)

`proxyhog.com` is **PostHog's managed reverse proxy**, created 2026-07-30 00:07,
status `valid`, for the domain `www.amparohq.com`:

```
domain: www.amparohq.com
target: bc818ffa37b4c0fc474f.cf-prod-us-proxy.proxyhog.com
status: valid
```

So this is not a hijack and nothing needs auditing — it was a deliberate
setup. The problem is a **hostname collision**: `www.amparohq.com` cannot be
both the website and the analytics reverse proxy. The proxy claims the whole
hostname, so `www` now serves PostHog ingestion, and Vercel's apex redirect
funnels every visitor into it.

**Fix: move the proxy to a subdomain.**

1. PostHog -> Settings -> organization proxy: delete the `www.amparohq.com`
   record, create one for `ph.amparohq.com`.
2. Point `ph` at the CNAME PostHog returns.
3. Point `www` back at `cname.vercel-dns.com` (Option A below).
4. Flip `PH_HOST` in `index.html` to `https://ph.amparohq.com`.

Until step 4, `PH_HOST` stays on `https://us.i.posthog.com` so analytics keeps
working rather than posting into a hostname that does not exist yet. The CSP in
`vercel.json` already allows both hosts, so the flip needs no header change.

### Important: this is not a Cloudflare problem

The zone's nameservers are Vercel's, so there is no Cloudflare dashboard to fix
this in. The offending `www` CNAME record lives **in Vercel's DNS**; it merely
points *out* to a host that happens to sit behind Cloudflare. Cloudflare's MCP
servers and DNS docs do not apply here.

Worth checking separately: `proxyhog.com` is not a Vercel service. If nobody
deliberately set that record up, treat it as a hijacked/stale record and audit
who has access to the Vercel account and the registrar.

### The fix (Vercel dashboard → Project → Settings → Domains)

Pick **one**:

**Option A — point `www` at Vercel (keeps www as the canonical host)**

Replace the `www` CNAME record:

| Type  | Name | Value                   |
|-------|------|-------------------------|
| CNAME | www  | `cname.vercel-dns.com`  |

Simplest route: delete the existing `www` record, then add `www.amparohq.com`
as a domain on the project — Vercel creates the correct record itself.

**Option B — serve from the apex instead**

Remove the apex → `www` redirect, set `amparohq.com` as the primary domain, and
either delete `www` or redirect `www` → apex.

Do not leave the current state, where apex redirects to a host that isn't the app.

### Verifying the fix

```bash
curl -sI https://www.amparohq.com/ | head -1          # expect: HTTP/2 200
curl -s  https://www.amparohq.com/ | grep -c manifest.webmanifest   # expect: 1
curl -sI https://www.amparohq.com/ | grep -i content-security-policy # expect: present
curl -sI https://www.amparohq.com/nope | head -1      # expect: 404 (custom page)
```

The CSP check matters: it proves `vercel.json` is being applied, which also
confirms the deployment is serving *this* repo and not something older.

---

## Is this repo actually connected to Vercel?

**Unconfirmed.** There is no `.vercel/project.json` here, and `amparo.vercel.app`
serves an unrelated Portuguese Next.js app — not this project. Before assuming a
`git push` reaches production, confirm in the Vercel dashboard that a project is
linked to `github.com/mfrancois3k/amparo` and note its production URL here:

```
Vercel project name:  __________________
Production URL:       __________________
```

## What this repo expects from the host

Static site, no build step. Serve the repo root.

| File                   | Purpose                                           |
|------------------------|---------------------------------------------------|
| `index.html`           | The whole app, single file                        |
| `404.html`             | Custom not-found page (Vercel serves it for static)|
| `vercel.json`          | CSP, HSTS, framing, referrer, permissions headers  |
| `manifest.webmanifest` | Installability — without it iOS drops the offline pack after ~7 days idle |
| `sw.js`                | Service worker; must be served `no-cache` (set in `vercel.json`) |
| `robots.txt` / `sitemap.xml` | Crawlability                                |
| `audio/`, `img/`       | Immutable, long-cached                            |

## If you want an agent to fix DNS next time

Nothing here can reach the DNS provider. To let an agent do it, connect
Vercel's MCP with domain permissions, or add the Cloudflare MCP **only if** the
zone is ever moved to Cloudflare:

```json
{ "mcpServers": { "cloudflare-api": { "url": "https://mcp.cloudflare.com/mcp" } } }
```

Either requires an interactive OAuth approval, so it cannot be completed from a
headless session.
