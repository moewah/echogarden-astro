// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import { i18n } from '@i18n';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** 根据 pathname 和页面标题生成面包屑（非首页使用） */
export function getBreadcrumbs(siteUrl: string, pathname: string, pageTitle?: string): BreadcrumbItem[] {
  const normalizedUrl = siteUrl.replace(/\/?$/, '/');
  const segments = pathname.split('/').filter(Boolean);

  const crumbs: BreadcrumbItem[] = [{ name: i18n.nav.home, url: normalizedUrl }];

  // 周刊详情页的父级是周刊列表
  if (segments[0] === 'weekly' && segments.length > 1) {
    crumbs.push({ name: i18n.sections.weeklyPage.title, url: `${normalizedUrl}weekly/` });
    if (pageTitle) {
      const cleanPath = pathname.replace(/^\//, '').replace(/\/$/, '');
      crumbs.push({ name: pageTitle, url: new URL(`${cleanPath}/`, normalizedUrl).toString() });
    }
    return crumbs;
  }

  const labelMap: Record<string, string> = {
    weekly: i18n.sections.weeklyPage.title,
    photos: i18n.sections.albums.title,
    moments: i18n.sections.moments.title,
    guestbook: i18n.sections.guestbook.title,
  };

  let currentPath = normalizedUrl;
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    currentPath += `${segment}/`;
    const name = isLast && pageTitle ? pageTitle : (labelMap[segment] ?? segment);
    crumbs.push({ name, url: currentPath });
  });

  return crumbs;
}
