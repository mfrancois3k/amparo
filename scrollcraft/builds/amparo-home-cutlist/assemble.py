# -*- coding: utf-8 -*-
"""Assemble new/index.html for the 'The Deal' cutlist build.

Keeps, verbatim, the blocks that are not this build's business (head metadata,
the i18n and data script, renderNav and the sheet controller) and replaces the
style, the body markup, render() and the old 'The Line' script. Run from the
repo root. Idempotent only against the pre-build file: it asserts the markers
it expects, so a second run on its own output fails loudly rather than
double-wrapping.
"""
import io, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
PAGE = os.path.join(ROOT, 'new', 'index.html')
# Assemble from a frozen copy of the pre-build page, never from the working
# file: once the build is committed, the working file IS the build, and its
# markers are gone. source.html is `git show <pre-build>:new/index.html`.
SRC = os.path.join(os.path.dirname(__file__), 'source.html')
src = io.open(SRC, encoding='utf-8').read()
L = src.split('\n')

def idx(marker, start=0, exact=False):
    """exact=True matches a whole stripped line. Needed for tags that the old
    head also mentions inside prose comments ('<style>' appears in a comment
    about scrollcraft.css eight lines before the real tag); a substring match
    there sliced the head mid-comment and left the entire body commented out."""
    for i in range(start, len(L)):
        if (L[i].strip() == marker) if exact else (marker in L[i]):
            return i
    raise SystemExit('marker not found: ' + marker)

i_style   = idx('<style>', 0, True)
i_style_e = idx('</style>', i_style, True)
i_nav     = idx('<nav>', i_style_e, True)
i_aside_e = idx('</aside>', i_nav, True)
i_data    = idx('<script src="/us-paths.js', i_aside_e)
i_scen    = idx('var scenIo', i_data)
i_rnav    = idx('function renderNav', i_scen)
i_rnav_e  = idx('})();', i_rnav)

head = '\n'.join(L[:i_style])
data = '\n'.join(L[i_data:i_scen])
rnav = '\n'.join(L[i_rnav:i_rnav_e + 1])
assert '</head>' not in head and '<body' not in head, 'head slice reached into body'
for need in ("'navLinks'", "'navSheetLinks'", "'navSheetCta'"):
    assert need in rnav, 'renderNav no longer targets ' + need

# The supplied hero sub carries an em dash; the skill's hard rules ban one on
# screen. A colon, meaning unchanged.
data = data.replace("built from your own state's laws — your license", "built from your own state's laws: your license")
data = data.replace("las leyes de tu propio estado — tu licencia", "las leyes de tu propio estado: tu licencia")

EN_ADD = u'''
  cut1:"Lights in the mirror.", cut1s:"Every driver has felt this exact half-second.",
  cut3:"The danger is not the badge.", cut3s:"It is your own mind going blank.",
  cut4:"The words come without thinking.", cut4s:"Because you practiced them first.",
  cut5eye:"A real turn from the Arena",
  cut7:"Your six cards.", cut7s:"Fanned out of the header. Flick through them.",
  cut8:"Your license and insurance, printed in.", cut8s:"The window card faces the officer. Your hands stay on the wheel.",
  cut10:"Nothing leaves your phone.", cut10s:"No account by default. Photos never upload.",
  cut11:"Cada tarjeta, cada pantalla, en los dos idiomas.", cut11s:"Toca EN o ES arriba. Todo cambia.",
  cut12:"Print more. Give one away.", cut12s:"Put your name on it. That is what makes it travel.",
  dealTrigger:"Your six cards", dealClose:"Close", dealHint:"Flick the front card to deal it away",
  dealPrint:"Just print the cards", dealCards:[
    {n:"1", h:"If you get pulled over", s:"Hazards on. Engine off. Hands at 10 and 2."},
    {n:"2", h:"Window card", s:"Faces the officer. I am cooperating. My documents are displayed."},
    {n:"3", h:"Wallet card", s:"Three rights, folded. Your emergency contact on the back."},
    {n:"4", h:"Your script and their info", s:"Every word to say. Space for badge and car number."},
    {n:"5", h:"Family emergency plan", s:"Who to call, in what order. Stays at home."},
    {n:"6", h:"The case starts now", s:"What to write down in the first hour. Stays at home."}
  ],
  closeTitle:"Practice the stop before it happens.", closeSub:"Free scenario practice, and free bilingual cards. Both ready before you need them.",'''
ES_ADD = u'''
  cut1:"Luces en el espejo.", cut1s:"Todo conductor ha sentido este medio segundo exacto.",
  cut3:"El peligro no es la placa.", cut3s:"Es tu propia mente quedándose en blanco.",
  cut4:"Las palabras salen sin pensar.", cut4s:"Porque las practicaste primero.",
  cut5eye:"Un turno real de la Arena",
  cut7:"Tus seis tarjetas.", cut7s:"Salen del encabezado. Pásalas con el dedo.",
  cut8:"Tu licencia y seguro, impresos.", cut8s:"La tarjeta de ventana mira al oficial. Tus manos siguen en el volante.",
  cut10:"Nada sale de tu teléfono.", cut10s:"Sin cuenta por defecto. Las fotos nunca se suben.",
  cut11:"Every card, every screen, in both languages.", cut11s:"Tap EN or ES above. Everything switches.",
  cut12:"Imprime más. Regala una.", cut12s:"Pon tu nombre. Eso es lo que la hace llegar.",
  dealTrigger:"Tus seis tarjetas", dealClose:"Cerrar", dealHint:"Desliza la tarjeta del frente para repartirla",
  dealPrint:"Solo imprimir las tarjetas", dealCards:[
    {n:"1", h:"Si te detiene la policía", s:"Intermitentes. Motor apagado. Manos a las 10 y 2."},
    {n:"2", h:"Tarjeta de ventana", s:"Mira al oficial. Estoy cooperando. Mis documentos están a la vista."},
    {n:"3", h:"Tarjeta de cartera", s:"Tres derechos, doblada. Tu contacto de emergencia atrás."},
    {n:"4", h:"Tu guion y sus datos", s:"Cada palabra que decir. Espacio para placa y patrulla."},
    {n:"5", h:"Plan familiar de emergencia", s:"A quién llamar y en qué orden. Se queda en casa."},
    {n:"6", h:"El caso empieza ahora", s:"Qué anotar en la primera hora. Se queda en casa."}
  ],
  closeTitle:"Practica la parada antes de que pase.", closeSub:"Práctica de escenarios gratis, y tarjetas bilingües gratis. Ambas listas antes de que las necesites.",'''

def inject(block, obj, add):
    i = block.index('const %s = {' % obj)
    j = block.index('\n};', i)
    # lead with a comma: the object's last property may not carry a trailing one
    return block[:j] + ',\n' + add.rstrip().rstrip(',') + block[j:]

data = inject(data, 'EN', EN_ADD)
data = inject(data, 'ES', ES_ADD)

HERE = os.path.dirname(__file__)
def part(name):
    return io.open(os.path.join(HERE, 'parts', name), encoding='utf-8').read()

out = (head + '\n' + part('style.html') + '\n</head>\n<body>\n' + part('nav.html') + '\n'
       + part('deal-markup.html') + '\n' + data + '\n' + rnav + '\n' + part('render.js.html')
       + '\n' + part('deal.js.html') + '\n</body>\n</html>\n')
io.open(PAGE, 'w', encoding='utf-8').write(out)
print('written: %d lines, %d bytes' % (out.count('\n'), len(out.encode('utf-8'))))
