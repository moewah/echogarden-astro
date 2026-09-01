// 静态构建（BUILD_MODE=static 的入口）：纯静态产物，不包含 /api/memos/sync。
//
// Astro 的 prerender 是构建期路由指令，对固定 endpoint 依赖 getStaticPaths 空数组不可靠
// （容易残留静态 API 404 产物）。静态构建采用「构建前临时移出 sync 端点」：
//   1. src/pages/api/memos/sync.ts → .build-disabled/ 暂存
//   2. astro build（BUILD_MODE=static）
//   3. 无论成败 finally 恢复 sync.ts
//   4. 校验产物：无 dist/server、无 dist/api/memos/sync
//
// 冲突校验（static + memosConfig.refresh.enabled=true）由 astro.config.mjs 在加载时抛错。

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const syncSrc = path.join(root, 'src/pages/api/memos/sync.ts');
const stashDir = path.join(root, '.build-disabled');
const stashFile = path.join(stashDir, 'sync.ts');

fs.mkdirSync(stashDir, { recursive: true });

let moved = false;
try {
  if (fs.existsSync(syncSrc)) {
    fs.renameSync(syncSrc, stashFile);
    moved = true;
    console.log('[build-static] 已临时移出 /api/memos/sync（静态模式不生成该端点）');
  }

  execFileSync('npm', ['run', 'astro', '--', 'build', '--force'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, BUILD_MODE: 'static' },
  });
} finally {
  if (moved && !fs.existsSync(syncSrc) && fs.existsSync(stashFile)) {
    fs.renameSync(stashFile, syncSrc);
    console.log('[build-static] 已恢复 src/pages/api/memos/sync.ts');
  }
  if (fs.existsSync(stashDir) && fs.readdirSync(stashDir).length === 0) {
    fs.rmdirSync(stashDir);
  }
}

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
