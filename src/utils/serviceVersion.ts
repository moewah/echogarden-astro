// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

export type ServiceVersionStatus = 'ready' | 'mismatch' | 'unavailable';

const VERSION_REQUEST_TIMEOUT_MS = 15_000;
const VERSION_MAX_ATTEMPTS = 3;
const VERSION_RETRY_DELAYS_MS = [500, 1500] as const;
const versionStatusCache = new Map<string, Promise<ServiceVersionStatus>>();

interface VersionResponse {
  version?: unknown;
}

const exactVersion = (version: string) => {
  const normalized = version.trim().replace(/^v/i, '');
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(normalized)
    ? normalized
    : null;
};

/** 只对明确的临时故障重试；配置错误和接口不存在不重复请求。 */
const isRetryableStatus = (status: number) =>
  status === 408 || status === 425 || status === 429 || status >= 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const failureReason = (error: unknown) =>
  error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network';

async function checkServiceVersionOnce(
  endpoint: string,
  expected: string,
  headers?: HeadersInit,
): Promise<ServiceVersionStatus> {
  const required = exactVersion(expected);
  if (!required) return 'unavailable';

  let lastFailure = 'unknown';
  for (let attempt = 1; attempt <= VERSION_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        headers,
        signal: AbortSignal.timeout(VERSION_REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        lastFailure = `http-${response.status}`;
        if (!isRetryableStatus(response.status)) return 'unavailable';
      } else {
        let data: VersionResponse;
        try {
          data = (await response.json()) as VersionResponse;
        } catch {
          lastFailure = 'invalid-json';
          data = {};
        }
        const actual = typeof data.version === 'string' ? exactVersion(data.version) : null;
        if (actual) return actual === required ? 'ready' : 'mismatch';
        lastFailure = 'invalid-version';
      }
    } catch (error) {
      lastFailure = failureReason(error);
    }

    if (attempt < VERSION_MAX_ATTEMPTS) {
      await wait(VERSION_RETRY_DELAYS_MS[attempt - 1]);
    }
  }

  // 不打印 headers，避免把 Memos token 带入构建日志；endpoint 本身是公开接口地址。
  console.warn(`[service-version] ${endpoint} unavailable after ${VERSION_MAX_ATTEMPTS} attempts (${lastFailure})`);
  return 'unavailable';
}

/**
 * 检查外部服务版本：配置锚定完整版本，补丁版本不同也视为不匹配。
 * Memos 与 Artalk 共用此策略：临时故障有限重试，成功/不匹配结果进程内复用，避免多页面重复探测。
 * 仅归一化版本前缀 v；请求失败、响应缺少可比较版本号、版本不匹配均不放行真实内容。
 */
export async function checkServiceVersion(
  endpoint: string,
  expected: string,
  headers?: HeadersInit,
): Promise<ServiceVersionStatus> {
  const cacheKey = `${endpoint}\n${expected}`;
  const cached = versionStatusCache.get(cacheKey);
  if (cached) return cached;

  const statusPromise = checkServiceVersionOnce(endpoint, expected, headers);
  versionStatusCache.set(cacheKey, statusPromise);
  const status = await statusPromise;
  // 临时故障不缓存，允许同一构建中的后续调用再次获得成功结果；ready/mismatch 保持一致。
  if (status === 'unavailable') versionStatusCache.delete(cacheKey);
  return status;
}
