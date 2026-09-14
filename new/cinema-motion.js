/* A generated film rendered frame-by-frame. Native scroll is never intercepted. */
(() => {
  const clamp = (n, lo=0, hi=1) => Math.min(hi, Math.max(lo, n));
  const frameAt = (p, count) => Math.round(clamp(p) * Math.max(0, count-1));
  const beatAt = p => p < .30 ? 0 : p < .66 ? 1 : 2;
  window.AmparoCinemaMath = {clamp, frameAt, beatAt};
  let dispose = () => {}, motionOff = false;
  function mount() {
    dispose();
    const root = document.querySelector('.cine-scroll'); if (!root) return;
    const hero=root.querySelector('.cine-hero'), canvas=root.querySelector('canvas');
    const ctx=canvas.getContext('2d', {alpha:false});
    const layers=[...root.querySelectorAll('[data-cine-beat]')];
    const button=root.querySelector('.cine-pause'), fill=root.querySelector('.cine-timeline-fill');
    const label=root.querySelector('.cine-frame-label');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'), short=matchMedia('(max-height:650px)');
    const mobile=matchMedia('(max-width:700px)'), es=document.documentElement.lang==='es';
    const abort=new AbortController(), opts={signal:abort.signal};
    const bitmaps=new Map(), pending=new Set(), failed=new Set();
    let dead=false, manifest=null, loading=false, raf=0, target=0, progress=0, active=-1, lastDraw=-1, rendition='', generation=0;
    let start=0, distance=1, width=1, height=1;
    const constrained=()=>reduced.matches || short.matches || navigator.connection?.saveData || !ctx;
    const enabled=()=>!constrained() && !motionOff;
    function clearFrames(){generation++;for(const bitmap of bitmaps.values())bitmap.close?.();bitmaps.clear();failed.clear();pending.clear();lastDraw=-1;}
    function measure(){
      const box=hero.getBoundingClientRect();width=box.width;height=box.height;
      const dpr=Math.min(devicePixelRatio || 1,1.5);
      canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
      ctx?.setTransform(dpr,0,0,dpr,0,0);lastDraw=-1;
      start=root.getBoundingClientRect().top+scrollY-64;
      distance=Math.max(1,root.offsetHeight-hero.offsetHeight);
      const next=mobile.matches?'mobile':'desktop';
      if(next!==rendition){rendition=next;clearFrames();}
      request();
    }
    function updateMode(){
      root.classList.toggle('is-scroll',enabled());
      button.hidden=constrained();
      button.textContent=motionOff?(es?'Activar movimiento':'Enable motion'):(es?'Desactivar movimiento':'Turn motion off');
      button.setAttribute('aria-pressed',String(!motionOff));
      if(!enabled()){canvas.classList.remove('has-frame');clearFrames();}
      measure();
      if(enabled())loadManifest();
    }
    async function loadManifest(){
      if(manifest || loading || dead)return;
      loading=true;
      try{
        const response=await fetch('/new/assets/cinema-scroll/manifest.json',{signal:abort.signal});
        if(!response.ok)throw Error('Scene unavailable');
        const data=await response.json();
        if(!Number.isInteger(data.count) || data.count<2 || data.count>300)throw Error('Invalid sequence');
        if(dead)return;manifest=data;request();
      }catch{ /* The approved still and all text remain usable on failure. */ }
      finally{loading=false;}
    }
    function priorities(){
      const list=[target];
      for(let d=1;list.length<24 && d<manifest.count;d++){
        if(target+d<manifest.count)list.push(target+d);
        if(target-d>=0 && list.length<24)list.push(target-d);
      }
      return list;
    }
    function pump(){
      if(!manifest || !enabled() || dead || document.hidden || progress<0 || progress>1)return;
      for(const index of priorities()){
        if(pending.size>=4)break;
        if(bitmaps.has(index) || pending.has(index) || failed.has(index))continue;
        const ownGeneration=generation;pending.add(index);
        const url=manifest[rendition]+String(index).padStart(3,'0')+'.webp';
        fetch(url,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('Frame unavailable');return r.blob();})
          .then(blob=>createImageBitmap(blob)).then(bitmap=>{
            if(dead || ownGeneration!==generation || !enabled()){bitmap.close();return;}
            bitmaps.set(index,bitmap);
            if(bitmaps.size>24){const farthest=[...bitmaps.keys()].sort((a,b)=>Math.abs(b-target)-Math.abs(a-target))[0];bitmaps.get(farthest).close();bitmaps.delete(farthest);}
          }).catch(()=>{if(!dead && ownGeneration===generation)failed.add(index);})
          .finally(()=>{if(!dead && ownGeneration===generation){pending.delete(index);request();}});
      }
    }
    function draw(){
      if(!bitmaps.size)return;
      const index=bitmaps.has(target)?target:[...bitmaps.keys()].sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0];
      if(index===lastDraw)return;
      const bitmap=bitmaps.get(index), scale=Math.max(width/bitmap.width,height/bitmap.height);
      const w=bitmap.width*scale,h=bitmap.height*scale;
      ctx.drawImage(bitmap,(width-w)*(mobile.matches?.73:.66),(height-h)*.5,w,h);
      lastDraw=index;canvas.classList.add('has-frame');canvas.dataset.frame=String(index);
    }
    const ramp=(value,a,b)=>{const t=clamp((value-a)/(b-a));return t*t*(3-2*t);};
    function updateText(p){
      const opacities=[1-ramp(p,.23,.30),ramp(p,.30,.37)*(1-ramp(p,.59,.66)),ramp(p,.66,.73)];
      const offsets=[-30*ramp(p,.23,.30),28*(1-ramp(p,.30,.37))-30*ramp(p,.59,.66),28*(1-ramp(p,.66,.73))];
      layers.forEach((layer,i)=>{layer.style.opacity=String(opacities[i]);layer.style.visibility=opacities[i]>.001?'visible':'hidden';layer.style.transform='translateY('+offsets[i]+'px)';});
      const next=beatAt(p);
      if(next!==active){active=next;layers.forEach((layer,i)=>layer.setAttribute('aria-hidden',String(i!==active)));label.textContent='0'+(active+1)+' / 03';}
      fill.style.transform='scaleX('+p+')';
    }
    function render(){
      raf=0;if(dead)return;
      progress=enabled()?(scrollY-start)/distance:0;
      const p=clamp(progress);target=frameAt(p,manifest?.count || 120);
      updateText(p);root.dataset.progress=p.toFixed(3);
      if(enabled() && !document.hidden){draw();pump();}
    }
    function request(){if(!dead && !raf)raf=requestAnimationFrame(render);}
    button.addEventListener('click',()=>{motionOff=!motionOff;updateMode();},opts);
    window.addEventListener('scroll',request,{...opts,passive:true});
    window.addEventListener('resize',measure,opts);
    reduced.addEventListener('change',updateMode,opts);short.addEventListener('change',updateMode,opts);
    navigator.connection?.addEventListener('change',updateMode,opts);
    document.addEventListener('visibilitychange',request,opts);
    // A keyboard user can leave the film without scrolling through it.
    root.querySelectorAll('a[href="#how"]').forEach(link=>link.addEventListener('click',()=>{
      const next=document.getElementById('how');next.setAttribute('tabindex','-1');next.focus({preventScroll:true});
    },opts));
    updateMode();
    dispose=()=>{dead=true;abort.abort();cancelAnimationFrame(raf);clearFrames();root.classList.remove('is-scroll');};
  }
  window.AmparoCinemaMotion={mount,dispose:()=>dispose()};mount();
})();
