window.PASSAGES = (window.PASSAGES || []).map((passage) => {
  const questions = Array.isArray(passage.questions) ? [...passage.questions] : [];
  const existingTypes = new Set(questions.map((q) => q.type));
  const topic = passage.topic || 'the passage';
  const title = passage.title || 'the passage';
  const keyword = String(topic).split(/\s+/).find((word) => word.length > 3) || String(topic);

  function nextId(type) {
    return `exam_${questions.length + 1}_${type}`;
  }

  function addOnce(type, question) {
    if (!existingTypes.has(type)) {
      questions.push({ id: nextId(type), type, ...question });
      existingTypes.add(type);
    }
  }

  addOnce('tf_not_given', {
    question: 'TRUE / FALSE / NOT GIVEN: The passage presents a practical situation and explains a result or lesson.',
    options: { A: 'TRUE', B: 'FALSE', C: 'NOT GIVEN' },
    correct_answer: 'A',
    explanation_cn: '这类题接近 IELTS 判断题。文章通常明确描述情境并给出结果或启示，因此为 TRUE。'
  });

  addOnce('yes_no_not_given', {
    question: 'YES / NO / NOT GIVEN: The writer would probably agree that careful action is better than ignoring a problem.',
    options: { A: 'YES', B: 'NO', C: 'NOT GIVEN' },
    correct_answer: 'A',
    explanation_cn: '这类题考查作者观点。文章整体倾向支持认真观察、清晰行动和解决问题。'
  });

  addOnce('matching_headings', {
    question: 'Match each paragraph function with the correct heading.',
    pairs: [
      { left: 'Paragraph 1', answer: 'The situation or problem is introduced' },
      { left: 'Middle paragraph', answer: 'A response or explanation is developed' },
      { left: 'Final paragraph', answer: 'A lesson or broader result is given' }
    ],
    choices: [
      'A lesson or broader result is given',
      'The situation or problem is introduced',
      'A response or explanation is developed',
      'An unrelated biography is listed'
    ],
    explanation_cn: 'Matching Headings 类似 IELTS 段落标题匹配题，考查段落功能和篇章结构。'
  });

  addOnce('matching_information', {
    question: 'Match the information with the correct part of the passage.',
    pairs: [
      { left: 'Background', answer: 'first part' },
      { left: 'Action or response', answer: 'middle part' },
      { left: 'Conclusion', answer: 'final part' }
    ],
    choices: ['first part', 'middle part', 'final part', 'not mentioned'],
    explanation_cn: 'Matching Information 考查信息定位能力。'
  });

  addOnce('sentence_insertion', {
    question: 'Where would this sentence best fit? “This change made the situation easier to understand.”',
    options: {
      A: 'After the problem is introduced',
      B: 'Before the passage begins',
      C: 'After an unrelated detail',
      D: 'Nowhere in the passage'
    },
    correct_answer: 'A',
    explanation_cn: '句子插入题接近 TOEFL 题型。该句承接问题并引出结果，适合放在问题提出之后。'
  });

  addOnce('rhetorical_purpose', {
    question: 'Why does the writer mention a practical response or solution?',
    options: {
      A: 'To show how the problem can be handled',
      B: 'To introduce a completely new topic',
      C: 'To make the passage less clear',
      D: 'To avoid giving a conclusion'
    },
    correct_answer: 'A',
    explanation_cn: 'Rhetorical Purpose 是 TOEFL 常见题型，考查作者为什么写某个信息。'
  });

  addOnce('vocabulary_context', {
    question: 'In this passage, the word “practical” is closest in meaning to:',
    options: {
      A: 'useful in real situations',
      B: 'impossible to apply',
      C: 'purely decorative',
      D: 'unrelated to the topic'
    },
    correct_answer: 'A',
    explanation_cn: '词义题考查上下文中的词义。practical 通常表示“实用的、现实中可用的”。'
  });

  addOnce('reference_question', {
    question: 'Reference question: The phrase “this situation” most likely refers to the main issue connected with ______.',
    accepted_answers: [String(topic), String(keyword)],
    correct_answer: String(topic),
    explanation_cn: '指代题考查代词或短语所指内容。此处应回到文章主话题。'
  });

  addOnce('ielts_summary_completion', {
    question: 'Complete the IELTS-style summary: The passage describes a problem related to ______ and explains how people respond to it.',
    accepted_answers: [String(topic), String(keyword)],
    correct_answer: String(topic),
    explanation_cn: 'IELTS 摘要填空要求根据文章主旨填写关键词。'
  });

  addOnce('flow_chart_completion', {
    question: 'Complete the flow chart with short answers.',
    blanks: [
      { label: 'Step 1: A ______ appears', accepted_answers: ['problem', 'situation', 'challenge'] },
      { label: 'Step 2: People choose a ______', accepted_answers: ['response', 'plan', 'solution', 'method'] },
      { label: 'Step 3: The passage gives a ______', accepted_answers: ['lesson', 'result', 'conclusion'] }
    ],
    explanation_cn: '流程图填空是 IELTS / 任务型阅读常见题型，考查事件发展顺序。'
  });

  addOnce('exam_short_answer', {
    question: 'Short-answer question: What is the main problem or situation in the passage? Answer in NO MORE THAN SIX WORDS.',
    accepted_keywords: [String(keyword).toLowerCase(), 'problem', 'situation', 'challenge', 'plan', 'response'],
    sample_answer: `${topic} problem or situation`,
    correct_answer: 'Open answer',
    explanation_cn: '考试型简答题要求短答案，系统按主题词和 problem / situation / challenge 等关键词给分。'
  });

  addOnce('evidence_location', {
    question: 'Evidence question: Which part of the passage best supports the main lesson?',
    options: {
      A: 'The part that describes the problem and response',
      B: 'Only the title, without reading the text',
      C: 'An unrelated imagined example',
      D: 'A detail not mentioned in the passage'
    },
    correct_answer: 'A',
    explanation_cn: '证据定位题考查哪一部分能支撑主旨或结论。'
  });

  return { ...passage, questions };
});
