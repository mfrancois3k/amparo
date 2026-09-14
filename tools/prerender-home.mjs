import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
// Publish the same English markup used by render(), before any JS executes.
// This keeps SEO/no-JS content current without maintaining a second homepage.
const file='new/index.html';
const html=readFileSync(file,'utf8');
const source=html.match(/const EN = (\{[\s\S]*?\n\});/);
if(!source)throw new Error('Homepage EN copy was not found');
const c=vm.runInNewContext('('+source[1]+')');
const context={window:{}};
vm.runInNewContext(readFileSync('new/cinema-content.js','utf8'),context);
c.cinema=context.window.AmparoCinemaContent.en;
const content=context.window.amparoCinemaHTML(c,'en');
const next=html.replace(/<main id="app"(?: tabindex="-1")?>[\s\S]*?<\/main>/,'<main id="app" tabindex="-1">'+content+'</main>');
if(process.argv.includes('--check')){
  if(next!==html)throw new Error('Homepage prerender is stale: node tools/prerender-home.mjs');
  console.log('Homepage static markup matches bilingual renderer');
}else{writeFileSync(file,next);console.log('Prerendered homepage: '+content.length+' characters');}
