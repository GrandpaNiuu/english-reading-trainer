/* Virtual high-variety exam article factory.
   It does not store millions of static passages. It generates deterministic, varied exam passages on demand. */
(function () {
  const BANK_SIZE = 10000000;
  const STARTER_COUNT = 360;

  const domains = [
    ['cognitive science', 'memory consolidation', 'laboratory learning', 'researchers', 'controlled recall tasks'],
    ['environmental economics', 'wetland restoration', 'coastal policy', 'local governments', 'flood-risk models'],
    ['archaeology', 'ancient trade routes', 'material evidence', 'field teams', 'ceramic fragments'],
    ['public health', 'urban heat exposure', 'community resilience', 'city planners', 'hospital records'],
    ['technology ethics', 'algorithmic recommendation', 'digital behavior', 'platform designers', 'audit reports'],
    ['marine biology', 'coral adaptation', 'reef ecosystems', 'divers and biologists', 'temperature records'],
    ['education research', 'formative assessment', 'classroom feedback', 'teachers', 'student portfolios'],
    ['behavioral economics', 'decision fatigue', 'consumer choices', 'analysts', 'shopping experiments'],
    ['linguistics', 'bilingual code-switching', 'social identity', 'research participants', 'conversation transcripts'],
    ['urban planning', 'transit-oriented development', 'commuting patterns', 'transport agencies', 'ridership data'],
    ['medical history', 'early vaccination campaigns', 'public trust', 'physicians', 'newspaper archives'],
    ['astronomy', 'exoplanet detection', 'indirect measurement', 'observatories', 'light-curve data'],
    ['sociology', 'remote work networks', 'organizational culture', 'managers', 'communication logs'],
    ['ecology', 'invasive species management', 'habitat balance', 'conservation teams', 'population surveys'],
    ['art history', 'museum interpretation', 'visual symbolism', 'curators', 'restoration notes'],
    ['geology', 'river sediment records', 'climate reconstruction', 'geoscientists', 'core samples'],
    ['political science', 'civic participation', 'local representation', 'research institutes', 'survey panels'],
    ['psychology', 'attention restoration', 'natural environments', 'clinical researchers', 'attention tests'],
    ['business studies', 'supply-chain transparency', 'brand trust', 'firms', 'supplier audits'],
    ['agricultural science', 'drought-resistant crops', 'food security', 'farm cooperatives', 'field trials'],
    ['history of science', 'failed experiments', 'scientific progress', 'laboratories', 'research notebooks'],
    ['anthropology', 'ritual exchange', 'community obligation', 'ethnographers', 'oral accounts'],
    ['media studies', 'misinformation correction', 'public attention', 'journalists', 'reader-response data'],
    ['law and society', 'privacy regulation', 'institutional accountability', 'legal scholars', 'case summaries'],
    ['materials science', 'biodegradable packaging', 'industrial adoption', 'engineers', 'stress tests'],
    ['climate science', 'monsoon variability', 'regional forecasting', 'meteorologists', 'rainfall sequences'],
    ['neuroscience', 'sleep and learning', 'neural replay', 'research groups', 'brain-imaging results'],
    ['philosophy of technology', 'human agency', 'automated systems', 'theorists', 'design examples'],
    ['economics', 'informal labor markets', 'household income', 'policy researchers', 'interview samples'],
    ['literary studies', 'narrative perspective', 'reader interpretation', 'critics', 'close textual analysis']
  ];

  const structures = [
    'problem-solution', 'cause-effect', 'compare-contrast', 'claim-evidence', 'chronological development',
    'classification', 'debate-and-resolution', 'hypothesis-testing', 'case-study', 'process explanation'
  ];

  const levels = ['B1', 'B2', 'C1', 'IELTS', 'TOEFL'];
  const examTags = ['IELTS', 'TOEFL', 'CET', 'Gaokao', 'Cambridge', 'Academic'];

  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function hash(value) {
    const text = String(value || '');
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
  }

  function pick(list, random) {
    return list[Math.floor(random() * list.length) % list.length];
  }

  function titleCase(text) {
    return String(text).replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function wordCount(text) {
    return String(text).trim().split(/\s+/).filter(Boolean).length;
  }

  function sentenceBank(domain, concept, setting, actors, evidence, structure, random) {
    const nuance = pick(['tentative', 'controversial', 'gradual', 'uneven', 'measurable', 'unexpected', 'context-dependent', 'long-term'], random);
    const pressure = pick(['limited funding', 'public skepticism', 'incomplete data', 'institutional habits', 'regional inequality', 'rapid technological change', 'environmental uncertainty'], random);
    const method = pick(['comparative analysis', 'longitudinal observation', 'controlled trials', 'archival interpretation', 'field interviews', 'statistical modelling', 'case comparison'], random);
    const implication = pick(['policy design', 'public trust', 'resource allocation', 'ethical judgment', 'educational practice', 'long-term planning', 'risk communication'], random);
    return {
      intro: [
        `In recent discussions of ${domain}, the issue of ${concept} has become increasingly difficult to treat as a narrow technical problem.`,
        `Although ${concept} is often described in simple terms, recent work in ${setting} suggests a more layered picture.`,
        `Researchers studying ${domain} have begun to question whether familiar explanations of ${concept} are sufficient.`
      ],
      body1: [
        `The central difficulty is that ${actors} must interpret ${evidence} while also responding to ${pressure}.`,
        `Early accounts emphasized visible outcomes, but later ${method} showed that several hidden variables shaped the result.`,
        `This means that evidence cannot be read as a fixed answer; it has to be connected to timing, context, and competing priorities.`
      ],
      body2: [
        `One interpretation treats the pattern as a sign of failure, whereas another sees it as a ${nuance} adjustment to local conditions.`,
        `The contrast is important because it changes what counts as a successful intervention.`,
        `If the goal is merely efficiency, the solution appears straightforward; if the goal is ${implication}, the same evidence becomes more complicated.`
      ],
      body3: [
        `The passage therefore follows a ${structure} structure: it introduces a problem, weighs evidence, and then limits the conclusion.`,
        `Rather than presenting a dramatic discovery, it shows how careful reasoning can prevent an attractive but misleading explanation.`,
        `The broader lesson is that academic reading often requires attention to qualification, not only to facts.`
      ],
      conclusion: [
        `For this reason, ${concept} should be understood as a dynamic process rather than a single event.`,
        `The most defensible conclusion is not that one side is entirely correct, but that strong claims require evidence from more than one perspective.`,
        `Such a conclusion is typical of examination passages, where the reader must identify the writer's purpose, evidence, and limits.`
      ]
    };
  }

  function buildPassage(index, options = {}) {
    const random = rng(hash(`virtual_exam_${index}_${options.focus || ''}`));
    const domain = pick(domains, random);
    const structure = pick(structures, random);
    const level = options.level || pick(levels, random);
    const exam = options.exam || pick(examTags, random);
    const bank = sentenceBank(domain[0], domain[1], domain[2], domain[3], domain[4], structure, random);
    const paragraphs = [
      `${pick(bank.intro, random)} ${pick(bank.body1, random)}`,
      `${pick(bank.body2, random)} ${pick(bank.body2, random)}`,
      `${pick(bank.body3, random)} ${pick(bank.conclusion, random)}`
    ];
    if (level === 'C1' || level === 'IELTS' || level === 'TOEFL') {
      paragraphs.splice(2, 0, `${pick(bank.body1, random)} ${pick(bank.body3, random)}`);
    }
    const title = `${titleCase(domain[1])} and ${titleCase(pick(['Evidence', 'Public Response', 'Hidden Costs', 'Long-Term Change', 'Institutional Choice', 'Competing Explanations'], random))}`;
    const passage = paragraphs.join('\n\n');
    return {
      id: `virtual_exam_${String(index).padStart(7, '0')}`,
      title,
      level,
      topic: domain[0],
      source: 'virtual_exam_bank_10000000',
      quality: 'high_variety_virtual',
      exam_tag: exam,
      structure,
      word_count: wordCount(passage),
      passage,
      questions: buildQuestions(domain, title, structure)
    };
  }

  function buildQuestions(domain, title, structure) {
    const [topic, concept, setting, actors, evidence] = domain;
    return [
      {
        id: 1,
        type: 'main_idea',
        question: 'What is the main idea of the passage?',
        options: {
          A: `The passage explains why ${concept} requires careful interpretation of evidence.`,
          B: `The passage argues that ${topic} is unrelated to evidence.`,
          C: 'The passage is mainly a personal story with no argument.',
          D: 'The passage recommends ignoring context.'
        },
        correct_answer: 'A',
        explanation_cn: '文章主旨是说明某一学术问题需要结合证据、语境和限制条件来理解。'
      },
      {
        id: 2,
        type: 'detail',
        question: 'Which source of evidence is mentioned in the passage?',
        options: { A: evidence, B: 'a private diary about a holiday', C: 'a fictional advertisement', D: 'a sports schedule' },
        correct_answer: 'A',
        explanation_cn: `文章提到的证据来源是 ${evidence}。`
      },
      {
        id: 3,
        type: 'inference',
        question: 'What can be inferred about the writer’s view?',
        options: {
          A: 'The writer values cautious claims based on evidence.',
          B: 'The writer believes evidence is unnecessary.',
          C: 'The writer rejects all academic debate.',
          D: 'The writer thinks simple answers are always best.'
        },
        correct_answer: 'A',
        explanation_cn: '文章语气强调谨慎、证据和限定，因此作者重视基于证据的判断。'
      },
      {
        id: 4,
        type: 'structure',
        question: 'How is the passage mainly organized?',
        options: {
          A: `By using a ${structure} structure`,
          B: 'By listing unrelated names only',
          C: 'By presenting a poem without explanation',
          D: 'By avoiding any conclusion'
        },
        correct_answer: 'A',
        explanation_cn: `文章采用 ${structure} 的篇章结构。`
      },
      {
        id: 5,
        type: 'vocabulary_context',
        question: 'In the passage, “defensible” is closest in meaning to:',
        options: { A: 'supported by reasons', B: 'physically protected', C: 'easy to decorate', D: 'completely hidden' },
        correct_answer: 'A',
        explanation_cn: 'defensible 在学术语境中表示“有理由支持的、站得住脚的”。'
      },
      {
        id: 6,
        type: 'exam_short_answer',
        question: 'Short answer: What concept is mainly discussed? Answer in NO MORE THAN SIX WORDS.',
        accepted_keywords: String(concept).toLowerCase().split(/\s+/).concat(String(topic).toLowerCase().split(/\s+/)),
        sample_answer: concept,
        correct_answer: concept,
        explanation_cn: `核心概念是 ${concept}。`
      }
    ];
  }

  function generateBatch(count, offset = 0, options = {}) {
    const items = [];
    for (let i = 0; i < count; i += 1) items.push(buildPassage(offset + i, options));
    return items;
  }

  window.VIRTUAL_EXAM_BANK_SIZE = BANK_SIZE;
  window.buildVirtualExamPassage = buildPassage;
  window.generateVirtualExamBatch = generateBatch;

  const initial = generateBatch(STARTER_COUNT, 900000, { focus: 'starter' });
  window.PASSAGES = [...(window.PASSAGES || []), ...initial];
})();
