import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card, Separator, Toolbar, Grid } from '../packages/react/dist/index.js';

test('Card compõe Header/Title(level)/Description/Action/Content/Footer', () => {
  const html = renderToStaticMarkup(createElement(Card, { variant: 'outlined' },
    createElement(Card.Header, null,
      createElement(Card.Title, { level: 2 }, 'Título'),
      createElement(Card.Description, null, 'Descrição'),
      createElement(Card.Action, null, 'Ação'),
    ),
    createElement(Card.Content, null, 'Conteúdo'),
    createElement(Card.Footer, null, 'Rodapé'),
  ));
  assert.match(html, /<h2[^>]*class="few-card-title"/);
  assert.match(html, /class="few-card-header"/);
  assert.match(html, /class="few-card-action"/);
  assert.match(html, /class="few-card-footer"/);
});

test('Separator expõe role="separator" e aria-orientation quando vertical e não decorativo', () => {
  const html = renderToStaticMarkup(createElement(Separator, { orientation: 'vertical' }));
  assert.match(html, /role="separator"/);
  assert.match(html, /aria-orientation="vertical"/);
});

test('Separator decorativo usa role="none" e não expõe aria-orientation', () => {
  const html = renderToStaticMarkup(createElement(Separator, { decorative: true }));
  assert.match(html, /role="none"/);
  assert.doesNotMatch(html, /aria-orientation/);
});

test('Toolbar expõe role="toolbar" e aria-label obrigatório', () => {
  const html = renderToStaticMarkup(createElement(Toolbar, { label: 'Formatação' },
    createElement(Toolbar.Button, null, 'B'),
  ));
  assert.match(html, /role="toolbar"/);
  assert.match(html, /aria-label="Formata/);
});

test('Grid resolve grid-template-columns fixo no style inline', () => {
  const html = renderToStaticMarkup(createElement(Grid, { columns: 3, gap: 4 }));
  assert.match(html, /grid-template-columns:repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(html, /gap:16px/);
});

test('Grid resolve grid-template-columns com auto-fit quando columns="auto"', () => {
  const html = renderToStaticMarkup(createElement(Grid, { columns: 'auto', minChildWidth: '220px' }));
  assert.match(html, /grid-template-columns:repeat\(auto-fit, minmax\(220px, 1fr\)\)/);
});
