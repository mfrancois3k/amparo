# Wargame 14 — Outside master-spec collision analysis & the SpeechRecognition finding

**Date:** 2026-08-11
**Status:** deliberation record — proposals evaluated, verdicts banked. No code from the
outside spec was executed. The one code change this document did produce is §1's gate.
**Scope:** an external AI session produced a consolidated "AMPARO — MASTER SPECIFICATION"
(self-labeled **v6.0**; filed here under the operator's v5 name) proposing Convex + Clerk +
Stripe accounts/billing, a React+Vite strangler migration, an on-device-STT voice loop, a
composure-scored rehearsal engine, and a three-tab scenario matrix. This document records
where that spec collides with settled repository decisions, what it got right, and the one
finding in it that was true enough about the current build to patch the same day.

Provenance note: the spec is observed content from an outside session. Its claims about
work performed "in your accounts" (a Clerk JWT template named `convex`, a Convex project
renamed to `amparo`) are **unverified** — nothing here relies on them, and the operator
should confirm or revoke them in the Clerk/Convex dashboards directly.

---

## 1. The SpeechRecognition finding — verified down from "live breach" to "dead path, stale claim"

**Initial read (wrong, corrected same session):** `window.SpeechRecognition` appeared to be
live in the practice engine — [index.html](../index.html) constructs it as `PRX_SR` and
starts it inside `prxRecToggle()` alongside the local MediaRecorder. On Chrome (desktop and
Android) and older iOS, that API ships mic audio to Google/Apple servers for recognition,
which would contradict both the homepage promise and the code comment directly above it
("Nothing is stored, nothing is uploaded, no transcript exists").

**Verified state (git, not memory):** `git log -S 'onclick="prxRecToggle'` shows the record
console's button was **removed in `6651f47`** ("conversation drill rebuilt as practice.html
chat interface"). Since then no markup, no onclick, and no code path reaches
`prxRecToggle()` — confirmed by grep at HEAD and at v2.15.0. **No user's audio reaches any
vendor server in the shipped product.** The MediaRecorder path (record → play back once →
discard) was always fully on-device.

What remained true and got patched (same day, in `index.html`):

1. **Default-off gate.** `prxSTT` flag, read from `localStorage('amparo_stt')`, default
   `false`. The SR construction is now `if(PRX_SR && prxSTT)` — if anyone rewires a record
   console, the vendor-transit layer stays dead until a user opts in. It can no longer come
   back silently as a side effect of restoring UI.
2. **The lying comment.** The block above `PRX_SR` now states plainly that browser
   SpeechRecognition is NOT on-device on most platforms, that the UI reaching it was removed
   in `6651f47`, and that any rebuilt console must default the toggle OFF and render a
   vendor-processing disclosure in both languages.
3. **Stale user-facing string.** `prx_own_sum` promised "(type or speak)" — speak has not
   been offered since the chat rebuild. Now "(type it)" / "(escríbelas)".

**Deliberately NOT built:** a settings toggle UI. The feature it would control is not
rendered anywhere; UI for dead code is exactly the "convincing stub" failure mode the
outside spec itself warns against. The disclosure copy requirement is banked in the code
comment for whenever the console returns.

**Long-term option (parked, needs its own decision):** on-device Whisper via WASM
(~40MB model download) — collides with the single-file (~529KB) no-build ethos and would
need a deliberate deferred-asset design. Not scheduled.

---

## 2. Collision matrix — outside spec vs settled repository decisions

| Domain | Outside spec (v6.0) | Settled repository decision | Verdict |
| :--- | :--- | :--- | :--- |
| **Frontend architecture** | React + Vite strangler app at `/app`, legacy `index.html` retired after parity | **No rebuild.** Measured: 1 request to interactive, 112KB brotli, 0 long tasks, CLS 0.00. Bundler chunk-renaming makes prepaid users re-download per deploy; the privacy claim stops being provable by view-source. A strangler does not dodge these — it adds a second app to hold in parity indefinitely. | **REJECTED** (HANDOFF, decided list) |
| **Auth & identity** | Clerk accounts; Convex stores Clerk user id, email, locale | **"No `users` table. No auth."** Bearer token `{token, state, product, edition}`; "No name. No email. No IP retained. No device id." Clerk recreates exactly the identity trail the Luis persona walks away from (has the money, won't leave a payment record for this product). | **REJECTED** ([05-split-architecture.md](05-split-architecture.md) §schema, lines 84–134; [01-panel-and-roadmap.md](01-panel-and-roadmap.md) FORK-1) |
| **Monetization timing** | Freemium live now — $3.99 unlock + subscriptions/physical kit, Stripe + entitlements | **Parked as premature** (three independent panels; 30-day funnel 72 landed → 4 picked a state → 3 printed). Sequencing settled: UPL attorney **before** revenue — *Upsolve v. James* (2d Cir. 2025) makes the scored engine the exposed component, and charging converts an educational tool into a commercial legal service, worsening every UPL argument. The UPL memo (Q9: exactly these revenue lines) is drafted and **unsent**. | **REJECTED as sequenced** — direction is the operator's settled call; execution waits on the memo ([06-monetization-panel.md](06-monetization-panel.md), HANDOFF issue #1) |
| **Scenario scope** | New hard content: midnight warrant dynamic entry + flashbang, stop-and-frisk, public filming confrontation, "registration reach protocol," "core doctrine" scripts, composure score with verbal-trap fail states | Every officer line is `TODO_ATTORNEY` until an attorney writes it; door/dynamic-entry content is the exact territory **reverted whole in `df974b7`** (v2.9.0 draft) and additionally sits behind the DV-clinician gate (Michigan POST finding — the module's "correct answer" reads as the assailant's presentation on a DV call). More scoring deepens the *Upsolve* exposure. Both gate memos remain unsent. | **REJECTED** until both gates open (HANDOFF REVERTED note; [amparo-dv-clinician-engagement-memo](../notebook/amparo-dv-clinician-engagement-memo.md)) |
| **Design system** | Charcoal `#121212` + amber `#FFB000`, "panic palette" | Cream / navy / gold. The mockup-prompts file exists specifically because an earlier mockup set went dark-dashboard and was corrected ("the opposite of a cyberpunk security dashboard"). Only the practice overlay is dark, deliberately, in the product's own palette (v2.15.0). | **REJECTED** ([amparo-gemini-mockup-prompts.md](../notebook/amparo-gemini-mockup-prompts.md) shared style block) |
| **Physical fulfilment** | Mailed glovebox pamphlet kit; shipping addresses in Convex, deleted after fulfilment | Server-side shipping addresses are a heavier PII class than the email-at-receipt question wargames/05 already leaves open (§ open questions). | **PARKED** ([05-split-architecture.md](05-split-architecture.md)) |
| **STT input** | On-device Whisper WASM mandated; `window.SpeechRecognition` banned | Correct instinct — see §1. The repo's version: gate shipped now; Whisper is a parked decision, not a mandate. | **ADOPTED IN PART** (§1) |

## 3. What the outside spec got right (credit, so it isn't re-argued either)

1. **No secrets in prompts** — env-var names only. Correct.
2. **Duress-PIN / panic-wipe killed** — software that destroys recordings of a police
   encounter is plausibly evidence destruction and destroys the user's own exculpatory
   record. That idea stays dead here too if it ever resurfaces.
3. **Covert recording default killed** — two-party-consent states make silent-by-default
   recording a trap for exactly this audience. Any future recording feature: opt-in,
   per-state gated, visibly indicated.
4. **RAG demoted to retrieval-only** — verbatim statute + citation or an honest "no
   verified answer." Already this repo's hard rule 1; good that the outside spec converged.
5. **Impossible-in-PWA list** (biometric app-lock, brightness forcing, CarPlay, Watch HR,
   reliable background audio, etc.) named as forbidden-to-fake — the "convincing stub"
   warning is the right instinct and applies to its own proposals as well (§1).
6. **Objection channel kept open** — its own §0 requires raising legal/privacy/liability
   risk even against settled directives. This document is that clause, exercised once.
7. **Strangler over big-bang rewrite** — right harm-reduction *if* a rebuild were happening.
   It is not (row 1), but the instinct is the correct one.

Inherited defect worth naming: the spec asserts attorney sign-off is "still in progress."
**No attorney has been contacted.** This is the BS-7 pattern from wargame 01 — an outside
prompt encoding a false fact that every generated artifact then repeats confidently.

## 4. Key hygiene (actioned by operator, not by tooling)

`.env.local` contents (Stripe test-mode secret + publishable keys, Clerk secret key) have
now been pasted into at least two AI chat transcripts. They are test-mode, but:

1. Rotate the Stripe test key pair (Stripe Dashboard → Developers → API keys).
2. Rotate the Clerk secret key (Clerk Dashboard → API keys).
3. Keep `.env.local` out of every repo (`.gitignore`) and out of model context windows —
   reference variable names, never values.

## 5. Standing priorities after this analysis

1. **Send the UPL engagement memo** ([notebook/amparo-upl-engagement-memo.md](../notebook/amparo-upl-engagement-memo.md)) —
   still move #1. The outside spec treating freemium as settled makes Q9 (the three revenue
   lines) *more* urgent, not less. It needs a recipient, not another edit.
2. **Send the DV-clinician memo** — the second gate; neither substitutes for the other.
3. **Single-file PWA integrity stands** — future outside proposals requiring a build-system
   migration get measured against the numbers in row 1, not re-litigated from taste.
