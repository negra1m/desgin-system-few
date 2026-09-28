import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, OVERLAYS_DEMOS } from './_render.mjs';

test('Vue Dialog: trigger com aria-haspopup=dialog e título ligado por aria-labelledby', async () => {
  const html = await renderComponent(OVERLAYS_DEMOS.dialog);
  assert.match(html, /<button[^>]*aria-haspopup="dialog"[^>]*aria-expanded="true"/, 'trigger anuncia o dialog e o estado aberto');
  const titleId = html.match(/<h2[^>]*id="([^"]+)"/)?.[1];
  assert.ok(titleId && html.includes(`aria-labelledby="${titleId}"`), 'dialog aponta para o título via aria-labelledby');
});

test('Vue AlertDialog: role=alertdialog', async () => {
  const html = await renderComponent(OVERLAYS_DEMOS['alert-dialog']);
  assert.match(html, /<dialog[^>]*role="alertdialog"/);
});

test('Vue DropdownMenu: role=menu e menuitem renderizados quando aberto por defaultOpen', async () => {
  const html = await renderComponent(OVERLAYS_DEMOS['dropdown-menu']);
  assert.match(html, /role="menu"[^>]*data-state="open"/);
  assert.match(html, /role="menuitem"/);
});

test('Vue Toast: viewport com role=region e aria-live=polite', async () => {
  const html = await renderComponent(OVERLAYS_DEMOS.toast);
  assert.match(html, /role="region"[^>]*aria-live="polite"/, 'viewport anuncia notificações para leitores de tela');
});
