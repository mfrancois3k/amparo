#!/usr/bin/env python3
"""
Verifier for scout-supplied locators.

Scouts return (state, section, url). They are forbidden from supplying statute
text. This script is the ONLY path by which text enters the ledger.

Every defence here exists because a specific failure actually happened during
this project:
  - anchor check .......... justia over curl returns 4-5KB of page chrome, HTTP 200,
                            no statute. Indistinguishable from "statute is silent"
                            without requiring the section number to appear.
  - chrome stripping ...... "Sign up for our free summaries" matched /sign/ and
                            produced confident hits on pages containing no law.
  - pdf renegotiation ..... legis.iowa.gov serves HTML for .pdf URLs unless the
                            request sends Accept: application/pdf. Defeated seven
                            attempts across four passes.
  - shell detection ....... iga.in.gov returns 73 bytes, le.utah.gov 136,
                            azleg.gov 421. All HTTP 200.
  - iframe hint ........... palegis.us outer page is a navigation shell; statute
                            text lives only in the second iframe.
  - mid-word warning ...... an extract beginning mid-word means the window cut a
                            negation off the front. Nearly inverted Colorado.
"""
import re, sys, json, html, io, urllib.request, concurrent.futures as cf

UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124',
      'Accept': 'text/html,application/xhtml+xml,*/*'}
PDF_UA = dict(UA, Accept='application/pdf,*/*')
CHROME = ('Justia Legal Resources', 'Sign up for our free summaries',
          'Get free summaries of new opinions', 'Free Daily Summaries in Your Inbox',
          'Find a Lawyer', 'Ask a Lawyer')

def _clean(raw):
    s = re.sub(r'(?is)<(script|style|nav|footer|header)[^>]*>.*?</\1>', ' ', raw)
    for c in CHROME:
        s = s.replace(c, ' ')
    return re.sub(r'[ \t\xa0]+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))

def fetch(url):
    """Returns (text, note). Handles HTML, PDF, and pdf-served-as-html."""
    try:
        raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
    except Exception as e:
        return None, f'ERR {type(e).__name__}: {str(e)[:70]}'
    if raw[:4] == b'%PDF':
        return _pdf(raw), 'pdf'
    txt = _clean(raw.decode('utf-8', 'replace'))
    # content negotiation retry: a .pdf URL that answered with HTML
    if url.lower().endswith('.pdf'):
        try:
            raw2 = urllib.request.urlopen(urllib.request.Request(url, headers=PDF_UA), timeout=45).read()
            if raw2[:4] == b'%PDF':
                return _pdf(raw2), 'pdf via Accept renegotiation'
        except Exception:
            pass
    if len(txt) < 900:
        return txt, f'SHELL/BLOCK ({len(txt)} chars)'
    if 'iFrame' in raw.decode('utf-8', 'replace')[:60000] or '<iframe' in raw.decode('utf-8', 'replace')[:60000]:
        return txt, 'html (page has an iframe — statute text may live inside it)'
    return txt, 'html'

def _pdf(data):
    from pypdf import PdfReader
    return re.sub(r'[ \t\xa0]+', ' ',
                  ''.join((p.extract_text() or '') for p in PdfReader(io.BytesIO(data)).pages))

def extract(text, pattern, span=420, n=3):
    """Sentence-bounded windows. Flags any window that starts mid-word.

    Whitespace is collapsed FIRST: pypdf splits words across line breaks, so a
    correct multi-word pattern can silently miss text that is actually present.
    That is a false negative, the most dangerous outcome for this ledger.
    """
    text = re.sub(r'\s+', ' ', text)
    out = []
    for m in re.finditer(pattern, text, re.I):
        a = max(0, m.start() - 140)
        while a > 0 and text[a] not in '.;\n':
            a -= 1
        seg = re.sub(r'\s+', ' ', text[a:m.start() + span]).strip()
        flag = ''
        if seg and seg[0].islower():
            flag = '  [!] STARTS MID-WORD/CLAUSE — re-read from the sentence boundary; a negation may be cut off'
        out.append(seg + flag)
        if len(out) >= n:
            break
    return out

def run(item):
    st, sec, url, pat = item['state'], item['section'], item['url'], item.get('pattern', r'shall|must|may not|unless')
    text, note = fetch(url)
    if text is None:
        return st, sec, note, []
    if note.startswith('SHELL/BLOCK'):
        # a blocked page can echo the section number back in its own error text,
        # so the anchor check cannot be trusted here. Fail hard.
        return st, sec, f'BLOCKED [{note}] — too short to contain a statute', []
    anchor = re.sub(r'^[^0-9]*', '', sec).split()[0] if any(c.isdigit() for c in sec) else sec
    anchor = anchor.rstrip('.,;')
    if anchor and anchor.lower() not in text.lower():
        return st, sec, f'NO-STATUTE [{note}] anchor {anchor!r} absent in {len(text)} chars', []
    return st, sec, f'OK [{note}] {len(text)} chars', extract(text, pat)

def main(path):
    items = json.load(open(path, encoding='utf-8'))
    with cf.ThreadPoolExecutor(8) as ex:
        for st, sec, status, hits in ex.map(run, items):
            print(f'\n=== {st} — {sec}\n    {status}')
            for h in hits:
                print('  *', h[:460])
            if not hits and status.startswith('OK'):
                print('   (fetched and anchor-confirmed, but no keyword hit — widen the pattern)')

if __name__ == '__main__':
    main(sys.argv[1])
