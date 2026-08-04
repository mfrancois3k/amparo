# Amparo — UPL engagement memo (sendable)

**To:** prospective regulatory / unauthorized-practice-of-law counsel
**From:** Michael Francois, Amparo (amparohq.com)
**Date:** 2026-08-02
**Re:** Scope-of-engagement request — whether a scored rehearsal feature
constitutes unauthorized practice of law

This memo is written to be sent as-is. It describes the product mechanically so
counsel can price and answer without a discovery call, states the questions as
yes/no propositions, and states explicitly what is **not** being asked.

---

## 0. What we need, in one paragraph

Amparo is a free, no-account, offline-capable web app that rehearses drivers for
a traffic stop before it happens. One component — a **scored practice engine** —
takes a specific user's chosen or typed words and tells them whether that choice
was the safer one. We need a written opinion on whether that component is
unauthorized practice of law in one or more U.S. states, and if so, what
mechanical changes would move it outside the definition. We are **not** asking
for review of any statute or legal citation in the product; that is a separate,
later, per-state engagement.

**We would rather learn the answer is "yes, exposed" now than build four more
features on top of it.** A negative answer is a useful deliverable.

---

## 1. What the product is

- Single-file static HTML web app, ~436 KB. No server, no database, no accounts,
  no login, no payment, no analytics of user-entered content.
- Bilingual English / Spanish.
- **Free today, and free in every version you will be shown.** There is no
  payment integration anywhere in the codebase and none is deployed. We are,
  however, actively considering charging a one-time fee in future, and Q9 below
  asks you about that directly. We flag it here rather than burying it: an
  earlier draft of this memo told you no charging was planned at all, which is
  no longer accurate and we did not want you to rely on it.
- All user-entered data (name, emergency contacts, chosen state) stays in the
  browser's local storage on the user's own device. Nothing is uploaded.
- Distributed at https://www.amparohq.com/. Not marketed as legal advice; not
  affiliated with any bar association, legal aid organization, or law firm.
- Currently **no attorney has reviewed any part of it.** The product carries a
  per-state attorney sign-off scaffold that is empty, and displays no attorney's
  name anywhere. We are not claiming review we do not have.

The product has two user-facing halves. **Only the second is the subject of this
engagement.**

### Half A — the reference pack (NOT the subject of this memo)
A printable one-page card summarizing rights during a stop, plus the user's own
emergency contacts. Content is comparable to what the ACLU and similar
organizations publish nationally. Three states (Texas, Georgia, New York) carry
cited state statutes; the other 47 states and D.C. display only a federal floor.

### Half B — the scored practice engine (THE SUBJECT OF THIS MEMO)
Described mechanically in Section 2.

---

## 2. Precise mechanical description of the scored practice engine

We are describing implementation, not marketing, because the legal question
likely turns on mechanics.

### 2.1 Structure
- **Six levels.** Each level is a fixed, hard-coded sequence of "beats." A beat
  is one exchange in a simulated roadside stop (e.g. the officer asks for
  license and registration).
- Levels 1–4 are ordinary stop scenarios of escalating officer hostility.
  Level 5 is a "hard mode" that is designed **not to be winnable** — the
  scenario goes badly even when the user answers correctly. Level 6 is an
  immigration checkpoint scenario.
- Later levels are gated behind earlier ones and displayed as locked.

### 2.2 All content is a static, pre-authored bank — nothing is generated
This is the single most important mechanical fact. There is **no language model,
no generative AI, and no runtime text generation anywhere in the product.**

- Officer dialogue is drawn from a fixed bank of roughly 45 authored variants
  across the beats, plus roughly 10 "curveball" rephrasings.
- Every curveball changes only the *question's wording*; each one resolves to an
  already-authored answer. The set of correct answers is closed and finite.
- The code carries this as an explicit design constraint, quoted from the source:
  *"deliberately NOT runtime-generated: a lawyer can sign a static bank, never an
  LLM improvising police dialogue."*

**Consequence for review:** the complete corpus a reviewer would need to read is
finite, static, and printable. It does not change between users or between runs.

### 2.3 What the user does — three input modes
1. **Two-option choice.** Each beat presents exactly two pre-written options: one
   pre-labeled correct, one pre-labeled a plausible common mistake. The user taps
   one.
2. **Typed answer.** The user types an answer in their own words into a text box.
3. **Spoken answer.** The user speaks; the browser's own speech-recognition
   service produces a transcript.

### 2.4 How the engine evaluates the user — this is the crux
- **For the two-option choice:** the response is a lookup. Each option is
  pre-labeled good or bad by the author, and each has a pre-written coaching
  line. Nothing is computed about the user.
- **For typed and spoken answers:** the engine performs **lexical keyword
  matching only.** It extracts the quoted key phrases from the pre-authored model
  answer, normalizes both sides (lowercase, strip accents and punctuation), and
  checks how many of the model answer's words longer than three characters appear
  in the user's text. If at least half match, the answer is marked good.
- There is **no semantic analysis, no intent detection, no classifier, and no
  model of the user's situation.** The engine cannot tell what the user meant. It
  can only tell how much their wording overlaps a fixed target string.
- The result is displayed as green ("good") or amber ("try again"). By design
  there is **no fail state** — the amber path invites a retry and never asserts
  the user was wrong about their own circumstances.

### 2.5 What is scored and where the score lives
- A per-level best result is stored in the browser's local storage on the user's
  device. It is never transmitted. It is not associated with any identity.
- The user sees a per-level result (e.g. "4 of 6").

### 2.6 Where state law enters the practice engine
Exactly one beat is state-specific: the beat covering whether to sign a citation
carries a per-state override for Texas, Georgia, and New York. Every other beat
in the practice engine is state-agnostic and rests on federal constitutional
material. The engine runs normally when no state has been selected.

**We flag this because it may be dispositive:** if the answer turns on whether
guidance is tailored to a particular jurisdiction, the practice engine is
tailored at exactly one beat, and that beat is separable.

### 2.7 Safety interception
Before any answer is evaluated, the typed or spoken text is checked against a
short list of crisis phrases in both languages. On a match, the engine suppresses
scoring entirely and displays a crisis support line instead. We mention this
because it is the one place the product responds to the *content* of what a user
says rather than its overlap with a target string.

### 2.8 Disclaimers presently in the product
The product states it is free, that nothing the user enters leaves their phone,
and that it is not reviewed by attorneys. **We do not assume any of this is
legally sufficient** — assessing sufficiency is part of what we are asking for.

---

## 3. The specific legal question, and why we are asking now

Our own reading — which we want confirmed or corrected, not flattered — is:

**Upsolve, Inc. v. James**, No. 22-1345 (2d Cir., decided 9 Sep 2025), as we
understand it, reversed a district court injunction and held that New York's
unauthorized-practice-of-law statutes are content-neutral and survive
intermediate scrutiny — meaning a state may bar free, nonprofit, well-intentioned
"what to say" guidance as UPL, notwithstanding the First Amendment.

We also note **Janson v. LegalZoom** as, in our lay reading, drawing a line at
responsive, person-specific guidance rather than static published information.

And we note **Tex. Gov't Code § 81.101(c)**, which we understand to exempt
certain software from the statutory definition of the practice of law where the
product conspicuously states it is not a substitute for an attorney — a
Texas-only provision with, as far as we know, no general national equivalent.

*(Citations above are reproduced from our own working notes for context only. We
are not asserting them as accurate and expect counsel to verify them. We do not
generate legal citations by any automated means.)*

**Why this matters to us commercially:** the Second Circuit covers New York, one
of our three cited states. And four of the six items on our product roadmap build
directly on the practice engine. We are holding that work until we have an answer.

---

## 4. The questions — framed for a yes/no answer

Please answer each with yes / no / it depends, followed by your reasoning. We
expect several to be "it depends," and the conditions are the valuable part.

1. Does the **two-option choice mode**, standing alone — a static pre-authored
   pair of options with a static pre-authored coaching line — constitute the
   practice of law in any state you would flag?

2. Does the **typed / spoken free-answer mode**, evaluated by lexical keyword
   overlap against a fixed target string, cross a line that the two-option mode
   does not? Specifically: does the fact that the user supplies their own words
   and receives an individualized good/retry result make this "responsive,
   person-specific guidance" within the meaning of the Janson line of reasoning,
   even though no analysis of the user's actual circumstances occurs?

3. Does displaying a **numeric score** — as distinct from displaying the same
   coaching content without a score — materially change the answer to (1) or (2)?

4. Does the **one state-specific beat** (signing a citation, overridden for TX /
   GA / NY) materially change the answer? Would removing that override, making
   the practice engine entirely state-agnostic, move it outside the definition in
   states you would otherwise flag?

5. In which specific states, if any, would you advise that the practice engine as
   described should **not be offered at all** in its current form?

6. Does **New York specifically**, post-*Upsolve*, present exposure for this
   product as described?

7. Would a **disclaimer** — of any wording you would recommend — be sufficient to
   move the practice engine outside the UPL definition in the states you flag, or
   does it only evidence intent without changing the conduct?

8. Does **Tex. Gov't Code § 81.101(c)** cover this product in Texas as described,
   and if so, what exactly must the product display to fall within it?

9. Does the fact that the product is **free today, with no payment mechanism
   deployed**, materially affect the analysis?

   And, separately, because our thinking has changed and we would rather you
   answer the real question than a stale one — we are now considering charging
   for **scripts tied to the practice scenarios**, i.e. content on the practice
   side, not only the printable reference pack. Please address each of these:

   a. Charging a one-time fee for the **printable pack only**, with the practice
      engine remaining entirely free.
   b. Charging a one-time fee for **practice-scenario scripts** — the words the
      user rehearses — while the scenarios themselves remain free to play.
   c. Charging for **access to the scored practice engine itself**.

   If these differ in your analysis, we need to know which line is safe to
   cross, because it determines what we build. Our present instinct is that (c)
   is the most exposed and (a) the least, but that is a guess and we would
   rather be told.

9b. Does forming a **501(c)(3) nonprofit** change your answer to any part of
    Q9? We ask because *Upsolve* was itself a nonprofit and lost, so we do not
    assume nonprofit status is protective — but we would like that confirmed
    rather than assumed.

10. Does the product's **bilingual (Spanish) delivery** to a population that
    includes non-citizens raise any distinct regulatory issue you would flag —
    immigration-practice rules, notario-fraud statutes, or otherwise?

11. Is there a **structural change** — separating the practice engine into a
    distinct offering, changing who publishes it, partnering with a legal-aid
    organization, or otherwise — that you would recommend as materially reducing
    exposure at reasonable cost?

12. What is your view on our **personal exposure** as an individual operator, as
    distinct from exposure of an entity, and would you recommend forming one?

---

## 5. What we are explicitly NOT asking for

Stating this to keep the engagement small, priced, and fast:

- **We are not asking you to review, verify, correct, or sign off on any statute,
  citation, or statement of law in the product.** That is a separate per-state
  engagement we expect to run later with per-state licensed counsel, and we
  estimate it at a different order of cost entirely.
- We are not asking for litigation, filings, or representation.
- We are not asking for entity formation, tax, or IP work at this time (question
  12 asks only for your view, not the work).
- We are not asking for a review of the printable reference pack (Half A above)
  unless you believe it is exposed, in which case please say so unprompted.
- We are not asking for marketing, privacy-policy, or terms-of-service drafting
  at this time.

## 6. What a complete deliverable looks like to us

A written memo answering Section 4, of whatever length you think the questions
deserve, that lets us do one of three things without a follow-up call:

- **Ship** the practice engine and continue building on it, or
- **Modify** it along a specific mechanical change you name, or
- **Stop** and re-scope the product.

## 7. Practical

- Budget expectation for this engagement: roughly $1,000–$2,000. If that is
  materially off for the scope above, tell us what is realistic rather than
  scoping down the questions.
- Timeline: no emergency. There is no pending claim, complaint, demand letter, or
  regulatory contact of any kind. We are asking before building further.
- Materials available on request: the complete static content bank (finite and
  printable), the live product, and this memo's source repository.
- Contact: Michael Francois — mfrancois3k@gmail.com — amparohq.com

---

## Appendix — facts we would not want you to learn late

Stated up front because a surprise later costs more than a disclosure now:

- No attorney has reviewed any content in this product. The attorney sign-off
  display exists in the code and is empty.
- Three states carry cited state statutes; 47 states and D.C. display only
  federal material, labeled as such.
- The product has had approximately 72 visitors in the last 30 days and one
  known user who completed the full flow. This is pre-traction, not a scaled
  service.
- The immigration checkpoint level was built on settled Supreme Court authority
  and federal statute and has never been reviewed by an immigration attorney. If
  you believe that level warrants separate immigration-specialist review, please
  say so.
- **We are actively considering charging money for part of this product** (Q9).
  No payment code is deployed and none will be enabled before we have your
  answer, but we are not able to tell you charging is off the table, and we did
  not want that to reach you as a late surprise.
- Two additional practice scenarios and a separate "police at your door" module
  are **built in the codebase but disabled behind feature flags**. The two
  scenarios' officer lines are unwritten placeholders. The door module carries
  a full **drafted, unreviewed** script (authored 2026-08-04, marked DRAFT in
  the source) — it is not user-reachable, it ships to no one until reviewed,
  and it is not part of what we are asking you to assess in this engagement.
  We mention it so a code review does not surprise you.
- We have deliberately excluded from the product any question of whether a local
  officer may act on immigration status, because that law is actively moving in
  our covered states.
