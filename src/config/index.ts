// 配置索引文件 - 统一导出所有配置
// 组件从这里一次性导入，减少重复的 import 语句

// —— 全站级 ——
export { siteConfig } from './siteConfig'; // 全站级聚合（嵌套：site 身份 / profile 主人 / notice 公告 / background 背景 / images 压缩）

// —— 页面板块 ——
export { albumsConfig } from './albumsConfig'; // 影辑总开关
export { weeklyConfig } from './weeklyConfig'; // 周刊总开关 + 评论开关
export { projectsConfig } from './projectsConfig'; // GitHub 地址 + 兜底项目
export { elsewhereConfig } from './elsewhereConfig'; // 我在别处（外部触点）列表
export { donationConfig } from './donationConfig'; // 赞助文案与方式
export { guestbookConfig } from './guestbookConfig'; // 留言须知文案

// —— 外部接口 ——
export { remoteBlogConfig } from './remoteBlogConfig'; // 外部博客 RSS：地址/开关/兜底文章
export { memosConfig } from './memosConfig'; // 动态：tag 白名单/凭据读取/版本要求
export { artalkConfig } from './artalkConfig'; // 评论：地址与站点名（凭据走 .env）

// —— RSS ——
export { rssConfig } from './rssConfig'; // 站点自身 RSS 配置

// —— 数据统计 ——
export { analyticsConfig } from './analyticsConfig'; // GA + Umami 统计配置

// —— 阅读增强 ——
export { readingConfig } from './readingConfig'; // 阅读增强：周刊/影辑详情页沉浸阅读（背景原始态）

// —— 外部链接处理 ——
export { externalLinksConfig } from './externalLinksConfig'; // 外链 rel / target 统一处理
export { llmsConfig } from './llmsConfig'; // LLMs.txt 生成配置
export { routesConfig } from './routesConfig'; // 站点核心路由路径

// —— 类型（来自 src/types/） ——
export type { SiteConfig, Site, Profile, Background, Images } from '@t/siteConfig';
export type { Albums } from '@t/albums';
export type { WeeklyConfig } from '@t/weekly';
export type { ElsewhereLink } from '@t/elsewhere';
export type { Donation, DonationMethod } from '@t/donation';
export type { GuestbookInfo } from '@t/guestbook';
export type { RemoteBlogConfig, RemotePost } from '@t/remoteBlog';
export type { Artalk } from '@t/artalk';
export type { RssConfig } from '@t/rss';
export type { ExternalLinksConfig, SponsoredLink } from '@t/externalLinks';
export type { LlmsConfig } from '@t/llms';
export type { SiteRoutes } from '@t/routes';
export type { AnalyticsConfig, GoogleAnalyticsConfig, MicrosoftClarityConfig, UmamiConfig } from '@t/analytics';
export type { ReadingConfig } from '@t/reading';
