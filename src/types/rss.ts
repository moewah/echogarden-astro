/** 站点 RSS 配置维度 */

export interface RssConfig {
  /** RSS feed 描述模式：summary = 仅摘要+封面，full = 全文内容 */
  descriptionMode: 'summary' | 'full';
}
