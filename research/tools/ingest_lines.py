# -*- coding: utf-8 -*-
"""Ingest STATE | COLUMN | VALUE lines into the matrix. Robust: each line is self-contained,
no positional risk. Usage: python ingest_lines.py file1.txt [file2.txt ...]"""
import re, subprocess, sys

P = 'research/state-matrix.md'
hdr = next(l for l in open(P, encoding='utf-8') if l.startswith('| State |'))
COLS = [c.strip() for c in hdr.strip().strip('|').split('|')][1:]

n_ok, n_bad = 0, 0
for path in sys.argv[1:]:
    for line in open(path, encoding='utf-8'):
        line = line.strip()
        if not line or not re.match(r'^[A-Z]{2}\s*\|', line):
            continue
        parts = [p.strip() for p in line.split('|')]
        if len(parts) < 3:
            print('BAD (too few fields):', line[:80]); n_bad += 1; continue
        st, col, val = parts[0], parts[1], '|'.join(parts[2:]).strip()
        if col not in COLS:
            print('BAD (unknown column %r):' % col, line[:80]); n_bad += 1; continue
        val = val.replace('|', '/')
        r = subprocess.run([sys.executable, 'research/tools/set_cell.py', st, col, val])
        if r.returncode == 0:
            n_ok += 1
        else:
            n_bad += 1
print('ingested %d cells, %d bad lines' % (n_ok, n_bad))
