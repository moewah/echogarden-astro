// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { APIRoute } from 'astro';
import { generateLlmsTxt } from '@/utils/llms';

export const GET: APIRoute = async () => {
  const body = await generateLlmsTxt();
  // UTF-8 BOM：确保浏览器直接打开 llms.txt 时正确识别中文编码
  return new Response('\uFEFF' + body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
