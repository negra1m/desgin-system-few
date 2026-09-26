import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
const archive = resolve('fewcompany-ui-0.1.0.tgz');
if (!existsSync(archive)) throw new Error('Run npm run pack:ui first.');
if (!process.env.npm_execpath) throw new Error('Run via npm run test:consumer.');
const consumer = mkdtempSync(join(tmpdir(), 'few-ui-consumer-'));
try {
  writeFileSync(join(consumer,'package.json'), JSON.stringify({name:'few-ui-consumer-check',private:true,type:'module'}));
  execFileSync(process.execPath,[process.env.npm_execpath,'install','--ignore-scripts','--no-audit','--no-fund',archive,'react@19.2.8','react-dom@19.2.8'],{cwd:consumer,stdio:'inherit'});
  writeFileSync(join(consumer,'check.mjs'), `
    import { createElement } from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    import { Button, Field, Input, registry } from '@fewcompany/ui';
    import { tokens } from '@fewcompany/ui/tokens';
    import assert from 'node:assert/strict';
    import { existsSync } from 'node:fs';
    import { fileURLToPath } from 'node:url';
    assert.ok(existsSync(fileURLToPath(import.meta.resolve('@fewcompany/ui/styles.css'))));
    assert.match(renderToStaticMarkup(createElement(Button, {loading:true}, 'Salvar')), /aria-busy="true"/);
    assert.match(renderToStaticMarkup(createElement(Field, {label:'Nome',children:props => createElement(Input,props)})), /<label/);
    assert.equal(registry.length,17);
    assert.equal(tokens.color.brand,'#244c38');
    console.log('PASS: tarball installed in an independent React consumer; exports, CSS and rendering work without Next.');
  `);
  execFileSync(process.execPath,['check.mjs'],{cwd:consumer,stdio:'inherit'});
} finally {
  const resolved = resolve(consumer);
  if (!resolved.startsWith(resolve(tmpdir()) + sep + 'few-ui-consumer-')) throw new Error('Unsafe temporary cleanup path');
  rmSync(resolved,{recursive:true,force:true});
}
