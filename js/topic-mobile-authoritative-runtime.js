/* Topic coverage + mobile usability controller. Load last. */
(function () {
  const FRONT_LIMIT = 20;
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
    curated: { label: '精选强化', levels: ['B2', 'C1', 'IELTS', 'TOEFL'], source: 'virtual_curated_topic_bank' },
    generated: { label: '拓展训练', levels: ['B2', 'C1', 'IELTS', 'TOEFL'], source: 'virtual_extension_topic_bank' },
    manual: { label: '人工样例', levels: ['A2', 'B1', 'B2', 'C1'], source: 'virtual_manual_topic_bank' }
  };

  function hasApp() { return typeof app !== 'undefined' && Array.isArray(app.passages); }
  function h(v) { let x = 2166136261; String(v || '').split('').forEach((c) => { x ^= c.charCodeAt(0); x += (x << 1) + (x << 4) + (x << 7) + (x << 8) + (x << 24); }); return x >>> 0; }
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function pick(arr, r) { return arr[Math.floor(r() * arr.length) % arr.length]; }
  function titleCase(s) { return String(s).replace(/\b\w/g, (m) => m.toUpperCase()); }
  function words(text) { return String(text).split(/\s+/).filter(Boolean).length; }
  function topicByKey(key) { return TOPICS.find((t) => t[0] === key) || TOPICS[h(key) % TOPICS.length]; }
  function currentCategory() { return document.getElementById('categoryFilter')?.value || 'curated'; }
  function currentTopic() { return document.getElementById('topicFilter')?.value || 'all'; }
  function labelFor(c) { return { curated: '精选强化', generated: '拓展训练', manual: '人工样例', custom: '自定义导入', all: '训练内容' }[c] || '训练内容'; }

  function makePassage(category, topicKey, index) {
    const t = topicByKey(topicKey === 'all' ? TOPICS[index % TOPICS.length][0] : topicKey);
    const r = rng(h(`${category}|${topicKey}|${index}|topic-mobile`));
    const cfg = CATEGORY[category] || CATEGORY.curated;
    const level = cfg.levels[index % cfg.levels.length];
    const structure = pick(['problem-solution', 'cause-effect', 'compare-contrast', 'claim-evidence', 'case-study', 'debate-and-resolution'], r);
    const angle = pick(['evidence', 'public response', 'hidden costs', 'long-term change', 'competing explanations', 'practical limits'], r);
    const title = `${titleCase(t[1])}: ${titleCase(angle)}`;
    const p1 = `The topic of this passage is ${t[0]}. A common question in ${t[2]} is how ${t[1]} should be understood when ${t[3]} must make decisions from incomplete evidence.`;
    const p2 = `At first, the situation may seem simple. However, ${t[4]} often show that the problem has several layers, especially when timing, local conditions, and public expectations are considered together.`;
    const p3 = `One view emphasizes immediate action, while another stresses careful interpretation. This contrast matters because weak evidence can lead to fast but misleading conclusions.`;
    const p4 = `The passage follows a ${structure} structure. It introduces a situation, examines evidence, and limits the final claim rather than offering a single easy answer.`;
    const passage = [p1, p2, p3, p4].join('\n\n');
    return {
      id: `${category}_${t[0].replace(/\s+/g, '_')}_${index}`,
      title,
      level,
      topic: t[0],
      source: cfg.source,
      quality: `${category}_topic_virtual`,
      category,
      word_count: words(passage),
      passage,
      questions: [
        { id: 1, type: 'main_idea', question: 'What is the main idea of the passage?', options: { A: `The passage explains why ${t[1]} needs careful interpretation.`, B: 'The passage gives a personal travel story.', C: 'The passage rejects all evidence.', D: 'The passage lists unrelated facts only.' }, correct_answer: 'A', explanation_cn: '文章主旨是说明该主题需要结合证据和语境理解。' },
        { id: 2, type: 'detail', question: 'Which evidence source is mentioned?', options: { A: t[4], B: 'a shopping coupon', C: 'a sports poster', D: 'a private holiday photo' }, correct_answer: 'A', explanation_cn: `文章提到的证据是 ${t[4]}。` },
        { id: 3, type: 'inference', question: 'What can be inferred about the writer?', options: { A: 'The writer prefers careful claims.', B: 'The writer ignores context.', C: 'The writer dislikes evidence.', D: 'The writer thinks every problem is simple.' }, correct_answer: 'A', explanation_cn: '作者强调证据、语境和限定，因此倾向谨慎判断。' },
        { id: 4, type: 'structure', question: 'How is the passage mainly organized?', options: { A: `It uses a ${structure} structure.`, B: 'It gives only a list of names.', C: 'It avoids any conclusion.', D: 'It is written as a poem.' }, correct_answer: 'A', explanation_cn: `文章结构是 ${structure}。` },
        { id: 5, type: 'vocabulary_context', question: 'In the passage, “misleading” is closest in meaning to:', options: { A: 'likely to give a wrong idea', B: 'very expensive', C: 'easy to decorate', D: 'physically heavy' }, correct_answer: 'A', explanation_cn: 'misleading 表示“容易误导的”。' },
        { id: 6, type: 'exam_short_answer', question: 'Short answer: What topic is discussed? Answer in NO MORE THAN SIX WORDS.', accepted_keywords: t[0].split(/\s+/).concat(t[1].split(/\s+/)).map((x) => x.toLowerCase()), sample_answer: t[0], correct_answer: t[0], explanation_cn: `主题是 ${t[0]}。` }
      ]
    };
  }

  function isManaged(p, category) { return p?.category === category && String(p.source || '').includes('topic_bank'); }
  function isOldBulk(p) { const s = String(p?.source || '').toLowerCase(); return s.includes('original_generated_10000_bank') || s.includes('generated_10000'); }
  function offsetKey(c, t) { return `ert_topic_mobile_offset_${c}_${t}`; }
  function nextOffset(c, t) { const key = offsetKey(c, t); const cur = Number(localStorage.getItem(key) || (h(`${c}|${t}`) % 5000000 + 5000000)); localStorage.setItem(key, String(cur + FRONT_LIMIT)); return cur; }

  function replaceBatch(category = currentCategory(), topic = currentTopic()) {
    if (!hasApp()) return;
    if (category === 'all' || category === 'custom') category = 'curated';
    const start = nextOffset(category, topic);
    const batch = [];
    for (let i = 0; i < FRONT_LIMIT; i += 1) batch.push(makePassage(category, topic, start + i));
    const normalized = typeof normalizePassages === 'function' ? normalizePassages(batch) : batch;
    normalized.forEach((p) => { p.category = category; });
    app.passages = (app.passages || []).filter((p) => !isOldBulk(p) && !isManaged(p, category));
    app.passages = normalized.concat(app.passages);
    const cat = document.getElementById('categoryFilter'); if (cat) cat.value = category;
    const topicEl = document.getElementById('topicFilter'); if (topicEl) topicEl.value = topic;
    const level = document.getElementById('levelFilter'); if (level) level.value = 'all';
    const search = document.getElementById('searchInput'); if (search) search.value = '';
    renderCards(true);
    const msg = document.getElementById('virtualCategoryMessage') || document.getElementById('mobileBatchHint');
    if (msg) msg.textContent = `已换入 20 篇${labelFor(category)} · ${topic === 'all' ? '混合主题' : topic}`;
  }

  window.populateTopicFilter = function populateTopicFilter() {
    const select = document.getElementById('topicFilter');
    if (!select) return;
    const current = select.value || 'all';
    select.innerHTML = '<option value="all">全部主题</option>';
    TOPICS.forEach((t) => {
      const option = document.createElement('option');
      option.value = t[0];
      option.textContent = t[0];
      select.appendChild(option);
    });
    select.value = [...select.options].some((o) => o.value === current) ? current : 'all';
  };

  window.renderCards = function renderCards() {
    if (!hasApp()) return;
    window.categoryLabel = labelFor;
    app.passages = app.passages.filter((p) => !isOldBulk(p));
    const grid = document.getElementById('passageGrid'); if (!grid) return;
    const category = currentCategory();
    const topic = currentTopic();
    const level = document.getElementById('levelFilter')?.value || 'all';
    const query = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
    let filtered = app.passages.filter((p) => {
      const okCategory = category === 'all' || p.category === category;
      const okTopic = topic === 'all' || p.topic === topic;
      const okLevel = level === 'all' || p.level === level;
      const text = `${p.title} ${p.topic || ''} ${p.level} ${p.source || ''}`.toLowerCase();
      return okCategory && okTopic && okLevel && (!query || text.includes(query));
    }).sort(typeof sortPassages === 'function' ? sortPassages : (a, b) => String(a.title).localeCompare(b.title));
    if (!filtered.length && category !== 'custom') {
      replaceBatch(category, topic);
      return;
    }
    filtered = filtered.slice(0, FRONT_LIMIT);
    app.filtered = filtered;
    grid.textContent = '';
    const passageCount = document.getElementById('passageCount');
    if (passageCount) passageCount.textContent = `${labelFor(category)}：当前展示 20 篇，下方可直接换一批`;
    if (typeof updateActiveCategoryCards === 'function') updateActiveCategoryCards(category);
    const fragment = document.createDocumentFragment();
    filtered.forEach((p) => fragment.appendChild(createCard(p)));
    grid.appendChild(fragment);
  };

  function installMobileBar() {
    if (document.getElementById('mobileQuickBatchBar')) return;
    const bar = document.createElement('div');
    bar.id = 'mobileQuickBatchBar';
    bar.className = 'mobile-quick-batch-bar';
    bar.innerHTML = `<button id="mobileBatchBtn" class="primary-btn">换一批当前内容</button><span id="mobileBatchHint">当前分类只展示 20 篇</span>`;
    document.body.appendChild(bar);
    document.getElementById('mobileBatchBtn').addEventListener('click', () => replaceBatch(currentCategory(), currentTopic()));
  }

  function installCategoryPanel() {
    let panel = document.getElementById('virtualCategoryPanel');
    const anchor = document.getElementById('examModePanel') || document.querySelector('.filter-panel');
    if (!panel && anchor?.parentNode) {
      panel = document.createElement('section');
      panel.id = 'virtualCategoryPanel';
      panel.className = 'panel virtual-category-panel';
      panel.setAttribute('data-app-section', 'train');
      anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    }
    if (!panel) return;
    panel.innerHTML = `<div class="section-title-row"><div><h2>按需换题库</h2><p>每个分类与每个主题都可生成对应文章。前台固定 20 篇，手机端底部也能直接换。</p></div></div><div class="virtual-category-actions"><button class="primary-btn" data-cat="curated">换一批精选强化</button><button class="secondary-btn" data-cat="generated">换一批拓展训练</button><button class="ghost-btn" data-cat="manual">换一批人工样例</button></div><p id="virtualCategoryMessage" class="message">选择主题后再换一批，会生成该主题文章。</p>`;
    panel.querySelectorAll('[data-cat]').forEach((btn) => btn.addEventListener('click', () => replaceBatch(btn.dataset.cat, currentTopic())));
  }

  window.addVirtualCategoryBatch = (category) => replaceBatch(category || currentCategory(), currentTopic());

  window.addEventListener('load', function () {
    setTimeout(() => {
      populateTopicFilter();
      installCategoryPanel();
      installMobileBar();
      ['curated', 'generated', 'manual'].forEach((c) => {
        if (!app.passages.some((p) => isManaged(p, c))) {
          const current = currentCategory();
          replaceBatch(c, 'all');
          const cat = document.getElementById('categoryFilter'); if (cat) cat.value = current || 'curated';
        }
      });
      renderCards(true);
    }, 900);
  });
})();
