"""Ingest Base44 scout output into the matrix as UNVERIFIED cells.
Usage: python ingest_inbox.py 'Column header' research/inbox/file.txt
Lines: STATE | SECTION|null|did not attempt | desc | remedy: x | URL | index-read
Every cell lands as UNVERIFIED (or null / did not attempt). Claude upgrades to VERIFIED only after fetching."""
import re, sys, subprocess
col, path = sys.argv[1], sys.argv[2]
n = 0
for line in open(path, encoding='utf-8'):
    p = [x.strip() for x in line.split('|')]
    if len(p) < 2 or not re.fullmatch(r'[A-Z]{2}', p[0]): continue
    st, sec = p[0], p[1]
    desc = p[2] if len(p) > 2 else ''
    rem  = p[3] if len(p) > 3 else ''
    url  = p[4] if len(p) > 4 else ''
    idx  = p[5] if len(p) > 5 else ''
    if sec.lower() == 'did not attempt': cell = '—'
    elif sec.lower() == 'null': cell = f'null (base44; index read: {idx or "unstated"})'
    else: cell = f'UNVERIFIED {sec} — {desc} [{rem}] <{url}>'
    subprocess.run([sys.executable, 'research/tools/set_cell.py', st, col, cell.replace('|','/')], check=True)
    n += 1
print(f'ingested {n} lines into "{col}" as UNVERIFIED')
