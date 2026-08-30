// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import { artalkConfig } from '@config/artalkConfig';
import { checkServiceVersion, type ServiceVersionStatus } from '@/utils/serviceVersion';

/** Artalk 版本校验：使用服务端公开版本接口与配置锚点比较。 */
export async function getArtalkVersionStatus(): Promise<ServiceVersionStatus | 'unconfigured'> {
  if (!artalkConfig.server || !artalkConfig.site) return 'unconfigured';
  try {
    const endpoint = new URL('/api/v2/version', artalkConfig.server).toString();
    return checkServiceVersion(endpoint, artalkConfig.version);
  } catch {
    return 'unavailable';
  }
}
