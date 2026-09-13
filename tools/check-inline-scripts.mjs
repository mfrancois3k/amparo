import { readFileSync } from 'node:fs';
const files = process.argv.slice(2);
let failed = false;
for (const file of files.length ? files : ['pack.html', 'new/index.html', 'arena/index.html', 'new/aid.html']) {
  let count = 0;
  for (const match of readFileSync(file, 'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|application\/(?:ld\+)?json/i.test(match[1])) continue;
    count++;
    try { new Function(match[2]); }
    catch (error) { failed = true; console.error(`${file}: inline block ${count}: ${error.message}`); }
  }
  console.log(`${file}: checked ${count} inline scripts`);
}
if (failed) process.exit(1);
