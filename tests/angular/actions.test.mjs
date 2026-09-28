import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, ACTIONS_DEMOS } from './_render.mjs';

test('Angular Actions: Button aplica classes de variante/tamanho e reflete loading em aria-busy/disabled', async () => {
  const html = await renderComponent(ACTIONS_DEMOS.button);
  assert.match(html, /class="[^"]*few-button--primary[^"]*"/); assert.match(html, /class="[^"]*few-button--md[^"]*"/, 'classes few-button--variant e few-button--size no botão primário');
  const loadingButton = html.match(/<button[^>]*data-loading=""[^>]*>/)?.[0];
  assert.ok(loadingButton, 'botão em loading expõe data-loading');
  assert.match(loadingButton, /aria-busy="true"/, 'aria-busy no botão loading');
  assert.match(loadingButton, /disabled=""/, 'disabled no botão loading');
});

test('Angular Actions: Toggle marca aria-pressed conforme o estado', async () => {
  const html = await renderComponent(ACTIONS_DEMOS.toggle);
  assert.match(html, /aria-pressed="true"/, 'toggle pressionado');
  assert.match(html, /aria-pressed="false"/, 'toggle solto');
});

test('Angular Actions: ToggleGroup single expõe radiogroup e item selecionado com aria-checked', async () => {
  const html = await renderComponent(ACTIONS_DEMOS['toggle-group']);
  assert.match(html, /role="radiogroup"/, 'grupo single expõe radiogroup');
  assert.match(html, /role="radio"[^>]*aria-checked="true"/, 'item selecionado marca aria-checked');
});
