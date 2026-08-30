// ④ 接口：外部博客（RSS 源）。字段形状见 @t/remoteBlog。
// —— 改这里：开关、地址。
// —— 以下别动：RSS 拉取与解析契约 → utils/remoteBlog.ts。
import type { RemoteBlogConfig } from '@t/remoteBlog';

export const remoteBlogConfig: RemoteBlogConfig = {
  // 总开关：默认关闭（开源模板默认不展示外部博客板块，部署后自行开启）。
  // false = 不 fetch、不展示 RSS 板块。
  // 与周刊（weeklyConfig.ts）独立并存：weekly 开启时首页「近期周刊」与「近期文章」两块各显示各的。
  enabled: false,
  // 博客站点主页（板块「全部记录」跳转链接）
  url: 'https://blog.moewah.com',
  // 博客名（Hero 展示）
  name: '喵斯基部落',
  // RSS 订阅地址
  feedUrl: 'https://blog.moewah.com/rss.xml',
  // 拉取条数上限（首页展示由组件截断，此值保证去重后仍有足够余量）
  poolSize: 12,
};
