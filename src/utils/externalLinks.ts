// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { ExternalLinksConfig } from '@t/externalLinks';

/** 取 hostname 的 apex 域名（忽略子域）。
 * 例：www.example.com / blog.example.com → example.com
 * 复杂 ccTLD（如 example.co.uk）可能需要手动配置 internalDomains。
 */
export function getApexDomain(hostname: string): string {
  const parts = hostname.replace(/^www\./, '').split('.');
  if (parts.length <= 2) return parts.join('.');
  return parts.slice(-2).join('.');
}

/** 判断一个 href 是否为需要处理的外部链接。
 * 规则：
 *   1. 跳过空链接、锚点、mailto、tel、javascript
 *   2. 根相对路径（/xxx）视为站内
 *   3. 与 siteUrl 同 apex 域名的绝对/相对 URL 视为站内
 *   4. 命中 internalDomains 中 apex 域名的也算站内
 *   5. 其余 http(s) / // 视为外部链接
 */
export function isExternalLink(
  href: string,
  siteUrl: string,
  internalDomains: string[] = []
): boolean {
  if (!href) return false;
  const h = href.trim();
  if (
    h.startsWith('#') ||
    h.startsWith('mailto:') ||
    h.startsWith('tel:') ||
    h.startsWith('javascript:')
  )
    return false;
  if (h.startsWith('/') && !h.startsWith('//')) return false;

  try {
    const baseApex = getApexDomain(new URL(siteUrl).hostname);
    const resolved = new URL(h, siteUrl);
    const resolvedApex = getApexDomain(resolved.hostname);
    if (resolvedApex === baseApex) return false;
    if (internalDomains.some((d) => getApexDomain(d) === resolvedApex)) return false;
    return true;
  } catch {
    // 解析失败时退化为协议判断
    return /^https?:\/\//i.test(h) || h.startsWith('//');
  }
}

/** 判断链接是否命中赞助清单 */
export function isSponsoredLink(href: string, sponsored: ExternalLinksConfig['sponsored']): boolean {
  return sponsored.some((s) => {
    if (href === s.url) return true;
    // 支持前缀匹配，避免末尾斜杠差异
    const base = s.url.replace(/\/$/, '');
    return href === base || href.startsWith(`${base}/`) || href.startsWith(`${base}?`);
  });
}

/** 计算最终 rel 字符串 */
export function computeLinkRel(
  href: string,
  isUgcContext: boolean,
  config: ExternalLinksConfig
): string {
  const tokens = new Set<string>();
  if (isUgcContext) tokens.add('ugc');
  if (isSponsoredLink(href, config.sponsored)) tokens.add('sponsored');
  tokens.add('nofollow');
  config.defaultRel.split(/\s+/).forEach((t) => {
    if (t) tokens.add(t);
  });
  return [...tokens].join(' ');
}

/** 构建期生成静态外链属性；站内链接返回空对象。 */
export function externalLinkAttrs(
  href: string,
  siteUrl: string,
  config: ExternalLinksConfig,
  isUgcContext = false
): Record<string, string> {
  if (!config.enabled || !isExternalLink(href, siteUrl, config.internalDomains)) return {};

  return {
    ...(config.openInNewTab ? { target: '_blank' } : {}),
    rel: computeLinkRel(href, isUgcContext, config),
  };
}
