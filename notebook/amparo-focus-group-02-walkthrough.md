# Amparo — focus group 02: step-by-step drop-off walkthrough

Date: 2026-08-02. Run against the build at commit `a60717f` **plus** the
uncommitted changes from this session (`sr_step_viewed`, the stuck-feedback
strip). Twelve simulated members.

**What this is:** a simulation. These are constructed personas reacting to the
product as built, not real users. It is a fast pre-check and **not** a substitute
for item 5 on the roadmap (five real observed sessions). Treated as evidence of
*where to look*, never as evidence of *what is true*.

**Roster:** six carried from `.focus-group/members.md` and the prior run
(Rosa, Marcus, Dana, Luis, Tony, Ana), six added here to cover gaps the saved
roster never represented — a non-driver, the actual teenage end user, a
high-exposure gig driver, a legal-status-secure Spanish-first worker, a rural
gun-owner, a stop survivor with PTSD, and a screen-reader user.

**The flow being walked:** step 0 welcome → 1 state → 2 you → 3 lifelines →
4 print, plus the side modules (practice engine, prep drill, carry card,
checkpoint level, about/doc overlay, reminders, 404).

---

## PART 0 — The purchase question, answered honestly up front

The brief asked what stops each member "from actually purchasing it."

**There is nothing to purchase.** Amparo is free, has no payment integration, no
Stripe, no checkout, and the pricing fork is currently resolved to "stay free
pending the UPL opinion." The `$19 after launch` banner that used to sit on the
state picker was removed in v2.1.0 precisely because it was killing conversion.

So the question is answered two ways below, and they are kept separate on purpose:

- **§4a — what blocks the real conversion** (finishing the flow, printing or
  saving, installing, coming back). This is the live question.
- **§4b — what would block a purchase** if the 99¢-pack fork were ever taken.
  This is hypothetical and is included because the answers are decision-grade for
  that fork.

---

## PART 1 — Member reactions, with exit point

Each member's **exit** is the step where they most likely abandon, stated as a
step number and a reason.

### 🧑 Rosa, 44 — GA, Spanish-first house cleaner, mixed-status family *(carried)*
- **First reaction:** page opens in Spanish now — that lands. The first question she still has is not answered anywhere: *who made this?*
- **Exit: step 0 → 1, on trust.** Not confusion. She reads it, believes it might be good, and closes it to ask someone at church first. She does not come back unless someone vouches.
- **Blocker:** no name, no logo, no institution. The "Who's behind Amparo?" link is a link, not a name she recognises.
- **Flips when:** a parish, legal-aid group, or consulate logo appears. Roadmap item 4.

### 🧑 Marcus, 19 — NY, Black college student, new driver *(carried)*
- **First reaction:** wants the scenarios. Everything before them is tax.
- **Exit: step 1, on relevance.** He is asked for his state before he has been given a reason to care. Practice is the reason and it is four steps away.
- **Blocker:** the whole funnel points at a printer he does not own and will never use.
- **Flips when:** practice is playable cold (item 13) and the artifact lives on his phone (item 9).

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old *(carried)*
- **First reaction:** exactly what she wanted. Texas is now the first tile — a real improvement she notices.
- **Exit: does not exit.** Completes and prints two copies. Still the one clean conversion.
- **Blocker to *evangelism*, not use:** no attorney name. She checks.
- **Flips when:** one licensed Texas attorney is named on the Texas pack. Item 18.

### 🧑 Luis, 27 — TX, DACA, warehouse shift lead, older Android *(carried)*
- **First reaction:** relief the camera step is gone. Reads the privacy banner twice.
- **Exit: step 2, on data.** Being asked for a name and emergency contacts is the moment the on-device promise gets tested. The fields say optional; the *screen* still looks like a form that collects.
- **Blocker:** "every field is optional" is stated but the layout does not behave optional — there is no visible way to move on having entered nothing.
- **Flips when:** a plainly-labelled "skip this — I'll add it later" is as prominent as Continue.

### 🧑 Tony, 61 — GA, retired postal worker *(carried)*
- **First reaction:** skeptical on principle. A card will not stop a bad cop.
- **Exit: step 0.** He needs the honesty first and it is buried behind a bottom link.
- **Blocker:** the single most persuasive thing in the product — the Castile/Wright framing that puts blame on the system — is the least visible thing in the product.
- **Flips when:** that framing leads. Item 11.

### 🧑 Ana, 31 — Phoenix AZ, US citizen, mixed-status household *(carried)*
- **First reaction:** finds Arizona under "Federal rights," below the three cited states.
- **Exit: step 1, on a new problem v2.5.0 created.** The priority reorder is right for Texans and *worse* for the other 47 states: her state is now visibly in the second-class group, under a heading that implies the first group got something she did not. "federal ✓" fixed the wording; the new grouping reintroduced the hierarchy visually.
- **Blocker:** nothing tells her the checkpoint level — built for exactly her I-10 drive — exists and is fully hers.
- **Flips when:** the federal group is framed by what it *covers*, not by what it lacks.

### 🧑 Wes, 38 — Brooklyn, does not drive *(new — the real-user archetype)*
- **First reaction:** curiosity, not need. He wants to see what the paperwork says.
- **Exit: none — but he enters sideways.** Skips the wizard, hunts the pack, finds practice by accident at the end. This is the actual behaviour of the only person who has ever completed the funnel.
- **Blocker:** every screen assumes he drives. Nothing addresses a passenger, a bystander, or someone who just wants to know.
- **Flips when:** the product stops being driver-shaped. Blind spot BS-A — and note that **nothing on the ranked roadmap tests this.**

### 🧑 Devin, 16 — TX, Dana's son *(new — the end user, not the buyer)*
- **First reaction:** his mother opened it. That fact alone costs the product most of its credibility with him.
- **Exit: step 0, on framing.** Anything that reads as a parent-mandated safety lecture is closed instantly. The practice engine would hold him — he would treat it as a game, exactly as the real user did — but he never reaches it.
- **Blocker:** **the buyer and the user are different people and the product only speaks to the buyer.** Dana converts; Devin is who needs the recall. Nothing bridges them.
- **Flips when:** there is a hand-off — something Dana can send that opens directly into a scenario, not into a wizard.

### 🧑 Keisha, 34 — Atlanta, rideshare driver, six stops in three years *(new)*
- **First reaction:** highest real need in the room, lowest patience. She is between fares.
- **Exit: step 2, on time.** Four steps and a form is more than she will spend on a maybe. She has been stopped six times and has never had a printer.
- **Blocker:** no fast path. There is no "give me the four sentences right now" entry.
- **Flips when:** something useful is in her hand inside 30 seconds. The carry card is that object and it is deep inside the flow.

### 🧑 Marisol, 29 — NY, green-card holder, Spanish-first, night shifts *(new)*
- **First reaction:** relieved it is in Spanish. Then unsettled by the immigration content.
- **Exit: step 4 / checkpoint level, on register.** She is legally secure and the immigration material addresses her as though she may not be. The Spanish reads translated rather than written — correct words, wrong weight.
- **Blocker:** **nobody has ever assessed this Spanish professionally.** Her exit produces no bug report; she simply stops.
- **Flips when:** item 8. This member exists to make that item concrete.

### 🧑 Ray, 58 — rural GA, white, concealed-carry permit *(new — niche expansion)*
- **First reaction:** did not expect this to be for him, and is checking whether it is.
- **Exit: step 1, on identity.** The framing reads as being for someone else. His actual question — how to declare a firearm during a stop without the encounter escalating — is the highest-stakes question a stop can carry and the product does not appear to address it.
- **Blocker:** an audience boundary the product never states. He cannot tell whether he is excluded on purpose.
- **Flips when:** the product says who it is for, plainly. **Do not add firearms guidance to chase him** — that is new legal content, state-by-state, and rule 1 applies.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago *(new — BS-4 made concrete)*
- **First reaction:** the rehearsal premise is physically difficult. She wants the information without the simulation.
- **Exit: practice engine, level 1, within seconds** — and possibly the site entirely. A synthesised officer voice raising in hostility is the exact stimulus she avoids.
- **Blocker:** there is no non-simulated route to the same content. Practice is the hook for everyone else and a wall for her. Hard Mode — designed to be unwinnable — would land on her as confirmation that nothing she does matters.
- **Flips when:** the content is reachable as a plain checklist, and escalation is opt-in rather than the default arc. This is the stress-inoculation seat's concern with a face on it.

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text *(new)*
- **First reaction:** the a11y work from v2.0.0 is real and he notices — labelled fields, focus traps, keyboard-operable drill, 44px targets.
- **Exit: step 1, on the new search box.** v2.5.0 added a filter above a list that now reorders itself into two labelled groups. Whether the result count is announced, and whether the "Fully cited / Federal rights" headings are exposed as structure rather than styling, is **unverified** — the audit that shipped it checked positions and filtering, not announcements.
- **Blocker:** unknown, and unknown is the finding. **RECON NEEDED**, not an asserted defect.
- **Flips when:** the picker is tested with an actual screen reader.

---

## PART 2 — Step-by-step drop-off matrix

Who is most likely to leave where, and the dominant reason at each step.

| Step | Leaves here | Dominant reason |
|---|---|---|
| **0 — Welcome** | Rosa, Tony, Devin | Trust and framing, not usability. Nobody vouches for it; the honesty that would earn Tony is buried; the framing that would keep Devin is absent. **Three of twelve leave before the picker on trust alone.** |
| **1 — State** | Marcus, Ana, Ray, Omar | Relevance and identity. The v2.5.0 fix solved *findability* — TX/GA/NY at positions 1–3, search, no scroll trap — and did not touch *why should I care yet*. Two new problems it introduced: the two-group layout makes 47 states visibly second-class (Ana), and the search box's screen-reader behaviour is untested (Omar). |
| **2 — You** | Luis, Keisha | Data and time. Optional is *stated* but not *behaved*: no equally-weighted skip. Keisha will not spend four steps on a maybe. |
| **3 — Lifelines** | — | Nobody exits here in simulation. Least-suspected step; also the least examined — the UX audit explicitly did not re-audit steps 3–4. Absence of findings here is absence of looking. |
| **4 — Print** | Marisol | Terminal step assumes a printer. Marcus and Keisha would exit here too if they reached it — they exit earlier for other reasons, which masks a second failure behind a first. |
| **Practice engine** | Nia | Not a funnel step — a fork. Hook for most, wall for one. Nobody exits it for usability; the one exit is for harm. |

**Pattern worth naming:** the funnel data says everyone leaves at step 1, and it
is *right about the count and wrong about the cause*. Three members leave at step 0
on trust — and because `sr_step_viewed` did not exist until this session, every one
of them was indistinguishable from a step-1 bounce. That is precisely the
ambiguity item 1 was built to remove.

---

## PART 3 — Every defect surfaced, consolidated

Grouped by class. Each is traceable to a member above or to source inspection.

### Trust and credibility
1. No human, organisation, or institution is named anywhere. (Rosa, Tony, Dana)
2. The product's most persuasive content — the Castile/Wright framing — is behind a small bottom link. (Tony)
3. The attorney sign-off scaffold exists and is empty; the product is honest about it, but silence reads as absence rather than as care. (Dana)
4. No statement of who the product is for, so excluded-feeling users cannot tell if exclusion is deliberate. (Ray)

### Funnel and flow
5. State is requested before any reason to care is established. (Marcus, Ray)
6. Practice — the actual hook — is offered last. (Marcus, Wes)
7. No fast path to the single most useful object, the carry card. (Keisha)
8. No hand-off between the buyer and the end user; Dana converts, Devin never arrives. (Devin) — **not previously recorded anywhere in this project.**
9. Four steps is more than the highest-need user will spend. (Keisha)

### Step 1 specifically — including two regressions from v2.5.0
10. The two-group layout ("Fully cited" above "Federal rights") makes 47 states visibly second-class; a wording fix from v2.1.0 was partly undone by a layout change in v2.5.0. (Ana)
11. The search box's screen-reader behaviour is untested — result counts, group headings as structure. **RECON, not asserted.** (Omar)
12. Nothing signals that the checkpoint level covers federal-only states fully. (Ana)

### Step 2 specifically
13. "Optional" is stated but not behaved — no skip control at the weight of Continue. (Luis)
14. A form-shaped screen tests the privacy promise at exactly the moment it is least proven. (Luis)

### Terminal step and artifacts
15. The flow terminates in a printer. (Marcus, Keisha, Marisol)
16. AirPrint path unverified — asked for by name by the one real user.
17. Carry card is buried; it is the object most users actually want.

### Content and language
18. Spanish has never been professionally assessed; failure is silent by construction. (Marisol)
19. Immigration content addresses status-secure Spanish speakers as though they were not. (Marisol)
20. Checkpoint level — highest-consequence content in the product — has never been reviewed by an immigration attorney.

### Harm and accessibility
21. No non-simulated route to the content for users who cannot tolerate rehearsal. (Nia)
22. Hard Mode's unwinnable design has no gating check against a first-time or vulnerable user reaching it cold.
23. Escalating hostility is the default arc, not an opt-in.

### Machinery and honesty
24. Headline privacy claim is unqualified; the voice-transcription exception is disclosed only at feature level.
25. Georgia has no CI-reachable statute source; one global freshness date implies uniform checking that does not happen.
26. Steps 3–4 have never been audited.

---

## PART 4a — What actually blocks conversion (the live question)

Ranked by how many members it blocks.

1. **Nobody vouches for it.** Blocks Rosa, Tony, Dana's advocacy, and half of Marisol. The cheapest fix on the whole list and it is not a code change. → item 4.
2. **The reward is offered last.** Blocks Marcus, Wes, Devin, Keisha. → items 13, 11.
3. **The artifact requires hardware most of the audience lacks.** Blocks Marcus, Keisha, Marisol. → item 9.
4. **The product does not say who it is for.** Blocks Ray, costs Wes and Devin. → BS-A, untested by any ranked item.
5. **Trust is tested at step 2 before it has been earned at step 0.** Blocks Luis. → items 12, 7.

## PART 4b — What would block a purchase, if the 99¢ fork were taken

Hypothetical. Decision-grade for that fork, and the answer is worse than the
transcript's optimism suggested.

- **Luis: hard no.** Has the money, will not leave a payment record on a police-and-immigration app. Unchanged from the saved roster.
- **Marisol: hard no**, same reason, and she is legally secure — meaning the payment-trail objection is **not confined to undocumented users**. This is new and it matters: the objection is about the *category of product*, not the buyer's status.
- **Rosa: no.** $19 is a real decision and 99¢ is not the barrier — a card is.
- **Marcus, Devin, Keisha: no** at any price for a printable, yes for free.
- **Dana: yes**, trivially. **Ray: yes** if it addressed him. **Wes: yes** — he proposed it.
- **Nia: irrelevant** — she has already left.
- **Net: roughly 3 of 12 would pay, and the three hardest noes are the three members with the greatest need.** Charging for the pack sells to the people who need it least. That is the same conclusion the earlier fork analysis reached, now with a count behind it and one new fact: the payment-trail objection survives legal status.

---

## PART 5 — Group read

**Consensus signal.** 1 clean yes (Dana). 4 maybe (Rosa, Tony, Luis, Ana). 6 no
as built (Marcus, Devin, Keisha, Marisol, Ray, Nia). 1 sideways (Wes — engages
deeply, is not the target). **The single yes is the only member who owns a
printer and does not need the product.**

**Biggest objection, by count:** nobody vouches for it. Four members trip on it
and it is the only blocker that no code change can solve.

**Highest-leverage fix:** one named organisational endorsement, displayed on the
first screen. It moves Rosa, Tony, and Marisol, strengthens Dana into an
advocate, and doubles as the distribution channel. Already ranked item 4; this
run raises the count of members it unblocks from three to four.

**Second-highest, and cheaper:** lead with the Castile/Wright honesty. It costs a
layout change, it is already-reviewed copy, and it is the one thing in the
product that earns the trust the endorsement would otherwise have to buy.

**Who this is NOT for.** Ray, without adding firearm-declaration guidance —
which is new state-by-state legal content and is refused under rule 1. And Nia,
unless a non-simulated route exists; chasing her with a softened rehearsal would
weaken Hard Mode for everyone it works on. State the boundary; do not chase.

**What this run adds that no prior document contained:**
- The **buyer/user split** (Dana → Devin). Nobody had noticed the converting persona is not the person who needs the recall.
- **v2.5.0 introduced two regressions** while fixing a real problem: second-class visual grouping for 47 states, and untested screen-reader behaviour on the new search box.
- The **payment-trail objection is status-independent** (Marisol), which weakens the 99¢ fork further than the prior analysis did.
- **Three of twelve leave at step 0**, which the funnel could not previously distinguish from a step-1 bounce — the exact gap `sr_step_viewed` now closes.

**Confidence.** Low-to-moderate, by construction. Simulated members cannot be
surprised, and every real finding in this project so far has come from someone
being surprising. Item 5 — five observed real sessions — remains the thing this
document is a cheap substitute for.
