# research/tools

Tooling for the state-law matrix. **Research only. Nothing here produces
user-facing content.**

## verify.py — the only path by which statute text enters the ledger

    python verify.py locators.json

Input is a JSON array of locators:

```json
[{"state":"Ohio","section":"2923.12",
  "url":"https://codes.ohio.gov/ohio-revised-code/section-2923.12",
  "pattern":"fail to disclose"}]
```

Output is sentence-bounded extracts around each pattern match, plus a status
line per target.

### Why this exists

When research is delegated — to a subagent, a contractor, anyone — the danger is
not laziness. It is **plausible fabricated statute text**, which is
indistinguishable from real statute text at a glance and catastrophic if it
reaches a user.

The rule this tool enforces: **scouts return locators, never text.** A scout
supplies `(state, section, url)`. This script fetches and quotes. A wrong
section number is caught immediately because the fetched catchline will not
match. Fabricated text cannot enter the ledger because no supplied text is ever
read.

### Every defence here is a scar

| Guard | The failure it prevents |
|---|---|
| anchor check | law.justia.com over `curl` returns 4–5 KB of page chrome, HTTP 200, no statute. Without requiring the section number to appear in the body, this is indistinguishable from "the statute is silent on this." |
| chrome stripping | "**Sign** up for our free summaries" matched a `/sign/` pattern and produced confident-looking hits on pages containing no law at all. |
| PDF renegotiation | `legis.iowa.gov` serves HTML for `.pdf` URLs unless the request sends `Accept: application/pdf`. This defeated seven attempts across four passes before the cause was found. |
| shell/block detection | `iga.in.gov` returns 73 bytes, `le.utah.gov` 136, `azleg.gov` 421 — all HTTP 200. |
| block beats anchor | A blocked page can echo the requested section number back inside its own error text. Found in smoke-testing: Utah's 136-byte block passed the anchor check and reported `OK`. A short page now hard-fails regardless. |
| whitespace collapse before matching | `pypdf` splits words across line breaks, so a correct multi-word pattern silently misses text that IS present. Found in smoke-testing against Iowa §805.3, a section already known to contain the phrase. **A false negative is the most dangerous outcome for this ledger** — it reads as "this state imposes no duty." |
| mid-word extract warning | An extract beginning mid-word means the window cut a negation off the front. This nearly inverted the Colorado rule: C.R.S. §42-4-1707(6) has two sentences with opposite conditions twenty words apart. |
| iframe hint | `palegis.us`'s outer page is a navigation shell; Pennsylvania statute text lives only inside its second iframe. |

### Known-bad hosts

`le.utah.gov`, `azleg.gov` — block automated fetches.
`iga.in.gov`, `mgaleg.maryland.gov`, `statutes.capitol.texas.gov` — JS app
shells; need a rendered browser.
`code.wvlegislature.gov` — 403; use `codes.findlaw.com`.
`casetext.com` — **shut down entirely**, which is why Arkansas's court rules are
currently unreachable.

### Technique that beats guessing

Fetch the **chapter index** and read section catchlines before fetching any
section. On the six jurisdictions that had resisted everything else, guessing
section numbers went **0-for-6**; index-first went **6-for-6**. It also finally
cracked Oklahoma after four failed passes.
