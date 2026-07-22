/* ============================================================
   Navigazione del deck — Sotto il Cofano degli LLM
   ============================================================ */
(() => {
  const allSlides = Array.from(document.querySelectorAll('.slide'));
  let slides = allSlides;
  let total = slides.length;
  let current = 0;

  const progressFill = document.getElementById('progressFill');
  const hudSection = document.getElementById('hudSection');
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');
  const kbdHint = document.getElementById('kbdHint');
  const overview = document.getElementById('overview');
  const overviewInner = document.getElementById('overviewInner');


  // titolo breve per l'indice (overview)
  const shortTitle = s => {
    const h = s.querySelector('h1, h2, .divider-title, .paper-title');
    let t = h ? h.textContent.trim().replace(/\s+/g, ' ') : 'Slide';
    return t.length > 42 ? t.slice(0, 40) + '…' : t;
  };

  // Shift+9: nasconde/mostra le slide opzionali (System Prompt + RAG) per accorciare il talk
  function toggleOptional() {
    const activeSlide = slides[current];
    allSlides.forEach(s => { if (s.dataset.optional !== undefined) s.classList.toggle('opt-off'); });
    slides = allSlides.filter(s => !s.classList.contains('opt-off'));
    total = slides.length;
    buildOverview();
    const idx = slides.indexOf(activeSlide);
    show(idx === -1 ? Math.min(current, total - 1) : idx);
  }

  function show(idx, dir) {
    idx = Math.max(0, Math.min(total - 1, idx));
    slides.forEach((s, i) => {
      s.classList.remove('active', 'past');
      if (i === idx) s.classList.add('active');
      else if (i < idx) s.classList.add('past');
    });
    current = idx;
    progressFill.style.width = ((idx) / (total - 1) * 100) + '%';
    hudSection.innerHTML = slides[idx].dataset.section || '';
    navPrev.disabled = idx === 0;
    navNext.disabled = idx === total - 1;
    updateOverviewCurrent();
    triggerSlideHooks(idx);
  }

  // Animazioni/azioni che partono quando una certa slide diventa attiva
  function triggerSlideHooks(idx) {
    const slide = slides[idx];
    if (slide.querySelector('#pfDiagram')) {
      setTimeout(() => Demos.playPrefill(), 350);
    }
    if (slide.querySelector('#decLoop')) {
      setTimeout(() => Demos.playDecodeLoop(), 350);
    }
    if (slide.querySelector('#cnnNet')) {
      setTimeout(() => Demos.playCnn(), 450);
    }
  }

  function next() { if (current < total - 1) show(current + 1); }
  function prev() { if (current > 0) show(current - 1); }

  // ---- keyboard ----
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.code === 'Digit9') { e.preventDefault(); toggleOptional(); return; }
    if (overview.classList.contains('open')) {
      if (e.key === 'Escape' || (e.shiftKey && e.code === 'Digit0')) toggleOverview();
      return;
    }
    // non rubare le frecce mentre si scrive in un input
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': next(); break;
      case ' ': if (!typing) { e.preventDefault(); next(); } break;
      case 'ArrowLeft': case 'PageUp': prev(); break;
      case 'Home': show(0); break;
      case 'End': show(total - 1); break;
      case 'f': case 'F': if (!typing) toggleFullscreen(); break;
    }
    if (e.shiftKey && e.code === 'Digit0' && !typing) toggleOverview();
  });

  navNext.addEventListener('click', next);
  navPrev.addEventListener('click', prev);

  // ---- touch swipe ----
  let touchX = null, touchY = null;
  document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
    touchX = touchY = null;
  }, { passive: true });

  // ---- wheel (debounced) ----
  let wheelLock = false;
  document.addEventListener('wheel', e => {
    if (overview.classList.contains('open')) return;
    if (Math.abs(e.deltaY) < 30) return;
    if (wheelLock) return;
    wheelLock = true;
    e.deltaY > 0 ? next() : prev();
    setTimeout(() => wheelLock = false, 700);
  }, { passive: true });

  // ---- fullscreen ----
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  // ---- overview ----
  function buildOverview() {
    overviewInner.innerHTML = '';
    slides.forEach((s, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ov-card';
      card.setAttribute('aria-label', `Vai alla slide ${i + 1}: ${shortTitle(s)}`);
      card.innerHTML = `
        <div class="ov-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="ov-sec">${s.dataset.section || ''}</div>
        <div class="ov-title">${shortTitle(s)}</div>`;
      card.addEventListener('click', () => { toggleOverview(); show(i); });
      overviewInner.appendChild(card);
    });
  }
  function updateOverviewCurrent() {
    overviewInner.querySelectorAll('.ov-card').forEach((c, i) => c.classList.toggle('current', i === current));
  }
  function toggleOverview() {
    overview.classList.toggle('open');
    if (overview.classList.contains('open')) updateOverviewCurrent();
  }

  // hide kbd hint after a few seconds / first interaction
  let hintTimer = setTimeout(() => kbdHint.classList.add('hidden'), 6000);
  document.addEventListener('keydown', () => { kbdHint.classList.add('hidden'); clearTimeout(hintTimer); }, { once: true });

  // ---- init ----
  Demos.init();
  buildOverview();
  show(0);

  // deep-link via hash (#3)
  const h = parseInt(location.hash.slice(1), 10);
  if (!isNaN(h)) show(h - 1);
  window.addEventListener('beforeunload', () => {});
})();
