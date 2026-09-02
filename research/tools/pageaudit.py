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
    return [p for p in out if p and 'node_modules' not in p and not p.startswith('.design-handoff/')]

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
    # An image only shifts layout if nothing reserves its box. HTML width/height
    # attributes are one way; CSS is just as good, and demanding attributes on an
    # inset:0 overlay or a fixed-size avatar is noise, not a finding. So resolve
    # each image's classes and id against the page's own CSS before flagging it.
    # A descendant rule (".di img{height:100%}") reserves the box just as well as
    # an attribute. Computed once per page: scanning per-image with an unanchored
    # selector pattern backtracks catastrophically on a large stylesheet.
    img_rule_sets_height = any(
        re.search(r'(?:^|[;\s])height\s*:', body, re.I)
        for sel, body in re.findall(r'([^{}]{0,200})\{([^{}]{0,2000})\}', h)
        if re.search(r'\bimg\s*$', sel))

    def is_sized(tag):
        if re.search(r'\bwidth\s*=', tag, re.I) and re.search(r'\bheight\s*=', tag, re.I):
            return True
        style = re.search(r'\bstyle\s*=\s*["\']([^"\']*)', tag, re.I)
        if style and re.search(r'height\s*:', style.group(1), re.I):
            return True
        sels = re.findall(r'\bclass\s*=\s*["\']([^"\']*)', tag, re.I)
        sels = [c for s in sels for c in s.split()]
        sels += ['#' + m.group(1) for m in re.finditer(r'\bid\s*=\s*["\']([^"\']+)', tag, re.I)]
        if img_rule_sets_height:
            return True
        for sel in sels:
            token = sel if sel.startswith('#') else r'\.' + re.escape(sel)
            # a rule naming this selector that reserves a box or takes the img out of flow
            for rule in re.finditer(token + r'[^{}]*\{([^}]*)\}', h):
                if re.search(r'(?:^|[;\s])(?:height|aspect-ratio)\s*:', rule.group(1), re.I) \
                   or re.search(r'position\s*:\s*(?:absolute|fixed)', rule.group(1), re.I):
                    return True
        return False

    nodim = [t for t in imgs if 'data:' not in t and not is_sized(t)]
    if nodim:
        findings['<img> with no reserved box'].append(
            (rel, '%d of %d -- no width/height and no CSS box: %s' % (
                len(nodim), len(imgs), nodim[0][:52])))

    # --- headings ---
    h1 = re.findall(r'<h1\b', low)
    # An SPA shell is an empty mount point plus a module script; its headings come
    # from JS, so "no <h1>" here says nothing about the page actually delivered.
    is_spa_shell = bool(re.search(r'<div[^>]+id=["\']root["\'][^>]*>\s*</div>', low)) \
        and 'type="module"' in low
    if len(h1) == 0 and '<body' in low and not is_spa_shell:
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
