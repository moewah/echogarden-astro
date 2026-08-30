// ③ 页面：我在别处（外部触点）列表。字段形状见 @t/elsewhere。
// 行号由渲染层自动生成（001/002/…），不要手写。
import { siteConfig } from './siteConfig';
import type { ElsewhereLink } from '@t/elsewhere';

export const elsewhereConfig: ElsewhereLink[] = [
  // 每条字段：
  //   name        展示名
  //   description 一句话介绍
  //   url         目标地址（mailto: 等协议链接同样支持）
  //   external    true = 新窗口打开 + noopener；false = 站内/协议链接
  //   icon        线条 SVG 名（Icon 组件内置集，见 @components/Icon.astro）
  //   enabled     false 可临时隐藏单条（不删除数据）
  {
    name: 'Blog',
    description: '博客网站',
    url: 'https://blog.example.com/',
    external: true,
    icon: 'world',
  },
  {
    name: 'Photos',
    description: '摄影作品',
    url: 'https://photos.example.com/',
    external: true,
    icon: 'photo',
    enabled: true,
  },
  {
    name: 'GitHub',
    description: '开源项目 & 代码',
    url: 'https://github.com/example',
    external: true,
    icon: 'github',
  },
  {
    name: 'YouTube',
    description: '视频内容',
    url: '#',
    external: true,
    icon: 'youtube',
  },
  {
    name: 'X',
    description: 'X (Twitter)',
    url: '#',
    external: true,
    icon: 'x',
  },
  {
    name: 'Telegram',
    description: '即时通讯',
    url: '#',
    external: true,
    icon: 'telegram',
  },
  {
    name: 'Instagram',
    description: '摄影 / 生活',
    url: '#',
    external: true,
    icon: 'instagram',
  },
  {
    name: 'LinkedIn',
    description: '职业档案',
    url: '#',
    external: true,
    icon: 'linkedin',
  },
  {
    name: 'Email',
    description: '联系 & 合作',
    url: `mailto:${siteConfig.profile.email}`,
    external: false,
    icon: 'mail',
  },
];
