// ⑤ 扩展：数据统计。GA + Umami 配置契约

export interface GoogleAnalyticsConfig {
  enabled: boolean;
  /** GA4 衡量 ID，例：G-XXXXXXXXXX */
  id: string;
}

export interface MicrosoftClarityConfig {
  enabled: boolean;
  /** Microsoft Clarity 项目 ID，例：abcdefghij */
  id: string;
}

export interface UmamiSessionReplayConfig {
  /** 是否启用会话回放 */
  enabled: boolean;
  /** recorder.js 地址，例：https://umami.example.com/recorder.js */
  recorderUrl: string;
}

export interface UmamiConfig {
  enabled: boolean;
  /** data-website-id */
  websiteId: string;
  /** script.js 地址，例：https://umami.example.com/script.js */
  scriptUrl: string;
  /** 数据上报地址，覆盖默认的 script.js 所在域；为空则使用默认值 */
  hostUrl?: string;
  /** 是否自动初始化跟踪（pageview、click、performance 等），默认 true */
  autoTrack?: boolean;
  /** 只在指定域名运行，例：['www.example.com'] */
  domains?: string[];
  /** 事件分组标签，用于过滤/A-B 测试 */
  tag?: string;
  /** 是否收集 Core Web Vitals：输出 data-performance="true"，tracker 以 type=performance 上报 TTFB/INP/时长 */
  collectWebVitals?: boolean;
  /** 会话回放配置：recorder.js 与 tracker 并列加载（需实例提供 recorder.js，且实例侧已开 Replays） */
  sessionReplay?: UmamiSessionReplayConfig;
}

export interface AnalyticsConfig {
  googleAnalytics: GoogleAnalyticsConfig;
  microsoftClarity: MicrosoftClarityConfig;
  umami: UmamiConfig;
}
