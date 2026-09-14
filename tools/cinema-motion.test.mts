import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../new/'+name,import.meta.url),'utf8');
function math(){const context={window:{},document:{querySelector:()=>null}};vm.runInNewContext(read('cinema-motion.js'),context);return context.window.AmparoCinemaMath;}
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} ~= ${expected}`);
test('frame mapping clamps ends, rounds nearest and supports a single-frame fallback',()=>{
 const {clamp,frameAt}=math();assert.equal(clamp(-1),0);assert.equal(clamp(2),1);assert.equal(frameAt(-1,121),0);assert.equal(frameAt(2,121),120);
 assert.equal(frameAt(.5,121),60);assert.equal(frameAt(.049,11),0);assert.equal(frameAt(.05,11),1);assert.equal(frameAt(.7,1),0);
});
test('three scene boundaries reset local time forward and return to the preceding final frame backward',()=>{
 const {sceneAt,frameAt,beatAt}=math();const counts=[121,61,61];
 const sample=p=>{const s=sceneAt(p);return [s.index,frameAt(s.local,counts[s.index])];};
 assert.deepEqual([0,1/6,1/3-1e-7,1/3,.5,2/3-1e-7,2/3,5/6,1].map(sample),[[0,0],[0,60],[0,120],[1,0],[1,30],[1,60],[2,0],[2,30],[2,60]]);
 assert.deepEqual([1,2/3,2/3-1e-7,1/3,1/3-1e-7,0].map(sample),[[2,60],[2,0],[1,60],[1,0],[0,120],[0,0]]);
 assert.deepEqual([-1,0,1/3,2/3,1,2].map(beatAt),[0,0,1,2,2,2]);
});
test('chapter transitions overlap and scrub symmetrically backward',()=>{
 const {blendAt}=math();for(const boundary of [1/3,2/3]){
  near(blendAt(boundary-.04,boundary),0);near(blendAt(boundary-.03,boundary),0);near(blendAt(boundary,boundary),.5);near(blendAt(boundary+.03,boundary),1);
  const forward=[-.03,-.015,0,.015,.03].map(x=>blendAt(boundary+x,boundary));const reverse=[.03,.015,0,-.015,-.03].map(x=>blendAt(boundary+x,boundary));forward.forEach((value,i)=>near(value,reverse[4-i]));
 }
});
function html(language){const context={window:{}};vm.runInNewContext(read('cinema-content.js'),context);return context.window.amparoCinemaHTML({cinema:context.window.AmparoCinemaContent[language],heroCta:language==='es'?'Practicar una parada de tráfico':'Practice a Traffic Stop'},language);}
for(const language of ['en','es'])test(`${language} renders three distinct shots, masked accessible headlines, persistent CTA and two static fallback scenes`,()=>{
 const page=html(language),hero=page.match(/<section class="cine-scroll"[^>]*>[\s\S]*?<\/section>/)[0];
 assert.equal((hero.match(/<h1\b/g)||[]).length,1);assert.deepEqual([...hero.matchAll(/data-shot="(\d)"/g)].map(m=>m[1]),['0','1','2']);
 const shots=[...hero.matchAll(/<div class="cine-shot"[^>]*><img src="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(shots).size,3);shots.forEach(path=>assert.ok(existsSync(new URL('..'+path,import.meta.url)),path));
 assert.equal((hero.match(/class="cine-line-mask(?: cine-emphasis)?"/g)||[]).length,6);assert.equal((hero.match(/class="cine-outline" aria-hidden="true"/g)||[]).length,3);
 const fixed=hero.match(/<div class="cine-fixed-action">([\s\S]*?)<\/div>/)[1];assert.match(fixed,new RegExp('<a class="cine-action" href="/rehearse\\?lang='+language+'">'));assert.doesNotMatch(fixed,/disabled|aria-hidden/);
 assert.match(hero,new RegExp('<a href="#how">'+(language==='es'?'Saltar la película':'Skip the film')));assert.match(page,/<section[^>]+id="how"/);
 const fallback=hero.split('<div class="cine-static-scenes">')[1];assert.equal((fallback.match(/<article>/g)||[]).length,2);assert.match(fallback,/cinema-doorstep.webp/);assert.match(fallback,/ready-poster.webp/);
 assert.match(hero,/<canvas aria-hidden="true"/);assert.doesNotMatch(hero,/<video\b/);
});
test('initial HTML has practice navigation, headline and poster without running JavaScript',()=>{
 const main=read('index.html').match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];assert.match(main,/<h1\b/);assert.match(main,/href="\/rehearse\?lang=en"/);assert.match(main,/cinema-traffic-hero.webp/);assert.match(main,/id="how"/);
});

class Element{
 listeners=[];style={};dataset={};attrs={};classes=new Set();hidden=false;textContent='';
 classList={add:n=>this.classes.add(n),remove:n=>this.classes.delete(n),toggle:(n,on)=>on?this.classes.add(n):this.classes.delete(n)};
 addEventListener(type,callback,options={}){this.listeners.push({type,callback,options});}
 emit(type){for(const e of this.listeners)if(e.type===type&&!e.options.signal?.aborted)e.callback({});}
 setAttribute(name,value){this.attrs[name]=value;}focus(){this.focused=true;}
}
async function flush(){for(let i=0;i<18;i++)await Promise.resolve();}
function lifecycle({reduced=false,saveData=false,manifestFails=false,holdFrames=false,frameFails=false}={}){
 const root=new Element(),hero=new Element(),visual=new Element(),button=new Element(),fill=new Element(),label=new Element(),copy=new Element(),skip=new Element(),how=new Element();
 copy.scrollHeight=600;hero.offsetHeight=836;hero.getBoundingClientRect=()=>({width:1200,height:836});root.getBoundingClientRect=()=>({top:64});
 const canvases=[new Element(),new Element(),new Element()];canvases.forEach(c=>{c.draws=[];c.getContext=()=>({setTransform(){},drawImage:bitmap=>c.draws.push(bitmap.url)});});
 const shots=canvases.map(canvas=>{const shot=new Element();shot.querySelector=()=>canvas;return shot;});
 const layers=[0,1,2].map(()=>{const layer=new Element();layer.lines=[new Element(),new Element()];layer.ink=new Element();layer.intro=new Element();layer.caption=new Element();layer.querySelectorAll=()=>layer.lines;layer.querySelector=s=>s==='.cine-ink'?layer.ink:s==='.cine-intro'?layer.intro:layer.caption;return layer;});
 const chapters=[new Element(),new Element(),new Element()];
 root.querySelector=s=>({'.cine-hero':hero,'.cine-visual':visual,'.cine-pause':button,'.cine-timeline-fill':fill,'.cine-frame-label':label,'.cine-hero-copy':copy})[s];
 root.querySelectorAll=s=>s==='.cine-shot'?shots:s==='[data-cine-beat]'?layers:s==='[data-chapter]'?chapters:[skip];
 const document=new Element();document.documentElement={lang:'en'};document.querySelector=()=>root;document.getElementById=()=>how;
 const window=new Element(),connection=new Element(),reduce=new Element(),mobile=new Element();connection.saveData=saveData;reduce.matches=reduced;mobile.matches=false;
 const requests=[],bitmaps=[],triggers=[],frames=new Map(),held=[];let serial=0;
 const gsap={registerPlugin(){},set:(el,props)=>{el.style.transform='translateY('+props.yPercent+'%)';}};
 const ScrollTrigger={create:config=>{const trigger={config,isActive:true,progress:0,start:0,end:2200,killed:false,refresh(){config.onRefresh(this);},kill(){this.killed=true;}};triggers.push(trigger);return trigger;}};
 const createImageBitmap=async blob=>{const bitmap={url:blob.url,width:1024,height:580,closed:false,close(){this.closed=true;}};bitmaps.push(bitmap);return bitmap;};
 Object.assign(window,{gsap,ScrollTrigger,createImageBitmap,scrollTo(){}});
 const manifest={scenes:[121,61,61].map((count,i)=>({count,desktop:`/scene${i}/desktop-`,mobile:`/scene${i}/mobile-`}))};
 const fetch=(url,options)=>{
  requests.push({url,options});if(url.endsWith('manifest.json'))return Promise.resolve({ok:!manifestFails,json:async()=>manifest});
  const response={ok:!frameFails,blob:async()=>({url})};if(holdFrames)return new Promise(resolve=>held.push(()=>resolve(response)));return Promise.resolve(response);
 };
 const context={window,document,navigator:{connection},gsap,ScrollTrigger,createImageBitmap,fetch,AbortController,innerHeight:900,devicePixelRatio:1,
  matchMedia:q=>q.includes('reduced')?reduce:mobile,requestAnimationFrame:callback=>{const id=++serial;frames.set(id,callback);return id;},cancelAnimationFrame:id=>frames.delete(id)};
 vm.runInNewContext(read('cinema-motion.js'),context);
 return {root,window,document,connection,reduce,mobile,button,skip,how,layers,canvases,requests,bitmaps,triggers,frames,
  async cycle(count=1){for(let i=0;i<count;i++){await flush();const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn());}await flush();},
  progress(p){const t=triggers.at(-1);t.progress=p;t.config.onUpdate(t);},resolveFrames(){held.splice(0).forEach(fn=>fn());},dispose(){window.AmparoCinemaMotion.dispose();}};
}
for(const constraint of [{reduced:true},{saveData:true}])test(`${Object.keys(constraint)[0]} avoids all manifest/frame requests and pinning`,async()=>{
 const h=lifecycle(constraint);await h.cycle();assert.equal(h.requests.length,0);assert.equal(h.triggers.length,0);assert.equal(h.root.classes.has('is-scroll'),false);assert.equal(h.layers[0].attrs['aria-hidden'],'false');h.dispose();
});
test('manifest failure never leaves a pinned static film',async()=>{
 const h=lifecycle({manifestFails:true});await h.cycle(2);assert.equal(h.triggers.length,0);assert.equal(h.root.classes.has('is-scroll'),false);assert.equal(h.requests.length,1);h.dispose();
});
test('pin waits for first-frame readiness and native skip still focuses the following content',async()=>{
 const h=lifecycle({holdFrames:true});await h.cycle();assert.equal(h.triggers.length,0);assert.equal(h.root.classes.has('is-scroll'),false);
 h.resolveFrames();await h.cycle();assert.equal(h.triggers.length,1);assert.equal(h.root.classes.has('is-scroll'),true);
 h.skip.emit('click');assert.equal(h.how.focused,true);assert.equal(h.how.attrs.tabindex,'-1');h.dispose();
});
test('forward and backward ScrollTrigger updates select the correct clip and masked headline',async()=>{
 const h=lifecycle();await h.cycle(2);
 for(const [p,scene] of [[.5,1],[.85,2],[.2,0]]){h.progress(p);await h.cycle(3);assert.equal(h.root.dataset.scene,String(scene));assert.equal(h.layers[scene].attrs['aria-hidden'],'false');assert.ok(h.canvases[scene].draws.some(url=>url.startsWith('/scene'+scene+'/')));}
 h.dispose();
});
test('motion off kills pinning, releases decoded frames, and does not fetch while disabled',async()=>{
 const h=lifecycle();await h.cycle(2);const trigger=h.triggers[0];h.button.emit('click');await h.cycle();const requests=h.requests.length;
 assert.equal(trigger.killed,true);assert.equal(h.root.classes.has('is-scroll'),false);assert.ok(h.bitmaps.every(b=>b.closed));
 h.document.emit('visibilitychange');await h.cycle();assert.equal(h.requests.length,requests);h.dispose();
});
test('rendition resize aborts old frame generation and reloads current scene without duplicating ScrollTrigger',async()=>{
 const h=lifecycle();await h.cycle(2);h.progress(.5);await h.cycle(2);const old=h.requests.filter(r=>!r.url.endsWith('manifest.json'));
 h.mobile.matches=true;h.window.emit('resize');await h.cycle(3);assert.ok(old.every(r=>r.options.signal.aborted));assert.equal(h.triggers.length,1);
 assert.ok(h.canvases[1].draws.some(url=>url.startsWith('/scene1/mobile-')));h.dispose();
});
test('decoded cache stays bounded across chapter jumps and frees all frames on disposal',async()=>{
 const h=lifecycle();await h.cycle(8);for(const p of [.12,.5,.85,.4,.1]){h.progress(p);await h.cycle(8);assert.ok(h.bitmaps.filter(b=>!b.closed).length<=30);}
 h.dispose();assert.ok(h.bitmaps.every(b=>b.closed));assert.equal(h.frames.size,0);assert.ok(h.triggers.every(t=>t.killed));assert.ok(h.requests.every(r=>r.options.signal.aborted));
});
test('dispose ignores late frame decoding and aborts every event listener',async()=>{
 const h=lifecycle({holdFrames:true});await h.cycle();h.dispose();h.resolveFrames();await h.cycle();assert.equal(h.triggers.length,0);assert.equal(h.frames.size,0);assert.ok(h.bitmaps.every(b=>b.closed));
 for(const el of [h.window,h.document,h.connection,h.reduce,h.button,h.skip])assert.ok(el.listeners.every(e=>e.options.signal.aborted));
});

test('motion re-enabled during initial loading restarts once and arms the fresh frame generation',async()=>{
 const h=lifecycle({holdFrames:true});await h.cycle();const old=h.requests.filter(r=>!r.url.endsWith('manifest.json'));
 h.button.emit('click');h.button.emit('click');assert.ok(old.every(r=>r.options.signal.aborted));
 h.resolveFrames();await h.cycle();assert.equal(h.triggers.length,0);assert.equal(h.requests.length,7);
 assert.ok(h.bitmaps.every(b=>b.closed),'late images from the interrupted generation must be freed');
 h.resolveFrames();await h.cycle();assert.equal(h.triggers.length,1);assert.equal(h.root.classes.has('is-scroll'),true);assert.equal(h.button.attrs['aria-pressed'],'true');h.dispose();
});

test('initial rendition change during loading resumes with mobile frames',async()=>{
 const h=lifecycle({holdFrames:true});await h.cycle();h.mobile.matches=true;h.window.emit('resize');
 h.resolveFrames();await h.cycle();assert.equal(h.requests.filter(r=>r.url.includes('/mobile-')).length,3);
 h.resolveFrames();await h.cycle();assert.equal(h.triggers.length,1);assert.ok(h.canvases[0].draws.some(url=>url.includes('/mobile-')));h.dispose();
});

test('a queued preparation restart that fails settles without an automatic retry loop',async()=>{
 const h=lifecycle({holdFrames:true,frameFails:true});await h.cycle();h.button.emit('click');h.button.emit('click');
 h.resolveFrames();await h.cycle();assert.equal(h.requests.length,7);
 h.resolveFrames();await h.cycle(12);const requestCount=h.requests.length;
 assert.equal(h.triggers.length,0);assert.equal(h.root.classes.has('is-scroll'),false);assert.equal(h.frames.size,0);
 h.document.emit('visibilitychange');await h.cycle(12);assert.equal(h.requests.length,requestCount);assert.equal(requestCount,7);h.dispose();
});
