window.MANUAL_PASSAGES = (() => {
  const TARGET_COUNT = 200;
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'IELTS', 'TOEFL'];
  const samples = [
    ['A Letter from the Future', 'communication', 'a student receives a message about how small choices affect future life', 'the student learns to plan instead of waiting for perfect conditions'],
    ['The Quiet Bus Stop', 'daily life', 'neighbors begin talking while waiting for a delayed bus', 'shared problems can create unexpected cooperation'],
    ['A Map in the Rain', 'travel', 'a traveler gets lost in a new city during a storm', 'asking clear questions is often better than guessing alone'],
    ['The Empty Notebook', 'learning', 'a learner buys a notebook but avoids using it for weeks', 'tools only help when people build habits around them'],
    ['The Last Table', 'business', 'a small cafe has only one table left during lunch', 'good service depends on fairness and calm decisions'],
    ['The Broken Clock', 'school', 'a classroom clock stops before an important exam', 'students discover that attention matters more than the clock'],
    ['The Green Roof', 'environment', 'a school plants vegetables on the roof', 'environmental projects work best when students share responsibility'],
    ['The Long Queue', 'public service', 'a clinic changes how people wait for appointments', 'simple organization can reduce stress'],
    ['A Different Kind of Homework', 'education', 'students interview older family members about childhood', 'learning can connect school subjects with real lives'],
    ['The Phone-Free Hour', 'technology', 'a family tries one hour each evening without phones', 'quiet time can improve conversation'],
    ['The Small Repair Shop', 'work', 'a repair shop owner teaches an assistant how to handle mistakes', 'honest explanation can build trust'],
    ['The Museum Ticket', 'culture', 'a child chooses one exhibit instead of rushing through all rooms', 'slow observation can lead to deeper learning'],
    ['The Weather Board', 'science', 'students record the weather for thirty days', 'patterns become clearer when data is collected regularly'],
    ['The Shared Garden', 'community', 'apartment residents create a small garden behind the building', 'community projects need rules as well as enthusiasm'],
    ['The Practice Room', 'music', 'a young musician records short daily practices', 'progress is easier to notice when it is measured'],
    ['The Lost Receipt', 'finance', 'a buyer learns why keeping receipts matters', 'small records can prevent large arguments'],
    ['The Volunteer Badge', 'community service', 'a new volunteer feels nervous on the first day', 'clear instructions help people contribute'],
    ['The Science Poster', 'science', 'a team presents an experiment with an unexpected result', 'uncertainty can be part of good science'],
    ['The Late Delivery', 'business', 'an online order arrives late before a birthday', 'communication can reduce disappointment'],
    ['The Library Window', 'reading', 'a reader chooses a book because of one sentence near a window', 'curiosity often begins with small details']
  ];

  function passageFor(level, sample, index) {
    const [title, topic, situation, lesson] = sample;
    const day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index % 7];
    const minutes = 10 + (index % 8) * 5;

    if (level === 'A1') {
      return `On ${day}, ${situation}. The people in the story have a simple problem. They talk, listen, and try one small idea. The idea does not fix everything at once, but it helps them understand the situation. After ${minutes} minutes, the problem feels easier. The lesson is clear: ${lesson}.`;
    }
    if (level === 'A2') {
      return `On ${day}, ${situation}. At first, the situation seems small and ordinary. However, one person notices that the problem will not disappear by itself. The group spends ${minutes} minutes discussing what to do. They choose a simple plan and test it carefully. The result is not perfect, but it is useful. The story shows that ${lesson}.`;
    }
    if (level === 'B1') {
      return `${title} is a short passage about ${topic}. In the passage, ${situation}. At first, the main character focuses on the most obvious problem. Later, the character understands that the real issue is connected to planning, communication, and patience. After ${minutes} minutes of discussion or observation, a practical answer appears. The passage suggests that ${lesson}. This idea can also apply to school, work, and daily life.`;
    }
    if (level === 'B2') {
      return `The passage titled ${title} explores a common situation in ${topic}: ${situation}. What makes the situation important is not the event itself, but the way people respond to it. A quick reaction might solve the visible problem, but a better response requires attention to causes, habits, and expectations. After considering several choices, the people involved find a more practical direction. The passage argues that ${lesson}. It also suggests that good judgment usually develops through reflection rather than through speed alone.`;
    }
    if (level === 'C1') {
      return `${title} presents an apparently ordinary event related to ${topic}: ${situation}. Beneath the surface, however, the passage examines how people interpret problems and decide what kind of response is appropriate. The central difficulty is not simply that something inconvenient happens, but that the people involved must decide whether to react quickly or think more carefully. The final lesson is that ${lesson}. In a broader sense, the passage shows how small social situations can reveal larger patterns of trust, attention, and responsibility.`;
    }
    if (level === 'IELTS') {
      return `In ${title}, the writer uses a specific example from ${topic} to discuss a wider issue: ${situation}. Although the event may appear minor, it raises questions about how people make decisions under pressure. The passage does not suggest that every problem needs a complex solution. Instead, it shows that simple solutions are most effective when they are based on observation and clear communication. The key point is that ${lesson}. This makes the passage relevant to broader discussions about personal development and social cooperation.`;
    }
    return `The passage ${title} uses a concrete case in ${topic} to examine the relationship between evidence, interpretation, and action. The case begins when ${situation}. The initial response is incomplete because it treats the problem as isolated. A more careful reading shows that the situation is shaped by expectations, available information, and the behavior of several people. The conclusion is that ${lesson}. For this reason, the passage can be read not only as a story, but also as a small argument about how people learn from ordinary experience.`;
  }

  function questions(sample) {
    const [title, topic, situation, lesson] = sample;
    return [
      {
        id: 1,
        type: 'main_idea',
        question: 'What is the main idea of the passage?',
        options: { A: `A situation in ${topic} teaches a practical lesson`, B: 'The passage only lists dates and numbers', C: 'The writer says problems should be ignored', D: 'The story is mainly about buying expensive gifts' },
        correct_answer: 'A',
        explanation_cn: `文章通过 ${topic} 场景说明一个实际经验或道理。`
      },
      {
        id: 2,
        type: 'detail',
        question: 'What happens in the passage?',
        options: { A: situation, B: 'A singer wins an international prize', C: 'A ship crosses the ocean', D: 'A family moves to another planet' },
        correct_answer: 'A',
        explanation_cn: `文章中的主要事件是：${situation}。`
      },
      {
        id: 3,
        type: 'inference',
        question: 'What can readers infer from the passage?',
        options: { A: 'Careful responses can improve ordinary situations', B: 'Fast decisions are always correct', C: 'Learning never requires effort', D: 'Communication is useless' },
        correct_answer: 'A',
        explanation_cn: '文章强调认真观察、沟通和实际应对的重要性。'
      },
      {
        id: 4,
        type: 'vocabulary',
        question: 'The word "practical" is closest in meaning to:',
        options: { A: 'useful in real life', B: 'impossible to use', C: 'very old', D: 'completely unrelated' },
        correct_answer: 'A',
        explanation_cn: 'practical 表示“实际有用的”。'
      },
      {
        id: 5,
        type: 'lesson',
        question: 'Which lesson best matches the passage?',
        options: { A: lesson, B: 'People should never ask questions', C: 'Small problems always disappear immediately', D: 'Only luck matters' },
        correct_answer: 'A',
        explanation_cn: `文章最符合的启示是：${lesson}。`
      },
      {
        id: 6,
        type: 'structure',
        question: 'How is the passage mainly developed?',
        options: { A: 'By presenting a situation and explaining a lesson', B: 'By listing unrelated words', C: 'By giving only a shopping list', D: 'By describing a sports score without comment' },
        correct_answer: 'A',
        explanation_cn: '文章一般是先给出具体情况，再总结经验。'
      }
    ];
  }

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  const passages = [];
  for (let i = 0; i < TARGET_COUNT; i += 1) {
    const sample = samples[(i * 3 + Math.floor(i / 4)) % samples.length];
    const level = levels[(i * 5 + Math.floor(i / 9)) % levels.length];
    const passage = passageFor(level, sample, i);
    passages.push({
      id: `manual_ext_${String(i + 1).padStart(4, '0')}`,
      title: `${sample[0]}: Manual Sample ${i + 1}`,
      level,
      topic: sample[1],
      source: 'manual_extended_bank',
      word_count: countWords(passage),
      passage,
      questions: questions(sample)
    });
  }

  return passages;
})();
