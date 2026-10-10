---
# —— 最小 frontmatter 示例 ——
# 最快的发布姿势：专辑级只填 title + date，照片级只填 title + src，其余字段全部省略，模板自动处理缺省。
# date 在 schema 里是可选的（省略也能构建），但省略后 sitemap 里该专辑页的 lastmod 会退化成构建日，
# 并会把 /photos/ 列表页的 lastmod 一起拖成构建日——所以这里照填。
title: 随手拍（示例·最小字段）
date: 2026-09-03
photos:
  - title: 第一张
    src: ./demo-minimal/min-01.jpg
    highlight: true
  - title: 第二张
    src: ./demo-minimal/min-02.jpg
  - title: 第三张
    src: ./demo-minimal/min-03.jpg
  - title: 第四张
    src: ./demo-minimal/min-04.jpg
---
