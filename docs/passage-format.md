# 题库 JSON 格式

网站支持导入单篇文章对象，或者导入文章数组。

## 单篇文章格式

```json
{
  "id": "b1_custom_001",
  "title": "A New Way to Study",
  "level": "B1",
  "topic": "learning",
  "word_count": 320,
  "passage": "English passage text here...",
  "questions": [
    {
      "id": 1,
      "question": "What is the main idea of the passage?",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correct_answer": "B",
      "explanation_cn": "中文解析。"
    }
  ]
}
```

## 多篇文章格式

```json
[
  {
    "id": "a1_custom_001",
    "title": "...",
    "level": "A1",
    "topic": "daily life",
    "word_count": 150,
    "passage": "...",
    "questions": []
  },
  {
    "id": "b2_custom_001",
    "title": "...",
    "level": "B2",
    "topic": "business",
    "word_count": 380,
    "passage": "...",
    "questions": []
  }
]
```

## 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 文章唯一 ID，不能重复。重复 ID 会覆盖旧文章。 |
| `title` | 是 | 英文文章标题。 |
| `level` | 是 | A1、A2、B1、B2、C1、IELTS、TOEFL。 |
| `topic` | 否 | 主题，用于搜索。 |
| `word_count` | 否 | 文章字数。不填时系统会自动估算。 |
| `passage` | 是 | 英文文章正文。 |
| `questions` | 是 | 题目数组。 |
| `correct_answer` | 是 | 标准答案，通常是 A/B/C/D。 |
| `explanation_cn` | 否 | 中文解析。 |

## 推荐题量

- A1/A2：每篇 5 题
- B1/B2：每篇 5-8 题
- IELTS/TOEFL：每篇 8-13 题
