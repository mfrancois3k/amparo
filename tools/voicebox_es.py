#!/usr/bin/env python3
"""Generate the missing Spanish officer clips through the local Voicebox MCP.

Voicebox exposes a plain JSON-RPC MCP over HTTP at 127.0.0.1:17493/mcp while the
desktop app is open. This drives it directly rather than through a registered MCP
client, so it works from a shell.

Usage:
    python tools/voicebox_es.py --list          # show what would be generated
    python tools/voicebox_es.py --probe         # generate ONE clip, report where it lands
    python tools/voicebox_es.py --all           # generate all 22

Every line here is already-shipped reviewed content — this records existing text,
it does not author anything.
"""
import json, sys, time, urllib.request, urllib.error, os, shutil, glob

BASE = "http://127.0.0.1:17493"
MCP = BASE + "/mcp/"
HDRS = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "X-Voicebox-Client-Id": "claude-code",
}

# id -> (tone, spanish text). Extracted from index.html, not retyped.
LINES = [
    ("v8_0", "calm",    "¿Sabe por qué lo detuve?"),
    ("v8_1", "calm",    "¿Alguna idea de por qué lo detuve esta noche?"),
    ("v8_2", "curt",    "¿Sabe por qué lo paré?"),
    ("v8_3", "curt",    "¿Sabe por qué lo están deteniendo?"),
    ("h20",  "curt",    "Licencia y registro. Despacio."),
    ("h21",  "hostile", "¿De dónde vienes? ¿A dónde vas? No me mientas."),
    ("h22",  "hostile", "Bájate. Manos donde pueda verlas."),
    ("k30",  "calm",    "¿Ciudadanía?"),
    ("k31",  "curt",    "¿Dónde nació usted?"),
    ("k32",  "curt",    "¿Le molesta si reviso la cajuela?"),
    ("k33",  "curt",    "Oríllese a la inspección secundaria."),
]
# voice slot -> Voicebox profile name.
# These MUST be Spanish-language profiles. The first attempt used the English
# cloned voices (Miles/Maya) with language="es" — the phonetics were mangled
# badly enough that Voicebox's own Whisper transcribed "¿Sabe por qué lo
# detuve?" as "El salve por kilo de toví". Native-Spanish kokoro presets
# (em_alex / ef_dora) are used instead. Verify any new profile the same way:
# generate one clip, transcribe it, compare to the source text.
VOICES = {"m": "AmparoES-M", "f": "AmparoES-F"}


def _post(payload, session=None, timeout=120):
    h = dict(HDRS)
    if session:
        h["mcp-session-id"] = session
    req = urllib.request.Request(
        MCP, data=json.dumps(payload).encode("utf-8"), headers=h, method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read().decode("utf-8", "replace")
        sid = r.headers.get("mcp-session-id")
    for line in raw.splitlines():
        line = line.strip()
        if line.startswith("data: "):
            line = line[6:]
        if line.startswith("{"):
            return json.loads(line), sid
    return None, sid


def connect():
    res, sid = _post({
        "jsonrpc": "2.0", "id": 1, "method": "initialize",
        "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                   "clientInfo": {"name": "amparo-es", "version": "1"}},
    })
    _post({"jsonrpc": "2.0", "method": "notifications/initialized"}, sid)
    return sid


def speak(sid, text, profile, lang="es"):
    res, _ = _post({
        "jsonrpc": "2.0", "id": 2, "method": "tools/call",
        "params": {"name": "voicebox.speak",
                   "arguments": {"text": text, "profile": profile, "language": lang}},
    }, sid)
    if not res or res.get("error"):
        return None, (res or {}).get("error")
    sc = res.get("result", {}).get("structuredContent")
    if not sc:
        try:
            sc = json.loads(res["result"]["content"][0]["text"])
        except Exception:
            sc = {}
    return sc, None


# Voicebox writes finished generations here as .wav, keyed by generation id.
# Not exposed by any MCP tool (list_captures is dictations IN, not TTS OUT) —
# found by watching the filesystem after a probe generation.
GEN_DIR = os.path.join(os.environ.get("APPDATA", ""), "sh.voicebox.app", "generations")


def gen_status(gid, timeout=90):
    """The status endpoint is an SSE stream, not plain JSON. Read until a
    terminal status arrives."""
    try:
        req = urllib.request.Request(BASE + f"/generate/{gid}/status")
        with urllib.request.urlopen(req, timeout=timeout) as r:
            for raw in r:
                line = raw.decode("utf-8", "replace").strip()
                if line.startswith("data: "):
                    line = line[6:]
                if not line.startswith("{"):
                    continue
                d = json.loads(line)
                if d.get("status") in ("completed", "failed", "error") or d.get("error"):
                    return d
    except Exception as e:
        return {"error": str(e)}
    return {"error": "stream ended with no terminal status"}


def collect(gid, out_mp3):
    """Copy the finished .wav out of Voicebox's store and transcode to mp3 so it
    matches every other clip the engine loads."""
    src = os.path.join(GEN_DIR, gid + ".wav")
    if not os.path.exists(src):
        return f"wav not found: {src}"
    os.makedirs(os.path.dirname(out_mp3), exist_ok=True)
    ff = shutil.which("ffmpeg")
    if not ff:
        return "ffmpeg not on PATH"
    # subprocess, not os.system — the ffmpeg path contains spaces and os.system
    # hands it to cmd.exe, which mis-parses it even when quoted.
    import subprocess
    p = subprocess.run([ff, "-y", "-loglevel", "error", "-i", src,
                        "-codec:a", "libmp3lame", "-qscale:a", "4", out_mp3],
                       capture_output=True, text=True)
    if p.returncode != 0 or not os.path.exists(out_mp3):
        return f"ffmpeg rc={p.returncode} {p.stderr.strip()[:120]}"
    return None


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "--list"

    if mode == "--list":
        print(f"{len(LINES)} lines x {len(VOICES)} voices = {len(LINES)*len(VOICES)} clips\n")
        for i, (cid, tone, txt) in enumerate(LINES, 1):
            for slot, prof in VOICES.items():
                print(f"  audio/es/{slot}/{cid}.mp3  [{tone:7}] {prof:6} {txt}")
        return

    sid = connect()
    print("connected to voicebox\n")

    todo = LINES[:1] if mode == "--probe" else LINES
    slots = {"m": VOICES["m"]} if mode == "--probe" else VOICES

    for cid, tone, txt in todo:
        for slot, prof in slots.items():
            out = f"audio/es/{slot}/{cid}.mp3"
            if os.path.exists(out):
                print(f"SKIP (exists) {out}")
                continue
            sc, err = speak(sid, txt, prof)
            if err:
                print(f"FAIL {out}: {err}")
                continue
            gid = sc.get("generation_id") or sc.get("id")
            if not gid:
                print(f"FAIL {out}: no generation id in {json.dumps(sc)[:200]}")
                continue
            st = gen_status(gid)
            if st.get("error") or st.get("status") != "completed":
                print(f"FAIL {out}: {json.dumps(st)[:200]}")
                continue
            err = collect(gid, out)
            if err:
                print(f"FAIL {out}: {err}")
            else:
                kb = os.path.getsize(out) // 1024
                print(f"OK   {out}  ({st.get('duration','?')}s, {kb}KB)")
            time.sleep(0.4)  # be gentle with the local app


if __name__ == "__main__":
    main()
