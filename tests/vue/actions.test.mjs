import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, ACTIONS_DEMOS } from './_render.mjs';

test('Vue Button: loading marca aria-busy, desabilita e mostra spinner', async () => {
  const html = await renderComponent(ACTIONS_DEMOS.button);
  assert.match(html, /aria-busy="true"[^>]*class="few-button few-button--primary few-button--md"/, 'botão loading marca aria-busy');
  assert.match(html, /<span class="few-spinner" aria-hidden="true">/, 'spinner presente no botão loading');
});

test('Vue Toggle e ToggleGroup: aria-pressed, radiogroup e item desabilitado', async () => {
  const toggleHtml = await renderComponent(ACTIONS_DEMOS.toggle);
  assert.match(toggleHtml, /aria-pressed="true"/, 'toggle pressionado por padrão marca aria-pressed');

  const groupHtml = await renderComponent(ACTIONS_DEMOS['toggle-group']);
  assert.match(groupHtml, /role="radiogroup"/, 'toggle group single é radiogroup');
  assert.match(groupHtml, /role="radio"[^>]*aria-checked="false"/, 'item não selecionado usa role=radio com aria-checked=false');
  assert.match(groupHtml, /<button[^>]* disabled[^>]* data-disabled[ >]/, 'item desabilitado do grupo');
});

test('Vue Link: asChild mescla as classes no <a> nativo', async () => {
  const html = await renderComponent(ACTIONS_DEMOS.link);
  assert.match(html, /<a[^>]*href="https:\/\/fewcompany\.com"[^>]*class="few-link few-link--default few-link--underline-hover"[^>]*>Site externo<\/a>/, 'asChild renderiza <a> com classes do Link mescladas');
});
