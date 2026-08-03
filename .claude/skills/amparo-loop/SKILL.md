---
name: amparo-loop
description: Ship a fix on Amparo, then verify it — commit, tag, changelog, NotebookLM, then a 10-persona focus group + module design review + blind-spot audit run in parallel. Use when the user says "/amparo-loop", "run the loop", or "loop it" on this project.
---

# Amparo loop

Standing 9-step sequence for this repo. `ARGUMENTS` is a short slug for what
was just built or fixed, e.g. `/amparo-loop mute-and-progress-bar`. If empty,
infer it from `git diff HEAD` / the last uncommitted change.

Steps 1-6 are one linear pass you do yourself. Steps 7-9 fire three
**background** agents in a single message — they do not block this turn, and
their results arrive as later notifications. Report them to the user when they
land; do not fabricate what they'll say.

## 1. Confirm the fix is real
`git status` + `git diff HEAD`. If nothing changed, stop and ask what to loop
on — this skill verifies shipped work, it doesn't invent a task.

## 2. Commit, tag, push
```bash
git add -A && git commit -m "..."          # only if uncommitted changes exist
LAST=$(git tag -l | sort -V | tail -1)      # e.g. v2.7.2
```
Bump PATCH (Z+1) for a fix/polish pass, MINOR (Y+1, Z=0) for a new feature or
module. Default to patch unless ARGUMENTS clearly describes new capability.
```bash
git tag -a vX.Y.Z -F -   # annotated, message = 3-6 line summary of the change
git push && git push origin vX.Y.Z
```

## 3. CHANGELOG.md
Append a new `## vX.Y.Z — YYYY-MM-DD — "<short title>"` section at the top of
the version list, same format as the existing entries (what shipped, what it
fixes, one line on why if non-obvious).

## 4. notebook/amparo-version-history.md
Append the matching lookup-table entry — same version, same date, one-line
description. Keep it shorter than the CHANGELOG entry; it's an index, not the
doc.

## 5. NotebookLM (best effort, non-blocking)
```bash
notebooklm source add --notebook amparo --file CHANGELOG.md
```
If this fails (not logged in, notebook doesn't exist yet), note it in your
summary to the user and continue — never let this block steps 6-9.

## 6. Pick the next notebook filenames
```bash
ls notebook/amparo-focus-group-*.md | grep -oE 'focus-group-[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1   # next FG number
ls wargames/*.md | grep -oE '^wargames/[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1   # next wargame number
```
The first pattern must anchor on `focus-group-` — a bare `[0-9]+` also matches
version numbers embedded in older filenames (`...-v270.md` → `270`) and picks
the wrong max. Increment each result. Slug from ARGUMENTS. If
`notebook/amparo-blindspot-audit-<today>.md` already exists (same-day rerun),
suffix `-02`, `-03`, ... rather than overwrite.

## 7. Agent A — 10-persona focus group (background)
Read `.focus-group/members.md` and the two most recent
`notebook/amparo-focus-group-*.md` files first, so it measures against the
CURRENT build and doesn't repeat prior rounds' findings as new. Must:
- verify every claim against source (grep index.html), not assume
- pick 10 of the personas, spanning the real spread
- **exclude attorney/lawyer review as a finding** — it's known, tracked, not new
- give exactly **5** ranked items for "golden standard," each evidence-tied
- a separate list of what must change in the practice **modules**
- blind-spot questions a top UX researcher would ask that haven't been asked
- **write the report itself** to `notebook/amparo-focus-group-NN-<slug>.md`
  (the number from step 6) — return only a 15-line summary, not the full doc

## 8. Agent B — module/level design review (background)
Game designer + level designer + instructional designer lens on the practice
modules specifically (beat structure, difficulty curve, pacing, replayability).
Read the current `PRX_LEVELS`/`PRX_OPT`/`PRX_VAR` shapes in index.html first.
**Never author officer dialogue or legal content** — structure only, same
`TODO_ATTORNEY` placeholder convention as `wargames/03-door-module-design.md`.
Write to `wargames/NN-<slug>-modules.md`.

## 9. Agent C — blind-spot / architecture audit (background)
Principal-engineer lens: performance, service worker, analytics honesty,
error handling, anything that would embarrass the project if found by a
hostile reviewer. Verify every finding against source or a real command
output — mark unverified claims explicitly. Write to
`notebook/amparo-blindspot-audit-<date>.md`.

---

## Composing with recurring runs
This skill is one pass. To re-run it on an interval instead of once, wrap it
with the built-in loop skill rather than rebuilding that logic here:
```
/loop 30m /amparo-loop <next-slug>
```

## What this skill does NOT do
Does not decide what to fix — point it at already-completed work. Does not
send anything to an attorney. Does not touch pricing/UPL decisions. Does not
skip verification because ARGUMENTS sounds trivial — every claim in every
agent's output still needs to check against real source, same as a manual run.
