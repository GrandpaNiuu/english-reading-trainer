(function () {
  const STORE_KEY = 'ert_virtual_category_offsets_v1';

  const CATEGORY_OPTIONS = {
    curated: {
      label: '精选强化',
      source: 'virtual_curated_bank_10000000',
      quality: 'curated_virtual',
      levelPool: ['B2', 'C1', 'IELTS', 'TOEFL'],
      focus: 'curated_high_quality'
    },
    manual: {
      label: '人工样例',
      source: 'virtual_manual_bank_10000000',
      quality: 'manual_virtual',
      levelPool: ['A2', 'B1', 'B2'],
      focus: 'manual_example'
    },
    generated: {
      label: '拓展训练',
      source: 'virtual_exam_bank_10000000',
      quality: 'high_variety_virtual',
      levelPool: ['B2', 'C1', 'IELTS', 'TOEFL'],
      focus: 'exam_extension'
    }
  };

  function readOffsets() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  }

  function writeOffsets(offsets) {
    localStorage.setItem(STORE_KEY, JSON.stringify(offsets));
  }

  function nextOffset(category) {
    const offsets = readOffsets();
    const current = Number(offsets[category] || ({ curated: 2100000, manual: 3100000, generated: 4100000 }[category] || 5100000));
    offsets[category] = current + 1;
    writeOffsets(offsets);
    return current;
  }

  function pickLevel(config, index) {
    const pool = config.levelPool || ['B1', 'B2'];
    return pool[index % pool.length];
  }

  function makeBatch(category, count, options) {
    const config = CATEGORY_OPTIONS[category] || CATEGORY_OPTIONS.generated;
    const start = nextOffset(category);
    const batch = [];
    for (let i = 0; i < count; i += 1) {
      const level = options?.level || pickLevel(config, start + i);
      const exam = options?.exam || undefined;
      const passage = window.buildVirtualExamPassage(start + i, { level, exam, focus: `${config.focus}_${options?.focus || 'batch'}` });
      batch.push({
        ...passage,
        id: `${category}_${passage.id}`,
        source: config.source,
        quality: config.quality,
        category
      });
    }
    return batch;
  }

  function removeOldBulkGenerated() {
    if (!window.app || !Array.isArray(app.passages)) return;
    app.passages = app.passages.filter((p) => {
      const source = String(p.source || '').toLowerCase();
      return !(source.includes('original_generated_10000_bank') || source.includes('generated_10000'));
    });
  }

  function addVirtualCategoryBatch(category, options = {}) {
    if (typeof window.buildVirtualExamPassage !== 'function' || !window.app) return;
    removeOldBulkGenerated();
    const count = Number(options.count || 48);
    const batch = makeBatch(category, count, options);
    const normalized = typeof normalizePassages === 'function' ? normalizePassages(batch) : batch;
    normalized.forEach((p) => { p.category = category; });
    app.passages = normalized.concat(app.passages || []);

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = category;
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter && options.level) levelFilter.value = options.level;
    const topicFilter = document.getElementById('topicFilter');
    if (topicFilter) topicFilter.value = 'all';
    const search = document.getElementById('searchInput');
    if (search) search.value = '';

    if (typeof populateTopicFilter === 'function') populateTopicFilter();
    if (typeof renderLibrarySummary === 'function') renderLibrarySummary();
    if (typeof renderCards === 'function') renderCards(true);

    const msg = document.getElementById('virtualCategoryMessage');
    const label = CATEGORY_OPTIONS[category]?.label || '训练内容';
    if (msg) msg.textContent = `已换入一批新的${label}文章，并自动切换到对应训练列表。`;
  }

  function updateCategoryLabels() {
    const select = document.getElementById('categoryFilter');
    if (select) {
      [...select.options].forEach((option) => {
        if (option.value === 'generated') option.textContent = '拓展训练';
        if (option.value === 'curated') option.textContent = '精选强化';
        if (option.value === 'manual') option.textContent = '人工样例';
      });
    }

    window.categoryLabel = function categoryLabel(category) {
      return { curated: '精选强化', generated: '拓展训练', manual: '人工样例', custom: '自定义导入' }[category] || '训练内容';
    };
    window.categoryDescription = function categoryDescription(category) {
      return {
        curated: '按需生成的高质量强化训练，偏正式考试阅读。',
        generated: '按需生成的高难拓展训练，覆盖多学科考试文章。',
        manual: '按需生成的样例训练，适合基础过渡和功能测试。',
        custom: '你导入的文章，保存在当前浏览器中。'
      }[category] || '';
    };
  }

  function installVirtualCategoryPanel() {
    if (document.getElementById('virtualCategoryPanel')) return;
    const anchor = document.getElementById('virtualBankPanel') || document.getElementById('examModePanel') || document.querySelector('.filter-panel');
    if (!anchor || !anchor.parentNode) return;
    const panel = document.createElement('section');
    panel.id = 'virtualCategoryPanel';
    panel.className = 'panel virtual-category-panel';
    panel.setAttribute('data-app-section', 'train');
    panel.innerHTML = `
      <div class="section-title-row">
        <div>
          <h2>按需换题库</h2>
          <p>精选强化、人工样例、拓展训练都使用虚拟无限题库。点击后只显示新换入的对应训练内容，不再被旧大题库淹没。</p>
        </div>
      </div>
      <div class="virtual-category-actions">
        <button class="primary-btn" data-virtual-category="curated">换一批精选强化</button>
        <button class="secondary-btn" data-virtual-category="generated">换一批拓展训练</button>
        <button class="ghost-btn" data-virtual-category="manual">换一批人工样例</button>
      </div>
      <p id="virtualCategoryMessage" class="message">推荐先用“精选强化”训练，再用“拓展训练”刷高难文章。</p>
    `;
    anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    panel.querySelectorAll('[data-virtual-category]').forEach((button) => {
      button.addEventListener('click', () => addVirtualCategoryBatch(button.dataset.virtualCategory, { count: 60, focus: 'user_switch' }));
    });
  }

  window.addVirtualCategoryBatch = addVirtualCategoryBatch;
  window.removeOldBulkGenerated = removeOldBulkGenerated;

  window.addEventListener('load', function () {
    setTimeout(function () {
      updateCategoryLabels();
      removeOldBulkGenerated();
      installVirtualCategoryPanel();
      if (!sessionStorage.getItem('ert_virtual_category_bootstrap')) {
        addVirtualCategoryBatch('curated', { count: 36, focus: 'bootstrap' });
        addVirtualCategoryBatch('generated', { count: 36, focus: 'bootstrap' });
        sessionStorage.setItem('ert_virtual_category_bootstrap', '1');
      } else {
        if (typeof renderCards === 'function') renderCards(true);
      }
    }, 420);
  });
})();
