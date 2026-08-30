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
}

export const GET: APIRoute = async () => {
  const siteUrl = siteConfig.site.url.replace(/\/?$/, '/');
  const today = new Date().toISOString().split('T')[0];

  const urls: SitemapUrl[] = [{ loc: `${siteUrl}`, priority: 1.0, changefreq: 'weekly' }];

  if (weeklyConfig.enabled) {
    urls.push({ loc: `${siteUrl}weekly/`, priority: 0.9, changefreq: 'weekly' });
    const posts = await getCollection('weekly');
    posts.forEach((post) => {
      urls.push({ loc: `${siteUrl}weekly/${post.id}/`, priority: 0.8, changefreq: 'monthly' });
    });
  }

  if (albumsConfig.enabled) {
    urls.push({ loc: `${siteUrl}photos/`, priority: 0.9, changefreq: 'weekly' });
    const albums = await getCollection('albums');
    albums.forEach((album) => {
      urls.push({ loc: `${siteUrl}photos/${album.id}/`, priority: 0.8, changefreq: 'monthly' });
    });
  }

  if (memosConfig.pageEnabled) {
    urls.push({ loc: `${siteUrl}moments/`, priority: 0.7, changefreq: 'daily' });
  }
  urls.push({ loc: `${siteUrl}guestbook/`, priority: 0.5, changefreq: 'monthly' });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
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
