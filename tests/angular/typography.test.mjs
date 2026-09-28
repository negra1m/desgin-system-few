import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, TYPOGRAPHY_DEMOS } from './_render.mjs';

test('Angular Heading: size aplicado como data-size na tag h2', async () => {
  const html = await renderComponent(TYPOGRAPHY_DEMOS.heading);
  assert.match(html, /<h2[^>]*data-size="2xl"/);
  assert.match(html, /class="few-heading"/);
});

test('Angular Text: tom semântico ligado a data-tone', async () => {
  const html = await renderComponent(TYPOGRAPHY_DEMOS.text);
  assert.match(html, /<span[^>]*data-tone="success"/);
});

test('Angular Code: inline com data-variant, bloco com tabindex e data-block', async () => {
  const html = await renderComponent(TYPOGRAPHY_DEMOS.code);
  assert.match(html, /<code[^>]*data-variant="outline"/);
  assert.match(html, /<pre(?=[^>]*data-block="")(?=[^>]*tabindex="0")[^>]*>/);
});

test('Angular Kbd: renderiza sequência de teclas com separador', async () => {
  const html = await renderComponent(TYPOGRAPHY_DEMOS.kbd);
  assert.match(html, /class="few-kbd-sep">\+</);
  assert.match(html, /class="few-kbd-key">(<!--[^>]*-->)?Ctrl</);
});
