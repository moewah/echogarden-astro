// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

/** 通用分页工具。页码从 1 开始；page=1 对应列表首页，/page/N/ 从 N>=2 开始。 */

export interface Paginated<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export function paginate<T>(items: T[], perPage: number, page: number): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    totalPages,
    currentPage,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}

/** 为 /xxx/page/[page].astro 的 getStaticPaths 生成参数（仅生成第 2 页及以后）。 */
export function getPageParams(totalPages: number): { params: { page: string } }[] {
  if (totalPages <= 1) return [];
  return Array.from({ length: totalPages - 1 }, (_, index) => ({
    params: { page: String(index + 2) },
  }));
}

/** 生成带尾斜杠的绝对分页 URL。 */
export function pageUrl(siteUrl: string, basePath: string, page: number): string {
  const base = siteUrl.replace(/\/?$/, '/');
  const path = basePath.replace(/^\//, '').replace(/\/?$/, '');
  return page <= 1 ? `${base}${path}/` : `${base}${path}/page/${page}/`;
}
