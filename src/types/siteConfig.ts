import type { ImageMetadata } from 'astro';

/** 全站级：站点身份 / 站主人档案 / 防骗公告 / 全局背景 / 图片压缩（嵌套聚合，config/siteConfig.ts 的唯一事实） */

/** 站点身份 */
export interface Site {
  /** 主页档案号 N：1–999，人工维护，不随页面开关重排。 */
  archiveNo: number;
  name: string;
  titleSuffix: string;
  url: string;
  /** 站点类型：用于 Hero 网站档案卡，明确站点身份（如「个人主页」） */
  type: string;
  /** 一句话标签（Hero 副标） */
  tagline: string;
  /** 座右铭（Hero 大标语） */
  slogan: string;
  since: number;
  copyright: string;
  ogImage: string;
  description: string;
  /** 站点首页关键词 */
  keywords: string[];
  /** Twitter/X 站点账号（含 @ 前缀），用于 twitter:site；留空则不注入 */
  twitter?: string;
  /** 非首页独立页面 SEO 配置（title / description / keywords） */
  seo: SiteSeo;
}

/** 单个页面 SEO 配置 */
export interface PageSeo {
  title: string;
  description: string;
  keywords: string[];
}

/** 非首页独立页面 SEO 配置 */
export interface SiteSeo {
  pages: {
    weekly: PageSeo;
    photos: PageSeo;
    moments: PageSeo;
    guestbook: PageSeo;
  };
}

/** 站主人档案 */
export interface Profile {
  name: string;
  /** 身份角色（About 卡 Role 行展示，对应 schema:Person.jobTitle） */
  role: string;
  /** 展示用头像：public/images/ 稳定 URL，与 favicon 共用 */
  avatar: string;
  /** 关注领域（About 卡 Focus 行展示，对应 schema:Person.knowsAbout） */
  focus: string[];
  statement: string;
  /** 位置标识（展示文案，建议「城市, 省份」格式，用于 schema:Place） */
  location: string;
  /** 位置国家代码（ISO 3166-1 alpha-2，用于 schema:PostalAddress.addressCountry） */
  locationCountry: string;
  email: string;
}

/** 全局背景 */
export interface Background {
  enabled: boolean;
  highlightsEnabled: boolean;
  /** 默认背景图：远程 URL 字符串 或 src/assets/ 下 import 的本地图（后者走 images 压缩） */
  defaultSrc: string | ImageMetadata;
  interval: number;
}

/** 构建时图片压缩 */
export interface Images {
  enabled: boolean;
  format: 'avif' | 'webp';
  quality: number;
}

export interface Fonts {
  // 字体加载模式：
  // - 'default': Google Fonts 官方源 + 默认字体
  // - 'mirror':  自定义镜像源 + 默认字体
  // - 'off':     不加载 Google Fonts，使用系统字体栈
  mode: 'default' | 'mirror' | 'off';
  // Google Fonts 镜像源，mode='mirror' 时生效
  mirror: string;
}

export interface SiteConfig {
  site: Site;
  profile: Profile;
  notice: string;
  background: Background;
  images: Images;
  fonts: Fonts;
}
