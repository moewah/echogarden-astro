// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

// 构建期插件：接管所有 Markdown 内容集合的正文图片（周刊 / 影辑正文共用）。
// 职责：正文 `![]()` 裸 img → 图片说明容器 + 灯箱触发标记，配合全局
// `.img-ph--post` 占位、懒加载与通用 Lightbox 使用。
// 外链 rel / target 处理不在这里，见 rehypeExternalLinks.ts。
// 动态（Memos）不走此插件：它是运行时数据，由 utils/memos.ts 的 marked
// renderer 生成独立的 `.memo-content-img .img-ph--memo` 容器。

type ElementNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: ElementNode[];
  value?: string;
};

const captionClass = 'block w-full border-t border-[var(--hair)] bg-[var(--panel)] px-3 py-2 text-left font-mono text-[11px] tracking-[0.06em] leading-[1.7] text-[var(--faint)]';

export function contentImagesHastPlugin() {
  return {
    name: 'echo-content-images',
    element: {
      filter: ['img'],
      visit(node: ElementNode) {
        const alt = typeof node.properties?.alt === 'string' ? node.properties.alt.trim() : '';
        if (!alt) {
          node.properties ??= {};
          node.properties['data-lightbox-trigger'] = true;
          return;
        }

        return {
          type: 'element',
          tagName: 'span',
          properties: {
            className: ['post-content-img', 'img-ph', 'img-ph--post'],
            'data-lightbox-trigger': true,
            'data-lightbox-title': alt,
          },
          children: [
            node,
            {
              type: 'element',
              tagName: 'span',
              properties: { className: captionClass },
              children: [{ type: 'text', value: alt }],
            },
          ],
        };
      },
    },
  };
}
