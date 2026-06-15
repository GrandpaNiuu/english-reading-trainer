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
- 支持 A1、A2、B1、B2、IELTS、TOEFL 等难度
- 按难度筛选文章
- 按标题、主题搜索文章
- 随机抽取文章
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
│   └── passages.js
├── icons/
│   └── icon.svg
└── docs/
    └── passage-format.md
```

## 如何部署成网站

### GitHub Pages 部署方式

1. 打开仓库 Settings。
2. 找到 Pages。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`。
5. Folder 选择 `/root`。
6. 保存。
7. 等待 GitHub Pages 生成网站地址。

部署后网站通常是：

```text
https://grandpaniuu.github.io/english-reading-trainer/
```

如果 GitHub Pages 还没启用，这个地址暂时打不开。需要先在 Settings 里打开 Pages。

## 如何增加大量文章

有两种方式。

### 方式一：直接编辑内置题库

打开：

```text
js/passages.js
```

继续往 `window.PASSAGES = [...]` 里面添加文章对象。

### 方式二：网站里导入 JSON

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

- 增加更多文章题库
- 增加错题本
- 增加词汇本
- 增加每日训练计划
- 增加排行榜
- 增加用户登录
- 接入 Supabase / Firebase 云数据库
- 接入后台管理页面，用来批量上传题库

## 注意

当前版本是前端网站。历史记录和导入的自定义题库保存在当前浏览器中。如果换手机、换浏览器或清除浏览器数据，历史记录会消失。
