# Amparo — build session log (2026-07-30 to 2026-08-02)

Product: amparohq.com — free, no-account, offline-capable PWA that prepares
drivers for a police traffic stop *before* it happens. Bilingual EN/ES. All data
stays on device. Single-file HTML app (~380 KB), deployed on Vercel.

---

## Ground truth: what is actually true today

- **Live** at https://www.amparohq.com/ — 200, current build, CSP + HSTS headers.
- **Edition 2026-C.** An attorney signs a *specific edition*, never the product
  forever; any content change bumps EDITION and drops every attorney badge.
- **Zero attorneys engaged.** The badge scaffold exists and has never been filled.
- **3 states** (TX, GA, NY) carry real statute citations. **48 states + DC** are
  selectable but show only the verified federal floor, marked "federal ✓".
- **Statute sources auto-checked daily** by a GitHub Action — but only 3 of 4
  sources are reachable from CI (Georgia 403s the runner).
- **No payment integration anywhere.** No Stripe, no checkout.
- Practice engine: 6 levels, ~45 officer-line variants, ~10 curveballs, scoring.

---

## Real user data (PostHog, 90 days)

| Step | People |
|---|---|
| Landed | 66 |
| Picked a state | 2 |
| Previewed pack | 1 |
| **Printed pack** | **1** |

**97% leave before picking a state.** Much of the remainder is the founder
testing. Three of eight "people" in one window were bots (Paris/Linux triple-hit
within milliseconds, plus one from The Dalles, Oregon = Google data centre).

### The one completed funnel
Brooklyn, Android, Chrome mobile:
- 27 Jul 11:02 — picked New York
- *(2-day gap, nothing in the app prompted a return)*
- 29 Jul 22:52 — photographed licence front
- 22:53 — licence back
- 22:56 — previewed pack
- 22:57 — **printed**
- 22:58 — previewed twice more, ~90s AFTER printing

---

## User interview — the transcript, in his own words

- **He does not drive.** "I don't drive, I just want to see what the paperwork
  says." He is the only person who completed the funnel.
- **He skipped the wizard to reach the paperwork**, then found the scenarios by
  accident at the end: "that's when I was like, I'm interested now."
- **He gamified it unprompted**: "I was gamifying that… I got that wrong… I was
  pissed. I better see a 6 out of 6 score." Scored 4/6.
- **Hard Mode landed hardest**: "you did everything right… that made it real."
  His most-cited moment. Its value is that it refuses to be winnable.
- **Wants reworded questions** so answers can't be memorised. (~45 variants
  already exist in PRX_VAR — they are simply never surfaced as replayability.)
- **Proposed monetisation:** free scenarios as the hook, 99¢ for the
  personalised PDF script. "The paywall is the paperwork."
- Second-hand on the document step: his friend said the ID placeholder is
  redundant because people already keep insurance in the glovebox.
- Fiancée's note: in the heat of the moment nobody reads paper — needs a fast
  cheat-sheet.
- Competitor analogy he liked: other pamphlets are a smoke alarm; Amparo is a
  fire drill.

---

## What shipped this session

| Tag | Contents |
|---|---|
| v2.0.0 | Installability (manifest + icons — iOS drops the offline pack after ~7 days idle without it), CSP/HSTS/framing headers, SRI, accessibility blockers (Escape/focus-trap on overlays, keyboard-operable drill, labelled contact fields, canvas alt text, gold contrast 1.71:1 → 7.24:1, 44px touch targets) |
| v2.1.0 | Custom 404, focus-group copy fixes, micro-interactions, docs step removed (5 steps → 4), all 50 states + DC selectable |
| v2.2.0 | Print-event double-count fix, daily statute source check + honest freshness badge, analytics via ph.amparohq.com proxy |
| v2.3.0 | CHANGELOG generated from tag annotations |
| v2.4.0 | Daily check actually runs on GitHub Actions; false-assurance bug fixed |

### Content corrections (the most consequential work)
Two of the four immigration claims the printed pack carried were wrong-ish:
- *"Never sign anything you don't understand"* was badly understated. Now names
  the instruments: a **stipulated removal order cannot be appealed and can bar
  return for 10+ years**. The trap is being told "sign this and you go home
  tonight."
- *"You never have to discuss where you were born or your status"* was accurate
  as a right but implied silence ends the encounter. ACLU's own guidance says
  refusal can *extend* the stop or route you to secondary. Someone expecting
  release who gets secondary is exactly who starts talking out of panic.

### New: checkpoint rehearsal level
Built on settled law only — Martinez-Fuerte (1976), Ortiz (1975),
Brignoni-Ponce (1975), 8 U.S.C. §1357, 8 C.F.R. §287.1. Trains against
*volunteering* rather than panic: the agent is businesslike and the mistake is
answering something you never had to answer, or producing a document that
proves foreign birth. Includes that **fleeing a checkpoint is a federal felony
(18 U.S.C. §758)** — which was previously nowhere in the app.

Deliberately excluded: whether a *local* officer can act on immigration status.
TX SB4, Georgia's county-by-county 287(g) map and New York's June-2026 package
are all actively moving and cannot be frozen into a rehearsal script.

---

## Incidents and what they taught

**The site was down and the cause was self-inflicted.** `www.amparohq.com` had
been pointed at PostHog's managed reverse proxy. A hostname cannot be both the
website and the analytics proxy — the proxy claims the whole host, and Vercel's
apex redirect funnelled every visitor into it. Fix: move the proxy to
`ph.amparohq.com`, give `www` back to Vercel.

**A green badge that was lying.** The first real cloud run of the statute check
had all four sources 403, yet still wrote `lastChecked: today` — so the site
displayed "sources auto-checked daily, last check 31 July" while nothing had
been checked. Now the date only advances when at least one source is actually
reached. *The failure was not the check breaking; it was the check breaking
quietly while still making its claim.*

**Local testing misled us about the cloud.** FindLaw and Justia answer a
residential IP and 403 a GitHub Actions runner every time. Probing had to be
done *from the runner*. public.law serves datacenter IPs and covers TX and NY;
Georgia has no working source, so it is only genuinely checked on a local run.

**Analytics were inflated.** `sr_pack_printed` fired on every `beforeprint`, and
Android Chrome raises that more than once per print — the real user's two events
were 686ms apart. Every historical print count was overstated.

**A credential trap.** `gh auth refresh` granted the `workflow` scope, but git
was configured with `credential.helper=manager` and kept authenticating with a
different, older PAT. `gh auth setup-git` was the actual fix.

---

## Expert panel (built by unique catch)

**Blocking:** UPL/regulatory attorney · per-state licensed attorney ·
immigration attorney · legal-aid or public-defender practitioner.

**Roles nobody had named:** instructional designer (the product's premise is
*recall under stress* and it has **no spaced repetition**) · stress-inoculation
psychologist · certified ES transcreation specialist.

**Game roles — justified by the transcript**, since the user gamified it
unprompted: encounter/combat designer (the escalation beat is an encounter, not
a quiz) · level designer (Hard Mode's lesson depends on gating) · systems
designer (what a score *means*) · game master/scenario designer · tutorial
designer (the 97% drop is a tutorial failure) · playtest lead · economy designer
· game-accessibility specialist.

**Deliberately excluded:** growth marketer (would optimise a leaking bucket at
66 visitors) · backend architect (the on-device promise is the moat) · VR
designer (right instinct, wrong decade, prepaid-Android audience).

---

## Blind spots

1. **The most engaged user does not drive.** Every persona, CTA and step assumes
   a driver. The real audience may be "people who fear police contact" —
   passengers, teenagers being taught by parents, people who just want to know.
2. **The flow is inverted.** He came for the paperwork and stayed for the game;
   he had to fight through what he wanted to accidentally find what hooked him.
3. **Event logs showed the action, only the interview showed the intent.**
   `sr_doc_added` in his log suggested keeping the document step; the transcript
   showed he was skipping *toward* the paperwork and the step was in the way.
4. **The score creates a failure identity.** "4/6" motivates a competitive
   friend; for someone genuinely traumatised by a stop, a number saying they
   failed at surviving is a different experience.
5. **Hard Mode needs its gating.** Reached cold, "you did everything right and
   it still went wrong" reads as a bug rather than a truth.
6. **No spaced repetition** in a product about recall under stress.
7. **An outside AI's product prompt encoded two false facts** — "attorney
   sign-off in progress" (nobody contacted) and "sources auto-checked daily"
   (3 of 4). This is how a trust product acquires a lie.

---

## The fork that governs everything: does anything cost money?

The 99¢ pack purchase locates value correctly and collides with three things
already built:
1. **The privacy promise** — payment creates an identity and payment trail.
2. **The Luis persona**, from the project's own focus group: has the money,
   *will not leave a payment record for this product*.
3. **The positioning** — it charges for the fire alarm and gives away the drill.

Recommendation: stay free until a UPL attorney rules on the scored engine.
Charging converts an educational tool into a commercial legal service and
worsens every UPL argument.

---

## The legal exposure nobody had flagged

**Upsolve, Inc. v. James**, No. 22-1345 (2d Cir., 9 Sep 2025). A nonprofit
trained volunteers to give free scripted help to people sued by debt collectors.
The district court blocked enforcement on First Amendment grounds; **the Second
Circuit reversed**, holding New York's unauthorized-practice-of-law statutes are
content-neutral and survive intermediate scrutiny.

A state may therefore bar **free, nonprofit, well-intentioned "what to say"
guidance** as UPL. The Second Circuit covers New York — one of the three live
states.

The exposed component is **not** the statute pages (those resemble what the ACLU
publishes nationally). It is the **scored practice engine**: *Janson v.
LegalZoom* drew the line at responsive, person-specific guidance, and Amparo
takes a specific user's chosen words and tells them that choice was right or
wrong. A disclaimer signals intent; it does not immunise conduct.

Tex. Gov't Code §81.101(c) exempts software from the practice-of-law definition
if it conspicuously states it is not a substitute for an attorney — but that is
Texas-only, with no national equivalent.

---

## Roadmap

1. **Ask the user four questions** (free, blocks nothing): did print actually
   work; why the 2-day return; did he notice the practice button; were the
   licence photos useful. Two are already answered by the transcript (the return
   was self-initiated; he never skipped the button, he reached scenarios by his
   own route). Two remain genuinely open.
2. **Invert the funnel** — practice playable from the landing screen, pack as
   the reward. Verified in-browser that the engine already runs with no state
   selected, so this is a routing change, not a refactor.
3. **Make the pack survive a phone with no printer** — save-to-phone at equal
   billing with print.
4. **Spaced repetition** — a local reminder at +3 days and +2 weeks firing a
   3-question retrieval check. No push server; that would break the on-device
   promise.
5. **Rewrite score copy** so it never tells a person they failed at surviving.
6. **Surface the replayability that already exists.**

**Abort conditions:** UPL attorney says the scored engine is exposed → stop all
practice-engine work. Any move requiring user data to leave the device → stop.
Any move requiring a model to generate statute text → stop.

---

## Model routing

| Work | Model |
|---|---|
| Legal content, UPL judgment, war-gaming | Capable (Opus-class) — wrong here means someone is arrested |
| Executing a specified move, refactors, tests | Mid (Sonnet-class) — judgment already removed |
| Changelog, formatting, renames | Cheap (Haiku-class) |
| Generating statute text or citations | **No model, ever.** Research + primary source + attorney |

The largest real saving is not model choice but **one mission per session** —
each context switch reloads the world.

---

## The principle this project keeps rediscovering

A tool that promised words could keep you safe would be lying. Hard Mode exists
because the honest thing is that doing everything right does not guarantee the
outcome. The same discipline applies to the machinery: a check that breaks
quietly while still making its claim is worse than one that fails loudly, and a
date that implies a verification nobody performed is worse than no date at all.
