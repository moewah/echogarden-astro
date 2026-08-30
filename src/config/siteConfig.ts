// 全站级配置（嵌套分组）：站点 / 主人 / 公告 / 背景 / 压缩。字段形状见 @t/siteConfig。
// —— 改这里：全站级配置，改动影响所有页面。
// —— 以下别动：板块级（albums/weekly/projects/links/donation/guestbook）与接口级（remoteBlog/memos/artalk）在各自文件。
import type { SiteConfig } from '@t/siteConfig';
import defaultBgImg from '@/assets/images/background/default-bg.jpg';

export const siteConfig: SiteConfig = {
  // ===== 站点身份 =====
  site: {
    // 主页档案号 N：填写纯数字 1–999（如 1，页面显示 001）；人工维护，不随其他页面启用/禁用而重排。
    archiveNo: 1,
    // 站点名（导航与 schema 品牌名；品牌不翻译）
    name: 'EchoGarden',
    // 浏览器标签标题后缀
    titleSuffix: '个人主页',
    // 站点根 URL（绝对地址，必须带尾斜杠）——开源模板暂时沿用作者主页地址，发布前替换为实际部署域名
    url: 'https://www.moewah.com/',
    // 站点类型：用于 Hero 网站档案卡，明确「这是个人主页，不是博客」。
    type: '个人主页模板',
    // 一句话标签（Hero 副标）
    tagline: '基于 Astro 的档案卷宗设计语言 MoeHome 重构版个人主页',
    // 座右铭（Hero 大标语）
    slogan: '构建 · 归档 · 分享',
    // 建站年份（页脚版权起始年）
    since: 2024,
    // 页脚版权行
    copyright: '© 2024–2026 EchoGarden',
    // 社交分享图（ogImage）：public/images/ 稳定 URL。
    // 开源模板内置一张档案风示例图，替换 public/images/og-cover.jpg 即可。
    ogImage: '/images/og-cover.jpg',
    // 站点描述（SEO 与 schema）
    description:
      'EchoGarden 是一个以「档案卷宗」为设计语言的个人主页开源模板：SEC 编号、戳记、登记卡等档案器件贯穿全站，周刊与影辑由内容集合驱动，全部板块走配置化开关。技术栈为 Astro 7 静态输出 + Tailwind CSS v4 + TypeScript，明暗双主题、8 色 token 设计系统。仓库内置示例数据（不含任何真实个人信息），fork 后替换配置即可部署。',
    // 站点首页关键词
    keywords: ['EchoGarden', '个人主页', '开源模板', 'Astro', '极简档案', '内容集合', '静态站点'],
    // Twitter/X 站点账号（含 @ 前缀），用于 <meta name="twitter:site">；没有则留空不注入
    twitter: '',
    // 非首页独立页面 SEO 配置（title / description / keywords），与 i18n UI 文案解耦
    // title 不含站点名，Layout 会自动拼接为「title - 站点名」
    seo: {
      pages: {
        weekly: {
          title: '周刊',
          description: 'EchoGarden 示例周刊：演示周刊索引页、详情页、分页与历史归档的完整形态。内容为示例文章，展示 markdown 排版、代码高亮与封面图，可整体替换为真实文章。',
          keywords: ['周刊', '示例', 'EchoGarden'],
        },
        photos: {
          title: '影辑',
          description: 'EchoGarden 示例影辑：演示专辑索引、详情与灯箱浏览。照片使用稳定的占位图服务，不包含任何真实影像，可整体替换为真实影辑。',
          // keywords 保留「影集」作搜索兼容（Google 已不将 keywords 当排名因素，仅供站内管理）
          keywords: ['影辑', '影集', '示例', 'EchoGarden'],
        },
        moments: {
          title: '动态',
          description: 'EchoGarden 的日常动态与技术随笔（示例）。',
          keywords: ['动态', 'EchoGarden'],
        },
        guestbook: {
          title: '留言',
          description: '欢迎留下你的想法、建议或闲聊（示例站点）。',
          keywords: ['留言', 'EchoGarden'],
        },
      },
    },
  },

  // ===== 站主人档案 =====
  profile: {
    // 你的名字（开源模板以项目名作为示例身份，部署前替换为真实姓名）
    name: 'EchoGarden',
    // 身份角色（About 登记卡 Role / 角色 行展示，对应 schema:Person.jobTitle）
    role: '个人主页模板 / Astro 开源项目',
    // 展示用头像：public/images/ 稳定 URL，不压缩，与 favicon 共用。
    // 换头像直接替换 public/images/avatar.webp；如需用其他路径/文件名，改下面字符串即可。
    avatar: '/images/avatar.webp',
    // 关注领域（About 登记卡 Focus / 领域 行展示，对应 schema:Person.knowsAbout）
    focus: [
      'Astro 静态站点',
      '极简档案设计',
      'Tailwind CSS',
      '内容集合',
      '配置化架构',
    ],
    // 自述（About 板块正文）
    statement:
      'EchoGarden 是一套以「档案卷宗」为设计语言的个人主页模板：SEC 编号、戳记、登记卡、索引卡……每个界面元素都在档案体系里有自己的位置。技术栈为 Astro 7 静态输出 + Tailwind CSS v4 + TypeScript strict；周刊与影辑由内容集合驱动，板块与接口全部配置化开关控制，外部服务（Memos / Artalk / GitHub / RSS）凭据走 .env 注入，拉取失败自动降级空态。仓库保持示例数据，fork 后替换 config 与内容集合即可搭建个人站点。',
    // 位置标识（展示文案，建议「城市, 省份」格式，用于 schema:Place）
    location: '杭州, 浙江',
    // 位置国家代码（ISO 3166-1 alpha-2，用于 schema:PostalAddress.addressCountry）
    locationCountry: 'CN',
    // 公开邮箱（页脚与友链 mailto 引用）
    email: 'admin@example.com',
  },

  // ===== 防骗公告 =====
  // 页脚与留言板块上方展示。
  notice:
    '本人不会主动邀请或联系任何人，任何冒用本人名义发布的一切信息，请务必谨防受骗！',

  // ===== 全局背景层 =====
  // 效果：背景开关与高光照片开关都开启时，默认图 + 高光影像随机轮播（呼吸漂移）；reduced-motion 下静止为默认图。
  background: {
    // 背景层总开关：关闭后全站不渲染背景层；开启后至少显示默认背景图。
    enabled: true,
    // 高光照片开关：true 才读取影辑高光并启用双层轮播；false 时只显示默认图。受 albumsConfig.enabled 联动影响，关闭影辑时自动退化为默认图。
    // 示例数据已在三个影辑中标注 6 张 highlight 照片，默认开启以演示轮播效果。
    highlightsEnabled: true,
    // 默认图：首屏优先加载，兼作「高光影像关闭 / 缺失 / 加载失败」时的兜底播放源。
    // 两种填法：
    //   ① 远程图：填完整 URL 字符串，如 'https://example.com/bg.jpg'（原样引用，不压缩）
    //   ② 本地图：import src/assets/images/ 下的图，如 `import bg from '@/assets/images/bg.jpg'; defaultSrc: bg`
    //     会按 siteConfig.images 配置进行构建压缩；压缩关闭时输出原图。
    defaultSrc: defaultBgImg,
    // 轮播间隔（毫秒）：默认图 + 影辑高光影像的切换间隔。
    interval: 9000,
  },

  // ===== 构建时图片压缩 =====
  // 作用范围：所有经 Astro Image / OptImage / getImage 处理的本地图
  // （src/assets、content 中 image() 引入的图、og:image 生成）。
  // 不适用：public/ 稳定 URL（头像 / favicon / ogImage 默认图）、远程 URL、memos 运行时图。
  images: {
    // 总开关：关闭后 OptImage 回退输出原图，构建零压缩。
    enabled: true,
    // 目标压缩格式，二选一：
    //   'avif' 体积最小（约为 webp 的 7 折），但兼容性较新（Chrome 85+ / Safari 16.1+）
    //   'webp' 兼容面更广（所有现代浏览器），体积略大
    format: 'avif',
    // 压缩质量（1–100）：越高越清晰、体积越大；80 是画质与体积的平衡点。
    quality: 80,
  },

  // ===== 字体配置 =====
  // mode: 'default' = Google Fonts 官方源 + 默认字体（Archivo + Noto Sans SC + IBM Plex Mono）
  // mode: 'mirror'  = 自定义镜像源 + 默认字体
  // mode: 'off'      = 不加载 Google Fonts，使用系统字体栈
  fonts: {
    mode: 'off',
    mirror: 'https://fonts.googleapis.cn',
  },
};
