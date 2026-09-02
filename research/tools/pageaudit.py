# -*- coding: utf-8 -*-
"""Static QA audit across every tracked page.

Checks things that are objectively wrong or objectively missing, not matters of
taste. Each finding names the page and says what the fix is, because a report
that only says "12 issues" costs more to act on than it saves.

Usage: python research/tools/pageaudit.py
"""
import os, re, subprocess
from collections import defaultdict

ROOT = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

def tracked():
    out = subprocess.run(['git','ls-files','*.html'], cwd=ROOT,
                         capture_output=True, text=True).stdout.split('\n')
    return [p for p in out if p and 'node_modules' not in p]

def strip_comments(h):
    return re.sub(r'<!--.*?-->', '', h, flags=re.S)

findings = defaultdict(list)   # check -> [(page, detail)]

for rel in tracked():
    full = os.path.join(ROOT, rel)
    try:
        raw = open(full, encoding='utf-8', errors='replace').read()
    except OSError:
        continue
    h = strip_comments(raw)
    low = h.lower()

    # --- document head ---
    if '<html' in low and not re.search(r'<html[^>]*\blang\s*=', low):
        findings['no lang attribute'].append((rel, 'screen readers guess the language'))
    if '<title' not in low:
        findings['no <title>'].append((rel, ''))
    if not re.search(r'<meta[^>]+name=["\']viewport', low):
        findings['no viewport meta'].append((rel, 'page will not scale on phones'))
    if not re.search(r'<meta[^>]+name=["\']description', low):
        findings['no meta description'].append((rel, 'search + share previews'))

    # --- images ---
    imgs = re.findall(r'<img\b[^>]*>', h, re.I)
    noalt = [t for t in imgs if not re.search(r'\balt\s*=', t, re.I)]
    if noalt:
        findings['<img> missing alt'].append((rel, '%d of %d' % (len(noalt), len(imgs))))
    nodim = [t for t in imgs
             if not (re.search(r'\bwidth\s*=', t, re.I) and re.search(r'\bheight\s*=', t, re.I))
             and 'data:' not in t]
    if nodim:
        findings['<img> without width/height'].append((rel, '%d of %d -- causes layout shift' % (len(nodim), len(imgs))))

    # --- headings ---
    h1 = re.findall(r'<h1\b', low)
    if len(h1) == 0 and '<body' in low:
        findings['no <h1>'].append((rel, ''))
    elif len(h1) > 1:
        findings['multiple <h1>'].append((rel, '%d found' % len(h1)))

    # --- interactive ---
    # Report EVERY unlabelled control, not just the first on the page -- stopping
    # at the first turns a single audit into several rounds of whack-a-mole.
    for m in re.finditer(r'<button\b[^>]*>(.*?)</button>', h, re.I | re.S):
        inner = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        attrs = m.group(0)
        if not inner and not re.search(r'aria-label|aria-labelledby|title\s*=', attrs, re.I):
            ident = re.search(r'\b(?:id|class)\s*=\s*["\']([^"\']+)', attrs, re.I)
            findings['unlabelled button'].append((rel, ident.group(1)[:44] if ident else attrs[:44]))

    # a target=_blank without rel=noopener is a tabnabbing vector
    for m in re.finditer(r'<a\b[^>]*target\s*=\s*["\']_blank["\'][^>]*>', h, re.I):
        if 'noopener' not in m.group(0).lower():
            findings['target=_blank without rel=noopener'].append((rel, m.group(0)[:70]))
            break

print('AMPARO STATIC QA AUDIT')
print('pages scanned: %d' % len(tracked()))
print('=' * 68)
if not findings:
    print('no findings')
for check in sorted(findings, key=lambda k: -len(findings[k])):
    rows = findings[check]
    print('\n%s  (%d page%s)' % (check.upper(), len(rows), '' if len(rows) == 1 else 's'))
    for page, detail in rows[:12]:
        print('   %-46s %s' % (page, detail))
    if len(rows) > 12:
        print('   ... and %d more' % (len(rows) - 12))
