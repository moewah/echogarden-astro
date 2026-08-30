/** ③ 页面：本地周刊 */
export interface WeeklyConfig {
  /** 周刊索引页档案号 N：1–999，人工维护，不随开关或内容排序重排。 */
  archiveNo: number;
  enabled: boolean;
  comments: boolean;
  perPage: number;
  homeLimit: number;
  historyLimit: number;
}
