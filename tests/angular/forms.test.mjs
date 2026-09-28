import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, FORMS_DEMOS } from './_render.mjs';

test('Angular Field: liga label ao controle e propaga aria-describedby/aria-invalid/aria-required', async () => {
  const html = await renderComponent(FORMS_DEMOS.field);
  const controlId = html.match(/<label[^>]*\sfor="([^"]+)"/)?.[1];
  assert.ok(controlId, 'label com for apontando pro controle');
  const inputTag = html.match(new RegExp(`<input[^>]*id="${controlId}"[^>]*>`))?.[0];
  assert.ok(inputTag, 'input com o id do Field');
  assert.match(inputTag, /aria-invalid="true"/);
  assert.match(inputTag, /aria-required="true"/);
  const baseId = controlId.replace(/-control$/, '');
  assert.ok(inputTag.includes(`aria-describedby="${baseId}-description ${baseId}-error"`), 'aria-describedby liga description + error');
});

test('Angular Checkbox: indeterminate reflete aria-checked="mixed" no input', async () => {
  const html = await renderComponent(FORMS_DEMOS.checkbox);
  assert.match(html, /aria-checked="mixed"/);
});

test('Angular Switch: input com role="switch"', async () => {
  const html = await renderComponent(FORMS_DEMOS.switch);
  assert.match(html, /role="switch"/);
});

test('Angular Slider: thumb com role="slider" e aria-valuenow refletindo o valor', async () => {
  const html = await renderComponent(FORMS_DEMOS.slider);
  assert.match(html, /role="slider"[^>]*aria-valuenow="30"/);
});

test('Angular RadioGroup: role="radiogroup" no grupo', async () => {
  const html = await renderComponent(FORMS_DEMOS['radio-group']);
  assert.match(html, /role="radiogroup"/);
});

test('Angular NumberInput: role="spinbutton" com aria-valuenow refletindo o valor', async () => {
  const html = await renderComponent(FORMS_DEMOS['number-input']);
  assert.match(html, /role="spinbutton"[^>]*aria-valuenow="3"/);
});
