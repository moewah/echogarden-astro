// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const serverDir = 'dist/server';
const staticRoutePath = 'dist/client/api/memos/sync';
const routePattern = '"route":"/api/memos/sync"';

assert.ok(fs.existsSync(serverDir), `missing ${serverDir}; run npm run build first`);

// 断言的是「路由存在且未预渲染」，不是「它序列化在哪个文件」——manifest 的位置随 astro
// 版本变过（7.2 内联在 entry.mjs，7.3 拆进 chunks/*.mjs），所以扫整个 server 产物。
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    });
}

const files = walk(serverDir).filter((file) => file.endsWith('.mjs'));
const hit = files.find((file) => fs.readFileSync(file, 'utf8').includes(routePattern));
assert.ok(hit, `sync API route is missing from the server manifest (scanned ${files.length} files)`);

const route = fs.readFileSync(hit, 'utf8').split(routePattern)[1].slice(0, 1000);
assert.match(route, /"prerender":false/, 'sync API route must remain server-rendered');
assert.ok(!fs.existsSync(staticRoutePath), `unexpected static API artifact: ${staticRoutePath}`);

console.log(`Memos sync route verified: server-rendered (${hit}), no static 404 artifact.`);
