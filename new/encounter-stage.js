/* Same-origin, lazy 3D presentation. Product controls remain ordinary HTML. */
(() => {
  let cleanup = () => {}, selected = 0, userPaused = false;
  const names = ['scene_traffic', 'scene_door', 'scene_search'];
  function mount() {
    cleanup();
    const root = document.querySelector('.encounter-experience');
    if (!root) return;
    const view = root.querySelector('.encounter-view'), host = root.querySelector('.encounter-canvas');
    const pause = root.querySelector('.encounter-pause'), status = root.querySelector('.encounter-status');
    const es = root.dataset.language === 'es';
    const labels = es ? ['En la carretera','En casa','La ventanilla'] : ['On the road','At home','The window'];
    const descriptions = es ? ['Se encienden las luces. Practique antes de necesitar las palabras.','Un golpe en la puerta. Esta práctica sigue en revisión; explore la escena.','Una pregunta en la ventanilla. Ensaye una respuesta tranquila a su ritmo.'] : ['The lights come on. Practice before you need the words.','A knock at home. This practice is still under review; explore the scene.','A question at the window. Rehearse a calm response at your own pace.'];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(hover: hover) and (pointer: fine)');
    const abort = new AbortController(), opts = {signal:abort.signal};
    let dead = false, failed = false, visible = false, loading = false, renderer, scene, camera, groups = [], mixer, raf = 0, last = 0, elapsed = 0, chapterTime = 0, auto = true, angle = 0, pointer = 0, distance = 10, resize;
    function paused() { return userPaused || reduce.matches; }
    function ui() {
      root.querySelector('.encounter-poster').src = ['/new/assets/amparo-encounters-poster.webp','/new/assets/c2-start.webp','/new/assets/c3-start.webp'][selected];
      root.querySelector('.encounter-label').textContent = labels[selected];
      root.querySelector('.encounter-description').textContent = descriptions[selected];
      root.querySelector('.encounter-number').textContent = `0${selected+1} / 03`;
      root.querySelectorAll('[data-encounter]').forEach((b,i)=>b.setAttribute('aria-pressed',i===selected));
      pause.textContent = paused() ? (es?'Reanudar movimiento':'Resume motion') : (es?'Pausar movimiento':'Pause motion');
      pause.disabled = reduce.matches;
      if (reduce.matches) pause.textContent = es?'Movimiento reducido':'Reduced motion';
    }
    function fit() {
      if (!renderer) return;
      const w=host.clientWidth, h=host.clientHeight;
      renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
      // Leave a quiet lower band for captions and controls.
      distance = Math.max(8.8, 6.5 / (2 * Math.tan(camera.fov*Math.PI/360) * camera.aspect)) * 1.12;
      draw();
    }
    function draw() {
      if (!renderer || dead || failed) return;
      const a = .43 + angle + pointer*.055;
      camera.position.set(Math.sin(a)*distance, distance*.49, Math.cos(a)*distance);
      camera.lookAt(0,-.65,0); renderer.render(scene,camera);
    }
    function choose(i, manual=false) {
      selected=i; chapterTime=0;
      if (manual) auto=false;
      groups.forEach((g,j)=>g.visible=j===i);
      ui(); draw();
      if(renderer && !paused() && visible) host.animate([{opacity:.25},{opacity:1}],{duration:500,easing:'cubic-bezier(.23,1,.32,1)'});
    }
    function tick(now) {
      raf=0;
      if(dead || failed || !visible || document.hidden || paused() || !renderer) return;
      const dt=last?Math.min((now-last)/1000,.05):0; last=now;
      elapsed+=dt; chapterTime+=dt; angle=Math.sin(elapsed*.22)*.055;
      if(mixer && selected===2) mixer.update(dt);
      if(auto && chapterTime>9) { if(selected<2) choose(selected+1); else auto=false; }
      draw(); raf=requestAnimationFrame(tick);
    }
    function schedule() { cancelAnimationFrame(raf); raf=0; last=0; if(renderer && !failed && visible && !document.hidden && !paused()) raf=requestAnimationFrame(tick); else draw(); }
    function disposeScene(obj) { obj?.traverse(o=>{o.geometry?.dispose(); if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose();});m.dispose();});}); }
    async function load() {
      if(loading || dead) return; loading=true;
      try {
        const T=await import('/new/vendor/three-stage.js'); if(dead)return;
        renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
        renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.outputColorSpace=T.SRGBColorSpace;
        renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.35;
        renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
        host.append(renderer.domElement); renderer.domElement.setAttribute('aria-hidden','true');
        scene=new T.Scene(); camera=new T.PerspectiveCamera(36,1,.1,80);
        scene.add(new T.HemisphereLight(0xdcecff,0x263247,2.5));
        const key=new T.DirectionalLight(0xffe4b9,3.5); key.position.set(4,8,6); key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.035;scene.add(key);
        const rim=new T.DirectionalLight(0x7eb9ef,2);rim.position.set(-5,4,-3);scene.add(rim);
        const gltf=await new T.GLTFLoader().loadAsync('/new/assets/amparo-encounters.glb');
        if(dead){disposeScene(gltf.scene);return;}
        names.forEach(name=>{
          const item=gltf.scene.getObjectByName(name);if(!item)throw new Error('Missing scene');
          gltf.scene.updateMatrixWorld(true);
          const box=new T.Box3().setFromObject(item), center=box.getCenter(new T.Vector3());
          const anchor=new T.Group();scene.add(anchor);anchor.attach(item);anchor.position.sub(center);
          item.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});groups.push(anchor);
        });
        if(gltf.animations.length){mixer=new T.AnimationMixer(scene);gltf.animations.forEach(clip=>mixer.clipAction(clip).play());}
        resize=new ResizeObserver(fit);resize.observe(host);fit();choose(selected);
        view.classList.add('is-ready');schedule();
        renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;view.classList.add('has-fallback');cancelAnimationFrame(raf);pause.hidden=true;status.textContent=es?'Vista ilustrada. La práctica sigue disponible.':'Illustrated view. Practice is still available.';},opts);
      } catch(error) {
        if(dead)return;
        failed=true;view.classList.add('has-fallback');status.textContent=es?'Vista ilustrada. Puede explorar las escenas y empezar a practicar.':'Illustrated view. Explore the scenes or start practicing.';
        pause.hidden=true; resize?.disconnect(); mixer?.stopAllAction(); disposeScene(scene); renderer?.dispose(); renderer=undefined;
      }
    }
    root.querySelectorAll('[data-encounter]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.encounter),true),opts));
    pause.addEventListener('click',()=>{userPaused=!userPaused;ui();schedule();},opts);
    host.addEventListener('pointermove',e=>{if(fine.matches&&!paused()){const r=host.getBoundingClientRect();pointer=(e.clientX-r.left)/r.width-.5;}},opts);
    host.addEventListener('pointerleave',()=>pointer=0,opts);
    document.addEventListener('visibilitychange',schedule,opts);reduce.addEventListener('change',()=>{ui();schedule();},opts);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)load();schedule();},{threshold:.05});observer.observe(view);
    ui();
    cleanup=()=>{dead=true;abort.abort();observer.disconnect();resize?.disconnect();cancelAnimationFrame(raf);mixer?.stopAllAction();disposeScene(scene);renderer?.dispose();renderer?.forceContextLoss();host.replaceChildren();};
  }
  window.AmparoEncounter={mount,dispose:()=>cleanup()};mount();
})();
