(() => {
  const header=document.querySelector('header'), menu=document.querySelector('.menu'), nav=document.querySelector('#sections');
  const links=[...nav.querySelectorAll('a')], sections=links.map(a=>document.querySelector(a.hash));
  function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');update();}
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  links.forEach(a=>a.addEventListener('click',closeMenu));
  document.querySelectorAll('.languages a').forEach(a=>a.addEventListener('click',()=>{const url=new URL(a.href);url.hash=location.hash;a.href=url.href;}));
  function update(){
    document.documentElement.style.setProperty('--header',header.offsetHeight+'px');
    let active=-1;
    sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<header.offsetHeight+140)active=i;});
    links.forEach((a,i)=>i===active?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  }
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
  const viewer=document.querySelector('#viewer'), content=viewer.querySelector('.viewer-content');
  let returnFocus;
  document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
    returnFocus=button;const image=new Image();image.src=button.dataset.image;image.alt=button.querySelector('img').alt;content.replaceChildren(image);viewer.showModal();
  }));
  document.querySelectorAll('[data-video]').forEach(link=>link.addEventListener('click',event=>{
    if(!viewer.showModal)return;
    event.preventDefault();returnFocus=link;
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
