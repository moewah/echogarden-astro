---
# —— 全量 frontmatter 示例 ——
# 本篇文章演示「所有可选字段都填上」的完整写法，以及正文里各类排版元素的效果。
# 新增周刊时复制本文件替换内容即可；`#` 开头的注释行可删除。
title: 发布你的第一篇周刊（示例·全量字段）
issue: '26-001'
slug: demo-first-post
description: 一篇演示「全部 frontmatter 字段 + 完整正文排版」的示例文章：包含多级标题、代码块、引用、列表与插图。照着这份模板替换内容，就能发布一篇格式完整的周刊。
author: 示例用户
tags: [示例, 教程, 入门]
cover: https://picsum.photos/seed/eg-post-01/1600/900
date: 2026-09-01
updated: 2026-09-10
---

## 这份 frontmatter 里有什么

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | 文章标题 |
| `issue` | ✅ | 期号，格式 `'26-001'`，展示为周刊编号 |
| `description` | ✅ | 摘要，索引页与分享卡片使用 |
| `slug` | ✅ | 决定 URL：`/weekly/{slug}/` |
| `cover` | ✅ | 封面，支持本地路径或远程 URL（本示例为远程占位图） |
| `date` | ✅ | 发布日期，用于排序 |
| `author` | 否 | 缺省回退站点主人 |
| `tags` | 否 | 分类标签 |
| `updated` | 否 | 更新日期 |

## 正文排版一览

### 代码块（带行号与高亮）

```bash
# 本地预览
npm run dev
# 生产构建
npm run build
```

### 引用

> 周刊的正文就是这个文件里 `---` 分隔线以下的部分，用标准 Markdown 书写。

### 列表

1. 复制本文件，重命名为 `{年月}-{slug}.md`
2. 替换 frontmatter 与正文
3. `npm run build` 验证通过后发布

### 正文插图（可选）

远程图直接写 URL，本地图放文章同名单目录后写相对路径：

![示例插图](https://picsum.photos/seed/eg-post-fig-01/1200/675)

## 发布检查清单

- [ ] frontmatter 六个必填字段齐全
- [ ] `slug` 保持英文且唯一
- [ ] 期号连续、不重复
- [ ] 构建通过、预览确认封面与正文正常
