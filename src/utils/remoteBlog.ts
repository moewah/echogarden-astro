// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

// 外部博客 RSS 拉取与解析：仅当 remoteBlogConfig.enabled 时调用。
// 拉取失败返回 null → 板块降级空态（方案 B：config 不存兜底数据），构建不炸。
import { remoteBlogConfig, type RemotePost } from '@config/index';

/** 反转义 RSS 里的 XML/HTML 实体 */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#x([\da-f]+);/gi, (match, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    })
    .replace(/&#(\d+);/g, (match, decimal: string) => {
      const codePoint = Number.parseInt(decimal, 10);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    });
}

const blockTags = new Set([
  'address', 'article', 'blockquote', 'br', 'div', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'li', 'ol', 'p', 'pre', 'section', 'tr', 'ul',
]);
const tagRe = /<\/?([a-z][a-z0-9-]*)(?:\s+(?:[^\s"'=<>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>]+))?))*\s*\/?>/gi;

/** 将 RSS 摘要统一转为纯文本，避免外部 HTML 破坏卡片结构。 */
function toPlainText(raw: string): string {
  const content = raw.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/i)?.[1] ?? raw;

  return content
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(tagRe, (_, tag: string) => (blockTags.has(tag.toLowerCase()) ? ' ' : ''))
    .replace(/\s+/g, ' ')
    .trim();
}

/** 提取单个标签内容（不含嵌套同名标签） */
function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = block.match(re);
  return m ? decodeEntities(m[1].trim()) : '';
}

/** "Fri, 07 Aug 2026 00:00:00 GMT" → "2026-08-07"，避免时区偏移 */
function formatDate(pubDate: string): string {
  const m = pubDate.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
  if (!m) return '';
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };
  const mon = months[m[2]];
  if (!mon) return '';
  return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`;
}

/** 轻量解析 RSS：只取 title/link/pubDate/description，跳过 content:encoded 全文 */
export async function fetchRemotePosts(): Promise<RemotePost[] | null> {
  const { feedUrl, poolSize } = remoteBlogConfig;
  let xml = '';
  let lastErr: unknown;
  // dev 模式快速失败（避免本地开发长时间白屏），生产环境保持原宽容度。
  const timeout = import.meta.env.DEV ? 3000 : 30000;
  const maxAttempts = import.meta.env.DEV ? 1 : 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(feedUrl, { signal: AbortSignal.timeout(timeout) });
      if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
      xml = await res.text();
      break;
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts - 1) {
        console.warn(`[remoteBlog] RSS 拉取第 ${attempt + 1} 次失败，重试中…`);
        await new Promise((r) => setTimeout(r, import.meta.env.DEV ? 500 : 1500));
      }
    }
  }
  if (!xml) {
    console.warn('[remoteBlog] RSS fetch failed:', lastErr);
    return null;
  }

  const items: RemotePost[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = itemRe.exec(xml)) !== null && i < poolSize) {
    const block = m[1];
    const title = extractTag(block, 'title');
    const url = extractTag(block, 'link');
    if (!title || !url) continue;
    i++;
    items.push({
      code: `MW-BLG-${String(i).padStart(3, '0')}`,
      title,
      description: toPlainText(extractTag(block, 'description')),
      date: formatDate(extractTag(block, 'pubDate')),
      url,
    });
  }
  return items;
}
