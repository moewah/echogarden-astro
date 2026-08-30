// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

// 外部博客 RSS 拉取与解析：仅当 remoteBlogConfig.enabled 时调用。
// 拉取失败回退 config 内置静态数据，构建不炸。
import { remoteBlogConfig, type RemotePost } from '@config/index';

/** 反转义 RSS 里的 XML/HTML 实体 */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
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
      description: extractTag(block, 'description'),
      date: formatDate(extractTag(block, 'pubDate')),
      url,
    });
  }
  return items;
}
