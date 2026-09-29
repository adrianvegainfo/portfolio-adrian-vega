(() => {
  const background = document.querySelector('[data-background-video]');
  const toggle = document.querySelector('[data-toggle-background]');
  const trigger = document.querySelector('[data-play-teaser]');
  const dialog = document.querySelector('[data-teaser-dialog]');
  const player = document.querySelector('[data-teaser-player]');
  const close = document.querySelector('[data-close-teaser]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const embed = 'https://www.youtube.com/embed/pkP5lEjQFqI';
  const backgroundURL = `${embed}?autoplay=1&mute=1&controls=0&loop=1&playlist=pkP5lEjQFqI&playsinline=1&rel=0`;
  let running = false;
  let restoreBackground = false;

  function setBackground(play) {
    running = play;
    if (play) background.src = backgroundURL;
    else background.removeAttribute('src');
    background.hidden = !play;
    toggle.textContent = play ? toggle.dataset.pause : toggle.dataset.resume;
    toggle.setAttribute('aria-pressed', String(play));
  }

  toggle.hidden = false;
  setBackground(!reducedMotion.matches);
  toggle.addEventListener('click', () => setBackground(!running));
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      restoreBackground = false;
      setBackground(false);
    }
  });

  trigger.addEventListener('click', (event) => {
    // Keep the direct YouTube link as a fallback if native dialogs are unavailable.
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    restoreBackground = running;
    setBackground(false);
    const frame = document.createElement('iframe');
    frame.title = document.querySelector('#teaser-dialog-title').textContent;
    frame.src = `${embed}?autoplay=1&mute=0&controls=1&playsinline=1&rel=0`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(frame);
    dialog.showModal();
    document.body.classList.add('teaser-open');
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.replaceChildren();
    document.body.classList.remove('teaser-open');
    setBackground(restoreBackground);
    trigger.focus();
  });
  document.querySelectorAll('.language-switch a').forEach((link) => {
    link.addEventListener('click', () => {
      link.href = link.getAttribute('href').split('#')[0] + window.location.hash;
    });
  });
})();

// Keep section anchors clear of the always-visible navigation.
const dossierHeader = document.querySelector('.topbar');
if (dossierHeader) {
  const updateDossierHeaderHeight = () => document.documentElement.style.setProperty('--dossier-header-height', `${dossierHeader.getBoundingClientRect().height}px`);
  updateDossierHeaderHeight();
  new ResizeObserver(updateDossierHeaderHeight).observe(dossierHeader);
}

// Indicate which dossier section is currently being read.
const dossierNav = document.querySelector('#main-nav');
if (dossierNav && dossierHeader) {
  const navLinks = [...dossierNav.querySelectorAll('a[href^="#"]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const linkById = new Map(navLinks.map((link) => [link.hash.slice(1), link]));
  let currentLink = null;
  let scheduled = false;

  const updateCurrentSection = () => {
    scheduled = false;
    const readingLine = dossierHeader.getBoundingClientRect().height + Math.min(window.innerHeight * 0.2, 150);
    let activeLink = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top > readingLine) break;
      activeLink = linkById.get(section.id) || activeLink;
    }
    if (activeLink === currentLink) return;
    currentLink?.removeAttribute('aria-current');
    activeLink?.setAttribute('aria-current', 'location');
    currentLink = activeLink;
    if (activeLink && dossierNav.scrollWidth > dossierNav.clientWidth) {
      const left = activeLink.offsetLeft - dossierNav.offsetLeft;
      const right = left + activeLink.offsetWidth;
      if (left < dossierNav.scrollLeft || right > dossierNav.scrollLeft + dossierNav.clientWidth) {
        dossierNav.scrollTo({ left: left - (dossierNav.clientWidth - activeLink.offsetWidth) / 2, behavior: 'smooth' });
      }
    }
  };

  const scheduleCurrentSection = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateCurrentSection);
  };
  window.addEventListener('scroll', scheduleCurrentSection, { passive: true });
  window.addEventListener('resize', scheduleCurrentSection);
  window.addEventListener('hashchange', scheduleCurrentSection);
  scheduleCurrentSection();
}
