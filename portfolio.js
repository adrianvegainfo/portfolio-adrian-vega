(() => {
  const content = window.SAMPLING_CONTENT;
  const select = document.querySelector('#language');
  const copy = {
    es: ['Coreografía · Interpretación · Artes visuales', 'Contacto ↗', 'Volver arriba ↑', 'Reproducir vídeo', 'Idioma', 'Ir al contenido'],
    en: ['Choreography · Performance · Visual arts', 'Contact ↗', 'Back to top ↑', 'Play video', 'Language', 'Skip to content'],
    ca: ['Coreografia · Interpretació · Arts visuals', 'Contacte ↗', 'Tornar a dalt ↑', 'Reproduir vídeo', 'Idioma', 'Anar al contingut'],
    fr: ['Chorégraphie · Performance · Arts visuels', 'Contact ↗', 'Retour en haut ↑', 'Lire la vidéo', 'Langue', 'Aller au contenu'],
    nl: ['Choreografie · Performance · Beeldende kunst', 'Contact ↗', 'Terug naar boven ↑', 'Video afspelen', 'Taal', 'Ga naar inhoud'],
  };
  function render(lang) {
    const labels = copy[lang];
    document.documentElement.lang = lang;
    select.value = lang;
    select.setAttribute('aria-label', labels[4]);
    document.querySelector('[data-role]').textContent = labels[0];
    document.querySelector('[data-intro]').textContent = content.ui[lang].hero;
    document.querySelector('[data-contact]').textContent = labels[1];
    document.querySelector('[data-top]').textContent = labels[2];
    document.querySelector('[data-language-label]').textContent = labels[4];
    document.querySelector('.skip-link').textContent = labels[5];
    document.title = `Adrián Vega | ${labels[0]}`;
    document.querySelector('meta[name="description"]').content = content.ui[lang].hero;
    document.querySelector('#works').innerHTML = content.folders.map((folder, index) => {
      const title = folder.label[lang];
      const media = folder.noMedia ? '' : `<div class="work-media">${folder.video
        ? `<button type="button" class="video-poster" data-video="${folder.video}" aria-label="${labels[3]}: ${title}"><img src="${folder.image}" alt="${title}" loading="lazy"><span class="play-label">▶ ${labels[3]}</span></button>`
        : `<img src="${folder.image}" alt="${title}" loading="lazy">`}</div>`;
      return `<section class="work-section ${folder.noMedia ? 'text-section' : ''}" id="${folder.key}" aria-labelledby="title-${folder.key}">
        <header class="work-heading"><p class="eyebrow">${String(index + 1).padStart(2, '0')} / ${folder.action[lang]}</p><h2 id="title-${folder.key}">${title}</h2></header>
        <div class="work-layout">${media}<div class="work-text">${folder.tabs[lang].map(tab => `<div class="work-block"><h3>${tab.title}</h3>${tab.html}</div>`).join('')}</div></div>
      </section>`;
    }).join('');
    document.querySelectorAll('[data-video]').forEach(button => {
      button.addEventListener('click', () => {
        const frame = document.createElement('iframe');
        frame.src = `https://www.youtube.com/embed/${button.dataset.video}?autoplay=1&playsinline=1&rel=0`;
        frame.title = button.getAttribute('aria-label');
        frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        frame.allowFullscreen = true;
        button.replaceWith(frame);
        frame.focus();
      });
    });
    document.querySelectorAll('.work-text img').forEach(img => { img.loading = 'lazy'; });
  }
  // Spanish is the default for shared links, independent of the old desktop preferences.
  const requested = new URL(location.href).searchParams.get('lang');
  render(Object.hasOwn(copy, requested) ? requested : 'es');
  select.addEventListener('change', () => {
    const url = new URL(location.href);
    url.searchParams.set('lang', select.value);
    history.replaceState(null, '', url);
    render(select.value);
  });
})();
