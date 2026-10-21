(() => {
  'use strict';
  const header = document.querySelector('.topbar');
  const nav = document.querySelector('.nav');
  const sections = [...document.querySelectorAll('main > section[id]')];
  const links = [...nav.querySelectorAll('a')];
  const languages = [...document.querySelectorAll('.languages a')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = '', scheduled = false, restoring = true;
  const measure = () => document.documentElement.style.setProperty('--header', `${header.getBoundingClientRect().height}px`);
  new ResizeObserver(measure).observe(header);
  measure();
  function mark(id) {
    if (id === active) return;
    active = id;
    links.forEach(a => a.hash === `#${id}` ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
    const selected = links.find(a => a.hash === `#${id}`);
    if (selected && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({left: selected.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + selected.offsetWidth / 2, behavior: reduced ? 'instant' : 'smooth'});
    }
    languages.forEach(a => { a.hash = id; });
  }
  function update() {
    scheduled = false;
    if (restoring) return;
    const line = header.offsetHeight + Math.min(130, innerHeight * .2);
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) current = section;
      else break;
    }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
    mark(current.id);
  }
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, {passive: true});
  addEventListener('resize', () => { measure(); update(); });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', event => {
    const target = document.getElementById(a.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    const url = new URL(location.href);
    url.searchParams.delete('pos'); url.hash = target.id;
    try { history.pushState(null, '', url); }
    catch { location.hash = target.id; }
    target.scrollIntoView({behavior: reduced ? 'instant' : 'smooth', block: 'start'});
    mark(target.id);
    if (a.classList.contains('skip')) { target.tabIndex = -1; target.focus({preventScroll: true}); }
  }));
  languages.forEach(a => a.addEventListener('click', event => {
    event.preventDefault();
    const current = document.getElementById(active) || sections[0];
    const rect = current.getBoundingClientRect();
    const relative = Math.max(0, Math.min(1, (header.offsetHeight - rect.top) / rect.height));
    const url = new URL(a.href, location.href);
    url.hash = current.id; url.searchParams.set('pos', relative.toFixed(4));
    location.assign(url.href);
  }));
  const target = document.getElementById(location.hash.slice(1)) || sections[0];
  mark(target.id);
  const parsed = Number(new URLSearchParams(location.search).get('pos') || 0);
  const pos = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0;
  const restore = () => requestAnimationFrame(() => {
    if (location.hash || pos) scrollTo({top: target.getBoundingClientRect().top + scrollY + pos * target.getBoundingClientRect().height - header.offsetHeight - 20, behavior: 'instant'});
    const clean = new URL(location.href); clean.searchParams.delete('pos');
    try { history.replaceState(null, '', clean); } catch { /* File URLs may restrict history changes. */ }
    restoring = false; update();
  });
  if (document.readyState === 'complete') restore();
  else addEventListener('load', restore, {once: true});
  addEventListener('hashchange', update);
  const videos = [...document.querySelectorAll('video')];
  videos.forEach(video => video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
  }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
  const dialog = document.querySelector('.frame-dialog');
  const frames = [...document.querySelectorAll('[data-frame]')];
  let frameIndex = 0;
  const displayFrame = index => {
    frameIndex = (index + frames.length) % frames.length;
    const button = frames[frameIndex], image = dialog.querySelector('.frame-full');
    image.src = button.dataset.frame;
    image.alt = button.querySelector('img').alt;
    dialog.querySelector('.frame-caption').textContent = button.dataset.frameCaption;
  };
  frames.forEach((button, index) => button.addEventListener('click', () => { displayFrame(index); dialog.showModal(); }));
  dialog.querySelector('[data-frame-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-frame-prev]').addEventListener('click', () => displayFrame(frameIndex - 1));
  dialog.querySelector('[data-frame-next]').addEventListener('click', () => displayFrame(frameIndex + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); displayFrame(frameIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); displayFrame(frameIndex + 1); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.querySelector('[data-print]').addEventListener('click', () => print());
})();
