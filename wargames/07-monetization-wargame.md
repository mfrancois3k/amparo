# Wargame 07 — Ship monetization without breaking the app or the promise

Date: 2026-08-03. **Wargame, not execution.** Nothing here has been built.
Written so a mid-tier executor can run it end to end without asking a question.

Follows this repo's existing `wargames/NN-name.md` convention rather than running
`scaffold.py` — the repo already has 01–06 and a `tasks/` tree would collide with
the established layout. `SUCCESS.md` grading is inlined at the bottom.

**Mission:** sell per-state script packs, let buyers re-download forever, add a
no-server restore code for personal packs, and replace the blanket privacy line
with a scoped one that stays true — sequenced against the pending UPL opinion.

---

## RECON — completed, read-only. Four findings that change the plan.

| # | Finding | Evidence | Consequence |
|---|---|---|---|
| R1 | **No serverless surface exists.** Pure static deploy. | `ls api/ .netlify/ functions/` → *no serverless dir*. Repo root is `index.html`, `sw.js`, `vercel.json`, assets. | Any token *validation* is net-new infrastructure. A plain purchase link is not. |
| R2 | **CSP forbids talking to Stripe.** | `vercel.json` → `connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com https://ph.amparohq.com`; `form-action 'self'`; no `frame-src` (falls back to `default-src 'self'`). | Stripe.js, Stripe Elements, an embedded Checkout iframe, and a form POST to Stripe are **all blocked today**. |
| R3 | **`Permissions-Policy: payment=()`** and **`Cross-Origin-Opener-Policy: same-origin`**. | same file | Payment Request API / Apple Pay / Google Pay in-page are off. COOP severs `window.opener` on any popup. |
| R4 | **A plain `<a href>` to Stripe is unaffected by all of the above.** | Top-level navigation is not governed by `connect-src`, `form-action`, or `frame-src`. `navigate-to` is not deployed. | **The zero-CSP-change path exists.** This is the spine of the plan. |

**The decisive one is R4 + R1 together:** you can take money today with no server
and no header changes. You cannot *verify* a purchase without new
infrastructure. Every fork below hangs off that split.

**RECON NEEDED — settle before Move 4:**
- **Is the script pack per-state generic, or personalised?** Check: ask the
  operator directly; it is not answerable from source. **If personalised, Moves
  4–7 are void** — a personalised pack is Tier 1 and cannot be server-stored
  without breaking the very claim this plan preserves. Abort to Route Z.
- **Does the Vercel project have a paid plan / functions enabled?** Check:
  `vercel projects inspect` or the dashboard. Gates Move 6.

---

## Phase A — Ships now. Zero legal exposure, zero payment, zero CSP change.

### Move 1 — Tell users the PDF they already made is their backup
- **Action:** add one line of copy to the post-print state, both languages:
  the saved PDF is their copy and can be re-opened any time.
- **Expected observation:** after `afterprint` fires, the post-print rail shows
  the new line. EN and ES both render it; no `undefined` in either.
  *Fail looks like:* line absent in one language, or the key echoing raw.
- **Most-likely failure → signal → counter-move:**
  - Key added to EN block only → ES shows `undefined` → add to both string
    objects in the same edit; the repo has been bitten by this exact split before.
  - Key name collides with an existing one → the wrong string renders → grep the
    key name across the file *before* adding. Precedent: `pr_title` silently
    collided with the printed-card heading and shipped the wrong text.
- **Fork trigger:** if the operator wants this on the pack itself rather than the
  screen, it becomes legal-adjacent print content → **stop, route to attorney**,
  do not self-author print copy.
- **Abort condition:** none. This move is safe in all states.
- **Verification run:** print → confirm line appears EN → toggle ES → confirm
  translated line → confirm no `undefined` anywhere on step 4. Pass = all four.

### Move 2 — Restore code for the personal pack (no server, no purchase)
- **Action:** encode the Tier-1 fields (`state,name,ec,ecp,ec2,ecp2,att,lang`)
  into a compact string the user can copy; decode it back on paste. Encoding
  only — **no lookup, no network, no `fetch`**.
- **Expected observation:** copy a code on device A, paste on device B (or after
  `localStorage.clear()`), and the wizard repopulates with identical field
  values. Round-trip is lossless for non-ASCII (names carry accents).
  *Fail looks like:* mojibake on `María`, or a silently truncated field.
- **Most-likely failure → signal → counter-move:**
  - Non-ASCII mangled → `MarÃ­a` on decode → the file already contains
    `\uXXXX` surrogate escapes and has been corrupted once by a naive re-encode;
    use an explicitly UTF-8-safe encode (`TextEncoder` → bytes → base64) rather
    than `btoa` on the raw string.
  - Code is enormous → user won't transcribe it → drop `email` and any empty
    field before encoding; if still >~120 chars, **fork to Route B**.
  - Photos included → code becomes unusable and drags Tier 0 into a copyable
    blob → **never encode `data[key]` photo fields.** Explicit exclusion list,
    not a wildcard.
- **Fork trigger:** if the encoded string exceeds ~120 characters, take **Route
  B — offer a downloadable `.txt` backup file instead of a typed code.** Same
  privacy properties, no transcription burden.
- **RECON NEEDED:** does any persona actually switch devices? Unsettled. Check:
  no analytics event exists for this today. **Do not build Move 2 past a
  prototype until Move 3 measures it.**
- **Abort condition:** if the code round-trip is lossy for any accented
  character after two attempts, stop and flag — a silently corrupted emergency
  contact is worse than no restore feature.
- **Verification run:** encode → `localStorage.clear()` → decode → diff all
  fields incl. an accented name → confirm photo fields are absent from the
  payload. Pass = exact match on text fields, photos provably excluded.

### Move 3 — Instrument the demand before building the store
- **Action:** add two events — one when the "retrieve/restore" affordance is
  *seen*, one when it is *used*. No PII in properties, matching the existing
  `sr_*` convention.
- **Expected observation:** events appear with `{lang, state}`-shaped props only.
  *Fail looks like:* any event carrying a name, contact, or code value.
- **Most-likely failure → signal → counter-move:** a code value gets attached to
  the event for "debugging" → the restore code contains the user's contacts →
  **that single property would transmit Tier 1 data off-device and falsify the
  privacy claim outright.** Counter-move: assert in review that the props object
  is a literal with no interpolation from `data`.
- **Fork trigger:** if after 30 days the *used* event is zero, **do not build
  Phase B retrieval at all** — the demand is hypothetical and R1 says the
  infrastructure is net-new.
- **Abort condition:** none.
- **Verification run:** trigger both events with `ph` stubbed → inspect captured
  props → confirm no user-entered string present. Pass = props contain only
  enum-ish values.

---

## Phase B — Blocked on the UPL opinion. Build dark; do not enable.

> **Gate:** `notebook/amparo-upl-engagement-memo.md` is unsent. It states in
> writing that no payment mechanism exists and none is planned. **Move 4 is not
> started until that memo is amended and answered.** This is not a style
> preference — shipping payment while the memo says otherwise makes the memo
> false at the moment counsel reads it.

### Move 4 — Amend the UPL memo, then send it
- **Action:** add the monetization question to the memo (per-state paid script
  pack, one-time, Stripe-hosted) and send.
- **Expected observation:** memo contains an explicit question about charging;
  the "no payment mechanism" sentence no longer reads as a permanent commitment.
- **Most-likely failure → signal → counter-move:** the memo goes out unamended →
  counsel answers the wrong question → re-engagement costs a second fee →
  counter-move: diff the memo against the monetization plan before sending.
- **Fork trigger:** if counsel says charging materially worsens UPL exposure,
  **take Route Z — stop at Phase A permanently**, keep the product free, and the
  privacy line never changes. This is a real and acceptable outcome.
- **Abort condition:** no attorney engaged within the operator's timeline → stay
  in Phase A indefinitely. Phase A is independently useful.
- **Verification run:** read the memo end to end; confirm no sentence is falsified
  by the plan. Pass = zero contradictions.

### Move 5 — Sell with a plain link. No CSP change, no server.
- **Action:** a Stripe **Payment Link** behind an ordinary anchor on the
  post-scenario result screen only. `target="_blank" rel="noopener noreferrer"`.
- **Expected observation:** tap opens Stripe's hosted page in a new tab; Amparo's
  console shows **no CSP violation**; the app itself makes no network request.
  *Fail looks like:* `Refused to connect` in console — which would mean someone
  used Stripe.js instead of a link.
- **Most-likely failure → signal → counter-move:**
  - Anyone reaches for Stripe Elements / Checkout embed → CSP blocks it (R2) →
    **do not loosen the CSP.** Revert to the anchor. Loosening `connect-src` and
    `form-action` for payments is the single change most likely to be noticed by
    the privacy-motivated users this product depends on.
  - COOP severs `window.opener` (R3) → any code depending on the opened tab
    calling back fails silently → design the return as a **redirect to a URL**,
    never as a postMessage/opener handshake.
- **Fork trigger:** if the operator wants Apple Pay / Google Pay in-page, that
  needs `Permissions-Policy: payment=(self)` **plus** CSP changes → that is a
  different mission; **stop and re-wargame**, do not bolt it on here.
- **Abort condition:** if shipping requires relaxing `frame-ancestors` or
  `object-src`, stop — those are unrelated to payment and their presence is load-
  bearing elsewhere.
- **Verification run:** click the link → Stripe page loads → return to Amparo →
  confirm console is clean and `vercel.json` is byte-identical to pre-change.
  Pass = purchase page reachable with an unmodified header file.

### Move 6 — Delivery and re-download: **Route 6A, on Convex** (operator's call, 2026-08-03)
- **Action:** success URL carries `session_id` → a Convex `claimPack` mutation
  verifies it against Stripe and writes a bearer token row (`token / state /
  product / edition`, no identity fields — schema in `wargames/05` §2) →
  client stores the token in `localStorage`, calls `getPack` on return visits.
  Superseded alternatives, kept for the record: 6B (no server, trivially
  forgeable — rejected once real infra was chosen) and 6C (Stripe emails the
  pack, reintroduces identity — rejected, least preferred).

- **Expected observation:** `claimPack` returns a token for a real
  `session_id` verified against Stripe, and rejects a fabricated one. `getPack`
  returns the pack for a valid token, nothing for an invalid one.
- **Most-likely failure → signal → counter-move:**
  - Token derived from the email/session id → it becomes an identifier → **the
    Convex row now links to a person, defeating the entire architecture** →
    counter-move: generate the token from a CSPRNG inside the mutation, store
    the mapping, never derive it from anything Stripe sends.
  - Stripe secret key ends up in client code → visible in `view-source` → the
    static file is public by construction; **any key inside `index.html` is
    public.** Secret key lives only in Convex's environment variables, used
    only inside `claimPack`, never returned to the client.
  - `getPack` has no rate limit → token space becomes brute-forceable →
    Convex mutations/queries can be rate-limited per caller; add it before
    this goes live, not after.
- **Abort condition:** if delivery would require storing the buyer's name or
  email in the `packs` table, **stop.** That is the line this whole plan exists
  to hold, independent of which backend hosts the table.
- **Verification run:** buy once end-to-end → confirm the pack downloads →
  inspect the Convex row and assert it contains no name/email → clear
  `localStorage` → re-enter token → pack returns. Pass = all four, and the row
  is impersonal.

### Move 7 — The copy change. Same commit as Move 5/6. Never before, never after.
- **Action:** replace `pilotBanner` in **both** language blocks and add a
  purchase paragraph to `ab_privacy`.
  - EN: *"Your name, contacts and documents never leave your phone — no account,
    no upload."*
  - ES: *"Tu nombre, contactos y documentos nunca salen de tu teléfono — sin
    cuenta, sin subir nada."*
- **Expected observation:** banner renders the new text on every step in both
  languages; the word "Free" no longer appears in a claim that a paid pack
  contradicts.
- **Most-likely failure → signal → counter-move:**
  - Shipped in a *separate* commit from payment → there is a window where the
    app's most-repeated sentence is false → **counter-move: one commit, or the
    payment path stays behind a flag until the copy lands.**
  - Removed *early* (before payment ships) → the trust cost is paid and no
    revenue is earned for it → same counter-move.
  - ES not updated → Spanish users still see the absolute claim → grep both
    blocks; this file has shipped EN-only string changes before.
- **Fork trigger:** if Route Z (counsel says no), **revert this move entirely** —
  the original line stays exactly as written.
- **Abort condition:** if anyone proposes keeping the old banner "until we see if
  people notice," stop. That is knowingly shipping a false statement about data
  handling.
- **Verification run:** load every step 0–5 in EN then ES → confirm new banner
  text each time → confirm About screen describes the Stripe relationship →
  confirm no step still shows the old sentence. Pass = zero occurrences of the
  old string anywhere in the file.

---

## Abort conditions (whole mission)

1. **Counsel says charging worsens UPL exposure** → Route Z: Phase A only,
   permanently, privacy line untouched.
2. **The script pack turns out to be personalised** → Moves 4–7 void; a
   personalised pack cannot be server-stored under this architecture.
3. **Any move requires storing a name or email in Amparo's own store** → stop.
4. **Any move requires loosening CSP beyond adding Amparo's own origin** → stop
   and re-wargame; the header set is doing real work.
5. **The free product would become a demo** → stop. Every persona finding in this
   repo assumes the free tier is complete; degrading it invalidates all of them.

---

## Red team

**The attack that failed.** *"Just gate the existing practice levels behind the
paywall — instant revenue, no new content."* It fails on its own terms: the
levels are the thing the UPL memo describes as the exposed component, and
`prx.done` is client-side, so the gate is bypassable by anyone who opens
DevTools. It would trade the entire trust position for revenue that a
`localStorage` edit defeats. Rejected on both counts.

**The attack that landed → the patch.** *"Ship the privacy-copy change now, ahead
of payment, so users are acclimatised by the time the store opens."* This is
plausible — it front-loads the objection and avoids a same-day shock. It is
still wrong, and finding out *why* produced the patch: the trust cost is paid on
the day the sentence changes, while the revenue only starts when the store opens.
Removing it early means paying in full for something you have not yet received,
**and** it makes the app's headline claim weaker than reality for the entire
interval — which is its own small dishonesty, in the opposite direction. Patch:
Move 7 is now explicitly welded to Move 5/6 in a single commit, with an
abort condition naming early removal as a stop.

---

## Self-grade against the 8-point standard

| # | Standard | Status |
|---|---|---|
| 1 | Expected observation on every move | Pass — all 7 |
| 2 | Failure + signal + counter-move | Pass — all 7, multiple where warranted |
| 3 | Every fork has a trigger | Pass — Moves 1,2,3,5,6,7 + Route Z |
| 4 | RECON NEEDED marked with the settling check | Pass — 3 open (pack personalisation, Vercel functions, device-switch demand) |
| 5 | Abort conditions | Pass — per-move + 5 mission-level |
| 6 | Verification spelled out | Pass — every move, with explicit pass criteria |
| 7 | Red-team pass recorded | Pass — one failed attack, one landed + patch |
| 8 | Executable blind | **Partial** — blocked on the pack-personalisation question, which no amount of recon settles because only the operator knows. Flagged as the first RECON NEEDED and as mission abort #2. |

**Point 8 is honestly partial, not passed.** An executor could run Phase A blind
today. Phase B needs one answer from the operator first.
