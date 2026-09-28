import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
const version = '1.1.0';
const archives = [resolve(`fewcompany-core-${version}.tgz`), resolve(`fewcompany-ui-${version}.tgz`)];
for (const archive of archives) if (!existsSync(archive)) throw new Error(`Run npm run pack:ui first (missing ${archive}).`);
if (!process.env.npm_execpath) throw new Error('Run via npm run test:consumer.');
const consumer = mkdtempSync(join(tmpdir(), 'few-ui-consumer-'));
try {
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'few-ui-consumer-check', private: true, type: 'module' }));
  execFileSync(process.execPath, [process.env.npm_execpath, 'install', '--ignore-scripts', '--no-audit', '--no-fund', ...archives, 'react@19.2.8', 'react-dom@19.2.8'], { cwd: consumer, stdio: 'inherit' });
  writeFileSync(join(consumer, 'check.mjs'), `
    import { createElement } from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    import { Button, Field, Input, Tabs, registry } from '@fewcompany/ui';
    import { tokens } from '@fewcompany/ui/tokens';
    import { nextIndex } from '@fewcompany/core';
    import assert from 'node:assert/strict';
    import { existsSync } from 'node:fs';
    import { fileURLToPath } from 'node:url';
    assert.ok(existsSync(fileURLToPath(import.meta.resolve('@fewcompany/ui/styles.css'))));
    assert.match(renderToStaticMarkup(createElement(Button, { loading: true }, 'Salvar')), /aria-busy="true"/);
    assert.match(renderToStaticMarkup(createElement(Button, { asChild: true }, createElement('a', { href: '/x' }, 'Ir'))), /^<a /);
    const field = renderToStaticMarkup(createElement(Field, null, createElement(Field.Label, null, 'Nome'), createElement(Field.Control, null, createElement(Input, null))));
    assert.match(field, /<label/); assert.match(field, /<input/);
    const tabs = renderToStaticMarkup(createElement(Tabs, { defaultValue: 'a' }, createElement(Tabs.List, null, createElement(Tabs.Trigger, { value: 'a' }, 'A')), createElement(Tabs.Content, { value: 'a' }, 'Painel')));
    assert.match(tabs, /role="tablist"/); assert.match(tabs, /aria-selected="true"/);
    assert.ok(registry.length >= 80);
    assert.equal(tokens.color.brand, '#C9AFFF');
    assert.equal(nextIndex('ArrowRight', 0, 3), 1);
    console.log('PASS: tarballs installed in an independent React consumer; exports, CSS, tokens, core and rendering work without Next.');
  `);
  execFileSync(process.execPath, ['check.mjs'], { cwd: consumer, stdio: 'inherit' });
} finally {
  const resolved = resolve(consumer);
  if (!resolved.startsWith(resolve(tmpdir()) + sep + 'few-ui-consumer-')) throw new Error('Unsafe temporary cleanup path');
  rmSync(resolved, { recursive: true, force: true });
}
