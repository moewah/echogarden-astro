// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '@config/index';

export type Album = CollectionEntry<'albums'>;
export type AlbumPhoto = Album['data']['photos'][number];

// 作者回退链：照片级 → 专辑级 → 站点主人（必有值）
export function albumAuthor(album: Album): string {
  return album.data.author ?? siteConfig.profile.name;
}

export function photoAuthor(photo: AlbumPhoto, album: Album): string {
  return photo.author ?? albumAuthor(album);
}

// 索引排序：date 倒序（无日期视为最旧），misc 散记固定置底
export async function getSortedAlbums(): Promise<Album[]> {
  const albums = await getCollection('albums');
  return albums.sort((a, b) => {
    if (a.id === 'misc') return 1;
    if (b.id === 'misc') return -1;
    const ta = a.data.date?.getTime() ?? 0;
    const tb = b.data.date?.getTime() ?? 0;
    return tb - ta;
  });
}

// 影辑条目编号使用 MW-CAT-NNN，避免与影辑索引页的 MW-ALB-NNN 撞号。
// 条目仍按当前索引顺序生成；页面档案号由 albumsConfig.archiveNo 独立维护。
export function albumCode(index: number): string {
  return `MW-CAT-${String(index + 1).padStart(3, '0')}`;
}

// 封面：cover 标注的照片；未标注则回退第一张（highlight 专职首页高光与背景池，不影响封面）
export function albumCover(album: Album): AlbumPhoto | undefined {
  return album.data.photos.find((p) => p.cover) ?? album.data.photos[0];
}

// 高光影像源（首页高光板块与背景图播放池共用）：
// 仅返回 highlight 标注的照片；无标注则留空，由页面渲染空状态。
// 统一按 time 倒序（无时间排最后），limit 默认 6。
export function featuredPhotos(albums: Album[], limit = 6) {
  const highlighted = albums
    .flatMap((album) =>
      album.data.photos.map((photo, index) => ({ album, photo, index }))
    )
    .filter(({ photo }) => photo.highlight)
    .sort((a, b) => (b.photo.time?.getTime() ?? 0) - (a.photo.time?.getTime() ?? 0))
    .slice(0, limit);
  return highlighted;
}


