const PRACTICE_LIMIT = 18;
const EXAM_TYPE_PRIORITY = [
  'tf_not_given',
  'yes_no_not_given',
  'matching_headings',
  'matching_information',
  'sentence_insertion',
  'rhetorical_purpose',
  'vocabulary_context',
  'reference_question',
  'ielts_summary_completion',
  'flow_chart_completion',
  'exam_short_answer',
  'evidence_location',
  'multi_select',
  'matching',
  'ordering',
  'table_completion',
  'summary_writing',
  'paraphrase',
  'main_idea',
  'detail',
  'inference'
];

function selectPracticeQuestions(questions) {
  const all = Array.isArray(questions) ? questions : [];
  const byType = new Map();
  all.forEach((q) => {
    const type = q.type || 'multiple_choice';
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type).push(q);
  });

  const selected = [];
  EXAM_TYPE_PRIORITY.forEach((type) => {
    const bucket = byType.get(type) || [];
    if (bucket.length && selected.length < PRACTICE_LIMIT) selected.push(bucket[0]);
  });

  all.forEach((q) => {
    if (selected.length < PRACTICE_LIMIT && !selected.includes(q)) selected.push(q);
  });

  return selected;
}

startPractice = function startPractice() {
  if (!app.current) return;
  app.currentQuestions = selectPracticeQuestions(app.current.questions);
  document.getElementById('preStartBox').classList.add('hidden');
  document.getElementById('readingBox').classList.remove('hidden');
  renderQuestions({ ...app.current, questions: app.currentQuestions });
  startTimer();
};

grade = function grade() {
  const p = app.current;
  const questions = app.currentQuestions || p.questions || [];
  const details = questions.map((q) => gradeQuestion(q));
  const earned = details.reduce((sum, item) => sum + item.points, 0);
  const total = details.length;
  const correctCount = details.filter((x) => x.ok).length;
  const accuracy = total ? Math.round((earned / total) * 100) : 0;
  const seconds = Math.max(1, app.elapsed);
  const words = p.word_count || countWords(p.passage);
  const wpm = Math.round(words / (seconds / 60));
  const timeScore = timeScoreFor(wpm, p.level);
  const score = Math.round(accuracy * 0.82 + timeScore * 0.18);
  return { title: p.title, level: p.level, correctCount, total, accuracy, seconds, words, wpm, score, details, createdAt: new Date().toISOString() };
};

openPassage = (function(originalOpenPassage) {
  return function patchedOpenPassage(id) {
    originalOpenPassage(id);
    app.currentQuestions = [];
    const p = app.current;
    if (p) {
      const selected = selectPracticeQuestions(p.questions || []);
      document.getElementById('practiceMeta').textContent = `${p.topic || 'general'} · ${p.word_count || countWords(p.passage)} words · 本次 ${selected.length} 题 · 考试型混合题组`;
      const preStart = document.getElementById('preStartBox');
      const noteId = 'practiceModeNote';
      let note = document.getElementById(noteId);
      if (!note) {
        note = document.createElement('p');
        note.id = noteId;
        note.className = 'practice-mode-note';
        preStart.insertBefore(note, preStart.querySelector('button'));
      }
      note.textContent = `系统会从完整题库中抽取 ${selected.length} 道考试型题目，覆盖判断、匹配、摘要填空、流程图、简答、证据定位等题型，避免单篇题量过载。`;
    }
  };
})(openPassage);
