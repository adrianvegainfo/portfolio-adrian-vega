(() => {
  const header=document.querySelector('.topbar'),nav=document.querySelector('.nav');
  const sections=[...document.querySelectorAll('main > section[id]')];
  const links=[...nav.querySelectorAll('a')],languages=[...document.querySelectorAll('.languages a')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active='',scheduled=false,restoring=true;
  const measure=()=>document.documentElement.style.setProperty('--header',`${header.getBoundingClientRect().height}px`);
  new ResizeObserver(measure).observe(header);measure();
  function mark(id){
    if(id===active)return;active=id;
    links.forEach(a=>{const selected=a.hash===`#${id}`;if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    const selected=links.find(a=>a.hash===`#${id}`);
    if(selected && nav.scrollWidth>nav.clientWidth){nav.scrollTo({left:selected.offsetLeft-nav.offsetLeft-nav.clientWidth/2+selected.offsetWidth/2,behavior:reduced?'instant':'smooth'});}
    languages.forEach(a=>a.hash=id);
  }
  function update(){
    scheduled=false;if(restoring)return;
    const line=header.getBoundingClientRect().height+Math.min(130,innerHeight*.2);
    let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=line)current=section;else break;}
    if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)current=sections.at(-1);
    mark(current.id);
  }
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
  addEventListener('resize',()=>{measure();update()});
  document.querySelectorAll('a[href^="#"]:not(.skip)').forEach(a=>a.addEventListener('click',event=>{
    event.preventDefault();const id=a.hash.slice(1),target=document.getElementById(id);
    const url=new URL(location.href);url.searchParams.delete('pos');url.hash=id;history.pushState(null,'',url);
    target.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});mark(id);
  }));
  languages.forEach(a=>a.addEventListener('click',event=>{
    event.preventDefault();
    const current=document.getElementById(active)||sections[0];
    const rect=current.getBoundingClientRect();
    const relative=Math.max(0,Math.min(1,(header.getBoundingClientRect().height-rect.top)/rect.height));
    const url=new URL(a.href,location.href);url.hash=current.id;url.searchParams.set('pos',relative.toFixed(4));location.assign(url.href);
  }));
  const target=document.getElementById(location.hash.slice(1))||sections[0];mark(target.id);
  const pos=Number(new URLSearchParams(location.search).get('pos')||0);
  const restore=()=>requestAnimationFrame(()=>{
    if(location.hash || pos){scrollTo({top:target.getBoundingClientRect().top+scrollY+pos*target.getBoundingClientRect().height-header.offsetHeight-20,behavior:'instant'});}
    const clean=new URL(location.href);clean.searchParams.delete('pos');history.replaceState(null,'',clean);
    restoring=false;update();
  });
  if(document.readyState==='complete')restore();else addEventListener('load',restore,{once:true});
  const pauseObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)entry.target.pause()}),{threshold:0});
  document.querySelectorAll('[data-native-play]').forEach(button=>button.addEventListener('click',()=>{
    const video=button.closest('.player').querySelector('video');button.remove();document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause()});video.play().catch(()=>video.focus());
  }));
  const videos=[...document.querySelectorAll('#videos video')];
  videos.forEach((video,index)=>{
    pauseObserver.observe(video);
    video.addEventListener('play',()=>{
      video.closest('.player').querySelector('[data-native-play]')?.remove();
      videos.forEach(other=>{if(other!==video)other.pause()});
    });
    video.loop=true;
    // Select the page language rather than the browser's stored caption preference.
    const selectLanguage=()=>{
      for(const track of video.textTracks)track.mode=track.language===document.documentElement.lang?'showing':'disabled';
    };
    selectLanguage();
    video.addEventListener('loadedmetadata',selectLanguage,{once:true});
    video.querySelectorAll('track').forEach(element=>{
      element.addEventListener('load',()=>video.dataset.subtitleCues=String(element.track.cues?.length||0));
      element.track.addEventListener('cuechange',()=>{
        if(element.track.language===document.documentElement.lang)video.dataset.activeSubtitle=[...element.track.activeCues||[]].map(cue=>cue.text).join('\n');
      });
    });
  });
  document.querySelectorAll('.gallery-group').forEach(group=>{
    const rail=group.querySelector('.gallery-rail');
    const shift=direction=>rail.scrollBy({left:direction*(rail.querySelector('.frame-button').getBoundingClientRect().width+18),behavior:reduced?'instant':'smooth'});
    group.querySelector('[data-gallery-prev]').addEventListener('click',()=>shift(-1));
    group.querySelector('[data-gallery-next]').addEventListener('click',()=>shift(1));
  });
  const frameDialog=document.querySelector('.frame-dialog');
  if(frameDialog){
    const frames=[...document.querySelectorAll('[data-frame]')];let frameIndex=0;
    const displayFrame=index=>{
      frameIndex=(index+frames.length)%frames.length;const button=frames[frameIndex],image=frameDialog.querySelector('.frame-full');
      image.src=button.dataset.frame;image.alt=button.querySelector('img').alt;frameDialog.querySelector('.frame-caption').textContent=button.dataset.frameCaption;
    };
    frames.forEach((button,index)=>button.addEventListener('click',()=>{displayFrame(index);frameDialog.showModal()}));
    frameDialog.querySelector('[data-frame-close]').addEventListener('click',()=>frameDialog.close());
    frameDialog.querySelector('[data-frame-prev]').addEventListener('click',()=>displayFrame(frameIndex-1));
    frameDialog.querySelector('[data-frame-next]').addEventListener('click',()=>displayFrame(frameIndex+1));
    frameDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();displayFrame(frameIndex-1)}if(event.key==='ArrowRight'){event.preventDefault();displayFrame(frameIndex+1)}});
    frameDialog.addEventListener('click',event=>{if(event.target===frameDialog)frameDialog.close()});
  }
})();
