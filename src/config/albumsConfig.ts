// ③ 页面：影辑总开关。字段形状见 @t/albums。
// 发行默认关闭；本站已启用。
import type { Albums } from '@t/albums';

export const albumsConfig: Albums = {
  // 影辑索引页档案号 N：填写纯数字 1–999（如 1，页面显示 001）；人工维护，关闭影辑时页面不生成但编号不回收。
  archiveNo: 1,
  // 总开关。关闭时的联动面：
  // /photos 索引跳 404、专辑页不生成、首页高光影像与导航隐藏、
  // 首页 SEC 编号自动回收顺延、背景图播放池退化为默认图。
  // 内容数据：src/content/albums/*.md（一个 md 一个专辑）。
  enabled: true,
  // 索引页每页条目数。超过后生成 /photos/page/N/，首页保持 /photos/。
  perPage: 9,
};
