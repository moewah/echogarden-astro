// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { APIRoute } from 'astro';
import { siteConfig } from '@config/index';

export const GET: APIRoute = () => {
  const siteUrl = siteConfig.site.url.replace(/\/?$/, '/');
  const body = `User-agent: *
Allow: /
Disallow: /404.html

Sitemap: ${siteUrl}sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
