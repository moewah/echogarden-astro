// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

/// <reference types="astro/client" />

declare module '@components/MomentCard.astro' {
  import type { experimental_AstroContainer } from 'astro/container';
  const component: Parameters<experimental_AstroContainer['renderToString']>[0];
  export default component;
}
