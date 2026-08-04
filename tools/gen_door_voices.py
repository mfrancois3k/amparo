"""Generate door-module officer clips (d70-d75) — same edge-tts voices and
tone mapping as gen_voices.py, so the door officer sounds like every other
level. One-time authoring. Output: <repo>/audio/<en|es>/<m|f>/d7N.mp3"""
import asyncio
import os

import edge_tts

REPO = r"C:\Users\mfran\Ai-Foundations\Amparo"

VOICES = {("en", "m"): "en-US-GuyNeural", ("en", "f"): "en-US-AriaNeural",
          ("es", "m"): "es-US-AlonsoNeural", ("es", "f"): "es-US-PalomaNeural"}
TONE = {"calm": ("+0%", "+0Hz"), "curt": ("+12%", "-2Hz"), "hostile": ("+30%", "-16Hz")}

# Must match PRX_DOOR officer lines in index.html exactly.
DOOR = [
    ("d70", "Good evening. Police department. Come to the door for me, please.",
            "Buenas noches. Policía. Acérquese a la puerta, por favor.", "calm"),
    ("d71", "We got a call about this address. Everything all right in there?",
            "Recibimos una llamada sobre esta dirección. ¿Todo bien ahí adentro?", "calm"),
    ("d72", "This would be easier inside. Open up for me.",
            "Esto sería más fácil adentro. Ábrame.", "curt"),
    ("d73", "Just step out here for a second so we can talk.",
            "Solo salga un momento para que hablemos.", "curt"),
    ("d74", "We have every right to come in there. Don't make this harder than it has to be.",
            "Tenemos todo el derecho de entrar. No lo haga más difícil de lo necesario.", "hostile"),
    ("d75", "Fine. We'll come back with a warrant. Your call.",
            "Bien. Volveremos con una orden. Usted decide.", "hostile"),
]


async def gen_one(sem: asyncio.Semaphore, text: str, voice: str,
                  rate: str, pitch: str, path: str) -> bool:
    async with sem:
        for attempt in range(3):
            try:
                tts = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
                await tts.save(path)
                return True
            except Exception as e:  # noqa: BLE001 — retry loop, final failure reported
                if attempt == 2:
                    print("FAIL", path, e)
                    return False
                await asyncio.sleep(2)
    return False


async def main() -> None:
    sem = asyncio.Semaphore(6)
    tasks = []
    for (jid, en, es, tone) in DOOR:
        rate, pitch = TONE[tone]
        for lg, txt in (("en", en), ("es", es)):
            for g in ("m", "f"):
                d = os.path.join(REPO, "audio", lg, g)
                os.makedirs(d, exist_ok=True)
                p = os.path.join(d, jid + ".mp3")
                if os.path.exists(p) and os.path.getsize(p) > 1000:
                    continue
                tasks.append(gen_one(sem, txt, VOICES[(lg, g)], rate, pitch, p))
    res = await asyncio.gather(*tasks)
    print(f"generated {sum(1 for r in res if r)}/{len(tasks)}")


asyncio.run(main())
