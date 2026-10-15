// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

// Memos API 契约与渲染管线（开发级，用户勿动）。
// 行为契约：API 参数（CEL filter）、响应字段映射、附件 URL 拼法、markdown 渲染。
// 用户级配置（地址 / tag 白名单 / 凭据读取）见 @config/memos。

import { Marked, lexer, type Tokens } from 'marked';
import { toHtml } from 'hast-util-to-html';
import { createCssVariablesTheme, createHighlighter, type BundledLanguage, type Highlighter } from 'shiki';
import { externalLinksConfig, siteConfig } from '@config/index';
import { memosConfig } from '@config/memosConfig';
import { externalLinkAttrs } from '@/utils/externalLinks';
import { checkServiceVersion, type ServiceVersionStatus } from '@/utils/serviceVersion';

const shikiTheme = createCssVariablesTheme({ variablePrefix: '--astro-code-' });
let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    langs: ['plaintext'],
    themes: [shikiTheme],
  });
  return highlighterPromise;
}

async function highlightCode(code: string, language = ''): Promise<string> {
  const highlighter = await getHighlighter();
  let resolvedLanguage = language.trim() || 'plaintext';

  if (resolvedLanguage !== 'plaintext') {
    try {
      await highlighter.loadLanguage(resolvedLanguage as BundledLanguage);
    } catch {
      resolvedLanguage = 'plaintext';
    }
  }

  const tree = highlighter.codeToHast(code, {
    lang: resolvedLanguage as BundledLanguage,
    theme: shikiTheme,
  });
  const pre = tree.children[0];
  if (pre?.type !== 'element') return '';
  const codeNode = pre.children.find(
    (child) => child.type === 'element' && child.tagName === 'code'
  );
  if (!codeNode || codeNode.type !== 'element') return '';
  return toHtml({ type: 'root', children: codeNode.children });
}

/**
 * 每条 memo 的渲染上下文。
 * 渲染器按 memo 现建（而不是共用单例）：灯箱分组与「首图优先」都是这一条 memo 的属性，
 * 而 Marked 的 renderer.options 是共享可变状态，并发渲染会串味。
 */
interface MemoRenderContext {
  /** 灯箱分组：正文内联图与附件图墙同组，翻页不跨卡片 */
  uid: string;
  /** 这条 memo 的首张正文图优先加载（列表首图 LCP，判定见 renderMemoItems） */
  priority: boolean;
}

/**
 * Memos 资源路径（`/file/...`，Memos 新版编辑器插图产出 `/file/attachments/{uid}`）
 * 在站内是死链，补实例域名才是可访问的附件地址。
 * 只认 `/file/` 前缀：本站无该路由，而站内绝对路径（如作者在正文里写的 `/weekly/xxx/`）
 * 是作者的本站链接，不能改写到实例域名下；外链原样返回。
 */
const absolutizeMemosFileUrl = (href: string): string =>
  href.startsWith('/file/') && memosConfig.auth.siteUrl
    ? `${memosConfig.auth.siteUrl}${href}`
    : href;

/**
 * 只把「真实链接」渲染成 <a>：带 scheme（http/https/mailto…）/ 站内绝对路径 / 页内锚点。
 * 其余（相对路径）在站内必然是 404：marked 会把引用定义 `[^1]: 内容` 解析成
 * href="内容"，一条谁也点不到的死链。这类目标退化为纯文本。
 */
const isRealLink = (href: string): boolean =>
  href.startsWith('/') || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href);

function createMarkdown(ctx: MemoRenderContext): Marked {
  let imageCount = 0;
  return new Marked({
    async: true,
    // 单换行 = <br>（GFM 语义）。Memos 上游为此专门加了 remark-breaks
    // （usememos/memos 5a16f80），作者在编辑器里看到的断行必须与站内一致；
    // 不开这个开关，两行文本会被当作软换行合并成一句。
    breaks: true,
    renderer: {
      // 纵深防御：marked v5+ 的 escapeHTML 选项已失效，raw HTML 默认透传；
      // 覆盖 renderer.html 把作者手写的原始 HTML 转义为文本，防止外部服务
      // 被入侵时向本站注入可执行内容（同源 innerHTML 执行面）。
      // 转义后的产物仍是「源码」：包一层 .memo-raw（见 global.css）。
      // 不包的话它是匿名文本节点，命不中 `> * + *` 的段距节奏，间距忽宽忽窄。
      html(token) {
        const isBlock = typeof token !== 'string' && token.block === true;
        const raw = typeof token === 'string' ? token : token.text || '';
        // 块级 token 的 raw 带尾随换行，pre-wrap 下会多出一行高度
        const text = escapeHtml(isBlock ? raw.trim() : raw);
        return isBlock ? `<p class="memo-raw">${text}</p>` : `<span class="memo-raw">${text}</span>`;
      },
      link(token) {
        const text = this.parser.parseInline(token.tokens);
        const target = absolutizeMemosFileUrl(token.href);
        if (!isRealLink(target)) return text;
        let href: string;
        try {
          href = encodeURI(target).replace(/%25/g, '%');
        } catch {
          return text;
        }
        const attrs = externalLinkAttrs(target, siteConfig.site.url, externalLinksConfig);
        const attrText = Object.entries(attrs)
          .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`)
          .join('');
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        return `<a href="${href}"${title}${attrText}>${text}</a>`;
      },
      image(token) {
        let href: string;
        try {
          href = escapeHtml(encodeURI(absolutizeMemosFileUrl(token.href)).replace(/%25/g, '%'));
        } catch {
          return escapeHtml(token.text || '');
        }
        const alt = escapeHtml(token.text || '');
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        // 首图优先：只给这条 memo 的第一张正文图（与附件图墙首图同一口径）
        const eager = ctx.priority && imageCount++ === 0;
        const loading = eager ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
        const group = ctx.uid ? ` data-lightbox-group="${escapeHtml(ctx.uid)}"` : '';
        return `<span class="memo-content-img img-ph img-ph--memo"><img src="${href}" alt="${alt}"${loading} decoding="async" data-lightbox-trigger${group}${title}></span>`;
      },
      code(token) {
        const language = token.lang || 'plaintext';
        const dataLanguage = language.replace(/[^a-zA-Z0-9_+-]/g, '');
        return `<pre class="astro-code css-variables" style="background-color:var(--astro-code-background);color:var(--astro-code-foreground); overflow-x: auto;" tabindex="0" data-language="${dataLanguage}"><code>${token.text}\n</code></pre>`;
      },
    },
    walkTokens(token) {
      if (token.type !== 'code') return;
      return highlightCode(token.text, token.lang).then((highlighted) => {
        token.text = highlighted;
        token.escaped = true;
      });
    },
  });
}

export interface Memo {
  /** 唯一标识（同步 diff / 卡片 data-uid 用，不渲染） */
  uid: string;
  /** 长文折叠：预估行数超过阈值（`memosConfig.display.fold`）时为 true，卡片据此渲染
   *  折叠开关与裁剪层。只是视觉裁剪——content 始终是完整正文。不渲染、不进结构化数据。 */
  collapsible?: boolean;
  /** 更新时间 RFC3339（同步 diff 用，不渲染） */
  updateTime: string;
  /** 展示日期 YYYY.MM.DD（createTime 的本地时区派生值） */
  date: string;
  /** 命中白名单的全部 tag（一条 memo 可多分类；卡片多胶囊渲染，不再降维成单个） */
  tags: string[];
  content: string;
  /** 图片附件全集（正文内联引用的也在内）：结构化数据 image 与首图优先加载的判定口径 */
  images?: string[];
  /** 附件图墙渲染列表：正文已内联展示的图片按 uid 剔除，同一张图不出现两次 */
  gallery?: string[];
  /** 非图片附件（视频/音频/文件），展示层降级渲染，不再静默丢弃 */
  media?: MemoMedia[];
  /** 创建时间 RFC3339（卡片 data-time 排序用，不渲染） */
  createTime: string;
}

/** 非图片附件：type 由附件 MIME 前缀派生，url 走 Memos 附件契约 */
export interface MemoMedia {
  type: 'video' | 'audio' | 'file';
  url: string;
  filename: string;
}

/** ListMemos 响应中本项目用到的字段（契约形状） */
export interface RawMemo {
  /** v0.30 标识字段：形如 "memos/xxx"（uid 由此派生，见 fetchMemoPage 归一化） */
  name?: string;
  uid: string;
  createTime: string;
  updateTime: string;
  visibility?: string;
  tags?: string[];
  content: string;
  attachments?: Array<{ name: string; filename: string; type?: string }>;
}

// 拉取窗口：先拉足够多条公开 memo，再按白名单 tag 过滤（tag 过滤后数量大幅减少，不能先截断）
const FETCH_PAGE_SIZE = 200;

/** createTime/updateTime（RFC3339）→ 卡片日期 YYYY.MM.DD（本地时区）。卡片与 LAST SYNCED 共用。 */
export function formatMemoDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/**
 * 渲染后的 memo HTML → 结构化数据使用的纯文本。
 * 保留段落/列表/代码块换行，避免把完整正文以 HTML 形式塞进 JSON-LD。
 */
export function memoStructuredText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|pre|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 正文 tag 清理规则：只认「行首或空白之后 + 白名单 tag + 后接非词字符」的完整 token。
 * 旧实现是无差别全局替换 `#[^\s#]+`，会吃掉代码块里的 `#!/usr/bin/env bash`、
 * 行内代码里的 `#fff` / `#pragma once`、以及链接里的 `#anchor`。
 * 未知局限：代码块内出现的白名单 tag 仍会被删（不做围栏状态机，收益不抵复杂度）。
 */
const memoTagPattern = (tags: readonly string[]): RegExp =>
  new RegExp(
    `(?<=^|\\s)#(?:${tags
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})(?![\\p{L}\\p{N}_#])`,
    'gmu'
  );

// 移除正文中的 #标签（标签已在正文上方单独展示，避免重复）
const stripMemoTags = (md: string, tagPattern: RegExp): string =>
  md.replace(tagPattern, '').replace(/\n{3,}/g, '\n\n');

// 渲染 Markdown → HTML（构建时，内容来自自有 Memos）
const renderMarkdown = (md: string, ctx: MemoRenderContext): Promise<string> =>
  createMarkdown(ctx).parse(md) as Promise<string>;

/** ListMemos 单页响应（含分页游标） */
interface MemoPage {
  memos: RawMemo[];
  nextPageToken?: string;
}

/** 拉取单页公开 memo（带 PAT）。客户端兜底过滤 visibility：CEL filter 失效时绝不把私密 memo 交给上层。 */
async function fetchMemoPage(
  siteUrl: string,
  token: string,
  pageToken?: string
): Promise<MemoPage> {
  const url = new URL('/api/v1/memos', siteUrl);
  url.searchParams.set('pageSize', String(FETCH_PAGE_SIZE));
  // v0.30 起 visibility 查询参数被忽略，改用 CEL filter
  url.searchParams.set('filter', 'visibility == "PUBLIC"');
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  // dev 模式加超时避免本地开发长时间白屏；生产环境保持原宽容度（无超时）。
  // token 为空（Memos 开匿名读）时不带 Authorization 头，避免空 Bearer 被实例拒绝。
  const fetchOptions: RequestInit = {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
  if (import.meta.env.DEV) fetchOptions.signal = AbortSignal.timeout(3000);
  const res = await fetch(url.toString(), fetchOptions);
  if (!res.ok) throw new Error(`Memos API ${res.status}`);
  const data = (await res.json()) as { memos?: RawMemo[]; nextPageToken?: string };
  // 归一化：v0.30 无 uid 字段，唯一标识在 name（"memos/xxx"），提取尾部作 uid
  const normalize = (m: RawMemo): RawMemo => ({
    ...m,
    uid: m.uid || (m.name || '').split('/').pop() || '',
  });
  return {
    memos: (data.memos || []).filter((m) => m.visibility === 'PUBLIC').map(normalize),
    nextPageToken: data.nextPageToken || undefined,
  };
}

/**
 * 拉取公开 memo 列表（/moments/ 构建时用，取第一页足够）。
 * 失败抛错由调用方降级。
 */
export async function fetchMemoList(
  siteUrl: string,
  token: string,
  pageSize = FETCH_PAGE_SIZE
): Promise<RawMemo[]> {
  const { memos } = await fetchMemoPage(siteUrl, token);
  return memos.slice(0, pageSize);
}

/** 拉取全量公开 memo（分页循环；供增量同步 diff 使用，需覆盖上次展示集合）。
 *  防御上限 20 页 × 200 条 = 4000 条（防 API 异常时死循环）；
 *  超限时展示集合可能不完整，快照中超出范围的 uid 会被判为 removed（删除）——
 *  单用户自托管远达不到，仅作保险，不为此增加复杂度。 */
const MAX_MEMO_PAGES = 20;

async function fetchAllMemos(siteUrl: string, token: string): Promise<RawMemo[]> {
  const all: RawMemo[] = [];
  let pageToken: string | undefined;
  for (let i = 0; i < MAX_MEMO_PAGES; i++) {
    const { memos, nextPageToken } = await fetchMemoPage(siteUrl, token, pageToken);
    all.push(...memos);
    if (!nextPageToken) break;
    pageToken = nextPageToken;
  }
  return all;
}

/** 附件 uid：attachment.name 形如 "attachments/xxx" */
const attachmentUid = (a: NonNullable<RawMemo['attachments']>[number]) =>
  a.name.replace('attachments/', '');

/** 附件 URL 契约：GET /file/attachments/{uid}/{filename} */
const attachmentUrl = (a: NonNullable<RawMemo['attachments']>[number], siteUrl: string) =>
  `${siteUrl}/file/attachments/${attachmentUid(a)}/${a.filename}`;

/** 一条 memo 的图片附件（uid + 绝对 URL） */
const imageAttachments = (m: RawMemo, siteUrl: string) =>
  (m.attachments || [])
    .filter((a) => (a.type || '').startsWith('image/'))
    .map((a) => ({ uid: attachmentUid(a), url: attachmentUrl(a, siteUrl) }));

/**
 * 折叠判据的行数缓冲：估算有误差，留 4 行避免「折起来只藏一行」的尴尬。
 * 与 config 的 maxLines 相加得阈值；不设第二个配置项——两个数字会配出「阈值 < 显示行数」。
 */
const FOLD_MARGIN_LINES = 4;

/** 每行容量（字符）：13.5px 正文、卡宽 650px 下中英混排的实测档位。 */
const CHARS_PER_LINE = 40;

/** 一张正文内联图折算的行数（图宽≈卡宽，纵向多在 6–10 行之间，取中）。 */
const IMAGE_LINES = 8;

/**
 * 目测行数：把渲染前的内容折算成「13.5px 正文行」，只用于决定这一条要不要折叠。
 * 用与渲染同一个 lexer 的顶层 token：代码块取真实换行数，段落/标题/列表按字符数折算，
 * 正文内联图按 IMAGE_LINES 记——不追像素级拟合，误差由 FOLD_MARGIN_LINES 的缓冲吸收。
 * 附件图墙不在统计范围（渲染在正文之外，不参与折叠）。
 * 不用运行期高度：那需要 JS + 布局抖动，图墙懒加载还会让高度不稳。
 */
function estimateMemoLines(md: string): number {
  let lines = 0;
  for (const token of lexer(md)) {
    switch (token.type) {
      case 'code':
        lines += token.text.split('\n').length;
        break;
      case 'heading':
        lines += 1.6;
        break;
      // marked 的 Token 联合里带 Tokens.Generic，判别联合收不紧，这里显式取一次
      case 'list': {
        const items = (token as Tokens.List).items;
        lines += items.reduce(
          (sum, item) => sum + Math.ceil(item.text.length / CHARS_PER_LINE) + 0.3,
          0
        );
        break;
      }
      case 'space':
        lines += 0.5;
        break;
      default:
        lines += Math.ceil(token.raw.length / CHARS_PER_LINE);
    }
    // 正文内联图（![](...)）在段落里是行内 token，按 raw 数最省事
    lines += (token.raw.match(/!\[/g)?.length ?? 0) * IMAGE_LINES;
  }
  return lines;
}

/**
 * 原始 memo → 展示条目：白名单 tag 过滤、渲染、附件 URL 拼装。
 * 附件 URL 契约：GET /file/attachments/{uid}/{filename}（uid 取自 attachment.name）。
 */
export async function renderMemoItems(
  raws: RawMemo[],
  opts: {
    tags: readonly string[];
    limit: number;
    siteUrl: string;
    /** 列表首图优先加载（静态页 LCP）：只给首个含图的 memo；增量同步追加的卡片保持 lazy，不传 */
    prioritize?: boolean;
  }
): Promise<Memo[]> {
  const { tags, limit, siteUrl, prioritize = false } = opts;
  // 折叠：开关与阈值整批算一次；关闭时下面的估算被 && 短路，一行不跑
  const fold = memosConfig.display.fold;
  const foldThreshold = fold.maxLines + FOLD_MARGIN_LINES;

  // tag 清理规则只依赖白名单，整批共用一条正则
  const tagPattern = memoTagPattern(tags);
  const selected = raws
    .filter((m) => (m.tags || []).some((t) => tags.includes(t)))
    .slice(0, limit);
  // 图片附件全集（含正文内联引用的）：结构化数据与首图判定口径
  const imagesByMemo = selected.map((m) => imageAttachments(m, siteUrl));
  // 首图优先加载：列表里第一个含图的 memo（与 Moments.astro 取 priorityMemoUid 同一口径）
  const priorityIndex = prioritize ? imagesByMemo.findIndex((imgs) => imgs.length > 0) : -1;

  const items = selected.map(async (m, i) => {
    const images = imagesByMemo[i];
    const body = stripMemoTags(m.content, tagPattern);
    const content = await renderMarkdown(body, {
      uid: m.uid,
      priority: i === priorityIndex,
    });
    // 保留全部命中白名单的 tag（一条 memo 可多分类），去重保序；不再降维成单个
    const matchedTags = [...new Set((m.tags || []).filter((t) => tags.includes(t)))];
    // 正文内联引用的图片附件（Memos 新版编辑器插图产出 ![](/file/attachments/{uid})）
    // 已随正文展示，图墙只渲染正文没引用的那些。uid 从渲染结果里取——
    // 代码块里的同名字符串不会被渲染成图片，也就不会被误判。
    const inlineUids = new Set(
      [...content.matchAll(/\/file\/attachments\/([^/"'\s]+)/g)].map((match) => match[1])
    );
    const gallery = images.filter((a) => !inlineUids.has(a.uid)).map((a) => a.url);
    // 非图片附件（视频/音频/文件）不再静默丢弃，按 MIME 前缀归类降级渲染
    const media: MemoMedia[] = (m.attachments || [])
      .filter((a) => !(a.type || '').startsWith('image/'))
      .map((a) => ({
        type: (a.type || '').startsWith('video/')
          ? 'video'
          : (a.type || '').startsWith('audio/')
            ? 'audio'
            : 'file',
        url: attachmentUrl(a, siteUrl),
        filename: a.filename,
      }));
    return {
      uid: m.uid,
      collapsible: fold.enabled && estimateMemoLines(body) > foldThreshold,
      updateTime: m.updateTime,
      createTime: m.createTime,
      date: formatMemoDate(m.createTime),
      tags: matchedTags,
      content,
      images: images.length ? images.map((a) => a.url) : undefined,
      gallery: gallery.length ? gallery : undefined,
      media: media.length ? media : undefined,
    };
  });

  return Promise.all(items);
}

/** Memos 版本校验：使用实例 profile 的实际版本与配置锚点比较。 */
export async function getMemosVersionStatus(): Promise<ServiceVersionStatus | 'unconfigured'> {
  if (!memosConfig.enabled) return 'unconfigured';
  try {
    const endpoint = new URL('/api/v1/instance/profile', memosConfig.auth.siteUrl).toString();
    const headers = memosConfig.auth.token
      ? { Authorization: `Bearer ${memosConfig.auth.token}` }
      : undefined;
    return checkServiceVersion(endpoint, memosConfig.version, headers);
  } catch {
    return 'unavailable';
  }
}

/**
 * 动态板块编排入口：读用户配置 → 拉取 → 过滤渲染。
 * 未配置返回空数组（占位提示由组件处理）；拉取失败返回 null（组件降级空态，方案 B：无兜底数据）。
 */
export async function getMemos(
  limit = memosConfig.display.limit
): Promise<Memo[] | null> {
  if (!memosConfig.enabled) {
    return [];
  }

  try {
    const raws = await fetchMemoList(memosConfig.auth.siteUrl, memosConfig.auth.token);
    return await renderMemoItems(raws, {
      tags: memosConfig.tags,
      limit,
      siteUrl: memosConfig.auth.siteUrl,
      // 静态渲染：列表首图（含正文内联图）优先加载，与 MomentCard 的 priority 口径一致
      prioritize: true,
    });
  } catch (err) {
    console.warn('[memos] fetch failed:', err);
    return null;
  }
}

// ==================== 增量同步 ====================

/** HTML 属性/文本转义（tag / uid / URL 来自远程数据） */
const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  );

interface SyncDiff {
  added: RawMemo[];
  updated: RawMemo[];
  removed: string[];
}

/**
 * 纯函数 diff：prev 快照 {uid: updateTime} vs 当前过滤后 raw 列表。
 * added = 快照里没有的新条目；updated = 两边都有但 updateTime 变化；
 * removed = 快照里有、当前展示集合没有（含被删除 / 改出白名单 / 挤出前 limit）。
 */
export function diffMemos(
  prev: Record<string, string>,
  current: RawMemo[]
): SyncDiff {
  const currentUids = new Set(current.map((m) => m.uid));
  const added: RawMemo[] = [];
  const updated: RawMemo[] = [];
  for (const m of current) {
    const prevTime = prev[m.uid];
    if (prevTime === undefined) added.push(m);
    else if (prevTime !== m.updateTime) updated.push(m);
  }
  const removed = Object.keys(prev).filter((uid) => !currentUids.has(uid));
  return { added, updated, removed };
}

/** 同步响应：卡片 HTML + 新快照（前端直接替换本地快照，作为下次同步的 prev） */
export interface SyncResult {
  /** 新增条目（Memo 数据，卡片 HTML 由端点经 MomentCard 组件渲染） */
  added: Memo[];
  /** 修改条目（同上） */
  updated: Memo[];
  removed: string[];
  /** 新展示集合快照 {uid: updateTime} */
  snapshot: Record<string, string>;
  /** 展示集合最新 updateTime（RFC3339），LAST SYNCED 展示用 */
  latest: string;
  /** 同上，已格式化为 YYYY.MM.DD（前端直接用，免跨 runtime 重复格式化） */
  latestDate: string;
  /** 展示集合条数（计数刷新用） */
  count: number;
}

/**
 * 增量同步编排：拉全量 → 白名单过滤 → createTime 倒序取前 limit → diff → 新增/修改渲染为卡片 HTML。
 * 失败返回 null（调用方降级提示）。token 只在本服务端函数中使用，绝不下发。
 */
export async function syncMemos(
  prev: Record<string, string>,
  limit = memosConfig.display.limit
): Promise<SyncResult | null> {
  if (!memosConfig.enabled) return null;
  try {
    const raws = await fetchAllMemos(
      memosConfig.auth.siteUrl,
      memosConfig.auth.token
    );
    // 展示集合：白名单过滤 + createTime 倒序 + 前 limit（RFC3339 字典序 == 时间序）
    const tagged = raws
      .filter((m) => (m.tags || []).some((t) => memosConfig.tags.includes(t)))
      .sort((a, b) => b.createTime.localeCompare(a.createTime))
      .slice(0, limit);
    const { added, updated, removed } = diffMemos(prev, tagged);
    // 合并渲染以复用单次 marked/shiki 管线；Promise.all 保序，added 在前 updated 在后。
    // 不传 prioritize：增量追加的卡片不是首屏，保持 lazy（同 MomentCard 的增量路径）。
    const items = await renderMemoItems([...added, ...updated], {
      tags: memosConfig.tags,
      limit: added.length + updated.length,
      siteUrl: memosConfig.auth.siteUrl,
    });

    const snapshot: Record<string, string> = {};
    for (const m of tagged) snapshot[m.uid] = m.updateTime;
    const latest = tagged.length
      ? tagged.reduce((a, b) => (a.updateTime > b.updateTime ? a : b)).updateTime
      : '';
    // 返回 Memo 数据；卡片 HTML 由端点经 MomentCard 组件渲染（单一事实源）
    return {
      added: items.slice(0, added.length),
      updated: items.slice(added.length),
      removed,
      snapshot,
      latest,
      latestDate: latest ? formatMemoDate(latest) : '',
      count: tagged.length,
    };
  } catch (err) {
    console.warn('[memos] sync failed:', err);
    return null;
  }
}
