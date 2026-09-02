"""Wrapper: fetch a justia statute page via fetch_statute.py and print just the
code text (between the second 'Section' heading and the Disclaimer line)."""
import sys, subprocess

url = sys.argv[1]
out = subprocess.run([sys.executable, "research/tools/fetch_statute.py", url],
                      capture_output=True, text=True, encoding="utf-8").stdout
lines = out.split("\n")
enc_line = lines[0] if lines and lines[0].startswith("[encoding") else ""
# find the body: after the 2nd occurrence of a line starting with "Section "
idxs = [i for i, l in enumerate(lines) if l.strip().startswith("Section ")]
start = idxs[1] if len(idxs) > 1 else (idxs[0] if idxs else 0)
end = next((i for i, l in enumerate(lines) if l.strip().startswith("Disclaimer:")), len(lines))
body = "\n".join(lines[start:end]).strip()
print(enc_line)
print()
print(body)
