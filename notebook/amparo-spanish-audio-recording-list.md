# Spanish officer audio — 18 of 22 generated, 4 still needed

**STATUS as of 2026-08-04:** 18 clips generated and verified via round-trip
transcription. **4 remain** — `k30` and `k33`, both voices. See "The four that
failed" below.

Generated 2026-08-04 from the live `index.html` at commit `41627d2`. Every line
below is **already-reviewed shipped content** — these are recordings of text
that exists in the product today, not new writing. Nothing here needs attorney
review; it needs a microphone.

## The four that failed, and why

`k30` ("¿Ciudadanía?") and `k33` ("Oríllese a la inspección secundaria.")
were generated and then **deleted rather than shipped.** Every Spanish voice
available in Voicebox's kokoro engine — `em_alex`, `em_santa`, `ef_dora` —
mispronounces those two specific words, consistently:

| word | heard as (3 voices, independently) |
|---|---|
| Ciudadanía | "Siu da danía" / "Tiu d'Avanía" |
| Oríllese | "Poríese" / "Porílle sea" / "oríces" |

This is a kokoro model limitation, not a voice-selection problem. It was caught
by transcribing each generated clip back and comparing to source — the same
transcriber renders the existing human recordings and the other 18 generated
clips **exactly**, so the failure is in the audio, not the check.

They were removed rather than kept because **"ciudadanía" is the single most
important word in the checkpoint scenario** — a Border Patrol agent
mispronouncing "citizenship" is worse than the browser TTS fallback, which
says it correctly. Those two beats fall back to TTS until a human records them.

**To finish:** record `k30` and `k33` in both voices by any means, drop them in
`audio/es/{m,f}/`, and rerun the verifier at the bottom of this file.

### Re-verified 2026-08-11 — still fails, on a newer Voicebox

Retested on **Voicebox v0.5.0** (new profile system: `AmparoES-M`,
`AmparoES-M2`, `AmparoES-F` — all three presets, not the raw kokoro voice ids
used in the 2026-08-04 run). Generated via `voicebox.speak`, each clip
transcribed back through `voicebox.transcribe` (Whisper `base`, `language=es`)
and compared to source:

| source | profile | heard as |
|---|---|---|
| `¿Ciudadanía?` | AmparoES-M | `¡Siu d'Avanía!` |
| `¿Ciudadanía?` | AmparoES-M2 | `¡Tiu d'Avanía!` |
| `¿Ciudadanía?` | AmparoES-F | `¡Siu d'Abanía!` |
| `Ciudadanía` (bare, no `¿?`) | AmparoES-M | `¡Siu d'Avanía!` |
| `Oríllese a la inspección secundaria.` | AmparoES-M | `Poríese a la inspección secundaria.` |

Two things this settles. **The punctuation is not the cause** — the bare word
fails identically, so it is the word itself, not the inverted `¿?`. And **the
rest of the k33 sentence renders perfectly** ("a la inspección secundaria"),
which localises the fault to `Oríllese` alone and rules out a general
Spanish-quality problem. The failures also reproduce the 2026-08-04 artifacts
almost character for character ("Tiu d'Avanía", "Poríese"), across a different
profile system — so this is the model, not a bad profile or a bad run.

No clips were written to `audio/es/`. **The decision stands: TTS fallback until
a human records these two.** Do not retry with another preset; the next
attempt worth making is a microphone.

## Why these were missing

`audio/es/` has 49 clips against `audio/en/`'s 62. Three families were never
recorded in Spanish: beat 8 (`v8_*`), hard mode (`h2*`), and checkpoint (`k3*`).
Until they exist, those beats fall back to browser TTS — which is the robotic
voice, and the thing this list exists to eliminate.

**When it actually bites:** the officer speaks English by default even in
Spanish mode (deliberate — `prxVoiceLang='en'`, it's the realistic stop). A user
only hits these gaps after toggling the in-drill voice to Spanish. So this is a
quality gap for users who actively choose Spanish audio, not a broken path for
every ES user.

## What to produce

**11 lines × 2 voices (m, f) = 22 files.**

Output paths — exact, case-sensitive, `.mp3`:
```
audio/es/m/<id>.mp3
audio/es/f/<id>.mp3
```

Match the existing English recordings' delivery. The engine's own tone table is
the spec it already applies to the TTS fallback, so a recorded read should sit
in the same register:

| tone | rate | pitch | direction |
|---|---|---|---|
| `calm` | 0.95 | 1.0 | routine, unhurried, not friendly |
| `curt` | 1.12 | 1.0 | clipped, procedural, no warmth |
| `hostile` | 1.22 | 0.9 | faster and lower — pressure, not shouting |

**Do not shout the `hostile` lines.** The direction analysis in
`wargames/09-final-boss-direction-brief.md` measured volume as the *last* of six
pressure sources in real footage; pace and pitch carry it.

---

## The 11 lines

### Beat 8 — "do you know why I stopped you" (4 clips)

| id | tone | Spanish line |
|---|---|---|
| `v8_0` | calm | ¿Sabe por qué lo detuve? |
| `v8_1` | calm | ¿Alguna idea de por qué lo detuve esta noche? |
| `v8_2` | curt | ¿Sabe por qué lo paré? |
| `v8_3` | curt | ¿Sabe por qué lo están deteniendo? |

### Hard mode (3 clips)

| id | tone | Spanish line |
|---|---|---|
| `h20` | curt | Licencia y registro. Despacio. |
| `h21` | hostile | ¿De dónde vienes? ¿A dónde vas? No me mientas. |
| `h22` | hostile | Bájate. Manos donde pueda verlas. |

> Note the register shift: hard mode addresses the driver with **tú**
> (`vienes`, `bájate`), every other scenario uses **usted**. That is deliberate
> in the shipped script — the drop in formality is part of the hostility. Keep
> it.

### Checkpoint (4 clips)

| id | tone | Spanish line |
|---|---|---|
| `k30` | calm | ¿Ciudadanía? |
| `k31` | curt | ¿Dónde nació usted? |
| `k32` | curt | ¿Le molesta si reviso la cajuela? |
| `k33` | curt | Oríllese a la inspección secundaria. |

> Checkpoint is a Border Patrol agent, not a local officer, and the shipped
> English reads businesslike rather than angry — the scenario trains against
> *volunteering*, not against panic. Match that: flat and procedural.

---

## Verifying afterward

Drop the files in and run this — it checks every id the engine can request
against what is on disk, both languages, both voices:

```bash
node -e "
const fs=require('fs');const h=fs.readFileSync('index.html','utf8');
const seg=s=>{const i=h.indexOf(s);return h.slice(i,h.indexOf('\n];',i));};
const ids=a=>[...a.matchAll(/id:'([^']+)'/g)].map(m=>m[1]);
const all=[...new Set([...ids(h.match(/const PRX_VAR=\{[\s\S]*?\n\};/)[0]),
  ...ids(seg('const PRX_HARD=[')),...ids(seg('const PRX_CHK=[')),
  ...[0,1,2,3,4,5,6,7,8].map(i=>'c'+i)])].filter(x=>!/^[wn]\d/.test(x));
let miss=[];
for(const id of all) for(const l of ['en','es']) for(const g of ['m','f'])
  if(!fs.existsSync(\`audio/\${l}/\${g}/\${id}.mp3\`)) miss.push(\`\${l}/\${g}/\${id}\`);
console.log(miss.length?'MISSING:\n'+miss.join('\n'):'All '+all.length+' ids present in both languages.');
"
```

Pass = `All 53 ids present in both languages.`

## Not in this list, on purpose

`w50`–`w55` and `n60`–`n65` (the two final scenarios) are excluded. Their
**English text does not exist yet** — every line is a `TODO_ATTORNEY`
placeholder. Recording them in either language is blocked until an attorney
writes them. Same for the door module.
