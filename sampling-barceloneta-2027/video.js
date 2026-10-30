(() => {
  const bg = document.querySelector('[data-background-video]');
  const toggle = document.querySelector('[data-toggle-background]');
  const trigger = document.querySelector('[data-play-teaser]');
  const dialog = document.querySelector('[data-teaser-dialog]');
  const player = document.querySelector('[data-teaser-player]');
  const base = 'https://www.youtube.com/embed/pkP5lEjQFqI';
  const origin = location.protocol.startsWith('http') ? location.origin : 'https://www.adrianvega.art';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function frameURL(background) {
    const params = new URLSearchParams({origin, autoplay:'1', mute:background?'1':'0', controls:background?'0':'1', playsinline:'1', rel:'0'});
    if (background) { params.set('loop','1'); params.set('playlist','pkP5lEjQFqI'); }
    return `${base}?${params}`;
  }
  function setBackground(play) {
    bg.hidden = !play;
    if (play) bg.src = frameURL(true); else bg.removeAttribute('src');
    toggle.textContent = play ? 'Pausar fondo' : 'Reproducir fondo';
    toggle.setAttribute('aria-pressed', String(play));
  }
  // YouTube requires a referrer; keep the image as a fallback when embedding is blocked.
  bg.referrerPolicy = 'strict-origin-when-cross-origin';
  bg.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  toggle.hidden = false;
  setBackground(!reduced.matches);
  toggle.addEventListener('click', () => setBackground(bg.hidden));
  reduced.addEventListener('change', () => setBackground(!reduced.matches));
  trigger.addEventListener('click', event => {
    if (!dialog.showModal) return;
    event.preventDefault(); setBackground(false);
    const frame = document.createElement('iframe');
    frame.src = frameURL(false); frame.title = 'SAMPLING · Teaser de investigación';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(frame); dialog.showModal();
  });
  document.querySelector('[data-close-teaser]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {player.replaceChildren(); trigger.focus();});
  const header = document.querySelector('.topbar');
  const nav = [...document.querySelectorAll('#main-nav a')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  function update() {
    document.documentElement.style.setProperty('--dossier-header-height', `${header.offsetHeight}px`);
    let current;
    for (const section of sections) {
      if (section.getBoundingClientRect().top > header.offsetHeight + 100) break;
      current = nav.find(a => a.hash === '#' + section.id) || current;
    }
    nav.forEach(a => current === a ? a.setAttribute('aria-current','location') : a.removeAttribute('aria-current'));
  }
  addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); update();
})();
