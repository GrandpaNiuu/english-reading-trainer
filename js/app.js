const STORE = {
  history: 'ert_history_v1',
  custom: 'ert_custom_passages_v1'
};

const app = {
  passages: [],
  current: null,
  timer: null,
  startedAt: 0,
  elapsed: 0,
  installPrompt: null,
  visibleLimit: 60,
  filtered: []
};

const $ = (id) => document.getElementById(id);

function boot() {
  app.passages = normalizePassages([...(window.PASSAGES || []), ...readJson(STORE.custom, [])]);
  bind();
  renderLibrarySummary();
  populateTopicFilter();
  $('categoryFilter').value = 'curated';
  renderCards(true);
  renderHistory();
  initPwa();
}

function normalizePassages(passages) {
  return passages.map((p) => {
    const category = getCategory(p);
    const normalized = { ...p, category };
    return { ...normalized, questions: ensureMixedQuestions(normalized) };
  });
}

function ensureMixedQuestions(p) {
  const base = Array.isArray(p.questions)
    ? p.questions.map((q) => ({ ...q, type: inferQuestionType(q) }))
    : [];

  const hasTrueFalse = base.some((q) => q.type === 'true_false');
  const hasFillBlank = base.some((q) => q.type === 'fill_blank');
  const hasShortAnswer = base.some((q) => q.type === 'short_answer');
  const topic = String(p.topic || 'general').trim();
  const topicAnswer = topic.toLowerCase();

  if (!hasTrueFalse) {
    base.push({
      id: `${p.id}_tf_topic`,
      type: 'true_false',
      question: `True or False: The passage is mainly connected with ${topic}.`,
      correct_answer: 'True',
      explanation_cn: `文章主题字段是 ${topic}，所以该判断为 True。`
    });
  }

  if (!hasFillBlank) {
    base.push({
      id: `${p.id}_fill_topic`,
      type: 'fill_blank',
      question: 'Fill in the blank: The main topic of this passage is ______.',
      correct_answer: topicAnswer,
      accepted_answers: [topicAnswer, topic],
      explanation_cn: `本题填写文章主题：${topic}。`
    });
  }

  if (!hasShortAnswer) {
    base.push({
      id: `${p.id}_short_lesson`,
      type: 'short_answer',
      question: 'Answer briefly: What lesson or main message can readers learn from the passage?',
      min_words: 5,
      sample_answer: 'The passage shows that careful thinking and steady action can improve a situation.',
      explanation_cn: '简答题按完整度自动评分：建议写 5 个英文单词以上，并围绕文章主旨回答。'
    });
  }

  return base;
}

function inferQuestionType(q) {
  if (['true_false', 'fill_blank', 'short_answer'].includes(q.type)) return q.type;
  if (q.options) return q.type || 'multiple_choice';
  return q.type || 'short_answer';
}

function bind() {
  $('categoryFilter').addEventListener('change', () => renderCards(true));
  $('levelFilter').addEventListener('change', () => renderCards(true));
  $('topicFilter').addEventListener('change', () => renderCards(true));
  $('searchInput').addEventListener('input', () => renderCards(true));
  $('resetFiltersBtn').addEventListener('click', resetFilters);
  $('randomBtn').addEventListener('click', randomPassage);
  $('backToHomeBtn').addEventListener('click', home);
  $('resultBackBtn').addEventListener('click', home);
  $('startBtn').addEventListener('click', startPractice);
  $('submitBtn').addEventListener('click', submitPractice);
  $('clearHistoryBtn').addEventListener('click', clearHistory);
  $('importToggleBtn').addEventListener('click', () => $('importPanel').classList.toggle('hidden'));
  $('closeImportBtn').addEventListener('click', () => $('importPanel').classList.add('hidden'));
  $('importBtn').addEventListener('click', importPassages);
  $('clearCustomBtn').addEventListener('click', clearCustom);
  $('installBtn').addEventListener('click', installSiteApp);
}

function getCategory(p) {
  const source = String(p.source || '').toLowerCase();
  const quality = String(p.quality || '').toLowerCase();
  if (source.includes('curated') || quality.includes('curated')) return 'curated';
  if (source.includes('custom')) return 'custom';
  if (source.includes('generated') || source.includes('10000')) return 'generated';
  return 'manual';
}

function categoryLabel(category) {
  return {
    curated: '精选强化',
    generated: '基础大题库',
    manual: '人工样例',
    custom: '自定义导入'
  }[category] || '未知题库';
}

function categoryDescription(category) {
  return {
    curated: '优先练习：结构更完整，混合题型，含主旨、推理、词义、判断、填空、简答题。',
    generated: '大量刷题：10000 篇原创生成题库，自动补充判断、填空、简答题。',
    manual: '快速测试：人工样例风格短文，支持多题型练习。',
    custom: '你导入的文章：保存在当前浏览器中，也会自动补充混合题型。'
  }[category] || '';
}

function renderLibrarySummary() {
  const box = $('librarySummary');
  box.textContent = '';
  const counts = countByCategory();
  const cards = [
    ['curated', counts.curated || 0],
    ['generated', counts.generated || 0],
    ['manual', counts.manual || 0],
    ['custom', counts.custom || 0]
  ];

  cards.forEach(([category, count]) => {
    const button = document.createElement('button');
    button.className = `category-card ${category}`;
    button.type = 'button';
    button.addEventListener('click', () => {
      $('categoryFilter').value = category;
      renderCards(true);
      document.getElementById('homeView').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const label = document.createElement('span');
    label.className = 'category-label';
    label.textContent = categoryLabel(category);
    const number = document.createElement('strong');
    number.textContent = count;
    const desc = document.createElement('small');
    desc.textContent = categoryDescription(category);
    button.append(label, number, desc);
    box.appendChild(button);
  });
}

function countByCategory() {
  return app.passages.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
}

function populateTopicFilter() {
  const topics = [...new Set(app.passages.map((p) => p.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const select = $('topicFilter');
  select.innerHTML = '<option value="all">全部主题</option>';
  topics.forEach((topic) => {
    const option = document.createElement('option');
    option.value = topic;
    option.textContent = topic;
    select.appendChild(option);
  });
}

function resetFilters() {
  $('categoryFilter').value = 'curated';
  $('levelFilter').value = 'all';
  $('topicFilter').value = 'all';
  $('searchInput').value = '';
  renderCards(true);
}

function renderCards(resetLimit = false) {
  if (resetLimit) app.visibleLimit = 60;
  const category = $('categoryFilter').value;
  const level = $('levelFilter').value;
  const topic = $('topicFilter').value;
  const query = $('searchInput').value.trim().toLowerCase();
  const grid = $('passageGrid');
  grid.textContent = '';

  app.filtered = app.passages
    .filter((p) => {
      const okCategory = category === 'all' || p.category === category;
      const okLevel = level === 'all' || p.level === level;
      const okTopic = topic === 'all' || p.topic === topic;
      const text = `${p.title} ${p.topic || ''} ${p.level} ${p.source || ''} ${p.category || ''}`.toLowerCase();
      return okCategory && okLevel && okTopic && (!query || text.includes(query));
    })
    .sort(sortPassages);

  const shown = app.filtered.slice(0, app.visibleLimit);
  const label = category === 'all' ? '全部题库' : categoryLabel(category);
  $('passageCount').textContent = `${label}：${app.filtered.length} 篇文章，当前显示 ${shown.length} 篇`;
  updateActiveCategoryCards(category);

  if (!shown.length) {
    const empty = document.createElement('p');
    empty.className = 'muted empty-state';
    empty.textContent = '没有找到符合条件的文章。可以重置筛选，或换一个主题/难度。';
    grid.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  shown.forEach((p) => fragment.appendChild(createCard(p)));
  grid.appendChild(fragment);

  if (shown.length < app.filtered.length) {
    const more = document.createElement('button');
    more.className = 'secondary-btn load-more-btn';
    more.textContent = `显示更多 60 篇（剩余 ${app.filtered.length - shown.length} 篇）`;
    more.addEventListener('click', () => {
      app.visibleLimit += 60;
      renderCards(false);
    });
    grid.appendChild(more);
  }
}

function sortPassages(a, b) {
  const priority = { curated: 1, manual: 2, generated: 3, custom: 4 };
  const pa = priority[a.category] || 9;
  const pb = priority[b.category] || 9;
  if (pa !== pb) return pa - pb;
  return String(a.title).localeCompare(String(b.title));
}

function updateActiveCategoryCards(active) {
  document.querySelectorAll('.category-card').forEach((card) => {
    card.classList.toggle('active', card.classList.contains(active));
  });
}

function createCard(p) {
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
  preview.textContent = shortText(p.passage, 135);
  const footer = document.createElement('div');
  footer.className = 'card-footer';
  const meta = document.createElement('span');
  meta.className = 'muted';
  meta.textContent = `${p.word_count || countWords(p.passage)} words · ${p.questions.length} 题 · 混合题型`;
  const btn = document.createElement('button');
  btn.className = 'primary-btn';
  btn.textContent = '开始';
  btn.addEventListener('click', () => openPassage(p.id));
  footer.append(meta, btn);
  card.append(tags, title, preview, footer);
  return card;
}

function openPassage(id) {
  const p = app.passages.find((item) => item.id === id);
  if (!p) return;
  stopTimer();
  app.current = p;
  app.elapsed = 0;
  $('timerDisplay').textContent = formatTime(0);
  $('practiceLevel').textContent = `${p.level} · ${categoryLabel(p.category)}`;
  $('practiceTitle').textContent = p.title;
  $('practiceMeta').textContent = `${p.topic || 'general'} · ${p.word_count || countWords(p.passage)} words · ${p.questions.length} 题 · 选择/判断/填空/简答`;
  renderPassageText(p.passage);
  $('questionForm').textContent = '';
  $('preStartBox').classList.remove('hidden');
  $('readingBox').classList.add('hidden');
  show('practiceView');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPassageText(text) {
  const box = $('passageText');
  box.textContent = '';
  const paragraphs = formatPassageParagraphs(text);
  paragraphs.forEach((paragraph) => {
    const p = document.createElement('p');
    p.className = 'passage-paragraph';
    p.textContent = paragraph;
    box.appendChild(p);
  });
}

function formatPassageParagraphs(text) {
  const raw = String(text || '').trim();
  if (!raw) return [''];
  const existing = raw.split(/\n\s*\n|\r\n\s*\r\n/).map((p) => p.trim()).filter(Boolean);
  if (existing.length > 1) return existing;

  const sentences = raw.match(/[^.!?]+[.!?]+(?:["”'])?|[^.!?]+$/g) || [raw];
  const paragraphs = [];
  let current = [];
  sentences.map((s) => s.trim()).filter(Boolean).forEach((sentence) => {
    current.push(sentence);
    const wordCount = countWords(current.join(' '));
    if (current.length >= 3 || wordCount >= 70) {
      paragraphs.push(current.join(' '));
      current = [];
    }
  });
  if (current.length) paragraphs.push(current.join(' '));
  return paragraphs;
}

function randomPassage() {
  const pool = app.filtered.length ? app.filtered : app.passages;
  if (!pool.length) return;
  const p = pool[Math.floor(Math.random() * pool.length)];
  openPassage(p.id);
}

function startPractice() {
  if (!app.current) return;
  $('preStartBox').classList.add('hidden');
  $('readingBox').classList.remove('hidden');
  renderQuestions(app.current);
  startTimer();
}

function renderQuestions(p) {
  const form = $('questionForm');
  form.textContent = '';
  p.questions.forEach((q, index) => {
    const box = document.createElement('section');
    box.className = 'question-card';

    const head = document.createElement('div');
    head.className = 'question-head';
    const type = document.createElement('span');
    type.className = `question-type-pill ${q.type}`;
    type.textContent = questionTypeLabel(q);
    const title = document.createElement('p');
    title.textContent = `${index + 1}. ${q.question}`;
    head.append(type, title);
    box.appendChild(head);

    if (q.type === 'true_false') {
      renderTrueFalseInputs(box, q);
    } else if (q.options) {
      renderChoiceInputs(box, q);
    } else if (q.type === 'fill_blank') {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'text-answer';
      input.dataset.questionId = String(q.id);
      input.placeholder = '在这里输入答案，例如 topic / keyword';
      box.appendChild(input);
    } else {
      const textarea = document.createElement('textarea');
      textarea.className = 'short-answer';
      textarea.dataset.questionId = String(q.id);
      textarea.placeholder = '用英文简短回答，建议 5 个单词以上';
      box.appendChild(textarea);
    }

    form.appendChild(box);
  });
}

function renderChoiceInputs(box, q) {
  Object.entries(q.options).forEach(([key, value]) => {
    const label = document.createElement('label');
    label.className = 'option-label';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `q_${q.id}`;
    input.value = key;
    input.dataset.questionId = String(q.id);
    const span = document.createElement('span');
    span.textContent = `${key}. ${value}`;
    label.append(input, span);
    box.appendChild(label);
  });
}

function renderTrueFalseInputs(box, q) {
  ['True', 'False'].forEach((value) => {
    const label = document.createElement('label');
    label.className = 'option-label';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `q_${q.id}`;
    input.value = value;
    input.dataset.questionId = String(q.id);
    const span = document.createElement('span');
    span.textContent = value;
    label.append(input, span);
    box.appendChild(label);
  });
}

function submitPractice() {
  if (!app.current) return;
  stopTimer();
  const result = grade();
  saveHistory(result);
  renderResult(result);
  renderHistory();
  show('resultView');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function grade() {
  const p = app.current;
  const details = p.questions.map((q) => {
    const answer = getAnswer(q.id) || '未答';
    return gradeQuestion(q, answer);
  });
  const totalPoints = details.reduce((sum, item) => sum + item.point, 0);
  const total = details.length;
  const accuracy = total ? Math.round((totalPoints / total) * 100) : 0;
  const seconds = Math.max(1, app.elapsed);
  const words = p.word_count || countWords(p.passage);
  const wpm = Math.round(words / (seconds / 60));
  const timeScore = timeScoreFor(wpm, p.level);
  const score = Math.round(accuracy * 0.82 + timeScore * 0.18);
  const correctCount = Number(totalPoints.toFixed(1));
  return { title: p.title, level: p.level, correctCount, total, accuracy, seconds, words, wpm, score, details, createdAt: new Date().toISOString() };
}

function gradeQuestion(q, answer) {
  const normalizedAnswer = normalizeText(answer);
  let point = 0;
  let correctText = '';
  let explanation = q.explanation_cn || '';

  if (q.type === 'true_false') {
    correctText = q.correct_answer || 'True';
    point = normalizeText(answer) === normalizeText(correctText) ? 1 : 0;
  } else if (q.type === 'fill_blank') {
    const accepted = (q.accepted_answers && q.accepted_answers.length ? q.accepted_answers : [q.correct_answer]).filter(Boolean);
    correctText = accepted.join(' / ');
    point = accepted.some((item) => normalizeText(item) === normalizedAnswer) ? 1 : 0;
  } else if (q.options) {
    correctText = q.correct_answer || '';
    point = answer === correctText ? 1 : 0;
  } else {
    correctText = q.sample_answer || q.correct_answer || 'A complete answer related to the passage.';
    const minWords = q.min_words || 5;
    const wordCount = countWords(answer);
    if (wordCount >= minWords) point = 1;
    else if (wordCount >= Math.max(3, minWords - 2)) point = 0.5;
    if (!explanation) explanation = `简答题要求至少 ${minWords} 个英文单词，并且内容与文章主旨相关。`;
  }

  return {
    type: q.type,
    typeLabel: questionTypeLabel(q),
    question: q.question,
    user: answer,
    correct: correctText,
    explanation,
    point,
    ok: point >= 1
  };
}

function getAnswer(id) {
  const questionId = String(id);
  const checked = document.querySelector(`input[data-question-id="${questionId}"]:checked`);
  if (checked) return checked.value;
  const field = document.querySelector(`[data-question-id="${questionId}"]`);
  return field ? field.value.trim() : '';
}

function questionTypeLabel(q) {
  if (q.type === 'true_false') return '判断题';
  if (q.type === 'fill_blank') return '填空题';
  if (q.type === 'short_answer') return '简答题';
  return {
    main_idea: '主旨选择',
    detail: '细节选择',
    inference: '推理选择',
    vocabulary: '词义选择',
    structure: '结构选择',
    theme: '主题选择',
    lesson: '启示选择',
    multiple_choice: '选择题'
  }[q.type] || '选择题';
}

function timeScoreFor(wpm, level) {
  const target = { A1: 75, A2: 90, B1: 110, B2: 130, C1: 150, IELTS: 160, TOEFL: 170 }[level] || 120;
  return wpm >= target ? 100 : Math.max(45, Math.round((wpm / target) * 100));
}

function renderResult(r) {
  $('resultTitle').textContent = r.title;
  $('resultScore').textContent = r.score;
  $('resultAdvice').textContent = advice(r.score);
  const stats = $('resultStats');
  stats.textContent = '';
  [['得分题数', `${r.correctCount}/${r.total}`], ['正确率', `${r.accuracy}%`], ['总用时', formatTime(r.seconds)], ['阅读速度', `${r.wpm} WPM`], ['字数', `${r.words}`]].forEach(([label, value]) => {
    const div = document.createElement('div');
    div.className = 'result-stat';
    const s = document.createElement('span');
    s.textContent = label;
    const b = document.createElement('strong');
    b.textContent = value;
    div.append(s, b);
    stats.appendChild(div);
  });
  const review = $('reviewList');
  review.textContent = '';
  r.details.forEach((d, index) => {
    const item = document.createElement('article');
    item.className = `review-item ${d.ok ? 'correct' : 'wrong'}`;
    const type = document.createElement('span');
    type.className = `question-type-pill ${d.type}`;
    type.textContent = d.typeLabel;
    const q = document.createElement('p');
    q.textContent = `${index + 1}. ${d.question}`;
    const a = document.createElement('p');
    a.textContent = `你的答案：${d.user || '未答'}`;
    const c = document.createElement('p');
    c.textContent = `参考答案：${d.correct || '见解析'}　得分：${d.point}/1`;
    const e = document.createElement('p');
    e.textContent = `解析：${d.explanation || '暂无解析'}`;
    item.append(type, q, a, c, e);
    review.appendChild(item);
  });
}

function advice(score) {
  if (score >= 90) return '表现优秀。可以尝试更高难度文章。';
  if (score >= 75) return '表现良好。建议复盘错题，并提高定位速度。';
  if (score >= 60) return '基础通过。建议先保证细节理解，再提高速度。';
  return '需要加强。建议降低难度，积累核心词汇和常见题型。';
}

function startTimer() {
  stopTimer();
  app.startedAt = Date.now() - app.elapsed * 1000;
  app.timer = setInterval(() => {
    app.elapsed = Math.floor((Date.now() - app.startedAt) / 1000);
    $('timerDisplay').textContent = formatTime(app.elapsed);
  }, 250);
}

function stopTimer() {
  if (app.timer) clearInterval(app.timer);
  app.timer = null;
}

function show(id) {
  ['homeView', 'practiceView', 'resultView'].forEach((viewId) => $(viewId).classList.toggle('hidden', viewId !== id));
}

function home() {
  stopTimer();
  show('homeView');
}

function saveHistory(result) {
  const history = readJson(STORE.history, []);
  history.unshift({ title: result.title, level: result.level, score: result.score, accuracy: result.accuracy, seconds: result.seconds, wpm: result.wpm, createdAt: result.createdAt });
  localStorage.setItem(STORE.history, JSON.stringify(history.slice(0, 100)));
}

function renderHistory() {
  const history = readJson(STORE.history, []);
  const body = $('historyBody');
  body.textContent = '';
  if (!history.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 7;
    td.className = 'muted';
    td.textContent = '暂无练习记录';
    tr.appendChild(td);
    body.appendChild(tr);
  } else {
    history.forEach((h) => {
      const tr = document.createElement('tr');
      [new Date(h.createdAt).toLocaleString(), h.title, h.level, h.score, `${h.accuracy}%`, formatTime(h.seconds), `${h.wpm} WPM`].forEach((value) => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }
  renderStats(history);
}

function renderStats(history) {
  const n = history.length;
  $('statAttempts').textContent = n;
  $('statAverage').textContent = n ? Math.round(history.reduce((s, x) => s + x.score, 0) / n) : 0;
  $('statBest').textContent = n ? Math.max(...history.map((x) => x.score)) : 0;
  $('statAccuracy').textContent = `${n ? Math.round(history.reduce((s, x) => s + x.accuracy, 0) / n) : 0}%`;
}

function clearHistory() {
  localStorage.removeItem(STORE.history);
  renderHistory();
}

function importPassages() {
  const parsed = parseImport($('importText').value.trim());
  if (!parsed) {
    setImportMessage('导入失败：请检查 JSON 格式。', true);
    return;
  }
  const incoming = parsed.map((p) => ({ ...p, source: p.source || 'custom_imported' }));
  const current = readJson(STORE.custom, []);
  const map = new Map(current.map((x) => [x.id, x]));
  incoming.forEach((x) => map.set(x.id, x));
  localStorage.setItem(STORE.custom, JSON.stringify([...map.values()]));
  app.passages = normalizePassages([...(window.PASSAGES || []), ...readJson(STORE.custom, [])]);
  $('importText').value = '';
  setImportMessage(`导入成功：${parsed.length} 篇。`, false);
  renderLibrarySummary();
  populateTopicFilter();
  $('categoryFilter').value = 'custom';
  renderCards(true);
}

function parseImport(raw) {
  try {
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : [data];
    return arr.every(validPassage) ? arr : null;
  } catch {
    return null;
  }
}

function validPassage(p) {
  return p && typeof p.id === 'string' && typeof p.title === 'string' && typeof p.level === 'string' && typeof p.passage === 'string' && Array.isArray(p.questions);
}

function clearCustom() {
  localStorage.removeItem(STORE.custom);
  app.passages = normalizePassages([...(window.PASSAGES || [])]);
  setImportMessage('自定义题库已清空。', false);
  renderLibrarySummary();
  populateTopicFilter();
  renderCards(true);
}

function setImportMessage(text, isError) {
  $('importMessage').textContent = text;
  $('importMessage').style.color = isError ? '#c0362c' : '#2454d6';
}

function initPwa() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    app.installPrompt = event;
    $('installBtn').classList.remove('hidden');
  });
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
}

async function installSiteApp() {
  if (!app.installPrompt) return;
  app.installPrompt.prompt();
  await app.installPrompt.userChoice;
  app.installPrompt = null;
  $('installBtn').classList.add('hidden');
}

function readJson(key, fallback) {
  try {
    const text = localStorage.getItem(key);
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function formatTime(total) {
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = Math.floor(total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function shortText(text, length) {
  const value = String(text || '');
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

boot();
