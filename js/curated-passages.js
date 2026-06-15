window.CURATED_PASSAGES = (() => {
  const TARGET_COUNT = 500;

  const cases = [
    ['remote work', 'a software company tested a hybrid schedule', 'employees saved commuting time but missed informal conversations', 'clear office days and written meeting notes improved teamwork', 'workplace change'],
    ['urban parks', 'a city redesigned a neglected riverside park', 'local residents wanted safety as much as beauty', 'lighting, benches, and community input increased regular use', 'public health'],
    ['school libraries', 'a school turned its library into a study and skills center', 'some students needed quiet space while others needed digital support', 'separate zones helped the library serve different learners', 'education'],
    ['recycling', 'a neighborhood started a recycling program', 'participation was low because the rules were confusing', 'simple signs and weekly reminders improved sorting habits', 'environment'],
    ['small business', 'a bakery changed its ordering system', 'customers disliked long waiting times during busy mornings', 'pre-order forms and a limited menu made service faster', 'business'],
    ['language learning', 'a learner created a daily speaking routine', 'long study sessions were difficult to maintain', 'short daily practice built confidence over time', 'learning strategy'],
    ['public transport', 'a town adjusted its bus timetable', 'workers and students had different travel needs', 'survey data helped planners choose better departure times', 'transport'],
    ['digital privacy', 'a school introduced an online learning platform', 'families worried about how student data would be used', 'clear privacy rules increased trust', 'technology'],
    ['healthy habits', 'a clinic promoted walking groups', 'patients found individual exercise boring', 'social support made the habit easier to continue', 'health'],
    ['museum learning', 'a museum replaced long labels with interactive exhibits', 'visitors often skipped detailed explanations', 'short questions encouraged closer observation', 'culture'],
    ['food waste', 'a restaurant measured its kitchen waste', 'staff were surprised by how much food was discarded', 'smaller preparation batches reduced waste', 'sustainability'],
    ['science class', 'students repeated an experiment after unexpected results', 'the first result did not match their prediction', 'checking the method helped them understand measurement error', 'science'],
    ['community safety', 'residents organized an emergency drill', 'many people did not know where to meet after an alarm', 'a shared plan reduced confusion', 'safety'],
    ['financial planning', 'a young worker tracked monthly spending', 'small daily purchases created a large total cost', 'a simple budget helped set realistic saving goals', 'finance'],
    ['media literacy', 'a class compared two news reports about the same event', 'the reports emphasized different details', 'students learned to check sources and language choices', 'media'],
    ['career skills', 'a job applicant practiced interviews with a mentor', 'good qualifications did not guarantee clear communication', 'specific examples made answers stronger', 'career'],
    ['renewable energy', 'a school installed solar panels', 'the first goal was to reduce electricity costs', 'students also used the project to study energy data', 'energy'],
    ['team leadership', 'a project leader changed how tasks were assigned', 'the original plan gave too much work to a few people', 'smaller roles made responsibility clearer', 'leadership'],
    ['online shopping', 'customers reviewed product labels more carefully', 'low prices sometimes hid poor quality', 'comparison and return policies helped better decisions', 'consumer behavior'],
    ['animal care', 'a shelter introduced a volunteer training program', 'new volunteers wanted to help but lacked experience', 'clear instructions improved animal care and safety', 'community service']
  ];

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'IELTS', 'TOEFL'];

  function passageFor(level, item, index) {
    const [topic, situation, challenge, solution, theme] = item;
    const cycle = (index % 6) + 1;

    if (level === 'A1') {
      return `This passage is about ${topic}. In the story, ${situation}. There is one main problem: ${challenge}. People talk about the problem and try a simple idea. The idea is this: ${solution}. The change is small, but it helps. The people learn that clear plans and steady work can make daily life better. This is a useful lesson for school, work, and home.`;
    }
    if (level === 'A2') {
      return `The topic of this passage is ${topic}. At first, ${situation}. The activity seemed easy, but the group soon noticed a problem. The problem was that ${challenge}. Instead of stopping, they looked for a practical answer. Their answer was that ${solution}. After several days, the result became easier to see. The passage shows that improvement does not always need a big change. Sometimes a clear rule, a better habit, or a small plan can solve a real problem.`;
    }
    if (level === 'B1') {
      return `${topic} became important when ${situation}. At the beginning, people focused only on the most visible part of the issue. Later, they realized that ${challenge}. This made the problem more complicated than it first appeared. The group compared different choices and finally found that ${solution}. The result was not perfect, but it was practical and easier to repeat. The passage suggests that useful change often depends on observation, communication, and a willingness to adjust a first idea.`;
    }
    if (level === 'B2') {
      return `A case involving ${topic} shows how ordinary decisions can have wider effects. When ${situation}, the first response was to look for a quick solution. However, the main difficulty was that ${challenge}. A quick answer would probably have treated the symptom rather than the cause. The more effective response was that ${solution}. This mattered because the new approach could be explained, measured, and repeated. The case illustrates a general principle in ${theme}: durable improvement usually depends on understanding behavior, not simply forcing people to follow instructions.`;
    }
    if (level === 'C1') {
      return `${topic} is often discussed as if it were a simple matter of preference or efficiency, yet this case shows a more complex pattern. When ${situation}, observers initially paid attention to immediate outcomes. Over time, however, it became clear that ${challenge}. The eventual response was that ${solution}. What makes the example significant is not that it produced a perfect solution, but that it revealed the relationship between design, trust, and repeated behavior. In this sense, the case offers a broader lesson about ${theme}: effective systems must fit the people who are expected to use them.`;
    }
    if (level === 'IELTS') {
      return `In recent debates about ${topic}, practical examples are valuable because they show how policies and habits operate in real life. One such example occurred when ${situation}. Although the initial aim was straightforward, the main obstacle was that ${challenge}. The response was to create a more structured approach: ${solution}. This example demonstrates that successful change requires more than a good intention. It also requires attention to incentives, communication, and the needs of different groups. For this reason, the case is relevant to the broader issue of ${theme}, where visible success can hide unresolved questions about access, fairness, and long-term maintenance.`;
    }
    return `The example of ${topic} provides a useful framework for examining how evidence changes decision-making. In the case described, ${situation}. The initial interpretation was incomplete because ${challenge}. Rather than treating the problem as a failure of individual effort, the participants revised the system itself: ${solution}. This distinction is important. A narrow explanation would focus on isolated mistakes, whereas a stronger explanation considers incentives, information flow, and institutional design. The case therefore illustrates a key idea in ${theme}: reliable conclusions emerge when decision makers test assumptions against actual behavior and remain willing to modify their approach.`;
  }

  function questions(item, index) {
    const [topic, situation, challenge, solution, theme] = item;
    return [
      {
        id: 1,
        type: 'main_idea',
        question: 'What is the main purpose of the passage?',
        options: { A: `To explain a practical case related to ${topic}`, B: 'To describe a holiday tradition only', C: 'To list random facts without a conclusion', D: 'To argue that planning is never useful' },
        correct_answer: 'A',
        explanation_cn: `文章通过一个案例说明 ${topic} 相关的问题和解决办法。`
      },
      {
        id: 2,
        type: 'detail',
        question: 'What problem or difficulty is described?',
        options: { A: 'There was no problem at all', B: challenge, C: 'Everyone already agreed on the answer', D: 'The activity was cancelled immediately' },
        correct_answer: 'B',
        explanation_cn: `文中指出的核心困难是：${challenge}。`
      },
      {
        id: 3,
        type: 'detail',
        question: 'What response or solution was used?',
        options: { A: 'People ignored the situation', B: 'The group copied an unrelated plan', C: solution, D: 'The problem was hidden from others' },
        correct_answer: 'C',
        explanation_cn: `文章中的解决方式是：${solution}。`
      },
      {
        id: 4,
        type: 'inference',
        question: 'What can be inferred from the passage?',
        options: { A: 'Small systems can affect behavior', B: 'Only expensive changes can work', C: 'Evidence is never useful', D: 'Communication makes every problem worse' },
        correct_answer: 'A',
        explanation_cn: '文章反复强调制度、计划、沟通和实际行为之间的关系。'
      },
      {
        id: 5,
        type: 'vocabulary',
        question: 'In the passage, the word "practical" is closest in meaning to:',
        options: { A: 'impossible', B: 'useful in real situations', C: 'purely imaginary', D: 'unrelated' },
        correct_answer: 'B',
        explanation_cn: 'practical 在这里表示“实用的、能在现实中使用的”。'
      },
      {
        id: 6,
        type: 'structure',
        question: 'How is the passage mainly organized?',
        options: { A: 'Problem → response → broader lesson', B: 'Alphabetical list only', C: 'Conversation with no topic', D: 'Weather report followed by a recipe' },
        correct_answer: 'A',
        explanation_cn: '文章结构通常是先提出问题，再说明应对方法，最后总结启示。'
      },
      {
        id: 7,
        type: 'theme',
        question: 'Which theme best matches the passage?',
        options: { A: 'Random entertainment', B: theme, C: 'Ancient mythology only', D: 'Personal fashion' },
        correct_answer: 'B',
        explanation_cn: `文章主题与 ${theme} 最匹配。`
      }
    ];
  }

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function titleCase(text) {
    return text.replace(/\b\w/g, c => c.toUpperCase());
  }

  const passages = [];
  for (let i = 0; i < TARGET_COUNT; i += 1) {
    const item = cases[(i * 7 + Math.floor(i / 3)) % cases.length];
    const level = levels[(i * 5 + Math.floor(i / 11)) % levels.length];
    const passage = passageFor(level, item, i);
    const [topic, , , , theme] = item;
    passages.push({
      id: `curated_${String(i + 1).padStart(4, '0')}`,
      title: `${titleCase(topic)}: Curated Practice ${i + 1}`,
      level,
      topic,
      source: 'original_curated_500_bank',
      quality: 'curated_generated',
      word_count: countWords(passage),
      passage,
      questions: questions(item, i)
    });
  }

  return passages;
})();
