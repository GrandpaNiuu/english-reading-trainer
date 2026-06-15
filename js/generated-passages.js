window.GENERATED_PASSAGES = (() => {
  const TARGET_COUNT = 10000;
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'IELTS', 'TOEFL'];
  const topics = [
    ['daily life', 'a morning routine', 'a student', 'a quiet kitchen', 'a small notebook'],
    ['school', 'a classroom project', 'a teacher', 'the school library', 'a shared poster'],
    ['travel', 'a weekend trip', 'a visitor', 'the train station', 'a city map'],
    ['work', 'a team meeting', 'a manager', 'a bright office', 'a new schedule'],
    ['technology', 'a useful app', 'a designer', 'a phone screen', 'an online lesson'],
    ['health', 'a walking habit', 'a doctor', 'a public park', 'a healthy lunch'],
    ['environment', 'a recycling program', 'a volunteer', 'a community center', 'a clean street'],
    ['business', 'a small market', 'a shop owner', 'a busy store', 'a customer list'],
    ['culture', 'a local festival', 'a musician', 'the town square', 'an old tradition'],
    ['science', 'a simple experiment', 'a student team', 'a laboratory table', 'a clear result'],
    ['sports', 'a training plan', 'a coach', 'a school field', 'a practice chart'],
    ['food', 'a cooking class', 'a young cook', 'a warm restaurant', 'a family recipe'],
    ['history', 'a museum visit', 'a guide', 'an old gallery', 'a stone tool'],
    ['finance', 'a saving plan', 'a bank worker', 'a small office', 'a monthly budget'],
    ['media', 'a news report', 'an editor', 'a radio room', 'a short interview'],
    ['art', 'a painting lesson', 'an artist', 'a studio wall', 'a color sketch'],
    ['music', 'a concert plan', 'a singer', 'a rehearsal room', 'a song list'],
    ['transport', 'a bus route change', 'a driver', 'a city road', 'a timetable'],
    ['community', 'a neighborhood meeting', 'a resident', 'a public hall', 'a notice board'],
    ['weather', 'a storm warning', 'a farmer', 'a village road', 'a radio message'],
    ['communication', 'a group discussion', 'a speaker', 'a meeting room', 'a written summary'],
    ['leadership', 'a new responsibility', 'a team leader', 'a project room', 'a weekly report'],
    ['education', 'a reading plan', 'a tutor', 'a study center', 'a vocabulary list'],
    ['animals', 'a pet care lesson', 'a child', 'an animal shelter', 'a feeding schedule'],
    ['urban life', 'a park design', 'a planner', 'a city neighborhood', 'a walking path'],
    ['rural life', 'a farm visit', 'a farmer', 'a quiet field', 'a water tank'],
    ['energy', 'a solar project', 'an engineer', 'a school roof', 'a power meter'],
    ['safety', 'a fire drill', 'a school officer', 'a classroom door', 'an emergency card'],
    ['shopping', 'a price comparison', 'a customer', 'a shopping street', 'a product label'],
    ['housing', 'a home repair plan', 'a builder', 'a small apartment', 'a window frame'],
    ['language', 'a speaking club', 'a learner', 'a language room', 'a phrase card'],
    ['career', 'a job interview', 'an applicant', 'a company office', 'a resume'],
    ['friendship', 'a shared problem', 'a friend', 'a school yard', 'a kind message'],
    ['family', 'a family decision', 'a parent', 'a living room', 'a weekly calendar'],
    ['law', 'a public rule', 'a local officer', 'a city office', 'a printed form'],
    ['medicine', 'a clinic visit', 'a nurse', 'a health center', 'a patient record'],
    ['psychology', 'a memory test', 'a researcher', 'a quiet room', 'a list of words'],
    ['global issues', 'an international project', 'a coordinator', 'a conference hall', 'a progress report'],
    ['innovation', 'a prototype test', 'an inventor', 'a workshop', 'a rough model'],
    ['ethics', 'a difficult choice', 'a committee member', 'a meeting table', 'a written rule']
  ];

  const angles = [
    'planning', 'problem solving', 'teamwork', 'habit building', 'public service',
    'risk management', 'resource use', 'fairness', 'communication', 'long-term change'
  ];

  function buildPassage(level, t, i) {
    const [topic, event, person, place, detail] = t;
    const angle = angles[i % angles.length];
    const day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i % 7];
    const number = (i % 9) + 2;

    if (level === 'A1') {
      return `${person} has ${event} on ${day}. The activity starts in ${place}. There is ${detail} on the table, and everyone looks at it carefully. ${person} writes ${number} new words and asks one simple question. The group talks about ${topic} in short sentences. The work is easy to understand, but it still needs care. After the activity, ${person} feels more confident. The main lesson is simple: small steps can make learning easier.`;
    }
    if (level === 'A2') {
      return `${person} joined ${event} on ${day}. At first, the activity looked ordinary, but it soon became useful. In ${place}, the group used ${detail} to understand a problem about ${topic}. Some people worked quickly, while others took notes and asked questions. The leader explained that ${angle} was more important than speed. By the end, the group had a clear answer and a simple plan for next time. ${person} learned that steady practice can make a difficult task easier.`;
    }
    if (level === 'B1') {
      return `${event} changed the way ${person} thought about ${topic}. The group met in ${place} and began with a practical question: how can a small action create a better result? They studied ${detail}, compared several choices, and discussed the advantages and disadvantages. One member wanted a faster solution, but another argued that careful ${angle} would prevent mistakes. After ${number * 5} minutes, the group agreed on a useful method. The experience showed that progress often comes from clear goals, shared responsibility, and regular review rather than from one dramatic decision.`;
    }
    if (level === 'B2') {
      return `Many people see ${event} as a minor activity, yet it can reveal larger patterns in ${topic}. When ${person} organized the work in ${place}, the first problem was not a lack of effort but a lack of coordination. ${detail} helped the team notice where time and attention were being wasted. Instead of blaming one person, they redesigned the process and tested a smaller version first. This approach reduced confusion and made the result easier to measure. The case suggests that improvement is rarely accidental; it usually depends on evidence, communication, and the willingness to adjust an initial plan.`;
    }
    if (level === 'C1') {
      return `${event} may appear straightforward, but its connection to ${topic} is more complex than many observers assume. In ${place}, ${person} examined how ${detail} influenced behavior, expectations, and long-term decisions. The first interpretation was attractive because it was simple, but it ignored several hidden constraints. A more careful analysis showed that convenience, cost, habit, trust, and ${angle} all shaped the final outcome. This does not mean that simple explanations are useless. Rather, it shows that effective judgment requires attention to context and an awareness of what the available evidence cannot fully prove.`;
    }
    if (level === 'IELTS') {
      return `In discussions of ${topic}, ${event} is often presented as an efficient solution to a familiar problem. The experience of ${person} in ${place}, however, suggests that the issue is not merely technical. ${detail} improved access and reduced some forms of waste, but it also created new questions about fairness, maintenance, and public participation. Supporters argued that the project offered immediate benefits, while critics warned that short-term success might hide long-term costs. A balanced view therefore requires more than measuring visible results. It must also consider who benefits, who is excluded, and whether the system can remain useful after the initial enthusiasm has disappeared.`;
    }
    return `Researchers and educators frequently use ${event} to illustrate a broader principle in ${topic}: outcomes are shaped by systems rather than isolated choices. In one case, ${person} observed activity in ${place} and used ${detail} to compare predicted behavior with actual behavior. The results were not entirely consistent with the original hypothesis. Instead of treating this as a failure, the team revised its assumptions and collected additional observations. The episode demonstrates why rigorous inquiry depends on transparency, replication, and the ability to revise conclusions. It also shows that practical decisions often improve when evidence is examined as part of a larger context rather than as a single data point.`;
  }

  function makeQuestions(t) {
    const [topic, event, person, place, detail] = t;
    return [
      { id: 1, question: 'What is the passage mainly about?', options: { A: `An activity or problem related to ${topic}`, B: 'A story about a sports prize', C: 'A recipe for a meal', D: 'A description of a holiday gift' }, correct_answer: 'A', explanation_cn: `文章主要围绕 ${topic} 相关的活动或问题展开。` },
      { id: 2, question: 'Where does the main activity take place?', options: { A: place, B: 'a large airport', C: 'a mountain hotel', D: 'a cinema' }, correct_answer: 'A', explanation_cn: `文章中明确提到主要场景是 ${place}。` },
      { id: 3, question: 'Which detail is mentioned in the passage?', options: { A: detail, B: 'a lost passport', C: 'a broken bicycle', D: 'a music prize' }, correct_answer: 'A', explanation_cn: `文中提到了 ${detail} 这个细节。` },
      { id: 4, question: 'What lesson can readers learn from the passage?', options: { A: 'Careful thinking and steady work can improve results', B: 'Fast choices are always best', C: 'People should avoid learning new things', D: 'Details never matter' }, correct_answer: 'A', explanation_cn: '文章强调清晰计划、持续行动、证据分析或认真沟通的重要性。' },
      { id: 5, question: 'Who is connected with the activity?', options: { A: person, B: 'a famous actor', C: 'a hotel owner', D: 'a police officer' }, correct_answer: 'A', explanation_cn: `文章中的主要人物是 ${person}。` }
    ];
  }

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function titleCase(text) {
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const passages = [];
  for (let i = 0; i < TARGET_COUNT; i += 1) {
    const level = levels[i % levels.length];
    const topic = topics[(i * 17 + Math.floor(i / levels.length)) % topics.length];
    const passage = buildPassage(level, topic, i);
    passages.push({
      id: `${level.toLowerCase()}_mass_${String(i + 1).padStart(5, '0')}`,
      title: `${titleCase(topic[0])}: Practice ${i + 1}`,
      level,
      topic: topic[0],
      source: 'original_generated_10000_bank',
      word_count: countWords(passage),
      passage,
      questions: makeQuestions(topic)
    });
  }

  return passages;
})();
