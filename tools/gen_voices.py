"""Generate Amparo officer voice clips — neural Edge TTS, one-time authoring.
Output: <repo>/audio/<en|es>/<m|f>/<id>.mp3  (~196 clips)"""
import asyncio, json, os, sys
import edge_tts

REPO = r"C:\Users\mfran\Ai-Foundations\Amparo"

VOICES = {("en","m"):"en-US-GuyNeural", ("en","f"):"en-US-AriaNeural",
          ("es","m"):"es-US-AlonsoNeural", ("es","f"):"es-US-PalomaNeural"}
# tone → delivery baked into the clip
TONE = {"calm":("+0%","+0Hz"), "curt":("+12%","-2Hz"), "hostile":("+30%","-16Hz")}

VAR = {
 0:[("License and registration, please.","Licencia y registro, por favor.","calm"),
    ("Good evening. I'm going to need your license, registration, and proof of insurance.","Buenas noches. Voy a necesitar su licencia, el registro y la prueba de seguro.","calm"),
    ("License and registration.","Licencia y registro.","curt"),
    ("Documents. License, registration. Let's go.","Documentos. Licencia, registro. Vamos.","curt"),
    ("License. Registration. Now, please.","Licencia. Registro. Ahora, por favor.","hostile"),
    ("I've asked twice. License and registration. Hand them over.","Ya se lo pedí dos veces. Licencia y registro. Entréguemelos.","hostile")],
 1:[("So, where are you coming from tonight?","A ver, ¿de dónde viene esta noche?","calm"),
    ("Where you headed? Coming from somewhere fun?","¿Para dónde va? ¿Viene de algún lado divertido?","calm"),
    ("Where are you coming from?","¿De dónde viene?","curt"),
    ("Coming from where? It's a simple question.","¿Viene de dónde? Es una pregunta sencilla.","curt"),
    ("Where were you tonight? Don't make this difficult.","¿Dónde estuvo esta noche? No lo haga difícil.","hostile"),
    ("I asked where you're coming from. Answer me.","Le pregunté de dónde viene. Contésteme.","hostile")],
 2:[("You don't mind if I take a quick look in the car, right?","No le molesta si le echo un vistazo rápido al carro, ¿verdad?","calm"),
    ("Mind if I take a look inside? Just routine.","¿Le importa si reviso adentro? Es pura rutina.","calm"),
    ("I'm going to check the vehicle. That okay with you?","Voy a revisar el vehículo. ¿Está de acuerdo?","curt"),
    ("Pop the trunk for me. You're fine with that, right?","Ábrame la cajuela. No hay problema, ¿verdad?","curt"),
    ("If there's nothing in there, this takes two minutes. Can I search it or not?","Si no hay nada ahí, esto toma dos minutos. ¿Puedo revisar o no?","hostile")],
 3:[("Sir, I need you to step out of the vehicle for me.","Señor, necesito que se baje del vehículo, por favor.","calm"),
    ("Go ahead and step out of the car, please.","Bájese del carro, por favor.","calm"),
    ("Step out of the vehicle.","Bájese del vehículo.","curt"),
    ("Out of the car. Keep your hands where I can see them.","Fuera del carro. Mantenga las manos donde pueda verlas.","curt"),
    ("Step out. Now. Hands visible.","Bájese. Ya. Las manos a la vista.","hostile")],
 4:[("Have you had anything to drink tonight?","¿Ha tomado algo esta noche?","calm"),
    ("Just a couple beers, right? Be honest with me.","Solo un par de cervezas, ¿verdad? Sea honesto conmigo.","calm"),
    ("How much have you had to drink?","¿Cuánto ha tomado?","curt"),
    ("I can smell it. How many drinks?","Se le siente el olor. ¿Cuántos tragos?","curt"),
    ("How many. Give me a number.","Cuántos. Deme un número.","hostile")],
 5:[("I need your signature here. It's not an admission of guilt.","Necesito su firma aquí. No es una admisión de culpa.","calm"),
    ("Sign at the bottom, please. It just means you received the citation.","Firme abajo, por favor. Solo confirma que recibió la citación.","calm"),
    ("Sign here.","Firme aquí.","curt"),
    ("Signature. Right there on the line.","Su firma. Ahí en la línea.","curt")],
 6:[("Alright, here's your citation. Drive safe.","Bueno, aquí tiene su citación. Maneje con cuidado.","calm"),
    ("Okay, we're about done here.","Bien, ya casi terminamos aquí.","calm"),
    ("Here's your paperwork back.","Aquí tiene sus documentos.","curt"),
    ("We're done. For now.","Terminamos. Por ahora.","curt")],
 7:[("You're under arrest. Turn around and put your hands behind your back.","Queda bajo arresto. Voltéese y ponga las manos detrás de la espalda.","calm"),
    ("At this point you're being placed under arrest.","En este momento queda usted bajo arresto.","calm"),
    ("You're under arrest. Hands behind your back.","Está bajo arresto. Las manos atrás.","curt"),
    ("Turn around. You're under arrest.","Voltéese. Queda arrestado.","curt")],
}
CURVE = [
 ("Where you headed in such a hurry?","¿Para dónde va con tanta prisa?","calm"),
 ("You seem pretty nervous. Something wrong?","Se le ve bastante nervioso. ¿Pasa algo?","calm"),
 ("This your car? Whose car is this?","¿Este carro es suyo? ¿De quién es este carro?","curt"),
 ("If you've got nothing to hide, why not let me look?","Si no tiene nada que esconder, ¿por qué no me deja revisar?","curt"),
 ("It'll go a lot easier for you if you cooperate.","Todo va a ser mucho más fácil si coopera.","hostile"),
 ("Just level with me and we can wrap this up.","Sea sincero conmigo y terminamos con esto rápido.","calm"),
 ("Mind opening the glovebox for me real quick?","¿Me abre la guantera un segundito?","calm"),
 ("Got anything in the car I should know about?","¿Trae algo en el carro que yo deba saber?","curt"),
 ("Why are you being so difficult? Most people just answer.","¿Por qué se pone tan difícil? La mayoría simplemente contesta.","hostile"),
 ("You been through here before? I've seen this car around.","¿Ya ha pasado por aquí antes? He visto este carro por la zona.","calm"),
]

def jobs():
    for beat, arr in VAR.items():
        for i,(en,es,tone) in enumerate(arr):
            yield (f"v{beat}_{i}", en, es, tone)
    for i,(en,es,tone) in enumerate(CURVE):
        yield (f"c{i}", en, es, tone)

async def gen_one(sem, text, voice, rate, pitch, path):
    async with sem:
        for attempt in range(3):
            try:
                tts = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
                await tts.save(path)
                return True
            except Exception as e:
                if attempt == 2:
                    print("FAIL", path, e)
                    return False
                await asyncio.sleep(2)

async def main():
    sem = asyncio.Semaphore(6)
    tasks = []
    for (jid, en, es, tone) in jobs():
        rate, pitch = TONE[tone]
        for lg, txt in (("en", en), ("es", es)):
            for g in ("m","f"):
                d = os.path.join(REPO, "audio", lg, g)
                os.makedirs(d, exist_ok=True)
                p = os.path.join(d, jid + ".mp3")
                if os.path.exists(p) and os.path.getsize(p) > 1000:
                    continue
                tasks.append(gen_one(sem, txt, VOICES[(lg,g)], rate, pitch, p))
    res = await asyncio.gather(*tasks)
    print(f"generated {sum(1 for r in res if r)}/{len(tasks)}")

asyncio.run(main())
