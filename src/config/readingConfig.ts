// 阅读增强（消费层配置）：周刊详情页、影辑详情页、动态页的沉浸阅读。
// —— 改这里：开关。
import type { ReadingConfig } from '@t/reading';

export const readingConfig: ReadingConfig = {
  // 阅读增强总开关：开启后，周刊详情页、影辑详情页与动态页进入阅读态——
  //   背景呈原始态：隐藏全局背景层（无默认图、无透明度呼吸、无高光照片轮播）
  // 关闭时这三个页面与普通页面无异，零影响。纯静态部署同样适用（纯前端行为）。
  // 动态页 2026-10-13 曾移出、2026-10-15 重新纳入：它同样以连续正文为主，与另外两页只需纸面。
  // 联动面：新增作用页时要同步 ReadingMode 的挂载点与 AGENTS §4.1 / config/README 的作用页表述。
  enabled: true,
};
