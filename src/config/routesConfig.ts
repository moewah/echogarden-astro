// ② 全局：站点核心路由路径。字段形状见 @t/routes。
// —— 改这里：调整内部路由路径。
// —— 以下别动：具体生成逻辑在 utils/llms.ts 等消费方。
import type { SiteRoutes } from '@t/routes';

export const routesConfig: SiteRoutes = {
  home: '/',
  weekly: '/weekly/',
  photos: '/photos/',
  moments: '/moments/',
  guestbook: '/guestbook/',
  rss: '/rss.xml',
  sitemap: '/sitemap.xml',
};
