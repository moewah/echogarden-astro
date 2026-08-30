// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

/**
 * 页面档案号格式化：编号是配置数据，不随页面开关或内容排序自动重排。
 * N 只允许 001–999，展示统一为三位数字。
 */
export function archiveCode(prefix: string, no: number): string {
  if (!Number.isInteger(no) || no < 1 || no > 999) {
    throw new Error(`Archive number must be an integer from 1 to 999: ${no}`);
  }

  return `${prefix}-${String(no).padStart(3, '0')}`;
}
