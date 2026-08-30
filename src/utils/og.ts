// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

// og:image 统一出口：双态(本地 ImageMetadata / 远程 URL 字符串)→ 绝对 URL。
// 本地图按 siteConfig.images 压缩(关闭则原图)；远程原样；未提供回退 siteConfig.site.ogImage。
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { siteConfig } from '@config/index';

export async function ogImage(src?: string | ImageMetadata): Promise<string> {
  const raw =
    src == null
      ? siteConfig.site.ogImage
      : typeof src === 'string'
        ? src
        : siteConfig.images.enabled
          ? (
              await getImage({
                src,
                format: siteConfig.images.format,
                quality: siteConfig.images.quality,
              })
            ).src
          : src.src;
  return new URL(raw, siteConfig.site.url).toString();
}
