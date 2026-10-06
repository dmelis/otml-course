// End-of-slideshow overlay for lecture viewer pages.
//
// When the user reaches the final slide of a Keynote-exported deck, the
// iframe shows a black screen with no indication that the show has ended.
// This script surfaces a "Next lecture" / "Course overview" affordance
// in that state.
//
// Detection: Keynote's HTML player dispatches a
// `ShowController:SlideIndexDidChangeEvent` on the iframe's `document`
// each time the user advances. The detail carries a 0-based `slideIndex`.
// Total slide count comes from the lecture's `assets/header.json`.

(function(){
  const frame = document.querySelector('.viewer__frame iframe');
  const overlay = document.querySelector('.viewer__end');
  if (!frame || !overlay) return;

  // Only run for Keynote exports (own lectures). Guest PDFs embed the
  // browser's native PDF viewer, which already provides end-of-document cues.
  const src = frame.getAttribute('src') || '';
  if (!/\/assets\/lectures\//.test(src)) return;

  const headerUrl = src.replace(/\/index\.html$/, '/assets/header.json');
  let slideCount = 0;
  let onLastSlide = false;
  let dismissed = false;

  function showOverlay(){ if (!dismissed) overlay.classList.add('show'); }
  function hideOverlay(){ overlay.classList.remove('show'); }

  fetch(headerUrl).then(r => r.json()).then(h => {
    slideCount = (h.slideList || []).length;
    if (slideCount < 2) return;
    hookFrame();
    frame.addEventListener('load', hookFrame);
  }).catch(() => { /* no header → silently skip */ });

  function hookFrame(){
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      // Keynote fires this on every slide advance.
      doc.addEventListener('ShowController:SlideIndexDidChangeEvent', e => {
        const idx = (e.detail && e.detail.slideIndex) | 0;    // 0-based
        onLastSlide = (idx >= slideCount - 1);
        if (!onLastSlide) hideOverlay();
      });
      // User tried to advance — if they're already on the last slide, surface
      // the overlay. Advance keys per Keynote's player.
      doc.addEventListener('keydown', e => {
        const advance = (e.key === ' ' || e.key === 'ArrowRight' ||
                         e.key === 'ArrowDown' || e.key === 'PageDown' ||
                         e.key === 'Enter' || e.key === 'n' || e.key === 'N');
        if (advance && onLastSlide) showOverlay();
        const back = (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ||
                      e.key === 'PageUp' || e.key === 'Backspace' ||
                      e.key === 'p' || e.key === 'P');
        if (back) hideOverlay();
      }, true);
      doc.addEventListener('click', () => { if (onLastSlide) showOverlay(); }, true);
    } catch { /* cross-origin? shouldn't happen for same-origin assets */ }
  }

  // Dev-only: ?end=1 force-shows the overlay (for screenshot verification)
  if (new URLSearchParams(location.search).get('end') === '1') {
    overlay.classList.add('show');
  }

  // Dismiss button
  const dismissBtn = overlay.querySelector('.end-dismiss');
  if (dismissBtn) dismissBtn.addEventListener('click', () => {
    dismissed = true;
    hideOverlay();
  });
})();
