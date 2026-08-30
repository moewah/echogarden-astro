// ④ 接口：动态板块（Memos）。字段形状见 @t/memos（Memo 在 utils/memos）。
// —— 改这里：tags 白名单；地址与 token 走 .env。
// —— 以下别动：API 契约、CEL filter、附件 URL 拼法、markdown 渲染、拉取编排 → utils/memos.ts。
import type { MemosConfig } from '@t/memos';

// 实例地址与访问凭据：.env 注入，变量名 MEMOS_SITE_URL / MEMOS_ACCESS_TOKEN。
// URL 必填；token 可选——Memos 开启匿名公开访问时可不填（拉取不带 Authorization 头），
// 未开匿名且无 token 时拉取失败 → 动态板块降级为「内容暂时无法加载」空态（不报错）。
const auth = {
  siteUrl: (
    import.meta.env.MEMOS_SITE_URL || process.env.MEMOS_SITE_URL || ''
  ).replace(/\/$/, ''),
  token:
    import.meta.env.MEMOS_ACCESS_TOKEN || process.env.MEMOS_ACCESS_TOKEN || '',
};

export const memosConfig: MemosConfig = {
  // 动态页档案号 N：填写纯数字 1–999（如 1，页面显示 001）；人工维护，关闭动态时页面不生成但编号不回收。
  archiveNo: 1,
  // 主页动态展示的 tag 白名单：只展示带这些 tag 的公开 memo。
  // 新增偏好直接往数组加字符串即可；只拉 PUBLIC 可见性，私密内容永不展示。
  // 开源模板：示例标签，部署前替换为你的 Memos 标签。
  tags: ['示例标签一', '示例标签二', '示例标签三'],
  // 实例地址与访问凭据（.env 注入，读取逻辑见上方 auth）
  auth,
  // 是否已配置 Memos（URL 必填即视为已配置；token 可选，见上方 auth 注释）
  enabled: Boolean(auth.siteUrl),
  // 动态页 /moments/ 与导航入口的显示开关；关闭时页面跳 404、sitemap 排除。
  pageEnabled: true,
  // 增量刷新开关：开启后动态页渲染刷新按钮，点击后经 /api/memos/sync 同步新增/删除/修改。
  // 该端点由 node adapter 提供动态运行时（astro.config.mjs）；纯静态部署（无 SSR 运行时）时
  // 保持 false，按钮不渲染、页面行为与旧版完全一致。开启需同时满足：部署支持 SSR 端点。
  refresh: {
    // 增量刷新开关：开启后动态页渲染刷新按钮，点击后经 /api/memos/sync 同步新增/删除/修改。
    // 该端点由 node adapter 提供动态运行时（astro.config.mjs）；
    // —— 部署模式切换 ——
    //   纯静态（默认，本值为 false）：构建产物仅静态文件，动态页无刷新按钮。
    //   memos 增量刷新（需同时两处）：本值改 true + astro.config.mjs 中启用 node adapter，
    //   产物含 dist/server，用 node 运行 dist/server/entry.mjs 并提供 /api/memos 反代。
    enabled: false,
  },
  // 动态正文展示参数：只控制内容截断与长文折叠，不影响拉取条数与图片附件。
  display: {
    // 截断字符数：0 表示不截断；建议首页摘要使用 180–300（240 为均衡值），详情页建议 0 保留完整正文。
    // 截断发生在渲染前；若希望长文继续使用折叠，请将此项设为 0，或设为高于折叠阈值的值。
    truncate: 0,
    // 超过此纯文本字符数的动态默认折叠；0 表示关闭自动折叠（默认）。建议开启时使用 400–800，500 适合手机与桌面兼顾。
    collapseThreshold: 0,
  },
  // 接口版本锚点：构建期通过 /api/v1/instance/profile 校验；不匹配时动态页显示空态。升级后端 Memos 时同步改这里。
  version: '0.30.0',
};
