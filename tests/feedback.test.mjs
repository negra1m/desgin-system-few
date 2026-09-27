import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Alert, Badge, Progress, Spinner, Tag } from '../packages/react/dist/index.js';

test('Progress clamps value above max and exposes aria-valuenow/min/max', () => {
  const html = renderToStaticMarkup(createElement(Progress, { value: 150, max: 100 },
    createElement(Progress.Track, null, createElement(Progress.Indicator))));
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="100"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="100"/);
});

test('Progress indeterminate (value=null) omits aria-valuenow', () => {
  const html = renderToStaticMarkup(createElement(Progress, { value: null }));
  assert.match(html, /data-state="indeterminate"/);
  assert.doesNotMatch(html, /aria-valuenow/);
});

test('Alert uses role="alert" for tone danger and role="status" for other tones', () => {
  const danger = renderToStaticMarkup(createElement(Alert, { tone: 'danger' }, createElement(Alert.Title, null, 'Erro')));
  const info = renderToStaticMarkup(createElement(Alert, { tone: 'info' }, createElement(Alert.Title, null, 'Aviso')));
  assert.match(danger, /role="alert"/);
  assert.match(info, /role="status"/);
});

test('Spinner announces role="status" and an sr-only label', () => {
  const html = renderToStaticMarkup(createElement(Spinner, { label: 'Carregando pedidos' }));
  assert.match(html, /role="status"/);
  assert.match(html, /few-sr-only/);
  assert.match(html, /Carregando pedidos/);
});

test('Badge applies the tone class and renders the dot when requested', () => {
  const html = renderToStaticMarkup(createElement(Badge, { tone: 'success', dot: true }, 'Ativo'));
  assert.match(html, /few-tone--success/);
  assert.match(html, /few-dot/);
});

test('Tag.Close builds a default "Remover {label}" aria-label', () => {
  const html = renderToStaticMarkup(createElement(Tag, null,
    createElement(Tag.Label, null, 'React'),
    createElement(Tag.Close, { label: 'React' })));
  assert.match(html, /aria-label="Remover React"/);
});
