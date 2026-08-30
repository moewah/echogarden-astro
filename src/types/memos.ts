/** ④ 接口：动态板块（Memos）配置 */
export interface MemosConfig {
  /** 动态页档案号 N：1–999，人工维护；接口关闭时页面不生成但编号不回收。 */
  archiveNo: number;
  tags: readonly string[];
  auth: {
    siteUrl: string;
    token: string;
  };
  enabled: boolean;
  /** 动态页 /moments/ 与导航入口的显示开关；false 时页面跳 404、sitemap 排除。 */
  pageEnabled: boolean;
  /** 增量刷新开关：false（默认）时纯静态行为不变；true 时动态页渲染刷新按钮并启用 /api/memos/sync 同步。 */
  refresh: {
    enabled: boolean;
  };
  display: {
    truncate: number;
    collapseThreshold: number;
  };
  version: string;
}
