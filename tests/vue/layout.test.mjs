import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, LAYOUT_DEMOS } from './_render.mjs';

test('Vue Card: data-variant/data-padding no Root e todas as partes compostas presentes em ordem', async () => {
  const html = await renderComponent(LAYOUT_DEMOS.card);
  assert.match(html, /class="few-card"[^>]*data-variant="elevated"[^>]*data-padding="lg"/);
  assert.match(html, /few-card-header"[\s\S]*few-card-title"[\s\S]*few-card-description"[\s\S]*few-card-action"[\s\S]*few-card-content"[\s\S]*few-card-footer"/);
});

test('Vue Separator: role=separator e aria-orientation vertical', async () => {
  const html = await renderComponent(LAYOUT_DEMOS.separator);
  assert.match(html, /data-orientation="vertical"[^>]*role="separator"[^>]*aria-orientation="vertical"/);
});

test('Vue Toolbar: role=toolbar e aria-label', async () => {
  const html = await renderComponent(LAYOUT_DEMOS.toolbar);
  assert.match(html, /role="toolbar"[^>]*aria-label="Formatação de texto"/);
});

test('Vue Grid: grid-template-columns no Root e grid-column (span) no Item', async () => {
  const html = await renderComponent(LAYOUT_DEMOS.grid);
  assert.match(html, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)[\s\S]*grid-column:\s*span 2 \/ span 2/);
});
