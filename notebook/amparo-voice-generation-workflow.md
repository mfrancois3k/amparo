# Amparo — voice generation workflow (Voicebox)

**Standing workflow. Any agent generating ANY audio for this project follows this
file.** Verified against a live Voicebox instance on 2026-08-13.

This supersedes the Voicebox paragraph in `notebook/HANDOFF.md`, which said
Voicebox is "not a registered MCP." **It is registered now** — see below.

---

## Rule 0 — generating a voice is not authoring a line

Hard rule 1 of this project: **no model may author officer dialogue, statute
text, or legal citations.** This workflow turns *already-approved text* into
audio. It never invents the text.

Before generating anything, the line must already exist in one of:
- `index.html` (the live bank — the source of truth)
- `tools/VOICE_LINES.md` (the human recording manifest, EN only)

If the line does not exist in one of those, **stop and ask the operator.** Do not
write the line yourself, not even a "placeholder" — the repo's history has a
reverted release (`df974b7`) caused by exactly that.

---

## Rule 1 — always round-trip through transcription before shipping

**Non-negotiable. This check has caught two unusable batches.**

Generate → `voicebox.transcribe` the result → compare to the source text. If the
transcript does not match, the clip does not ship.

This is not a formality. The first Spanish attempt used the English cloned voices
(`Miles`/`Maya`) with `language="es"`. Voicebox's own Whisper transcribed
`"¿Sabe por qué lo detuve?"` as **`"El salve por kilo de toví"`**. It sounded
plausibly Spanish to an English ear and was completely wrong.

---

## Rule 2 — use native-language profiles, never a cross-language clone

An English-cloned voice reading Spanish produces audio that Whisper cannot parse.
Match the profile's language to the text's language.

**Live profiles as of 2026-08-13** (`voicebox.list_profiles`):

| name | type | language | use for |
|---|---|---|---|
| `AmparoES-M` | preset | es | Spanish male officer (`audio/es/m/`) |
| `AmparoES-F` | preset | es | Spanish female officer (`audio/es/f/`) |
| `AmparoES-M2` | preset | es | second Spanish male |
| `Miles` | cloned | en | English male officer (`audio/en/m/`) |
| `Maya` | cloned | en | English female officer (`audio/en/f/`) |

The MCP surface has **no clone tool**. To create a new preset profile:
`POST /profiles` with `voice_type=preset`.

**Any new profile gets the Rule 1 treatment before bulk use:** generate one clip,
transcribe it, compare. Do not batch 24 clips against an unverified profile.

---

## How to drive it

Voicebox exposes a local MCP server **only while the desktop app is open.**
Check first — everything below fails confusingly if it is closed:

```bash
curl -s -m 3 -o /dev/null -w "%{http_code}" http://127.0.0.1:17493/mcp
```

A `2xx`/`307` means it is up. Connection refused means open the app.

### Option A — registered MCP tools (preferred for one-offs)

Already registered for `claude-code`. Tools:

| tool | does |
|---|---|
| `voicebox.speak` | speak text in a profile → returns a generation id |
| `voicebox.transcribe` | local Whisper STT (`audio_path` or `audio_base64`) |
| `voicebox.list_profiles` | available voices |
| `voicebox.list_captures` | recent dictations **in** — NOT TTS output |

Register it elsewhere with:

```bash
claude mcp add voicebox --transport http --url http://127.0.0.1:17493/mcp --header "X-Voicebox-Client-Id: claude-code"
```

Config form:

```json
{
  "mcpServers": {
    "voicebox": {
      "url": "http://127.0.0.1:17493/mcp",
      "headers": { "X-Voicebox-Client-Id": "claude-code" }
    }
  }
}
```

Stdio fallback for clients that only spawn processes:

```json
{
  "mcpServers": {
    "voicebox": {
      "command": "C:\\Program Files\\Voicebox\\voicebox-mcp.exe",
      "env": { "VOICEBOX_CLIENT_ID": "claude-code" }
    }
  }
}
```

### Option B — batch generation (preferred for more than ~3 clips)

**Use `tools/voicebox_es.py`. Do not rewrite it.** It already solves every
gotcha below and is the reference implementation.

```bash
python tools/voicebox_es.py --list    # dry run, show what would generate
python tools/voicebox_es.py --probe   # ONE clip, report where it landed
python tools/voicebox_es.py --all     # the whole batch
```

Always `--probe` before `--all`.

---

## The three gotchas that cost real time

**1. Generated audio is not exposed by any MCP tool.**
Finished generations are written as `.wav`, keyed by generation id, to:

```
%APPDATA%\sh.voicebox.app\generations
```

`voicebox.list_captures` returns *dictations in*, not *TTS out*. It will look
like the generation vanished. It did not — look in that directory.

**2. `/generate/{id}/status` is an SSE stream, not plain JSON.** Read lines until
a terminal `status` (`completed` / `failed` / `error`) arrives. Parsing it as a
single JSON body hangs or returns nothing.

**3. The MCP path needs the trailing slash** — `http://127.0.0.1:17493/mcp/` —
when POSTing directly. The registration URL (no slash) is fine for MCP clients.

---

## Amparo file layout

Clips are named by line id and sorted by language then voice slot:

```
audio/en/f/<id>.mp3    audio/en/m/<id>.mp3
audio/es/f/<id>.mp3    audio/es/m/<id>.mp3
```

Filenames must match the id in the bank exactly — that is how the app resolves
them. MP3, ~0.2s of silence head and tail, no music, no effects.

Current counts: **62 clips per voice EN, 58 per voice ES.**

---

## Check for an id collision BEFORE you generate

**Found 2026-08-13, and it is a live trap.** Orphaned audio from older bank
revisions is still in the tree. If a new line reuses one of those ids, it
silently inherits audio *of different words* — and nothing in the build catches
it, because the file resolves fine.

Confirmed case: `v2_4` has clips in **all four** voice folders, dated
2026-07-22/23, with text in `tools/VOICE_LINES.md:47`. No reference to `v2_4`
exists in `index.html`. If a newly authored line is given id `v2_4`, it ships
with the old audio.

Always run this before assigning an id:

```bash
ls audio/*/*/<id>.mp3 2>/dev/null; grep -rn "<id>" index.html tools/VOICE_LINES.md
```

If files exist but `index.html` has no reference, it is an orphan: **delete all
four, or regenerate all four.** Never leave a partial set.

---

## Known-bad, do not retry with a model

`k30` (`¿Ciudadanía?`) and `k33` (`Oríllese a la inspección secundaria.`) are
missing in Spanish **deliberately.** Every kokoro Spanish preset mispronounces
"Ciudadanía" and "Oríllese." A Border Patrol agent mispronouncing "citizenship"
is worse than the correct robotic fallback.

**These need a human read.** See `notebook/amparo-spanish-audio-recording-list.md`.
Do not regenerate them and do not mark them fixed.

---

## The checklist

- [ ] Voicebox desktop app is open (`curl` check above)
- [ ] Line text already exists in `index.html` or `VOICE_LINES.md` — not authored here
- [ ] Id checked for orphan collision (`ls audio/*/*/<id>.mp3`)
- [ ] Profile language matches text language
- [ ] `--probe` one clip first
- [ ] **Transcribed the probe and compared to source**
- [ ] Batch generated
- [ ] **Transcribed the batch and compared to source**
- [ ] Files placed in the right `audio/<lang>/<slot>/` folder, named by id
- [ ] If the line is new legal-adjacent content: **bump `EDITION`** — this drops
      every attorney badge, by design

Related: [[amparo-hard-rules]] · `notebook/HANDOFF.md` · `tools/voicebox_es.py` ·
`tools/VOICE_LINES.md` · `notebook/amparo-spanish-audio-recording-list.md`
