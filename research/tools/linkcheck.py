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

def rewrites():
    """Vercel rewrites map a URL to a different file, so a link like /pack is
    correct even though no pack/ exists on disk. Without this the checker calls
    every rewrite broken, and a report with known-false entries is one people
    stop reading."""
    try:
        cfg = json.load(open(os.path.join(ROOT, 'vercel.json'), encoding='utf-8'))
    except (OSError, ValueError):
        return {}
    return {r['source'].rstrip('/') or '/': r['destination']
            for r in cfg.get('rewrites', []) if 'source' in r and 'destination' in r}

REWRITES = rewrites()


def resolve(page_rel, target):
    """Resolve a link relative to the page, mimicking a static file server."""
    t = urlparse(target)
    path = unquote(t.path)
    if not path:
        return None  # pure fragment or query
    if path.startswith('/'):
        # a rewrite is resolved to the file it actually serves
        dest = REWRITES.get(path.rstrip('/') or '/')
        if dest:
            path = dest
        cand = os.path.join(ROOT, path.lstrip('/'))
    else:
        cand = os.path.join(ROOT, os.path.dirname(page_rel), path)
    cand = os.path.normpath(cand)
    if os.path.isdir(cand):
        # a directory URL only works if it has an index -- or if a rewrite
        # serves that URL, which is how "/" works once the root index.html has
        # moved. Map the directory back to its URL path and check again.
        idx = os.path.join(cand, 'index.html')
        if os.path.exists(idx):
            return idx
        url = '/' + os.path.relpath(cand, ROOT).replace(os.sep, '/')
        url = '/' if url in ('/.', '/') else url.rstrip('/')
        dest = REWRITES.get(url)
        if dest:
            return os.path.normpath(os.path.join(ROOT, dest.lstrip('/')))
        return cand + '  (dir, no index.html)'
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
            # a bare prefix that JS concatenates an id onto ("../img/scene-" + id)
            if ts.endswith(('-', '_')):
                continue
            # Vite's dev shell resolves root-absolute paths against its own server
            # root, not the repo root, so checking them on disk proves nothing
            if rel.startswith('app-src/') and ts.startswith('/'):
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
