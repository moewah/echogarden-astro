// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { APIRoute } from 'astro';
import { generateLlmsTxt } from '@/utils/llms';

export const GET: APIRoute = async () => {
  const body = await generateLlmsTxt();
  // 机器消费的 Markdown 直接返回 UTF-8 文本，不额外添加 BOM，避免严格解析器将其当成首字符。
  // Content-Type 写 text/plain：本路由是预渲染的，产物由部署方（静态托管 / nginx）按扩展名下发，
  // 此处声明的类型到不了客户端——声明必须与线上实际一致，否则将来该路由转为动态（SSR）时，
  // 错声明的类型会随 nosniff 变成真错误。
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
