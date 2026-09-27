import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Heading, Text, Code, Kbd } from '../packages/react/dist/index.js';

test('Heading level define a tag renderizada, independente do size', () => {
  const html = renderToStaticMarkup(createElement(Heading, { level: 3, size: 'xl' }, 'Título'));
  assert.match(html, /^<h3[^>]*data-size="xl"/);
});

test('Text usa a tag informada em `as`', () => {
  const html = renderToStaticMarkup(createElement(Text, { as: 'label', tone: 'muted' }, 'Rótulo'));
  assert.match(html, /^<label[^>]*class="few-text"/);
  assert.match(html, /data-tone="muted"/);
});

test('Code em bloco expõe tabIndex=0 para rolagem por teclado', () => {
  const html = renderToStaticMarkup(createElement(Code, { block: true, lang: 'tsx' }, 'const x = 1;'));
  assert.match(html, /<pre[^>]*tabindex="0"/);
  assert.match(html, /data-lang="tsx"/);
});

test('Code copyable anuncia o estado via aria-live', () => {
  const html = renderToStaticMarkup(createElement(Code, { block: true, copyable: true }, 'ok'));
  assert.match(html, /role="status"\s+aria-live="polite"/);
});

test('Kbd renderiza a sequência de keys separada por "+"', () => {
  const html = renderToStaticMarkup(createElement(Kbd, { keys: ['Ctrl', 'K'] }));
  assert.match(html, /<kbd[^>]*class="few-kbd"/);
  assert.ok(html.includes('Ctrl'));
  assert.ok(html.includes('>+<'));
  assert.ok(html.includes('K'));
});

test('Kbd normaliza Mod para Cmd no mac', () => {
  const html = renderToStaticMarkup(createElement(Kbd, { keys: ['Mod', 'K'], platform: 'mac' }));
  assert.ok(html.includes('⌘'));
});
