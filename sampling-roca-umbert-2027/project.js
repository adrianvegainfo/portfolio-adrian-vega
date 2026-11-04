(() => {
  const header=document.querySelector('header'), menu=document.querySelector('.menu'), nav=document.querySelector('#sections');
  const links=[...nav.querySelectorAll('a')], sections=links.map(a=>document.querySelector(a.hash));
  const triggers=[...nav.querySelectorAll('[data-nav-trigger]')];
  function closeGroups(){triggers.forEach(button=>{button.setAttribute('aria-expanded','false');document.getElementById(button.getAttribute('aria-controls')).hidden=true;});}
  function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');closeGroups();update();}
  triggers.forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';closeGroups();button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;}));
  document.addEventListener('click',event=>{if(!nav.contains(event.target))closeGroups();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const button=triggers.find(x=>x.getAttribute('aria-expanded')==='true');if(button){closeGroups();button.focus();}}});
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  links.forEach(a=>a.addEventListener('click',closeMenu));
  document.querySelectorAll('.languages a').forEach(a=>a.addEventListener('click',()=>{const url=new URL(a.href);url.hash=location.hash;a.href=url.href;}));
  function update(){
    document.documentElement.style.setProperty('--header',header.offsetHeight+'px');
    document.documentElement.style.setProperty('--dossier-header-height',header.offsetHeight+'px');
    header.classList.toggle('is-scrolled',scrollY>40);
    let active=-1;
    sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<header.offsetHeight+140)active=i;});
    links.forEach((a,i)=>i===active?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
    triggers.forEach(button=>button.classList.toggle('is-current',!!links[active]&&document.getElementById(button.getAttribute('aria-controls')).contains(links[active])));
  }
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
  const viewer=document.querySelector('#viewer'), content=viewer.querySelector('.viewer-content');
  const background=document.querySelector('[data-background-video]'), toggle=document.querySelector('[data-background-toggle]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function setBackground(play){
    if(!background)return;
    background.hidden=!play;
    if(play){const params=new URLSearchParams({origin:location.origin,autoplay:'1',mute:'1',controls:'0',loop:'1',playlist:'pkP5lEjQFqI',playsinline:'1',rel:'0'});background.src='https://www.youtube.com/embed/pkP5lEjQFqI?'+params;}
    else background.removeAttribute('src');
    toggle.textContent=play?toggle.dataset.pause:toggle.dataset.play;
    toggle.setAttribute('aria-pressed',String(play));
  }
  if(background){toggle.hidden=false;toggle.addEventListener('click',()=>setBackground(background.hidden));reduced.addEventListener('change',()=>setBackground(!reduced.matches));setBackground(!reduced.matches);}
  let returnFocus;
  document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
    returnFocus=button;const image=new Image();image.src=button.dataset.image;image.alt=button.querySelector('img').alt;content.replaceChildren(image);viewer.showModal();
  }));
  document.querySelectorAll('[data-video]').forEach(link=>link.addEventListener('click',event=>{
    if(!viewer.showModal)return;
    event.preventDefault();returnFocus=link;
    setBackground(false);
    const frame=document.createElement('iframe');
    const params=new URLSearchParams({autoplay:'1',rel:'0',playsinline:'1',origin:location.origin});
    frame.src='https://www.youtube.com/embed/'+link.dataset.video+'?'+params;
    frame.title=link.getAttribute('aria-label')||link.textContent.trim();
    frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
    const fallback=document.createElement('p'), external=document.createElement('a');external.href=link.href;external.target='_blank';external.rel='noopener noreferrer';external.textContent='YouTube ↗';fallback.append(external);
    content.replaceChildren(frame,fallback);viewer.showModal();
  }));
  viewer.querySelector('.close').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
  viewer.addEventListener('close',()=>{content.replaceChildren();returnFocus?.focus();});
})();
