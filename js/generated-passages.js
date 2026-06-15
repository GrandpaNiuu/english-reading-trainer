window.GENERATED_PASSAGES = (() => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'IELTS', 'TOEFL'];
  const topics = [
    ['daily life', 'a morning routine', 'homework', 'bus stop', 'small shop'],
    ['school', 'a classroom project', 'teacher', 'library card', 'science club'],
    ['travel', 'a weekend trip', 'station', 'city map', 'rainy afternoon'],
    ['work', 'a team meeting', 'manager', 'office plan', 'new schedule'],
    ['technology', 'a useful app', 'designer', 'phone screen', 'online lesson'],
    ['health', 'a walking habit', 'doctor', 'park path', 'healthy lunch'],
    ['environment', 'a recycling program', 'volunteer', 'community center', 'clean street'],
    ['business', 'a small market', 'seller', 'customer list', 'better service'],
    ['culture', 'a local festival', 'musician', 'town square', 'old tradition'],
    ['science', 'a simple experiment', 'student team', 'lab table', 'clear result']
  ];

  function levelText(level, t, i) {
    const [topic, event, person, place, detail] = t;
    if (level === 'A1') {
      return `${person} has ${event} today. The day starts in a quiet ${place}. Everyone looks at the ${detail} and talks in simple English. ${person} writes three new words in a notebook. The work is not hard, but it needs time. After lunch, the group reads a short note about ${topic}. They answer easy questions and check the answers together. At the end of the day, ${person} feels happy because the lesson is clear and useful.`;
    }
    if (level === 'A2') {
      return `${person} joined ${event} last week. At first, the activity seemed ordinary, but it became more useful than expected. In the ${place}, the group used the ${detail} to solve a small problem. Some people worked quickly, while others asked questions and took notes. The most important idea was connected to ${topic}. By the end, everyone understood that steady practice can make a difficult task easier. ${person} decided to try the same method again next month.`;
    }
    if (level === 'B1') {
      return `${event} changed the way ${person} thought about ${topic}. The group met in the ${place} and began with a simple question: how can a small action create a better result? They studied the ${detail}, compared different choices, and discussed the advantages and disadvantages. One student wanted a faster solution, but another argued that a careful plan would prevent mistakes. After thirty minutes, the group agreed on a practical method. The experience showed that progress often comes from clear goals, shared responsibility, and regular review rather than from one dramatic decision.`;
    }
    if (level === 'B2') {
      return `Many people see ${event} as a minor activity, yet it can reveal larger patterns in ${topic}. When ${person} organized the work in the ${place}, the first problem was not a lack of effort but a lack of coordination. The ${detail} helped the team notice where time was being wasted. Instead of blaming one person, they redesigned the process and tested a smaller version first. This approach reduced confusion and made the result easier to measure. The case suggests that improvement is rarely accidental; it usually depends on evidence, communication, and the willingness to adjust an initial plan.`;
    }
    if (level === 'C1') {
      return `${event} may appear straightforward, but its connection to ${topic} is more complex than many observers assume. In the ${place}, ${person} examined how the ${detail} influenced behavior, expectations, and long-term decisions. The first interpretation was attractive because it was simple, but it ignored several hidden constraints. A more careful analysis showed that convenience, cost, habit, and trust all shaped the final outcome. This does not mean that simple explanations are useless. Rather, it shows that effective judgment requires attention to context and an awareness of what the available evidence cannot fully prove.`;
    }
    if (level === 'IELTS') {
      return `In discussions of ${topic}, ${event} is often presented as an efficient solution to a familiar problem. The experience of ${person} in the ${place}, however, suggests that the issue is not merely technical. The ${detail} improved access and reduced some forms of waste, but it also created new questions about fairness, maintenance, and public participation. Supporters argued that the project offered immediate benefits, while critics warned that short-term success might hide long-term costs. A balanced view therefore requires more than measuring visible results. It must also consider who benefits, who is excluded, and whether the system can remain useful after the initial enthusiasm has disappeared.`;
    }
    return `Researchers and educators frequently use ${event} to illustrate a broader principle in ${topic}: outcomes are shaped by systems rather than isolated choices. In one case, ${person} observed activity in the ${place} and used the ${detail} to compare predicted behavior with actual behavior. The results were not entirely consistent with the original hypothesis. Instead of treating this as a failure, the team revised its assumptions and collected additional observations. The episode demonstrates why rigorous inquiry depends on transparency, replication, and the ability to revise conclusions. It also shows that practical decisions often improve when evidence is examined as part of a larger context rather than as a single data point.`;
  }

  function questions(level, t) {
    const [topic, event, person, place, detail] = t;
    return [
      {
        id: 1,
        question: 'What is the passage mainly about?',
        options: { A: `A problem or activity related to ${topic}`, B: 'A story about buying expensive clothes', C: 'A guide to cooking dinner', D: 'A sports competition result' },
        correct_answer: 'A',
        explanation_cn: `文章主要围绕 ${topic} 相关的事件或问题展开。`
      },
      {
        id: 2,
        question: 'Where does the main activity take place?',
        options: { A: place, B: 'an airport', C: 'a mountain village', D: 'a cinema' },
        correct_answer: 'A',
        explanation_cn: `文章中明确提到主要场景是 ${place}。`
      },
      {
        id: 3,
        question: `Which detail is mentioned in the passage?`,
        options: { A: detail, B: 'a lost passport', C: 'a broken bicycle', D: 'a music prize' },
        correct_answer: 'A',
        explanation_cn: `文中提到了 ${detail} 这个细节。`
      },
      {
        id: 4,
        question: 'What lesson can readers learn from the passage?',
        options: { A: 'Careful thinking and steady work can improve results', B: 'Fast choices are always best', C: 'People should avoid learning new things', D: 'Details never matter' },
        correct_answer: 'A',
        explanation_cn: '文章强调清晰计划、持续行动或认真分析的重要性。'
      },
      {
        id: 5,
        question: `Who is connected with the activity?`,
        options: { A: person, B: 'a famous actor', C: 'a police officer', D: 'a hotel owner' },
        correct_answer: 'A',
        explanation_cn: `文章中的主要人物是 ${person}。`
      }
    ];
  }

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  const passages = [];
  levels.forEach((level) => {
    topics.forEach((topic, index) => {
      for (let round = 1; round <= 3; round += 1) {
        const n = index * 3 + round;
        const passage = levelText(level, topic, n);
        const titleTopic = topic[0].replace(/\b\w/g, c => c.toUpperCase());
        passages.push({
          id: `${level.toLowerCase()}_gen_${String(n).padStart(3, '0')}`,
          title: `${titleTopic}: Practice ${n}`,
          level,
          topic: topic[0],
          source: 'original_generated',
          word_count: countWords(passage),
          passage,
          questions: questions(level, topic)
        });
      }
    });
  });
  return passages;
})();
