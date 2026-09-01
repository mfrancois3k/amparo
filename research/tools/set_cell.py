"""Set one cell. Usage: python set_cell.py STATE 'Column header' 'cell text'"""
import re, sys
P = 'research/state-matrix.md'
st, col, val = sys.argv[1], sys.argv[2], sys.argv[3].replace('|', '/')
lines = open(P, encoding='utf-8').read().splitlines()
hdr = next(l for l in lines if l.startswith('| State |'))
cols = [c.strip() for c in hdr.strip('|').split('|')]
ci = cols.index(col)
for i, l in enumerate(lines):
    if re.match(r'\|\s*\*\*' + st + r'\*\*', l):
        cells = [c.strip() for c in l.strip().strip('|').split('|')]
        cells[ci] = val
        lines[i] = '| ' + ' | '.join(cells) + ' |'
        break
else: raise SystemExit('state not found')
open(P, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(f'{st} / {col} <- {val[:60]}')
