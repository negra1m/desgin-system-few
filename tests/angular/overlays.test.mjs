import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, OVERLAYS_DEMOS } from './_render.mjs';

test('Angular Overlays: Dialog liga Content a Title por aria-labelledby e Trigger anuncia aria-haspopup=dialog', async () => {
  const html = await renderComponent(OVERLAYS_DEMOS.dialog);
  assert.match(html, /aria-haspopup="dialog"/);
  const titleId = html.match(/<h2[^>]*id="([^"]+)"/)?.[1];
  assert.ok(titleId, 'title com id');
  assert.ok(html.includes(`aria-labelledby="${titleId}"`), 'dialog aponta para o title via aria-labelledby');
});

test('Angular Overlays: DropdownMenu expõe role=menu no Content e role=menuitem nos itens', async () => {
  const html = await renderComponent(OVERLAYS_DEMOS['dropdown-menu']);
  assert.match(html, /role="menu"/);
  assert.match(html, /role="menuitem"/);
});

test('Angular Overlays: Menubar marca a barra com role=menubar e cada Trigger com role=menuitem', async () => {
  const html = await renderComponent(OVERLAYS_DEMOS.menubar);
  assert.match(html, /role="menubar"/);
  const triggerTag = html.match(/<button[^>]*data-menubar-value="arquivo"[^>]*>/)?.[0] ?? '';
  assert.ok(triggerTag.includes('role="menuitem"'), 'trigger do menubar é role=menuitem');
});

test('Angular Overlays: Toast Viewport é uma região aria-live=polite', async () => {
  const html = await renderComponent(OVERLAYS_DEMOS.toast);
  const viewportTag = html.match(/<div[^>]*aria-live="polite"[^>]*>/)?.[0] ?? '';
  assert.ok(viewportTag.includes('role="region"'), 'viewport é role=region');
  assert.ok(viewportTag.includes('aria-live="polite"'), 'viewport anuncia aria-live=polite');
});
