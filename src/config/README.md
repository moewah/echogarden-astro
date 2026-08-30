# 配置文件说明

本目录是**用户级配置的唯一入口**——接手本项目只需改这里 + `src/content/`(内容)+ `.env`(凭据),不碰任何组件与逻辑代码。

## 目录结构(按五维)

| 维度 | 文件 | 管什么 |
|---|---|---|
| 全站级 | `siteConfig.ts` | 嵌套分组：`site`（站点名/URL/描述/版权/ogImage）/ `profile`（名字/头像/身份/自述/邮箱）/ `notice`（防骗公告）/ `background`（背景图开关/默认图/轮播间隔）/ `images`（压缩开关/格式/质量） |
| | `routesConfig.ts` | 站点核心路由路径（首页/周刊/影辑/动态/留言/RSS/Sitemap） |
| ③ 页面 | `albumsConfig.ts` | 影辑总开关 |
| | `weeklyConfig.ts` | 周刊总开关 + 详情页评论开关 + 每页数量 |
| | `projectsConfig.ts` | GitHub 地址 + 兜底项目 |
| | `elsewhereConfig.ts` | 我在别处（外部触点）列表 |
| | `donationConfig.ts` | 赞助文案 + 方式(二维码/链接) |
| | `guestbookConfig.ts` | 留言须知文案 |
| ④ 接口 | `remoteBlogConfig.ts` | 外部博客 RSS 地址 / 开关 |
| | `memosConfig.ts` | 动态 tag 白名单 / 页面开关 / 折叠与截断 / 凭据读取 / 版本要求 |
| | `artalkConfig.ts` | Artalk 地址与站点名（凭据走 .env） |
| ⑤ 数据统计 | `analyticsConfig.ts` | Umami / GA / Clarity provider 开关与配置 |
| ⑤ LLMs | `llmsConfig.ts` | `/llms.txt` 生成配置：总开关 + 近期周刊/影辑数量 |
| ⑤ 阅读增强 | `readingConfig.ts` | 周刊/影辑详情页沉浸阅读：背景原始态开关 |

## 三条铁律

1. **配置零逻辑**:本目录只有数据与开关。API 契约、渲染管线、拉取编排全在 `src/utils/`——用户永远不需要看懂 CEL 或 marked。
2. **凭据进 .env**:Memos token、Artalk 地址等敏感项填 `.env`(模板见根目录 `.env.example`),config 只负责读取。开源时 .env 不进仓库。
3. **类型在 `src/types/`**:每个 config 对象的字段形状定义在 `src/types/` 对应领域文件（`albumsConfig.ts` ↔ `@t/albums`、`siteConfig.ts` ↔ `@t/siteConfig`）,改字段时两处同步(TS 会强制报错)。

## 上手步骤

1. 复制 `.env.example` 为 `.env`,填 `MEMOS_SITE_URL` / `MEMOS_ACCESS_TOKEN` / `ARTALK_SERVER` / `ARTALK_SITE`(不需要的功能留空即可,对应板块自动降级为占位提示)。
2. 改 `siteConfig.ts` 的 `site` / `profile` 组,换成你的站点与身份。
3. 按需开关:影辑 `albumsConfig.ts`、周刊 `weeklyConfig.ts`、背景 `siteConfig.ts` 的 `background` 组;开关联动导航与 SEC 编号,自动回收顺延。
4. 外部数据（RSS / Memos / GitHub）拉取失败时板块降级为空态（「内容暂时无法加载」），无兜底数据；接口可用即自动恢复。动态正文的折叠与截断字符数在 `memosConfig.ts` 的 `display` 组调整，按字段注释选择适合首页或详情页的值。
5. 内容数据（文章/影辑）在 `src/content/`，不在这里。

## 导入方式

```ts
import { siteConfig, elsewhereConfig } from '@config/index'; // 推荐:统一出口
import type { SiteConfig } from '@t/siteConfig';        // 类型:来自 src/types/
```
