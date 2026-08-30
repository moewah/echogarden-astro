/** ④ 接口：LLMs.txt 生成配置 */
export interface LlmsConfig {
  /** 是否生成 /llms.txt 及 Layout 的 describedby 链接 */
  enabled: boolean;
  /** 近期周刊条目数 */
  recentWeeklyCount: number;
  /** 近期影辑条目数 */
  recentAlbumsCount: number;
}
