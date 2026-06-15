function publicTrainingLabel() {
  try {
    const settings = JSON.parse(localStorage.getItem('ert_study_settings_v1')) || { mode: 'balanced' };
    return {
      balanced: '智能混合训练',
      ielts: 'IELTS Reading',
      toefl: 'TOEFL Reading',
      cet: 'CET / 高考阅读',
      drill: '题型专项训练'
    }[settings.mode || 'balanced'] || '智能混合训练';
  } catch {
    return '智能混合训练';
  }
}

function publicPracticeQuestions(p) {
  if (!p) return [];
  const all = Array.isArray(p.questions) ? p.questions : [];
  let selected = [];
  if (typeof selectPracticeQuestions === 'function') {
    selected = selectPracticeQuestions(all) || [];
  }
  if (!selected.length) selected = all.slice(0, 16);
  return selected.slice(0, 18);
}

function publicCleanCounts(root = document) {
  const badgeTextNodes = root.querySelectorAll('.app-header *');
  badgeTextNodes.forEach((node) => {
    if (!node.children.length) {
      node.textContent = (node.textContent || '').replace(/10700\+\s*passages/gi, '').replace(/10700\+\s*文章题库\s*·\s*/g, '').trim();
    }
  });

  const passageCount = document.getElementById('passageCount');
  if (passageCount) passageCount.textContent = '选择训练方向后开始，不展示底层题库数量';

  root.querySelectorAll('.passage-card .muted, #practiceMeta, #practiceModeNote').forEach((node) => {
    const text = node.textContent || '';
    node.textContent = text
      .replace(/\d+\s*words\s*·\s*/gi, '')
      .replace(/本次\s*\d+\s*题\s*·\s*/g, '')
      .replace(/系统会从完整题库中抽取\s*\d+\s*道/g, '系统会自动组织')
      .replace(/\d+\s*道考试型题目/g, '考试型题组')
      .replace(/\d+\s*题/g, '')
      .trim();
  });

  document.querySelectorAll('.category-card strong').forEach((node) => {
    const parent = node.closest('.category-card');
    if (parent?.classList.contains('curated')) node.textContent = '精选';
    else if (parent?.classList.contains('generated')) node.textContent = '题库';
    else if (parent?.classList.contains('manual')) node.textContent = '样例';
    else if (parent?.classList.contains('custom')) node.textContent = '导入';
  });
}

createCard = function createCard(p) {
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
  meta.textContent = `${publicTrainingLabel()} · 考试型题组`;

  const btn = document.createElement('button');
  btn.className = 'primary-btn';
  btn.textContent = '开始';
  btn.addEventListener('click', () => openPassage(p.id));
  footer.append(meta, btn);
  card.append(tags, title, preview, footer);
  return card;
};

startPractice = function startPractice() {
  if (!app.current) return;
  app.currentQuestions = publicPracticeQuestions(app.current);
  document.getElementById('preStartBox').classList.add('hidden');
  document.getElementById('readingBox').classList.remove('hidden');
  renderQuestions({ ...app.current, questions: app.currentQuestions });
  const meta = document.getElementById('practiceMeta');
  if (meta) meta.textContent = `${app.current.topic || 'general'} · ${publicTrainingLabel()} · 考试型题组`;
  publicCleanCounts(document.getElementById('practiceView') || document);
  startTimer();
};

grade = function grade() {
  const p = app.current;
  const questions = app.currentQuestions && app.currentQuestions.length ? app.currentQuestions : publicPracticeQuestions(p);
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
  return function stableOpenPassage(id) {
    originalOpenPassage(id);
    const p = app.current;
    if (!p) return;
    app.currentQuestions = publicPracticeQuestions(p);
    const meta = document.getElementById('practiceMeta');
    if (meta) meta.textContent = `${p.topic || 'general'} · ${publicTrainingLabel()} · 考试型题组`;
    const note = document.getElementById('practiceModeNote');
    if (note) note.textContent = `${publicTrainingLabel()}：系统会按当前考试方向自动组织题型，避免题目堆叠。`;
    publicCleanCounts(document.getElementById('practiceView') || document);
  };
})(openPassage);

const stableRenderCards = typeof renderCards === 'function' ? renderCards : null;
if (stableRenderCards) {
  renderCards = function stableCustomerCards(resetLimit = false) {
    stableRenderCards(resetLimit);
    publicCleanCounts(document);
  };
}

window.addEventListener('load', () => {
  setTimeout(() => {
    publicCleanCounts(document);
    if (typeof renderCards === 'function') renderCards(true);
  }, 120);
  setTimeout(() => publicCleanCounts(document), 550);
});
