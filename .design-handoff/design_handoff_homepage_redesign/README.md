# Handoff: Amparo Homepage Redesign (Practice-First)

## Overview
A practice-first redesign of the amparohq.com homepage. The core repositioning: the Practice Arena (scenario trainer) is the primary value and hero CTA; the printed glovebox pack is the secondary, supporting flow. Includes a live playable 60-second Arena demo embedded in the hero, full EN/ES language parity, and an expert-panel review doc with a prioritized fix list.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. Your task is to **recreate this design in the amparo repo's existing environment**: the production site is a static, hand-authored `index.html` (vanilla HTML/CSS/JS, no framework, service worker, i18n via inline EN/ES string tables) — follow that established pattern. `Amparo Home.dc.html` opens directly in a browser to see the design live (keep `support.js` and `image-slot.js` next to it). `Expert Panel Review.dc.html` is the critique/priority doc, not a screen to build.

## Fidelity
**High-fidelity.** Colors, type scale, spacing, copy, and interactions are final intent. Recreate pixel-perfectly using the site's existing vanilla-HTML patterns. All user-facing copy exists in EN and ES — ship both or neither.

## Page structure (top to bottom)
1. **Fixed nav** — blurred cream bar (`rgba(250,246,238,.86)`, `backdrop-filter:blur(18px)`, 1px bottom border `#e5e0d4`). Left: logomark (existing shield/roof SVG) + "Amparo" (800, 19px, `#1B2A4A`). Center links (14.5px, 600, `white-space:nowrap`): Practice `#arena`, Build the pack `#how`, What's included `#what`, Privacy `#privacy`, FAQ `#faq`. Right: EN/ES pill toggle (1.5px `#1B2A4A` border, active side filled navy) + primary pill button "Practice a stop" → `/arena`.
2. **Hero** (centered, max 900px): gold eyebrow pill "Know your rights · Conoce tus derechos" (`#F3D48A` bg, `#6b4d0d` text); H1 `clamp(42px,7vw,76px)` 800 `#1B2A4A` "Practice the stop before it happens." / "Practica la parada antes de que pase."; sub 18–22px `#64707D`; primary CTA "Practice a stop →" (navy pill, shadow `0 10px 28px rgba(27,42,74,.28)`, hover lifts 2px) + text link "Build my pack instead"; trust line 13.5px: "Free. Everything stays on this phone unless you choose to save your pack to an optional free account. Photos and practice history never upload."
3. **Live Arena demo** (phone mockup, max 400px, gold radial glow behind): see Interactions below. Caption under phone: "Live demo — one of 24 scenarios, in legal review. The real Arena speaks its lines out loud."
4. **`#arena` Practice Arena section**: eyebrow "Practice Arena"; H2 "Now rehearse it." / "Ahora ensáyalo." (verbatim product strings); sub from hub_sub; 3 white scenario cards (22px radius, border `#e5e0d4`, shadow `0 16px 40px rgba(27,42,74,.08)`) — Traffic stop (LIVE badge), Checkpoint (LIVE), At your door (COMING SOON, gray badge, verbatim "we won't fake it" honesty copy); 6 feature chips (`#f4efe1` bg): Spoken officer lines · Answer by tap, voice, or text · Pressure rises like the real thing · Streaks & badges · Gentle mode — no clock or heartbeat · Passengers get scenarios too; safety line (verbatim pi_disc); CTA "Practice a full stop — 2 minutes →" + link "Why can't practice make a stop 100% safe? →" → `/about`.
5. **`#how` Build the pack** — 4 numbered steps (gold `01–04`), copy verbatim from existing site strings (pick state / add documents / lifelines / print).
6. **Pack visual** — image slot placeholder (760px card): replace with real photography of the printed pack.
7. **`#what` What's included** — 6 gold-dot items, verbatim pack contents copy; gold-bordered price pill ("Free. No card, no subscription…").
8. **`#privacy`** — dark navy `#121e38` full-bleed band; white H2 "Nothing leaves your phone unless you say so."; body verbatim from ab_privacy; 4 glass chips incl. "Practice history stays on device".
9. **`#bilingual`** — two-column: large EN/ES toggle illustration + copy "Every scenario, every page — in English and Spanish."
10. **`#states`** — "Which state do you drive in?" + TX/GA/NY statute framing + US-map image slot. (Panel P1: reframe as "Works in all 50 states — TX/GA/NY add statute-level citations.")
11. **`#faq`** — 7-item accordion (first item open; + icon rotates 45° when open), includes two new arena questions.
12. **Final CTA band** — gold `#E8B84B` bg, navy H2 "Practice the stop before it happens.", navy pill CTA.
13. **Footer** — logo, nav links, verbatim legal disclaimer + pilot-edition copyright line.

## Interactions & Behavior — Arena demo (the key build)
Phone frame: outer bezel `#0f1c33` radius 44px pad 12px; screen `#1d3557` radius 34px, min-height 560px, flex column.
- Header row: scenario title (11px 800 uppercase `#F3D48A`) + mood chip (bordered pill; "Calm" → "Tense" when tension > 60).
- Tension bar: 4px track `rgba(255,255,255,.12)`; fill animates `width .5s`, gold `#E8B84B`, turns `#e07a5f` above 60%.
- **Idle state** (default): scene line "You're pulled over at dusk. Officer is approaching.", note "No mic, no account — answer by tapping.", gold start button "Try a 60-second demo →". Demo must be opt-in (never autoplay — PTSD-safety decision).
- **Playing**: "OFFICER" label + dark bubble (radius `4px 16px 16px 16px`, bg `rgba(9,17,34,.6)`) with the officer line; white choice cards below (radius 14px, 1.5px border `rgba(27,42,74,.15)`). On pick: all choices lock (`pointer-events:none`), picked card border 2px green `#2e9e68` (good) / amber `#d9a62c` (neutral) / red `#d05b47` (bad), others dim to 40%; feedback panel appears (green `#e6f4ec`/`#1e6b43`, amber `#fdf6e3`/`#8a6512`, red `#fdecea`/`#a13527`); gold "Next →" button advances ("See how you did →" on the last turn).
- Tension math: start 12; good −4, neutral +14, bad +26; clamp 6–100.
- **Branch mechanic**: turn 2 bad answer ("Probably the speed…") inserts an extra consequence turn ("Speeding, huh. So how fast do you think you were going?") before continuing — this is the product's signature mechanic; keep it.
- **Done state**: "Scenario complete" + score pill "Safe answers: X of Y" (count of good picks / picks made — no readiness %, no confetti), note about the full Arena, gold CTA "Open the full Arena →" → `/arena`, underlined "Run it again" reset.
- Progress: 5 dots (active gold, done 55% gold, upcoming 22% white).
- Language toggle switches every demo string live, mid-run, without resetting state.

## Demo script data (verbatim from `arena/index.html:725–744` — do not rewrite; these are in attorney review)
Turn 1 O: "Good evening. License and registration, please." → good: ""My documents are in the glovebox — reaching for them now."" f: "Announcing movement keeps hands accounted for."
Turn 2 O: "Do you know why I stopped you?" → good: ""I'd rather not guess, officer."" f: "A guess can be used as an admission." / bad (branches): ""Probably the speed… sorry, I was rushing."" f: "That's an admission — and now they'll dig. Watch what happens."
Branch O: "Speeding, huh. So how fast do you think you were going?" → good: "Recover: "I choose to remain silent."" f: "Good recovery — you can invoke silence at ANY point, even after talking." / bad: ""Maybe 10 over? I really am sorry…"" f: "A number seals the admission. The apology doesn't offset it."
Turn 3 O: "Where are you coming from tonight?" → good: ""I choose to remain silent."" f: "One calm sentence. You owe no itinerary." / neutral: "Explain your whole evening" f: "Not illegal — but every detail can be probed."
Turn 4 O: "Mind if I take a quick look in the car?" → good: ""I do not consent to a search."" f: "Protects you in court even if they search anyway." / bad: ""Go ahead, I have nothing to hide."" f: "Consent waives your strongest 4th Amendment protection."
Turn 5 O: "Alright. Wait here." → "When they return: "Am I free to go?"" f: "If yes — leave calmly. If no, you're detained: stay silent."
Spanish versions for every line are in the reference file's `DEMO_TURNS`/`DEMO_BRANCH` constants — use them verbatim.

## State Management
- `lang: 'en' | 'es'` — drives every string on the page (mirror the site's existing i18n table pattern).
- `openFaq: number` — accordion index (−1 = all closed).
- `demo: { on, t (0–4), branch, picked (−1 = none), heat (6–100), score, scored, done }` — transitions: start → pick → next → (branch?) → … → done → restart.
- No network calls, no storage writes required. (Panel P0: a returning-user check of the site's existing localStorage flips the hero primary to "Continue where you left off" — see review doc.)

## Design Tokens
- Colors: navy ink `#1B2A4A` · dark band `#121e38` · phone screen `#1d3557` · bezel `#0f1c33` · cream bg `#FAF6EE` · gold `#E8B84B` · pale gold `#F3D48A` · gold-tint chip `#f4efe1` / `#fdf6e3` · body gray `#64707D` · muted `#8a93a0` · border `#e5e0d4` · eyebrow brown `#6b4d0d` · good `#2e9e68`/`#1e6b43`/`#e6f4ec` · warn `#d9a62c`/`#8a6512` · bad `#d05b47`/`#a13527`/`#fdecea`.
- Type: system stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Helvetica, Arial`). Weights 600/700/800. H1 `clamp(42px,7vw,76px)`, H2 `clamp(32px,4.5vw,48px)`, eyebrows 12.5px/800/uppercase/1.6px tracking, body 14.5–18px, line-height 1.5–1.65.
- Radii: pills 99px, cards 14–22px, visuals 24–28px, phone 34/44px. Section padding `clamp(90px,11vw,150px)`.
- Shadows: hero CTA `0 10px 28px rgba(27,42,74,.28)`, cards `0 16px 40px rgba(27,42,74,.08)`, phone `0 40px 90px rgba(27,42,74,.35)`.

## Assets
- Logomark: existing shield/roof SVG (already in repo favicon/brand).
- Two image placeholders to replace with real assets: pack photography (`#how`→`#what` transition) and a US coverage map (`#states`).
- No new icons, no emoji in UI chrome.

## Priorities from the panel review (see Expert Panel Review.dc.html)
P0 before traffic: ⚖ attorney review of the demo script (it gives and grades specific answers — legal content, review BEFORE launch) · state-blind script fix (some states impose duties where "remain silent" verbatim could hurt; add "rules differ by state" beside the demo or gate lines on state) · demo↔Arena first-minute parity (if the real Arena feels worse than the demo, it's a bait-and-switch) · returning-user CTA · Organizations band · price-honesty line ($3.99 script pack disclosure) · gentle-mode/checklist labeling. Also: ship at /new or behind a flag, not a one-commit overwrite of index.html. P1: share strip (WhatsApp EN/ES cards exist in repo) · 50-state reframe · no-printer line · passenger card · a11y pass (focus rings, contrast, `prefers-reduced-motion`, aria-live on demo feedback) · offline line.

## Files
- `Amparo Home.dc.html` — the homepage design (open in a browser; keep `support.js` + `image-slot.js` beside it).
- `Expert Panel Review.dc.html` — critique, blindspots, 10 persona verdicts, ship order.
- `support.js`, `image-slot.js` — runtime for viewing the references only; do not port.
