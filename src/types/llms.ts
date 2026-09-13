/** ⑤ LLMs：/llms.txt 生成配置与可选语义扩展 */
import type { SiteRoutes } from './routes';

/**
 * 引用目标：配置只保存「怎么找到它」，URL 与标题由生成器从既有事实源解析。
 * - route      站内已有路由（routesConfig）
 * - elsewhere  已有外部触点（elsewhereConfig，按 name 匹配）
 * - url        外部绝对 URL（指向站外、无内部事实源时使用）
 * - weeklySlug 周刊文章（按 content collection 的 slug 匹配）
 * - albumSlug  影辑专辑（按 content collection 的 slug 匹配）
 */
export type LlmsLinkTarget =
  | { route: keyof SiteRoutes }
  | { elsewhere: string }
  | { url: string }
  | { weeklySlug: string }
  | { albumSlug: string };

export interface LlmsSemanticSource {
  label: string;
  role: string;
  target: LlmsLinkTarget;
}

export interface LlmsCuratedItem {
  /** 留空时从引用目标解析（周刊用「期号 + 标题」，影辑用专辑标题） */
  label?: string;
  note?: string;
  target: LlmsLinkTarget;
}

export interface LlmsCuratedSection {
  title: string;
  description?: string;
  items: LlmsCuratedItem[];
}

/** Schema.org 实体类型；不写死 Person，按站点实际身份选择 */
export type LlmsEntityType = 'Person' | 'Organization' | 'Product' | 'Project';

/** 可选语义扩展：关闭时只输出通用站点索引，零配置可用 */
export interface LlmsSemantic {
  enabled: boolean;
  identity?: {
    /** 站点身份的一句话补充说明；留空不额外输出 */
    summary?: string;
    /** 填写后才输出 Entity 区块；留空则不输出 */
    entityType?: LlmsEntityType;
  };
  sourceMap: LlmsSemanticSource[];
  curatedSections: LlmsCuratedSection[];
  readingRules: string[];
}

export interface LlmsConfig {
  /** 是否生成 /llms.txt 及 Layout 的 describedby 链接 */
  enabled: boolean;
  /** 近期周刊条目数 */
  recentWeeklyCount: number;
  /** 近期影辑条目数 */
  recentAlbumsCount: number;
  /** 可选语义扩展（身份路由 / 精选区块 / 读取规则 / 实体信息） */
  semantic: LlmsSemantic;
}
