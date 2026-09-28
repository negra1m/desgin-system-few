import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, PICKERS_DEMOS } from './_render.mjs';

test('Angular Select: trigger tipo combobox controla um listbox, fechado por padrão', async () => {
  const html = await renderComponent(PICKERS_DEMOS.select);
  assert.match(html, /role="combobox"[^>]*aria-haspopup="listbox"[^>]*aria-expanded="false"/);
  assert.match(html, /role="listbox"/);
});

test('Angular Combobox: input com aria-autocomplete="list"', async () => {
  const html = await renderComponent(PICKERS_DEMOS.combobox);
  assert.match(html, /role="combobox"[^>]*aria-autocomplete="list"/);
});

test('Angular MultiSelect: listbox com aria-multiselectable e busca role=searchbox', async () => {
  const html = await renderComponent(PICKERS_DEMOS['multi-select']);
  assert.match(html, /aria-multiselectable="true"/);
  assert.match(html, /role="searchbox"/);
});

test('Angular Calendar: grade de dias com o dia de hoje marcado', async () => {
  const html = await renderComponent(PICKERS_DEMOS.calendar);
  assert.match(html, /role="grid"/);
  assert.match(html, /role="gridcell"/);
  assert.match(html, /data-today=""/);
});

test('Angular DatePicker: campo combobox abre um diálogo com o calendário', async () => {
  const html = await renderComponent(PICKERS_DEMOS['date-picker']);
  assert.match(html, /role="combobox"[^>]*aria-haspopup="dialog"/);
  assert.match(html, /role="dialog"/);
});
