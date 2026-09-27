import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Dialog, DropdownMenu, Toast, registry } from '../packages/react/dist/index.js';
import { enqueueToast, dismissToast, orderToasts } from '../packages/core/dist/index.js';

test('registry expõe os 9 overlays na categoria Overlays com ids únicos', () => {
  const ids = ['dialog', 'alert-dialog', 'drawer', 'popover', 'tooltip', 'dropdown-menu', 'context-menu', 'menubar', 'toast'];
  const found = registry.filter(item => ids.includes(item.id));
  assert.equal(found.length, 9);
  assert.ok(found.every(item => item.category === 'Overlays') && new Set(found.map(item => item.id)).size === 9);
});

test('Dialog.Content referencia o Dialog.Title por aria-labelledby', () => {
  const html = renderToStaticMarkup(createElement(Dialog, null,
    createElement(Dialog.Trigger, null, 'Abrir diálogo'),
    createElement(Dialog.Content, null, createElement(Dialog.Title, null, 'Título')),
  ));
  const titleId = html.match(/<h2[^>]*id="([^"]+)"/)?.[1];
  assert.ok(titleId, 'Dialog.Title deveria renderizar um id');
  assert.match(html, new RegExp(`aria-labelledby="${titleId}"`));
});

test('Dialog.Trigger expõe aria-haspopup=dialog e aria-expanded', () => {
  const html = renderToStaticMarkup(createElement(Dialog, null, createElement(Dialog.Trigger, null, 'Abrir diálogo')));
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
});

test('DropdownMenu.Content usa role=menu e Item usa role=menuitem', () => {
  const html = renderToStaticMarkup(createElement(DropdownMenu, { defaultOpen: true },
    createElement(DropdownMenu.Trigger, null, 'Ações'),
    createElement(DropdownMenu.Content, null, createElement(DropdownMenu.Item, null, 'Editar')),
  ));
  assert.match(html, /role="menu"/);
  assert.match(html, /role="menuitem"/);
});

test('Toast.Viewport é uma região aria-live=polite', () => {
  const html = renderToStaticMarkup(createElement(Toast.Provider, null, createElement(Toast.Viewport, null)));
  assert.match(html, /role="region"/);
  assert.match(html, /aria-live="polite"/);
});

test('Fila do Toast (headless): respeita o máximo visível, remove por id e ordena mais recente primeiro', () => {
  let queue = [];
  queue = enqueueToast(queue, { id: '1' }, 2);
  queue = enqueueToast(queue, { id: '2' }, 2);
  queue = enqueueToast(queue, { id: '3' }, 2);
  assert.deepEqual(queue.map(item => item.id), ['2', '3'], 'deveria manter só os 2 mais recentes');
  assert.deepEqual(orderToasts(queue).map(item => item.id), ['3', '2']);
  queue = dismissToast(queue, '2');
  assert.deepEqual(queue.map(item => item.id), ['3']);
});
