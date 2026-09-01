// 秩序与回响 | EchoGarden | NEW
// Repository: https://github.com/moewah/echogarden-astro.git
// Copyright (c) EchoGarden (https://github.com/moewah/echogarden-astro)
// Licensed under MIT

import assert from 'node:assert/strict';
import fs from 'node:fs';

const entryPath = 'dist/server/entry.mjs';
const staticRoutePath = 'dist/client/api/memos/sync';

assert.ok(fs.existsSync(entryPath), `missing ${entryPath}; run npm run build first`);
const entry = fs.readFileSync(entryPath, 'utf8');
const routeStart = entry.indexOf('"route":"/api/memos/sync"');
assert.notEqual(routeStart, -1, 'sync API route is missing from the server manifest');
const route = entry.slice(routeStart, routeStart + 1000);
assert.match(route, /"prerender":false/, 'sync API route must remain server-rendered');
assert.ok(!fs.existsSync(staticRoutePath), `unexpected static API artifact: ${staticRoutePath}`);

console.log('Memos sync route verified: server-rendered, no static 404 artifact.');
