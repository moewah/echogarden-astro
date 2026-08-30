// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { siteConfig } from '@config/index';
import { i18n } from '@i18n';

/** 周刊内容条目类型 */
export type WeeklyPost = CollectionEntry<'weekly'>;

/** 作者回退:frontmatter author → 站点主人(同影辑模式) */
export function weeklyAuthor(post: WeeklyPost): string {
  return post.data.author ?? siteConfig.profile.name;
}

/** 排序（新期在前）：优先 date 倒序，同天发布则按期号 issue 倒序兜底 */
export async function getSortedWeekly(): Promise<WeeklyPost[]> {
  const posts = await getCollection('weekly');
  return posts.sort((a, b) => {
    const diff = b.data.date.getTime() - a.data.date.getTime();
    if (diff !== 0) return diff;
    return b.data.issue.localeCompare(a.data.issue, undefined, { numeric: true });
  });
}

/** 期号展示文本:'26-001' → '第26-001期'(格式走 i18n,多语言化时只改文案) */
export function weeklyIssueLabel(issue: string): string {
  return i18n.weekly.issue.replace('{n}', issue);
}

/** 上一期(较旧)/下一期(较新);sorted 须为 date 倒序(同 getSortedWeekly 结果) */
export function adjacentWeekly(
  sorted: WeeklyPost[],
  currentId: string
): { prev: WeeklyPost | null; next: WeeklyPost | null } {
  const i = sorted.findIndex((p) => p.id === currentId);
  return {
    prev: i >= 0 && i < sorted.length - 1 ? sorted[i + 1] : null,
    next: i > 0 ? sorted[i - 1] : null,
  };
}
