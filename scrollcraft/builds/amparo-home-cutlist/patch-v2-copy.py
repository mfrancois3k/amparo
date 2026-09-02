# -*- coding: utf-8 -*-
"""One-shot: write the v2 copy keys into assemble.py's EN_ADD/ES_ADD and add
the door-cut ground to style.html. Sourced from copy-v2.md (the copy agent's
pass over new/index.html, arena/index.html, pack.html, states-data.js)."""
import io, os

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'assemble.py')
s = io.open(A, encoding='utf-8').read()

EN_NEW = u'''
  heroSub:"A free bilingual tool for police encounters: traffic stops, checkpoints, a knock at your door. Practice the words out loud, then print six cards built from your state's laws, plus a verified lifeline to a lawyer who takes your call.",
  cut1:"Lights in the mirror.", cut1s:"Every driver has felt this exact half-second.",
  cut7:"Your six cards.", cut7s:"Fanned out of the header. Flick through them.",
  cut10:"Nothing leaves your phone.", cut10s:"No account by default. Photos never upload.",
  cut11:"Cada tarjeta, cada pantalla, en los dos idiomas.", cut11s:"Toca EN o ES arriba. Todo cambia.",
  cut12:"Print more. Give one away.", cut12s:"Put your name on it. That is what makes it travel.",
  encounters:[
    {id:"traffic", heading:"Traffic stop", live:true, feel:"Lights in your mirror, and your mind going blank.", officer:"Do you know why I stopped you?", reply:"I'd rather not guess, officer."},
    {id:"checkpoint", heading:"Border Patrol checkpoint", live:true, feel:"Cones and floodlights. Not local police, Border Patrol.", officer:"Citizenship?", reply:"I'm not answering questions, agent.", note:"Rehearsal only, not reviewed by an immigration attorney."},
    {id:"door", heading:"At your door", live:false, statusLabel:"Coming soon", feel:"A knock at your door. An officer outside, no warning at all.", officer:"We have a warrant. Open up.", reply:"Slide it under the door so I can read it.", note:"Written, and held for attorney review before it goes live."}
  ],
  whatToSayHead:"What to say.",
  whatToSayRights:["I am remaining silent.","My documents are displayed here. I will hand them over on request, my hands are staying visible until then.","I do not consent to any search.","If I am being detained, please tell me why.","If I am not being detained, am I free to go?"],
  whatToSayAmend:["5th Amendment","","4th Amendment","",""],
  whatToSayClose:"Say them out loud now, so they're already there when it counts.",
  lawyerHead:"A real lawyer, in your state.",
  lawyerBody:"Your wallet card prints verified lifelines for your state: legal aid, an attorney referral line, hotlines that actually pick up. Add your own attorney's number and it prints too.",
  lawyerExamples:[
    {state:"Texas", name:"State Bar of Texas Referral", what:"Matches you to a vetted attorney. $20 for a 30-minute consult."},
    {state:"Georgia", name:"GeorgiaLegalAid.org", what:"Free official directory of legal help across Georgia, routed by county."},
    {state:"New York", name:"LawHelpNY.org", what:"Free official directory of legal help across New York, searchable by county or ZIP."}
  ],
  lawyerHonesty:"Every number is labeled honestly: a number that doesn't answer is worse than no number at all.",
  dealTrigger:"Your six cards", dealClose:"Close", dealHint:"Flick the front card to deal it away",
  dealPrint:"Just print the cards", dealCards:[
    {n:"1", h:"If you get pulled over", s:"Hazards on. Engine off. Hands at 10 and 2."},
    {n:"2", h:"Window card", s:"Faces the officer. I am cooperating. My documents are displayed."},
    {n:"3", h:"Wallet card", s:"Three rights, folded, plus a lawyer or hotline verified for your state."},
    {n:"4", h:"Your script and their info", s:"Every word to say when you're stopped, plus their badge number."},
    {n:"5", h:"Family emergency plan", s:"Checkpoint rules and your family's plan if something goes wrong."},
    {n:"6", h:"The case starts now", s:"What to do after: the ticket, your phone, and vanishing evidence."}
  ],
  closeTitle:"Practice every encounter before it happens.", closeSub:"Free scenario practice, and free bilingual cards. Both ready before you need them.",'''

ES_NEW = u'''
  heroSub:"Un recurso bilingüe gratuito para encuentros con la policía: paradas de tráfico, retenes, un toque en tu puerta. Practica en voz alta, luego imprime seis tarjetas con las leyes de tu estado y una línea directa a un abogado que conteste tu llamada.",
  cut1:"Luces en el espejo.", cut1s:"Todo conductor ha sentido este medio segundo exacto.",
  cut7:"Tus seis tarjetas.", cut7s:"Salen del encabezado. Pásalas con el dedo.",
  cut10:"Nada sale de tu teléfono.", cut10s:"Sin cuenta por defecto. Las fotos nunca se suben.",
  cut11:"Every card, every screen, in both languages.", cut11s:"Tap EN or ES above. Everything switches.",
  cut12:"Imprime más. Regala una.", cut12s:"Pon tu nombre. Eso es lo que la hace llegar.",
  encounters:[
    {id:"traffic", heading:"Parada de tráfico", live:true, feel:"Luces en el espejo, y tu mente quedándose en blanco.", officer:"¿Sabe por qué lo detuve?", reply:"Prefiero no adivinar, oficial."},
    {id:"checkpoint", heading:"Retén de la Patrulla Fronteriza", live:true, feel:"Conos y reflectores. No es la policía local, es la Patrulla Fronteriza.", officer:"¿Ciudadanía?", reply:"No voy a responder preguntas, agente.", note:"Solo ensayo, no revisado por un abogado de inmigración."},
    {id:"door", heading:"En tu puerta", live:false, statusLabel:"Próximamente", feel:"Tocan a tu puerta. Un oficial afuera, sin ningún aviso.", officer:"Tenemos una orden. Abra.", reply:"Pásela bajo la puerta para leerla.", note:"Escrito, y en revisión por abogados antes de activarse."}
  ],
  whatToSayHead:"Qué decir.",
  whatToSayRights:["Guardo silencio.","Mis documentos están aquí. Los entregaré si me los pide, mis manos permanecen visibles.","No doy consentimiento para ningún registro.","Si estoy detenido/a, por favor dígame por qué.","Si no estoy detenido/a, ¿puedo irme?"],
  whatToSayAmend:["5.ª Enmienda","","4.ª Enmienda","",""],
  whatToSayClose:"Dilas en voz alta ahora, para que estén ahí cuando importen.",
  lawyerHead:"Un abogado real, en tu estado.",
  lawyerBody:"Tu tarjeta de cartera imprime las líneas verificadas de tu estado: ayuda legal, referencia a un abogado, números que sí contestan. Agrega tu propio abogado y también se imprime.",
  lawyerExamples:[
    {state:"Texas", name:"State Bar of Texas Referral", what:"Lo conecta con un abogado verificado. $20 por una consulta de 30 minutos."},
    {state:"Georgia", name:"GeorgiaLegalAid.org", what:"Directorio oficial gratuito de ayuda legal en Georgia, dirigido por condado."},
    {state:"Nueva York", name:"LawHelpNY.org", what:"Directorio oficial gratuito de ayuda legal en Nueva York, con búsqueda por condado o código postal."}
  ],
  lawyerHonesty:"Cada número está etiquetado con honestidad: uno que no contesta es peor que ningún número.",
  dealTrigger:"Tus seis tarjetas", dealClose:"Cerrar", dealHint:"Desliza la tarjeta del frente para repartirla",
  dealPrint:"Solo imprimir las tarjetas", dealCards:[
    {n:"1", h:"Si te detiene la policía", s:"Intermitentes. Motor apagado. Manos a las 10 y 2."},
    {n:"2", h:"Tarjeta de ventana", s:"Mira al oficial. Estoy cooperando. Mis documentos están a la vista."},
    {n:"3", h:"Tarjeta de cartera", s:"Tres derechos, doblados, más un abogado o línea verificada para tu estado."},
    {n:"4", h:"Tu guion y sus datos", s:"Cada palabra para la parada, más el número de su placa."},
    {n:"5", h:"Plan familiar de emergencia", s:"Reglas del retén y el plan de tu familia si sale mal."},
    {n:"6", h:"El caso empieza ahora", s:"Qué hacer después: la multa, tu teléfono y la evidencia que desaparece."}
  ],
  closeTitle:"Practica cada encuentro antes de que pase.", closeSub:"Práctica de escenarios gratis, y tarjetas bilingües gratis. Ambas listas antes de que las necesites.",'''

def swap(src, name, new):
    i = src.index(name + " = u'''")
    j = src.index("'''", i + len(name) + 6) + 3
    return src[:i] + name + " = u'''" + new + "'''" + src[j:]

s = swap(s, 'EN_ADD', EN_NEW)
s = swap(s, 'ES_ADD', ES_NEW)
io.open(A, 'w', encoding='utf-8').write(s)
print('assemble.py: v2 EN/ES keys written')

Q = os.path.join(HERE, 'parts', 'style.html')
t = io.open(Q, encoding='utf-8').read()
o = '/* act 11: the other language */'
n = ('/* act 5, the door: no photograph exists for it yet, so the cut is type on the\n'
     '   deepest navy with one hard gold rule, the way a warrant reads: a line you\n'
     '   cannot argue with. Not an empty screen. */\n'
     '.cut--door{background:#070E1C;background-image:radial-gradient(90% 70% at 20% 100%,rgba(232,184,75,.10),rgba(232,184,75,0) 70%)}\n'
     '.cut--door .copy{border-left:3px solid var(--gold);padding-left:clamp(16px,2.4vw,28px);max-width:min(92vw,760px)}\n'
     '/* kinetic line masks need a little more leading than a 1.0 display face: the\n'
     '   engine pads the mask .14em for descenders and the line box has to allow it */\n'
     '.cut h1[data-sc-kinetic],.cut h2[data-sc-kinetic]{line-height:1.06}\n'
     '/* act 11: the other language */')
assert t.count(o) == 1, 'style marker'
io.open(Q, 'w', encoding='utf-8').write(t.replace(o, n))
print('style.html: door ground + kinetic leading added')
