/* A five-second silent scene, played once. No scroll interception. */
(() => {
  let dispose=()=>{}, userPaused=false;
  function mount(){
    dispose();
    const hero=document.querySelector('.cine-hero'); if(!hero)return;
    const video=hero.querySelector('video'), button=hero.querySelector('.cine-pause');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const es=document.documentElement.lang==='es', abort=new AbortController(), opts={signal:abort.signal};
    let visible=false, loaded=false, dead=false, ended=false, failed=false;
    const constrained=()=>reduced.matches || navigator.connection?.saveData;
    function label(){
      const text=ended?(es?'Ver escena de nuevo':'Replay scene'):userPaused?(es?'Reanudar escena':'Resume scene'):(es?'Pausar escena':'Pause scene');
      button.textContent=text;button.setAttribute('aria-label',text);button.hidden=Boolean(constrained() || failed);
    }
    function sync(){
      label();
      if(dead || constrained() || !visible || document.hidden || userPaused || ended || failed){video.pause();return;}
      if(!loaded){video.src=video.dataset.cineVideo;loaded=true;video.muted=true;}
      const playing=video.play();
      playing?.catch(()=>{if(!dead){userPaused=true;label();}});
    }
    button.addEventListener('click',()=>{if(ended){video.currentTime=0;ended=false;userPaused=false;}else userPaused=!userPaused;sync();},opts);
    video.addEventListener('playing',()=>{if(!dead)video.classList.add('is-playing');},opts);
    video.addEventListener('ended',()=>{ended=true;label();},opts);
    video.addEventListener('error',()=>{failed=true;video.classList.remove('is-playing');video.pause();label();},opts);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1});observer.observe(hero);
    reduced.addEventListener('change',sync,opts);document.addEventListener('visibilitychange',sync,opts);
    label();
    dispose=()=>{dead=true;abort.abort();observer.disconnect();video.pause();video.removeAttribute('src');video.load();};
  }
  window.AmparoCinemaMotion={mount,dispose:()=>dispose()};mount();
})();
