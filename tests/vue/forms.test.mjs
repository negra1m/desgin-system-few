import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, FORMS_DEMOS } from './_render.mjs';

test('Vue Field: label ligado ao controle, aria-describedby cobre description+error, invalid/required propagados', async () => {
  const html = await renderComponent(FORMS_DEMOS.field);
  const controlId = html.match(/id="([^"]+-control)"/)?.[1];
  assert.ok(controlId, 'controle com id');
  assert.ok(html.includes(`for="${controlId}"`), 'label aponta para o controle');
  const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1];
  assert.ok(describedBy?.includes('-description') && describedBy?.includes('-error'), 'aria-describedby cobre description e error');
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
});

test('Vue Checkbox: indeterminate expõe aria-checked=mixed e data-state=indeterminate', async () => {
  const html = await renderComponent(FORMS_DEMOS.checkbox);
  assert.match(html, /aria-checked="mixed"/);
  assert.match(html, /data-state="indeterminate"/);
});

test('Vue Switch: input nativo com role=switch', async () => {
  const html = await renderComponent(FORMS_DEMOS.switch);
  assert.match(html, /role="switch"/);
});

test('Vue Slider: thumb expõe aria-valuenow com o valor atual', async () => {
  const html = await renderComponent(FORMS_DEMOS.slider);
  assert.match(html, /role="slider"[^>]*aria-valuenow="40"/);
});

test('Vue RadioGroup: role=radiogroup e item selecionado com data-state=checked', async () => {
  const html = await renderComponent(FORMS_DEMOS['radio-group']);
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /data-state="checked"/);
});
