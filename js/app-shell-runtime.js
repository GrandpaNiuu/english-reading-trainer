const APP_SECTIONS = [
  { id: 'home', label: '首页', icon: '⌂' },
  { id: 'train', label: '训练', icon: '◇' },
  { id: 'review', label: '复盘', icon: '↺' },
  { id: 'vocab', label: '词汇', icon: 'Aa' },
  { id: 'history', label: '记录', icon: '▦' }
];

function installAppShell() {
  document.body.classList.add('modern-app-shell');
  buildDashboardCards();
  classifyMajorSections();
  buildBottomNav();
  hidePublicCounts();
  showAppSection('home');
}

function classifyMajorSections() {
  const stats = document.querySelector('.stats-panel');
  const library = document.querySelector('.library-summary-panel');
  const importPanel = document.getElementById('importPanel');
  const home = document.getElementById('homeView');
  const mistake = document.getElementById('mistakePanel');
  const vocab = document.getElementById('vocabPanel');
  const history = document.querySelector('.history-panel');
  const exam = document.getElementById('examModePanel');

  [stats, library, importPanel].forEach((node) => node && node.setAttribute('data-app-section', 'home'));
  [exam, home].forEach((node) => node && node.setAttribute('data-app-section', 'train'));
  if (mistake) mistake.setAttribute('data-app-section', 'review');
  if (vocab) vocab.setAttribute('data-app-section', 'vocab');
  if (history) history.setAttribute('data-app-section', 'history');
}

function buildDashboardCards() {
  if (document.getElementById('quickStartPanel')) return;
  const container = document.querySelector('.container');
  const stats = document.querySelector('.stats-panel');
  if (!container || !stats) return;

  const panel = document.createElement('section');
  panel.id = 'quickStartPanel';
  panel.className = 'panel quick-start-panel';
  panel.setAttribute('data-app-section', 'home');
  panel.innerHTML = `
    <div class="quick-hero">
      <div>
        <span class="app-kicker">Today</span>
        <h2>选择一个训练方向</h2>
        <p>按考试模式、专项题型和复盘计划训练。系统会自动控制题量，不暴露底层题库数量。</p>
      </div>
      <button class="primary-btn" id="quickStartBtn">开始训练</button>
    </div>
    <div class="quick-action-grid">
      <button class="quick-action-card" data-go="train"><span>Exam</span><strong>考试训练</strong><small>IELTS / TOEFL / CET / 高考</small></button>
      <button class="quick-action-card" data-go="review"><span>Review</span><strong>错题复盘</strong><small>自动整理薄弱题型</small></button>
      <button class="quick-action-card" data-go="vocab"><span>Words</span><strong>词汇本</strong><small>点击文章单词即可收藏</small></button>
      <button class="quick-action-card" data-go="history"><span>Report</span><strong>学习记录</strong><small>查看分数与速度变化</small></button>
    </div>
  `;
  container.insertBefore(panel, stats);
  panel.querySelectorAll('[data-go]').forEach((btn) => btn.addEventListener('click', () => showAppSection(btn.dataset.go)));
  panel.querySelector('#quickStartBtn').addEventListener('click', () => showAppSection('train'));
}

function buildBottomNav() {
  if (document.getElementById('appBottomNav')) return;
  const nav = document.createElement('nav');
  nav.id = 'appBottomNav';
  nav.className = 'app-bottom-nav';
  nav.setAttribute('aria-label', 'App navigation');
  APP_SECTIONS.forEach((section) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.section = section.id;
    button.innerHTML = `<span>${section.icon}</span><strong>${section.label}</strong>`;
    button.addEventListener('click', () => showAppSection(section.id));
    nav.appendChild(button);
  });
  document.body.appendChild(nav);
}

function showAppSection(sectionId) {
  document.body.dataset.activeSection = sectionId;
  document.querySelectorAll('[data-app-section]').forEach((node) => {
    node.classList.toggle('app-section-hidden', node.getAttribute('data-app-section') !== sectionId);
  });
  document.querySelectorAll('#appBottomNav button').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === sectionId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hidePublicCounts() {
  const passageCount = document.getElementById('passageCount');
  if (passageCount) passageCount.textContent = '选择题库、考试模式和专项题型后开始训练';

  document.querySelectorAll('.category-card strong').forEach((node) => {
    const parent = node.closest('.category-card');
    if (!parent) return;
    if (parent.classList.contains('curated')) node.textContent = '精选';
    else if (parent.classList.contains('generated')) node.textContent = '题库';
    else if (parent.classList.contains('manual')) node.textContent = '样例';
    else if (parent.classList.contains('custom')) node.textContent = '导入';
  });

  document.querySelectorAll('.passage-card .muted').forEach((node) => {
    node.textContent = node.textContent
      .replace(/\d+\s*words\s*·\s*/i, '')
      .replace(/本次\s*\d+\s*题\s*·\s*/g, '')
      .replace(/\d+\s*题\s*·\s*/g, '')
      .trim();
  });
}

const originalRenderCardsForShell = typeof renderCards === 'function' ? renderCards : null;
if (originalRenderCardsForShell) {
  renderCards = function patchedRenderCardsForShell(resetLimit = false) {
    originalRenderCardsForShell(resetLimit);
    hidePublicCounts();
  };
}

const originalRenderLibrarySummaryForShell = typeof renderLibrarySummary === 'function' ? renderLibrarySummary : null;
if (originalRenderLibrarySummaryForShell) {
  renderLibrarySummary = function patchedRenderLibrarySummaryForShell() {
    originalRenderLibrarySummaryForShell();
    hidePublicCounts();
  };
}

window.addEventListener('load', () => {
  setTimeout(() => {
    installAppShell();
    classifyMajorSections();
    hidePublicCounts();
  }, 50);
});
