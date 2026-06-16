(function () {
  function isOldBulkGenerated(p) {
    const source = String(p?.source || '').toLowerCase();
    return source.includes('original_generated_10000_bank') || source.includes('generated_10000');
  }

  function isVirtualGenerated(p) {
    const source = String(p?.source || '').toLowerCase();
    return source.includes('virtual_exam_bank') || source.includes('virtual');
  }

  function applyLegacyFusion() {
    if (!window.app || !Array.isArray(app.passages)) return;

    // Remove the old bulk-generated front-end list. Keep curated, manual, custom, and virtual exam articles.
    app.passages = app.passages.filter((p) => !isOldBulkGenerated(p));
    app.passages.forEach((p) => {
      if (isVirtualGenerated(p)) p.category = 'generated';
    });

    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect) {
      [...categorySelect.options].forEach((option) => {
        if (option.value === 'generated') option.textContent = '拓展训练';
      });
    }

    if (typeof window.categoryLabel === 'function') {
      window.categoryLabel = function categoryLabel(category) {
        return { curated: '精选强化', generated: '拓展训练', manual: '人工样例', custom: '自定义导入' }[category] || '训练内容';
      };
    }

    if (typeof window.categoryDescription === 'function') {
      window.categoryDescription = function categoryDescription(category) {
        return {
          curated: '优先练习：结构更完整，适合正式训练。',
          generated: '按需拓展：高难考试型文章，点击换一批继续生成。',
          manual: '快速测试：人工样例风格文章。',
          custom: '你导入的文章：保存在当前浏览器中。'
        }[category] || '';
      };
    }

    if (typeof window.populateTopicFilter === 'function') populateTopicFilter();
    if (typeof window.renderLibrarySummary === 'function') renderLibrarySummary();
    if (typeof window.renderCards === 'function') renderCards(true);
  }

  window.applyLegacyFusion = applyLegacyFusion;
  window.addEventListener('load', function () {
    setTimeout(applyLegacyFusion, 180);
    setTimeout(applyLegacyFusion, 650);
  });
})();
