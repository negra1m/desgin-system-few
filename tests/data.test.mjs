import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataTable, Avatar, Accordion } from '../packages/react/dist/index.js';
import { sortRows } from '../packages/core/dist/index.js';

test('empty DataTable keeps caption, column scope and the empty-state message', () => {
  const html = renderToStaticMarkup(createElement(DataTable, {
    caption: 'Pedidos',
    columns: [{ key: 'id', label: 'Código', render: row => row.id }],
    rows: [],
    rowKey: row => row.id,
  }));
  assert.match(html, /<caption[^>]*>Pedidos<\/caption>/);
  assert.match(html, /scope="col"/);
  assert.match(html, /Nenhum registro/);
});

test('sortRows orders a copy without mutating the original and pushes nulls last', () => {
  const rows = [{ id: 'b', value: 2 }, { id: 'a', value: 1 }, { id: 'c', value: null }];
  const asc = sortRows(rows, 'value', 'asc');
  assert.deepEqual(asc.map(row => row.id), ['a', 'b', 'c']);
  assert.deepEqual(rows.map(row => row.id), ['b', 'a', 'c']);
  const desc = sortRows(rows, 'value', 'desc');
  assert.deepEqual(desc.map(row => row.id), ['b', 'a', 'c']);
});

test('Avatar.Fallback shows initials from the name until an image loads', () => {
  const html = renderToStaticMarkup(createElement(Avatar.Root, { name: 'Ana Lima' }, createElement(Avatar.Fallback)));
  assert.match(html, />AL<\/span>/);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Ana Lima"/);
});

test('Accordion links Trigger and Content via aria-expanded/aria-controls', () => {
  const html = renderToStaticMarkup(createElement(Accordion.Root, { type: 'single', defaultValue: 'a' },
    createElement(Accordion.Item, { value: 'a' },
      createElement(Accordion.Header, null, createElement(Accordion.Trigger, null, 'Pergunta')),
      createElement(Accordion.Content, null, 'Resposta'))));
  const triggerId = html.match(/id="([^"]+-trigger-a)"/)?.[1];
  const contentId = html.match(/id="([^"]+-content-a)"/)?.[1];
  assert.ok(triggerId && contentId);
  assert.ok(html.includes(`aria-controls="${contentId}"`));
  assert.ok(html.includes(`aria-labelledby="${triggerId}"`));
  assert.match(html, /aria-expanded="true"/);
});
