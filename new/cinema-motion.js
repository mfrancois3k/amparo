/* Three generated scenes, one reversible GSAP ScrollTrigger. Native scroll stays native. */
(() => {
  const clamp=(n,lo=0,hi=1)=>Math.min(hi,Math.max(lo,n));
  const frameAt=(p,count)=>Math.round(clamp(p)*Math.max(0,count-1));
  const beatAt=p=>Math.min(2,Math.floor(clamp(p)*3));
  const sceneAt=p=>({index:beatAt(p),local:clamp(p*3-beatAt(p))});
  const blendAt=(p,b)=>clamp((p-b+.03)/.06);
  // Spend more scroll distance around the readable middle of each chapter.
  const dwellAt=t=>{t=clamp(t);return t+.075*Math.sin(2*Math.PI*t);};
  const settleAt=(current,target,dt)=>Math.abs(target-current)<.0001?target:current+(target-current)*(1-Math.exp(-clamp(dt,0,64)/110));
  const cameraAt=(local,scene,mobile=false)=>{
    const t=dwellAt(local),strength=mobile?.65:1;
    const paths=[[1,1.34,0,-3,0,1],[1.34,1.04,-3,0,1,0],[1.06,1.4,2,-2,1,-2]];
    const [a,b,x0,x1,y0,y1]=paths[clamp(scene,0,2)];
    return {scale:1+(a+(b-a)*t-1)*strength,x:(x0+(x1-x0)*t)*strength,y:(y0+(y1-y0)*t)*strength};
  };
  window.AmparoCinemaMath={clamp,frameAt,beatAt,sceneAt,blendAt,dwellAt,settleAt,cameraAt};
  let dispose=()=>{},motionOff=false;
  function mount(){
    dispose();
    const root=document.querySelector('.cine-scroll');if(!root)return;
    const hero=root.querySelector('.cine-hero'),visual=root.querySelector('.cine-visual');
    const shots=[...root.querySelectorAll('.cine-shot')], canvases=shots.map(s=>s.querySelector('canvas'));
    const contexts=canvases.map(c=>c.getContext('2d',{alpha:false}));
    const layers=[...root.querySelectorAll('[data-cine-beat]')], lines=layers.map(l=>[...l.querySelectorAll('.cine-line')]);
    const inks=layers.map(l=>l.querySelector('.cine-ink'));
    const button=root.querySelector('.cine-pause'),fill=root.querySelector('.cine-timeline-fill'),label=root.querySelector('.cine-frame-label');
    const chapters=[...root.querySelectorAll('[data-chapter]')],copy=root.querySelector('.cine-hero-copy');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
    const es=document.documentElement.lang==='es',abort=new AbortController(),opts={signal:abort.signal};
    let frameAbort=new AbortController(),generation=0,manifest=null,loading=false,restartRequested=false,armed=false,dead=false,raf=0,trigger=null;
    let progress=0,displayed=0,lastTime=0,width=1,height=1,rendition=mobile.matches?'mobile':'desktop',active=-1,tooTall=false;
    const cache=new Map(),pending=new Set(),failed=new Set(),lastDraw=[-1,-1,-1];
    const targets=[0,0,0],MAX_CACHE=30;
    const unsupported=()=>!window.gsap || !window.ScrollTrigger || !window.createImageBitmap || contexts.some(c=>!c);
    const constrained=()=>reduced.matches || navigator.connection?.saveData || innerHeight<=650 || tooTall || unsupported();
    const allowed=()=>!motionOff && !constrained();
    const key=(scene,frame)=>scene+':'+frame;
    function release(){frameAbort.abort();frameAbort=new AbortController();generation++;pending.clear();failed.clear();for(const value of cache.values())value.close();cache.clear();lastDraw.fill(-1);canvases.forEach(c=>c.classList.remove('has-frame'));}
    function nearest(scene){
      const exact=key(scene,targets[scene]);if(cache.has(exact))return exact;
      return [...cache.keys()].filter(k=>Number(k.split(':')[0])===scene).sort((a,b)=>Math.abs(Number(a.split(':')[1])-targets[scene])-Math.abs(Number(b.split(':')[1])-targets[scene]))[0];
    }
    function trim(){
      while(cache.size>MAX_CACHE){
        const protectedKeys=new Set(shots.map((_,i)=>nearest(i)));
        const candidates=[...cache.keys()].filter(k=>!protectedKeys.has(k));
        candidates.sort((a,b)=>{
          const score=k=>{const [s,f]=k.split(':').map(Number);return Math.abs(f-targets[s])+(s===beatAt(progress)?0:100);};return score(b)-score(a);
        });
        const victim=candidates[0];if(!victim)break;cache.get(victim).close();cache.delete(victim);
      }
    }
    async function fetchFrame(scene,frame){
      const k=key(scene,frame);if(cache.has(k)||pending.has(k)||failed.has(k))return;
      const own=generation,signal=frameAbort.signal;pending.add(k);
      try{
        const url=manifest.scenes[scene][rendition]+String(frame).padStart(3,'0')+'.webp';
        const response=await fetch(url,{signal});if(!response.ok)throw Error('Missing frame');
        const bitmap=await createImageBitmap(await response.blob());
        if(dead||own!==generation||!allowed()){bitmap.close();return;}
        cache.set(k,bitmap);trim();
      }catch{if(!dead&&own===generation)failed.add(k);}
      finally{if(!dead&&own===generation){pending.delete(k);request();}}
    }
    function pump(){
      if(!armed||!allowed()||document.hidden||!trigger?.isActive&&progress!==0&&progress!==1)return;
      const current=beatAt(progress),next=clamp(current+(sceneAt(progress).local>.5?1:-1),0,2);
      const list=[[current,targets[current]],[next,targets[next]]];
      for(let d=1;d<12;d++)for(const f of [targets[current]+d,targets[current]-d])if(f>=0&&f<manifest.scenes[current].count)list.push([current,f]);
      for(const [s,f] of list){if(pending.size>=4)break;fetchFrame(s,f);}
    }
    function measure(){
      const box=hero.getBoundingClientRect();width=box.width;height=box.height;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      canvases.forEach((c,i)=>{c.width=Math.max(1,Math.round(width*dpr));c.height=Math.max(1,Math.round(height*dpr));contexts[i]?.setTransform(dpr,0,0,dpr,0,0);});lastDraw.fill(-1);
      // Copy includes its own padding. If it cannot fit, normal document flow is safer.
      root.classList.add('is-measuring');tooTall=copy.scrollHeight>innerHeight-64+2;root.classList.remove('is-measuring');
    }
    function renderFrames(){
      shots.forEach((shot,s)=>{
        const k=nearest(s);if(!k)return;const frame=Number(k.split(':')[1]);if(frame===lastDraw[s])return;
        const bitmap=cache.get(k),scale=Math.max(width/bitmap.width,height/bitmap.height),w=bitmap.width*scale,h=bitmap.height*scale;
        const focal=rendition==='mobile'?.5:(manifest.scenes[s].focal??[.66,.5,.62][s]);
        contexts[s].drawImage(bitmap,(width-w)*focal,(height-h)*.5,w,h);
        lastDraw[s]=frame;canvases[s].classList.add('has-frame');canvases[s].dataset.frame=String(frame);
      });
    }
    function paint(timestamp){
      raf=0;if(dead)return;
      if(document.hidden){lastTime=0;return;}
      const dt=lastTime&&Number.isFinite(timestamp)?timestamp-lastTime:16.67;lastTime=timestamp||0;
      displayed=armed?settleAt(displayed,progress,dt):0;
      const p=displayed;
      if(manifest)manifest.scenes.forEach((s,i)=>targets[i]=frameAt(dwellAt(clamp(p*3-i)),s.count));
      const b1=blendAt(p,1/3),b2=blendAt(p,2/3);
      shots.forEach((shot,i)=>{
        shot.style.visibility=i===0||i===1&&b1>0||i===2&&b2>0?'visible':'hidden';
        shot.style.clipPath=i?'inset(0 '+((1-(i===1?b1:b2))*100)+'% 0 0)':'none';
        const camera=armed?cameraAt(p*3-i,i,mobile.matches):{scale:1,x:0,y:0};
        // Move footage inside a stationary clipping layer, never the text or wipe edge.
        shot.style.transform='none';
        shot.querySelectorAll('img,canvas').forEach(media=>{
          media.style.transform='translate3d('+camera.x+'%,'+camera.y+'%,0) scale('+camera.scale+')';
          media.style.transformOrigin=['65% 48%','54% 48%','64% 62%'][i];
        });
      });
      // Expand the visual aperture only. Text, controls and document layout do not scale.
      const opening=clamp(p/.12);visual.style.clipPath=allowed()?'inset(0 '+((mobile.matches?3:10)*(1-opening))+'% round '+(10*(1-opening))+'px)':'none';
      layers.forEach((layer,i)=>{
        const entering=i===0?1:blendAt(p,i/3),exiting=i===2?0:blendAt(p,(i+1)/3);
        const visible=entering>0&&exiting<1;
        layer.style.visibility=visible?'visible':'hidden';layer.style.opacity='1';layer.style.transform='none';
        lines[i].forEach((line,j)=>{
          const incoming=i===0?1:clamp((entering-j*.12)/(1-j*.12));
          const y=100*(1-incoming)-100*exiting;
          if(window.gsap)gsap.set(line,{yPercent:y});else line.style.transform='translateY('+y+'%)';
        });
        const intro=layer.querySelector('.cine-intro'),caption=layer.querySelector('.cine-chapter-caption');
        const alpha=clamp(entering*2-1)*(1-exiting);intro.style.opacity=String(i===0&&p===0?1:alpha);caption.style.opacity=String(entering*(1-exiting));
        inks[i].style.clipPath='inset(0 '+(armed?100*(1-clamp((p-i/3+.01)/.11)):0)+'% 0 0)';
      });
      const now=beatAt(p);if(now!==active){active=now;layers.forEach((l,i)=>l.setAttribute('aria-hidden',String(i!==now)));chapters.forEach((c,i)=>c.setAttribute('aria-current',String(i===now)));label.textContent='0'+(now+1)+' / 03';}
      fill.style.transform='scaleX('+p+')';root.dataset.progress=p.toFixed(3);root.dataset.scene=String(now);
      if(armed&&!document.hidden){renderFrames();pump();}
      if(armed&&Math.abs(displayed-progress)>0)request();else lastTime=0;
    }
    function request(){if(!dead&&!raf)raf=requestAnimationFrame(paint);}
    function disarm(){trigger?.kill();trigger=null;armed=false;root.classList.remove('is-scroll');progress=displayed=lastTime=0;release();request();}
    function arm(){
      if(dead||armed||!allowed()||!cache.has(key(0,0)))return;
      // A late download must not move content a reader has already scrolled into.
      if(root.getBoundingClientRect().top+hero.offsetHeight<0)return;
      armed=true;root.classList.add('is-scroll');measure();
      if(tooTall){disarm();return;}
      gsap.registerPlugin(ScrollTrigger);
      trigger=ScrollTrigger.create({trigger:root,start:'top 64px',end:'bottom bottom',invalidateOnRefresh:true,onUpdate:self=>{progress=self.progress;request();},onRefresh:self=>{progress=self.progress;request();}});
      request();
    }
    async function prepare(){
      if(dead||!allowed())return;if(loading){restartRequested=true;return;}loading=true;
      try{
        if(!manifest){const response=await fetch('/new/assets/cinema-three/manifest.json',{signal:abort.signal});if(!response.ok)throw Error('Scene unavailable');const m=await response.json();if(m.scenes?.length!==3||m.scenes.some(s=>!Number.isInteger(s.count)||s.count<2||s.count>300))throw Error('Invalid scene list');manifest=m;}
        if(dead||!allowed())return;
        await Promise.all(manifest.scenes.map((_,i)=>fetchFrame(i,0)));arm();
      }catch{if(!dead)disarm();}finally{loading=false;if(restartRequested){restartRequested=false;if(!dead&&allowed())prepare();}}
    }
    function mode(){
      button.textContent=motionOff?(es?'Activar movimiento':'Enable motion'):(es?'Desactivar movimiento':'Turn motion off');button.setAttribute('aria-pressed',String(!motionOff));
      button.hidden=constrained();
      if(!allowed())disarm();else prepare();
    }
    button.addEventListener('click',()=>{motionOff=!motionOff;mode();},opts);
    chapters.forEach((chapter,i)=>chapter.addEventListener('click',()=>{if(trigger){const box=root.getBoundingClientRect(),start=box.top+window.scrollY-64,distance=Math.max(0,box.height-innerHeight+64);window.scrollTo({top:start+distance*(i/3+.10),behavior:reduced.matches?'auto':'smooth'});}},opts));
    root.querySelectorAll('a[href="#how"]').forEach(link=>link.addEventListener('click',()=>{const next=document.getElementById('how');next.setAttribute('tabindex','-1');next.focus({preventScroll:true});},opts));
    window.addEventListener('resize',()=>{const next=mobile.matches?'mobile':'desktop';if(next!==rendition){rendition=next;release();}measure();if(armed&&allowed()){trigger.refresh();request();}else mode();},opts);
    reduced.addEventListener('change',mode,opts);navigator.connection?.addEventListener('change',mode,opts);document.addEventListener('visibilitychange',request,opts);
    measure();mode();request();
    dispose=()=>{dead=true;abort.abort();frameAbort.abort();trigger?.kill();cancelAnimationFrame(raf);release();root.classList.remove('is-scroll');};
  }
  window.AmparoCinemaMotion={mount,dispose:()=>dispose()};mount();
})();
