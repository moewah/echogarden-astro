// 静态构建（BUILD_MODE=static 的入口）：纯静态产物，不包含 /api/memos/sync。
//
// 该端点不在 src/pages/ 里——由 astro.config.mjs 的 memosSyncRoute 集成仅在 server 模式下注入，
// 所以静态构建的源码树里根本没有这条路由，不需要任何移文件/还原的预处理。本脚本只做两件事：
//   1. 以 BUILD_MODE=static 跑 astro build --force
//   2. 校验产物：无 dist/server、无 dist/api/memos/sync
//      （BUILD_MODE 传递出错时会静默变成 Hybrid 构建，这层校验是最后一道防线）
//
// 冲突校验（static + memosConfig.refresh.enabled=true）由 astro.config.mjs 在加载时抛错。

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

execFileSync('npm', ['run', 'astro', '--', 'build', '--force'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, BUILD_MODE: 'static' },
});

// 产物校验：静态构建不得残留 server entry 与 sync 静态产物
const serverEntry = path.join(root, 'dist/server/entry.mjs');
const apiSync = path.join(root, 'dist/api/memos/sync');
if (fs.existsSync(serverEntry)) {
  throw new Error(`静态构建不应生成 ${serverEntry}——请检查 BUILD_MODE 是否正确传入 astro build`);
}
if (fs.existsSync(apiSync)) {
  throw new Error(`静态构建不应生成 /api/memos/sync 静态产物：${apiSync}`);
}
console.log('[build-static] 产物校验通过：无 dist/server、无 /api/memos/sync');
