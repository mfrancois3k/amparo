import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';

const read = name => readFileSync(new URL('../new/'+name,import.meta.url),'utf8');
function math() {
  // Evaluate the shipped controller without a mounted hero or image requests.
  const sandbox={window:{},document:{querySelector:()=>null}};
  vm.runInNewContext(read('cinema-motion.js'),sandbox);
  const value=sandbox.window.AmparoCinemaMath;
  assert.ok(value,'controller exposes its scroll/frame mapping');return value;
}
function render(language) {
  const sandbox={window:{}};vm.runInNewContext(read('cinema-content.js'),sandbox);
  const c={cinema:sandbox.window.AmparoCinemaContent[language],heroCta:language==='es'?'Practicar una parada de tráfico':'Practice a Traffic Stop'};
  return sandbox.window.amparoCinemaHTML(c,language);
}
test('scroll progress is bounded before and after the sticky section',()=>{
  const {clamp,frameAt}=math();
  assert.equal(clamp(-2),0);assert.equal(clamp(2),1);assert.equal(clamp(.42),.42);
  assert.equal(frameAt(-.5,75),0);assert.equal(frameAt(1.5,75),74);
});
test('frame endpoints, midpoint and a single-frame fallback stay inside the sequence',()=>{
  const {frameAt}=math();
  assert.equal(frameAt(0,75),0);assert.equal(frameAt(.5,75),37);assert.equal(frameAt(1,75),74);
  for(const p of [-1,0,.3,.9,1,2])assert.equal(frameAt(p,1),0);
});
test('scroll reversal immediately maps to the earlier frame',()=>{
  const {frameAt}=math();
  assert.deepEqual([0,.25,.5,.75,1].map(p=>frameAt(p,75)),[0,19,37,56,74]);
  assert.deepEqual([1,.75,.5,.25,0].map(p=>frameAt(p,75)),[74,56,37,19,0]);
  assert.equal(frameAt(.5,75),37);assert.equal(frameAt(.5,75),37);
});
test('frame rounding changes at the nearest-frame boundary',()=>{
  const {frameAt}=math();
  assert.equal(frameAt(.049,11),0);assert.equal(frameAt(.05,11),1);
  assert.equal(frameAt(.949,11),9);assert.equal(frameAt(.95,11),10);
});
test('story beats change at exact boundaries and reverse correctly',()=>{
  const {beatAt}=math();
  assert.deepEqual([0,.299999,.30,.659999,.66,1].map(beatAt),[0,0,1,1,2,2]);
  assert.deepEqual([1,.66,.659999,.30,.299999,0].map(beatAt),[2,2,1,1,0,0]);
});
for(const language of ['en','es']) {
  test(`${language} hero keeps semantic primary navigation outside changing story beats`,()=>{
    const html=render(language),hero=html.match(/<section class="cine-scroll"[^>]*>[\s\S]*?<\/section>/)?.[0];
    assert.ok(hero);assert.equal((hero.match(/<h1\b/g)||[]).length,1);
    assert.deepEqual([...hero.matchAll(/data-cine-beat="(\d)"/g)].map(m=>m[1]),['0','1','2']);
    const fixed=hero.match(/<div class="cine-fixed-action">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(fixed,'CTA survives beat changes');
    assert.match(fixed,new RegExp('<a class="cine-action" href="/rehearse\\?lang='+language+'">[^<]+</a>'));
    assert.equal((hero.match(/class="cine-action"/g)||[]).length,1);
    assert.doesNotMatch(fixed,/aria-hidden="true"|disabled|onclick=/);
  });
  test(`${language} skip navigation and poster are available without canvas playback`,()=>{
    const html=render(language),hero=html.match(/<section class="cine-scroll"[^>]*>[\s\S]*?<\/section>/)?.[0];
    assert.match(hero,new RegExp('<a href="#how">'+(language==='es'?'Saltar la escena':'Skip the scene')));
    assert.match(html,/<section[^>]+id="how"/);assert.match(hero,/<canvas[^>]+aria-hidden="true"/);
    assert.doesNotMatch(hero,/<video\b/);
    const poster=hero.match(/<img[^>]+src="([^"]+)"[^>]+fetchpriority="high"/);
    assert.ok(poster,'poster is an ordinary eager image');
    assert.ok(existsSync(new URL('..'+poster[1],import.meta.url)),'same-origin poster exists');
    assert.match(hero,/<button[^>]+class="cine-pause"[^>]+type="button"/);
  });
}
test('initial HTML exposes useful content and free practice before scripts execute',()=>{
  const main=read('index.html').match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main);assert.match(main,/<h1\b[^>]*>[\s\S]+?<\/h1>/);
  assert.match(main,/<a[^>]+href="\/rehearse\?lang=en"[^>]*>Practice a Traffic Stop<\/a>/);
  assert.match(main,/<img[^>]+src="\/new\/assets\/cinema-traffic-hero.webp"/);assert.match(main,/id="how"/);
});

class Surface {
  listeners=[];style={};dataset={};attrs={};textContent='';hidden=false;classes=new Set();
  classList={add:n=>this.classes.add(n),remove:n=>this.classes.delete(n),toggle:(n,on)=>on?this.classes.add(n):this.classes.delete(n)};
  addEventListener(type,callback,options={}){this.listeners.push({type,callback,options});}
  emit(type){for(const event of this.listeners)if(event.type===type&&!event.options.signal?.aborted)event.callback({});}
  setAttribute(key,value){this.attrs[key]=value;}focus(){this.focused=true;}
}
function lifecycle({reduced=false,saveData=false}={}) {
  const root=new Surface(),hero=new Surface(),canvas=new Surface(),button=new Surface(),fill=new Surface(),label=new Surface(),skip=new Surface(),how=new Surface();
  const layers=[new Surface(),new Surface(),new Surface()];
  hero.getBoundingClientRect=()=>({width:1200,height:800});hero.offsetHeight=800;
  root.getBoundingClientRect=()=>({top:64});root.offsetHeight=2000;
  canvas.getContext=()=>({setTransform(){},drawImage(){}});
  const elements={'.cine-hero':hero,canvas,'.cine-pause':button,'.cine-timeline-fill':fill,'.cine-frame-label':label};
  root.querySelector=selector=>elements[selector];root.querySelectorAll=selector=>selector==='[data-cine-beat]'?layers:[skip];
  const doc=new Surface();doc.querySelector=()=>root;doc.getElementById=()=>how;doc.documentElement={lang:'en'};
  const win=new Surface(),connection=new Surface();connection.saveData=saveData;
  const media=new Surface();media.matches=reduced;const other=new Surface();other.matches=false;
  const frames=new Map(),requests=[];let sequence=0,resolveManifest;
  const manifest=new Promise(resolve=>resolveManifest=resolve);
  const sandbox={window:win,document:doc,navigator:{connection},AbortController,devicePixelRatio:1,scrollY:0,
    matchMedia:query=>query.includes('reduced')?media:other,
    requestAnimationFrame:callback=>{const id=++sequence;frames.set(id,callback);return id;},cancelAnimationFrame:id=>frames.delete(id),
    fetch:(url,options)=>{requests.push({url,options});return manifest;},createImageBitmap:()=>{throw Error('Unexpected image decoding');}};
  vm.runInNewContext(read('cinema-motion.js'),sandbox);
  return {root,button,skip,how,doc,win,media,connection,frames,requests,layers,sandbox,
    flushFrames(){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());},
    resolveManifest(){resolveManifest({ok:true,json:async()=>({count:75,desktop:'/desktop-',mobile:'/mobile-'})});},
    dispose(){win.AmparoCinemaMotion.dispose();}};
}
for(const constraint of [{reduced:true},{saveData:true}])test(`${Object.keys(constraint)[0]} keeps static content without fetching the manifest or frames`,()=>{
  const h=lifecycle(constraint);h.flushFrames();h.win.emit('scroll');h.flushFrames();h.doc.emit('visibilitychange');h.flushFrames();
  assert.equal(h.requests.length,0);assert.equal(h.root.classes.has('is-scroll'),false);assert.equal(h.button.hidden,true);
  assert.equal(h.layers[0].attrs['aria-hidden'],'false');assert.equal(h.layers[1].attrs['aria-hidden'],'true');h.dispose();
});
test('native scroll listener is passive and skip transfers keyboard focus without a custom scroll action',()=>{
  const h=lifecycle({reduced:true});
  assert.equal(h.win.listeners.find(e=>e.type==='scroll').options.passive,true);
  assert.equal(h.win.listeners.some(e=>e.type==='wheel'||e.type==='touchmove'),false);
  h.skip.emit('click');assert.equal(h.how.focused,true);assert.equal(h.how.attrs.tabindex,'-1');h.dispose();
});
test('dispose aborts requests/listeners, cancels queued rendering and ignores a late manifest',async()=>{
  const h=lifecycle();assert.equal(h.requests.length,1);assert.ok(h.frames.size>0);
  h.dispose();assert.equal(h.frames.size,0);assert.equal(h.requests[0].options.signal.aborted,true);
  for(const surface of [h.win,h.doc,h.media,h.connection,h.button,h.skip])assert.ok(surface.listeners.every(e=>e.options.signal.aborted));
  h.resolveManifest();for(let i=0;i<8;i++)await Promise.resolve();
  h.win.emit('scroll');h.doc.emit('visibilitychange');h.media.emit('change');h.button.emit('click');
  assert.equal(h.frames.size,0);assert.equal(h.requests.length,1);assert.equal(h.root.classes.has('is-scroll'),false);
});
