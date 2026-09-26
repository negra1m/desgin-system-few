import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Field, Input, Progress, DataTable, registry, tokens } from '../packages/ui/dist/index.js';

test('registry has unique entries, versions, examples and honest adoption', () => {
  assert.equal(new Set(registry.map(item => item.id)).size, registry.length);
  for (const item of registry) { assert.equal(item.version, '0.2.0'); assert.ok(item.code && item.origins.length && item.variants.length); assert.deepEqual(item.consumers, ['Catálogo Few']); }
});
test('loading button prevents submissions and announces busy state', () => {
  const html = renderToStaticMarkup(createElement(Button, { loading:true }, 'Salvar'));
  assert.match(html, /disabled=""/); assert.match(html, /aria-busy="true"/); assert.match(html, /type="button"/);
});
test('Field associates invalid input with its label and error', () => {
  const html = renderToStaticMarkup(createElement(Field, { label:'E-mail', error:'E-mail inválido', children:props => createElement(Input, props) }));
  const id = html.match(/<input[^>]*\sid="([^"]+)"/)[1];
  assert.ok(html.includes(`for="${id}"`)); assert.ok(html.includes(`aria-describedby="${id}-help"`)); assert.match(html, /aria-invalid="true"/); assert.match(html, /role="alert"/);
});
test('progress clamps values and exposes an accessible name', () => {
  const html = renderToStaticMarkup(createElement(Progress, { value: 200, label:'Perfil' }));
  assert.match(html, /value="100"/); assert.match(html, /aria-label="Perfil"/);
});
test('empty table retains semantics and fallback content', () => {
  const html = renderToStaticMarkup(createElement(DataTable, { caption:'Pedidos', columns:[{key:'id',label:'Código',render:row => row.id}], rows:[], rowKey:row => row.id }));
  assert.match(html, /<caption>Pedidos<\/caption>/); assert.match(html, /scope="col"/); assert.match(html, /Nenhum registro/);
});
test('distributed files include client boundary, CSS and token values', () => {
  const js = readFileSync(new URL('../packages/ui/dist/index.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../packages/ui/dist/styles.css', import.meta.url), 'utf8');
  assert.match(js, /^"use client"/); assert.ok(css.includes(tokens.color.brand));
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /data-few-theme="ifight"/);
});
