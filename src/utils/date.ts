// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

/** 档案时间戳格式：YYYY.MM.DD */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '.');
}
