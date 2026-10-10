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
    // 只在指定域名运行，防止开发/预览环境污染数据
    domains: ['echogarden.example.com'],
    // 事件分组标签
    tag: '',
    // 收集 Core Web Vitals：输出 data-performance="true"（tracker 以 type=performance 上报）
    collectWebVitals: true,
    // 会话回放：开启后与 tracker 并列加载 recorder.js（recorder 自身不采集 pageview/事件，
    // 不能用它替换 tracker；它不认 data-domains，域名约束由 utils/analytics.ts 注入前判断）
    sessionReplay: {
      // 模板默认关闭：录屏属隐私判断，开启前先确认实例侧已开 Replays
      enabled: false,
      // recorder.js 地址，例：https://umami.example.com/recorder.js
      recorderUrl: '',
    },
  },
};
