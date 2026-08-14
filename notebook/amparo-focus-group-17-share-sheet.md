# Amparo focus group 17 — the share sheet (v2.21.8 → v2.22.1)

**Agent A of the `/amparo-loop share-sheet` verification.**
Build under test: `872eed3`, tag **v2.22.1**, `EDITION = "2026-E"`.
Measured live in a real browser against `http://127.0.0.1:8931/index.html`
(root `index.html`, unmodified) plus source reads of `index.html` and
`app-src/`. Every number below is a measurement or a source line, not a
recollection.

Testing method note: per the loop brief, `window.SRMotion` was nulled before
exercising overlay close so the documented `else fin()` fallback runs — the
preview tab's frozen rAF/GSAP ticker is pre-existing and is **not** reported
as a finding. Geometry was read from `getBoundingClientRect()` /
`scrollWidth`, which are layout-accurate and do not require compositing, so
the "cannot screenshot" limitation does not weaken any measurement here.

**Excluded by instruction, not re-reported as new:** attorney/lawyer review,
the two unsent memos, empty `ci:7`, curveball drill-coverage inversion, and
`/app` having no share (its Welcome share is still `href="/"`,
`app-src/src/screens/Welcome.tsx:51` — confirmed present, deliberately not
counted).

---

## 0. What is actually new this round, verified

Four commits since the last loop, two of them the share sheet:

| Commit | What | Verified how |
|---|---|---|
| `90bac62` v2.21.10 | answer-position randomisation, dead `PRX_LEVELS.rate` removed | source: `PRX_UNSCORED` block comment at `index.html:4504-4509` documents the removal in place; `swap` set at deal time |
| `5b7cd05` v2.21.11 | per-beat miss counts persist | not re-litigated — FG16 scope |
| `8d93d39` **v2.22.0** | **`#shareOverlay`** — target row, link field, copy, `navigator.share` as "More" | LIVE: opened, hrefs read, focus order read, close verified |
| `f9d7806` **v2.22.1** | **Facebook + X added** | LIVE: 6 targets rendered, both hrefs read and compared |

New analytics surface: `sr_share_via` is genuinely new. Root's unique `ph()`
event count went **41 → 42** (`git show v2.21.11:index.html` vs working tree,
counted by `grep -o "ph('[a-z_]*'" | sort -u | wc -l`). `sr_share_tapped`,
`sr_drill_shared` and `sr_badge_shared` all predate this work.

The v2.22.1 tag annotation's central claim **checks out**, and I want that on
record before the criticism starts. Verified live, both hrefs, at 375px:

```
FB : https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.amparohq.com
X  : https://x.com/intent/tweet?text=Amparo%20🚔%20🚧%20Checkpoint%0A🟩🟨🟩🟩%203%2F4%0A
     Do%20you%20know%20your%20rights%20at%20a%20traffic%20stop%3F&url=https%3A%2F%2Fwww.amparohq.com
```

Facebook carries no score. X carries the level name, the grid, and the
numeric score. Exactly as documented at `index.html:5940-5947`. Nobody
guessed; the source comment and the live href agree.

Also verified clean and worth saying so:

- Overlay a11y registration is real, not asserted. `shareOverlay:shareClose`
  in `OVERLAYS` (`:6148`); LIVE: `appRoot` gains `inert` on open and loses it
  on close (`inertWhileOpen:true` → `inertAfter:false`), Escape routes through
  the central handler, focus lands inside the dialog on open.
- z-index 97 (`:410`) beats `#practiceOverlay`'s 95 (`:401`), so `ovTop()`
  correctly traps in the share sheet when it is opened from the practice
  debrief. Not just claimed — the CSS and `ovTop()`'s computed-`zIndex` sort
  were both read.
- Label contrast measured **4.69:1** (`#64707d` on `#FAF6EE`) — passes WCAG AA
  for normal text at 11.5px/700. No finding.
- Every `sh_*` string exists in **both** EN (`:1983-1984`) and ES
  (`:2330-2331`). ES renders correctly live (`Comparte Amparo`, `Mensajes`,
  `Copiar enlace`, `Más`, `Cerrar`).
- No user-typed text reaches the sheet. Both call sites pass static strings;
  `_shShare.url` is the literal `https://www.amparohq.com` in both. `esc()` is
  applied to the field value and every label. No injection surface today.
- CSP is irrelevant to these targets and the source comment saying so
  (`:5928-5930`) is right: they are link navigations, and `vercel.json`'s
  policy has `form-action 'self'` but no navigation restriction. `Referrer-Policy:
  no-referrer` is set, so no referrer leak — the query string is the payload,
  not the referrer.

---

## 1. Ten persona reactions

### 🧑 Luis, 27 — TX, DACA, warehouse shift lead, older Android, prepaid data

He read the sheet the way he reads everything: what does this send, and to
whom.

"Four of these six buttons are a URL to somebody else's server with my stuff
in it. WhatsApp is Meta. Facebook is Meta. X is X. The moment I *tap*, before
I pick a person, before I decide anything — the request is already gone."

He's right, and it is measurable. `https://wa.me/?text=<my whole message>` is
an HTTP GET to Meta carrying the message. So is `x.com/intent/tweet?text=…`.
Facebook's is the exception — `?u=` only. Only `sms:` (an OS handoff, no
network) and Copy are on-device end to end.

*(Whether a mobile OS intercepts `wa.me`/`x.com` as an app link before the
request leaves is platform- and install-dependent and I could not test it
here — marked **UNVERIFIED**. The desktop and no-app-installed paths are
certain.)*

"And this thing is where I finished the *checkpoint* drill. The Border Patrol
one. You want me to put '🚧 Checkpoint 3/4' on Facebook with my real name.
Facebook makes you use your real name."

He would not tap any of them. He'd want the link field, and — see golden #1 —
on his phone he cannot see the link field's row button without swiping a
scroller that shows no scrollbar.

### 🧑 Rosa, 44 — GA, Spanish-first, mixed-status family, son (17) drives

She came in through **"📤 Envíaselo a alguien que quieres"** — *Send this to
someone you love* (`w_share`, `index.html:3257` and `:3430`). That copy is
one-to-one, intimate, gift-shaped. She tapped it expecting to pick her son.

What opened has Facebook and X sitting third and fourth in the row. "Se lo
mando a mi hijo. ¿Por qué me está ofreciendo Facebook?"

She is not offended — she is *confused about what she just opened*, which for
this audience is the same as being suspicious of it. The sheet contains no
sentence. Not one. Verified live: `#shareBody`'s entire text content is

```
💬 | WhatsApp | ✉️ | Mensajes | Facebook | X | 🔗 | Copiar enlace | ⋯ | Más | Copiar enlace
```

Six icons, six labels, one URL, one duplicate button. In an app whose every
other screen explains itself in her language, the one screen that reaches
outward says nothing.

### 🧑 Marcus, 19 — NY, Black college student, new driver, broke, shares things that look sharp

The one persona who genuinely wants this feature, and he likes it.

"The grid is the thing. 🟩🟨🟩🟩 — that's Wordle, I know exactly what that is,
and it doesn't say what I got wrong. It says I *did* it. That travels."

He would post it. Probably to X, which is the one target that carries the
grid. He noticed Facebook doesn't: "Wait — if I hit Facebook it just posts…
the website? That's a completely different post. Why are they in the same
row looking the same?"

That is the fair version of the criticism. Not "Facebook is dangerous" —
Facebook is the *safer* of the two — but that two buttons rendered identically,
adjacent, at the same size, with the same affordance, do materially different
things, and nothing on screen distinguishes them.

His second point: "'Challenge a friend' and then the third button is a public
feed. Challenge implies I'm sending it *to* somebody."

### 🧑 Keisha, 34 — Atlanta, rideshare driver, no printer, always between fares

Thirty-second budget, phone in one hand.

She'd finish a drill in the car, hit the gold button, and get a row where —
measured on her exact device class — the last thing she can see is Facebook.
"Copy link" and "More" are off the right edge with no scrollbar and no fade.

"I don't have a Facebook I post on. I want to text it to my cousin. Messages
is there, fine." She'd survive, because SMS is second. But she would never
discover "More", which is where her actual messenger lives.

She also flagged the thing nobody built for: "I'm in a dead zone half my
shift. What happens when I tap WhatsApp with no bars?" Verified — root
contains **zero** references to `navigator.onLine` (grepped the whole file).
The sheet has no offline state. Four of six targets are network navigations
in an app whose headline chip says *works without internet*.

### 🧑 Marisol, 29 — NY, green-card holder, Spanish-first, night shifts

Legally secure, and still the panel's sharpest read on the trust question —
which is the point of having her here. The payment-trail objection was never
about immigration status; neither is this one.

"I have status. I still don't want a timestamped record at Meta that I was
rehearsing a police stop at 2am. That's not fear of deportation, that's not
wanting a profile."

She noticed the sheet's structure argues against itself: a **link field** is
displayed, showing `https://www.amparohq.com` and nothing else, with a Copy
button under it. That is the visual promise of the screen — *what gets shared
is this link*.

Then the buttons above it send `text + "\n" + url` (`index.html:5932`). From
the practice debrief that text is her level, her grid, and her score. The
sheet shows her one thing and transmits another, and never shows her the
message body at any point.

"Copiar enlace copies the link. Bien. But then what do the buttons do? Nobody
told me."

### 🧑 Omar, 23 — Phoenix, low vision, screen reader + 200% text

The a11y work here is genuinely good and he says so first: focus lands inside
the dialog, Escape closes it, the background goes `inert`, Tab wraps, icons
are `aria-hidden` with real text labels so his screen reader announces
"WhatsApp, link" and not "graphic". The focus order reads clean:

```
Close → WhatsApp → Messages → Facebook → X → Copy link → [link field] → Copy link
```

Then he turned his zoom on.

At an effective CSS viewport of 188px — roughly a 375px phone at 200% page
zoom, which is his default — the row is 474px of content in a **108px**
visible box. **One** target is visible: WhatsApp. Messages, Facebook, X, Copy
link and More are all off-screen, behind a horizontal scroller with
`scrollbar-width:none` (`:415`), `::-webkit-scrollbar{display:none}` (`:416`),
and no gradient, mask, or fade edge anywhere in the CSS (grepped `.sh-row` —
only two rules exist).

He can reach them by Tab, because focus scrolls elements into view. A
low-vision *touch* user with no keyboard cannot, and has no indication
anything is there. WCAG 1.4.10 (reflow) and 2.4.11 (focus not obscured) are
both live questions here; I'm not going to assert a formal failure without a
conformance pass, but the measurement is not ambiguous.

### 🧑 Dana, 52 — TX suburb, mom of a 16-year-old, the panel's completionist

The one persona for whom Facebook is exactly right. She runs the neighborhood
parents' group. "This is what I've wanted — I can put it in front of forty
moms at once."

And the Facebook button does the correct, boring, safe thing: posts
`amparohq.com`, rendered from the page's own `og:` tags (`index.html:17-24`,
`og.png` present at 597KB). Her son's score is not in it. That design decision
is right and she is the reason it's right.

Her complaint is the opposite of everyone else's: "It's *labeled* Challenge a
friend and it dumps me into a sheet with a link box. I wanted to share the
product, not my score. Where's the version that's just 'tell people about
this'?" — There is one; it's `w_share` on Welcome. She never found it because
she was in the practice overlay.

She also caught the copy bug: "Two buttons, both say Copy link, right next to
each other." Confirmed — `:5955` (row) and `:5960` (field), both call
`shareCopy`, both copy `_shShare.url`, identical labels.

### 🧑 Nia, 41 — NY, survived a violent stop six years ago, PTSD

Short reaction, and the panel went quiet for it.

"You want me to make a scoreboard out of it."

She is not the audience for the share sheet and the product has never
pretended she was. But the gold **primary** button on the scored debrief is
now `📤 Challenge a friend` (verified live: `practiceBody`'s first
`button.btn.gold` on level 4 is that button). The exit is a ghost button
below it. For her the emotional shape of the end of a drill is now "post
this," and the way out is visually demoted.

She did note what the product got right, unprompted: hard mode (level 3),
wait (5), no-stop (6) and door (7) all early-return **before** any share
button is assembled (`:5734-5757`). "The one where nothing I did mattered
doesn't ask me to brag about it. Somebody thought about that." Correct — and
worth preserving, because it's the strongest argument that the share button's
placement elsewhere was a default rather than a decision.

### 🧑 Tony, 61 — GA, retired postal worker, gives "the talk" himself

"Facebook is where my church group is. That's not a small thing — that's the
only place I could put this where the people I mean would see it."

He tapped it, saw it posts the site and not a score, and approved. "Good. My
grandson's practice score is nobody's business, including mine."

Then the objection: "Nothing here tells me that. I found out by trying it. If
I'd assumed it worked like the other one I'd have posted the boy's score to
two hundred people from the congregation."

That is the whole finding in one sentence from the persona least likely to
read a code comment. The safety property exists; it is invisible; a reasonable
user learns it only by risking it.

### 🧑 Devin, 16 — TX, Dana's son, the actual end user

Would absolutely post the grid. Enthusiastically. Immediately.

"🟩🟨🟩🟩 3/4 — yeah I'm putting that up."

He does not distinguish between the traffic ladder and the checkpoint drill,
and neither does the taunt string: `prx_share_taunt` is the fixed line
*"Do you know your rights at a traffic stop?"* (`:1972`), used for **every**
level including level 4, which is `🚧 Checkpoint` (`prx_lvl5`, `:1896`) — a
Border Patrol immigration checkpoint that HANDOFF explicitly notes "is not a
traffic stop, and applies in all 50 states." Verified live: the checkpoint
share composes

```
Amparo 🚔 🚧 Checkpoint
🟩🟨🟩🟩 3/4
Do you know your rights at a traffic stop?
```

A 🚔 emoji, a checkpoint level name, and a traffic-stop question, in one
message, going to X with the score attached. He wouldn't notice. Rosa's son
would post the same thing.

---

## 2. Golden standard — exactly 5, ranked by magnitude

### 1. Six targets do not fit the row, and the CSS comment that justified not fixing it is now false

**Evidence — LIVE, measured, three viewports, `navigator.share` stubbed
present (i.e. every real phone; iOS Safari and Android Chrome both expose it).**

| Effective CSS width | Row visible | Row content | Fully visible targets | Off-screen |
|---|---|---|---|---|
| 375px (iPhone class) | 295px | **474px** | WhatsApp, Messages, Facebook | **X (clipped), Copy link, More** |
| 1280px (desktop) | 420px | 474px | 5 of 6 | **More** |
| 188px (≈200% zoom on 375) | 108px | 474px | **WhatsApp only** | **5 of 6** |

`.sh-t` is `width:74px` fixed with `gap:6px` (`:417`, `:415`). Six items =
6×74 + 5×6 = **474px**, invariant. `.sh-card{max-width:420px}` (`:411`) caps
the container, so the row overflows on **every viewport that exists**,
desktop included.

The scroller is invisible: `scrollbar-width:none` (`:415`),
`::-webkit-scrollbar{display:none}` (`:416`), and grepping `.sh-row` returns
exactly those two rules — no gradient, no mask, no `::after` fade, no chevron.

And this, at `index.html:412-414`, is the comment that decided it:

> *"Horizontal scroll rather than the reference's chevron buttons: **with four
> targets this only overflows on the narrowest phones**, and a native swipe
> beats two arrow controls that need scroll-position state to stay honest."*

That reasoning was sound for v2.22.0's four targets. v2.22.1 added two and
left the comment. The stated premise is now measurably false at 375px, and
false on a 1280px desktop.

**Impact.** The two targets pushed off the visible row are precisely the two
that send nothing to a third party: **Copy link** and **More** (the native
sheet — Signal, AirDrop, the private messengers). What survives on screen is
WhatsApp, Messages, and **Facebook as the last fully visible option**. The
privacy-preserving choices were silently demoted below the fold by the commit
that added the public ones. Luis, Keisha and Omar all hit this by different
routes; Omar's case reduces the sheet to a single button.

This is also the *exact* shape the operator has spent four consecutive
releases hunting — a claim that outlived what it claimed about (FG16 BS-1).
Here it is in a code comment rather than user-facing copy, which is why the
honesty pass didn't catch it.

**Cheapest fix that holds:** the labels are the width driver, not the icons.
`width:74px` → `flex:1 1 0;min-width:56px` on `.sh-t`, or drop to a 2-row
wrap, fits six on a 320px phone with no chevron state to keep honest. One
CSS line. Whatever is chosen, **update the comment** — a stale justification
is how this recurs.

### 2. The sheet displays a link and transmits a score, and never shows the message

**Evidence — LIVE.** `index.html:5932`:
`const msg=(_shShare.text?_shShare.text+'\n':'')+_shShare.url;` — the four
target hrefs carry `msg`. The `<input id="shLink">` at `:5959` carries
`_shShare.url` alone. Read live from a checkpoint-debrief share: field value
`https://www.amparohq.com`; X href contains
`Amparo 🚔 🚧 Checkpoint%0A🟩🟨🟩🟩 3%2F4`.

`#shareBody`'s complete rendered text, both languages, is six icon/label
pairs plus the URL and a duplicate Copy button. **Zero prose.** No preview of
the message. No sentence saying what leaves.

**Impact.** The most-repeated sentence in this project is *"Your name,
contacts and documents never leave your phone."* The share sheet is the first
and only surface that deliberately sends something outward, and it is the
only surface in the app with no explanatory copy at all. Marisol, Rosa and
Tony each arrived at the same place independently: the screen shows a link,
so a reasonable person concludes a link is what's shared.

The fix is small and does not touch legal content (this is UI chrome, hard
rule 1 does not apply): render `_shShare.text` in the sheet, read-only, above
the target row — the same way the link field shows the link. The user sees
their own grid before they choose a destination. As a bonus it kills the
Facebook-vs-X asymmetry confusion Marcus flagged, because "what gets sent" is
finally on screen.

One line of copy under it would close Tony's case entirely. Something with
the shape of *"Only the message above is sent. Nothing else leaves your
phone."* — operator's wording, not mine.

### 3. The checkpoint drill's share is scored, public, and mislabelled as a traffic stop

**Evidence — LIVE.** `PRX_UNSCORED = new Set([3,5,6,7])` (`:4503`). Level 4 =
checkpoint (`prx_lvl5:"🚧 Checkpoint"` / `"🚧 Retén"`, `:1896`/`:2245`) is
**not** in that set. `practiceRender()`'s debrief early-returns for 5/6/7
(`:5734`) and 3 (`:5748`) — both before any share markup — but level 4 falls
through to the scored branch. Driven live: on level 4's debrief,
`practiceBody.querySelector('button.btn.gold').textContent` is
`📤 Challenge a friend`. It is the primary action.

The message it composes uses `prx_share_taunt` — the fixed string *"Do you
know your rights at a traffic stop?"* (`:1972` / `:2319`) — for a Border
Patrol immigration checkpoint. Verified output above.

Compare what the same function does eleven lines earlier, at `:5711-5714`,
with its own comment:

> *"Unscored levels report completion without a score and without state.
> 'Someone in `<state>` just finished the scenario where complying didn't
> help' is the class of signal this project has removed before."*

The project strips score and state from its **own anonymous PostHog event**
on the sensitive levels — and then hands a scored, level-named checkpoint
grid to X, publicly, under the user's real identity, from the primary button.
`sr_drill_shared` itself still fires with `{level:5, state:<TX>, lang}`
(`:5624`).

**Impact.** Luis and Rosa are the modal users of the checkpoint tab; it is the
one module that applies in all fifty states rather than the three with cited
statutes. Whether a checkpoint result should be publicly shareable at all is
an operator decision, not an agent's. But it is currently shareable *by
default, as the loudest button on the screen*, with a taunt line that
describes a different scenario. At minimum the taunt should be per-level
(existing-string work, no new legal content); at minimum-plus, level 4 should
join the levels that end in a debrief instead of a scoreboard.

### 4. The two Facebook and X buttons are visually identical and behaviourally different

**Evidence.** Both render through the same `tg.map()` template at `:5954` —
same `.sh-t` class, same 50px icon circle, same label treatment, adjacent
positions. Live hrefs:

- Facebook: `?u=<site url>` only. Score never leaves. Card renders from
  `og:title`/`og:description`/`og:image` (`index.html:17-22`), verified
  present, `og.png` on disk.
- X: `?text=<level + grid + score + taunt>&url=<site url>`. Score leaves in
  the GET.

The source documents this precisely (`:5939-5947`) and the tag annotation
does too. The **user interface** does not.

**Impact.** Ranked fourth rather than higher because the safer behaviour is
the default on the more-used network, and because fixing #2 (show the
message) does not fully fix this — the user still can't tell that one target
drops the message they were just shown. Tony's line is the case: he learned
the safety property by tapping and hoping. Marcus's is the mirror: he'd pick
X *because* it carries the grid, without knowing that's the distinguishing
fact. Either a per-target note, or accept that #2's message preview plus a
short "Facebook posts the site only" is the honest minimum.

### 5. Tapping a target leaves the sheet open, and `sms:` opens a new tab

**Evidence.** `<a class="sh-t" href="…" target="_blank" rel="noopener
noreferrer" onclick="shareVia('…')">` (`:5954`). `shareVia` (`:5975`) fires
one `ph()` call and returns; nothing closes the overlay. Contrast
`shareNative()` (`:5991-5995`) which does call `shareClose()` on success.

Two consequences:

1. After returning from WhatsApp/X, the user lands back on a still-open share
   sheet with the practice debrief inert behind it. No confirmation, no state
   change, no indication the share happened — the same *class* of ambiguity
   the v2.22.0 commit was written to remove from the desktop path.
2. `target="_blank"` on a `sms:` scheme URL is a known cross-platform rough
   edge (a blank tab left behind on some iOS Safari versions). **UNVERIFIED**
   here — desktop Chrome only, no device matrix available. Flagged as recon,
   not asserted as a defect. The `sms:?&body=` *form* is correct and the
   comment explaining why (`:5935-5937`) is accurate.

**Impact.** Lowest magnitude on this list — nothing is broken, nothing leaks.
Included because it is the one remaining place where the sheet's own stated
purpose ("no confirmation the user could trust") is not yet met, and because
the fix is a `shareClose()` call plus dropping `target="_blank"` from the
`sms:` entry specifically.

---

## 3. What must change in the practice MODULES specifically

Scoped to `practiceRender()`'s debrief branches, `prxShareRun`,
`PRX_UNSCORED`, and the `prx_*` share strings.

- **Decide whether level 4 (Checkpoint) belongs in `PRX_UNSCORED`**
  (`index.html:4503`). It is currently the only level that is both
  status-sensitive and scored. Adding `4` to that set suppresses the score
  ring, the `prx.best` write, the state-carrying analytics, *and* — because
  the debrief early-returns run on level, not on the set — would still need
  the `:5734` branch condition widened to actually drop the share button.
  Two edits, one decision.
- **Make `prx_share_taunt` per-level, or at minimum add a checkpoint
  variant.** `:1972` / `:2319`. Existing-string family, both languages, no new
  legal content, no EDITION implication (UI chrome). Today a Retén result is
  captioned "una parada de tráfico."
- **Reconsider `📤 Challenge a friend` as the debrief's `btn gold`**
  (`:5794`). On levels 0/1/2/4 it is the primary action, above the exit.
  Nia's read: the drill now ends in "post this." Demoting it to a plain
  `.btn` and promoting `carryOpen()` or `prxAgain()` costs one class name.
- **Show the message body in the sheet** (golden #2) — `:5952-5961`, one
  read-only block rendering `_shShare.text` above `.sh-row`. This is a
  practice-module concern more than a share concern, because the practice
  debrief is the only call site whose text is non-static.
- **Fix `.sh-t` sizing so six targets fit** (golden #1) — `:417`, and update
  the now-false comment at `:412-414`.
- **Dedupe the two `Copy link` buttons** (`:5955` and `:5960`). Identical
  label, identical handler, adjacent. Keeping the field's and dropping the
  row's also buys back 80px of the overflow in golden #1 — one deletion
  addresses two findings.
- **Seven new orphaned bilingual strings.** `sh_title`, `sh_sms`, `sh_copy`,
  `sh_more`, `sh_copied`, `sh_link_a11y`, `sh_close` are all extracted into
  `app-src/src/content/t.en.json:242-248` and `t.es.json:242-248` with **zero**
  renderers in `app-src/src` (`/app` has no share sheet — excluded as a
  finding, but the string debt is new this round). This is the same pile FG16
  golden #3 flagged for `prx_ld*`/`prx_sel_sub`/`prx_locked`, which has now
  grown from 7 orphans to 14 in one release. The extractor cannot flag them
  because they are legitimately used in root. Same open question, larger
  number.
- **Carry-forward, NOT re-verified this round, do not assume closed:** FG16
  golden #1 (root lifelines tablist keyboard nav) was fixed in v2.21.8 per
  HANDOFF; FG16 goldens #2–#5 (`/app` print confirmation text state,
  `prx_ld*` orphans, four unnamed tablists, hub progress denominator) were all
  outside this round's diff and outside its scope. Check them directly.

---

## 4. Blind-spot questions a top UX researcher would ask

Not repeated from FG06–FG16.

**BS-1. The share sheet is the first feature this project has shipped whose
entire purpose is to move data off the device — and it went through no gate
designed for that.** Hard rule 2 reads *"NEVER add anything that sends user
data off-device."* The rule has always been enforced against servers,
analytics of typed content, and geolocation. A share sheet is a genuine,
legitimate exception: the user chose it, the data is their own score, and the
transport is a link navigation. But the *reasoning* for why it's an exception
exists nowhere — not in the tag annotation, not in HANDOFF, not in a source
comment. It was decided implicitly by building it. The question is not "was
this wrong" (it wasn't). It is: **what is the written test that distinguishes
this from the next feature that also sends user data off-device with the
user's consent?** Because there will be one, and the next agent reading hard
rule 2 will either block a good feature or wave through a bad one, with
nothing to consult but this precedent.

**BS-2. Sharing is a conversion mechanism aimed at the top of a funnel that
loses 94.5% before it reaches the practice engine — has anyone checked that
the share sheet is even placed where the users are?** Two call sites carry
`w_share` on Welcome (`:3257`, `:3430`); the third and richest is
`prxShareRun`, reachable only from a completed practice run. The 30-day
funnel is 72 landed → 4 picked a state → 3 printed. The number who completed
a scored drill and reached the debrief is not in that funnel at all. So the
share sheet's best-designed entry point — the one with the grid, the score,
and the gold button — sits behind the narrowest part of the product, while the
one in front of everybody is a text link labeled "Send this to someone you
love" that opens the same sheet with static copy. `sr_share_tapped`
(pre-existing) and `sr_share_via` (new) will now tell you the ratio for the
first time. **Nobody has stated what ratio would mean the feature worked**,
and without that stated in advance, the numbers will be read to confirm
whatever is believed when they arrive.

**BS-3. Every persona who objected objected to *visibility*, not to sharing —
so is the missing product the sheet, or a share that isn't a score?** Luis,
Marisol, Rosa, Tony and Nia all declined for the same structural reason: the
artifact is a *performance record*, and performance records are only
comfortable when the audience is chosen. Marcus and Devin accepted for the
same reason inverted. Dana accepted a completely different artifact — the
product link, no score. That is three distinct share objects hiding behind
one button: *my result* (private, one-to-one), *my achievement* (public,
voluntary), and *this product exists* (public, impersonal). The sheet
currently makes all three the same message and lets the *destination* decide
which one it becomes — accidentally, via Facebook's `u`-only API rather than
by design. **Is that split worth making explicit** — two buttons on the
debrief, "send my result" and "tell someone about Amparo" — or is it
over-building for a feature with no usage data yet? This is a real fork and
the answer is not obvious.

**BS-4. Facebook's `og:` tags are now load-bearing product copy and are not
in any check suite.** Golden #4's safety property — Facebook posts no score —
is delivered entirely by `og:title`/`og:description`/`og:image` at
`index.html:17-22`, which have not been reviewed as *shareable public copy*
since they were written as SEO metadata. `og:title` currently reads *"Amparo —
Get pulled over with a plan."* That is now the headline on Tony's church
group's feed and Dana's forty-parent group. It was never written for that
audience or that context, and `--verify` does not cover it (it compares
`index.html` to the `/app` banks; `og:` isn't in the banks). **Who owns
public-facing share copy, and when did it last get read as such?**

**BS-5. The row's target order is a ranking, and it was set by append.** The
composition is WhatsApp, Messages, Facebook, X, Copy, More — the first two
from v2.22.0's deliberate audience read, the next two appended in v2.22.1,
Copy and More pushed rightward by the append. Position one in a horizontal
row is the most-tapped slot on every mobile share sheet ever measured; the
last two positions, here, are literally invisible on a phone (golden #1). So
the ordering that resulted from "add two more at the end" now reads as an
editorial ranking that says: **Meta first, public broadcast third and fourth,
your own private options last and hidden.** No one chose that. **Is target
order a thing this product wants to own explicitly — e.g. Copy and More
first, third-party destinations after — or does it inherit whatever append
order the commits happen to produce?**

**BS-6. The sheet has no offline state, in an app whose primary claim is
offline.** Verified: zero occurrences of `navigator.onLine` anywhere in root.
Four of six targets are network navigations. Keisha's dead-zone case is not
hypothetical — the product's own positioning is that you need it at the
roadside, and the offline chip (fixed in v2.21.4 specifically so it would
stop lying) is a headline element. A user who has just been told "✈️ Saved on
this device — works without internet" and then taps WhatsApp with no signal
gets a browser error page, from inside an installed PWA. **Should the sheet
detect offline and reorder/disable, or is share simply an online-only feature
that should say so?** Either answer is fine; silently offering four broken
buttons is the one that erodes the chip's credibility, which the project just
spent a release restoring.

**BS-7. This is the second consecutive round where the highest-value finding
was a geometry measurement no suite performs.** FG15 BS-1 and FG16 BS-4 both
asked when the four check suites (now 2465 content strings + 47-odd static
assertions, still zero behavioural) would grow teeth. This round's golden #1
required exactly two numbers — `scrollWidth` and `clientWidth` on one
element, at three widths. That is roughly six lines of Playwright, and it
would have caught a defect introduced by a two-target append that all four
suites passed clean. Three rounds running, the loop's own findings have come
entirely from outside the automated gate. **The question is no longer whether
the gap should close; it is whether the next engineering pass closes it
before or after the next content pass**, given that content passes now
reliably ship layout regressions the content gate is structurally blind to.

**BS-8. The v2.22.0 tag annotation names its own untested surface — and that
is exactly where the defect was.** It says: *"Verified live except visual
render — the preview tab cannot composite frames or run rAF."* Honest, and
correct about compositing. But layout geometry is **not** compositing:
`getBoundingClientRect()` and `scrollWidth` are fully available in that
frozen tab, which is how this round measured everything above without a
single screenshot. So the class of check that would have caught golden #1 was
available the whole time and was written off along with the class that wasn't.
**Is "cannot screenshot" being used as a general stand-in for "cannot verify
visually", and how much else has been waved through on that conflation?** The
distinction is cheap to encode: pixels need a compositor, geometry does not.

**BS-9. The calibration log is still empty — third round asking, and this
round is the one where it would have mattered most.** `.focus-group/
members.md`'s last line is unchanged: `Calibration log: (add real-user
feedback here as it arrives)`. Every persona objection above is a *predicted*
willingness-to-share, and willingness to share is the single hardest thing to
predict from a room of simulated users, because the real answer depends on
who is actually in someone's contact list and what their Facebook is for.
This is the first feature in the product's history whose success is entirely
a social-behaviour question rather than a correctness question. One real
conversation with one real user — Rosa's actual analogue — would be worth
more than this entire section.

---

## 5. Group read

The share sheet is a real improvement over what it replaced and nobody on the
panel argued otherwise. The a11y integration is correct and was verified, not
asserted. Facebook's score-free behaviour is a genuine safety property that
somebody thought about. The debrief's early-returns keep hard mode, wait,
no-stop and door out of the sharing path entirely, which is the single most
considerate decision in the whole feature.

What the panel found is that the v2.22.1 append — two buttons, no layout
change — quietly re-ranked the sheet. Measured, at 375px with a native share
API present: the last fully visible target is Facebook, and the two options
that send nothing to a third party are off-screen behind an invisible
scroller. At 200% zoom only WhatsApp survives. The CSS comment that decided
not to add chevrons still says four targets "only overflows on the narrowest
phones," which stopped being true in the commit that didn't touch it.

Beneath the geometry sits the trust question the brief asked. The sheet shows
a link field and sends a score. It contains no sentence in either language.
For an audience that arrived because the product promised nothing leaves
their phone, the one screen that reaches outward is the only screen that
explains nothing — and the one drill most likely to be status-sensitive, the
Border Patrol checkpoint, ends with a public share as its primary button and
a caption that calls it a traffic stop.

None of that requires new legal content, an attorney, or a product pivot. It
is one CSS line, one deleted duplicate button, one read-only text block, one
per-level string, and one decision about whether the checkpoint drill keeps a
score.

---

## 6. Signature

Agent A, `/amparo-loop share-sheet`. Ten personas from
`.focus-group/members.md`: Luis, Rosa, Marcus, Keisha, Marisol, Omar, Dana,
Nia, Tony, Devin.

All source citations are `index.html` at `872eed3` / v2.22.1 unless noted.
All geometry, hrefs, focus order, contrast, ES rendering, `inert` lifecycle
and the level-4 debrief button were measured LIVE in a browser against a
local server, not inferred. Items marked **UNVERIFIED** — mobile app-link
interception of `wa.me`/`x.com`, and `sms:` + `target="_blank"` behaviour on
iOS — are recon, not asserted defects.
