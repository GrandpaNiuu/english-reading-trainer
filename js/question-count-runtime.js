function getModeLabelForCards() {
  try {
    const settings = JSON.parse(localStorage.getItem('ert_study_settings_v1')) || { mode: 'balanced' };
    return {
      balanced: '智能混合',
      ielts: 'IELTS',
      toefl: 'TOEFL',
      cet: 'CET/高考',
      drill: '题型专项'
    }[settings.mode || 'balanced'] || '智能混合';
  } catch {
    return '智能混合';
  }
}

function getPracticeCountForCard(p) {
  if (typeof selectPracticeQuestions === 'function') {
    return selectPracticeQuestions(p.questions || []).length;
  }
  try {
    const settings = JSON.parse(localStorage.getItem('ert_study_settings_v1')) || { mode: 'balanced' };
    const countMap = { balanced: 18, ielts: 14, toefl: 12, cet: 15, drill: 12 };
    return Math.min(countMap[settings.mode || 'balanced'] || 18, (p.questions || []).length || 0);
  } catch {
    return Math.min(18, (p.questions || []).length || 0);
  }
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
  preview.textContent = shortText(String(p.passage || '').replace(/\n+/g, ' '), 135);

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  const meta = document.createElement('span');
  meta.className = 'muted';
  const count = getPracticeCountForCard(p);
  const modeLabel = getModeLabelForCards();
  meta.textContent = `${p.word_count || countWords(p.passage)} words · 本次 ${count} 题 · ${modeLabel}`;

  const btn = document.createElement('button');
  btn.className = 'primary-btn';
  btn.textContent = '开始';
  btn.addEventListener('click', () => openPassage(p.id));
  footer.append(meta, btn);
  card.append(tags, title, preview, footer);
  return card;
};

openPassage = (function(originalOpenPassage) {
  return function patchedCountOpenPassage(id) {
    originalOpenPassage(id);
    const p = app.current;
    if (!p) return;
    const count = getPracticeCountForCard(p);
    const modeLabel = getModeLabelForCards();
    const meta = document.getElementById('practiceMeta');
    if (meta) {
      meta.textContent = `${p.topic || 'general'} · ${p.word_count || countWords(p.passage)} words · ${modeLabel} · 本次 ${count} 题`;
    }
  };
})(openPassage);

function refreshCardsAfterModeChange() {
  ['examModeSelect', 'drillTypeSelect'].forEach((id) => {
    const field = document.getElementById(id);
    if (field && !field.dataset.countRefreshBound) {
      field.dataset.countRefreshBound = '1';
      field.addEventListener('change', () => {
        setTimeout(() => renderCards(true), 0);
      });
    }
  });
}

window.addEventListener('load', () => {
  refreshCardsAfterModeChange();
  setTimeout(() => {
    refreshCardsAfterModeChange();
    if (typeof renderCards === 'function') renderCards(true);
  }, 0);
});
