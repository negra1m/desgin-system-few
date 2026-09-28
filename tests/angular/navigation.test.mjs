import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, NAVIGATION_DEMOS } from './_render.mjs';

test('Angular Tabs: tablist, tab ativo ligado ao painel, desabilitado e painel inativo oculto', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.tabs);
  assert.match(html, /role="tablist"[^>]*aria-orientation="horizontal"/);
  const tabId = html.match(/<button[^>]*id="([^"]+)"[^>]*aria-selected="true"/)?.[1];
  assert.ok(tabId, 'tab ativo com id');
  assert.ok(html.includes(`aria-labelledby="${tabId}"`), 'painel ativo aponta para o tab');
  assert.match(html, /data-state="active"[^>]*data-value="overview"/);
  assert.match(html, /disabled=""[^>]*data-disabled=""/);
  assert.match(html, /role="tabpanel"[^>]*hidden=""/);
  assert.match(html, /class="few-tabs-trigger"/);
});

test('Angular Breadcrumb: página atual anunciada via aria-current="page"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.breadcrumb);
  assert.match(html, /role="link"[^>]*aria-disabled="true"[^>]*aria-current="page"/);
});

test('Angular Pagination: aria-label em pt-BR e página ativa com aria-current="page"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.pagination);
  assert.match(html, /aria-label="Paginação"/);
  assert.match(html, /aria-current="page"[^>]*data-state="active"/);
});

test('Angular Steps: etapa atual anunciada via aria-current="step"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS.steps);
  assert.match(html, /data-state="current"[^>]*aria-current="step"/);
});

test('Angular CommandMenu: lista de comandos com role="listbox"', async () => {
  const html = await renderComponent(NAVIGATION_DEMOS['command-menu']);
  assert.match(html, /role="listbox"/);
});
