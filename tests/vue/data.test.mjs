import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, DATA_DEMOS } from './_render.mjs';

test('Vue Table: caption e cabeçalho com scope=col', async () => {
  const html = await renderComponent(DATA_DEMOS.table);
  assert.match(html, /<caption[^>]*>Projetos ativos<\/caption>/);
  assert.match(html, /<th[^>]*scope="col"/);
});

test('Vue Avatar: role=img e fallback com iniciais', async () => {
  const html = await renderComponent(DATA_DEMOS.avatar);
  assert.match(html, /role="img"/);
  assert.match(html, /few-avatar-fallback"[^>]*>AL</);
});

test('Vue Accordion: trigger aberto liga aria-expanded ao aria-controls do painel', async () => {
  const html = await renderComponent(DATA_DEMOS.accordion);
  const triggerId = html.match(/<button[^>]*id="([^"]+)"[^>]*aria-expanded="true"/)?.[1];
  assert.ok(triggerId, 'trigger aberto com id');
  const controls = html.match(/aria-controls="([^"]+)"/)?.[1];
  assert.ok(controls && html.includes(`id="${controls}"`), 'aria-controls aponta para um painel presente no HTML');
});

test('Vue Tree: role tree/treeitem e aria-level=2 no item aninhado', async () => {
  const html = await renderComponent(DATA_DEMOS.tree);
  assert.match(html, /role="tree"[\s\S]*role="treeitem"/);
  assert.match(html, /aria-level="2"/);
});
