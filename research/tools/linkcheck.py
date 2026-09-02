# -*- coding: utf-8 -*-
"""Internal link + asset audit for the Amparo site.

Checks every tracked .html page for links and asset references that cannot
resolve on disk. Static-only: it does not run JS, so links written by script are
reported separately as UNRESOLVED rather than as broken, since this tool cannot
prove either way.

Usage: python research/tools/linkcheck.py [--json]
"""
import os, re, sys, json, subprocess
from urllib.parse import urlparse, unquote

ROOT = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

SKIP_PREFIX = ('http://', 'https://', 'mailto:', 'tel:', 'sms:', 'data:', 'javascript:', '#', 'blob:')

def tracked_html():
    out = subprocess.run(['git', 'ls-files', '*.html'], cwd=ROOT,
                         capture_output=True, text=True).stdout.split('\n')
    return [p for p in out if p and 'node_modules' not in p]

ATTR = re.compile(r'''\b(?:href|src|poster|data-src)\s*=\s*["']([^"']+)["']''', re.I)
SRCSET = re.compile(r'''\bsrcset\s*=\s*["']([^"']+)["']''', re.I)

def resolve(page_rel, target):
    """Resolve a link relative to the page, mimicking a static file server."""
    t = urlparse(target)
    path = unquote(t.path)
    if not path:
        return None  # pure fragment or query
    if path.startswith('/'):
        cand = os.path.join(ROOT, path.lstrip('/'))
    else:
        cand = os.path.join(ROOT, os.path.dirname(page_rel), path)
    cand = os.path.normpath(cand)
    if os.path.isdir(cand):
        # a directory URL only works if it has an index
        idx = os.path.join(cand, 'index.html')
        return idx if os.path.exists(idx) else cand + '  (dir, no index.html)'
    return cand

def main():
    broken, checked, pages = [], 0, tracked_html()
    for rel in pages:
        full = os.path.join(ROOT, rel)
        try:
            html = open(full, encoding='utf-8', errors='replace').read()
        except OSError:
            continue
        targets = set(ATTR.findall(html))
        for ss in SRCSET.findall(html):
            for part in ss.split(','):
                u = part.strip().split(' ')[0]
                if u:
                    targets.add(u)
        for t in targets:
            ts = t.strip()
            if not ts or ts.lower().startswith(SKIP_PREFIX):
                continue
            # links assembled by JS -- template holes we cannot resolve statically
            if '${' in ts or '{{' in ts or ts.startswith('?'):
                continue
            checked += 1
            got = resolve(rel, ts)
            if got is None:
                continue
            if got.endswith('(dir, no index.html)') or not os.path.exists(got):
                broken.append({'page': rel, 'link': ts,
                               'resolved': os.path.relpath(got.split('  (')[0], ROOT)})
    print('pages scanned : %d' % len(pages))
    print('links checked : %d' % checked)
    print('BROKEN        : %d' % len(broken))
    if broken:
        print()
        by_page = {}
        for b in broken:
            by_page.setdefault(b['page'], []).append(b)
        for pg in sorted(by_page):
            print('%s' % pg)
            for b in by_page[pg]:
                print('    %-42s -> %s' % (b['link'][:42], b['resolved']))
    if '--json' in sys.argv:
        open(os.path.join(ROOT, 'research/inbox/linkcheck.json'), 'w',
             encoding='utf-8').write(json.dumps(broken, indent=1))

main()
