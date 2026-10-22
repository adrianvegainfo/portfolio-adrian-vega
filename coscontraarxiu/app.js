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
    restoring = false;
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
    if (!restoring) return;
    if (location.hash || pos) scrollTo({top: target.getBoundingClientRect().top + scrollY + pos * target.getBoundingClientRect().height - header.offsetHeight - 20, behavior: 'instant'});
    const clean = new URL(location.href); clean.searchParams.delete('pos');
    try { history.replaceState(null, '', clean); } catch { /* File URLs may restrict history changes. */ }
    restoring = false; update();
  });
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', restore, {once: true});
  else restore();
  addEventListener('hashchange', update);
  const media = [];
  const onScreen = c => {
    const r = c.unit.getBoundingClientRect();
    return r.bottom > header.offsetHeight && r.top < innerHeight;
  };
  const silenceOthers = current => media.forEach(c => { if (c !== current) c.setMuted(true); });
  const syncMedia = c => {
    const muted = c.isMuted(), playing = c.isPlaying();
    const sound = muted ? c.unit.dataset.labelUnmute : c.unit.dataset.labelMute;
    const playback = playing ? c.unit.dataset.labelPause : c.unit.dataset.labelPlay;
    c.sound.textContent = sound;
    c.sound.setAttribute('aria-label', `${sound} · ${c.unit.dataset.mediaTitle}`);
    c.play.textContent = playback;
    c.play.setAttribute('aria-label', `${playback} · ${c.unit.dataset.mediaTitle}`);
    c.sound.disabled = c.play.disabled = !c.ready || c.failed;
    c.status.textContent = c.failed ? c.unit.dataset.labelFallback : (!c.ready ? c.unit.dataset.labelLoading : '');
    c.unit.dataset.playing = String(playing);
    c.unit.dataset.muted = String(muted);
  };
  let youtubeAPI;
  const loadYouTube = () => {
    if (window.YT?.Player) return Promise.resolve();
    if (!youtubeAPI) youtubeAPI = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const timeout = setTimeout(() => reject(new Error('YouTube API unavailable')), 30000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        if (typeof previous === 'function') previous();
        resolve();
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => { clearTimeout(timeout); reject(new Error('YouTube API unavailable')); };
      document.head.append(script);
    });
    return youtubeAPI;
  };
  document.querySelectorAll('.media-unit').forEach(unit => {
    const c = {unit, ready: false, failed: false, userPaused: false, internalPause: false,
      sound: unit.querySelector('[data-media-sound]'), play: unit.querySelector('[data-media-play]'),
      status: unit.querySelector('.media-status')};
    const video = unit.querySelector('video');
    if (video) {
      c.ready = true;
      video.defaultMuted = video.muted = true;
      video.loop = video.playsInline = true;
      c.isMuted = () => video.muted || video.volume === 0;
      c.isPlaying = () => !video.paused && !video.ended;
      c.setMuted = value => {
        if (!value && video.volume === 0) video.volume = 1;
        video.muted = value;
        syncMedia(c);
      };
      c.start = () => {
        const promise = video.play();
        if (promise) promise.catch(() => syncMedia(c));
      };
      c.suspend = () => {
        if (!video.paused) { c.internalPause = true; video.pause(); }
        syncMedia(c);
      };
      video.addEventListener('play', () => {
        c.userPaused = false;
        c.internalPause = false;
        if (document.hidden || !onScreen(c)) { c.suspend(); return; }
        if (!c.isMuted()) silenceOthers(c);
        syncMedia(c);
      });
      video.addEventListener('pause', () => {
        if (!c.internalPause) c.userPaused = true;
        c.internalPause = false;
        syncMedia(c);
      });
      video.addEventListener('volumechange', () => {
        if (!c.isMuted()) silenceOthers(c);
        syncMedia(c);
      });
      video.addEventListener('loadeddata', () => syncMedia(c));
    } else {
      const iframe = unit.querySelector('iframe');
      const url = new URL(iframe.src);
      if (/^https?:$/.test(location.protocol)) url.searchParams.set('origin', location.origin);
      else url.searchParams.delete('origin');
      if (iframe.src !== url.href) iframe.src = url.href;
      c.isMuted = () => !c.ready || c.player.isMuted() || c.player.getVolume() === 0;
      c.isPlaying = () => c.ready && [1, 3].includes(c.player.getPlayerState());
      c.setMuted = value => {
        if (!c.ready) return;
        if (value) c.player.mute();
        else { if (!c.player.getVolume()) c.player.setVolume(100); c.player.unMute(); }
        c.lastMuted = value;
        syncMedia(c);
      };
      c.start = () => { if (c.ready && !c.failed) c.player.playVideo(); };
      c.suspend = () => {
        if (!c.ready) return;
        c.internalPause = true;
        c.player.pauseVideo();
        syncMedia(c);
      };
      c.initialize = () => {
        if (c.initializing) return;
        c.initializing = true;
        loadYouTube().then(() => {
          c.player = new YT.Player(iframe.id, {events: {
            onReady: () => {
              c.ready = true;
              c.player.mute();
              c.lastMuted = true;
              if (onScreen(c) && !document.hidden && !c.userPaused) c.start();
              else c.suspend();
              syncMedia(c);
            },
            onStateChange: event => {
              unit.dataset.playerState = String(event.data);
              if (event.data === 1) {
                c.userPaused = c.internalPause = false;
                if (document.hidden || !onScreen(c)) { c.setMuted(true); c.suspend(); }
                else if (!c.isMuted()) silenceOthers(c);
              } else if (event.data === 2) {
                if (!c.internalPause) c.userPaused = true;
                c.internalPause = false;
              } else if (event.data === 0 && onScreen(c) && !document.hidden && !c.userPaused) {
                c.player.seekTo(0, true);
                c.start();
              }
              syncMedia(c);
            },
            onAutoplayBlocked: () => { unit.dataset.autoplayBlocked = 'true'; syncMedia(c); },
            onError: event => { c.failed = true; unit.dataset.mediaError = String(event.data); syncMedia(c); }
          }});
        }).catch(() => { c.failed = true; syncMedia(c); });
      };
    }
    c.sound.addEventListener('click', () => {
      if (!c.ready || c.failed) return;
      const muted = !c.isMuted();
      if (!muted) silenceOthers(c);
      c.setMuted(muted);
    });
    c.play.addEventListener('click', () => {
      if (!c.ready || c.failed) return;
      if (c.isPlaying()) { c.userPaused = true; c.suspend(); }
      else { c.userPaused = false; c.start(); }
    });
    media.push(c);
    syncMedia(c);
  });
  const visibleMedia = new IntersectionObserver(entries => entries.forEach(entry => {
    const c = media.find(item => item.unit === entry.target);
    if (entry.isIntersecting && !document.hidden) {
      if (!c.userPaused) c.start();
    } else { c.setMuted(true); c.suspend(); }
  }), {threshold: 0.01});
  const nearbyMedia = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const c = media.find(item => item.unit === entry.target);
    c.initialize();
    nearbyMedia.unobserve(entry.target);
  }), {rootMargin: '600px'});
  media.forEach(c => { visibleMedia.observe(c.unit); if (c.initialize) nearbyMedia.observe(c.unit); });
  // The official YouTube API has no volume-change event; also follow its native controls.
  setInterval(() => media.forEach(c => {
    if (!c.initialize || !c.ready || document.hidden || !onScreen(c)) return;
    const muted = c.isMuted();
    if (!muted && c.lastMuted) silenceOthers(c);
    c.lastMuted = muted;
    syncMedia(c);
  }), 500);
  document.addEventListener('visibilitychange', () => media.forEach(c => {
    c.setMuted(true);
    if (document.hidden) c.suspend();
    else if (onScreen(c) && !c.userPaused) c.start();
  }));
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
