renderQuestions = function renderQuestions(p) {
  const form = document.getElementById('questionForm');
  form.textContent = '';
  p.questions.forEach((q, index) => {
    const box = document.createElement('section');
    box.className = `question-card ${q.type || 'multiple_choice'}`;

    const type = document.createElement('span');
    type.className = 'question-type-pill';
    type.textContent = questionTypeLabel(q.type);
    const title = document.createElement('p');
    title.className = 'question-title';
    title.textContent = `${index + 1}. ${q.question}`;
    box.append(type, title);

    if (q.type === 'true_false') {
      ['True', 'False'].forEach((value) => box.appendChild(radioOption(q.id, value, value)));
    } else if (q.type === 'multi_select') {
      Object.entries(q.options || {}).forEach(([key, value]) => box.appendChild(checkboxOption(q.id, key, `${key}. ${value}`)));
      const hint = document.createElement('p');
      hint.className = 'question-hint';
      hint.textContent = '可多选。';
      box.appendChild(hint);
    } else if (q.type === 'matching' || q.type === 'matching_headings' || q.type === 'matching_information') {
      box.appendChild(renderMatching(q));
    } else if (q.type === 'ordering') {
      box.appendChild(renderOrdering(q));
    } else if (q.type === 'table_completion' || q.type === 'flow_chart_completion') {
      box.appendChild(renderTableCompletion(q));
    } else if (['fill_blank', 'summary_completion', 'reference', 'reference_question', 'ielts_summary_completion'].includes(q.type)) {
      const input = document.createElement('input');
      input.className = 'text-answer-input';
      input.name = `q_${q.id}`;
      input.placeholder = '输入答案';
      box.appendChild(input);
    } else if (['short_answer', 'evidence', 'application', 'keyword_extraction', 'summary_writing', 'paraphrase', 'exam_short_answer'].includes(q.type)) {
      const textarea = document.createElement('textarea');
      textarea.className = 'short-answer-input';
      textarea.name = `q_${q.id}`;
      textarea.placeholder = '用英文回答，系统会按关键词自动评分';
      box.appendChild(textarea);
    } else {
      Object.entries(q.options || {}).forEach(([key, value]) => box.appendChild(radioOption(q.id, key, `${key}. ${value}`)));
    }

    form.appendChild(box);
  });
};

function checkboxOption(questionId, value, labelText) {
  const label = document.createElement('label');
  label.className = 'option-label checkbox-label';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.name = `q_${questionId}`;
  input.value = value;
  const span = document.createElement('span');
  span.textContent = labelText;
  label.append(input, span);
  return label;
}

function renderMatching(q) {
  const wrap = document.createElement('div');
  wrap.className = 'matching-grid';
  (q.pairs || []).forEach((pair, index) => {
    const row = document.createElement('div');
    row.className = 'matching-row';
    const left = document.createElement('span');
    left.textContent = pair.left;
    const select = document.createElement('select');
    select.name = `q_${q.id}_${index}`;
    select.innerHTML = '<option value="">选择匹配项</option>';
    (q.choices || []).forEach((choice) => {
      const option = document.createElement('option');
      option.value = choice;
      option.textContent = choice;
      select.appendChild(option);
    });
    row.append(left, select);
    wrap.appendChild(row);
  });
  return wrap;
}

function renderOrdering(q) {
  const wrap = document.createElement('div');
  wrap.className = 'ordering-list';
  (q.items || []).forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'ordering-row';
    const text = document.createElement('span');
    text.textContent = item;
    const select = document.createElement('select');
    select.name = `q_${q.id}_${index}`;
    select.innerHTML = '<option value="">顺序</option>';
    (q.items || []).forEach((_, orderIndex) => {
      const option = document.createElement('option');
      option.value = String(orderIndex + 1);
      option.textContent = String(orderIndex + 1);
      select.appendChild(option);
    });
    row.append(text, select);
    wrap.appendChild(row);
  });
  return wrap;
}

function renderTableCompletion(q) {
  const table = document.createElement('div');
  table.className = 'completion-table';
  (q.blanks || []).forEach((blank, index) => {
    const row = document.createElement('div');
    row.className = 'completion-row';
    const label = document.createElement('label');
    label.textContent = blank.label;
    const input = document.createElement('input');
    input.name = `q_${q.id}_${index}`;
    input.placeholder = '填写短答案';
    row.append(label, input);
    table.appendChild(row);
  });
  return table;
}

getAnswer = function getAnswer(id, type) {
  if (type === 'multi_select') {
    return [...document.querySelectorAll(`input[name="q_${id}"]:checked`)].map((item) => item.value).sort();
  }
  if (['matching', 'matching_headings', 'matching_information', 'ordering', 'table_completion', 'flow_chart_completion'].includes(type)) {
    return [...document.querySelectorAll(`[name^="q_${id}_"]`)].map((item) => item.value.trim());
  }
  if (['fill_blank', 'short_answer', 'summary_completion', 'reference', 'evidence', 'application', 'keyword_extraction', 'summary_writing', 'paraphrase', 'reference_question', 'ielts_summary_completion', 'exam_short_answer'].includes(type)) {
    const field = document.querySelector(`[name="q_${id}"]`);
    return field ? field.value.trim() : '';
  }
  const checked = document.querySelector(`input[name="q_${id}"]:checked`);
  return checked ? checked.value : '';
};

gradeQuestion = function gradeQuestion(q) {
  const answer = getAnswer(q.id, q.type);
  let points = 0;
  let ok = false;
  let correct = q.correct_answer || '';

  if (q.type === 'multi_select') {
    const correctAnswers = (q.correct_answers || []).slice().sort();
    const userAnswers = Array.isArray(answer) ? answer : [];
    const matches = userAnswers.filter((item) => correctAnswers.includes(item)).length;
    const extras = userAnswers.filter((item) => !correctAnswers.includes(item)).length;
    points = Math.max(0, (matches - extras) / Math.max(1, correctAnswers.length));
    ok = points >= 1;
    correct = correctAnswers.join(', ');
  } else if (q.type === 'matching' || q.type === 'matching_headings' || q.type === 'matching_information') {
    const pairs = q.pairs || [];
    const user = Array.isArray(answer) ? answer : [];
    const matches = pairs.filter((pair, index) => normalizeText(user[index]) === normalizeText(pair.answer)).length;
    points = pairs.length ? matches / pairs.length : 0;
    ok = points >= 0.8;
    correct = pairs.map((pair) => `${pair.left}: ${pair.answer}`).join(' | ');
  } else if (q.type === 'ordering') {
    const correctOrder = q.correct_order || [];
    const user = Array.isArray(answer) ? answer.map((value) => Number(value) - 1) : [];
    const matches = correctOrder.filter((correctItemIndex, orderIndex) => user[correctItemIndex] === orderIndex).length;
    points = correctOrder.length ? matches / correctOrder.length : 0;
    ok = points >= 0.75;
    correct = correctOrder.map((itemIndex) => (q.items || [])[itemIndex]).join(' → ');
  } else if (q.type === 'table_completion' || q.type === 'flow_chart_completion') {
    const blanks = q.blanks || [];
    const user = Array.isArray(answer) ? answer : [];
    const matches = blanks.filter((blank, index) => (blank.accepted_answers || []).some((accepted) => normalizeText(user[index]).includes(normalizeText(accepted)))).length;
    points = blanks.length ? matches / blanks.length : 0;
    ok = points >= 0.66;
    correct = blanks.map((blank) => `${blank.label}: ${(blank.accepted_answers || []).join('/')}`).join(' | ');
  } else if (['fill_blank', 'summary_completion', 'reference', 'reference_question', 'ielts_summary_completion'].includes(q.type)) {
    const accepted = (q.accepted_answers || [q.correct_answer]).filter(Boolean);
    ok = accepted.some((item) => normalizeText(answer) === normalizeText(item) || normalizeText(answer).includes(normalizeText(item)));
    points = ok ? 1 : 0;
    correct = accepted.join(' / ');
  } else if (['short_answer', 'evidence', 'application', 'keyword_extraction', 'summary_writing', 'paraphrase', 'exam_short_answer'].includes(q.type)) {
    const keywords = q.accepted_keywords || [];
    const normalized = normalizeText(answer);
    const hits = keywords.filter((word) => normalized.includes(normalizeText(word))).length;
    points = keywords.length ? Math.min(1, hits / Math.min(3, keywords.length)) : (String(answer).length > 10 ? 0.6 : 0);
    ok = points >= 0.66;
    correct = q.sample_answer || 'Open answer with relevant keywords';
  } else {
    ok = normalizeText(answer) === normalizeText(q.correct_answer);
    points = ok ? 1 : 0;
  }

  const shownAnswer = Array.isArray(answer) ? answer.join(' / ') : (answer || '未答');
  return { question: q.question, type: q.type, user: shownAnswer, correct, explanation: q.explanation_cn || '', ok, points };
};

questionTypeLabel = function questionTypeLabel(type) {
  return {
    multiple_choice: '选择题',
    main_idea: '主旨题',
    detail: '细节题',
    inference: '推理题',
    vocabulary: '词义题',
    structure: '结构题',
    theme: '主题题',
    lesson: '启示题',
    true_false: '判断题',
    fill_blank: '填空题',
    short_answer: '简答题',
    best_title: '最佳标题题',
    author_purpose: '作者目的题',
    tone_attitude: '语气态度题',
    cause_effect: '因果关系题',
    sentence_function: '句子功能题',
    summary_completion: '摘要补全题',
    reference: '指代/主题题',
    evidence: '证据题',
    application: '应用迁移题',
    multi_select: '多选题',
    matching: '匹配题',
    ordering: '排序题',
    keyword_extraction: '关键词提取题',
    summary_writing: '摘要写作题',
    paraphrase: '改写题',
    table_completion: '表格填空题',
    tf_not_given: 'IELTS 判断题',
    yes_no_not_given: '观点判断题',
    matching_headings: '段落标题匹配',
    matching_information: '信息匹配题',
    sentence_insertion: '句子插入题',
    rhetorical_purpose: '修辞目的题',
    vocabulary_context: '上下文词义题',
    reference_question: '指代题',
    ielts_summary_completion: 'IELTS 摘要填空',
    flow_chart_completion: '流程图填空',
    exam_short_answer: '考试简答题',
    evidence_location: '证据定位题'
  }[type] || '综合题';
};
