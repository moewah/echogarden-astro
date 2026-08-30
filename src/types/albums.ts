/** ③ 页面：影辑 */
export interface Albums {
  /** 影辑索引页档案号 N：1–999，人工维护，不随开关或内容排序重排。 */
  archiveNo: number;
  enabled: boolean;
  perPage: number;
}
