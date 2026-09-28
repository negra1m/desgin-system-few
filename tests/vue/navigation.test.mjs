import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, NAVIGATION_DEMOS } from './_render.mjs';

test('Vue Tabs: tablist, tab ativo ligado ao painel, desabilitado e painel inativo desmontado', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.tabs);
  assert.match(html, /role="tablist"[^>]*aria-orientation="horizontal"/);
  const tabId = html.match(/<button[^>]*id="([^"]+)"[^>]*aria-selected="true"/)?.[1];
  assert.ok(tabId, 'tab ativo com id');
  assert.ok(html.includes(`aria-labelledby="${tabId}"`), 'painel ativo aponta para o tab');
  assert.match(html, /data-state="active"[^>]*data-value="overview"/);
  assert.match(html, /<button[^>]* disabled[^>]* data-disabled[ >]/);
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 1, 'painel inativo não é renderizado');
  assert.match(html, /class="few-tabs-trigger"/);
});

test('Vue Breadcrumb: página atual anunciada com aria-current="page"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.breadcrumb);
  assert.match(html, /aria-current="page"/);
});

test('Vue Pagination: aria-label em pt-BR e página ativa com aria-current="page"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.pagination);
  assert.match(html, /aria-label="Paginação"/);
  assert.match(html, /aria-current="page"/);
});

test('Vue Steps: etapa atual com aria-current="step"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.steps);
  assert.match(html, /aria-current="step"/);
});

test('Vue NavigationMenu: trigger marcado com data-few-navmenu-trigger', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS['navigation-menu']);
  assert.match(html, /data-few-navmenu-trigger/);
});

test('Vue Sidebar: item de menu ativo com aria-current="page"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.sidebar);
  assert.match(html, /aria-current="page"/);
});

test('Vue CommandMenu: lista de comandos com role="listbox"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS['command-menu']);
  assert.match(html, /role="listbox"/);
});
