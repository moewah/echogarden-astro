// ⑩ 数据统计：GA + Umami 配置
// 总开关关闭时，构建产物完全不含统计代码。
// 脚本拼装与事件逻辑在 src/utils/analytics.ts。
import type { AnalyticsConfig } from '@t/analytics';

export const analyticsConfig: AnalyticsConfig = {
  googleAnalytics: {
    // 开源模板：统计默认关闭、ID 清空（示例不含真实测量 ID）；部署前替换为你的 ID 并开启。
    enabled: false,
    // GA4 衡量 ID，例：G-XXXXXXXXXX
    id: '',
  },

  microsoftClarity: {
    enabled: false,
    // Microsoft Clarity 项目 ID，例：abcdefghij
    id: '',
  },

  umami: {
    enabled: false,
    // data-website-id
    websiteId: '',
    // 主跟踪脚本地址，例：https://umami.example.com/script.js
    scriptUrl: '',
    // 数据上报地址，为空则使用脚本所在域
    hostUrl: '',
    // 自动初始化 pageview/click/performance 等跟踪
    autoTrack: true,
    // 本地缓存事件
    cache: false,
    // 只在指定域名运行，防止开发/预览环境污染数据
    domains: ['echogarden.example.com'],
    // 事件分组标签
    tag: '',
    // 自动跟踪出站链接（Umami v3.x 默认已开启，显式控制）
    trackOutboundLinks: true,
    // 收集 Core Web Vitals（Umami v3.1.0+）
    collectWebVitals: true,
    // 会话回放：开启时改用 recorder.js
    sessionReplay: {
      enabled: false,
      recorderUrl: '',
    },
  },
};
