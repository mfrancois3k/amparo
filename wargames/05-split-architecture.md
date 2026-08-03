# Wargame 05 — Split architecture: sell script packs, keep the promise

Date: 2026-08-03. Design document. **No `index.html` changes are made or
authorized by this document.**

Written because the operator asked whether the privacy line has to be removed in
order to sell script packs and let users re-download them. The short answer is
no — but only if the two things being conflated are separated first, and only if
the banner copy is corrected to match what is actually true afterward.

---

## 0. What is true today, verified in source

| Data | Where it lives | Survives reload? |
|---|---|---|
| Document photos (licence, registration, insurance) | `data[key]` in memory only — `loadImg()` at :3244 reads to a data URL and never calls anything that writes it | **No** |
| Name, emergency contacts, attorney number, email | `localStorage` key `sr_save`, written by `persist()` at :2977 | Yes, on that device |
| State, step, print status, `printedEdition` | same `sr_save` | Yes |
| Practice progress | `localStorage` key `amparo_prx` (:3875) | Yes |
| Voice/mute preference | `amparo_voice`, `amparo_muted` | Yes |
| **Anything at all** | a server owned by Amparo | **No — none exists** |

Worth stating plainly because it strengthens the case: **`persist()` does not
write the photos.** It writes a fixed field list, and the photo keys are not in
it. So the most sensitive artifact in the product — a picture of someone's
licence — is RAM-only and gone on refresh. The About copy's claim that documents
"can't be handed over even under pressure" is not marketing. It is currently a
description of the storage model.

That is the thing at risk. It should not be spent casually.

---

## 1. The conflation to undo

The question was: *"if I don't save the information, how do I save his PDF?"*

The pack contains two categorically different things:

| | **Personal layer** | **Product layer** |
|---|---|---|
| Contents | Name, emergency contacts, attorney number, document photos | The state's rules, the scripts, the rights card, the scenario text |
| Unique to the user? | Yes | **No — identical for every user in that state** |
| Who authored it | The user | Amparo (+ attorney) |
| Needs to be stored to re-deliver? | No | Yes, and it already is — it ships inside `index.html` |

**A script pack is a product, not user data.** A New York script pack contains
no name. Selling it, storing it, versioning it, and re-delivering it forever
requires storing **zero personal fields**.

The personalised PDF is assembled on-device from the personal layer plus the
product layer. It is generated at print time and never needs to exist on a
server for the user to have it — they already do, it is on their phone.

---

## 2. The three tiers

### Tier 0 — RAM only. Never written anywhere.
Document photos. Unchanged from today. This is the tier the "can't be handed
over" claim rests on and it should never move.

### Tier 1 — Device only. `localStorage`, never transmitted.
Name, contacts, attorney number, state, practice progress, preferences.
Unchanged from today.

### Tier 2 — Server, and deliberately impersonal.
Purchased script packs, and an entitlement record that says *a* purchase
happened — never *whose*.

The entitlement row is the whole design problem, and it has one rule:

> **The server must never hold a field that identifies a person.**

A workable row:

```
token        random 12 chars, generated server-side, NOT derived from email
state        "NY"
product      "script-pack"
edition      "2026-C"
created      timestamp
```

No name. No email. No IP retained. No device id. The token is a bearer credential
for a product, not a login for a person.

**Where the identity actually goes:** Stripe. Stripe necessarily sees the card
and the email for the receipt. That is unavoidable for any card payment and it
is not something clever architecture removes. What it means is that Amparo's own
claim must be scoped to Amparo, and the Stripe relationship must be disclosed
rather than glossed. See §5.

---

## 3. Two re-download paths, and which problem each solves

The operator's stated need — *"go back to the website and re-download the
packet"* — is actually two different needs that want different mechanisms.

### 3a. "I bought a script pack and want it again"
Solved entirely by Tier 2. Token in, pack out. No personal data involved at any
point. Works on a new phone, a cleared browser, a friend's device.

Store the token in `localStorage` on purchase so the common case (same phone,
later) needs no typing at all — the pack simply appears. The manual token entry
is the fallback for a new device, not the primary path. This is exactly the
"optional header link, never a gate" placement the mockups got right.

### 3b. "I want my personalised pack back after clearing my browser"
Tier 2 cannot solve this without breaking the promise, because the personalised
pack *is* the personal layer.

Three honest options, in order of preference:

1. **They already have it.** The pack is a PDF produced by the print dialog. It
   is in their Files app. This is the cheapest correct answer and it is worth
   saying out loud in the UI, because right now nothing tells them so.
2. **A restore code that encodes rather than looks up.** A compact string
   containing the personal fields, generated on-device, decoded on-device. Same
   user experience as an access key. Zero server involvement. The user is
   holding their own backup — which is the honest version of what the mockups
   drew.
3. **Nothing.** Re-enter four fields. It takes under a minute; the wizard was
   already measured at 458px and well under a minute for the state step.

Option 2 is the interesting one and is independently useful even if no payment
ever ships. Note its real tradeoff: a restore code is a bearer secret containing
the user's contacts. It must never be auto-emailed, never logged, and the copy
must tell them it is sensitive.

---

## 4. What this does NOT solve

Stating these so they aren't discovered later.

- **UPL sequencing.** This document describes how to charge without breaking the
  privacy promise. It does not address whether charging is safe yet. The UPL
  memo is unsent, and the business panel's read was that even donations are
  premature. Charging strengthens the "commercial legal service" framing that
  *Upsolve* turned on. **This architecture should be built only after the
  attorney answers, or built and left dark.**
- **The UPL memo becomes stale the moment this ships.** It currently states in
  writing that no payment mechanism exists and none is planned. That sentence
  must be updated *before* the memo goes to counsel, not after.
- **Payment-trail refusal.** Luis and Marisol declined to leave a payment trail
  on this category of app regardless of their status. This architecture does not
  change their answer — it only ensures they are not *worse* off, because they
  never buy and therefore never reach Tier 2 at all. The free product must stay
  genuinely complete for them.
- **`data.email`.** The field already exists and is already optional, used by
  `sendPackEmail()`. If email delivery is used for receipts, that is a second
  place identity enters. Decide deliberately; do not let it happen by default.

---

## 5. The copy has to change, and that is not optional

This is where the operator's instinct was right. **A promise you no longer keep
is worse than a promise you never made** — and a false statement about data
handling is a deception exposure on top of everything else.

Under the split, the current banner becomes partly untrue for a specific reason:

> `pilotBanner` — *"Free. Nothing you enter leaves your phone — no account, no upload."*

- **"Free"** — no longer wholly true once any pack is paid.
- **"Nothing you enter"** — a card number is something you enter. Even though it
  is entered on Stripe's page and never touches Amparo, the sentence as written
  does not survive a hostile reading.

The fix is to **scope the claim to what is actually protected** rather than
delete it. The protected thing is the part users actually care about and the
part that is strongest:

> Proposed: *"Your name, contacts and documents never leave your phone — no
> account, no upload."*

That sentence stays 100% true under the split, keeps the load-bearing clause,
and stops claiming something the payment flow contradicts. It is narrower and
therefore more defensible.

The About screen (`ab_privacy`) needs a paragraph it does not have today: what
happens when you buy — that payment goes to Stripe, that Amparo's server stores
a purchase token and never a name, that the free product is unchanged. Written
in the same register as the existing honesty copy, not as a legal disclaimer.

**Both language blocks. Same commit. Never ship the payment path and the copy
fix separately** — the window between them is the window where the app is
lying.

---

## 6. Recommended sequencing

1. **Now, zero legal risk:** tell users the PDF they printed is their backup.
   One line of copy. Closes most of 3b for free.
2. **Now, optional:** build the restore code (3b option 2). No server, no
   payment, no UPL interaction. Useful regardless of what happens with money.
3. **Blocked on attorney:** everything in Tier 2. Build it behind a flag if you
   want it ready, but do not enable it until the UPL opinion lands.
4. **Same commit as enabling Tier 2:** the copy changes in §5, both languages,
   plus the UPL memo amendment.

---

## Open questions for the operator

1. Is the script pack **per-state generic**, or personalised? If personalised, it
   is Tier 1 and cannot be server-stored without breaking the promise — the whole
   design depends on this answer.
2. Email receipts: yes or no? If yes, identity enters at a second point and §5's
   copy needs to say so.
3. One-time purchase or recurring? Recurring means a customer relationship and a
   much heavier disclosure burden; one-time bearer tokens are far cleaner here.
4. Does the free tier stay complete? If the free product becomes a demo, every
   persona finding in this repo about trust needs re-running from scratch.
