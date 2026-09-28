import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, LAYOUT_DEMOS } from './_render.mjs';

test('Angular Estrutura: Card, Separator, Toolbar e Grid com o contrato do React', async () => {
  const card = await renderComponent(LAYOUT_DEMOS.card);
  assert.match(card, /class="few-card"[^>]*data-variant="outlined"/, 'Card com data-variant');
  assert.match(card, /class="few-card-header"/, 'Card.Header ligado');

  const separator = await renderComponent(LAYOUT_DEMOS.separator);
  assert.match(separator, /data-orientation="vertical"[^>]*role="separator"[^>]*aria-orientation="vertical"/, 'Separator vertical com aria-orientation');

  const toolbar = await renderComponent(LAYOUT_DEMOS.toolbar);
  assert.match(toolbar, /role="toolbar"[^>]*aria-label="Forma[^"]*"/, 'Toolbar com aria-label');

  const grid = await renderComponent(LAYOUT_DEMOS.grid);
  assert.match(grid, /class="few-grid"[^>]*style="[^"]*grid-template-columns/, 'Grid com grid-template-columns no style');
  assert.match(grid, /class="few-grid-item"[^>]*style="[^"]*grid-column:\s*span 2/, 'Grid.Item com grid-column pelo colSpan');
});
