/* Final authoritative layer. This file must be loaded last. */
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
    try {
      return JSON.parse(localStorage.getItem('ert_study_settings_v1')) || { mode: 'balanced', drillType: 'tf_not_given' };
    } catch {
      return { mode: 'balanced', drillType: 'tf_not_given' };
    }
  }

  function modeLabel() {
    const mode = settings().mode || 'balanced';
    return {
      balanced: '智能混合训练',
      ielts: 'IELTS Reading',
      toefl: 'TOEFL Reading',
      cet: 'CET / 高考阅读',
      drill: '题型专项训练'
    }[mode] || '智能混合训练';
  }

  function hash(text) {
    let h = 2166136261;
    const value = String(text || '');
    for (let i = 0; i < value.length; i += 1) {
      h ^= value.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return Math.abs(h >>> 0);
  }

  function rangeFor(p) {
    const mode = settings().mode || 'balanced';
    const level = String(p?.level || 'default').toUpperCase();
    const ranges = MODE_RANGES[mode] || MODE_RANGES.balanced;
    return ranges[level] || ranges.default;
  }

  function targetCount(p, all) {
    const [min, max] = rangeFor(p);
    const spread = Math.max(0, max - min);
    const seed = hash(`${p?.id || ''}|${p?.title || ''}|${p?.topic || ''}|${p?.level || ''}|${settings().mode || ''}|${settings().drillType || ''}`);
    const target = min + (seed % (spread + 1));
    return Math.max(1, Math.min(target, all.length));
  }

  function uniqueById(items) {
    const seen = new Set();
    const out = [];
    items.forEach((item, index) => {
      const id = item?.id ?? `${item?.type || 'q'}_${index}`;
      if (!seen.has(id)) {
        seen.add(id);
        out.push(item);
      }
    });
    return out;
  }

  window.finalSelectPracticeQuestions = function finalSelectPracticeQuestions(p) {
    const all = uniqueById(Array.isArray(p?.questions) ? p.questions : []);
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
    const selectedIds = new Set();
    const priority = MODE_PRIORITIES[mode] || MODE_PRIORITIES.balanced;
    priority.forEach((type) => {
      const bucket = byType.get(type) || [];
      if (bucket.length && selected.length < target) {
        const offset = hash(`${p?.id || ''}|${type}`) % bucket.length;
        const q = bucket[offset];
        const id = q.id ?? `${type}_${offset}`;
        if (!selectedIds.has(id)) {
          selected.push(q);
          selectedIds.add(id);
        }
      }
    });

    const rotated = all.slice();
    const start = hash(`${p?.id || ''}|fill`) % rotated.length;
    const ordered = rotated.slice(start).concat(rotated.slice(0, start));
    ordered.forEach((q, index) => {
      const id = q.id ?? `${q.type || 'q'}_${index}`;
      if (selected.length < target && !selectedIds.has(id)) {
        selected.push(q);
        selectedIds.add(id);
      }
    });

    return selected.slice(0, target);
  };

  window.selectPracticeQuestions = function selectPracticeQuestions(questions) {
    const p = window.app?.current || { id: 'anonymous', title: 'anonymous', level: 'B1', topic: 'general', questions };
    return window.finalSelectPracticeQuestions({ ...p, questions });
  };

  function cleanCounts(root = document) {
    const passageCount = document.getElementById('passageCount');
    if (passageCount) passageCount.textContent = '选择训练方向后开始，不展示底层题库数量';

    root.querySelectorAll('.passage-card .muted, #practiceMeta, #practiceModeNote').forEach((node) => {
      node.textContent = String(node.textContent || '')
        .replace(/\d+\s*words\s*·\s*/gi, '')
        .replace(/本次\s*\d+\s*题\s*·\s*/g, '')
        .replace(/\d+\s*题\s*·\s*/g, '')
        .replace(/\d+\s*题/g, '')
        .replace(/\d+\s*道/g, '')
        .trim();
    });
  }

  window.createCard = function createCard(p) {
    const card = document.createElement('article');
    card.className = `passage-card ${p.category}`;

    const tags = document.createElement('div');
    tags.className = 'card-tags';

    const level = document.createElement('span');
    level.className = 'level-pill';
    level.textContent = p.level;

    const source = document.createElement('span');
    source.className = `source-pill ${p.category}`;
    source.textContent = categoryLabel(p.category);

    const topic = document.createElement('span');
    topic.className = 'topic-pill';
    topic.textContent = p.topic || 'general';
    tags.append(level, source, topic);

    const title = document.createElement('h3');
    title.textContent = p.title;

    const preview = document.createElement('p');
    preview.textContent = shortText(String(p.passage || '').replace(/\n+/g, ' '), 120);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const meta = document.createElement('span');
    meta.className = 'muted';
    meta.textContent = `${modeLabel()} · 考试型题组`;

    const btn = document.createElement('button');
    btn.className = 'primary-btn';
    btn.textContent = '开始';
    btn.addEventListener('click', () => openPassage(p.id));

    footer.append(meta, btn);
    card.append(tags, title, preview, footer);
    return card;
  };

  window.startPractice = function startPractice() {
    if (!app.current) return;
    app.currentQuestions = window.finalSelectPracticeQuestions(app.current);
    document.getElementById('preStartBox').classList.add('hidden');
    document.getElementById('readingBox').classList.remove('hidden');
    renderQuestions({ ...app.current, questions: app.currentQuestions });
    const meta = document.getElementById('practiceMeta');
    if (meta) meta.textContent = `${app.current.topic || 'general'} · ${modeLabel()} · 考试型题组`;
    cleanCounts(document.getElementById('practiceView') || document);
    startTimer();
  };

  window.grade = function grade() {
    const p = app.current;
    const questions = app.currentQuestions && app.currentQuestions.length ? app.currentQuestions : window.finalSelectPracticeQuestions(p);
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

  const previousOpenPassage = window.openPassage;
  window.openPassage = function openPassage(id) {
    previousOpenPassage(id);
    if (!app.current) return;
    app.currentQuestions = window.finalSelectPracticeQuestions(app.current);
    const meta = document.getElementById('practiceMeta');
    if (meta) meta.textContent = `${app.current.topic || 'general'} · ${modeLabel()} · 考试型题组`;
    const note = document.getElementById('practiceModeNote');
    if (note) note.textContent = `${modeLabel()}：系统会根据文章难度和考试方向自动组织题组。`;
    cleanCounts(document.getElementById('practiceView') || document);
  };

  const previousRenderCards = window.renderCards;
  window.renderCards = function renderCards(resetLimit = false) {
    previousRenderCards(resetLimit);
    cleanCounts(document);
  };

  window.addEventListener('load', () => {
    setTimeout(() => {
      cleanCounts(document);
      if (typeof window.renderCards === 'function') window.renderCards(true);
    }, 150);
  });
})();
