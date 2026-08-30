// 阅读增强（消费层配置）：周刊详情页与影辑详情页的沉浸阅读。
// —— 改这里：开关。
import type { ReadingConfig } from '@t/reading';

export const readingConfig: ReadingConfig = {
  // 阅读增强总开关：开启后，周刊详情页与影辑详情页进入阅读态——
  //   背景呈原始态：隐藏全局背景层（无默认图、无透明度呼吸、无高光照片轮播）
  // 关闭时两个详情页与普通页面无异，零影响。纯静态部署同样适用（纯前端行为）。
  enabled: true,
};
