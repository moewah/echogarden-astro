# 更新日志

EchoGarden（echogarden-astro）的版本变更记录。版本号遵循语义化版本，git tag 与本文档段落一一对应。

## 0.3.0 - 2026-10-14

自上版（0.2.3）以来的界面基座与内容版面重构，外加 Artalk / Memos 的兼容性对齐。**含配置层面的破坏性变更**，升级前先看文末「升级提示」。

### 新功能

- **动态页改为索引栏 + 记录栏双排布版面**：`/moments/` 从「PageHeader + 一列卡片」换成编目工作台
  - 左索引栏 = 标签索引（带条数）/ 可跨年的日期索引日历 / COLLECTION 收录规则；右记录栏可在**卡片栏与瀑布流**之间切换，选择记入 `localStorage`
  - 卡片改三带结构（头像与作者名 + 分类胶囊 / 正文 / 编号与日期）；作者信息取 Memos 用户表，查不到时降级回站主身份
  - 展示条数收成一处配置 `memosConfig.display.limit`（默认 30）：页面、增量端点、`getMemos` / `syncMemos` 默认值共读同一字段
  - 记录栏头行控件与 Artalk 分页 / 表情插件按钮同档为 30×30（图标 15px），记录数从列表尾注移到头行刷新键左侧，展示方式字形 `◫` → `▥`（与 `▤` 同族同墨迹）
- **留言区（Artalk）并入档案语言**：仍是覆盖层（CSS 覆盖 + 注入 DOM + MutationObserver），不 fork、不自建表单
  - 编辑器改 01–04 字段行：序号 + mono 英文标签 + 无边框 / 无底色 / 无圆角的值 + 字段间虚线，中文提示下沉为 placeholder
  - 状态件（回复 / 取消编辑）抽成编辑器顶部独立状态栏，无状态时整条隐藏；工具条只剩插件按钮 + 发送
  - 表情面板只对颜文字分组卡片化、筛选行移到面板顶部；分页并入站内分页语言（含禁用态）；空态并入站内空态排版
  - 评论条目收整：归档单内衬 24 → 20px；头像 50×50 → 30×30、正文列起点回到与表单标签列对齐；表情筛选行四边不描线（分界交给 active 的 accent 下划线）；颜文字卡片补常态透明描边 + 悬停升 accent，与 Emoji / 图片组同一套悬停语言
- **灯箱**：控件收进底部横档（原先绝对定位浮在图上，图一撑满舞台就压图），新增 FIT ⇄ 1:1 缩放——锚点缩放一条路径供按钮 / 滚轮 / 捏合 / 双击共用，放大后可拖拽平移并夹住边界
- **全站基座纪律**：焦点环 / 断行 / 滚动条 / 按压态统一；正文链接下划线改为发丝线、悬停升 accent；出链标记 `↗` 统一为 mono 10.5px
- **排版体系**：正文 15px + 标题六级等比梯度；mono 元数据字号收敛为四档（12 / 11.5 / 10.5 / 10px）；引用块取消合成斜体（`em` / `i` 不受影响）
- **字体**：sans 字族最终定为 Mulish，字体栈按平台补齐 CJK 后备；默认加载模式 `off` → `mirror`，开箱即得跨平台一致的混排
- **顶栏与 Hero**：导航居中到页面中轴（`/ ARCHIVE` 后缀在 md–lg 段隐藏，为导航留余量）；Hero 大标题加容器宽约束（大屏不再溢出贴上 SPEC 卡）；移动端菜单汉堡 ↔ 关闭图标
- **首页板块**：近期文章改条码封签目录卡（BARCODE 器件）；项目展示改条目块（撤表头、三列基线对齐）；板块底部收束行间距统一 24px
- **周刊详情页**：文末版权块定为档案卡片面；卷首提要独立成栏；悬浮目录去序号前缀、目录层级收齐；代码块改为语言标签栏 + 常驻复制按钮（移除行号）

### 修复

- **Memos 正文渲染管线**：单换行不再丢成空格（开 `breaks`）；行尾两空格硬换行不再被删；tag 清理不再吃掉 shebang、`#fff`、`#anchor`；脚注定义不再产出站内死链
- **动态卡片内联插图**：`![](/file/attachments/{uid})` 不再被当站内路径解析（404 破图），也不再与附件图墙重复渲染同一张图；卡片内图片去 FIG 标签 / 边框 / 底色（FIG 只在灯箱里体现）
- **图片占位与防塌陷**：容器新增 `is-loaded` 状态——未载入保底 `min-height`、载入后撤销、破图留在占位态
- **SEO 与内容**：`sitemap.xml` 的 `lastmod` 改为逐页内容日期；RSS 正文互文链接绝对化；影辑 `date` 改为必填（示例影辑补 date）
- **首页与动态页细节**：近期文章卡片标题尾重复的出链标记移除；项目展示语言圆点 `--accent` → `--faint`、移动端编号与语言间距放宽；关于我登记卡戳记窄屏不再折行（11.5px → 10.5px）；Hero 的「在 线」戳记移除
- 留言页左侧栏在收窄窗口后不再压在归档单上；动态页移出阅读模式作用范围（作用页收回「周刊详情 + 影辑详情」）

### 兼容性

- **Artalk 2.10**（放行 `2.10.x`）：锚点 `artalkConfig.version`，实测 **2.10.0**；主次版本不符时评论区显示空态、构建不炸
- **Memos 0.31**（放行 `0.31.x`）：锚点 `memosConfig.version`，实测 **0.31.0**；版本比对按主次版本，同一主次版本的补丁号自动放行
- **运行环境**：`engines.node` ≥ 22.12.0；依赖升级到 Astro 7.3.8、`@astrojs/node` ^11.1.7、marked ^18、Shiki ^4.5、TypeScript 6
- **统计**：Umami 会话回放与 tracker 并列加载、清掉失效字段（统计关闭时产物零统计代码）

### 升级提示

- **`memosConfig.display` 字段变更**：`truncate` 与 `collapseThreshold` 已删除，改为单一 `limit`（展示条数上限，默认 30）。沿用旧字段会在 `astro check` / 构建时报类型错误，删掉那两行即可；`limit` 同时决定增量同步端点的比对集合，不要在调用点多处各写一个数字
- **i18n key 变动**：新增 `comments.labelName/labelEmail/labelLink/labelMessage` 与 `comments.hint*`；删除孤儿键 `hero.online`、`i18n.sections.guestbook.en`、`i18n.sections.moments.en`（自定义翻译时同步）
- **静态部署**：`memosConfig.refresh.enabled` 必须保持 `false`（`npm run build` 会在配置加载阶段拦截并提示）；要做增量刷新改用 Hybrid 模式（`npm run build:server` + Node 运行时）

## 0.2.3 - 2026-09-21

### 新功能

- **周刊 RSS 摘要模式补「阅读全文」链接**：`summary` 模式下条目只有封面图 + 摘要段落，订阅者读完点不进原文；`full` 模式不加（本就是全文，链接多余）

### 修复

- **RSS 内容处理加固**（两处外部 / 生成内容此前没有边界处理）
  - `rss.xml`：`description` 用字符串拼接 CDATA，内容里出现 `]]>` 会提前闭合 CDATA 段、产出非法 XML；改为 `wrapCdata` 拆分结束序列（保留原内容并保持外层 XML 合法）；封面图 URL 补 `escapeXml`（与同一标签内的 `alt` 一致）
  - `remoteBlog`：摘要原样透传，带 HTML 的摘要会打坏卡片结构；新增 `toPlainText`（先拆 CDATA 壳，再去注释、`script`/`style` 与标签，块级标签转空格，空白归一）统一输出纯文本
  - `decodeEntities` 补齐：命名实体大小写不敏感、补 `&apos;`、支持 `&#x4e2d;` / `&#20013;` 数值实体；越界码点原样保留不抛异常
- **远端文章卡片等高改由容器约束**：原先在标题行用 `min-h-[2lh]` 占位，窄屏单列时会多留一行空白；改为容器 `md:min-h-[180px]`——桌面端由容器统一最小高度保证网格内等高，移动端不再强制占位
- **字重声明对齐可达集合**：`<strong>` / `<b>` 在 `global.css` base 层显式钉住 600——UA 默认的 `bolder` 会跳到未声明的 700 / 900，同一行中英混排会变成两种重量
- **`/llms.txt` 的两处声明与实际不一致**：路由声明的 `Content-Type` 改回与线上实际一致的 `text/plain`；`describedby` 去掉 `type="text/markdown"`
- **项目板块的 GitHub 地址换成示例值**：模板内置示例数据，不应指向作者真实账号——fork 后会直接拉取作者仓库、跳转到作者主页

### 构建

- **memos 同步端点改为 server 模式注入**：端点是全站唯一动态路由，此前靠 `build-static.mjs` 在构建前把 `src/pages/api/memos/sync.ts` 临时 rename 出去、`finally` 再恢复
  - 端点移到 `src/endpoints/memos-sync.ts`，由 `astro.config.mjs` 的 `memosSyncRoute` 集成仅在 `BUILD_MODE=server` 时 `injectRoute`；`build-static.mjs` 的移文件机制整段删除，只留 `BUILD_MODE=static` 与产物校验
  - **顺带修好一条长期失效的路径**：静态 profile 下 `astro preview` 原先必报 `No adapter found`——Astro 看到源码树里那条未预渲染路由会把 `buildOutput` 判成 `server`，而纯静态构建没有 adapter；端点移出路由树后 `astro preview` 裸跑即起（静态走静态预览分支，server 模式由 adapter 服务）
  - `prerender: false` 必须显式传给 `injectRoute`：注入路由取 `prerenderInjected ?? 默认值`，而默认值 =（`output !== 'server'`），本项目不设 `output`
- **`projectsConfig` 补显式类型契约**：新增 `src/types/github.ts`，消除全站最后一个无类型注解的配置对象

### 文档

- **AGENTS 与 `config/README` 对齐代码事实**：校正过期规则（板块间距是 `pt-` 而非 `py-`、编号体系 `MW-PRJ` / `MW-CAT` / `FORM CORR-01`、`rounded-full` 例外清单、`.img-ph--post`、mono 字距区间）、消除重复事实源（config 清单收敛到 `config/README.md` 单一事实）、补文档缺口（悬浮链 token、字体加载三态、`utils/og.ts` 按页出图、产物守卫、端点注入规则）
- 清掉方案 B 执行后残留的「兜底项目 / 兜底文章 / 兜底数据 / 回退 config 内置静态数据」描述——实现是「拉取失败返回 `null` → 组件渲染空态」，注释与清单与实现相反会误导维护

## 0.2.2 - 2026-09-16

### 修复

- **阅读深度埋点的两处实现缺陷**（`weekly-scroll-depth` / `weekly-read-complete`）
  - 分母混算视口相对与文档相对坐标：`rect.top + offsetHeight − innerHeight − docTop` 展开后含 `−scrollY`，分母随滚动递减、各档阈值提前触发（100% 档约在真实滚动量一半处上报）；改为 `max = offsetHeight − innerHeight`，与滚动位置无关。连带修掉旧式在「滚动量 ≥ 正文高 − 视口高」后静默停止上报的中途断流
  - 完读判定原先只在滚动事件里比对停留时长，「先滚到底、再慢慢读完」被漏判；改为滚到 100% 时若停留不足则挂定时器到门槛复核
  - 守卫改用 `!(readGate > 0)`：原先的 `readGate <= 0` 对 NaN 放行，会让每个到过底的读者立即被上报为 Reader
  - **口径断裂点**：深度分布与完读率的基线自本次起重新起算，与修复前的数据不可直接比较
- **首页登记卡左侧轨道落到留白中点并垂直居中**：发丝线与三颗打孔的横向位置由写死的 `21px` 改为与左侧留白同源（组件内 `--gutter`，卡片 `padding-left` 与轨道宽度共用一处事实），宽屏不再偏 20px（1440 视口原偏 −20.5px，移动端本就接近正确）；打孔改以自身中心定位，三颗点等距（23% / 50% / 77%）且点组中心落在卡片垂直中线；顺带清掉三个内联 `style`
- **页面标题与 SEO / JSON-LD 共用一处事实源**：`/moments/`、`/guestbook/`、影辑分页、周刊分页的页头标题与 JSON-LD 栏目名改取 `siteConfig.site.seo.pages.*.title`，不再取导航文案 `i18n.sections.*.title`——两套名字分叉时会出现「页面显示名 ≠ SEO 与分享卡片」。当前两处取值相同、产物不变，属消除未来漂移的潜伏修复
- **`/llms.txt` 栏目名同源**：`introSection` 与 `corePagesSection` 的栏目名改取 SEO 页名，与页面 `<title>`、JSON-LD 共用一个事实源；`llms.ts` 不再引用 `i18n.sections`（同为潜伏修复，产物不变）

## 0.2.1 - 2026-09-14

### 新功能

- **LLMs 语义扩展（可选，默认关闭）**：`llmsConfig.semantic` 支持身份路由（`sourceMap`）、精选区块（`curatedSections`）、读取规则与可选的实体元信息（`identity.entityType`）
  - 引用目标支持五种解析：站内路由 `route`、外部触点 `elsewhere`、内容集合 `weeklySlug` / `albumSlug`、站外 `url`；配置只保存引用，标题与 URL 由生成器从既有事实源解析
  - 板块开关关闭属合法降级（不输出、不留死链）；引用不存在或配置写错则**构建失败**并点名具体引用
  - 默认 `enabled: false`，零配置即可用；实体字段全部复用既有事实源，缺字段不输出、不生成虚假默认值
- **周刊文末分享升级为渠道菜单**：8 个渠道（系统分享 / X / Telegram / LinkedIn / Bluesky / Mastodon / 邮件 / 复制链接）
  - 支持键盘操作：`aria-haspopup` / `aria-expanded` 同步、Esc 关闭并回焦、外部点击关闭
  - 复制成功与失败状态同步到分享行副文案（`aria-live`），2.2s 后回退

### 修复

- `/llms.txt` 的概览段与核心页面入口改为随板块开关联动：关闭的板块不再被列为当前栏目、不再留下死链
- 核心页面与概览段的开关规则与语义层降级规则统一，消除同一文件内两套规则并存

### 样式

- **正文排版统一**：行高 1.9、段落与列表间距 1.1em；段与行的视觉间隙比由 1.52× 提升到 2.22×，长文分段更清晰
- 周刊详情、影辑正文、动态卡片改用同一套排版规则（`:is(.markdown-body, .album-body)`），删除影辑页与全局重复的 68 行规则，杜绝两处维护造成的数值漂移
- 影辑正文字号统一到 16px，与周刊一致

### 变更

- 站点占位地址改为 `https://example.com/`；外部博客占位改为示例站点与 `示例博客`——开源模板的默认值不再指向作者的真实站点

### 文档

- 配置说明补 LLMs 语义层字段表、引用方式与降级/报错规则
- 根 README 的 Nginx 示例补 `txt | xml` 的 charset 声明（避免纯文本产物在浏览器中乱码）

## 0.2.0 - 2026-09-13

首个开源发布。`0.1.0` 为开源前的内部版本号，未单独发布，其内容并入本次发布一并记录。

### 新功能

- **周刊详情页阅读工具改右下角悬浮链**：返回顶部 · 目录 · AI 辅助 · 公众号二维码四件统一为 44×44 方形控件、间距统一 8px；PC 不再单独占用右侧轨道，移动端不再有文末归档单
- **悬浮链坐标变量化**：`--float-base` / `--float-step` / `--float-qr-offset` 三个 token 派生全链位置，公众号入口关闭时整链自动下移，链上不留空洞
- **周刊文末归档签章式分享行**：分享作为「读后才做的动作」从阅读中工具分离，PC 与移动表现一致
- **周刊文末可折叠引用块**：原文链接 / 引用行 / 条款声明三段；折叠零 JS，引用行一键复制（clipboard API + textarea 降级）
- **公众号二维码入口**：右下角悬浮按钮，点击向上展开二维码卡片；`siteConfig.wechat` 分组控制开关与展示信息
- **阅读行为埋点**：正文滚动深度、完读判定（深度 100% 且停留达预估时长一半）、正文互文链接点击、目录点击层级

### 修复

- 灯箱：切换 / 关闭按钮闲置淡出，动态图不再重播闪烁（同 URL 不重设 `src`，关闭不删 `src`）
- 灯箱：修复淡出永不触发——初始程序化 focus 阻断判定，改用 `:focus-visible`

### 文档

- README 补项目题记「回响花园宣言」

### 构建

- 双构建 profile 正式化：`npm run build`（纯静态，任意托管）与 `npm run build:server`（Hybrid，Node 增量刷新）
- 静态构建附带产物校验：确认产物内无 `dist/server`、无 `/api/memos/sync`
