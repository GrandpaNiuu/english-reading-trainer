function customerModeLabel() {
  try {
    const settings = JSON.parse(localStorage.getItem('ert_study_settings_v1')) || { mode: 'balanced' };
    return {
      balanced: '智能混合训练',
      ielts: 'IELTS Reading',
      toefl: 'TOEFL Reading',
      cet: 'CET / 高考阅读',
      drill: '题型专项训练'
    }[settings.mode || 'balanced'] || '智能混合训练';
  } catch {
    return '智能混合训练';
  }
}

function customerCleanText() {
  const headerBadge = document.querySelector('.app-header > div:first-child::after');
  document.querySelectorAll('body *').forEach((node) => {
    if (!node || node.children.length) return;
    const text = node.textContent || '';
    if (/10700\+|passages|篇文章，当前显示|\d+\s*题\s*·|本次\s*\d+\s*题/i.test(text)) {
      node.textContent = text
        .replace(/10700\+\s*文章题库\s*·\s*/g, '')
        .replace(/10700\+\s*passages/gi, '')
        .replace(/\d+\s*篇文章，当前显示\s*\d+\s*篇/g, '按当前训练设置推荐内容')
        .replace(/\d+\s*words\s*·\s*/gi, '')
        .replace(/本次\s*\d+\s*题\s*·\s*/g, '')
        .replace(/\d+\s*题\s*·\s*/g, '')
        .trim();
    }
  });
  const passageCount = document.getElementById('passageCount');
  if (passageCount) passageCount.textContent = '按训练目标推荐内容，不展示底层数量';
}

createCard = function createCard(p) {
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
  preview.textContent = shortText(String(p.passage || '').replace(/\n+/g, ' '), 128);

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  const meta = document.createElement('span');
  meta.className = 'muted';
  meta.textContent = `${customerModeLabel()} · 混合题型`;

  const btn = document.createElement('button');
  btn.className = 'primary-btn';
  btn.textContent = '开始';
  btn.addEventListener('click', () => openPassage(p.id));
  footer.append(meta, btn);
  card.append(tags, title, preview, footer);
  return card;
};

openPassage = (function(originalOpenPassage) {
  return function patchedCustomerOpenPassage(id) {
    originalOpenPassage(id);
    const p = app.current;
    if (!p) return;
    const meta = document.getElementById('practiceMeta');
    if (meta) meta.textContent = `${p.topic || 'general'} · ${customerModeLabel()} · 考试型混合题组`;
    const note = document.getElementById('practiceModeNote');
    if (note) note.textContent = `${customerModeLabel()}：系统会按当前考试方向自动组织题型，避免题目堆叠。`;
    customerCleanText();
  };
})(openPassage);

const originalRenderCardsCustomer = typeof renderCards === 'function' ? renderCards : null;
if (originalRenderCardsCustomer) {
  renderCards = function patchedCustomerRenderCards(resetLimit = false) {
    originalRenderCardsCustomer(resetLimit);
    customerCleanText();
  };
}

window.addEventListener('load', () => {
  setTimeout(customerCleanText, 80);
  setTimeout(customerCleanText, 350);
});
