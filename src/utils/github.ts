// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

// GitHub 项目拉取契约（开发级，用户勿动）。
// 行为契约：owner 提取、API 地址、筛选排序（原创+非归档、高人气+最新）、条目编号。
// 用户级配置（github 地址）见 @config/projectsConfig。
import { projectsConfig } from '@config/projectsConfig';
import { archiveCode } from '@/utils/archive';

export interface Project {
  id: string;
  name: string;
  lang: string;
  description: string;
  url: string;
}

// 高人气项目数（按 star 降序）
const POPULAR_COUNT = 4;
// 最新项目数（按 pushed_at 降序，排除已选）
const LATEST_COUNT = 1;

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

export async function fetchProjects(githubUrl: string): Promise<Project[]> {
  // owner 提取兼容两种填法：用户主页（https://github.com/moewah）与具体仓库（https://github.com/moewah/echogarden-astro）
  const owner = githubUrl.replace(/^https?:\/\/github\.com\//, '').split('/')[0];
  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(
    `https://api.github.com/users/${owner}/repos?sort=pushed&per_page=100`,
    {
      signal: AbortSignal.timeout(30000),
      headers,
    }
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const repos = (await res.json()) as GitHubRepo[];

  // 原创 + 非归档
  const original = repos.filter((r) => !r.fork && !r.archived);

  // 高人气：按 star 降序取前 N
  const popular = [...original]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, POPULAR_COUNT);

  // 最新：按 pushed_at 降序，排除已选，取 N
  const chosen = new Set(popular.map((r) => r.name));
  const latest = [...original]
    .sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    )
    .filter((r) => !chosen.has(r.name))
    .slice(0, LATEST_COUNT);

  const selected = [...popular, ...latest];

  return selected.map((r, i) => ({
    id: archiveCode('MW-PRJ', i + 1),
    name: r.name,
    lang: r.language || '—',
    description: r.description || '',
    url: r.html_url,
  }));
}

/**
 * 项目板块编排入口：读用户配置 → 拉取。
 * 拉取失败返回 null（组件降级空态，方案 B：无兜底数据）。
 */
export async function getProjects(): Promise<Project[] | null> {
  // 构建时 GitHub API 可能偶发抖动，单次失败时重试一次。
  const retries = 2;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchProjects(projectsConfig.github);
    } catch (err) {
      console.warn(`[projects] GitHub fetch failed (attempt ${i + 1}/${retries}):`, err);
      if (i === retries - 1) return null;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return null;
}
