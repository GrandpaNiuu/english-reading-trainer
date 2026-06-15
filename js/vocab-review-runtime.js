const VOCAB_STORE = {
  words: 'ert_vocab_words_v1'
};

function readVocabWords() {
  try {
    return JSON.parse(localStorage.getItem(VOCAB_STORE.words)) || [];
  } catch {
    return [];
  }
}

function writeVocabWords(words) {
  localStorage.setItem(VOCAB_STORE.words, JSON.stringify(words.slice(0, 500)));
}

function saveVocabWord(word, sourceTitle) {
  const clean = String(word || '').toLowerCase().replace(/[^a-z-]/g, '').trim();
  if (!clean || clean.length < 3) return;
  const words = readVocabWords();
  const existing = words.find((item) => item.word === clean);
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.lastSeenAt = new Date().toISOString();
    existing.sourceTitle = sourceTitle || existing.sourceTitle;
    writeVocabWords([existing, ...words.filter((item) => item.word !== clean)]);
  } else {
    writeVocabWords([{ word: clean, sourceTitle: sourceTitle || '', count: 1, createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString() }, ...words]);
  }
  renderVocabPanel();
}

function removeVocabWord(word) {
  writeVocabWords(readVocabWords().filter((item) => item.word !== word));
  renderVocabPanel();
}

function createVocabPanel() {
  if (document.getElementById('vocabPanel')) return;
  const mistakePanel = document.getElementById('mistakePanel') || document.querySelector('.history-panel');
  if (!mistakePanel) return;
  const panel = document.createElement('section');
  panel.id = 'vocabPanel';
  panel.className = 'panel vocab-panel';
  panel.innerHTML = `
    <div class="section-title-row">
      <div>
        <h2>词汇本</h2>
        <p id="vocabSummary">阅读文章时点击英文单词即可收藏。</p>
      </div>
      <div class="vocab-actions">
        <button id="exportVocabBtn" class="ghost-btn">导出词汇</button>
        <button id="clearVocabBtn" class="danger-btn">清空词汇</button>
      </div>
    </div>
    <div id="vocabList" class="vocab-list"></div>
  `;
  mistakePanel.parentNode.insertBefore(panel, mistakePanel.nextSibling);
  document.getElementById('clearVocabBtn').addEventListener('click', () => {
    localStorage.removeItem(VOCAB_STORE.words);
    renderVocabPanel();
  });
  document.getElementById('exportVocabBtn').addEventListener('click', exportVocabWords);
  renderVocabPanel();
}

function renderVocabPanel() {
  const list = document.getElementById('vocabList');
  const summary = document.getElementById('vocabSummary');
  if (!list || !summary) return;
  const words = readVocabWords();
  summary.textContent = words.length ? `当前收藏 ${words.length} 个单词。点击单词右侧按钮可删除。` : '暂无词汇。进入文章后点击英文单词即可收藏。';
  list.textContent = '';
  words.slice(0, 80).forEach((item) => {
    const card = document.createElement('div');
    card.className = 'vocab-card';
    const word = document.createElement('strong');
    word.textContent = item.word;
    const meta = document.createElement('span');
    meta.textContent = `${item.count || 1} 次 · ${item.sourceTitle || 'reading'}`;
    const remove = document.createElement('button');
    remove.className = 'ghost-btn vocab-remove-btn';
    remove.textContent = '删除';
    remove.addEventListener('click', () => removeVocabWord(item.word));
    card.append(word, meta, remove);
    list.appendChild(card);
  });
}

function exportVocabWords() {
  const words = readVocabWords();
  const text = JSON.stringify(words, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'english-reading-vocab.json';
  a.click();
  URL.revokeObjectURL(url);
}

renderPassageText = function renderPassageText(text) {
  const box = document.getElementById('passageText');
  box.textContent = '';
  splitParagraphs(text).forEach((paragraph, index) => {
    const p = document.createElement('p');
    p.className = 'reading-paragraph clickable-vocab-paragraph';
    if (index === 0) p.classList.add('first-paragraph');
    paragraph.split(/(\b[a-zA-Z][a-zA-Z-]{2,}\b)/g).forEach((part) => {
      if (/^[a-zA-Z][a-zA-Z-]{2,}$/.test(part)) {
        const span = document.createElement('button');
        span.type = 'button';
        span.className = 'vocab-word-btn';
        span.textContent = part;
        span.title = '点击收藏单词';
        span.addEventListener('click', () => saveVocabWord(part, app.current ? app.current.title : ''));
        p.appendChild(span);
      } else {
        p.appendChild(document.createTextNode(part));
      }
    });
    box.appendChild(p);
  });
};

function startMistakeRedo() {
  const mistakes = readMistakes().slice(0, 20);
  if (!mistakes.length) return;
  const questions = mistakes.map((item, index) => {
    const keywords = String(item.correct || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2)
      .slice(0, 8);
    return {
      id: `redo_${index + 1}`,
      type: 'short_answer',
      question: `[错题重练] ${item.question}`,
      accepted_keywords: keywords.length ? keywords : ['answer'],
      sample_answer: item.correct || 'Review the reference answer.',
      correct_answer: item.correct || 'Open answer',
      explanation_cn: item.explanation || '请参考原解析。'
    };
  });
  app.current = {
    id: 'mistake_redo_session',
    title: '错题重练',
    level: 'Review',
    topic: 'mistakes',
    category: 'custom',
    word_count: 0,
    passage: 'Mistake Review Session\n\n本练习由最近错题自动生成。请根据参考答案和解析，用英文重新回答。',
    questions
  };
  app.currentQuestions = questions;
  stopTimer();
  app.elapsed = 0;
  document.getElementById('timerDisplay').textContent = formatTime(0);
  document.getElementById('practiceLevel').textContent = 'Review · 错题重练';
  document.getElementById('practiceTitle').textContent = '错题重练';
  document.getElementById('practiceMeta').textContent = `最近 ${questions.length} 道错题 · 简答复盘模式`;
  renderPassageText(app.current.passage);
  document.getElementById('questionForm').textContent = '';
  document.getElementById('preStartBox').classList.add('hidden');
  document.getElementById('readingBox').classList.remove('hidden');
  show('practiceView');
  renderQuestions({ ...app.current, questions });
  startTimer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enhanceMistakePanelWithRedo() {
  const actions = document.querySelector('.mistake-actions');
  if (!actions || document.getElementById('redoMistakesBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'redoMistakesBtn';
  btn.className = 'primary-btn';
  btn.textContent = '重练错题';
  btn.addEventListener('click', startMistakeRedo);
  actions.insertBefore(btn, actions.firstChild);
}

window.addEventListener('load', () => {
  createVocabPanel();
  enhanceMistakePanelWithRedo();
});
