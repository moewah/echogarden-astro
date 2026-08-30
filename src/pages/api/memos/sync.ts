// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { APIRoute } from 'astro';
import { experimental_AstroContainer } from 'astro/container';
import { memosConfig } from '@config/index';
import { syncMemos } from '@/utils/memos';
import MomentCard from '@components/MomentCard.astro';

// 动态增量同步端点（唯一动态路由，由 node adapter 提供运行时；其余页面保持静态产物）。
// 前端 POST 上次同步快照 {uid: updateTime}，返回 added/updated/removed 的卡片 HTML 与新快照。
// 卡片 HTML 经 Astro Container API 渲染 MomentCard 组件（与静态渲染同一组件，scoped 样式
// 自动匹配页面 head 中已有的组件 CSS）；token 只在此服务端读取，绝不下发。
// 部署模式切换（与 memosConfig.refresh.enabled 联动）：
//   refresh 关闭（纯静态默认）→ 本路由静态化，构建产物不含动态端点；
//   refresh 开启 → 需同时启用 node adapter（astro.config.mjs），本路由输出为动态端点。
export const prerender = !memosConfig.refresh.enabled;

// Container 实例复用（首次创建开销大，后续请求零成本）
let containerPromise: Promise<experimental_AstroContainer> | undefined;
function getContainer() {
  containerPromise ??= experimental_AstroContainer.create();
  return containerPromise;
}

export const POST: APIRoute = async ({ request }) => {
  // 快照解析：非法/缺失时按空快照处理（等价全量当新增，前端幂等去重兜底）
  let prev: Record<string, string> = {};
  try {
    const body = await request.json();
    if (
      body &&
      typeof body === 'object' &&
      typeof body.snapshot === 'object' &&
      body.snapshot !== null
    ) {
      prev = body.snapshot as Record<string, string>;
    }
  } catch {
    prev = {};
  }

  // limit 与动态页 Moments 组件保持一致（30 条）；截断与折叠读取 memosConfig.display
  const result = await syncMemos(prev, 30);
  if (!result) {
    return new Response(JSON.stringify({ error: 'sync unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 渲染增量卡片（idx 不传：编号由前端插入后统一重排）
  const container = await getContainer();
  const render = (memo: (typeof result.added)[number]) =>
    container.renderToString(MomentCard, { props: { memo } });
  const added = await Promise.all(result.added.map(render));
  const updated = await Promise.all(result.updated.map(render));

  return new Response(
    JSON.stringify({
      added,
      updated,
      removed: result.removed,
      snapshot: result.snapshot,
      latest: result.latest,
      latestDate: result.latestDate,
      count: result.count,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
