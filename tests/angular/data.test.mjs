import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, DATA_DEMOS } from './_render.mjs';

test('Angular Table: caption e cabeçalho com scope=col', async () => {
  const html = await renderComponent(DATA_DEMOS.table);
  assert.match(html, /<caption[^>]*>Pedidos recentes · dados de exemplo<\/caption>/);
  assert.match(html, /<th[^>]*scope="col"/);
});

test('Angular Avatar: role=img e Fallback com iniciais', async () => {
  const html = await renderComponent(DATA_DEMOS.avatar);
  assert.match(html, /role="img"[^>]*aria-label="Ana Lima"/);
  assert.match(html, /class="few-avatar-fallback"[^>]*>\s*AL\s*</);
});

test('Angular Accordion: aria-expanded ligado a aria-controls do conteúdo', async () => {
  const html = await renderComponent(DATA_DEMOS.accordion);
  const contentId = html.match(/<button[^>]*aria-expanded="true"[^>]*aria-controls="([^"]+)"/)?.[1];
  assert.ok(contentId, 'trigger aberto (faq-1) expõe aria-controls');
  assert.ok(html.includes(`id="${contentId}"`), 'few-accordion-content correspondente está no DOM com esse id');
});

test('Angular Tree: role=tree/treeitem, aria-level e branch expandido', async () => {
  const html = await renderComponent(DATA_DEMOS.tree);
  assert.match(html, /role="tree"[\s\S]*role="treeitem"[^>]*aria-level="2"/);
  assert.match(html, /data-item-id="pastas"[^>]*aria-expanded="true"/);
});
