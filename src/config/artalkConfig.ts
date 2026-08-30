// ④ 接口：Artalk 评论。字段形状见 @t/artalk。
// —— 改这里：无（凭据全走 .env）。
// —— 以下别动：评论组件加载逻辑 → @components/Comments.astro。
import type { Artalk } from '@t/artalk';

export const artalkConfig: Artalk = {
  // Artalk 后端地址：.env 注入（ARTALK_SERVER）。留空 = 留言板块降级为静态占位提示。
  server: (import.meta.env.ARTALK_SERVER || process.env.ARTALK_SERVER || '').replace(/\/+$/, ''),
  // Artalk 站点名（ARTALK_SITE）：多站点标识，Artalk 后台创建站点时设置，两处一致。
  site: import.meta.env.ARTALK_SITE || process.env.ARTALK_SITE || '',
  // 接口版本锚点：构建期通过 /api/v2/version 校验；不匹配时评论区显示空态。升级后端 Artalk 时同步改这里。
  version: '2.10.0',
};
