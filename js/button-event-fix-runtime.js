/* Must load after final-authoritative-runtime.js. Replaces stale DOM buttons so old listeners are removed. */
(function () {
  function bindCleanButton(id, handler) {
    const oldButton = document.getElementById(id);
    if (!oldButton || !oldButton.parentNode) return;
    const newButton = oldButton.cloneNode(true);
    oldButton.parentNode.replaceChild(newButton, oldButton);
    newButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handler(event);
    });
  }

  function currentPool() {
    if (Array.isArray(window.app?.filtered) && window.app.filtered.length) return window.app.filtered;
    if (Array.isArray(window.app?.passages)) return window.app.passages;
    try {
      if (Array.isArray(app.filtered) && app.filtered.length) return app.filtered;
      if (Array.isArray(app.passages)) return app.passages;
    } catch {}
    return [];
  }

  function bindFinalEvents() {
    bindCleanButton('startBtn', () => {
      if (typeof window.startPractice === 'function') window.startPractice();
      else if (typeof startPractice === 'function') startPractice();
    });

    bindCleanButton('submitBtn', () => {
      if (typeof window.submitPractice === 'function') window.submitPractice();
      else if (typeof submitPractice === 'function') submitPractice();
    });

    bindCleanButton('randomBtn', () => {
      const pool = currentPool();
      if (!pool.length) return;
      const selected = pool[Math.floor(Math.random() * pool.length)];
      if (typeof window.openPassage === 'function') window.openPassage(selected.id);
      else if (typeof openPassage === 'function') openPassage(selected.id);
    });
  }

  function forceQuestionSubsetIfAlreadyOpen() {
    try {
      if (!app.current) return;
      if (!document.getElementById('readingBox') || document.getElementById('readingBox').classList.contains('hidden')) return;
      const selected = typeof window.finalSelectPracticeQuestions === 'function'
        ? window.finalSelectPracticeQuestions(app.current)
        : (app.current.questions || []).slice(0, 12);
      app.currentQuestions = selected;
      renderQuestions({ ...app.current, questions: selected });
      const meta = document.getElementById('practiceMeta');
      if (meta) meta.textContent = `${app.current.topic || 'general'} · 考试型题组`;
    } catch {}
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      bindFinalEvents();
      forceQuestionSubsetIfAlreadyOpen();
    }, 250);
    setTimeout(bindFinalEvents, 900);
  });
})();
