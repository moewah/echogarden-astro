// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import { albumsConfig, weeklyConfig, remoteBlogConfig, projectsConfig } from '@config/index';
import { i18n } from '@i18n';

// 首页板块编号（SEC.NN）生成制：板块顺序是唯一事实，编号在构建时推导。
// 周刊（weekly）与外部博客 RSS（remoteBlog）是两个独立板块，各自开关、可同时存在：
// 周刊固定在高光影像之前；外部博客 RSS 在链接导航之后。关闭各自回收编号，不断档。
// 注意：NO. MW-2018-NNN 页面档案号是身份编号，不参与本顺延体系。
const ORDER = ['about', 'weekly', 'photos', 'remoteBlog', 'projects', 'links', 'sponsor'] as const;
type SectionKey = (typeof ORDER)[number];

const active = ORDER.filter((key) => {
  if (key === 'photos') return albumsConfig.enabled;
  if (key === 'weekly') return weeklyConfig.enabled;
  if (key === 'remoteBlog') return remoteBlogConfig.enabled;
  if (key === 'projects') return projectsConfig.enabled;
  return true;
});

// 类型上声明全键：关闭时对应值运行时为 undefined，
// 但彼时对应板块不渲染，不会被读取。
export const sectionNo: Record<SectionKey, string> = Object.fromEntries(
  active.map((key, i) => [key, `SEC.${String(i + 1).padStart(2, '0')}`])
) as Record<SectionKey, string>;

// hero 目录：与板块同序同源，开关联动过滤与重排。
export const heroNav = i18n.hero.nav
  .filter((item) => {
    if (item.href === '#photos') return albumsConfig.enabled;
    if (item.href === '#weekly') return weeklyConfig.enabled;
    if (item.href === '#remote-blog') return remoteBlogConfig.enabled;
    if (item.href === '#projects') return projectsConfig.enabled;
    return true;
  })
  .map((item, i) => ({ ...item, no: String(i + 1).padStart(3, '0') }));
