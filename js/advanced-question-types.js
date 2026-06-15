window.PASSAGES = (window.PASSAGES || []).map((passage) => {
  const questions = Array.isArray(passage.questions) ? [...passage.questions] : [];
  const existingTypes = new Set(questions.map((q) => q.type));
  const topic = passage.topic || 'the passage';
  const title = passage.title || 'the passage';
  const keyword = String(topic).split(/\s+/).find((word) => word.length > 3) || topic;

  function nextId(type) {
    return `adv_${questions.length + 1}_${type}`;
  }

  function addOnce(type, question) {
    if (!existingTypes.has(type)) {
      questions.push({ id: nextId(type), type, ...question });
      existingTypes.add(type);
    }
  }

  addOnce('best_title', {
    question: 'Which title best fits the passage?',
    options: {
      A: title,
      B: 'A Completely Unrelated Story',
      C: 'A List of Random Facts',
      D: 'A Report with No Main Idea'
    },
    correct_answer: 'A',
    explanation_cn: '最佳标题应概括文章主题，原文章标题最贴合。'
  });

  addOnce('author_purpose', {
    question: 'What is the author’s main purpose?',
    options: {
      A: 'To explain a situation and show a useful lesson',
      B: 'To advertise a product only',
      C: 'To tell readers to ignore details',
      D: 'To give a weather forecast'
    },
    correct_answer: 'A',
    explanation_cn: '文章通常通过具体情境说明一个问题、结果或启示。'
  });

  addOnce('tone_attitude', {
    question: 'What is the tone of the passage?',
    options: {
      A: 'Calm and explanatory',
      B: 'Angry and insulting',
      C: 'Silly and meaningless',
      D: 'Completely uncertain'
    },
    correct_answer: 'A',
    explanation_cn: '文章语气以说明和分析为主，较客观平稳。'
  });

  addOnce('cause_effect', {
    question: 'Which cause-and-effect relationship best matches the passage?',
    options: {
      A: 'A problem is noticed, so people try a practical response',
      B: 'Nothing happens, so nobody learns anything',
      C: 'A person wins a prize, so the city disappears',
      D: 'The weather changes, so all facts become false'
    },
    correct_answer: 'A',
    explanation_cn: '文章常见结构是发现问题，然后采取应对方法并得到启示。'
  });

  addOnce('sentence_function', {
    question: 'What is the function of the final part of the passage?',
    options: {
      A: 'To give a conclusion or lesson',
      B: 'To introduce an unrelated character',
      C: 'To remove the main idea',
      D: 'To repeat the title only'
    },
    correct_answer: 'A',
    explanation_cn: '文章结尾通常用于总结经验、结果或启示。'
  });

  addOnce('summary_completion', {
    question: 'Complete the summary: The passage suggests that careful action can help people ______ a practical situation.',
    accepted_answers: ['improve', 'handle', 'solve', 'understand', 'manage'],
    correct_answer: 'improve / handle / solve / understand / manage',
    explanation_cn: '摘要补全题考查对文章核心意思的概括，填写 improve、handle、solve 等接近词均可。'
  });

  addOnce('reference', {
    question: `Fill in the blank: The passage is mainly related to the topic of ______.`,
    accepted_answers: [String(topic), String(keyword)],
    correct_answer: String(topic),
    explanation_cn: `文章主题是 ${topic}，填写主题词或核心关键词即可。`
  });

  addOnce('evidence', {
    question: 'Short answer: Write one detail from the passage that supports its main lesson.',
    accepted_keywords: ['problem', 'plan', 'lesson', 'result', 'careful', 'clear', 'practice', String(keyword).toLowerCase()],
    sample_answer: 'One supporting detail is that people notice a problem and then use a practical response to improve the situation.',
    correct_answer: 'Open answer',
    explanation_cn: '证据题需要从文章中找出能支持主旨的细节。系统按关键词给分。'
  });

  addOnce('application', {
    question: 'How could the main lesson of the passage be used in real life?',
    accepted_keywords: ['plan', 'communicate', 'practice', 'careful', 'improve', 'solve', 'problem', 'habit'],
    sample_answer: 'People can use the lesson by planning carefully, communicating clearly, and improving small problems step by step.',
    correct_answer: 'Open answer',
    explanation_cn: '应用题要求把文章启示迁移到现实场景，回答中包含计划、沟通、实践、改进等关键词即可。'
  });

  return { ...passage, questions };
});
