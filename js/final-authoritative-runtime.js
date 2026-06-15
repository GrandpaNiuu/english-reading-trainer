/* Final authoritative runtime. Loaded last. It owns card clicks, start, submit, grading and question selection. */
(function () {
  const MODE_RANGES = {
    balanced: { A1: [7, 10], A2: [8, 11], B1: [9, 13], B2: [11, 15], C1: [12, 17], IELTS: [13, 18], TOEFL: [13, 18], default: [9, 14] },
    ielts: { A1: [8, 10], A2: [9, 11], B1: [10, 13], B2: [12, 15], C1: [13, 17], IELTS: [14, 19], TOEFL: [13, 17], default: [11, 15] },
    toefl: { A1: [7, 9], A2: [8, 10], B1: [9, 12], B2: [10, 14], C1: [12, 16], IELTS: [12, 16], TOEFL: [13, 17], default: [9, 13] },
    cet: { A1: [7, 10], A2: [8, 11], B1: [9, 13], B2: [10, 14], C1: [11, 15], IELTS: [11, 15], TOEFL: [11, 15], default: [9, 13] },
    drill: { A1: [5, 7], A2: [5, 8], B1: [6, 9], B2: [7, 10], C1: [8, 11], IELTS: [8, 12], TOEFL: [8, 12], default: [6, 9] }
  };

  const MODE_PRIORITIES = {
    balanced: ['tf_not_given', 'matching_headings', 'ielts_summary_completion', 'flow_chart_completion', 'sentence_insertion', 'rhetorical_purpose', 'vocabulary_context', 'reference_question', 'evidence_location', 'multi_select', 'matching', 'ordering', 'summary_writing', 'paraphrase', 'main_idea', 'detail', 'inference', 'best_title'],
    ielts: ['tf_not_given', 'yes_no_not_given', 'matching_headings', 'matching_information', 'ielts_summary_completion', 'flow_chart_completion', 'exam_short_answer', 'reference_question', 'vocabulary_context', 'evidence_location', 'main_idea', 'detail'],
    toefl: ['rhetorical_purpose', 'sentence_insertion', 'vocabulary_context', 'reference_question', 'evidence_location', 'main_idea', 'detail', 'inference', 'best_title', 'summary_writing'],
    cet: ['main_idea', 'detail', 'inference', 'vocabulary_context', 'best_title', 'author_purpose', 'cause_effect', 'exam_short_answer', 'summary_writing', 'multi_select'],
    drill: []
  };

  function settings() {
    try { return JSON.parse(localStorage.getItem('ert_study_settings_v1')) || { mode: 'balanced', drillType: 'tf_not_given' }; }
    catch { return { mode: 'balanced', drillType: 'tf_not_given' }; }
  }

  function modeLabel() {
    const mode = settings().mode || 'balanced';
    return { balanced: '智能混合训练', ielts: 'IELTS Reading', toefl: 'TOEFL Reading', cet: 'CET / 高考阅读', drill: '题型专项训练' }[mode] || '智能混合训练';
  }

  function hash(text) {
    let h = 2166136261;
    String(text || '').split('').forEach((ch) => { h ^= ch.charCodeAt(0); h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24); });
    return Math.abs(h >>> 0);
  }

  function targetCount(p, all) {
    const mode = settings().mode || 'balanced';
    const level = String((p && p.level) || 'default').toUpperCase();
    const ranges = MODE_RANGES[mode] || MODE_RANGES.balanced;
    const range = ranges[level] || ranges.default;
    const min = range[0];
    const max = range[1];
    const seed = hash(`${(p && p.id) || ''}|${(p && p.title) || ''}|${(p && p.topic) || ''}|${level}|${mode}|${settings().drillType || ''}`);
    return Math.max(1, Math.min(min + (seed % (max - min + 1)), all.length));
  }

  function uniqueQuestions(items) {
    const seen = new Set();
    const out = [];
    (items || []).forEach((q, index) => {
      const id = q && q.id != null ? q.id : `${q && q.type ? q.type : 'q'}_${index}`;
      if (!seen.has(id)) { seen.add(id); out.push(q); }
    });
    return out;
  }

  function selectQuestions(p) {
    const all = uniqueQuestions(p && Array.isArray(p.questions) ? p.questions : []);
    if (!all.length) return [];
    const current = settings();
    const mode = current.mode || 'balanced';
    const target = targetCount(p, all);
    const byType = new Map();
    all.forEach((q) => {
      const type = q.type || 'multiple_choice';
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type).push(q);
    });
    if (mode === 'drill') {
      const bucket = byType.get(current.drillType) || [];
      if (bucket.length) return bucket.slice(0, Math.min(target, bucket.length));
    }
    const selected = [];
    const ids = new Set();
    (MODE_PRIORITIES[mode] || MODE_PRIORITIES.balanced).forEach((type) => {
      const bucket = byType.get(type) || [];
      if (bucket.length && selected.length < target) {
        const q = bucket[hash(`${p.id}|${type}`) % bucket.length];
        const id = q.id || `${type}_${selected.length}`;
        if (!ids.has(id)) { selected.push(q); ids.add(id); }
      }
    });
    const start = hash(`${p.id}|fill`) % all.length;
    all.slice(start).concat(all.slice(0, start)).forEach((q, index) => {
      const id = q.id || `${q.type || 'q'}_${index}`;
      if (selected.length < target && !ids.has(id)) { selected.push(q); ids.add(id); }
    });
    return selected.slice(0, target);
  }

  function cleanCounts(root) {
    const scope = root || document;
    const passageCount = document.getElementById('passageCount');
    if (passageCount) passageCount.textContent = '选择训练方向后开始，不展示底层题库数量';
    scope.querySelectorAll('.passage-card .muted, #practiceMeta, #practiceModeNote').forEach((node) => {
      node.textContent = String(node.textContent || '').replace(/\d+\s*words\s*·\s*/gi, '').replace(/本次\s*\d+\s*题\s*·\s*/g, '').replace(/\d+\s*题\s*·\s*/g, '').replace(/\d+\s*题/g, '').replace(/\d+\s*道/g, '').trim();
    });
  }

  window.finalSelectPracticeQuestions = selectQuestions;
  window.selectPracticeQuestions = function selectPracticeQuestions(questions) {
    let current = null;
    try { current = app.current; } catch { current = null; }
    return selectQuestions({ ...(current || { id: 'anonymous', title: 'anonymous', level: 'B1', topic: 'general' }), questions });
  };

  window.createCard = function createCard(p) {
    const card = document.createElement('article');
    card.className = `passage-card ${p.category}`;
    const tags = document.createElement('div');
    tags.className = 'card-tags';
    const level = document.createElement('span'); level.className = 'level-pill'; level.textContent = p.level;
    const source = document.createElement('span'); source.className = `source-pill ${p.category}`; source.textContent = categoryLabel(p.category);
    const topic = document.createElement('span'); topic.className = 'topic-pill'; topic.textContent = p.topic || 'general';
    tags.append(level, source, topic);
    const title = document.createElement('h3'); title.textContent = p.title;
    const preview = document.createElement('p'); preview.textContent = shortText(String(p.passage || '').replace(/\n+/g, ' '), 120);
    const footer = document.createElement('div'); footer.className = 'card-footer';
    const meta = document.createElement('span'); meta.className = 'muted'; meta.textContent = `${modeLabel()} · 考试型题组`;
    const btn = document.createElement('button'); btn.className = 'primary-btn'; btn.textContent = '开始'; btn.addEventListener('click', () => window.openPassage(p.id));
    footer.append(meta, btn); card.append(tags, title, preview, footer); return card;
  };

  window.openPassage = function openPassage(id) {
    const p = app.passages.find((item) => item.id === id);
    if (!p) return;
    stopTimer();
    app.current = p;
    app.currentQuestions = selectQuestions(p);
    app.elapsed = 0;
    document.getElementById('timerDisplay').textContent = formatTime(0);
    document.getElementById('practiceLevel').textContent = `${p.level} · ${categoryLabel(p.category)}`;
    document.getElementById('practiceTitle').textContent = p.title;
    document.getElementById('practiceMeta').textContent = `${p.topic || 'general'} · ${modeLabel()} · 考试型题组`;
    renderPassageText(p.passage);
    document.getElementById('questionForm').textContent = '';
    document.getElementById('preStartBox').classList.remove('hidden');
    document.getElementById('readingBox').classList.add('hidden');
    show('practiceView');
    cleanCounts(document.getElementById('practiceView'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.startPractice = function startPractice() {
    if (!app.current) return;
    app.currentQuestions = selectQuestions(app.current);
    document.getElementById('preStartBox').classList.add('hidden');
    document.getElementById('readingBox').classList.remove('hidden');
    renderQuestions({ ...app.current, questions: app.currentQuestions });
    document.getElementById('practiceMeta').textContent = `${app.current.topic || 'general'} · ${modeLabel()} · 考试型题组`;
    cleanCounts(document.getElementById('practiceView'));
    startTimer();
  };

  window.grade = function grade() {
    const p = app.current;
    const questions = app.currentQuestions && app.currentQuestions.length ? app.currentQuestions : selectQuestions(p);
    const details = questions.map((q) => gradeQuestion(q));
    const earned = details.reduce((sum, item) => sum + item.points, 0);
    const total = details.length;
    const correctCount = details.filter((x) => x.ok).length;
    const accuracy = total ? Math.round((earned / total) * 100) : 0;
    const seconds = Math.max(1, app.elapsed);
    const words = p.word_count || countWords(p.passage);
    const wpm = Math.round(words / (seconds / 60));
    const timeScore = timeScoreFor(wpm, p.level);
    const score = Math.round(accuracy * 0.82 + timeScore * 0.18);
    return { title: p.title, level: p.level, correctCount, total, accuracy, seconds, words, wpm, score, details, createdAt: new Date().toISOString() };
  };

  window.submitPractice = function submitPractice() {
    if (!app.current) return;
    stopTimer();
    const result = window.grade();
    if (typeof saveMistakesFromResult === 'function') saveMistakesFromResult(result);
    saveHistory(result);
    renderResult(result);
    renderHistory();
    if (typeof renderMistakePanel === 'function') renderMistakePanel();
    show('resultView');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function bindCleanButton(id, handler) {
    const oldBtn = document.getElementById(id);
    if (!oldBtn || !oldBtn.parentNode) return;
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); handler(); });
  }

  function bindFinalEvents() {
    bindCleanButton('startBtn', window.startPractice);
    bindCleanButton('submitBtn', window.submitPractice);
    bindCleanButton('randomBtn', () => {
      const pool = (app.filtered && app.filtered.length) ? app.filtered : app.passages;
      if (!pool.length) return;
      window.openPassage(pool[Math.floor(Math.random() * pool.length)].id);
    });
  }

  const oldRenderCards = window.renderCards;
  window.renderCards = function renderCards(resetLimit = false) {
    oldRenderCards(resetLimit);
    cleanCounts(document);
  };

  window.addEventListener('load', () => {
    setTimeout(() => { bindFinalEvents(); cleanCounts(document); if (typeof window.renderCards === 'function') window.renderCards(true); }, 200);
    setTimeout(bindFinalEvents, 900);
  });
})();
