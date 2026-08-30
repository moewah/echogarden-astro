/** ② 全局：站点核心路由路径（内部 URL 唯一事实，避免在模板/工具中散落字面量） */
export interface SiteRoutes {
  home: string;
  weekly: string;
  photos: string;
  moments: string;
  guestbook: string;
  rss: string;
  sitemap: string;
}
