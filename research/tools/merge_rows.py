"""Merge scout-returned table rows into research/state-matrix.md.
Usage: python merge_rows.py rows.txt   (rows.txt = lines like '| **AL** Alabama | c1 | ... | c18 |')
Overwrites the row for each state code found; never appends below the table."""
import re, sys
P = 'research/state-matrix.md'
NCOLS = 18
src = open(P, encoding='utf-8').read()
new = {}
for line in open(sys.argv[1], encoding='utf-8'):
    m = re.match(r'\|\s*\*\*([A-Z]{2})\*\*', line)
    if not m: continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if len(cells) != NCOLS + 1:
        print(f'SKIPPED {m.group(1)}: {len(cells)-1} cells, expected {NCOLS} -- fix by hand, not merged')
        continue
    new[m.group(1)] = '| ' + ' | '.join(cells) + ' |'
out, hit = [], 0
for line in src.splitlines():
    m = re.match(r'\|\s*\*\*([A-Z]{2})\*\*', line)
    if m and m.group(1) in new:
        line = new[m.group(1)]; hit += 1
    out.append(line)
open(P, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(f'merged {hit} rows: {sorted(new)}')
