# wargames/25 — Back-laundering, and whether the review deck is buildable yet

Round for the standing `/amparo-loop` verification, agent B (game design / level
design / instructional design), slug `e2e-qa`. At `v2.22.3` + 2 docs-only commits
(`d3a0f12`; `git diff --stat v2.22.3 HEAD` touches only `CHANGELOG.md`,
`law-status.json`, `notebook/amparo-version-history.md` — no source changed), so
tag-era line numbers below are current against `index.html` as run live.

Follow-up to `wargames/23-honesty-fixes-and-restores-modules.md` and
`wargames/24-share-sheet-modules.md`. `wargames/24` §3 recommended a review-deck
consumer for `prx.miss` and named three preconditions before building it. This
round verifies which of those shipped, live-tests the resulting behavior by
actually driving the engine in a browser (not by reading the diff), and answers
the two follow-ups the brief posed.

**Scope discipline, unchanged from 03/12/16–24:** structure and sequencing only.
No officer dialogue, no statute text, no legal content authored here.
`TODO_ATTORNEY` is the only placeholder, per `wargames/03`.

---

## 0. What changed since `wargames/24`, verified live

`wargames/24` §1a and the ordering in its §"Ordering" section named three fixes
as preconditions for any `prx.miss` consumer, in this order: (1) make `prxBack`/
`back()` reverse the miss counter too, not just the score: (2) make the counter a
leaky bucket (decrement on a later good answer, not just monotonic); (3) stop the
curveball from double-counting `ci 1`/`ci 2`. `0642590` ("fix: share sheet now
shows what it sends; sms target, silent copy failure, miss persistence") shipped
**(1) only**, plus the persistence-cadence alignment `wargames/24` §4d flagged
separately (root now matches `/app`'s "persist on every progress change" cadence
instead of deferring to run-completion).

Verified by reading source, then by actually driving the engine in a running
browser (`python -m http.server`, this repo's `.claude/launch.json` "root"
config, served at `127.0.0.1:8931` this session) rather than trusting the diff:

```
practiceOpen(); prxPick(false); prxAdvance();
  → prx.miss = {0:1} in memory AND in localStorage['amparo_prx'] immediately
prxBack();
  → prx.miss = {} in memory AND in localStorage — fully reversed, both places
```

Confirmed at `index.html:5478` (`prxAdvance`, increment + immediate `prxSave()`)
and `:5485-5506` (`prxBack`, decrement + immediate `prxSave()` at `:5503`,
comment explicitly citing the storage-asymmetry bug `0642590` fixed:
*"the increment persists immediately now, so a decrement that only touched
memory left the inflated count sitting in localStorage"*). `/app`'s
`practiceEngine.ts:369-398` (`back()`) is the same shape — decrement on popped
`'y'` tier, floored at zero, keyed off `runIdx` not `idx` for the same
crisis-beat-skip reason root's comment gives. `/app`'s side was verified by
reading source only this pass, not re-clicked through the React build — noting
that explicitly per the standing instruction, since `wargames/24` §0 already did
verify it live once and nothing has touched that file since.

**(2) and (3) are unshipped.** Grepped both trees for every write site:

```
index.html:4975   prx.miss=prx.miss||{}                          (init)
index.html:5478   prx.miss[ci]=(prx.miss[ci]||0)+1; prxSave()     (increment, on miss)
index.html:5503   prx.miss[_ci]--; ...; prxSave()                 (decrement, on Back only)
practiceEngine.ts:321  increments miss on advance()'s miss branch
practiceEngine.ts:382-388  decrements on back()'s popped-'y' branch
```

No other write site exists in either file. There is no decrement tied to a
**good answer** anywhere — only to Back. §1b's leaky bucket was never built.
The curveball splice at `:4938` is still unconditional (`deck.splice(...)`, no
guard against the spliced `ci` already being in `L.ids`), so `prx.miss[1]`/`[2]`
can still be double-incremented within a single Level 0/1 run from the second
run onward, exactly as `wargames/24` §2b described.

---

## 1. Live-tested: the exploit `wargames/24` §1a predicted is real and trivial

Drove the actual functions the UI's buttons call (`prxPick`, `prxAdvance`,
`prxBack` — the same code path a tap invokes, not a shortcut around it) against
a freshly cleared `amparo_prx`:

| Step | Call | `prCurTier` | `prx.miss` (mem) | `prx.miss` (storage) | `prRun` |
|---|---|---|---|---|---|
| 1 | `prxPick(false)` on beat `ci:0` | `'y'` | — | — | — |
| 2 | `prxAdvance()` | — | `{0:1}` | `{0:1}` | `['y']` |
| 3 | `prxBack()` | — | `{}` | `{}` | `[]` |
| 4 | `prxPick(true)` (same beat, re-shown) | `'g'` | — | — | — |
| 5 | `prxAdvance()` | — | `{}` | `{}` | `['g']` |

End state: run grid shows a single 🟩, `prx.miss` is empty, and nothing anywhere
in either storage or memory records that the player's first answer to `ci:0` was
wrong. This is not a hypothetical — it is the exact, unmodified path `Next` →
`Back` → `Next` produces, using the real engine functions.

**Sequencing detail that matters for the position below:** in the real UI, step 4
does not happen blind. `prxPick(false)` at step 1 sets `prRevealed=true` and
renders the coach line (`gc`/`bc` copy) for that beat *before* the player can tap
`Next`. So the corrected answer at step 4 is not independent recall — the player
picks it having just been shown, verbatim, which option is correct, seconds
earlier, on the same screen. The retry demonstrates nothing except that the
player can re-tap the option they were just told was right.

---

## 2. Answering the brief's two questions

### 2.1 Does the reliability fix change the calculus on the review deck?

**No — and it's worth separating two things the brief's phrasing risks
conflating: persistence reliability and signal quality. `0642590` fixed the
first. The review deck's precondition list needed the second at least as much,
and that part is untouched.**

Before this session's fix, `prx.miss` had a genuine trust problem at the
*storage* layer: root deferred writes to run-completion while `/app` wrote on
every change, so identical play produced different counters depending which
build you used (`wargames/24` §4d), and an abandoned run could silently lose its
miss record in root only. That's fixed, verified live in §0 above. It was real
progress and it was the correct first fix in `wargames/24`'s own ordering (it's
listed as step 1 of 4, cheapest-first).

But "the number now reliably reaches storage" is not the same claim as "the
number reliably means what a weak-beat consumer needs it to mean." Two of
`wargames/24`'s three named defects are about the second thing, and both are
still open:

- The counter is still monotonic (no §1b). A beat missed three times in week one
  and answered correctly every time since still reads whatever it read after
  week one, forever — verified above, there is no decrement-on-good anywhere.
- The curveball still double-counts `ci 1`/`ci 2` (no §2b guard) — verified
  above, `:4938`'s splice is unconditional.

A review deck (or anything smaller) built on the field *today* would rank by a
number that (a) never falls except via the Back-exploit in §1 (worse than doing
nothing, since a decaying signal that only decays via gaming is actively
misleading), and (b) is structurally inflated on exactly the two beats — `ci 1`,
`ci 2` — that already receive the most ladder exposure and 100% of curveball
coverage. Building the deck now would very likely surface `ci 1` as "your
weakest beat" for most players, which `wargames/24` §2b already identified as
close to the opposite of a useful recommendation.

**On the lighter-weight-consumer question specifically:** I'd argue reliability
buys the *opposite* of what the brief's framing suggests. A full review deck
(multiple beats, `wargames/24`'s design) can absorb one badly-ranked beat among
several without the whole feature failing — being wrong about whether `ci 6` or
`ci 4` should rank third barely matters if both are in the deck anyway. A
lighter, single-target consumer (e.g., tapping a beat's own `×N` badge to drill
just that beat, skipping the deck abstraction) has no such slack: it has exactly
one target, and given the double-count bias, that target would almost always be
`ci 1` — the single most over-drilled beat in the game. A minimal consumer is
*more* exposed to the two open signal-quality defects, not less, because there's
nowhere for a bad reading to hide. So: not yet, for either shape, and if
anything the smaller one is the worse bet to ship first.

**Position: `wargames/24` §3's design still stands. Its own ordering — fix §1a,
then §1b, then §2b, then build — was followed exactly one step. Ship §1b and
§2b before building any consumer, light or heavy, that ranks or selects beats by
this field.** Displaying the raw `×N` badge (already shipped, `:5836-5841`,
gated `m>=2` and same-run-miss-only) is lower-stakes than acting on it and can
stay as-is in the interim — it doesn't rank beats against each other, a player
just reads their own numbers.

### 2.2 Is Back-reversal of `prx.miss` correct, or does it launder the counter?

**Take the position stated plainly: reversing `prx.miss` on Back was the wrong
call, and I disagree with `wargames/24` §1a's own recommendation, which is what
shipped. Reversing the *score* (`prRun`/`prRunIdx`) on Back is correct and
predates `prx.miss` entirely — that should stay exactly as it is. Reversing the
*miss counter* on Back should not have followed the same rule, because the two
fields answer different questions and the shipped fix collapsed them into one.**

The reasoning:

`prRun` has always answered *"how did this run go"* — forgiving by design,
stated in the function's own comment (`:5483-5484`, "dropping its recorded
result so a re-do re-scores cleanly"), uncontested, unrelated to `prx.miss`'s
existence. `prx.miss` was introduced to answer a different question — the field's
own doc comment (`:4964-4974`) is explicit it exists because nothing "survived
to tell a player 'you keep missing THIS beat specifically' *across runs*." A
diagnostic field whose entire reason to exist is surviving past the run it was
recorded in should not be erasable *by an action available inside that same
run*, for free, with the answer already on screen.

`wargames/24` §1a argued for reversal on the grounds that "the players most
likely to use Back are the ones exploring the coach lines carefully — i.e., the
ones learning best," and that not reversing would penalize them. That's true for
one Back use-case — a player who taps the wrong answer *on purpose*, out of
curiosity, to read both coach lines before continuing. But it's indistinguishable
in the engine, byte-for-byte, from the other use-case: a player who genuinely
didn't know the answer, got it wrong, read the reveal, and used Back specifically
to erase the mark before it counts against them. `prxPick`/`prxBack`/`prxPick`
produce identical state transitions either way (verified in §1's table) — there
is no signal anywhere that tells these two populations apart. `wargames/24`
resolved the ambiguity by always favoring the first population's cost. I'd weight
it the other way, for a fact about the UI that makes the second path materially
easier than the first: **the coach line is already showing before Back is ever
tapped.** Population 1 has to *choose* to explore before committing — an active,
uncommon move. Population 2 just has to not like the mark it's about to leave and
tap the button already sitting next to Next — the path of least resistance,
available on every miss, every time, forever. Given the counter's stated purpose
is a durable diagnostic, I'd rather it occasionally over-count a genuine
explorer than systematically under-count a mark that any player can erase in one
extra tap, having already been shown the answer.

**What I'd ship instead:** revert the `prx.miss` half of `prxBack()`/`back()`
specifically — keep `prRun`/`prRunIdx` popping exactly as-is (that part is
correct, unrelated, and predates this whole discussion), keep every persistence
fix from `0642590` (increment still happens once, still persists immediately,
still symmetric with what a future decrement would need), just stop the
decrement from firing on Back at all. A beat's first wrong answer in a run is a
fact about that encounter; Back can fix the *grade*, not the *history*.

**One consequence worth stating precisely, because it changes what "fix" means
here:** simply reverting `prxBack()`'s decrement is not sufficient by itself once
§1b (leaky bucket, still unbuilt per §0) exists. If §1b's future decrement rule
is naively "decrement on any good answer," the exact same exploit reappears one
step later — miss, Back (my proposal: miss counter untouched), pick correct
*(this now counts as a "good answer" and would decrement under a naive §1b,
undoing the increment from two lines earlier anyway)*. The engine has no
existing concept of "first attempt at this `ci` this run" versus "retried
attempt after Back" to key a correct §1b rule off — `prRun`/`prRunIdx` are wiped
by exactly the Back call in question, so by the time the retry lands there's no
record it was a retry at all. Whoever builds §1b needs to scope its decrement to
a **later, independent** correct answer — a different run (`prxAgain()` or a
future review-deck pass), not any successful `prxAdvance()` — or this exact
question reopens under a different name the moment §1b ships. Flagging this now,
against the day someone builds §1b from `wargames/24`'s "one expression next to
the existing increment" framing, which undersells the scoping this needs.

**Reframing the brief's own phrasing:** I agree with "beats I got wrong on the
first real attempt AND then walked away from" as the accurate description of
what a Back-reversible counter measures, and I think that's a worse signal than
either "beats I struggle with" (the stated goal) or even a simpler "beats I've
ever gotten wrong" — the walked-away-from framing actively rewards the specific
behavior (game the badge, don't re-learn) the field exists to discourage.

---

## 3. Standing review — new findings only

Carryover from `wargames/21-24` is unchanged except where noted. Everything
below was checked this pass and is new.

### 3a. The `×N` badge already has a real display gate — worth noting before anyone "fixes" it further

Read closely at `:5836-5841`, not just grepped: the badge only renders when
**both** `m>=2` **and** the current run's outcome for that row is a miss
(`t2!=='g'`). A beat that's chronically missed historically but was *just*
answered correctly this run shows no badge at all — the comment at `:5837-5839`
states this is deliberate ("a beat that's chronically missed but was JUST
answered well doesn't need the flag repeated at it"). This is a reasonable,
already-shipped mitigation against exactly the guilt/nag concern `wargames/24`
§3's "What I would not build" section raises for a hypothetical scheduler — it's
worth citing as evidence the product's existing badge design is more careful
than the raw counter underneath it. It does **not** mitigate §2.2's laundering
concern, because a Back-corrected miss never reaches `m>=2` in the first place —
the badge gate and the laundering gap are independent problems at different
layers (display vs. record).

### 3b. Root and `/app` still don't share a `prx.miss` history at all — a sharper version of `wargames/24` §4d

§4d flagged that the two builds disagreed on **when** a miss persists; that's
now aligned (§0). Worth stating the larger fact that framing undersold: root
writes `amparo_prx` and `/app` writes `app_*` keys (`HANDOFF.md` "invariants,"
`app/index.html` vs root), and `/app`'s `readRootPractice` is defined and never
called (`HANDOFF.md` open issue 10). So even with identical cadence, a player
who uses both surfaces has **two permanently separate `prx.miss` histories** —
not a timing skew, a structural non-sync. Low stakes today (a badge number);
becomes a real "which app do I trust" question the day any consumer (§2.1) reads
one of them as ground truth for a recommendation. Not attempting a fix here —
raising it because §2.1's answer explicitly says "not yet," and this is one more
reason it isn't yet.

### 3c. The share-sheet checkpoint-caption fix is real and doesn't touch the miss discussion

Verified per the task brief's framing, briefly, since it's cited as context: the
`_nonTraffic` gate at `:5680` (`prLevel===4||prLevel===7`) suppresses
`prx_share_taunt` for the checkpoint and door levels, and the comment at
`:5668-5679` documents the reasoning (checkpoint is a Border Patrol immigration
stop, not a traffic stop; captioning it as one was a factual error in
user-facing outgoing text). Confirmed present, out of scope for this round's
design question, included only because the brief named it as this session's
other change.

---

## 4. Priority table (this pass's findings only)

| # | Finding | Where | Severity | Cost | Content needed |
|---|---|---|---|---|---|
| 1 | `prxBack()`/`back()` reversing `prx.miss` launders the counter — live-verified exploit, trivial and zero-evidence | `:5485-5506`; `practiceEngine.ts:369-398` | **HIGH** — undermines the field's stated purpose | remove the miss-reversal branch from Back; keep the score-reversal | none |
| 2 | §1b (leaky bucket) still unbuilt, and needs to scope its decrement to a later independent run, not "any good answer," or finding #1's exploit reopens one step downstream | n/a — design note for whoever builds it | MEDIUM (blocks §2.1's precondition correctly, but the scoping detail isn't written down anywhere yet) | design decision, not code yet | none |
| 3 | §2b (curveball double-count guard) still unbuilt | `:4938` | MEDIUM-HIGH, unchanged from `wargames/24` | one guard | none |
| 4 | Root/`/app` have no shared `prx.miss` history at all, not just a cadence skew | storage keys, `HANDOFF.md` issue 10 | LOW today, rises with any consumer | a decision, not a bug fix | none |

---

## 5. Open items requiring a human before any of this ships

1. **§2.2's recommendation reverses part of a fix that already shipped
   (`0642590`).** This is a "we shipped the wrong half" claim, not a new
   feature — flagging plainly so it isn't read as routine follow-up work.
2. **§2.1 restates `wargames/24` §3's position rather than changing it** — no
   new sign-off needed there, only confirmation that §1b/§2b remain the gate
   before any consumer, light or heavy, is built.
3. Nothing in this document proposes new officer dialogue, statute text, or
   coach copy. No `TODO_ATTORNEY` items are introduced this round.
