// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig, weeklyConfig, albumsConfig, memosConfig } from '@config/index';

interface SitemapUrl {
  loc: string;
  priority: number;
  changefreq: string;
  lastmod: string;
}

/**
 * frontmatter 日期是 date-only 写法（`2026-08-20`），z.coerce.date() 按 UTC 午夜解析，
 * 所以 toISOString 取到的就是原值。**不要**换成按本地时区格式化：本地时区会把
 * `2026-08-20T00:00Z` 显示成前一天。
 */
function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 构建日（本地时区）。只给没有内容日期的页面兜底用。
 * 不能用 toISOString：那是 UTC 日，本地 00:00–08:00 构建会写成前一天
 * （2026-10-11 02:56 构建曾把 25 条 lastmod 全写成 2026-10-10）。
 */
function buildDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 取一组 YYYY-MM-DD 里最新的一天；空数组返回 undefined。字典序即时间序。 */
function newest(dates: string[]): string | undefined {
  return dates.length > 0 ? [...dates].sort().at(-1) : undefined;
}

/**
 * lastmod 的语义是「这个页面的内容最后改了什么时候」，所以逐页取内容日期：
 *   内容页 → 自己的 date（周刊优先 updated）；列表页 → 其下内容里最新的一天。
 * 整站共用一个构建日会让每次重建都把全部 URL 刷成当天，爬虫会判定该字段不可信
 * 从而整站忽略它（那等于没有）。首页是多个板块拼出来的、构建即重排，动态页内容由运行时
 * 增量刷新改写，留言板内容不在构建里——这三处用构建日兜底；影辑不拿照片级 time 再立一套
 * 规则，沿用 AlbumList / albums.ts 的既有口径（专辑日期只看 `date`，缺了就是没日期）。
 */
export const GET: APIRoute = async () => {
  const siteUrl = siteConfig.site.url.replace(/\/?$/, '/');
  const today = buildDate();

  const posts = weeklyConfig.enabled ? await getCollection('weekly') : [];
  const albums = albumsConfig.enabled ? await getCollection('albums') : [];

  const postLastmods = posts.map((post) => isoDate(post.data.updated ?? post.data.date));
  const albumLastmods = albums.map((album) => (album.data.date ? isoDate(album.data.date) : today));

  const urls: SitemapUrl[] = [
    { loc: `${siteUrl}`, priority: 1.0, changefreq: 'weekly', lastmod: today },
  ];

  if (weeklyConfig.enabled) {
    urls.push({
      loc: `${siteUrl}weekly/`,
      priority: 0.9,
      changefreq: 'weekly',
      lastmod: newest(postLastmods) ?? today,
    });
    posts.forEach((post, i) => {
      urls.push({
        loc: `${siteUrl}weekly/${post.id}/`,
        priority: 0.8,
        changefreq: 'monthly',
        lastmod: postLastmods[i],
      });
    });
  }

  if (albumsConfig.enabled) {
    urls.push({
      loc: `${siteUrl}photos/`,
      priority: 0.9,
      changefreq: 'weekly',
      lastmod: newest(albumLastmods) ?? today,
    });
    albums.forEach((album, i) => {
      urls.push({
        loc: `${siteUrl}photos/${album.id}/`,
        priority: 0.8,
        changefreq: 'monthly',
        lastmod: albumLastmods[i],
      });
    });
  }

  if (memosConfig.pageEnabled) {
    // 动态页内容由运行时增量刷新改写，构建日只是兜底，不声称是内容日期
    urls.push({ loc: `${siteUrl}moments/`, priority: 0.7, changefreq: 'daily', lastmod: today });
  }
  urls.push({ loc: `${siteUrl}guestbook/`, priority: 0.5, changefreq: 'monthly', lastmod: today });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
