# notebook/

Source documents for the Amparo NotebookLM notebook. These live in the repo
(not a temp folder) so the paths stay valid across sessions and are versioned
with the code they describe.

**Notebook ID:** `944d5ba5-441e-4d95-8c3e-75f3988e9921`
**Notebook URL:** https://notebooklm.google.com/notebook/944d5ba5-441e-4d95-8c3e-75f3988e9921

## Add or update a source

```bash
nlm source add 944d5ba5-441e-4d95-8c3e-75f3988e9921 --file "C:/Users/mfran/Ai-Foundations/Amparo/notebook/<file>.md"
```

Adding a file with the same name creates a **second** source — NotebookLM does
not overwrite. To replace one, delete the old source in the NotebookLM UI first,
or use `nlm source list <notebook-id>` to find its ID.

## Auth (only needed once per machine, or when cookies expire)

`nlm` has no official API — it drives a real Chrome via CDP. In a sandboxed
shell that cannot spawn Chrome, launch one manually first and point `nlm` at it:

```bash
# 1. start Chrome with a debug port
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --remote-debugging-port=9223 \
  --user-data-dir="C:\Users\mfran\.nlm-chrome-profile" \
  --no-first-run about:blank &

# 2. point nlm at it (sign in to Google in the window that appears)
nlm login --cdp-url http://127.0.0.1:9223
```

Gotchas that cost real time, recorded so they aren't rediscovered:

- **`nlm login` alone fails in a sandboxed shell** — it tries to spawn its own
  Chrome, increments the port each attempt, and cannot connect. The `--cdp-url`
  flag is what makes it reuse an existing browser.
- **Manual cookie import (`--manual --file`) is not sufficient.** Cookies alone
  give a 401; the tool also needs a CSRF token it can only extract by loading
  the live page in a real browser.
- **Version matters.** `nlm` ≤ 0.8.6 hardcodes `notebooklm.google.com`, but
  Google renamed the product to Gemini Notebook at `notebook.google.com`. Older
  versions watch a domain that no longer exists and never detect sign-in.
  Upgrade: `uv pip install --python "C:/Users/mfran/.nlm-venv/Scripts/python.exe" --upgrade notebooklm-mcp-cli`
- `.json` files are rejected — NotebookLM only accepts document/text formats.

## Files

| File | Contents |
|---|---|
| `amparo-version-history.md` | Every tag v2.0.0 onward, the commits under each, and a "what tag has the fix for X" lookup |
| `amparo-session-log.md` | Ground truth, PostHog funnel, incidents, panel, blind spots, roadmap |
| `amparo-focus-group.md` | The six-persona review and which fixes it produced |
| `amparo-user-transcript.md` | The real completed-funnel user's own words, themed |
| `amparo-friend-answers-followup.md` | His direct answers to the four open questions |
| `amparo-ux-audit-2026-08-02.md` | The state-picker audit: real funnel numbers, root cause, Mobbin references, the fix |

Related, elsewhere in the repo: `wargames/01-panel-and-roadmap.md`,
`DEPLOYMENT.md`, `CHANGELOG.md` — also loaded as notebook sources.
