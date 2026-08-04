# Gemini image prompts — Amparo mockup generation (16×)

Paste each block into Gemini as-is. Written to correct the three problems in the
previous mockup set (`Downloads/963ebb91cd3bc0a3`): it was dark-themed when the
product is warm cream, desktop-wide when the product is phone-first, and used
photorealistic officer faces the design system deliberately avoids.

**Shared style block — prepend to every prompt below:**

> Design style: warm cream background (#FAF6EE), deep navy (#1B2A4A) text and
> primary buttons, a single gold accent (#E8B84B) used sparingly, soft
> parchment-tan borders (#E5E0D4), 14–18px rounded corners, generous white
> space, system sans-serif (SF Pro / Segoe UI). Calm, trustworthy,
> paperwork-like — the opposite of a cyberpunk security dashboard. No dark mode.
> No photorealistic police officers, no stock photography of police, no faces.
> Use simple flat illustration or abstract colour blocks where imagery is
> needed. Mobile-first: render as a single narrow phone screen, 9:19.5 aspect
> ratio, not a tablet or desktop layout. All text must be real, legible English —
> no lorem ipsum, no garbled or invented words.

---

## Prompt 1 — The free core, one screen

> [shared style block]
>
> A mobile app screen for "Amparo", a know-your-rights rehearsal app. Top: a
> slim cream banner reading "Your name, contacts and documents never leave your
> phone — no account, no upload." Below it a 5-step progress stepper: State ✓,
> You ✓, Lifelines ✓, Print ✓, and "Practice" as the current active step in
> navy. Main heading in a serif-adjacent weight: "Now rehearse it." Subhead:
> "The pack is in your glovebox. This is the part that has to be in your head."
> Below: two pill tabs side by side — "Traffic stop" selected in white on a tan
> track, "At your door" unselected. Under the tabs a thin progress row reading
> "2 of 4 done" with a green fill bar half complete. Then a 2-column grid of
> four cards: "Calm stop" and "Irritated officer" both with green borders, pale
> green fill and a small green "DONE" pill; "Ordered out" plain cream with a ▶
> and the word "Start"; "Hard mode" greyed with a padlock and the caption
> "Finish the first three to unlock". A fifth wider card below reads
> "Checkpoint". Bottom: an outlined navy button "Back to my pack".

---

## Prompt 2 — Inside a scenario, with the mute control

> [shared style block]
>
> A mobile app screen showing a police-stop rehearsal in progress. Top left a
> small back arrow, top centre a slim label "Hard mode · 3 of 4". A muted,
> heavily abstracted dusk-road illustration as a soft background wash — no
> people, no vehicles, no faces, low contrast so text stays readable. Centre: an
> italic scene-setting line "Late night. Bright light fills your mirror." Below
> it a grey speech bubble labelled "Officer" containing "License and
> registration. Slowly." Beneath that, two stacked full-width response options
> in cream cards with navy text — the first outlined in green, the second plain.
> Below them a text input with placeholder "…or type your answer" and a small
> microphone icon. At the bottom a row of small controls: a pill button reading
> "🔇 Silence the officer", then "Voice:" with two small toggle chips "Man" and
> "Woman", the first selected. Everything calm and low-arousal.

---

## Prompt 3 — Print screen, one primary action

> [shared style block]
>
> A mobile app screen headed "Your pack is ready." Below the heading a vertical
> stack of four small page thumbnails with captions: "Window card", "Your
> rights", "State rules", "Wallet card" — rendered as simple line-art page
> outlines, not photographs. One large gold primary button reading "🖨 Print or
> save as PDF". Directly beneath it, in small muted text, a collapsed
> disclosure row: "📖 How do I save it as a PDF instead? ▾". Below that a quiet
> line of secondary text-only links: "Print for another family member",
> "Reprint reminder", "Start over". Only ONE gold button anywhere on the screen
> — every other action is outlined or plain text. Plenty of breathing room
> between the primary button and the secondary links.

---

## Prompt 4 — The offer, after a completed scenario (paid path)

> [shared style block]
>
> A mobile app screen showing a completed rehearsal result. Top: a row of four
> squares — three green, one amber — and beside them "4 of 5". Heading:
> "Level complete." A short line of muted coaching text below it. Then, clearly
> separated by a divider and NOT a popup or modal, an inline offer card with a
> soft blue-grey background and thin border: small label "OPTIONAL", heading
> "New York script pack — $3.99", one line of body text "Every line, printed and
> folded for your glovebox. The practice stays free.", a navy outlined button
> "See what's inside", and a small dismissible ✕ in the corner. Below the offer
> card, a plain full-width navy button "Try the next scenario". The offer must
> read as secondary to the free action, never blocking it. No urgency language,
> no countdown, no red.

---

## Prompt 5 — Retrieval, on a new phone

> [shared style block]
>
> Two mobile app screens side by side against a plain cream backdrop, connected
> by a thin arrow.
>
> LEFT SCREEN: the Amparo landing page. Top banner "Your name, contacts and
> documents never leave your phone — no account, no upload." Large heading
> "Practice the stop before it happens." Four short benefit lines each with a
> small flat icon: a speech bubble, a map pin, a printer, a padlock. One gold
> button "Build my pack", one outlined button below it "🚔 Practice a full stop
> — 2 minutes". In the very top-right corner of the header, small and
> unobtrusive, a text link "🔑 Retrieve my pack".
>
> RIGHT SCREEN: a focused modal over a dimmed version of the same page. Modal
> heading "Retrieve my pack". Body text "Enter the 8-character code from your
> receipt." A single wide input showing a monospace placeholder formatted like
> "XXXX-XXXX". A navy button
> "Unlock". Below it a divider and a separate quieter section headed "Restore my
> personal details" with the line "Different from the code above — this one
> rebuilds your contacts on this device, and never touches our servers." and a
> small outlined button "Paste restore code". The two mechanisms must look
> visibly distinct, not like one form.

---

## Prompts 6–9 — the "final boss" module's 4 supporting components

Grounded in the 10-persona reaction to the intense-scenario concept and the
Mobbin references pulled against it (Sora's Content Advisory, Google Arts &
Culture's flashing-effects modal, Medium/eBay's Preview state, ElevenReader's
synced transcript). These are the SHAPE of the components, not final copy —
no scenario dialogue is specified anywhere below, deliberately: that content
doesn't exist yet and nothing here should look like it's showing real lines.

## Prompt 6 — The content gate, before the module starts

> [shared style block, with one deliberate exception: this single screen may
> use a deeper navy fill (#121e38) as the full background instead of cream —
> the one place in the product where a heavier register is earned. Do NOT use
> black, do NOT use a stock photo, do NOT use a distressed/horror aesthetic.
> Still calm, still typographic, still the same navy/gold/cream family — just
> inverted for this one gate. Everywhere else in the app stays cream.]
>
> A full-screen mobile advisory, text-only, no imagery. Small gold eyebrow
> label "FINAL SCENARIO". Heading in large cream serif-weight type: "Before
> you start this one." Body copy in a lighter cream/grey: "This scenario is
> more intense than the others — a hostile encounter, performed with real
> weight. There's no score here, because this was never about winning. It's
> about staying calm enough to remember what to say — so if this ever
> happens for real, you get through it and get home." A thin divider. Below it, two
> side-by-side outlined buttons of EQUAL visual weight (neither is gold/
> primary): left button "⚙ Adjust sound first" with a small speaker-mute
> icon, right button "Start when ready". Small text link beneath both,
> low-contrast: "Not now — back to the hub".

## Prompt 7 — Preview mode, reachable before the real attempt

> [shared style block]
>
> A mobile app screen showing the practice hub's module grid (reuse this
> layout: two pill tabs "Traffic stop"/"At your door" at top, a "{n} of 4
> done" progress bar with green fill below them). One card in the grid is
> visually distinct from the rest — labeled "🌒 Final Scenario" with a small
> tag beside the title reading "PREVIEW AVAILABLE" in a soft blue-grey pill
> (not gold, not green — a third, clearly informational color distinct from
> the done/locked states already used elsewhere). Inside that card, below the
> title, a ghost-outlined button "▶ Preview — no score, no record" sitting
> above the normal "Start" button, visually secondary to it (smaller, lighter
> border) so it reads as an option, not the main action.

## Prompt 8 — Synced transcript under the officer line

> [shared style block]
>
> A mobile scenario screen, same shell as the existing practice screens: back
> arrow top-left, a small label "Final Scenario" top-center, soft abstracted
> background wash. An officer speech bubble containing a few words with the
> FIRST three words highlighted in a soft gold background (mid-sentence
> playback position), the remaining words in normal grey-on-white — a
> karaoke-style sync highlight, not a static caption block. Directly below
> the bubble, small italic bracketed stage direction text in muted red-brown,
> distinct from the dialogue itself: "[voice raised, clipped]" — signaling
> tone to someone who cannot hear it. Below that, the same two response
> options and text input as the other scenario screens, unchanged. A small
> toggle top-right reading "Transcript" in the "on" state.

## Prompt 9 — The debrief: not a win/lose frame at all

Revised after a real editorial correction: the first draft of this screen
said "you didn't win this one — that was the point," which still frames the
scenario as a contest and just negates the outcome. That's wrong. There was
never a win condition. The scenario exists so the calm and the words are
already there if this ever happens for real — nothing about "winning" it.

> [shared style block]
>
> A mobile results screen with NO score grid, NO green/amber squares, no
> point total anywhere — deliberately sparse compared to a normal results
> screen. Centered, unhurried layout. A small steady outlined icon — a single
> dot, a compass, or two open hands — NOT a flame, NOT a trophy, NOT a
> checkmark; nothing that reads as danger or victory. Heading, plain and
> personal, not triumphant: "I hope you never need this." Body text below,
> generous line height: "If it ever happens for real, the goal was never to
> win the exchange. It's to stay calm, get through it, and get home. Your
> pack has the words — your only job was to remember them." One single
> outlined button below, no gold: "Back to the hub". Nothing else on the
> screen — the emptiness is deliberate, not a loading state.

---

## Prompts 10–16 — the TWO final scenarios

Superseding the single "final scenario" assumed in prompts 6–9. Per
`wargames/10-final-boss-module-scaffold.md` §0, the two reference videos
measured as **opposite cadence mechanics**, so they became two sequenced
scenarios rather than one:

| | Scenario 5 — "The long wait" | Scenario 6 — "It doesn't stop" |
|---|---|---|
| Cadence | intervals **widen** (1.6→3.3→6.2s) | intervals **contract** (1.5→2.0→0.9→0.7s) |
| Pressure from | silence, an off-screen decision | repetition that obeying does not stop |
| Lesson | you control your record, not the outcome | compliance does not reliably de-escalate |

Prompts 6 and 9 still apply as the *generic* gate and debrief shapes; 11/13
and 12/16 below are the scenario-specific versions that replace them.

**A rule for every prompt below — this matters more than the visuals.** The
officer's actual lines do not exist yet: they are `TODO_ATTORNEY` placeholders
until a lawyer writes them. So **every mockup must render the officer's speech
bubble containing the literal bracketed text `[ATTORNEY-REVIEWED LINE]`**, in
a monospace font, in muted grey — never invented dialogue. This is deliberate:
it keeps the mockup self-documenting, and it makes it impossible for anyone
(including us, later) to mistake a mockup for approved legal content.

## Prompt 10 — The hub, showing both finals in sequence

> [shared style block]
>
> A mobile practice-hub screen. Two pill tabs at top: "Traffic stop" selected,
> "At your door" unselected. Below them a progress row "2 of 4 done" with a
> green half-filled bar. Then a 2-column card grid: "Calm stop" and "Irritated
> officer" both green with small "DONE" pills; "Ordered out" plain cream with
> "▶ Start"; "Hard mode" greyed with a padlock. Below the grid, a full-width
> plain card "Checkpoint". Then a thin horizontal divider with small centered
> muted text: "When you're ready for the hardest two". Below that divider, two
> full-width cards stacked vertically, visually heavier than the grid above —
> slightly darker cream fill, thicker border: first card "🌙 The long wait"
> with subtitle "No score. Nothing you say changes it." and an outlined
> "▶ Start" button; second card "🌑 It doesn't stop" rendered clearly LOCKED —
> greyed, padlock icon, subtitle "Finish The long wait first". The two must
> read as a pair and as separate from the numbered ladder above them.

## Prompt 11 — Scenario 5 gate ("The long wait")

> [shared style block, with the same deliberate exception as prompt 6: this
> gate screen uses a deep navy fill (#121e38) instead of cream. No black, no
> stock photo, no horror aesthetic.]
>
> A full-screen mobile advisory, text-only. Small gold eyebrow label
> "SCENARIO 5 OF 6". Large cream heading: "This one is mostly waiting." Body
> copy in lighter cream/grey: "The officer will not raise his voice. He will
> ask, then go quiet, then ask again — and the gaps get longer each time.
> There's no score. Nothing you say will change how it ends. What you're
> practising is staying calm in the silence." A thin divider. Two side-by-side
> outlined buttons of EQUAL weight, neither gold: left "⚙ Adjust sound first"
> with a small speaker-mute icon, right "Start when ready". Below both, a
> low-contrast text link: "Not now — back to the hub".

## Prompt 12 — Scenario 5's signature beat: the silence

> [shared style block]
>
> A mobile scenario screen showing a deliberate WAITING state. Top-left back
> arrow, top-center small pill label "The long wait · 3 of 6". Soft, very
> low-contrast abstracted night-road background wash — no people, no vehicles,
> no faces. In the upper area, a grey officer speech bubble containing the
> literal monospace text "[ATTORNEY-REVIEWED LINE]" in muted grey. Below it,
> generous empty vertical space — at least a third of the screen deliberately
> blank. In the center of that empty space, a small, soft, slowly-pulsing dot
> (a single quiet dot, NOT a spinner, NOT a countdown timer, NOT a progress
> ring — nothing that implies a deadline). Beneath the empty space, small
> italic muted text: "He hasn't said anything yet." The two response option
> buttons sit at the bottom, present and fully tappable but visually quiet.
> The emptiness IS the design — do not fill it.

## Prompt 13 — Scenario 6 gate ("It doesn't stop")

> [shared style block, same navy exception as prompt 11]
>
> A full-screen mobile advisory, text-only. Small gold eyebrow label
> "SCENARIO 6 OF 6 — THE LAST ONE". Large cream heading: "You will do
> everything right." Body copy in lighter cream/grey: "This one is different
> from the last. You'll comply. You'll say the right words. He'll keep going
> anyway, and he'll speed up. That's not you failing — it's the thing this
> whole app exists to prepare you for. No score, no way to win it. Just the
> words, already in your mouth." A thin divider. Two side-by-side outlined
> buttons of EQUAL weight, neither gold: left "⚙ Adjust sound first", right
> "Start when ready". Below both, low-contrast link: "Not now — back to the
> hub".

## Prompt 14 — Scenario 6's signature beat: contracting repetition

> [shared style block]
>
> A mobile scenario screen showing REPETITION made visual. Top-left back
> arrow, top-center small pill label "It doesn't stop · 3 of 6". Soft
> low-contrast abstracted background wash, no people or faces. The key visual:
> FOUR identical grey officer speech bubbles stacked vertically, each
> containing the same literal monospace text "[ATTORNEY-REVIEWED LINE]" in
> muted grey — and the vertical GAP between them shrinks going down the stack
> (roughly 20px, then 14px, then 8px, then 4px), so the bubbles visibly crowd
> together toward the bottom. The topmost bubble is slightly faded, the
> bottom-most fully opaque. To the right of the stack, a thin vertical line
> with small tick marks that also compress downward — a subtle cadence ruler.
> Below the stack, small italic muted text in a soft green: "You already did
> what he asked." Then the two response option buttons, normal styling. The
> compression of the stack is the entire point of this screen.

## Prompt 15 — Scenario 5 debrief

> [shared style block]
>
> A mobile results screen, deliberately sparse. NO score grid, NO coloured
> squares, no point total. Centered, unhurried. A small outlined icon of a
> single steady dot or an hourglass laid on its side — NOT a flame, NOT a
> trophy, NOT a checkmark. Heading: "You waited him out." Body text, generous
> line height: "You didn't fill the silence, and you didn't talk yourself into
> anything. That's the whole skill. What happens next was never yours to
> control — your record was." One single outlined button, no gold: "Back to
> the hub". Nothing else on the screen.

## Prompt 16 — Scenario 6 debrief (the last screen in the product)

> [shared style block]
>
> A mobile results screen, the sparsest in the entire app. NO score grid, NO
> squares, no total, no share button, no "next scenario" button. Centered,
> generous vertical spacing. A small outlined icon of two open hands or a
> simple house — NOT a flame, NOT a trophy. Heading, plain and personal:
> "I hope you never need this." Body text: "You complied. You stayed calm. You
> said the words. It kept going anyway — and that was never your fault. If it
> ever happens for real, that's the part to remember: get through it, and get
> home. The pack has the words. You've now said them out loud." Below, one
> single outlined button, no gold: "Back to the hub". Deliberately NO button
> offering another scenario — the pull to immediately replay a second heavy
> scenario is the thing this screen is designed not to create.
