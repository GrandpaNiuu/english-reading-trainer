const STUDY_STORE = {
  mistakes: 'ert_mistakes_v1',
  settings: 'ert_study_settings_v1'
};

const EXAM_MODE_CONFIG = {
  balanced: {
    label: '智能混合',
    count: 18,
    description: '综合覆盖判断、匹配、摘要填空、流程图、简答和证据定位。'
  },
  ielts: {
    label: 'IELTS Reading',
    count: 14,
    priority: ['tf_not_given', 'yes_no_not_given', 'matching_headings', 'matching_information', 'ielts_summary_completion', 'flow_chart_completion', 'exam_short_answer', 'vocabulary_context', 'reference_question', 'evidence_location'],
    description: '偏 IELTS：T/F/NG、Matching Headings、Summary、Flow-chart、短答案。'
  },
  toefl: {
    label: 'TOEFL Reading',
    count: 12,
    priority: ['rhetorical_purpose', 'sentence_insertion', 'vocabulary_context', 'reference_question', 'evidence_location', 'main_idea', 'detail', 'inference', 'best_title'],
    description: '偏 TOEFL：修辞目的、句子插入、词义、指代、证据定位。'
  },
  cet: {
    label: 'CET / 高考',
    count: 15,
    priority: ['main_idea', 'detail', 'inference', 'vocabulary_context', 'best_title', 'author_purpose', 'cause_effect', 'summary_writing', 'exam_short_answer', 'multi_select'],
    description: '偏 CET / 高考：主旨、细节、推理、词义、标题、短答和摘要。'
  },
  drill: {
    label: '题型专项',
    count: 12,
    description: '只练你选择的一类题型。适合专项突破。'
  }
};

const DRILL_TYPES = [
  ['tf_not_given', 'IELTS 判断题'],
  ['matching_headings', '段落标题匹配'],
  ['matching_information', '信息匹配题'],
  ['ielts_summary_completion', 'IELTS 摘要填空'],
  ['flow_chart_completion', '流程图填空'],
  ['sentence_insertion', '句子插入题'],
  ['rhetorical_purpose', '修辞目的题'],
  ['vocabulary_context', '上下文词义题'],
  ['reference_question', '指代题'],
  ['evidence_location', '证据定位题'],
  ['multi_select', '多选题'],
  ['summary_writing', '摘要写作题'],
  ['paraphrase', '改写题']
];

function getStudySettings() {
  try {
    return JSON.parse(localStorage.getItem(STUDY_STORE.settings)) || { mode: 'balanced', drillType: 'tf_not_given' };
  } catch {
    return { mode: 'balanced', drillType: 'tf_not_given' };
  }
}

function setStudySettings(settings) {
  localStorage.setItem(STUDY_STORE.settings, JSON.stringify(settings));
}

function installStudyTools() {
  createExamModePanel();
  createMistakePanel();
  renderMistakePanel();
}

function createExamModePanel() {
  if (document.getElementById('examModePanel')) return;
  const home = document.getElementById('homeView');
  const filterPanel = document.querySelector('.filter-panel');
  if (!home || !filterPanel) return;

  const settings = getStudySettings();
  const panel = document.createElement('section');
  panel.id = 'examModePanel';
  panel.className = 'panel exam-mode-panel';
  panel.innerHTML = `
    <div class="section-title-row">
      <div>
        <h2>考试训练模式</h2>
        <p id="examModeDescription">选择训练方向，系统会自动控制题型组合和题量。</p>
      </div>
    </div>
    <div class="exam-mode-grid">
      <label>训练模式
        <select id="examModeSelect">
          <option value="balanced">智能混合</option>
          <option value="ielts">IELTS Reading</option>
          <option value="toefl">TOEFL Reading</option>
          <option value="cet">CET / 高考</option>
          <option value="drill">题型专项</option>
        </select>
      </label>
      <label id="drillTypeWrap">专项题型
        <select id="drillTypeSelect"></select>
      </label>
    </div>
  `;

  filterPanel.parentNode.insertBefore(panel, filterPanel);
  const modeSelect = document.getElementById('examModeSelect');
  const drillSelect = document.getElementById('drillTypeSelect');
  modeSelect.value = settings.mode || 'balanced';
  DRILL_TYPES.forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    drillSelect.appendChild(option);
  });
  drillSelect.value = settings.drillType || 'tf_not_given';

  modeSelect.addEventListener('change', () => {
    const current = getStudySettings();
    setStudySettings({ ...current, mode: modeSelect.value });
    updateExamModeDescription();
  });
  drillSelect.addEventListener('change', () => {
    const current = getStudySettings();
    setStudySettings({ ...current, drillType: drillSelect.value });
    updateExamModeDescription();
  });
  updateExamModeDescription();
}

function updateExamModeDescription() {
  const settings = getStudySettings();
  const config = EXAM_MODE_CONFIG[settings.mode] || EXAM_MODE_CONFIG.balanced;
  const desc = document.getElementById('examModeDescription');
  const drillWrap = document.getElementById('drillTypeWrap');
  if (desc) desc.textContent = config.description;
  if (drillWrap) drillWrap.style.display = settings.mode === 'drill' ? 'block' : 'none';
}

function createMistakePanel() {
  if (document.getElementById('mistakePanel')) return;
  const history = document.querySelector('.history-panel');
  if (!history) return;
  const panel = document.createElement('section');
  panel.id = 'mistakePanel';
  panel.className = 'panel mistake-panel';
  panel.innerHTML = `
    <div class="section-title-row">
      <div>
        <h2>错题本</h2>
        <p id="mistakeSummary">自动保存未达标题目，方便按题型复盘。</p>
      </div>
      <div class="mistake-actions">
        <button id="exportMistakesBtn" class="ghost-btn">导出错题</button>
        <button id="clearMistakesBtn" class="danger-btn">清空错题</button>
      </div>
    </div>
    <div id="mistakeTypeStats" class="mistake-type-stats"></div>
    <div id="mistakeList" class="mistake-list"></div>
  `;
  history.parentNode.insertBefore(panel, history);
  document.getElementById('clearMistakesBtn').addEventListener('click', () => {
    localStorage.removeItem(STUDY_STORE.mistakes);
    renderMistakePanel();
  });
  document.getElementById('exportMistakesBtn').addEventListener('click', exportMistakes);
}

function readMistakes() {
  try {
    return JSON.parse(localStorage.getItem(STUDY_STORE.mistakes)) || [];
  } catch {
    return [];
  }
}

function writeMistakes(items) {
  localStorage.setItem(STUDY_STORE.mistakes, JSON.stringify(items.slice(0, 300)));
}

function saveMistakesFromResult(result) {
  const mistakes = readMistakes();
  const now = new Date().toISOString();
  const newItems = (result.details || [])
    .filter((detail) => detail.points < 1)
    .map((detail) => ({
      id: `${now}_${Math.random().toString(16).slice(2)}`,
      createdAt: now,
      passageTitle: result.title,
      level: result.level,
      type: detail.type,
      typeLabel: questionTypeLabel(detail.type),
      question: detail.question,
      user: detail.user,
      correct: detail.correct,
      explanation: detail.explanation,
      points: detail.points
    }));
  if (newItems.length) writeMistakes([...newItems, ...mistakes]);
}

function renderMistakePanel() {
  const list = document.getElementById('mistakeList');
  const summary = document.getElementById('mistakeSummary');
  const stats = document.getElementById('mistakeTypeStats');
  if (!list || !summary || !stats) return;
  const mistakes = readMistakes();
  summary.textContent = mistakes.length ? `当前保存 ${mistakes.length} 道错题。优先复盘出现次数最多的题型。` : '暂无错题。提交练习后，未达标题目会自动保存。';
  stats.textContent = '';
  list.textContent = '';

  const grouped = mistakes.reduce((acc, item) => {
    const label = item.typeLabel || questionTypeLabel(item.type);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([label, count]) => {
    const pill = document.createElement('span');
    pill.className = 'mistake-stat-pill';
    pill.textContent = `${label} ${count}`;
    stats.appendChild(pill);
  });

  mistakes.slice(0, 12).forEach((item) => {
    const card = document.createElement('article');
    card.className = 'mistake-card';
    card.innerHTML = `
      <div class="mistake-card-head">
        <span>${item.typeLabel || questionTypeLabel(item.type)}</span>
        <small>${new Date(item.createdAt).toLocaleString()}</small>
      </div>
      <h3>${escapeHtml(item.question)}</h3>
      <p><strong>文章：</strong>${escapeHtml(item.passageTitle || '')}</p>
      <p><strong>你的答案：</strong>${escapeHtml(item.user || '未答')}</p>
      <p><strong>参考答案：</strong>${escapeHtml(item.correct || '')}</p>
      <p><strong>解析：</strong>${escapeHtml(item.explanation || '暂无解析')}</p>
    `;
    list.appendChild(card);
  });
}

function exportMistakes() {
  const mistakes = readMistakes();
  const text = JSON.stringify(mistakes, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'english-reading-mistakes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

submitPractice = (function(originalSubmitPractice) {
  return function patchedSubmitPractice() {
    if (!app.current) return;
    stopTimer();
    const result = grade();
    saveMistakesFromResult(result);
    saveHistory(result);
    renderResult(result);
    renderHistory();
    renderMistakePanel();
    show('resultView');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
})(submitPractice);

selectPracticeQuestions = function selectPracticeQuestions(questions) {
  const settings = getStudySettings();
  const config = EXAM_MODE_CONFIG[settings.mode] || EXAM_MODE_CONFIG.balanced;
  const all = Array.isArray(questions) ? questions : [];
  const byType = new Map();
  all.forEach((q) => {
    const type = q.type || 'multiple_choice';
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type).push(q);
  });

  if (settings.mode === 'drill') {
    const bucket = byType.get(settings.drillType) || [];
    const selected = bucket.slice(0, config.count);
    if (selected.length) return selected;
  }

  const priority = config.priority || EXAM_TYPE_PRIORITY;
  const selected = [];
  priority.forEach((type) => {
    const bucket = byType.get(type) || [];
    if (bucket.length && selected.length < config.count) selected.push(bucket[0]);
  });
  all.forEach((q) => {
    if (selected.length < config.count && !selected.includes(q)) selected.push(q);
  });
  return selected;
};

openPassage = (function(originalOpenPassage) {
  return function patchedStudyOpenPassage(id) {
    originalOpenPassage(id);
    const p = app.current;
    if (!p) return;
    const settings = getStudySettings();
    const config = EXAM_MODE_CONFIG[settings.mode] || EXAM_MODE_CONFIG.balanced;
    const selected = selectPracticeQuestions(p.questions || []);
    document.getElementById('practiceMeta').textContent = `${p.topic || 'general'} · ${p.word_count || countWords(p.passage)} words · ${config.label} · 本次 ${selected.length} 题`;
    const note = document.getElementById('practiceModeNote');
    if (note) note.textContent = `${config.label}：${config.description}`;
  };
})(openPassage);

window.addEventListener('load', installStudyTools);
