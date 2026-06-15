# English Reading Trainer

一个英语阅读理解题库训练网站，适合个人刷题使用。

## 当前版本

这是一个纯前端 Web App / PWA：

- 可以部署成网站
- 手机浏览器打开后接近 App 使用体验
- 支持安装到手机或电脑桌面
- 不需要 OpenAI API
- 不需要后端服务器
- 不需要数据库

## 已实现功能

- 内置英语阅读文章题库
- 已扩展到 10000 篇原创生成阅读文章
- 支持 A1、A2、B1、B2、C1、IELTS、TOEFL 等难度
- 支持 40 个主题方向，包括生活、学校、旅行、工作、科技、健康、环境、商业、文化、科学等
- 按难度筛选文章
- 按标题、主题搜索文章
- 随机抽取文章
- 首页分页加载，避免一次渲染 10000 张卡片导致手机卡顿
- 点击开始后自动计时
- 提交后自动停止计时
- 自动批改选择题
- 自动计算：
  - 总分
  - 正确率
  - 答对题数
  - 总用时
  - 阅读速度 WPM
- 显示每道题的正确答案和中文解析
- 保存历史练习记录
- 支持导入自定义题库 JSON
- 支持 PWA manifest 和 service worker 缓存

## 项目结构

```text
english-reading-trainer/
├── index.html
├── manifest.json
├── sw.js
├── .nojekyll
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── passages.js
│   ├── generated-passages.js
│   └── activate-generated-bank.js
├── icons/
│   └── icon.svg
└── docs/
    └── passage-format.md
```

## 10000 篇题库说明

`js/generated-passages.js` 会在浏览器端构建 10000 篇原创阅读理解文章。

每篇文章包含：

- 文章 ID
- 标题
- 难度
- 主题
- 英文文章正文
- 字数
- 5 道选择题
- 正确答案
- 中文解析

当前做法避免直接复制网上文章，降低版权风险。后续如果导入公开授权材料，应优先使用 public domain、Creative Commons 或明确授权的数据源。

## 如何部署成网站

### GitHub Pages 部署方式

1. 打开仓库 Settings。
2. 找到 Pages。
3. Source 选择 `GitHub Actions`。
4. 到 Actions 页面运行 `Static Pages`。
5. 等待部署完成。

部署后网站通常是：

```text
https://grandpaniuu.github.io/english-reading-trainer/
```

如果 GitHub Pages 还没启用，这个地址暂时打不开。需要先在 Settings 里打开 Pages。

## 如何继续增加文章

有三种方式。

### 方式一：继续扩展生成器

打开：

```text
js/generated-passages.js
```

调整：

```text
const TARGET_COUNT = 10000;
```

可以继续扩展到 20000、50000，但需要注意手机性能。

### 方式二：直接编辑人工精选题库

打开：

```text
js/passages.js
```

继续往 `window.PASSAGES = [...]` 里面添加高质量人工文章对象。

### 方式三：网站里导入 JSON

打开网站后点击“导入题库”，粘贴文章 JSON。

格式说明见：

```text
docs/passage-format.md
```

## 评分逻辑

当前综合评分采用：

```text
综合分 = 正确率得分 * 82% + 阅读速度得分 * 18%
```

阅读速度目标会根据难度调整，例如：

| 难度 | 目标 WPM |
|---|---:|
| A1 | 75 |
| A2 | 90 |
| B1 | 110 |
| B2 | 130 |
| C1 | 150 |
| IELTS | 160 |
| TOEFL | 170 |

## 后续可以升级

- 增加更高质量人工精选题库
- 增加错题本
- 增加词汇本
- 增加每日训练计划
- 增加排行榜
- 增加用户登录
- 接入 Supabase / Firebase 云数据库
- 接入后台管理页面，用来批量上传题库

## 注意

当前版本是前端网站。历史记录和导入的自定义题库保存在当前浏览器中。如果换手机、换浏览器或清除浏览器数据，历史记录会消失。
