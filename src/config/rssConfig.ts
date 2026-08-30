import type { RssConfig } from '@t/rss';

// 站点自身 RSS 配置（/rss.xml）
export const rssConfig: RssConfig = {
  // 条目描述模式：
  //   'summary' = 封面图 + 摘要段落
  //   'full'    = 封面图 + 全文 HTML（默认）
  descriptionMode: 'full',
};
