// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { APIRoute } from 'astro';
import { Marked, type Token, type Tokens } from 'marked';
import path from 'node:path';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { siteConfig, rssConfig, weeklyConfig } from '@config/index';
import { i18n } from '@i18n';
import { weeklyIssueLabel, getSortedWeekly } from '@/utils/weekly';

// 构建期预载全部周刊正文图（getImage 只接受 import 的 ImageMetadata，
// 不能传文件路径；glob 静态分析拿到每个源图的 metadata 后走压缩管线）。
const weeklyImages = import.meta.glob('/src/content/weekly/**/*.{jpg,jpeg,png,webp,avif,gif,svg}', {
  eager: true,
}) as Record<string, { default: ImageMetadata }>;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 拆开 CDATA 结束序列，保留 HTML 内容并保持外层 XML 合法。 */
function wrapCdata(value: string): string {
  return `<![CDATA[${value.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

function formatRssDate(date: Date): string {
  return new Date(date).toUTCString();
}

function resolveCoverUrl(cover: { src: string } | string): string {
  if (typeof cover === 'string') {
    return cover.startsWith('http') ? cover : new URL(cover, siteConfig.site.url).toString();
  }
  return new URL(cover.src, siteConfig.site.url).toString();
}

// 正文图片：相对路径（./xxx/fig.jpg）→ 构建产物绝对 URL
// 源图在 src/content/，构建后只存在 _astro/ 哈希产物；
// 不转换则订阅器按相对路径请求 → 404 破图（封面经 image() 处理无此问题）。
const IMG_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;

async function buildBodyImageMap(body: string, postId: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const matches = [...body.matchAll(IMG_RE)];
  for (const m of matches) {
    const href = m[1];
    if (!href || /^(https?:|data:|\/)/.test(href)) continue;
    const absPath = path.resolve('src/content/weekly', path.dirname(`${postId}.md`), href);
    try {
      const globKey = '/' + path.relative(process.cwd(), absPath);
      const metadata = weeklyImages[globKey]?.default;
      if (!metadata) continue;
      const optimized = await getImage({
        src: metadata,
        format: siteConfig.images.format,
        quality: siteConfig.images.quality,
      });
      map.set(href, optimized.src);
    } catch (e) {
      // 单张解析失败保留原引用，不中断整个 feed 生成
      console.error(`[rss] getImage 失败: ${href} -> ${absPath}: ${(e as Error).message}`);
    }
  }
  return map;
}

// 已带 scheme（http: / mailto: / data: …）或协议相对的 URL，不再处理
const ABSOLUTE_URL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

// 正文链接与图片是同一条逻辑：相对 URL 在订阅器里不可靠——阅读器可能走代理或缓存，
// 基准 URI 一变就断链。图片由 makeImageRenderer 处理，链接靠这个 walkTokens 勾子。
// base 用**条目自身 URL** 而不是站点根：这样 #锚点、../x/ 这类也能正确解析
// （拿站点根当 base 会把 #锚点解到首页、把 ../x/ 解到错误层级）。
function makeAbsolutizeLinks(itemUrl: string) {
  return (token: Token) => {
    if (token.type === 'link' && typeof token.href === 'string' && !ABSOLUTE_URL_RE.test(token.href)) {
      token.href = new URL(token.href, itemUrl).toString();
    }
  };
}

function makeImageRenderer(imageMap: Map<string, string>) {
  return {
    image(token: Tokens.Image) {
      const href = token.href;
      const src = imageMap.get(href) ?? href;
      // http(s)/data 原样；其余（含 / 根相对与相对路径）统一按站点 URL 绝对化
      const abs = /^(https?:|data:)/.test(src) ? src : new URL(src, siteConfig.site.url).toString();
      const alt = escapeXml(token.text);
      const title = token.title ? ` title="${escapeXml(token.title)}"` : '';
      return `<img src="${escapeXml(abs)}" alt="${alt}"${title} />`;
    },
  };
}

export const GET: APIRoute = async () => {
  // RSS 是周刊的附属产物：周刊关闭时不生成 /rss.xml，避免空 feed 被访问或收录
  if (!weeklyConfig.enabled) {
    return new Response(null, {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const posts = await getSortedWeekly();

  const latestPosts = posts
    .filter((p) => p.data.date)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const siteUrl = siteConfig.site.url.replace(/\/?$/, '/');
  const feedUrl = new URL('/rss.xml', siteUrl).toString();
  const weeklyUrl = new URL('/weekly/', siteUrl).toString();
  const weeklySeo = siteConfig.site.seo.pages.weekly;
  const channelImageUrl = new URL(siteConfig.profile.avatar, siteUrl).toString();

  const itemsXml = await (async () => {
    const parts: string[] = [];
    for (const post of latestPosts) {
      const postUrl = new URL(`/weekly/${post.id}/`, siteUrl).toString();
      const issueText = weeklyIssueLabel(post.data.issue);
      const title = escapeXml(`${issueText} · ${post.data.title}`);
      const coverUrl = resolveCoverUrl(post.data.cover);
      const coverImg = `<img src="${escapeXml(coverUrl)}" alt="${escapeXml(post.data.title)}" />`;
      const readMoreLink = `<p><a href="${escapeXml(postUrl)}">${escapeXml(i18n.weekly.rssReadMore)}</a></p>`;
      const contentHtml =
        rssConfig.descriptionMode === 'full'
          ? (new Marked({
              renderer: makeImageRenderer(await buildBodyImageMap(post.body ?? '', post.id)),
              walkTokens: makeAbsolutizeLinks(postUrl),
            }).parse(post.body ?? '') as string)
          : `<p>${escapeXml(post.data.description)}</p>${readMoreLink}`;
      const description = wrapCdata(`${coverImg}${contentHtml}`);

      const pubDate = formatRssDate(post.data.date);
      // 作者只用 dc:creator（纯名字）——author 标签按 RSS 2.0 规范必须含邮箱，
      // 会公开暴露邮箱（爬虫可抓取）；dc:creator 同样被主流阅读器解析显示。
      const authorName = escapeXml(post.data.author ?? siteConfig.profile.name);
      const authorTag = `      <dc:creator>${authorName}</dc:creator>`;

      parts.push(
        [
          '    <item>',
          `      <title>${title}</title>`,
          `      <link>${postUrl}</link>`,
          `      <guid isPermaLink="true">${postUrl}</guid>`,
          `      <description>${description}</description>`,
          authorTag,
          `      <pubDate>${pubDate}</pubDate>`,
          '    </item>',
        ]
          .filter(Boolean)
          .join('\n')
      );
    }
    return parts.join('\n');
  })();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(weeklySeo.title)}</title>
    <link>${weeklyUrl}</link>
    <description>${escapeXml(weeklySeo.description)}</description>
    <image>
      <url>${escapeXml(channelImageUrl)}</url>
      <title>${escapeXml(siteConfig.site.name)}</title>
      <link>${siteUrl}</link>
    </image>
    <language>zh-CN</language>
    <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
