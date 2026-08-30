// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import type { ExternalLinksConfig } from '@t/externalLinks';
import { externalLinkAttrs } from './externalLinks';

type ElementNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: ElementNode[];
  value?: string;
};

type VisitorContext = {
  setProperty(node: ElementNode, name: string, value: unknown): void;
};

interface Options {
  siteUrl: string;
  config: ExternalLinksConfig;
}

/** Sätteri 构建期插件：只处理静态外链（rel / target）。正文图片接管见 rehypeContentImages.ts。 */
export function externalLinksHastPlugin({ siteUrl, config }: Options) {
  return {
    name: 'echo-external-links',
    element: {
      filter: ['a'],
      visit(node: ElementNode, context: VisitorContext) {
        const href = typeof node.properties?.href === 'string' ? node.properties.href : '';
        const attrs = externalLinkAttrs(href, siteUrl, config);
        Object.entries(attrs).forEach(([name, value]) => context.setProperty(node, name, value));
      },
    },
  };
}
