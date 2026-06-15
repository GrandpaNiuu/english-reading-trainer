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
  installPrompt: null
};

const $ = (id) => document.getElementById(id);

function boot() {
  app.passages = [...(window.PASSAGES || []), ...readJson(STORE.custom, [])];
  bind();
  renderCards();
  renderHistory();
  initPwa();
}

function bind() {
  $('levelFilter').addEventListener('change', renderCards);
  $('searchInput').addEventListener('input', renderCards);
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

function renderCards() {
  const level = $('levelFilter').value;
  const query = $('searchInput').value.trim().toLowerCase();
  const grid = $('passageGrid');
  grid.textContent = '';
  const list = app.passages.filter((p) => {
    const okLevel = level === 'all' || p.level === level;
    const text = `${p.title} ${p.topic || ''} ${p.level}`.toLowerCase();
    return okLevel && (!query || text.includes(query));
  });
  $('passageCount').textContent = `${list.length} 篇文章`;

  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = '没有找到符合条件的文章。';
    grid.appendChild(empty);
    return;
  }

  list.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'passage-card';

    const levelPill = document.createElement('span');
    levelPill.className = 'level-pill';
    levelPill.textContent = p.level;

    const title = document.createElement('h3');
    title.textContent = p.title;

    const preview = document.createElement('p');
    preview.textContent = shortText(p.passage, 135);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const meta = document.createElement('span');
    meta.className = 'muted';
    meta.textContent = `${p.word_count || countWords(p.passage)} words · ${p.questions.length} 题`;

    const btn = document.createElement('button');
    btn.className = 'primary-btn';
    btn.textContent = '开始';
    btn.addEventListener('click', () => openPassage(p.id));

    footer.append(meta, btn);
    card.append(levelPill, title, preview, footer);
    grid.appendChild(card);
  });
}

function openPassage(id) {
  const p = app.passages.find((item) => item.id === id);
  if (!p) return;
  stopTimer();
  app.current = p;
  app.elapsed = 0;
  $('timerDisplay').textContent = formatTime(0);
  $('practiceLevel').textContent = p.level;
  $('practiceTitle').textContent = p.title;
  $('practiceMeta').textContent = `${p.topic || 'general'} · ${p.word_count || countWords(p.passage)} words · ${p.questions.length} 题`;
  $('passageText').textContent = p.passage;
  $('questionForm').textContent = '';
  $('preStartBox').classList.remove('hidden');
  $('readingBox').classList.add('hidden');
  show('practiceView');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function randomPassage() {
  if (!app.passages.length) return;
  const p = app.passages[Math.floor(Math.random() * app.passages.length)];
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
    const title = document.createElement('p');
    title.textContent = `${index + 1}. ${q.question}`;
    box.appendChild(title);

    Object.entries(q.options).forEach(([key, value]) => {
      const label = document.createElement('label');
      label.className = 'option-label';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q_${q.id}`;
      input.value = key;
      const span = document.createElement('span');
      span.textContent = `${key}. ${value}`;
      label.append(input, span);
      box.appendChild(label);
    });
    form.appendChild(box);
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
    return { question: q.question, user: answer, correct: q.correct_answer, explanation: q.explanation_cn || '', ok: answer === q.correct_answer };
  });
  const correctCount = details.filter((x) => x.ok).length;
  const total = details.length;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const seconds = Math.max(1, app.elapsed);
  const words = p.word_count || countWords(p.passage);
  const wpm = Math.round(words / (seconds / 60));
  const timeScore = timeScoreFor(wpm, p.level);
  const score = Math.round(accuracy * 0.82 + timeScore * 0.18);
  return { title: p.title, level: p.level, correctCount, total, accuracy, seconds, words, wpm, score, details, createdAt: new Date().toISOString() };
}

function getAnswer(id) {
  const checked = document.querySelector(`input[name="q_${id}"]:checked`);
  return checked ? checked.value : '';
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
  [
    ['答对', `${r.correctCount}/${r.total}`],
    ['正确率', `${r.accuracy}%`],
    ['总用时', formatTime(r.seconds)],
    ['阅读速度', `${r.wpm} WPM`],
    ['字数', `${r.words}`]
  ].forEach(([label, value]) => {
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
    const q = document.createElement('p');
    q.textContent = `${index + 1}. ${d.question}`;
    const a = document.createElement('p');
    a.textContent = `你的答案：${d.user}　正确答案：${d.correct}`;
    const e = document.createElement('p');
    e.textContent = `解析：${d.explanation || '暂无解析'}`;
    item.append(q, a, e);
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
  ['homeView', 'practiceView', 'resultView'].forEach((viewId) => {
    $(viewId).classList.toggle('hidden', viewId !== id);
  });
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
  const current = readJson(STORE.custom, []);
  const map = new Map(current.map((x) => [x.id, x]));
  parsed.forEach((x) => map.set(x.id, x));
  localStorage.setItem(STORE.custom, JSON.stringify([...map.values()]));
  app.passages = [...(window.PASSAGES || []), ...readJson(STORE.custom, [])];
  $('importText').value = '';
  setImportMessage(`导入成功：${parsed.length} 篇。`, false);
  renderCards();
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
  app.passages = [...(window.PASSAGES || [])];
  setImportMessage('自定义题库已清空。', false);
  renderCards();
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

boot();
