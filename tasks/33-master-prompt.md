# The Amparo one-prompt setup (Nate Herk pattern, adapted)

Two files, same trick as the "One Prompt, One Company" video: a short trigger prompt that
points at this file, and this file as the full instruction set. The short trigger keeps the
agent from stalling on questions; this file gives it everything it needs to run unsupervised.

**Adapted, not copied.** Nate's mission was "build a company from nothing." Amparo is not
nothing — it is a live product with a legal-exposure profile, a documented failure history,
and a battle plan already war-gamed (`wargames/33-core-web-vitals-fix-pass.md`). So the
mission here is narrower and the guardrails are harder. His "never ask" rule survives; his
"publish nothing" rule maps to "commit locally, never push"; his "invent nothing" rule maps
to this repo's own hard rule 5 ("verify before asserting" — this project has caught agents
being confidently wrong repeatedly).

## The trigger prompt (what you actually type)

```
Read tasks/33-master-prompt.md in the Amparo repo and execute everything below
the divider line as your goal. That file is your full instruction set: mission,
guardrails, arc, deliverables, and definition of done. Follow it exactly,
including the never-ask rule and its two hard stops. Do not report back to me
until the definition of done is met or a hard stop is reached. Start now.
```

---

# Mission

Execute wargame 33 — the Core Web Vitals / technical-SEO fix pass on Amparo
(https://www.amparohq.com/, root `index.html` AND `/app`) — end to end, unsupervised.
The battle plan is `wargames/33-core-web-vitals-fix-pass.md`. It is your move-by-move
route: every move's expected observation, most-likely failure with counter-move, fork
triggers, RECON NEEDED checks, abort conditions, and verification runs are already
written. You are the executor, not the war-gamer. Do not redesign the route — run it.

This is a test of disciplined execution, not creativity. The judgment calls were already
paid for once, in the wargame. Your best work here is the route followed exactly, every
verification actually run, and an honest build log.

# Guardrails (non-negotiable, all enforced by this repo's history)

1. **No new spending.** PageSpeed Insights' keyless API and existing tooling only. No new
   paid services, no signups, no API keys created.
2. **Commit locally, publish nothing.** NEVER `git push`, never deploy, never change Vercel
   settings, never flip a feature flag. The live site is touched only by Michael. This is
   wargame 33's Move 7 HUMAN CONFIRM gate — one of your two hard stops.
3. **Invent nothing** (= repo hard rule 5, "verify before asserting"). Every claim in your
   findings doc traces to a saved PSI report file or a `file:line` you actually read. This
   repo has a documented history of agents reporting stale or wrong findings confidently —
   twice in one day on 2026-08-13. Check source yourself; if a check fails, isolate and
   re-run before trusting the failure, and equally before trusting a pass.
4. **Never author legal content** (= repo hard rule 1). No statute text, no citations, no
   officer dialogue. If a PSI finding tempts a user-facing copy change (short H1, thin meta
   description): EN/ES parity + the `/app` extraction pipeline apply, and Move 2's scope-tag
   rules decide — default is out-of-scope.
5. **Nothing that sends user data off-device** (= repo hard rule 2). No new analytics, no
   new third-party scripts, no external fonts. Preconnect hints to hosts already in the CSP
   are fine; new origins are not.
6. **The four pre-existing uncommitted files are off-limits:** `app-src/index.html`,
   `app/index.html`, `arena/index.html`, `vercel.json`. Confirm via `git status` before
   Move 3, and again via `git diff --staged` before Move 7's commit. Do not stage, revert,
   or "clean up" any of them.
7. **Two known landmines escalate instead of improvising** (second hard stop): anything that
   forks toward `/app`'s content-extraction pipeline (`tools/extract-app-content.mjs`) or
   root `sw.js`'s cache-name logic (the `amparo-` prefix deletion). Both have shipped real
   bugs before. Stop, log the fork in the build log, flag for Michael.
8. **Work inside the isolated branch/worktree** from Move 3. Artifacts go to
   `notebook/` (findings doc) and the PSI baseline dir named in the build log.
9. **Never ask mid-run.** Every question you would ask, answer yourself from the wargame,
   the repo, or research — then log the question, your answer, and why in the build log.
   Blocked is not an option except at the wargame's own written abort conditions and the
   two hard stops above. If a move stalls, take its written counter-move; if that fails,
   take the abort path and log it — do not invent a third option.

# Orchestration

Use the wargame's model-routing table, not vibes: Haiku for mechanical moves (1, 3, 4a, 5),
Sonnet for judgment moves (2, 4b, 6, 7), Opus/flag-to-Michael only at the escalation rows.
Fan out Move 1's four PSI pulls in parallel. Run Move 4a in parallel with Move 1 — the
wargame's red-team pass already approved that. Everything else is sequential; the wargame's
order exists because Move N's output is Move N+1's input.

# The arc

Moves 1 → 7 of `wargames/33-core-web-vitals-fix-pass.md`, with its Overall short-circuit
honored: **if Move 1's baseline already meets every target (LCP<2.5s, INP<200ms, CLS<0.1,
FCP<1.5s, TBT<200ms) on all four surface×device combos — stop after Move 2, log the clean
bill of health, do not manufacture work.** The verdict section is binding: Moves 1-2 always;
3-7 only as the data justifies.

# Deliverables

The mission brief's six (`tasks/33-core-web-vitals-fix-pass.md`), plus:
- `notebook/amparo-cwv-findings-2026-08-20.md` — the triage doc, every finding scope-tagged.
- A build log (append to the findings doc or a sibling file): every self-answered question,
  every counter-move taken, every deviation and why.

# Definition of done

- Four PSI reports saved, all four with real numeric values for the five target metrics
  (or the wargame's Move 1 abort honestly logged).
- Findings doc exists; zero untagged findings.
- Short-circuit decision recorded explicitly (proceed / stop-clean).
- If proceeded: branch exists, in-scope fixes applied, 3-run-averaged before/after table
  shows ≥1 metric improved and zero regressions, one local commit containing only in-scope
  files. NOT pushed.
- `LEDGER.md` mission-33 execution status updated to match reality.
- Build log complete. Nothing pushed, nothing spent, nothing invented.
