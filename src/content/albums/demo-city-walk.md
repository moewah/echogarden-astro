---
# —— 全量 frontmatter 示例 ——
# 本专辑演示「所有可选字段都填上」的完整写法：专辑级 5 个字段 + 照片级全部字段。
# 新增专辑时复制本文件，替换为真实内容即可；`#` 开头的注释行可整体删除。
title: 城市漫步（示例·全量字段）
description: 这是演示「全部字段」如何填写的示例专辑：description 为专辑简介（索引页展示）；author 若不填会自动回退到站点主人；照片级字段 title 与 src 必填，其余（caption / location / tags / time / cover / highlight）可选。
author: 示例用户
date: 2026-09-01
tags: [示例, 城市, 街拍]
photos:
  - title: 老街晨光
    src: ./demo-city-walk/walk-01.jpg
    caption: cover 与 highlight 都填 true 的照片，会作为专辑封面并进入首页高光轮播（需开启背景高光）。
    location: 示例城市 · 老城区
    tags: [晨光, 老街]
    time: 2026-08-20
    cover: true
    highlight: true
  - title: 转角书店
    src: ./demo-city-walk/walk-02.jpg
    caption: 每张照片都可以有自己的拍摄地点、标签与时间。
    location: 示例城市 · 书巷
    tags: [书店, 街角]
    time: 2026-08-20
    highlight: true
  - title: 午后电车
    src: ./demo-city-walk/walk-03.jpg
    location: 示例城市 · 滨江路
    tags: [电车, 午后]
    time: 2026-08-21
  - title: 天台晚霞
    src: ./demo-city-walk/walk-04.jpg
    caption: 不带 location 也没关系，模板按行渲染、缺省不占位。
    tags: [晚霞, 天台]
    time: 2026-08-21
    highlight: true
  - title: 夜灯初上
    src: ./demo-city-walk/walk-05.jpg
    location: 示例城市 · 河畔
    time: 2026-08-21
---

## 这份 frontmatter 怎么读

- **专辑级字段**：`title`（必填）、`description` / `author` / `date` / `tags`（可选）。`author` 缺省时自动回退到 `siteConfig.profile.name`。
- **照片级字段**：`title` + `src` 必填，`src` 支持两种填法——本地相对路径（走构建压缩）或远程 URL（原样引用，本示例用的是稳定的占位图服务）。
- **封面与高光**：专辑第一张设置 `cover: true` 用作封面；`highlight: true` 的照片会进入首页背景高光轮播。
- **正文部分**（本段）：可选，写与不写都会正常渲染。
