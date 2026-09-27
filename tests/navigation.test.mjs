import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Breadcrumb, Pagination, Steps, Tabs } from '../packages/react/dist/index.js';

test('Tabs liga trigger e painel via aria-controls/aria-labelledby e marca o selecionado', () => {
  const html = renderToStaticMarkup(createElement(Tabs, { defaultValue: 'geral' },
    createElement(Tabs.List, null,
      createElement(Tabs.Trigger, { value: 'geral' }, 'Visão geral'),
      createElement(Tabs.Trigger, { value: 'atividade' }, 'Atividade')),
    createElement(Tabs.Content, { value: 'geral' }, 'Conteúdo geral'),
    createElement(Tabs.Content, { value: 'atividade' }, 'Conteúdo atividade')));
  const panelId = html.match(/id="([^"]+-panel-geral)"/)[1];
  assert.match(html, new RegExp(`aria-controls="${panelId}"[^>]*>Visão geral`));
  assert.match(html, /aria-selected="true"[^>]*>Visão geral/);
});

test('Breadcrumb marca a página atual com aria-current="page"', () => {
  const html = renderToStaticMarkup(createElement(Breadcrumb, null,
    createElement(Breadcrumb.List, null,
      createElement(Breadcrumb.Item, null, createElement(Breadcrumb.Link, { href: '/' }, 'Início')),
      createElement(Breadcrumb.Separator, null),
      createElement(Breadcrumb.Item, null, createElement(Breadcrumb.Page, null, 'Projeto')))));
  assert.match(html, /aria-current="page"[^>]*>Projeto/);
});

test('Pagination gera a faixa correta a partir de total/siblings (paginationRange)', () => {
  const html = renderToStaticMarkup(createElement(Pagination, { page: 4, total: 12, siblings: 1 },
    createElement(Pagination.Previous), createElement(Pagination.List), createElement(Pagination.Next)));
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  assert.match(html, />4</);
  assert.match(html, />12</);
});

test('Steps marca a etapa atual com aria-current="step"', () => {
  const html = renderToStaticMarkup(createElement(Steps, { value: 1 },
    createElement(Steps.Item, { index: 0 }, createElement(Steps.Title, null, 'Dados')),
    createElement(Steps.Item, { index: 1 }, createElement(Steps.Title, null, 'Pagamento')),
    createElement(Steps.Item, { index: 2 }, createElement(Steps.Title, null, 'Revisão'))));
  assert.match(html, /aria-current="step"/);
  assert.match(html, /data-state="complete"/);
});
