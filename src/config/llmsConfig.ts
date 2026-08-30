// ④ 接口：LLMs.txt 生成配置。字段形状见 @t/llms。
// —— 改这里：调整近期条目数量。
// —— 以下别动：生成逻辑在 src/utils/llms.ts，内容从 config / content 动态读取。
import type { LlmsConfig } from '@t/llms';

export const llmsConfig: LlmsConfig = {
  // 是否生成 /llms.txt 并在 Layout 注入 <link rel="describedby">
  // false = 构建不输出 /llms.txt，HTML 也不声明 describedby
  enabled: true,
  // 近期周刊条目数（按 date 倒序取最新 N 期）
  recentWeeklyCount: 10,
  // 近期影辑条目数（按索引排序取最新 N 个）
  recentAlbumsCount: 10,
};
