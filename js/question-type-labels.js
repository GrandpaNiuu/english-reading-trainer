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
    application: '应用迁移题'
  }[type] || '综合题';
};
