import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Slot, VisuallyHidden, registry, categories, tokens } from '../packages/react/dist/index.js';
import { nextIndex, paginationRange, typeaheadIndex } from '../packages/core/dist/index.js';

test('registry has unique ids, current version, examples, parts and honest adoption', () => {
  assert.equal(new Set(registry.map(item => item.id)).size, registry.length);
  assert.ok(registry.length >= 80, `esperava pelo menos 80 componentes, registry tem ${registry.length}`);
  for (const item of registry) {
    assert.equal(item.version, '1.1.0', item.id);
    assert.match(item.id, /^[a-z0-9-]+$/, item.id);
    assert.ok(item.code && item.origins.length && item.variants.length && item.description, item.id);
    assert.ok(item.vueCode && item.vueCode.trim().length > 0, `${item.id}: snippet Vue`);
    assert.ok(categories.includes(item.category), `${item.id}: categoria ${item.category}`);
    assert.deepEqual(item.consumers, ['Catálogo Few']);
  }
});
test('every category from the menu has at least one component', () => {
  for (const category of categories) assert.ok(registry.some(item => item.category === category), category);
});
test('Slot merges className, composes handlers and renders the child element', () => {
  let calls = [];
  const html = renderToStaticMarkup(createElement(Slot, { className: 'a', 'data-x': '1', onClick: () => calls.push('slot') }, createElement('a', { href: '#', className: 'b', onClick: () => calls.push('child') }, 'link')));
  assert.match(html, /^<a /); assert.match(html, /class="a b"/); assert.match(html, /data-x="1"/); assert.match(html, /href="#"/);
});
test('Button asChild renders the child tag with button classes; loading is busy and disabled', () => {
  const link = renderToStaticMarkup(createElement(Button, { asChild: true }, createElement('a', { href: '/x' }, 'Ir')));
  assert.match(link, /^<a /); assert.match(link, /few-button/); assert.match(link, /href="\/x"/);
  const busy = renderToStaticMarkup(createElement(Button, { loading: true }, 'Salvar'));
  assert.match(busy, /aria-busy="true"/); assert.match(busy, /disabled=""/); assert.match(busy, /type="button"/);
});
test('VisuallyHidden keeps text for assistive tech', () => {
  assert.match(renderToStaticMarkup(createElement(VisuallyHidden, null, 'Buscar')), /class="few-sr-only">Buscar/);
});
test('headless navigation helpers are pure and predictable', () => {
  assert.equal(nextIndex('ArrowRight', 2, 3), 0);
  assert.equal(nextIndex('ArrowRight', 2, 3, { loop: false }), 2);
  assert.equal(nextIndex('ArrowDown', 0, 3), null);
  assert.equal(nextIndex('ArrowDown', 0, 3, { orientation: 'vertical' }), 1);
  assert.equal(nextIndex('End', 0, 5), 4);
  assert.deepEqual(paginationRange(5, 10), [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  assert.deepEqual(paginationRange(1, 3), [1, 2, 3]);
  assert.equal(typeaheadIndex(['Ana', 'Bia', 'Bruno'], 'b', 1), 2);
});
test('distributed files include client boundary, CSS with themes and token values', () => {
  const js = readFileSync(new URL('../packages/react/dist/index.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../packages/react/dist/styles.css', import.meta.url), 'utf8');
  assert.match(js, /^"use client"/); assert.ok(css.includes(tokens.color.brand));
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /data-few-theme="ifight"/);
  assert.ok((css.match(/\/\* components\//g) ?? []).length >= 75, 'CSS por componente concatenado');
});
