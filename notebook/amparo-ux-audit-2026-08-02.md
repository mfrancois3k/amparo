# Amparo — grand UX audit, 2026-08-02

Trigger: founder saw ~50% bounce rate in PostHog, flagged the state-picker step
(step 2 of the flow) as the likely confusion point. Verified against real data
before acting, then audited the whole flow as a UX consultant.

---

## Part 0 — the real numbers (verified, not assumed)

30-day PostHog query:

| Event | People |
|---|---|
| `$pageview` | 72 |
| `sr_state_selected` | 4 |
| `sr_pack_previewed` | 3 |
| `sr_pack_printed` | 3 |

**94.5% never pick a state.** The "50%" the founder saw is PostHog's built-in
single-pageview bounce metric — a gentler, different measure than the real
funnel. The true number is far worse, and the founder's instinct about *where*
was correct even though the *size* of the problem was undersold.

**Blind spot found in the process:** autocapture is intentionally off
(`autocapture:false` in the PostHog init, by design — matches the "nothing
leaves your phone" privacy promise). That means **no rage-click, dead-click, or
element-level data exists at all.** You can diagnose *that* people leave at
step 2, never *what they clicked or tried before leaving*. This is a permanent
tradeoff, not a bug — flagging it so it's a decision, not a blind spot.

---

## Part 1 — Root cause, confirmed by reproducing it

Opened the live site at 375×812 (mobile), drove to step 1, inspected the DOM.

**Finding 1 — nested scroll trap.**
`.state-grid` had `max-height:52vh; overflow-y:auto` — a scrollable box sitting
inside a page that already scrolls. On a touch device this reads as "stuck":
the user's scroll gesture gets captured by the inner box instead of moving the
page, a well-documented mobile UX failure mode.

**Finding 2 — the states people can actually rely on are buried.**
Sorted alphabetically with the 48 federal-only states, the three states with
real cited statutes landed at:
- TX → position 44 of 51
- NY → position 33 of 51
- GA → position 11 of 51

A Texas driver — likely your single largest audience segment — had to fight
through 43 near-identical tiles inside a trapped scrollbox to find their own
state.

**Finding 3 — no search.** 51 buttons, zero filter mechanism. Every mature
product with this exact pattern (see Mobbin references below) offers a search
box by default.

**Finding 4 — no visual distinction for the 3 real vs 48 federal-only states**
beyond a small "FEDERAL ✓" tag on each tile — easy to miss while scrolling
fast, especially under stress (this audience is often anxious before they've
even started).

---

## Part 2 — Reference patterns (Mobbin, verified against real products)

- [Origin — "What state do you live in?"](https://mobbin.com/screens/23c4f06e-6df7-484e-8a46-86c539af4f78) —
  near-identical premise to Amparo's step 1 ("we use this to tailor your plan
  to the specific laws of your state"). Uses a single searchable select, never
  a 51-tile grid.
- [Wise — country selector](https://mobbin.com/screens/0053babb-ae6b-41b7-8b28-5b5d8c70e2cc) —
  search-first dropdown, unavailable options shown but visually deprioritised
  rather than hidden (parallel to how the 48 federal-only states should read:
  present, but clearly secondary).
- [Klarna — country of residence](https://mobbin.com/screens/f4f62a44-3fe6-447a-b4b7-1a29fa614f63) —
  search box pinned above a plain list, no nested scroll container.
- [Airbnb — location with "use my current location"](https://mobbin.com/screens/410a61e5-7bd4-463f-9677-b5eb04608d48) and
  [Uber — saved places / location access](https://mobbin.com/screens/f3bea4fa-8e22-4a88-8b49-90137daa070a) —
  the auto-detect pattern. **Not implemented for Amparo** — see the fork below.

---

## Part 3 — Fix shipped today (v-unreleased, commit `3b4918c`)

1. **Search box** added above the grid — client-side substring match against
   state name and abbreviation. Zero network calls; nothing typed leaves the
   page, consistent with the existing privacy promise.
2. **Priority ordering** — TX/GA/NY always render first under a "Fully cited"
   label; the other 48 sit below under "Federal rights". Real positions are
   now 1–3, not 44/33/11.
3. **Scroll trap removed** — the page's own scroll now carries the full list;
   no inner max-height box.

Verified: positions, search-filter correctness (including a no-match state),
state selection still fires, both languages render, mobile screenshot
confirms no nested scrollbar.

---

## Part 4 — The fork deliberately NOT resolved silently

**Auto-detect the user's state (geolocation or IP).** The obvious next lever —
Airbnb/Uber-style "use my location" — and it was **not implemented**, because
it requires either:
(a) browser geolocation + a reverse-geocoding API call (coordinates leave the
device), or
(b) IP-based geolocation server-side (requires a server; this is a static
site with none).

Both conflict with "Nothing you enter leaves your phone" — the single most
repeated commitment in this product, and the reason Luis (from the focus
group) trusts it at all. This is a real trade worth having explicitly, not
shipping by default:

- **Route A (recommended, ship now):** stay client-side-only. The search +
  priority-order fix already collapses the effective list to 3 taps for most
  users.
- **Route B:** add geolocation with an explicit, honest disclosure ("this
  sends your coordinates to Google/Mapbox to guess your state — nothing else
  is sent, and you can just search instead"). Only pursue if Route A's
  measured lift is insufficient.

---

## Part 5 — Rest of the flow (lighter pass, no blocking issues found)

- **Step 2 (contacts)** — clean. Clear "every field is optional" framing,
  sensible optional backup contact. No changes recommended.
- **Steps 3–4 (lifelines, print)** — not re-audited in this pass; the funnel
  data shows the overwhelming majority of loss happens at step 1, so further
  UX investment downstream is lower leverage until step 1's fix is measured.

---

## Part 6 — Other blind spots surfaced while auditing

1. **No event exists for "reached the state-picker screen" itself** — only
   `sr_state_selected` (the action). This means the *view* rate at step 1 is
   invisible; only the *action* rate is measured. Can't currently tell "did 60
   people see the picker and 56 leave" apart from "did only 6 people ever
   scroll far enough to render it." Recommend adding a lightweight
   `sr_step_viewed` event (step name only, no other data) if measuring this
   fix's impact matters — currently the only proxy is `$pageview` count minus
   `sr_state_selected` count, which conflates several different sessions.
2. **Small sample size** — 72 landings in 30 days makes any single fix hard to
   validate quickly. Consider what traffic source is intended before investing
   further in funnel optimisation versus distribution.
3. **The friend's real answers** (see the separate transcript source in this
   notebook) confirm print *does* work (download succeeds), the 2-day return
   was pure unprompted recall, the practice CTA was seen-but-missed under
   distraction (an attention problem, not a discoverability one), and the
   licence-photo step is wanted but needs a private moment — none of these are
   state-picker issues, but all feed the wider roadmap already logged in this
   notebook's panel/roadmap document.
