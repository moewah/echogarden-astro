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
import { getSortedWeekly, weeklyIssueLabel } from './weekly';
import { getSortedAlbums } from './albums';

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
  const pages = [
    mdListItem(i18n.nav.home, siteUrl(routesConfig.home)),
    mdListItem(
      i18n.sections.weeklyPage.title,
      siteUrl(routesConfig.weekly),
      siteConfig.site.seo.pages.weekly.description
    ),
    mdListItem(
      i18n.sections.albums.title,
      siteUrl(routesConfig.photos),
      siteConfig.site.seo.pages.photos.description
    ),
  ];

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

  const posts = await getSortedWeekly();
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

  const albums = await getSortedAlbums();
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
