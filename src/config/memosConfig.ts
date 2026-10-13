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
  // 动态页（/moments/）与增量同步端点的 tag 白名单：只展示带这些 tag 的公开 memo。
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
  // 该开关只控制前端能力，不切换构建模式；端点由 server 模式（build:server）的 node adapter 提供运行时。
  // 静态部署（build:static / npm run build）时请保持 false——构建会在 astro.config.mjs 抛错拦截（静态模式不支持增量刷新）。
  refresh: {
    // 增量刷新开关：true 时动态页渲染刷新按钮并经 /api/memos/sync 同步；
    // false 时隐藏按钮并保留构建时快照。
    // 与构建模式的关系：server（build:server）可配 true/false（true 才有刷新能力）；
    // static（build:static）必须 false，否则构建失败提示。
    enabled: false,
  },
  // 动态列表展示参数：只控制列表规模，不影响拉取与白名单。
  display: {
    // 展示条数上限：动态页取最近 N 条（createTime 倒序），**同一个值同时决定增量同步端点的比对集合**，
    // 所以只能在配一处——页面与端点读的是同一个 `memosConfig.display.limit`。
    // 调大 = 单页更长、构建与首屏更重；调小 = 更早的记录不可见（页面本身不分页）。
    // 降级：不合法值（0/负数）会让列表为空，没有兼容处理，请写正整数。
    limit: 30,
  },
  // 接口版本锚点：构建期通过 /api/v1/instance/profile 校验；主次版本不符时动态页显示空态。
  // 只锚定主次版本（`0.31` 放行 0.31.x，拦 0.32+），补丁号不进锚点；升级后端到新的主次版本才改这里。
  version: '0.31',
};
