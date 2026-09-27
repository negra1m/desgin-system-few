import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Toggle, ToggleGroup, Link } from '../packages/react/dist/index.js';

test('Button loading marca aria-busy e desabilita o clique', () => {
  const html = renderToStaticMarkup(createElement(Button, { loading: true }, 'Salvar'));
  assert.match(html, /aria-busy="true"/);
});

test('Button asChild renderiza o elemento filho (ex.: <a>) em vez de <button>', () => {
  const html = renderToStaticMarkup(createElement(Button, { asChild: true }, createElement('a', { href: '/destino' }, 'Ir')));
  assert.match(html, /^<a[^>]*href="\/destino"/);
});

test('Toggle expõe aria-pressed e data-state conforme pressed', () => {
  const html = renderToStaticMarkup(createElement(Toggle, { pressed: true }, 'B'));
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /data-state="on"/);
});

test('ToggleGroup single usa role=radiogroup e marca o item selecionado', () => {
  const html = renderToStaticMarkup(createElement(ToggleGroup, { type: 'single', value: 'a' },
    createElement(ToggleGroup.Item, { value: 'a' }, 'A'),
    createElement(ToggleGroup.Item, { value: 'b' }, 'B'),
  ));
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /role="radio"[^>]*aria-checked="true"/);
});

test('Link externo abre em nova aba com rel seguro', () => {
  const html = renderToStaticMarkup(createElement(Link, { href: 'https://few.company', external: true }, 'Few'));
  assert.match(html, /rel="noopener noreferrer"/);
});
