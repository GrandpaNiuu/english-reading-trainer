window.PASSAGES = (window.PASSAGES || []).map((passage) => {
  const questions = Array.isArray(passage.questions) ? [...passage.questions] : [];
  const existingTypes = new Set(questions.map((q) => q.type));
  const topic = passage.topic || 'the passage';
  const topicKeyword = String(topic).split(/\s+/).find((word) => word.length > 3) || String(topic);

  function nextId(type) {
    return `nc_${questions.length + 1}_${type}`;
  }

  function addOnce(type, question) {
    if (!existingTypes.has(type)) {
      questions.push({ id: nextId(type), type, ...question });
      existingTypes.add(type);
    }
  }

  addOnce('multi_select', {
    question: 'Select TWO ideas that are usually supported by the passage.',
    options: {
      A: 'A practical problem can be improved by a clear response.',
      B: 'The passage has no main idea.',
      C: 'Careful thinking or communication can help people understand the situation.',
      D: 'Details should always be ignored.'
    },
    correct_answers: ['A', 'C'],
    explanation_cn: '多选题要求选择两个正确观点。文章通常支持“实际问题可以改进”和“认真思考/沟通有帮助”。'
  });

  addOnce('matching', {
    question: 'Match each item with the correct description.',
    pairs: [
      { left: 'Main topic', answer: String(topic) },
      { left: 'Useful response', answer: 'clear plan or practical action' },
      { left: 'Final purpose', answer: 'lesson or result' }
    ],
    choices: [String(topic), 'lesson or result', 'clear plan or practical action', 'unrelated detail'],
    explanation_cn: '匹配题考查主题、应对方式和结论功能。'
  });

  addOnce('ordering', {
    question: 'Put the ideas in the most logical order according to the passage structure.',
    items: [
      'A problem or situation appears.',
      'People observe, discuss, or compare choices.',
      'A practical response is used.',
      'A lesson or result is explained.'
    ],
    correct_order: [0, 1, 2, 3],
    explanation_cn: '排序题考查文章结构：情境/问题 → 观察讨论 → 应对方法 → 结果启示。'
  });

  addOnce('keyword_extraction', {
    question: 'Write 2-4 keywords that best represent the passage.',
    accepted_keywords: [String(topicKeyword).toLowerCase(), 'problem', 'lesson', 'plan', 'communication', 'practice', 'result', 'improve'],
    sample_answer: `${topicKeyword}, problem, lesson, improve`,
    explanation_cn: '关键词题要求提取能概括文章的核心词。系统按关键词命中情况给分。'
  });

  addOnce('summary_writing', {
    question: 'Write a one-sentence summary of the passage in English.',
    accepted_keywords: [String(topicKeyword).toLowerCase(), 'problem', 'response', 'lesson', 'improve', 'practical', 'careful'],
    sample_answer: `The passage explains how a practical problem related to ${topic} can lead to a useful lesson.`,
    explanation_cn: '摘要题要求用一句英文概括文章，系统按主题词、problem、response、lesson 等关键词给分。'
  });

  addOnce('paraphrase', {
    question: 'Paraphrase this idea: “Small actions can improve a practical situation.”',
    accepted_keywords: ['small', 'action', 'improve', 'practical', 'situation', 'step', 'better', 'problem'],
    sample_answer: 'Simple steps can make a real problem easier to handle.',
    explanation_cn: '改写题不要求一模一样，表达 small actions、improve、practical situation 的意思即可。'
  });

  addOnce('table_completion', {
    question: 'Complete the table with short answers.',
    blanks: [
      { label: 'Topic', accepted_answers: [String(topic), String(topicKeyword)] },
      { label: 'Common problem type', accepted_answers: ['problem', 'situation', 'challenge'] },
      { label: 'Common result', accepted_answers: ['lesson', 'result', 'improvement', 'improve'] }
    ],
    explanation_cn: '表格填空题考查主题、问题类型和结果。'
  });

  return { ...passage, questions };
});
