/* Stable single-controller app. It intentionally replaces the old runtime stack. */
(function () {
  const FRONT_LIMIT = 20;
  const HISTORY_KEY = 'ert_history_v3_stable';
  const CUSTOM_KEY = 'ert_custom_passages_v2';
  const MISTAKE_KEY = 'ert_mistakes_v3_stable';
  const VOCAB_KEY = 'ert_vocab_v2_stable';
  const OFFSET_KEY = 'ert_virtual_offsets_v3_stable';
  const RECENT_KEY = 'ert_virtual_recent_v3_stable';

  const TOPICS = [
    ['community safety', 'emergency preparedness', 'neighborhood response', 'residents', 'safety reports'],
    ['school', 'classroom routines', 'learning situations', 'students and teachers', 'classroom observations'],
    ['technology ethics', 'algorithmic decisions', 'digital platforms', 'designers', 'audit records'],
    ['environment', 'habitat restoration', 'local ecosystems', 'conservation teams', 'field surveys'],
    ['public health', 'preventive care', 'urban communities', 'health workers', 'clinic data'],
    ['business', 'consumer trust', 'market decisions', 'companies', 'customer feedback'],
    ['science', 'experimental evidence', 'research laboratories', 'scientists', 'test results'],
    ['history', 'social change', 'past communities', 'historians', 'archive records'],
    ['culture', 'shared traditions', 'community identity', 'cultural groups', 'oral accounts'],
    ['education', 'feedback and assessment', 'classroom learning', 'teachers', 'student work'],
    ['psychology', 'attention and memory', 'daily behavior', 'researchers', 'test scores'],
    ['economics', 'household choices', 'local markets', 'analysts', 'income data'],
    ['climate', 'weather variability', 'regional planning', 'meteorologists', 'climate records'],
    ['transport', 'commuting patterns', 'urban mobility', 'transport agencies', 'ridership data'],
    ['law', 'privacy protection', 'public accountability', 'legal scholars', 'case summaries'],
    ['media', 'information quality', 'online audiences', 'journalists', 'reader responses'],
    ['medicine', 'treatment access', 'patient care', 'doctors', 'hospital records'],
    ['ecology', 'species balance', 'natural habitats', 'ecologists', 'population surveys'],
    ['astronomy', 'planet detection', 'space observation', 'astronomers', 'light-curve data'],
    ['agriculture', 'crop resilience', 'food production', 'farm cooperatives', 'field trials'],
    ['urban planning', 'public space design', 'city neighborhoods', 'planners', 'land-use maps'],
    ['energy', 'renewable systems', 'regional infrastructure', 'engineers', 'power-use records'],
    ['language', 'bilingual communication', 'social identity', 'speakers', 'conversation samples'],
    ['art', 'visual interpretation', 'museum objects', 'curators', 'restoration notes'],
    ['music', 'listening habits', 'cultural expression', 'performers', 'audience surveys'],
    ['sports', 'team performance', 'training routines', 'coaches', 'match statistics'],
    ['travel', 'responsible tourism', 'local destinations', 'travelers', 'visitor reports'],
    ['food', 'nutrition choices', 'family meals', 'households', 'diet records'],
    ['work', 'remote collaboration', 'workplace culture', 'managers', 'communication logs'],
    ['family', 'intergenerational support', 'home decisions', 'family members', 'interviews'],
    ['friendship', 'social support', 'peer relationships', 'young people', 'survey responses'],
    ['housing', 'affordable living', 'urban households', 'policy teams', 'housing data'],
    ['shopping', 'consumer behavior', 'retail choices', 'customers', 'purchase records'],
    ['safety', 'risk management', 'public facilities', 'inspectors', 'incident reports'],
    ['innovation', 'new product adoption', 'technology firms', 'engineers', 'prototype tests'],
    ['leadership', 'team decision-making', 'organizations', 'leaders', 'meeting records'],
    ['finance', 'saving behavior', 'household budgets', 'advisers', 'spending data'],
    ['global issues', 'international cooperation', 'public policy', 'organizations', 'policy reports'],
    ['rural life', 'community services', 'small towns', 'local councils', 'service records'],
    ['urban life', 'daily city routines', 'neighborhoods', 'residents', 'city surveys']
  ];

  const CATEGORY = {
    curated: { label: '精选强化', source: 'stable_virtual_curated', quality: 'curated_virtual', levels: ['B2', 'C1', 'IELTS', 'TOEFL'], color: 'curated' },
    generated: { label: '拓展训练', source: 'stable_virtual_extension', quality: 'extension_virtual', levels: ['B2', 'C1', 'IELTS', 'TOEFL'], color: 'generated' },
    manual: { label: '人工样例', source: 'stable_virtual_manual', quality: 'manual_virtual', levels: ['A2', 'B1', 'B2', 'C1'], color: 'manual' },
    custom: { label: '自定义导入', source: 'custom', quality: 'custom', levels: ['B1'], color: 'custom' }
  };

  const STRUCTURES = ['problem-solution', 'cause-effect', 'compare-contrast', 'claim-evidence', 'case-study', 'debate-and-resolution', 'classification', 'chronological development'];
  const ANGLES = ['evidence', 'public response', 'hidden costs', 'long-term change', 'competing explanations', 'practical limits', 'unexpected results', 'institutional change', 'local adaptation', 'ethical questions', 'resource pressure', 'future planning'];
  const SCENARIOS = ['policy meeting', 'research project', 'community trial', 'school program', 'field investigation', 'public survey', 'case review', 'pilot study', 'expert debate', 'long-term observation', 'training workshop', 'regional comparison'];

  const $ = (id) => document.getElementById(id);
  const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const state = {
    passages: [],
    current: null,
    currentQuestions: [],
    timer: null,
    startedAt: 0,
    elapsed: 0,
    activeSection: 'home'
  };

  window.app = state;

  function hash(value) {
    let h = 2166136261;
    String(value || '').split('').forEach((c) => {
      h ^= c.charCodeAt(0);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    });
    return h >>> 0;
  }

  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function pick(list, random) {
    return list[Math.floor(random() * list.length) % list.length];
  }

  function titleCase(text) {
    return String(text).replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function countWords(text) {
    return String(text || '').split(/\s+/).filter(Boolean).length;
  }

  function shortText(text, max = 135) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
    return cleaned.length > max ? `${cleaned.slice(0, max)}...` : cleaned;
  }

  function topicByKey(key) {
    if (!key || key === 'all') return null;
    return TOPICS.find((t) => t[0] === key) || TOPICS[hash(key) % TOPICS.length];
  }

  function topicForIndex(key, index) {
    return topicByKey(key) || TOPICS[(index + hash(key || 'all')) % TOPICS.length];
  }

  function offsets() {
    return readJSON(OFFSET_KEY, {});
  }

  function saveOffsets(value) {
    writeJSON(OFFSET_KEY, value);
  }

  function recent() {
    return readJSON(RECENT_KEY, {});
  }

  function saveRecent(value) {
    writeJSON(RECENT_KEY, value);
  }

  function nextIndexes(category, topic, count) {
    const key = `${category}:${topic || 'all'}`;
    const o = offsets();
    const r = recent();
    const used = new Set(r[key] || []);
    let cursor = Number(o[key] || (hash(key) % 8000000 + 1000000));
    const result = [];
    let guard = 0;
    while (result.length < count && guard < count * 500) {
      const candidate = cursor + guard;
      if (!used.has(candidate)) {
        result.push(candidate);
        used.add(candidate);
      }
      guard += 1;
    }
    o[key] = cursor + guard + count;
    r[key] = Array.from(used).slice(-5000);
    saveOffsets(o);
    saveRecent(r);
    return result;
  }

  function makePassage(category, topicKey, index) {
    const cfg = CATEGORY[category] || CATEGORY.curated;
    const t = topicForIndex(topicKey, index);
    const random = rng(hash(`${category}|${topicKey}|${index}|stable-v4`));
    const level = cfg.levels[index % cfg.levels.length];
    const structure = pick(STRUCTURES, random);
    const angle = pick(ANGLES, random);
    const scenario = pick(SCENARIOS, random);
    const title = `${titleCase(t[1])}: ${titleCase(angle)} in a ${titleCase(scenario)}`;

    const p1 = `The topic of this passage is ${t[0]}. In a recent ${scenario}, ${t[3]} considered how ${t[1]} should be understood when decisions had to be made from incomplete evidence.`;
    const p2 = `At first, the situation appeared ordinary. However, ${t[4]} showed that the problem had several layers, especially when timing, local conditions, and public expectations were considered together.`;
    const p3 = `One interpretation emphasized immediate action, while another stressed careful analysis. This contrast matters because weak evidence can lead to fast but misleading conclusions.`;
    const p4 = `The passage follows a ${structure} structure. It introduces a situation, examines evidence, and limits the final claim rather than offering a single easy answer.`;
    const passage = [p1, p2, p3, p4].join('\n\n');

    return normalizePassage({
      id: `${category}_${t[0].replace(/\s+/g, '_')}_${index}`,
      title,
      level,
      topic: t[0],
      source: cfg.source,
      quality: cfg.quality,
      category,
      word_count: countWords(passage),
      passage,
      questions: buildQuestions(t, structure)
    });
  }

  function buildQuestions(t, structure) {
    return [
      { id: 1, type: 'main_idea', question: 'What is the main idea of the passage?', options: { A: `The passage explains why ${t[1]} needs careful interpretation.`, B: 'The passage gives a personal travel story.', C: 'The passage rejects all evidence.', D: 'The passage lists unrelated facts only.' }, correct_answer: 'A', explanation_cn: '文章主旨是说明该主题需要结合证据和语境理解。' },
      { id: 2, type: 'detail', question: 'Which evidence source is mentioned?', options: { A: t[4], B: 'a shopping coupon', C: 'a sports poster', D: 'a private holiday photo' }, correct_answer: 'A', explanation_cn: `文章提到的证据是 ${t[4]}。` },
      { id: 3, type: 'inference', question: 'What can be inferred about the writer?', options: { A: 'The writer prefers careful claims.', B: 'The writer ignores context.', C: 'The writer dislikes evidence.', D: 'The writer thinks every problem is simple.' }, correct_answer: 'A', explanation_cn: '作者强调证据、语境和限定，因此倾向谨慎判断。' },
      { id: 4, type: 'structure', question: 'How is the passage mainly organized?', options: { A: `It uses a ${structure} structure.`, B: 'It gives only a list of names.', C: 'It avoids any conclusion.', D: 'It is written as a poem.' }, correct_answer: 'A', explanation_cn: `文章结构是 ${structure}。` },
      { id: 5, type: 'vocabulary_context', question: 'In the passage, “misleading” is closest in meaning to:', options: { A: 'likely to give a wrong idea', B: 'very expensive', C: 'easy to decorate', D: 'physically heavy' }, correct_answer: 'A', explanation_cn: 'misleading 表示“容易误导的”。' },
      { id: 6, type: 'exam_short_answer', question: 'Short answer: What topic is discussed? Answer in NO MORE THAN SIX WORDS.', accepted_keywords: t[0].split(/\s+/).concat(t[1].split(/\s+/)).map((x) => x.toLowerCase()), sample_answer: t[0], correct_answer: t[0], explanation_cn: `主题是 ${t[0]}。` }
    ];
  }

  function normalizePassage(p) {
    const source = String(p.source || '').toLowerCase();
    const quality = String(p.quality || '').toLowerCase();
    let category = p.category;
    if (!category) {
      if (source.includes('custom')) category = 'custom';
      else if (source.includes('curated') || quality.includes('curated')) category = 'curated';
      else if (source.includes('manual') || quality.includes('manual')) category = 'manual';
      else category = 'generated';
    }
    return {
      ...p,
      id: String(p.id || `${category}_${hash(p.title)}`),
      category,
      topic: p.topic || 'general',
      level: p.level || 'B1',
      word_count: p.word_count || countWords(p.passage),
      questions: Array.isArray(p.questions) ? p.questions.map((q, i) => ({ ...q, id: q.id || i + 1, type: q.type || (q.options ? 'multiple_choice' : 'short_answer') })) : []
    };
  }

  function replaceBatch(category, topic = currentTopic()) {
    if (category === 'all' || category === 'custom') category = 'curated';
    const indexes = nextIndexes(category, topic, FRONT_LIMIT);
    const batch = indexes.map((idx) => makePassage(category, topic, idx));
    state.passages = state.passages.filter((p) => !(p.category === category && String(p.source || '').startsWith('stable_virtual')));
    state.passages = batch.concat(state.passages);
    setValue('categoryFilter', category);
    setValue('topicFilter', topic);
    setValue('levelFilter', 'all');
    const search = $('searchInput');
    if (search) search.value = '';
    renderCards();
    updateBatchMessage(`已换入 20 篇${CATEGORY[category]?.label || '训练内容'} · ${topic === 'all' ? '混合主题' : topic}，不会回到最近批次`);
  }

  function setValue(id, value) {
    const node = $(id);
    if (node) node.value = value;
  }

  function currentCategory() {
    return $('categoryFilter')?.value || 'curated';
  }

  function currentTopic() {
    return $('topicFilter')?.value || 'all';
  }

  function installTopicOptions() {
    const select = $('topicFilter');
    if (!select) return;
    const value = select.value || 'all';
    select.innerHTML = '<option value="all">全部主题</option>';
    TOPICS.forEach((t) => {
      const option = document.createElement('option');
      option.value = t[0];
      option.textContent = t[0];
      select.appendChild(option);
    });
    select.value = [...select.options].some((o) => o.value === value) ? value : 'all';
  }

  function installAppShell() {
    document.body.classList.add('modern-app-shell', 'stable-app');
    if (!$('quickStartPanel')) {
      const panel = document.createElement('section');
      panel.id = 'quickStartPanel';
      panel.className = 'panel quick-start-panel';
      panel.setAttribute('data-app-section', 'home');
      panel.innerHTML = `<div class="quick-hero"><div><span class="app-kicker">Today</span><h2>选择一个训练方向</h2><p>每个分类和主题固定展示 20 篇，不合适就换一批。系统会自动控制题组，不暴露底层数量。</p></div><button class="primary-btn" id="quickStartBtn">开始训练</button></div><div class="quick-action-grid"><button class="quick-action-card" data-go="train"><span>Exam</span><strong>考试训练</strong><small>精选强化 / 拓展训练 / 人工样例</small></button><button class="quick-action-card" data-go="review"><span>Review</span><strong>错题复盘</strong><small>自动整理薄弱题型</small></button><button class="quick-action-card" data-go="vocab"><span>Words</span><strong>词汇本</strong><small>阅读时点击单词收藏</small></button><button class="quick-action-card" data-go="history"><span>Report</span><strong>学习记录</strong><small>查看成绩与速度</small></button></div>`;
      document.querySelector('.container')?.insertBefore(panel, document.querySelector('.stats-panel'));
      panel.querySelector('#quickStartBtn')?.addEventListener('click', () => showSection('train'));
      panel.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => showSection(b.dataset.go)));
    }

    const stats = document.querySelector('.stats-panel');
    const library = document.querySelector('.library-summary-panel');
    const importPanel = $('importPanel');
    const home = $('homeView');
    if (stats) stats.setAttribute('data-app-section', 'home');
    if (library) library.setAttribute('data-app-section', 'home');
    if (importPanel) importPanel.setAttribute('data-app-section', 'home');
    if (home) home.setAttribute('data-app-section', 'train');
    document.querySelector('.history-panel')?.setAttribute('data-app-section', 'history');

    installReviewPanel();
    installVocabPanel();
    installBatchPanel();
    installMobileBar();
    installBottomNav();
    showSection('home');
  }

  function installBottomNav() {
    if ($('appBottomNav')) return;
    const nav = document.createElement('nav');
    nav.id = 'appBottomNav';
    nav.className = 'app-bottom-nav';
    nav.innerHTML = `<button data-section="home"><span>⌂</span><strong>首页</strong></button><button data-section="train"><span>◇</span><strong>训练</strong></button><button data-section="review"><span>↺</span><strong>复盘</strong></button><button data-section="vocab"><span>Aa</span><strong>词汇</strong></button><button data-section="history"><span>▦</span><strong>记录</strong></button>`;
    document.body.appendChild(nav);
    nav.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => showSection(b.dataset.section)));
  }

  function showSection(section) {
    state.activeSection = section;
    document.querySelectorAll('[data-app-section]').forEach((node) => node.classList.toggle('app-section-hidden', node.getAttribute('data-app-section') !== section));
    document.querySelectorAll('#appBottomNav button').forEach((b) => b.classList.toggle('active', b.dataset.section === section));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function installBatchPanel() {
    let panel = $('virtualCategoryPanel');
    const anchor = document.querySelector('.filter-panel');
    if (!panel && anchor?.parentNode) {
      panel = document.createElement('section');
      panel.id = 'virtualCategoryPanel';
      panel.className = 'panel virtual-category-panel';
      panel.setAttribute('data-app-section', 'train');
      anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    }
    if (!panel) return;
    panel.innerHTML = `<div class="section-title-row"><div><h2>按需换题库</h2><p>先选择分类和主题，再换一批。每次只展示 20 篇，并且不会回到最近批次。</p></div></div><div class="virtual-category-actions"><button class="primary-btn" data-batch="curated">换一批精选强化</button><button class="secondary-btn" data-batch="generated">换一批拓展训练</button><button class="ghost-btn" data-batch="manual">换一批人工样例</button></div><p id="virtualCategoryMessage" class="message">选择主题后再换一批，会生成该主题文章。</p>`;
    panel.querySelectorAll('[data-batch]').forEach((b) => b.addEventListener('click', () => replaceBatch(b.dataset.batch, currentTopic())));
  }

  function installMobileBar() {
    if ($('mobileQuickBatchBar')) return;
    const bar = document.createElement('div');
    bar.id = 'mobileQuickBatchBar';
    bar.className = 'mobile-quick-batch-bar';
    bar.innerHTML = `<button id="mobileBatchBtn" class="primary-btn">换一批当前内容</button><span id="mobileBatchHint">当前分类只展示 20 篇</span>`;
    document.body.appendChild(bar);
    $('mobileBatchBtn')?.addEventListener('click', () => replaceBatch(currentCategory(), currentTopic()));
  }

  function updateBatchMessage(text) {
    const msg = $('virtualCategoryMessage');
    const hint = $('mobileBatchHint');
    if (msg) msg.textContent = text;
    if (hint) hint.textContent = text;
  }

  function installReviewPanel() {
    if ($('mistakePanel')) return;
    const panel = document.createElement('section');
    panel.id = 'mistakePanel';
    panel.className = 'panel mistake-panel';
    panel.setAttribute('data-app-section', 'review');
    panel.innerHTML = `<div class="section-title-row"><div><h2>错题复盘</h2><p>提交后自动保存错题，适合复习薄弱题型。</p></div><button id="clearMistakesBtn" class="danger-btn">清空错题</button></div><div id="mistakeList" class="mistake-list"></div>`;
    document.querySelector('.container')?.appendChild(panel);
    $('clearMistakesBtn')?.addEventListener('click', () => { writeJSON(MISTAKE_KEY, []); renderMistakes(); });
  }

  function installVocabPanel() {
    if ($('vocabPanel')) return;
    const panel = document.createElement('section');
    panel.id = 'vocabPanel';
    panel.className = 'panel vocab-panel';
    panel.setAttribute('data-app-section', 'vocab');
    panel.innerHTML = `<div class="section-title-row"><div><h2>词汇本</h2><p>阅读文章时点击英文单词可收藏。</p></div><button id="clearVocabBtn" class="danger-btn">清空词汇</button></div><div id="vocabList" class="vocab-list"></div>`;
    document.querySelector('.container')?.appendChild(panel);
    $('clearVocabBtn')?.addEventListener('click', () => { writeJSON(VOCAB_KEY, []); renderVocab(); });
  }

  function renderLibrarySummary() {
    const box = $('librarySummary');
    if (!box) return;
    box.textContent = '';
    ['curated', 'generated', 'manual', 'custom'].forEach((category) => {
      const button = document.createElement('button');
      button.className = `category-card ${category}`;
      button.type = 'button';
      button.innerHTML = `<span class="category-label">${CATEGORY[category]?.label || '自定义导入'}</span><strong>${category === 'custom' ? '导入' : '20篇'}</strong><small>${category === 'custom' ? '你导入的文章' : '不满意可换一批'}</small>`;
      button.addEventListener('click', () => { setValue('categoryFilter', category); renderCards(); showSection('train'); });
      box.appendChild(button);
    });
  }

  function renderCards() {
    const grid = $('passageGrid');
    if (!grid) return;
    const category = currentCategory();
    const topic = currentTopic();
    const level = $('levelFilter')?.value || 'all';
    const query = ($('searchInput')?.value || '').trim().toLowerCase();
    let items = state.passages.filter((p) => {
      const okCategory = category === 'all' || p.category === category;
      const okTopic = topic === 'all' || p.topic === topic;
      const okLevel = level === 'all' || p.level === level;
      const text = `${p.title} ${p.topic} ${p.level}`.toLowerCase();
      return okCategory && okTopic && okLevel && (!query || text.includes(query));
    });
    if (!items.length && category !== 'custom') {
      replaceBatch(category, topic);
      return;
    }
    items = items.slice(0, FRONT_LIMIT);
    state.filtered = items;
    grid.textContent = '';
    const count = $('passageCount');
    if (count) count.textContent = `${category === 'all' ? '训练内容' : (CATEGORY[category]?.label || '自定义导入')}：当前展示 20 篇，下方和底部都可换一批`;
    items.forEach((p) => grid.appendChild(createCard(p)));
  }

  function createCard(p) {
    const card = document.createElement('article');
    card.className = `passage-card ${p.category}`;
    card.innerHTML = `<div class="card-tags"><span class="level-pill">${p.level}</span><span class="source-pill ${p.category}">${CATEGORY[p.category]?.label || '自定义导入'}</span><span class="topic-pill">${p.topic}</span></div><h3>${p.title}</h3><p>${shortText(p.passage, 125)}</p><div class="card-footer"><span class="muted">考试型题组</span><button class="primary-btn">开始</button></div>`;
    card.querySelector('button')?.addEventListener('click', () => openPassage(p.id));
    return card;
  }

  function openPassage(id) {
    const p = state.passages.find((item) => item.id === id);
    if (!p) return;
    state.current = p;
    state.currentQuestions = selectQuestions(p);
    $('practiceTitle').textContent = p.title;
    $('practiceLevel').textContent = p.level;
    $('practiceMeta').textContent = `${p.topic} · 考试型题组`;
    $('preStartBox').classList.remove('hidden');
    $('readingBox').classList.add('hidden');
    $('practiceView').classList.remove('hidden');
    $('homeView').classList.add('hidden');
    showOnlyView('practiceView');
    stopTimer();
    state.elapsed = 0;
    updateTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showOnlyView(id) {
    ['homeView', 'practiceView', 'resultView'].forEach((viewId) => $(viewId)?.classList.toggle('hidden', viewId !== id));
  }

  function home() {
    showOnlyView('homeView');
    showSection('train');
    stopTimer();
  }

  function selectQuestions(p) {
    const q = Array.isArray(p.questions) ? p.questions : [];
    return q.slice(0, Math.min(q.length, 12));
  }

  function startPractice() {
    if (!state.current) return;
    $('preStartBox').classList.add('hidden');
    $('readingBox').classList.remove('hidden');
    renderPassage(state.current.passage);
    renderQuestions(state.currentQuestions);
    startTimer();
  }

  function renderPassage(text) {
    const box = $('passageText');
    box.textContent = '';
    String(text || '').split(/\n\s*\n/).filter(Boolean).forEach((para) => {
      const p = document.createElement('p');
      p.className = 'reading-paragraph clickable-vocab-paragraph';
      para.split(/(\b[A-Za-z][A-Za-z'-]{2,}\b)/g).forEach((part) => {
        if (/^[A-Za-z][A-Za-z'-]{2,}$/.test(part)) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'vocab-word-btn';
          btn.textContent = part;
          btn.addEventListener('click', () => saveWord(part, state.current?.title));
          p.appendChild(btn);
        } else p.appendChild(document.createTextNode(part));
      });
      box.appendChild(p);
    });
  }

  function renderQuestions(questions) {
    const form = $('questionForm');
    form.textContent = '';
    questions.forEach((q, index) => {
      const block = document.createElement('fieldset');
      block.className = 'question-block';
      const legend = document.createElement('legend');
      legend.innerHTML = `<span class="question-type-pill">${typeLabel(q.type)}</span> ${q.question}`;
      block.appendChild(legend);
      if (q.options) {
        Object.entries(q.options).forEach(([key, value]) => {
          const label = document.createElement('label');
          label.className = 'option-row';
          label.innerHTML = `<input type="radio" name="q_${index}" value="${key}"><span>${key}. ${value}</span>`;
          block.appendChild(label);
        });
      } else {
        const input = document.createElement('textarea');
        input.name = `q_${index}`;
        input.placeholder = '输入答案';
        block.appendChild(input);
      }
      form.appendChild(block);
    });
  }

  function typeLabel(type) {
    return { main_idea: '主旨题', detail: '细节题', inference: '推理题', structure: '结构题', vocabulary_context: '词义题', exam_short_answer: '考试简答题' }[type] || '阅读题';
  }

  function getAnswer(index, q) {
    if (q.options) return document.querySelector(`[name="q_${index}"]:checked`)?.value || '';
    return document.querySelector(`[name="q_${index}"]`)?.value || '';
  }

  function submitPractice() {
    if (!state.current) return;
    stopTimer();
    const details = state.currentQuestions.map((q, index) => gradeOne(q, getAnswer(index, q)));
    const earned = details.reduce((s, d) => s + d.points, 0);
    const total = details.length || 1;
    const score = Math.round((earned / total) * 100);
    const result = { title: state.current.title, level: state.current.level, score, accuracy: score, seconds: state.elapsed, wpm: Math.round((state.current.word_count || countWords(state.current.passage)) / Math.max(1, state.elapsed / 60)), details, createdAt: new Date().toISOString() };
    saveHistory(result);
    saveMistakes(result);
    renderResult(result);
  }

  function gradeOne(q, answer) {
    let points = 0;
    const normalized = String(answer || '').trim().toLowerCase();
    if (q.options) points = normalized.toUpperCase() === String(q.correct_answer || '').toUpperCase() ? 1 : 0;
    else {
      const keys = q.accepted_keywords || String(q.correct_answer || '').split(/\s+/);
      const hits = keys.filter((k) => normalized.includes(String(k).toLowerCase())).length;
      points = keys.length ? Math.min(1, hits / Math.min(keys.length, 3)) : 0;
    }
    return { q, answer, points, ok: points >= 1, correct: q.correct_answer || q.sample_answer || '', explanation: q.explanation_cn || '' };
  }

  function renderResult(result) {
    $('resultTitle').textContent = result.title;
    $('resultScore').textContent = result.score;
    $('resultAdvice').textContent = result.score >= 85 ? '表现稳定，继续保持。' : result.score >= 65 ? '基础可以，建议复盘错题。' : '建议重练本篇并整理词汇。';
    $('resultStats').innerHTML = `<div><strong>${result.accuracy}%</strong><span>正确率</span></div><div><strong>${formatTime(result.seconds)}</strong><span>用时</span></div><div><strong>${result.wpm}</strong><span>WPM</span></div>`;
    const review = $('reviewList');
    review.textContent = '';
    result.details.forEach((d, i) => {
      const card = document.createElement('div');
      card.className = `review-card ${d.ok ? 'correct' : 'wrong'}`;
      card.innerHTML = `<h4>${i + 1}. ${d.q.question}</h4><p>你的答案：${d.answer || '未作答'}</p><p>参考答案：${d.correct}</p><p>${d.explanation}</p>`;
      review.appendChild(card);
    });
    showOnlyView('resultView');
    showSection('train');
  }

  function startTimer() {
    stopTimer();
    state.startedAt = Date.now() - state.elapsed * 1000;
    state.timer = setInterval(() => { state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000); updateTimer(); }, 1000);
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function updateTimer() {
    const el = $('timerDisplay');
    if (el) el.textContent = formatTime(state.elapsed);
  }

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function saveHistory(result) {
    const list = readJSON(HISTORY_KEY, []);
    list.unshift(result);
    writeJSON(HISTORY_KEY, list.slice(0, 100));
    renderHistory();
  }

  function renderHistory() {
    const body = $('historyBody');
    if (!body) return;
    body.textContent = '';
    readJSON(HISTORY_KEY, []).forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${new Date(item.createdAt).toLocaleString()}</td><td>${item.title}</td><td>${item.level}</td><td>${item.score}</td><td>${item.accuracy}%</td><td>${formatTime(item.seconds)}</td><td>${item.wpm}</td>`;
      body.appendChild(tr);
    });
    const scores = readJSON(HISTORY_KEY, []).map((x) => x.score);
    $('statAttempts').textContent = scores.length;
    $('statAverage').textContent = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    $('statBest').textContent = scores.length ? Math.max(...scores) : 0;
    $('statAccuracy').textContent = `${scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0}%`;
  }

  function saveMistakes(result) {
    const mistakes = readJSON(MISTAKE_KEY, []);
    result.details.filter((d) => !d.ok).forEach((d) => mistakes.unshift({ title: result.title, type: d.q.type, question: d.q.question, answer: d.answer, correct: d.correct, explanation: d.explanation, createdAt: result.createdAt }));
    writeJSON(MISTAKE_KEY, mistakes.slice(0, 200));
    renderMistakes();
  }

  function renderMistakes() {
    const box = $('mistakeList');
    if (!box) return;
    box.textContent = '';
    const list = readJSON(MISTAKE_KEY, []);
    if (!list.length) { box.innerHTML = '<p class="muted">暂无错题。</p>'; return; }
    list.slice(0, 20).forEach((m) => {
      const card = document.createElement('div');
      card.className = 'mistake-card';
      card.innerHTML = `<strong>${m.question}</strong><p>你的答案：${m.answer || '未作答'}</p><p>参考答案：${m.correct}</p>`;
      box.appendChild(card);
    });
  }

  function saveWord(word, title) {
    const clean = String(word || '').toLowerCase();
    if (!clean) return;
    const list = readJSON(VOCAB_KEY, []);
    const found = list.find((x) => x.word === clean);
    if (found) found.count += 1;
    else list.unshift({ word: clean, title, count: 1, createdAt: new Date().toISOString() });
    writeJSON(VOCAB_KEY, list.slice(0, 500));
    renderVocab();
  }

  function renderVocab() {
    const box = $('vocabList');
    if (!box) return;
    box.textContent = '';
    const list = readJSON(VOCAB_KEY, []);
    if (!list.length) { box.innerHTML = '<p class="muted">暂无词汇。阅读时点击英文单词收藏。</p>'; return; }
    list.slice(0, 80).forEach((w) => {
      const card = document.createElement('div');
      card.className = 'vocab-card';
      card.innerHTML = `<strong>${w.word}</strong><small>${w.title || ''}</small><span>${w.count}次</span>`;
      box.appendChild(card);
    });
  }

  function loadCustom() {
    return readJSON(CUSTOM_KEY, []).map((p) => normalizePassage({ ...p, category: 'custom', source: 'custom' }));
  }

  function importPassages() {
    const msg = $('importMessage');
    try {
      const parsed = JSON.parse($('importText').value);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = arr.map((p) => normalizePassage({ ...p, category: 'custom', source: 'custom' }));
      const current = loadCustom();
      const merged = normalized.concat(current).slice(0, 300);
      writeJSON(CUSTOM_KEY, merged);
      state.passages = state.passages.filter((p) => p.category !== 'custom').concat(merged);
      setValue('categoryFilter', 'custom');
      renderCards();
      if (msg) msg.textContent = '导入成功。';
    } catch (e) {
      if (msg) msg.textContent = '导入失败：JSON 格式不正确。';
    }
  }

  function clearCustom() {
    localStorage.removeItem(CUSTOM_KEY);
    state.passages = state.passages.filter((p) => p.category !== 'custom');
    renderCards();
  }

  function clearHistory() {
    writeJSON(HISTORY_KEY, []);
    renderHistory();
  }

  function randomPassage() {
    const category = currentCategory() === 'custom' ? 'custom' : currentCategory();
    const list = state.passages.filter((p) => category === 'all' || p.category === category);
    if (list.length) openPassage(list[hash(Date.now()) % list.length].id);
  }

  function installBindings() {
    $('categoryFilter')?.addEventListener('change', () => renderCards());
    $('levelFilter')?.addEventListener('change', () => renderCards());
    $('topicFilter')?.addEventListener('change', () => renderCards());
    $('searchInput')?.addEventListener('input', () => renderCards());
    $('resetFiltersBtn')?.addEventListener('click', () => { setValue('categoryFilter', 'curated'); setValue('levelFilter', 'all'); setValue('topicFilter', 'all'); $('searchInput').value = ''; renderCards(); });
    $('randomBtn')?.addEventListener('click', randomPassage);
    $('backToHomeBtn')?.addEventListener('click', home);
    $('resultBackBtn')?.addEventListener('click', home);
    $('startBtn')?.addEventListener('click', startPractice);
    $('submitBtn')?.addEventListener('click', submitPractice);
    $('clearHistoryBtn')?.addEventListener('click', clearHistory);
    $('importToggleBtn')?.addEventListener('click', () => $('importPanel')?.classList.toggle('hidden'));
    $('closeImportBtn')?.addEventListener('click', () => $('importPanel')?.classList.add('hidden'));
    $('importBtn')?.addEventListener('click', importPassages);
    $('clearCustomBtn')?.addEventListener('click', clearCustom);
  }

  function seedInitialBatches() {
    ['curated', 'generated', 'manual'].forEach((category) => {
      const indexes = nextIndexes(category, 'all', FRONT_LIMIT);
      indexes.forEach((idx) => state.passages.push(makePassage(category, 'all', idx)));
    });
    state.passages = state.passages.concat(loadCustom());
  }

  function boot() {
    installTopicOptions();
    seedInitialBatches();
    installAppShell();
    renderLibrarySummary();
    installBindings();
    renderCards();
    renderHistory();
    renderMistakes();
    renderVocab();
  }

  window.addEventListener('load', boot);
})();
