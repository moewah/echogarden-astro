// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

// LLMs.txt 生成器：从 config / content collections 动态组装，禁止写死内容。
// 输出严格遵循 https://llmstxt.org/ 的 Markdown 格式。
import {
  siteConfig,
  weeklyConfig,
  albumsConfig,
  memosConfig,
  elsewhereConfig,
  llmsConfig,
  routesConfig,
} from '@config/index';
import { i18n } from '@i18n';
import { getSortedWeekly, weeklyIssueLabel, type WeeklyPost } from './weekly';
import { getSortedAlbums, type Album } from './albums';
import type { LlmsCuratedItem } from '@t/llms';

function siteUrl(path: string): string {
  return new URL(path, siteConfig.site.url).toString();
}

function mdLink(text: string, url: string): string {
  return `[${text}](${url})`;
}

function mdListItem(text: string, url: string, note?: string): string {
  const link = mdLink(text, url);
  return note ? `- ${link}: ${note}` : `- ${link}`;
}

function enabledElsewhereLinks() {
  return elsewhereConfig.filter(
    (link) => link.enabled !== false && link.url !== '#'
  );
}

// 内容集合在一次生成内只读一次（语义层与近期列表共用）
let weeklyPostsPromise: Promise<WeeklyPost[]> | undefined;
let albumsPromise: Promise<Album[]> | undefined;

function getWeeklyPosts(): Promise<WeeklyPost[]> {
  weeklyPostsPromise ??= getSortedWeekly();
  return weeklyPostsPromise;
}

function getAlbums(): Promise<Album[]> {
  albumsPromise ??= getSortedAlbums();
  return albumsPromise;
}

// ---- 语义扩展：引用解析 ----
// 功能开关关闭 = 合法降级（返回 null，不输出该条）；配置写错 = 构建失败（抛错，不静默失真）

function absoluteUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    throw new Error(`[llms] 无效的绝对 URL: ${url}`);
  }
}

function routeEnabled(route: keyof typeof routesConfig): boolean {
  if (route === 'weekly') return weeklyConfig.enabled;
  if (route === 'photos') return albumsConfig.enabled;
  if (route === 'moments') return memosConfig.pageEnabled;
  return true;
}

interface ResolvedSemanticLink {
  label: string;
  url: string;
}

async function resolveSemanticLink(
  item: LlmsCuratedItem
): Promise<ResolvedSemanticLink | null> {
  const { target } = item;

  if ('route' in target) {
    if (!routeEnabled(target.route)) return null;
    if (!item.label) throw new Error(`[llms] route 引用缺少 label: ${target.route}`);
    return { label: item.label, url: siteUrl(routesConfig[target.route]) };
  }

  if ('elsewhere' in target) {
    const link = elsewhereConfig.find((entry) => entry.name === target.elsewhere);
    if (!link) throw new Error(`[llms] elsewhere 引用不存在: ${target.elsewhere}`);
    if (link.enabled === false || link.url === '#') return null;
    if (!item.label) throw new Error(`[llms] elsewhere 引用缺少 label: ${target.elsewhere}`);
    return { label: item.label, url: absoluteUrl(link.url) };
  }

  if ('url' in target) {
    if (!item.label) throw new Error('[llms] 外部 URL 引用缺少 label');
    return { label: item.label, url: absoluteUrl(target.url) };
  }

  if ('weeklySlug' in target) {
    if (!weeklyConfig.enabled) return null;
    const post = (await getWeeklyPosts()).find((entry) => entry.id === target.weeklySlug);
    if (!post) throw new Error(`[llms] weeklySlug 不存在: ${target.weeklySlug}`);
    return {
      label: item.label ?? `${weeklyIssueLabel(post.data.issue)} ${post.data.title}`,
      url: siteUrl(`${routesConfig.weekly}${post.id}/`),
    };
  }

  if (!albumsConfig.enabled) return null;
  const album = (await getAlbums()).find((entry) => entry.id === target.albumSlug);
  if (!album) throw new Error(`[llms] albumSlug 不存在: ${target.albumSlug}`);
  return {
    label: item.label ?? album.data.title,
    url: siteUrl(`${routesConfig.photos}${album.id}/`),
  };
}

// 实体区块：字段全部复用既有事实源，不生成虚假默认值；缺字段就不输出对应行
function semanticEntitySection(): string {
  const entityType = llmsConfig.semantic.identity?.entityType;
  if (!entityType) return '';

  const profile = siteConfig.profile;
  const entityId = `${siteUrl(routesConfig.home)}#${entityType.toLowerCase()}`;
  const sameAs = enabledElsewhereLinks()
    .filter((link) => !link.url.startsWith('mailto:'))
    .map((link) => link.url);
  const lines = [
    `- ${i18n.llms.entityType}: ${entityType} (Schema.org:${entityType})`,
    `- ${i18n.llms.entityId}: ${entityId}`,
    `- ${i18n.llms.name}: ${profile.name || siteConfig.site.name}`,
  ];

  if (profile.role) lines.push(`- ${i18n.llms.jobTitle}: ${profile.role}`);
  if (profile.focus.length > 0) lines.push(`- ${i18n.llms.knowsAbout}: ${profile.focus.join('; ')}`);
  lines.push(`- ${i18n.llms.canonicalUrl}: ${siteConfig.site.url}`);
  if (sameAs.length > 0) lines.push(`- ${i18n.llms.sameAs}: ${sameAs.join('; ')}`);

  return `## ${i18n.llms.identity}\n\n${lines.join('\n')}`;
}

async function semanticSections(): Promise<string[]> {
  const semantic = llmsConfig.semantic;
  if (!semantic.enabled) return [];

  const sections: string[] = [];
  const entitySection = semanticEntitySection();
  if (entitySection) sections.push(entitySection);

  const identityLines: string[] = [];
  if (semantic.identity?.summary?.trim()) {
    identityLines.push(semantic.identity.summary.trim(), '');
  }

  const sourceLines = await Promise.all(
    semantic.sourceMap.map(async (source) => {
      const link = await resolveSemanticLink({ label: source.label, target: source.target });
      return link ? `- ${mdLink(link.label, link.url)}: ${source.role}` : '';
    })
  );
  identityLines.push(...sourceLines.filter(Boolean));
  if (identityLines.length > 0) {
    sections.push(`## ${i18n.llms.identityRouting}\n\n${identityLines.join('\n')}`);
  }

  for (const curated of semantic.curatedSections) {
    const items = await Promise.all(
      curated.items.map(async (item) => ({ item, link: await resolveSemanticLink(item) }))
    );
    const lines = items
      .filter(
        (entry): entry is { item: LlmsCuratedItem; link: ResolvedSemanticLink } => entry.link !== null
      )
      .map(({ item, link }) =>
        item.note ? `- ${mdLink(link.label, link.url)}: ${item.note}` : `- ${mdLink(link.label, link.url)}`
      );
    if (lines.length === 0) continue;
    const description = curated.description?.trim();
    sections.push(
      `## ${curated.title}\n\n${description ? `${description}\n\n` : ''}${lines.join('\n')}`
    );
  }

  if (semantic.readingRules.length > 0) {
    sections.push(
      `## ${i18n.llms.readingRules}\n\n${semantic.readingRules.map((rule) => `- ${rule}`).join('\n')}`
    );
  }

  return sections;
}

function introSection(): string {
  const columns = [
    `${i18n.sections.weeklyPage.title}：${siteConfig.site.seo.pages.weekly.description}`,
    `${i18n.sections.albums.title}：${siteConfig.site.seo.pages.photos.description}`,
    ...(memosConfig.pageEnabled
      ? [`${i18n.sections.moments.title}：${siteConfig.site.seo.pages.moments.description}`]
      : []),
    `${i18n.sections.guestbook.title}：${siteConfig.site.seo.pages.guestbook.description}`,
  ];

  const d = new Date();
  const updatedAt = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

  const ownerName = siteConfig.profile.name || siteConfig.site.name;

  return [
    i18n.llms.intro.replace('{name}', ownerName),
    ...columns.map((c) => `- ${c}`),
    '',
    `${i18n.llms.website}: ${siteConfig.site.url}`,
    `${i18n.llms.updated}: ${updatedAt}`,
  ].join('\n');
}

function corePagesSection(): string {
  const pages = [mdListItem(i18n.nav.home, siteUrl(routesConfig.home))];

  // 与板块开关联动：关闭的板块不列入口，避免 llms.txt 留下死链（与 semantic 的降级规则一致）
  if (weeklyConfig.enabled) {
    pages.push(
      mdListItem(
        i18n.sections.weeklyPage.title,
        siteUrl(routesConfig.weekly),
        siteConfig.site.seo.pages.weekly.description
      )
    );
  }

  if (albumsConfig.enabled) {
    pages.push(
      mdListItem(
        i18n.sections.albums.title,
        siteUrl(routesConfig.photos),
        siteConfig.site.seo.pages.photos.description
      )
    );
  }

  if (memosConfig.pageEnabled) {
    pages.push(
      mdListItem(
        i18n.sections.moments.title,
        siteUrl(routesConfig.moments),
        siteConfig.site.seo.pages.moments.description
      )
    );
  }

  pages.push(
    mdListItem(
      i18n.sections.guestbook.title,
      siteUrl(routesConfig.guestbook),
      siteConfig.site.seo.pages.guestbook.description
    )
  );

  return `## ${i18n.llms.corePages}\n\n${pages.join('\n')}`;
}

function profileSection(): string {
  const profile = siteConfig.profile;
  const lines: string[] = [];

  if (profile.name) lines.push(`- ${i18n.about.name}：${profile.name}`);
  if (profile.role) lines.push(`- ${i18n.about.role}：${profile.role}`);
  if (profile.focus?.length) lines.push(`- ${i18n.about.focus}：${profile.focus.join(' / ')}`);
  if (profile.location) lines.push(`- ${i18n.about.location}：${profile.location}`);
  if (profile.statement) lines.push(`- ${i18n.about.statement}：${profile.statement}`);

  if (lines.length === 0) return '';

  return `## ${i18n.llms.profile}\n\n${lines.join('\n')}`;
}

function contentPolicySection(): string {
  return [
    `## ${i18n.llms.contentPolicy}`,
    '',
    `- ${i18n.llms.contentPolicy1}`,
    `- ${i18n.llms.contentPolicy2}`,
    `- ${i18n.llms.contentPolicy3}`,
    `- ${i18n.llms.contentPolicy4}`,
  ].join('\n');
}

function noticeSection(): string {
  if (!siteConfig.notice) return '';
  return `## ${i18n.llms.notice}\n\n> ${siteConfig.notice}`;
}

function contactSection(): string {
  const lines: string[] = [];

  if (siteConfig.profile.email) {
    lines.push(`- ${i18n.llms.email}：${siteConfig.profile.email}`);
  }

  for (const link of enabledElsewhereLinks()) {
    lines.push(mdListItem(link.name, link.url, link.description));
  }

  if (lines.length === 0) return '';

  return `## ${i18n.llms.contact}\n\n${lines.join('\n')}`;
}

async function weeklySection(): Promise<string> {
  if (!weeklyConfig.enabled) return '';

  const posts = await getWeeklyPosts();
  const recent = posts.slice(0, llmsConfig.recentWeeklyCount);

  const list = recent
    .map((post) =>
      mdListItem(
        `${weeklyIssueLabel(post.data.issue)} ${post.data.title}`,
        siteUrl(`${routesConfig.weekly}${post.id}/`),
        post.data.description
      )
    )
    .join('\n');

  return `## ${i18n.llms.recentWeekly}\n\n${list}`;
}

async function albumsSection(): Promise<string> {
  if (!albumsConfig.enabled) return '';

  const albums = await getAlbums();
  const recent = albums.slice(0, llmsConfig.recentAlbumsCount);

  const list = recent
    .map((album) =>
      mdListItem(
        album.data.title,
        siteUrl(`${routesConfig.photos}${album.id}/`),
        album.data.description
      )
    )
    .join('\n');

  return `## ${i18n.llms.recentAlbums}\n\n${list}`;
}

function aiInstructionsSection(): string {
  return [
    `## ${i18n.llms.aiInstructions}`,
    '',
    `- ${i18n.llms.aiInstruction1}`,
    `- ${i18n.llms.aiInstruction2}`,
    `- ${i18n.llms.aiInstruction3}`,
    `- ${i18n.llms.aiInstruction4}`,
  ].join('\n');
}

function optionalSection(): string {
  const lines: string[] = [];

  // RSS：周刊的附属产物，随 weeklyConfig.enabled 同生共死，周刊关闭时不输出
  if (weeklyConfig.enabled) {
    lines.push(mdListItem(i18n.llms.rss, siteUrl(routesConfig.rss)));
  }

  // Sitemap
  lines.push(mdListItem(i18n.llms.sitemap, siteUrl(routesConfig.sitemap)));

  return `## ${i18n.llms.optional}\n\n${lines.join('\n')}`;
}

export async function generateLlmsTxt(): Promise<string> {
  const sections: string[] = [
    `# ${siteConfig.site.name}`,
    '',
    `> ${siteConfig.site.description}`,
    '',
    introSection(),
    profileSection(),
    corePagesSection(),
    ...(await semanticSections()),
    await weeklySection(),
    await albumsSection(),
    contactSection(),
    contentPolicySection(),
    noticeSection(),
    aiInstructionsSection(),
    optionalSection(),
  ];

  return sections
    .filter((s) => s.trim() !== '')
    .join('\n\n');
}
