import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, TYPOGRAPHY_DEMOS } from './_render.mjs';

test('Vue Heading: level define a tag e size vira data-size', async () => {
  const html = await renderComponent(TYPOGRAPHY_DEMOS.heading);
  assert.match(html, /<h2[^>]*class="few-heading"[^>]*data-size="xl"/);
  assert.match(html, /<h2[^>]*data-tone="brand"[^>]*>Título da seção<\/h2>/);
});

test('Vue Text: as="p" renderiza a tag e tone vira data-tone', async () => {
  const html = await renderComponent(TYPOGRAPHY_DEMOS.text);
  assert.match(html, /<p[^>]*class="few-text"[^>]*data-tone="muted"[^>]*>Texto de apoio com tom neutro\.<\/p>/);
});

test('Vue Code: bloco com tabindex=0, code interno e botão de copiar', async () => {
  const html = await renderComponent(TYPOGRAPHY_DEMOS.code);
  assert.match(html, /<pre[^>]*tabindex="0"[^>]*data-block[ >]/);
  assert.match(html, /<code class="few-code-code">const few = &#39;company&#39;;<\/code>/);
  assert.match(html, /<button[^>]*class="few-code-copy"[^>]*aria-label="Copiar código"[^>]*>Copiar<\/button>/);
  assert.match(html, /<span role="status" aria-live="polite" class="few-sr-only"><\/span>/);
});

test('Vue Kbd: teclas normalizadas com separador "+" entre elas', async () => {
  const html = await renderComponent(TYPOGRAPHY_DEMOS.kbd);
  assert.equal((html.match(/class="few-kbd-key"/g) ?? []).length, 2, 'duas teclas renderizadas');
  assert.match(html, /<span class="few-kbd-sep" aria-hidden="true">\+<\/span>K/);
});
