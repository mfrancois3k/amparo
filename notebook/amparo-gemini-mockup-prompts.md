# Gemini image prompts — Amparo mockup generation (5×)

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
> heading "Retrieve my pack". Body text "Enter the 12-character code from your
> receipt." A single wide input showing a monospace placeholder. A navy button
> "Unlock". Below it a divider and a separate quieter section headed "Restore my
> personal details" with the line "Different from the code above — this one
> rebuilds your contacts on this device, and never touches our servers." and a
> small outlined button "Paste restore code". The two mechanisms must look
> visibly distinct, not like one form.
