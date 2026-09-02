# -*- coding: utf-8 -*-
"""Fetch a statute page and emit clean VERBATIM text.

Verbatim is the whole point of this tool, so it is fussy about two things that
silently corrupt statutory text:

  1. ENCODING. Many state hosts serve cp1252 (or mislabel it). Decoding those
     bytes as utf-8 turns the section symbol and curly quotes into U+FFFD, and a
     mangled quotation mark in a statute you are calling "verbatim" is a lie.
     We honour the declared charset, then sniff, then fall back to cp1252 --
     never utf-8-with-replace.
  2. WHITESPACE. Statutory subsection structure carries meaning. We collapse runs
     of spaces but preserve line breaks, so (a)/(b)/(1)/(i) markers stay legible.

Usage: python fetch_statute.py <url> [anchor] [--raw]
"""
import re, sys, html, urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124',
      'Accept': 'text/html,application/xhtml+xml,*/*'}


def decode(raw, headers):
    # 1. charset from the Content-Type header
    ctype = headers.get('Content-Type', '') if headers else ''
    m = re.search(r'charset=["\']?([\w-]+)', ctype, re.I)
    cands = [m.group(1)] if m else []
    # 2. charset declared in the document itself
    head = raw[:4096].decode('latin-1', 'ignore')
    m2 = re.search(r'charset=["\']?([\w-]+)', head, re.I)
    if m2:
        cands.append(m2.group(1))
    # 3. utf-8 STRICT -- only accept if it decodes cleanly, no replacement chars
    cands += ['utf-8', 'cp1252', 'latin-1']
    for enc in cands:
        try:
            out = raw.decode(enc)
            if '�' not in out:
                return out, enc
        except (UnicodeDecodeError, LookupError):
            continue
    return raw.decode('cp1252', 'replace'), 'cp1252-lossy'


def clean(txt):
    txt = re.sub(r'(?is)<(script|style|nav|footer|header|noscript)[^>]*>.*?</\1>', ' ', txt)
    txt = re.sub(r'(?i)<br\s*/?>', '\n', txt)
    txt = re.sub(r'(?i)</(p|div|li|tr)>', '\n', txt)
    txt = html.unescape(re.sub(r'<[^>]+>', ' ', txt))
    txt = txt.replace(' ', ' ')
    txt = re.sub(r'[ \t]+', ' ', txt)
    txt = re.sub(r' *\n *', '\n', txt)
    txt = re.sub(r'\n{3,}', '\n\n', txt)
    return txt.strip()


def fetch(url, anchor=None):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        raw = r.read()
        hdrs = r.headers
    if raw[:4] == b'%PDF':
        try:
            import pypdf, io
            pages = pypdf.PdfReader(io.BytesIO(raw)).pages
            body = '\n'.join(p.extract_text() or '' for p in pages)
            return re.sub(r'[ \t]+', ' ', body), 'pdf'
        except Exception as e:
            return '[PDF, extraction failed: %s]' % e, 'pdf-failed'
    txt, enc = decode(raw, hdrs)
    body = clean(txt)
    if anchor:
        i = body.find(anchor)
        if i >= 0:
            body = body[i:]
    return body, enc


if __name__ == '__main__':
    url = sys.argv[1]
    anchor = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None
    body, enc = fetch(url, anchor)
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    print('[encoding: %s]' % enc)
    print(body[:12000])
