// ④ 接口：外部链接统一处理（UGC / 赞助 / 普通外链）。
// 字段形状见 @t/externalLinks。
import type { ExternalLinksConfig } from '@t/externalLinks';

export const externalLinksConfig: ExternalLinksConfig = {
  // 总开关：关闭后不生成静态外链属性，也不注入评论区处理脚本
  enabled: true,

  // 是否在新标签页打开外部链接
  openInNewTab: true,

  // 普通外部链接的默认 rel
  defaultRel: 'noopener noreferrer',

  // 赞助/affiliate 链接清单：匹配到的链接会额外加 rel="sponsored"
  // 注意：这里只维护“站点自己放的赞助链接”，UGC 里的链接由 ugcSelectors 自动识别
  sponsored: [
    {
      name: '爱发电',
      url: 'https://ifdian.net/a/moewah',
    },
  ],

  // 视为站内的 apex 域名（自动忽略子域）。
  // 例：填 'example.com'，则 www.example.com / blog.example.com / photos.example.com 都算站内。
  // 留空时自动从 siteConfig.site.url 推导。
  internalDomains: ['moewah.com'],

  // UGC 内容容器选择器：只有动态评论区继续由客户端补充 rel="ugc"
  // 目前仅 Artalk 评论区；后续若增加留言板，往数组加选择器即可
  ugcSelectors: ['#comments'],
};
