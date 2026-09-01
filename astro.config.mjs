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

// 部署模式由构建期环境变量 BUILD_MODE 驱动（不用业务配置表达式控制路由/adapter）：
//   server → node adapter 常驻（Hybrid：页面静态输出，/api/memos/sync 由 Node 动态提供，支持增量刷新）
//   static → 无 adapter，纯静态产物（任意静态托管可部署）；sync 端点由 build-static 脚本在构建前临时移出
// 未设置时默认 static（向后兼容 npm run build 的纯静态行为）。
const buildMode = process.env.BUILD_MODE || 'static';
if (buildMode === 'static' && memosConfig.refresh.enabled) {
  throw new Error(
    '静态模式不支持增量刷新：请将 memosConfig.refresh.enabled 设为 false，或改用 server 模式（npm run build:server / ECHOGARDEN_RUNTIME=server）'
  );
}

export default defineConfig({
  // 站点部署地址：canonical / og:url 等绝对 URL 的基础（RSS 与 sitemap 走 siteConfig.site.url）。
  // 默认留空（不声明 site，构建产物不含示例域名）；部署前取消注释并填入你的真实地址，例如：
  //   site: 'https://your-domain.com/',
  // —— 双构建 profile（见 package.json scripts）——
  //   npm run build / build:static：纯静态（BUILD_MODE=static，无 adapter，产物无 /api/memos/sync）
  //   npm run build:server：Hybrid（BUILD_MODE=server，node adapter，/api/memos/sync 由 Node 动态提供，支持 memos 增量刷新）
  adapter: buildMode === 'server' ? node({ mode: 'standalone' }) : undefined,
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
