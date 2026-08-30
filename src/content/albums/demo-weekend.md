---
# —— 部分 frontmatter 示例 ——
# 本专辑演示「只填一部分可选字段」的常见写法：专辑级只填了 description / date / tags（author 缺省回退站点主人）；
# 照片级只有 title + src 必填，个别照片补充 caption。足够日常使用，想再加字段随时补。
title: 周末公园（示例·部分字段）
description: 演示「部分字段」如何填写的示例专辑：作者留空自动回退站点主人，部分照片补充了拍摄说明，其余保持精简。
date: 2026-09-05
tags: [示例, 公园, 周末]
photos:
  - title: 树影斑驳
    src: ./demo-weekend/park-01.jpg
    caption: 只给想说明的照片写 caption，其余保持干净。
    highlight: true
  - title: 湖边长椅
    src: ./demo-weekend/park-02.jpg
  - title: 小径尽头
    src: ./demo-weekend/park-03.jpg
  - title: 黄昏归途
    src: ./demo-weekend/park-04.jpg
    caption: 照片可以不带 location / tags / time，模板不会留空占位。
    highlight: true
---
