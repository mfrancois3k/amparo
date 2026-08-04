# Amparo — DV clinician engagement memo (sendable)

**To:** prospective domestic-violence clinician / advocate reviewer
**From:** Michael Francois, Amparo (amparohq.com)
**Date:** 2026-08-04
**Re:** Scope-of-engagement request — whether a "police at your door" rehearsal
module is safe to ship to a population that includes DV survivors

This memo is written to be sent as-is. It describes the product mechanically so
you can price and answer without a discovery call.

---

## 0. What we need, in one paragraph

Amparo is a free, no-account, offline-capable web app that rehearses people for
police encounters before they happen. We built a new module — "police at your
door" — and stopped before shipping it, because two specific beats and one
safety mechanism require review we are not qualified to do ourselves. We need
your judgment on whether the module's core lesson is safe to teach to a
population that includes people currently living with an abuser, and if not,
what has to change. **This is a separate, additional gate from our legal
review — a lawyer clearing the module's legal content does not clear this.**

**We would rather learn this module cannot ship as designed than ship it and
be wrong about who's on the other side of the door.**

---

## 1. What the product is

- Single-file static HTML web app, ~436 KB. No server, no database, no
  accounts, no login, no payment, no analytics of user-entered content.
- Bilingual English / Spanish.
- All user-entered data stays in the browser's local storage on the user's own
  device. Nothing is uploaded, nothing is transmitted.
- Distributed at https://www.amparohq.com/. Not marketed as legal or clinical
  advice; not affiliated with any DV organization, shelter, or hotline.
- The door module described below is **built but disabled** behind a code
  flag. It is not visible or reachable by any current user. It stays disabled
  until both this review and a separate attorney review clear it.
- No attorney has reviewed any content in this product yet either — a
  parallel, independent engagement, not a prerequisite to this one.

---

## 2. Precise mechanical description of the module

We're describing implementation, not marketing, because your answer likely
turns on mechanics, not tone.

### 2.1 Structure
Six scripted beats, played in a fixed order, simulating someone answering a
knock at their own door. Every beat is a static, pre-written line — **there is
no language model, no generative AI, and no runtime text generation anywhere
in the product.** The complete script a reviewer would need to read is finite
and printable; it does not change between users.

### 2.2 What the user does
Each beat presents two pre-written response options — one marked correct, one
a plausible mistake — plus an optional type-your-own-words mode scored by
keyword overlap against a fixed model answer. A green square means the chosen
response matched the pre-authored "correct" answer. There is no analysis of
the user's actual situation, ever — the engine cannot tell what's really
happening in the user's home. It can only tell whether their words or choice
matched a script written in advance.

### 2.3 The module's designed thesis
The module trains one behavior across all six beats: **stay behind a closed
door, decline to open it, decline to step outside, repeat the same calm
refusal if pressed.** It is explicitly designed to teach that a small,
seemingly-polite concession — opening the door, stepping out "for a second" —
costs a position that does not come back. That lesson is written to apply
uniformly, once, to every user who plays it.

### 2.4 The specific collision we found before you did
Researching the module, we read published police-academy curriculum (Michigan
MCOLES's officer training manual) stating that when responding to a domestic
violence call, an officer does **not** accept "everything's fine" from
whoever answers, expects denial and minimization, asks to speak to each person
in the residence, and **refuses to leave without speaking to the person
believed to be at risk** — even when told all is well.

Set against our module's thesis, that means: **the module's winning move —
calm, composed, repeated refusal — is the exact presentation published
training tells an officer to read as the assailant's, and not leave on.** We
did not go looking for this. It surfaced in general research on knock-and-talk
encounters, and it stopped us before we wrote a line of dialogue.

We also found, and want to state plainly rather than let you find it first:
domestic-violence-related calls are widely cited as **15 to more than 50
percent of all police calls** (NIJ, repeated in a 2022 peer-reviewed public
health study and elsewhere). If that figure is even roughly right, "we got a
call about this address" — the sentence the whole module is built around — is
not an edge case for this module. It may be closer to the modal one.

### 2.5 Where the module's own logic already tries to protect against this
The engine has an existing safety mechanism, already shipped and in use
elsewhere in the product: a crisis-phrase intercept that, on matching certain
typed or spoken input, suppresses scoring entirely and shows a support
resource instead of a coach line. It currently only catches suicidality-type
phrasing. Our own reading of the research says its trigger surface would need
to be wider for this module — catching things like "my partner called this
in," "they're here right now," "I can't talk" — and we do not know what that
list should contain. **We are not asking a model to write it, and we do not
think we should write it either.**

The engine also has a mechanism for "neither option is a mistake, and we are
not scoring this as a pass/fail" (used elsewhere for a scenario that's
designed to be unwinnable). We think this module's most contested beats may
need that shape instead of a green/amber score, but we want your judgment, not
our guess, on which beats and how.

---

## 3. The specific questions

We are not qualified to answer any of these and are not asking a model to
guess at them either. Please answer as fully as the question deserves —
"it depends, and here's what it depends on" is a complete and useful answer.

1. **The green-square problem.** If someone currently living with an abuser
   plays this module, holds the door, says nothing, and the engine scores it a
   perfect run — has the module just rehearsed them into the behavior that
   ends with an officer leaving and the abuser still inside? Is there any
   version of a *scored* module that avoids this, or does this module's
   central mechanic (a score) need to not exist for at least some beats?

2. **The step-outside beat.** Beat 4 of 6 teaches: never concede your
   position, even for something that sounds like a small courtesy. Our
   research says sight-and-sound separation — getting one person away from
   another — is standard practice on a domestic call, specifically so the
   person who can't speak freely gets a chance to. Does the coaching copy on
   this beat need to name that exception out loud? If so, how, without turning
   a rehearsal app into DV-specific advice it isn't positioned to give? Or
   should this beat not be scored at all?

3. **The second person in the house.** Every line in the module is written in
   the second person singular, addressed to one person, alone, at the door.
   The DV case almost always has at least two people inside, and the one who
   reaches the door is frequently not the one at risk. Does this module need a
   beat, a setter line, or an entirely different framing that acknowledges
   someone else may be listening? Or is that a different module, not a
   modification of this one?

4. **The intercept list.** Described in §2.5. Who should author it, what
   should it catch, and — a dispatch/911 source we read explicitly warns
   against ever teaching a "covert signal" or code phrase, because it doesn't
   travel and can be dangerous if relied on — does that constrain what this
   list is even allowed to do?

5. **Practicing in a shared home.** This module is more likely than any other
   scenario in the product to be rehearsed by someone in the same home as the
   person the scenario concerns, in the next room. We previously removed a
   "quick exit" panic button from an earlier version of this product because
   it didn't reliably clear saved data — we'd rather reconsider building a
   correct one than ship this module without asking whether it's now
   necessary. Does it change your answer to any of the above?

6. **The framing question underneath all of this.** Every other scenario in
   this product has one correct answer. We suspect this one may not — that
   "never open" and "always cooperate" can each cause real, documented harm
   depending on facts the app cannot see, and that the honest design may be to
   not score at least some of this module rather than pick a side. Do you
   agree, and if so, which beats (if any) can still carry a scored right
   answer safely?

7. Is there a **structural change** to the module — a different opening
   framing, a routing question before beat 1, a link out to a hotline instead
   of continuing past a certain point — that you'd recommend instead of, or in
   addition to, changes to individual beats?

8. Should this module exist **at all** as a self-scored rehearsal, or does
   this specific scenario belong in a different shape entirely — informational
   only, routed to a partner DV organization, or something else you'd
   recommend?

---

## 4. What we are explicitly NOT asking for

- We are not asking you to review or write the module's legal content. Every
  line still needs separate attorney sign-off; that is a different engagement
  running in parallel, and neither review substitutes for the other.
- We are not asking for crisis counseling protocols, hotline operations
  consulting, or clinical training design beyond this specific module.
- We are not asking you to review the rest of the product (the traffic-stop
  scenarios) unless something here makes you think you should.

## 5. What a complete deliverable looks like to us

An answer that lets us do one of three things without a follow-up call:

- **Ship** the module as designed (we doubt this is the answer, but we're not
  assuming), or
- **Modify** it along specific changes you name — including "don't score these
  beats" or "add this beat/routing," or
- **Don't ship this module in this shape.** A "no" is a complete and valuable
  deliverable. We would rather have gaps in the product than a module that
  hurts the person it was meant to help.

## 6. Practical

- Budget expectation: we don't have a reference point for this kind of review
  and would rather you tell us what's realistic than have us guess low.
- Timeline: no emergency. The module is code-disabled; nobody can reach it.
  We are asking before it ships, not after something went wrong.
- Materials available on request: the complete draft beat structure (finite,
  currently all placeholder text, printable), our own research notes gathering
  perspectives from law enforcement, 911 dispatch, EMS, child welfare,
  immigration advocates, disability advocates, public defenders, and property
  managers, and this memo's source repository.
- Contact: Michael Francois — mfrancois3k@gmail.com — amparohq.com

---

## Appendix — facts we would not want you to learn late

- No attorney or clinician has reviewed any content in this module. A full
  **draft** script now exists in the code (authored 2026-08-04, marked DRAFT
  and unreviewed in the source, behind the disabled flag): officer lines,
  response options, and coaching lines for all six beats. The two beats
  described in §3 (the reason-for-visit beat and the step-out beat) are
  drafted so that **neither choice is ever marked a mistake** — our own
  research's interim ruling, which your review supersedes. The draft is
  review material, not a decision: it exists so you can mark up something
  concrete instead of authoring from a blank page, and every question in §3
  stands regardless of it.
- The rest of the product (traffic-stop scenarios) is separately awaiting
  attorney review for a different legal question (whether a scored rehearsal
  engine constitutes unauthorized practice of law). That review is unrelated
  to yours and neither blocks the other from proceeding.
- We are considering charging a small one-time fee for parts of this product
  in the future. No payment code exists yet, and nothing about this module's
  design is being driven by monetization — we mention it only so it doesn't
  reach you as a surprise.
- We built this module's structure by starting from three marketing videos
  from a single law firm's YouTube channel, then deliberately went and sought
  out law enforcement training material, 911/EMS/child-welfare/immigration/
  disability/public-defender/property-management perspectives specifically to
  find what the marketing source would miss. The DV collision in §2.4 is what
  that process surfaced. We are telling you this so you know the process that
  produced the concern, not just the concern itself.
