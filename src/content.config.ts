// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// 影辑：一个 md = 一个专辑，frontmatter 装 photos 数组。
// 照片仅 title + src 必填，其余元数据可选，模板按行渲染（不填不占位）。
// src 双态：本地图（相对本 md 的路径，建议放同名单专辑目录）走构建压缩（siteConfig.images）；
// 远程 URL 字符串原样引用，不下载不压缩。
// 作者可选：照片级 → 专辑级 → 站点主人（siteConfig.profile.name）逐级回退，必有值。
// 散装照片归入 misc.md（固定 slug，索引置底）。
const albums = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/albums' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      author: z.string().optional(),
      date: z.coerce.date().optional(),
      tags: z.array(z.string()).optional(),
      photos: z
        .array(
          z.object({
            title: z.string(),
            src: z.union([image(), z.string()]),
            author: z.string().optional(),
            caption: z.string().optional(),
            time: z.coerce.date().optional(),
            location: z.string().optional(),
            note: z.string().optional(),
            tags: z.array(z.string()).optional(),
            highlight: z.boolean().optional(),
            cover: z.boolean().optional(),
          })
        )
        .min(1),
    }),
});

// 周刊：一个 md = 一期,frontmatter 装元数据。
// title 为纯标题;期号用 issue 字段(格式 '26-001',必填,展示文本由渲染层 i18n 生成)。
// description/cover/date/slug 必填;author/tags/updated 可选。
// slug：必填，frontmatter 显式控制 URL（/weekly/{slug}/）——URL 是契约，文件名只管管理。
// cover 双态同影辑:本地相对路径走构建压缩,远程 URL 原样。
const weekly = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/weekly',

  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      issue: z.string(),
      description: z.string(),
      slug: z.string(),
      // AI 辅助阅读按钮：默认启用（详情页始终渲染），不支持配置关闭。
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
      cover: z.union([image(), z.string()]),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
    }),
});

export const collections = { albums, weekly };
