// ③ 页面：项目板块。字段形状见 @t/github（utils）。
// —— 改这里：GitHub 地址。
// —— 以下别动：API 契约、筛选排序、条目编号、拉取编排 → utils/github.ts。

export const projectsConfig = {
  // 板块总开关：默认关闭（开源模板默认不展示项目板块，部署后自行开启）。
  // 联动面：关闭时首页板块不渲染、hero 导航项隐藏、SEC 编号回收顺延（sections.ts）。
  enabled: false,
  // GitHub 主页地址。用途：① 提取 owner 拉取公开仓库 ② 板块「更多」跳转链接。
  // 两种填法都支持：用户主页（https://github.com/moewah）或具体仓库（https://github.com/moewah/echogarden-astro），
  // owner 提取逻辑见 utils/github.ts（取路径第一段）。
  // 拉取规则（utils/github.ts）：原创 + 非归档 → 高人气 4 条（star 降序）+ 最新 1 条（pushed_at 降序），
  // 条目编号 MW-NNN 自动生成。拉取失败板块降级空态（无兜底数据，方案 B）。
  github: 'https://github.com/moewah',
};
