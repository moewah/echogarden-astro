// ③ 页面：本地周刊（技术 / 工具 / 学习 / 阅读 四栏目）。字段形状见 @t/weekly。
// 内容载体：src/content/weekly/*.md，frontmatter 约定见 src/content.config.ts。
import type { WeeklyConfig } from '@t/weekly';

export const weeklyConfig: WeeklyConfig = {
  // 周刊索引页档案号 N：填写纯数字 1–999（如 1，页面显示 001）；人工维护，关闭周刊时页面不生成但编号不回收。
  archiveNo: 1,
  // 总开关。true = /weekly 索引 + /weekly/[slug] 内页 + 首页「近期周刊」板块 + 顶栏 + SEC 编号；
  // false = 全部关闭并回收 SEC 编号。与外部博客 RSS（remoteBlogConfig.ts）独立并存，各自开关互不干扰。
  enabled: true,
  // 周刊详情页评论区开关。依赖 artalk 配置（.env）；server/site 未配置时自动降级为占位提示。
  comments: true,
  // 索引页每页条目数。超过后生成 /weekly/page/N/，首页保持 /weekly/。
  perPage: 10,
  // 首页「近期周刊」板块展示的最新期数（如 3）。
  // 联动面：仅影响首页 Weekly 板块取数，与索引页 perPage 相互独立；enabled=false 时整块不渲染，此值不生效。
  // 降级：留空或 0 时首页板块不展示任何条目（板块仍会因 posts.length===0 而整体隐藏）。
  homeLimit: 4,
  // 详情页历史期刊列表最多展示的条数。填写非负整数；0 = 不展示历史条目，但历史总数仍保留。
  // 联动面：仅影响周刊详情页的「历史期刊」列表，不影响周刊索引页 perPage、首页 homeLimit 或列表右上角的历史总数。
  // 降级：超过实际历史期刊数时按实际数量展示；设为 0 时保留历史区标题和总数，列表为空。
  historyLimit: 10,
};
