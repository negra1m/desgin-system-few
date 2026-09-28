import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, PICKERS_DEMOS } from './_render.mjs';

test('Vue Select: trigger combobox fechado por padrão', async () => {
  const html = await renderComponent(PICKERS_DEMOS.select);
  assert.match(html, /<button[^>]*role="combobox"[^>]*aria-haspopup="listbox"[^>]*aria-expanded="false"/);
});

test('Vue Combobox: input com aria-autocomplete=list', async () => {
  const html = await renderComponent(PICKERS_DEMOS.combobox);
  assert.match(html, /<input[^>]*role="combobox"[^>]*aria-autocomplete="list"/);
});

test('Vue Calendar: grid com gridcells e o dia de hoje marcado', async () => {
  const html = await renderComponent(PICKERS_DEMOS.calendar);
  assert.match(html, /role="grid"/);
  assert.match(html, /role="gridcell"/);
  // SSR do Vue renderiza atributos "vazios" (dataAttr) sem `=""`, só o nome do atributo.
  assert.match(html, /data-today[ >]/);
});

test('Vue MultiSelect: painel aria-multiselectable e busca role=searchbox', async () => {
  const html = await renderComponent(PICKERS_DEMOS['multi-select']);
  assert.match(html, /role="listbox"[^>]*aria-multiselectable="true"/);
  assert.match(html, /role="searchbox"/);
});
