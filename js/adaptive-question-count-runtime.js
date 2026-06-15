function adaptiveHash(value) {
  const text = String(value || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getAdaptiveQuestionRange(p) {
  const level = String(p?.level || '').toUpperCase();
  let settings = { mode: 'balanced', drillType: 'tf_not_given' };
  try {
    settings = JSON.parse(localStorage.getItem('ert_study_settings_v1')) || settings;
  } catch {}

  const baseRanges = {
    balanced: [10, 16],
    ielts: [12, 16],
    toefl: [10, 14],
    cet: [10, 15],
    drill: [6, 10]
  };
  const levelAdjust = {
    A1: -2,
    A2: -1,
    B1: 0,
    B2: 1,
    C1: 2,
    IELTS: 2,
    TOEFL: 2,
    REVIEW: 0
  }[level] || 0;

  const range = baseRanges[settings.mode || 'balanced'] || baseRanges.balanced;
  const min = Math.max(5, range[0] + Math.min(0, levelAdjust));
  const max = Math.max(min, range[1] + Math.max(0, levelAdjust));
  return [min, max];
}

function adaptiveTargetQuestionCount(p) {
  const [min, max] = getAdaptiveQuestionRange(p);
  const hash = adaptiveHash(`${p?.id || ''}|${p?.title || ''}|${p?.level || ''}|${p?.topic || ''}`);
  return min + (hash % (max - min + 1));
}

function adaptiveSelectQuestions(p) {
  const all = Array.isArray(p?.questions) ? p.questions : [];
  if (!all.length) return [];

  let base = [];
  if (typeof selectPracticeQuestions === 'function') {
    base = selectPracticeQuestions(all) || [];
  }
  if (!base.length) base = all;

  const target = Math.min(adaptiveTargetQuestionCount(p), all.length);
  const selected = [];
  const seen = new Set();

  base.forEach((q) => {
    if (selected.length < target && q && !seen.has(q.id)) {
      selected.push(q);
      seen.add(q.id);
    }
  });

  all.forEach((q) => {
    if (selected.length < target && q && !seen.has(q.id)) {
      selected.push(q);
      seen.add(q.id);
    }
  });

  return selected;
}

publicPracticeQuestions = function publicPracticeQuestions(p) {
  return adaptiveSelectQuestions(p);
};

startPractice = function startPractice() {
  if (!app.current) return;
  app.currentQuestions = adaptiveSelectQuestions(app.current);
  document.getElementById('preStartBox').classList.add('hidden');
  document.getElementById('readingBox').classList.remove('hidden');
  renderQuestions({ ...app.current, questions: app.currentQuestions });
  const meta = document.getElementById('practiceMeta');
  if (meta) meta.textContent = `${app.current.topic || 'general'} · ${publicTrainingLabel()} · 考试型题组`;
  if (typeof publicCleanCounts === 'function') publicCleanCounts(document.getElementById('practiceView') || document);
  startTimer();
};

grade = function grade() {
  const p = app.current;
  const questions = app.currentQuestions && app.currentQuestions.length ? app.currentQuestions : adaptiveSelectQuestions(p);
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

openPassage = (function(originalOpenPassage) {
  return function adaptiveOpenPassage(id) {
    originalOpenPassage(id);
    if (!app.current) return;
    app.currentQuestions = adaptiveSelectQuestions(app.current);
    const meta = document.getElementById('practiceMeta');
    if (meta) meta.textContent = `${app.current.topic || 'general'} · ${publicTrainingLabel()} · 考试型题组`;
    const note = document.getElementById('practiceModeNote');
    if (note) note.textContent = `${publicTrainingLabel()}：系统会根据文章难度和考试方向自动组织题组。`;
    if (typeof publicCleanCounts === 'function') publicCleanCounts(document.getElementById('practiceView') || document);
  };
})(openPassage);

const adaptiveRenderCards = typeof renderCards === 'function' ? renderCards : null;
if (adaptiveRenderCards) {
  renderCards = function adaptiveCustomerCards(resetLimit = false) {
    adaptiveRenderCards(resetLimit);
    if (typeof publicCleanCounts === 'function') publicCleanCounts(document);
  };
}
