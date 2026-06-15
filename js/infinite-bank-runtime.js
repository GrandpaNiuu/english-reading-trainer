(function () {
  const STORE_KEY = 'ert_virtual_bank_offset_v1';

  function getOffset() {
    return Number(localStorage.getItem(STORE_KEY) || '1200000');
  }

  function setOffset(value) {
    localStorage.setItem(STORE_KEY, String(value));
  }

  function addBatch(count, options) {
    if (typeof window.generateVirtualExamBatch !== 'function' || !window.app) return;
    const offset = getOffset();
    const batch = window.generateVirtualExamBatch(count, offset, options || {});
    setOffset(offset + count);
    const normalized = typeof normalizePassages === 'function' ? normalizePassages(batch) : batch;
    app.passages = normalized.concat(app.passages || []);
    if (typeof populateTopicFilter === 'function') populateTopicFilter();
    if (typeof renderLibrarySummary === 'function') renderLibrarySummary();
    if (typeof renderCards === 'function') renderCards(true);
    const msg = document.getElementById('virtualBankMessage');
    if (msg) msg.textContent = '已加入新的考试型文章。可继续换一批，系统会按需生成。';
  }

  function installPanel() {
    if (document.getElementById('virtualBankPanel')) return;
    const anchor = document.getElementById('examModePanel') || document.querySelector('.filter-panel');
    if (!anchor || !anchor.parentNode) return;
    const panel = document.createElement('section');
    panel.id = 'virtualBankPanel';
    panel.className = 'panel virtual-bank-panel';
    panel.setAttribute('data-app-section', 'train');
    panel.innerHTML = `
      <div class="section-title-row">
        <div>
          <h2>拓展训练库</h2>
          <p>按需生成新的考试型阅读文章，覆盖学术、科技、社会、环境、历史、心理、经济等方向。不会一次性加载超大数据，手机端也能保持流畅。</p>
        </div>
      </div>
      <div class="virtual-bank-grid">
        <label>难度方向
          <select id="virtualLevelSelect">
            <option value="">自动混合</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
          </select>
        </label>
        <label>考试方向
          <select id="virtualExamSelect">
            <option value="">自动混合</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
            <option value="CET">CET</option>
            <option value="Gaokao">高考</option>
            <option value="Academic">学术阅读</option>
          </select>
        </label>
        <button id="addVirtualBatchBtn" class="primary-btn">换一批文章</button>
      </div>
      <p id="virtualBankMessage" class="message">系统使用虚拟文章池扩展内容，减少重复感，避免页面卡顿。</p>
    `;
    anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    document.getElementById('addVirtualBatchBtn').addEventListener('click', function () {
      addBatch(90, {
        level: document.getElementById('virtualLevelSelect').value || undefined,
        exam: document.getElementById('virtualExamSelect').value || undefined,
        focus: 'manual'
      });
    });
  }

  window.addVirtualExamBatch = addBatch;
  window.addEventListener('load', function () {
    setTimeout(function () {
      installPanel();
      if (!sessionStorage.getItem('ert_virtual_bootstrap_done')) {
        addBatch(60, { focus: 'bootstrap' });
        sessionStorage.setItem('ert_virtual_bootstrap_done', '1');
      }
    }, 250);
  });
})();
