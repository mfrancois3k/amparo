# Amparo — session handoff

Paste this whole file as the first message of a new session. Everything in it
was verified against the repo on 2026-08-11 at tag `v2.15.0`, not remembered.

---

I'm Michael, building Amparo (amparohq.com). Read this fully before doing anything.

## What Amparo is

Free, no-account, offline-capable PWA that prepares drivers for a police traffic
stop **before** it happens. Bilingual EN/ES. Single-file static HTML (~529KB),
deployed on Vercel. Repo: `C:\Users\mfran\Ai-Foundations\Amparo`

**Core promise, never violate:** "Your name, contacts and documents never leave
your phone." No accounts, no server, no upload. This is why the audience trusts
it, and it is the product's only real moat.

## Read these first — they exist so you don't read index.html

`index.html` is 436KB. Do not read it to learn context. Read these:

| File | What it gives you |
|---|---|
| `notebook/amparo-version-history.md` | every tag, what shipped, "which tag has fix X" lookup |
| `notebook/amparo-session-log.md` | ground truth, funnel data, incidents |
| `notebook/amparo-user-transcript.md` | the one real user's actual words |
| `notebook/amparo-ux-audit-2026-08-02.md` | the 94.5% drop audit |
| `wargames/02-consensus-roadmap.md` | 20 ranked roadmap items |
| `notebook/amparo-upl-engagement-memo.md` | UPL legal exposure, drafted, unsent |
| `notebook/amparo-dv-clinician-engagement-memo.md` | door-module DV safety gate, drafted, unsent |
| `CHANGELOG.md` | generated from tag annotations |

For the newest work specifically: `notebook/amparo-focus-group-08-divergent-turns.md`,
`wargames/12-divergent-turns-modules.md`, and
`notebook/amparo-blindspot-audit-2026-08-11.md` — the most recent `/amparo-loop` pass.
For the door module's research trail: `wargames/10-final-boss-module-scaffold.md`,
`notebook/amparo-door-module-research-2026-08-03.md`, and
`notebook/amparo-door-raid-research-2026-08-04.md` (six bodycam videos, see the
REVERTED note below before touching this again).

## Current state — verified at v2.15.0, 2026-08-11

- Live at https://www.amparohq.com/ — static, Vercel, no backend anywhere.
- `EDITION = "2026-C"`. An attorney signs a **specific** edition; any legal
  content change bumps EDITION and automatically drops every attorney badge.
- **Zero attorneys engaged.** Badge scaffold exists, never filled.
- TX/GA/NY have real cited statutes. The other 47 + DC show the verified federal
  floor only, marked "federal ✓". No state statute has ever been invented.
- **Practice engine: 5 live levels** — Calm stop, Irritated officer, Ordered
  out, Hard mode, Checkpoint. Hard mode is the unwinnable one. Checkpoint got
  its **own hub tab** in v2.13.0 (was buried at the end of the traffic ladder;
  it's a Border Patrol immigration checkpoint, not a traffic stop, and applies
  in all 50 states unlike the state-cited content).
- **Divergent turns (v2.14.0):** on Level 1, a good answer de-escalates the
  NEXT officer line to the calm-tone variant; on Level 2, a mistake escalates
  to hostile. Selection only, from the same static attorney-reviewable variant
  bank — no new content. L2's arrest beat currently has zero hostile variants
  in the bank, so that leg is inert until one is authored (flagged, not fixed).
- **Geographic US state map (v2.11.0)** replaced the old alphabetical button
  list entirely — real state shapes from public-domain path data, sliver
  states (RI/DE/DC/NJ/CT/MA/NH) tappable via their labels. Picked state now
  travels as a pill through steps 2-5 (v2.12.0), tapping it returns to step 1.
  Stepper's completed nodes are clickable nav (v2.11.0).
- **Practice card is dark now (v2.15.0)** — was cream, now navy/gold matching
  the recording console's existing dark palette. Tone-atmosphere (v2.12.1: a
  border glow that shifts with officer tone, red scanline on Hard Mode) was
  re-tuned for the dark ground in the same release.
- **A "remind me tomorrow" `.ics` calendar reminder (v2.10.0)** is the only
  channel that can reach a user after they close the app — no server, no
  push, no account. Offered on steps 1-3 once a state is picked.
- **Document-capture step is BACK, rebuilt (v2.10.0)** — this file used to say
  "not built" after v2.1.0 removed it; that's now wrong. It's an *overlay*,
  not a wizard step (native OS-camera file input, no `getUserMedia`), reached
  from the You/Print steps, photos persisted under their own `sr_docs`
  localStorage key so they survive a reload but can be wiped independently of
  the rest of a saved pack.
- **One more scenario tier + a door module are BUILT but DARK.** See flags below.
- Audio: 62 clips per voice EN, 58 per voice ES. All 53 referenced ids resolve
  in EN. Missing in ES: `k30`, `k33` only. (A separate 24-clip door-module
  batch was generated in v2.9.0 and then deleted in the revert below — do not
  expect to find it.)
- No payment integration. No Stripe. No Convex deployed (chosen, not built).

### ⚠️ REVERTED — door module draft (read before touching PRX_DOOR again)

v2.9.0 shipped a full draft script + 24 audio clips for the door module,
built by modeling phrasing *patterns* from the six-video bodycam research
batch — never verbatim quotes. Michael's instruction had been to use the
actual clips from the linked videos as the scenarios, not paraphrase them.
That's not something this project can do (broadcast-news copyright on the
clips themselves; turning real, identifiable people's real recorded words —
several from active/recent legal cases — into "the officer says this,
correct response is this" scripted training content is a different and
heavier problem than the UPL question, closer to what the DV memo exists to
prevent). Reverted whole in `df974b7`. `PRX_DOOR` is back to
`TODO_ATTORNEY`/`TODO_DV_CLINICIAN` placeholders. The research itself
(`amparo-door-raid-research-2026-08-04.md`) is still good and still feeds
the eventual attorney/DV-clinician review — only the authored draft and its
audio were pulled.

### The two feature flags — do not flip without the gates

```js
const FINAL_SCENARIOS_ENABLED = false;  // levels 5,6 — ci 50-55, 60-65
const DOOR_MODULE_ENABLED     = false;  // level 7    — ci 70-75
```

Everything behind them is fully plumbed — decks, locks, warn branches, unscored
guards, debrief branches, EN+ES strings, CSS badges. **Every officer line is a
`TODO_ATTORNEY` placeholder.** Two door beats are `TODO_DV_CLINICIAN`, which is
a *different and additional* gate — see the DV finding below.

## The real numbers — don't trust the PostHog dashboard bounce metric

30-day funnel: **72 landed → 4 picked a state → 3 printed.** That is a 94.5%
drop, not the ~50% the aggregate bounce number shows. Verify with SQL before
acting on any dashboard figure.

Autocapture is OFF by design (privacy), so there is **no rage-click or
element-level data.** You can see *that* people leave, never *what* they
clicked.

One caveat added 2026-08-03: a `controllerchange` bug was double-firing
`$pageview` for every new visitor until v2.7.1. The 94.5% denominator may be
inflated. Re-read the funnel over a clean window before treating it as exact.

## Hard rules — not preferences

1. **NEVER generate statute text or legal citations with a model.** Research +
   primary source + attorney only. A wrong citation gets someone arrested.
2. **NEVER add anything that sends user data off-device.** No geolocation, no
   analytics of typed content, no server for personal fields.
3. **NEVER claim verification that didn't happen.** Precedent: a badge read
   "sources auto-checked daily" while all four sources were 403ing. The failure
   wasn't the check breaking — it was breaking *quietly while still making its
   claim.*
4. **Bump EDITION for any legal content change.**
5. **Verify before asserting.** Repeatedly this project, logs said one thing and
   reality said another. Recent examples: agents miscounted orphaned lines,
   claimed audio wasn't retained when it was, and reported stale findings twice.
   Every one was caught by checking source first.

## Open issues, highest value first

1. **UPL exposure.** *Upsolve v. James* (2d Cir. 2025) held a state may bar free
   nonprofit "what to say" guidance — and Upsolve was itself a nonprofit, so
   501(c)(3) status is not a shield. The **scored practice engine** is the
   exposed component, not the statute pages. Needs a UPL attorney (~$1–2K)
   before any per-state review spend. The memo is drafted at
   `notebook/amparo-upl-engagement-memo.md` and **unsent**.
   - Amended at `cc285d4` (2026-08-04): Q9 now asks about three distinct
     revenue lines — pack only, practice scripts, engine access — instead of
     the stale "pack only, never the practice engine" framing, which asked the
     opposite of the real question. Q9b added on whether 501(c)(3) changes any
     of it. Section 1 no longer claims monetization is unplanned.
   - Amended again 2026-08-10: now discloses the rebuilt document-photo
     storage (§1) and that variant selection can depend on the previous
     answer (§2.2, divergent turns). Still nothing left to amend; it needs a
     recipient, not another edit.
2. **The door module has a content blocker, not just a legal one.** Michigan's
   POST curriculum instructs officers on a DV call not to accept "everything's
   fine" and to refuse to leave without speaking to the victim. The module's
   planned correct answer — calm, repeated refusal at the threshold — is what
   that training reads as the assailant's presentation. DV-related calls are
   15–50% of all police calls, so this is plausibly the *modal* case for "we got
   a call about this address." Needs a DV clinician, not just a lawyer.
   Memo drafted and **unsent** at `notebook/amparo-dv-clinician-engagement-memo.md`
   — a separate, additional gate from the UPL attorney review; neither
   substitutes for the other. Two open gates, two unsent memos, same recipient
   problem as #1.
3. **Two voice performances + attorney content** for the final scenarios. 18
   beats of `TODO_ATTORNEY`, 48 audio clips.
4. **`k30`/`k33` Spanish audio.** Generated via Voicebox and then deleted —
   every kokoro Spanish voice mispronounces "Ciudadanía" and "Oríllese". A
   Border Patrol agent mispronouncing "citizenship" is worse than the correct
   robotic fallback. Needs a human read. See
   `notebook/amparo-spanish-audio-recording-list.md`.
5. ~~Document-capture step not built~~ — **done, v2.10.0.** See Current State above.
6. **No spaced repetition**, in a product whose whole premise is recall under
   stress.
7. **Georgia has no statute source reachable from CI** (403s the runner) — not
   re-verified since 2026-08-04; check the daily cron log before trusting this.
8. **L2 divergence's hostile leg is inert** (v2.14.0) — the arrest beat (ci 7)
   has zero hostile variants in `PRX_VAR`. Structure is live, content isn't.
9. **Checkpoint has no variant pool, no curveball, no divergence** — flagged in
   `wargames/12` as now reading thin next to a more dynamic traffic ladder.

## What was decided and should not be re-litigated

- **No React/Next rebuild.** Measured: 1 request to interactive, 112KB brotli,
  0 long tasks, CLS 0.00. A bundler renames every chunk per deploy, so prepaid
  users re-download the app each release, and the privacy claim stops being
  provable by view-source. The 1.2s parse is real — fix it by deferring the
  practice engine and cutting dead analytics, not a framework.
- **No runtime cloud TTS.** It needs a public API key or a server that logs who
  is rehearsing. Voices stay authoring-time MP3s + on-device fallback.
- **Convex chosen** as the eventual Tier-2 backend, if monetization proceeds —
  impersonal rows only (`token/state/product/edition`, never a name). Nothing
  built. See `wargames/05-split-architecture.md`.
- **Donations/monetization: parked.** Three independent panels concluded
  "premature" at current traffic. See the three
  `notebook/amparo-donation-research-*.md` files.

## Tooling

**The loop.** `/amparo-loop <slug>` runs the standing 9-step verification: tag,
changelog, version history, NotebookLM, then three parallel agents (10-persona
focus group, module design review, blind-spot audit). Skill lives at
`.claude/skills/amparo-loop/SKILL.md`.

**NotebookLM.** Notebook `944d5ba5-441e-4d95-8c3e-75f3988e9921`.

```bash
nlm source add 944d5ba5-441e-4d95-8c3e-75f3988e9921 --file "C:/Users/mfran/Ai-Foundations/Amparo/CHANGELOG.md"
```

Adding the same filename creates a **second** source — it does not overwrite.
Delete first: `nlm delete source <source-id> -y`.

**Auth, and this cost real time — read it.** `nlm` stores credentials at
`~/.notebooklm-mcp-cli/profiles/default`. It does **not** use
`~/.notebooklm/storage_state.json` — that belongs to the separate `notebooklm`
binary, and checking it will make working auth look broken.

Two different credentials live in that profile, with two very different
lifespans: the Google account cookies (`OSID` etc.) are valid ~13 months and
are never the problem. The `csrf_token`/`session_id` pair in `metadata.json`
is a short-lived Google-internal frontend session tied to one page load —
Google expires it on a timer of a few hours, independent of the cookie's
stated expiry. That's what "Authentication expired" actually means almost
every time, and it recurs **within the same working session** — expect it
multiple times in one day, not once a month.

**The reliable fix is the CDP method** against a long-running Chrome on port
9223 (launch once, it keeps serving re-auths all day):

```bash
curl -s -m 3 http://127.0.0.1:9223/json/version   # already listening?
# if not:
"/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9223 \
  --user-data-dir="C:\Users\mfran\.nlm-chrome-profile" --no-first-run about:blank &
nlm login --cdp-url http://127.0.0.1:9223
```

Plain `nlm login` (no flags) drives `nlm`'s own isolated headless Chrome at
`~/.notebooklm-mcp-cli/chrome-profiles/default` and DOES sometimes work in
one shot — but it has also hung with `WebSocketTimeoutException` from this
sandboxed shell, and a killed attempt leaves zombie `chrome.exe` processes
holding that profile, which then wedge every retry. If plain login ever
hangs: kill only nlm's Chromes (`Get-CimInstance Win32_Process -Filter
"Name='chrome.exe'"` filtered on CommandLine containing
`notebooklm-mcp-cli`), then use the CDP method above. Verified both
directions on 2026-08-11.

**Voicebox** (voice generation) is a local app exposing JSON-RPC at
`127.0.0.1:17493/mcp` while open — not a registered MCP. Drive it over HTTP; see
`tools/voicebox_es.py`. Its MCP surface has no clone tool, but `POST /profiles`
with `voice_type=preset` does. **Use native-language presets** — English-cloned
voices reading Spanish produce audio its own Whisper cannot parse.

**Always round-trip generated audio through `voicebox.transcribe` and compare to
source before shipping it.** That check caught two unusable batches.

## Release workflow

1. Commit explaining **why**, not just what.
2. `git tag -a vX.Y.Z -F -` — the annotation *is* the release notes; CHANGELOG
   is generated from annotations, not commit subjects.
3. `git push && git push origin vX.Y.Z`
4. Update `CHANGELOG.md` and `notebook/amparo-version-history.md`.
5. Re-add both to NotebookLM (delete the old sources first).

A daily cron commits to this repo — `git pull --rebase` before pushing.

## How I work

Be direct, no filler. **Tell me when I'm wrong** — I've been wrong several times
on this project and the corrections were the most valuable part. Verify claims
before making them. If you can't do something, say so plainly instead of trying
six workarounds.

Start by telling me what you understand the current state to be, and what you
think the single highest-value next move is.
