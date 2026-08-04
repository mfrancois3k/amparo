# Spanish officer audio — the 22 missing clips

Generated 2026-08-04 from the live `index.html` at commit `41627d2`. Every line
below is **already-reviewed shipped content** — these are recordings of text
that exists in the product today, not new writing. Nothing here needs attorney
review; it needs a microphone.

## Why these are missing

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
