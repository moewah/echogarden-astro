/** 外部链接统一处理配置 */
export interface ExternalLinksConfig {
  /** 总开关 */
  enabled: boolean;
  /** 是否在新标签页打开外部链接 */
  openInNewTab: boolean;
  /** 普通外部链接的默认 rel */
  defaultRel: string;
  /** 赞助/affiliate 链接清单：匹配到的链接会额外加 sponsored */
  sponsored: SponsoredLink[];
  /** 视为站内的 apex 域名清单（自动忽略子域）。
   * 例：填 'example.com' 则 www.example.com / blog.example.com 都算站内。
   * 留空时自动从 siteUrl 推导。
   */
  internalDomains: string[];
  /** UGC 内容容器选择器（如评论区），其内外链统一加 ugc */
  ugcSelectors: string[];
}

/** 赞助/affiliate 链接条目 */
export interface SponsoredLink {
  /** 链接地址，支持精确匹配或前缀匹配 */
  url: string;
  /** 备注名称（仅用于配置注释，不参与运行时） */
  name?: string;
}
