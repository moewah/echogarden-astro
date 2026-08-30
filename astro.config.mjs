import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import fs from 'node:fs';
import { llmsConfig } from './src/config/llmsConfig.ts';
import { externalLinksConfig } from './src/config/externalLinksConfig.ts';
import { siteConfig } from './src/config/siteConfig.ts';
import { memosConfig } from './src/config/memosConfig.ts';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinksHastPlugin } from './src/utils/rehypeExternalLinks.ts';
import { contentImagesHastPlugin } from './src/utils/rehypeContentImages.ts';

/** 关闭 LLMs.txt 时，在构建完成后删除 dist/llms.txt */
function llmsTxtCleanup() {
  return {
    name: 'llms-txt-cleanup',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (llmsConfig.enabled) return;
        const file = new URL('llms.txt', dir);
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      },
    },
  };
}

export default defineConfig({
  // 站点部署地址：canonical / og:url 等绝对 URL 的基础（RSS 与 sitemap 走 siteConfig.site.url）。
  // 默认留空（不声明 site，构建产物不含示例域名）；部署前取消注释并填入你的真实地址，例如：
  //   site: 'https://your-domain.com/',
  // —— 部署模式切换（与 memosConfig.refresh.enabled 联动）——
  //   纯静态（默认，refresh.enabled = false）：无 adapter，构建产物仅静态文件（dist/client），
  //   任意静态托管可部署（Cloudflare Pages / Vercel / Netlify / Nginx）。
  //   memos 增量刷新（refresh.enabled = true）：启用下方 node adapter，构建产物含 dist/server，
  //   用 node 运行 dist/server/entry.mjs，Nginx 将 /api/memos 反代到该端口。
  adapter: memosConfig.refresh.enabled ? node({ mode: 'standalone' }) : undefined,
  markdown: {
    processor: satteri({
      hastPlugins: [externalLinksHastPlugin({ siteUrl: siteConfig.site.url, config: externalLinksConfig }), contentImagesHastPlugin()],
    }),
    shikiConfig: {
      // css-variables 主题:颜色由 global.css 的 --astro-code-* 供给(映射既有设计 token)
      theme: 'css-variables',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [llmsTxtCleanup()],
});
