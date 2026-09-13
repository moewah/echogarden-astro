// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { APIRoute } from 'astro';
import { generateLlmsTxt } from '@/utils/llms';

export const GET: APIRoute = async () => {
  const body = await generateLlmsTxt();
  // 机器消费的 Markdown 直接返回 UTF-8 文本，不额外添加 BOM，避免严格解析器将其当成首字符。
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
