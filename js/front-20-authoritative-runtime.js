/* Final front-end controller: loaded last. */
(function () {
  const FRONT_LIMIT = 20;

  const CATEGORY_CONFIG = {
    curated: {
      label: '精选强化',
      source: 'virtual_curated_bank_10000000',
      quality: 'curated_virtual',
      levels: ['B2', 'C1', 'IELTS', 'TOEFL'],
      seed: 7200000
    },
    generated: {
      label: '拓展训练',
      source: 'virtual_exam_bank_10000000',
      quality: 'high_variety_virtual',
      levels: ['B2', 'C1', 'IELTS', 'TOEFL'],
      seed: 8200000
    },
    manual: {
      label: '人工样例',
      source: 'virtual_manual_bank_10000000',
      quality: 'manual_virtual',
      levels: ['A2', 'B1', 'B2', 'C1'],
      seed: 9200000
    }
  };

  function hasApp() {
    return typeof app !== 'undefined' && Array.isArray(app.passages);
  }

  function labelFor(category) {
    return { curated: '精选强化', generated: '拓展训练', manual: '人工样例', custom: '自定义导入', all: '训练内容' }[category] || '训练内容';
  }

  function descriptionFor(category) {
    return {
      curated: '每次只展示 20 篇精选强化文章，不满意可换一批。',
      generated: '每次只展示 20 篇高难拓展文章，不满意可换一批。',
      manual: '每次只展示 20 篇人工样例文章，不满意可换一批。',
      custom: '你导入的文章，保存在当前浏览器中。'
    }[category] || '选择一个训练方向开始。';
  }

  function readOffset(category) {
    const key = `ert_front20_offset_${category}`;
    const base = CATEGORY_CONFIG[category]?.seed || 10000000;
    return Number(localStorage.getItem(key) || base);
  }

  function writeOffset(category, value) {
    localStorage.setItem(`ert_front20_offset_${category}`, String(value));
  }

  function isOldBulk(p) {
    const source = String(p?.source || '').toLowerCase();
    return source.includes('original_generated_10000_bank') || source.includes('generated_10000');
  }

  function isVirtualForCategory(p, category) {
    const source = String(p?.source || '').toLowerCase();
    return p?.category === category && source.includes('virtual_');
  }

  function removeOldBulk() {
    if (!hasApp()) return;
    app.passages = app.passages.filter((p) => !isOldBulk(p));
  }

  function buildFrontBatch(category) {
    const config = CATEGORY_CONFIG[category];
    if (!config || typeof window.buildVirtualExamPassage !== 'function') return [];
    const start = readOffset(category);
    writeOffset(category, start + FRONT_LIMIT);
    const batch = [];
    for (let i = 0; i < FRONT_LIMIT; i += 1) {
      const level = config.levels[(start + i) % config.levels.length];
      const passage = window.buildVirtualExamPassage(start + i, { level, focus: `${category}_front20` });
      batch.push({
        ...passage,
        id: `${category}_front20_${passage.id}`,
        source: config.source,
        quality: config.quality,
        category
      });
    }
    const normalized = typeof normalizePassages === 'function' ? normalizePassages(batch) : batch;
    normalized.forEach((p) => { p.category = category; });
    return normalized;
  }

  function replaceCategoryFront(category) {
    if (!hasApp()) return;
    removeOldBulk();
    const batch = buildFrontBatch(category);
    if (!batch.length) return;
    app.passages = app.passages.filter((p) => !isVirtualForCategory(p, category));
    app.passages = batch.concat(app.passages);
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = category;
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) levelFilter.value = 'all';
    const topicFilter = document.getElementById('topicFilter');
    if (topicFilter) topicFilter.value = 'all';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    if (typeof populateTopicFilter === 'function') populateTopicFilter();
    renderCards(true);
    const msg = document.getElementById('virtualCategoryMessage');
    if (msg) msg.textContent = `已替换为新的 20 篇${labelFor(category)}文章。`;
  }

  function ensureLabels() {
    window.categoryLabel = labelFor;
    window.categoryDescription = descriptionFor;
    const select = document.getElementById('categoryFilter');
    if (select) {
      [...select.options].forEach((option) => {
        if (option.value === 'generated') option.textContent = '拓展训练';
        if (option.value === 'curated') option.textContent = '精选强化';
        if (option.value === 'manual') option.textContent = '人工样例';
      });
    }
  }

  function filterPassages() {
    const category = document.getElementById('categoryFilter')?.value || 'curated';
    const level = document.getElementById('levelFilter')?.value || 'all';
    const topic = document.getElementById('topicFilter')?.value || 'all';
    const query = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
    return (app.passages || []).filter((p) => {
      if (isOldBulk(p)) return false;
      const okCategory = category === 'all' || p.category === category;
      const okLevel = level === 'all' || p.level === level;
      const okTopic = topic === 'all' || p.topic === topic;
      const text = `${p.title} ${p.topic || ''} ${p.level} ${p.source || ''} ${p.category || ''}`.toLowerCase();
      return okCategory && okLevel && okTopic && (!query || text.includes(query));
    }).sort(sortPassages);
  }

  window.renderCards = function renderCards() {
    if (!hasApp()) return;
    ensureLabels();
    removeOldBulk();
    const grid = document.getElementById('passageGrid');
    if (!grid) return;
    grid.textContent = '';

    const category = document.getElementById('categoryFilter')?.value || 'curated';
    app.visibleLimit = FRONT_LIMIT;
    app.filtered = filterPassages();
    const shown = app.filtered.slice(0, FRONT_LIMIT);

    const passageCount = document.getElementById('passageCount');
    if (passageCount) passageCount.textContent = `${labelFor(category)}：当前展示 20 篇，觉得不合适可换一批`;
    if (typeof updateActiveCategoryCards === 'function') updateActiveCategoryCards(category);

    if (!shown.length) {
      const empty = document.createElement('p');
      empty.className = 'muted empty-state';
      empty.textContent = '当前没有可显示文章，请点击“换一批”。';
      grid.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    shown.forEach((p) => fragment.appendChild(createCard(p)));
    grid.appendChild(fragment);
  };

  window.addVirtualCategoryBatch = function addVirtualCategoryBatch(category) {
    replaceCategoryFront(category || 'curated');
  };

  function installFrontControls() {
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
    panel.innerHTML = `
      <div class="section-title-row">
        <div>
          <h2>按需换题库</h2>
          <p>每个入口前台固定 20 篇，不满意就换一批，不再显示更多数量。</p>
        </div>
      </div>
      <div class="virtual-category-actions">
        <button class="primary-btn" data-front-category="curated">换一批精选强化</button>
        <button class="secondary-btn" data-front-category="generated">换一批拓展训练</button>
        <button class="ghost-btn" data-front-category="manual">换一批人工样例</button>
      </div>
      <p id="virtualCategoryMessage" class="message">当前分类只展示 20 篇。</p>
    `;
    panel.querySelectorAll('[data-front-category]').forEach((button) => {
      button.addEventListener('click', () => replaceCategoryFront(button.dataset.frontCategory));
    });
  }

  function bootstrap() {
    if (!hasApp()) return;
    ensureLabels();
    removeOldBulk();
    installFrontControls();
    ['curated', 'generated', 'manual'].forEach((category) => {
      const exists = app.passages.some((p) => isVirtualForCategory(p, category));
      if (!exists) {
        const batch = buildFrontBatch(category);
        app.passages = batch.concat(app.passages);
      }
    });
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter && !categoryFilter.value) categoryFilter.value = 'curated';
    renderCards(true);
  }

  window.addEventListener('load', function () {
    setTimeout(bootstrap, 700);
    setTimeout(bootstrap, 1400);
  });
})();
