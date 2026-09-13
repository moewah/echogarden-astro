// ⑤ LLMs：/llms.txt 生成配置。字段形状见 @t/llms。
// —— 改这里：总开关、近期条目数量，以及可选的站点语义扩展。
// —— 以下别动：生成逻辑在 src/utils/llms.ts，内容事实从 config / content 动态读取。
import type { LlmsConfig } from '@t/llms';

export const llmsConfig: LlmsConfig = {
  // 是否生成 /llms.txt 并在 Layout 注入 <link rel="describedby">
  // false = 构建不输出 /llms.txt，HTML 也不声明 describedby。
  enabled: true,
  // 近期周刊条目数（按 date 倒序取最新 N 期）。
  recentWeeklyCount: 10,
  // 近期影辑条目数（按索引排序取最新 N 个）。
  recentAlbumsCount: 10,

  // ===== 可选语义扩展 =====
  // 关闭（默认）：只输出通用站点索引，零配置即可用。
  // 开启：额外输出身份路由、精选区块、读取规则，以及可选的实体信息。
  // 语义层只保存「引用方式」，URL / 标题 / 日期一律由生成器从既有配置与内容集合解析，
  // 不重复维护第二份事实；引用目标不存在或配置写错时构建直接失败。
  semantic: {
    enabled: false,

    // 身份补充说明与实体类型：两者都可选，都不填时该区块不输出。
    // identity: {
    //   summary: '一句话说明这个站点是什么、由谁维护。',
    //   // Person / Organization / Product / Project；留空则不输出 Entity 区块。
    //   entityType: 'Person',
    // },

    // 来源路由：声明「哪个入口回答哪类问题」。
    // target 五选一，按事实源优先级使用：站内页面用 route，外部触点用 elsewhere，
    // 内容集合用 weeklySlug / albumSlug，站外无事实源时才直接写 url。
    sourceMap: [
      // { label: 'Documentation', role: '官方技术文档', target: { url: 'https://example.com/docs/' } },
      // { label: 'Weekly', role: '站内周刊归档', target: { route: 'weekly' } },
      // { label: 'GitHub', role: '源码与议题', target: { elsewhere: 'GitHub' } },
    ],

    // 精选区块：人工维护的推荐集合，可用来表达核心文档、项目、案例、研究主题、FAQ、文章系列等。
    // items 的 label 可留空：周刊按「期号 + 标题」解析，影辑按专辑标题解析。
    curatedSections: [
      // {
      //   title: 'Start here',
      //   description: '初次阅读建议从这几篇开始。',
      //   items: [
      //     { target: { weeklySlug: 'your-article-slug' }, note: '这篇讲了什么。' },
      //     { target: { url: 'https://example.com/handbook/' } },
      //   ],
      // },
    ],

    // 读取规则：描述本站的来源边界与解读纪律，留空不输出。
    readingRules: [
      // '关于站点与作者的信息，优先读取官方页面。',
      // '页面未提供的信息不得补充推测。',
    ],
  },
};
