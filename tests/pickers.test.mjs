import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Select, Calendar, registry } from '../packages/react/dist/index.js';
import { calendarGrid, filterOptions, parseDate, formatDate, isDateDisabled } from '../packages/core/dist/index.js';

test('registry expõe os 5 pickers na categoria Formulários com ids únicos', () => {
  const ids = ['select', 'combobox', 'multi-select', 'calendar', 'date-picker'];
  const found = registry.filter(item => ids.includes(item.id));
  assert.equal(found.length, 5);
  assert.ok(found.every(item => item.category === 'Formulários') && new Set(found.map(item => item.id)).size === 5);
});

test('calendarGrid cobre o mês em semanas completas; filterOptions ignora acento e caixa', () => {
  const weeks = calendarGrid(2026, 1, 0); // fevereiro/2026, semanas começando no domingo
  const lastOfMonth = new Date(2026, 2, 0);
  assert.ok(weeks.every(week => week.length === 7) && weeks[0][0].getDay() === 0 && weeks.flat().some(day => day.getTime() === lastOfMonth.getTime()));
  assert.deepEqual(filterOptions(['Ana', 'André', 'Bruno'], 'andr', label => label), ['André']);
  assert.deepEqual(filterOptions(['Ana', 'André', 'Bruno'], 'AN', label => label), ['Ana', 'André']);
});

test('parseDate/formatDate fazem o round-trip de dd/mm/aaaa e isDateDisabled respeita min/max', () => {
  const date = parseDate('05/09/2026');
  assert.ok(parseDate('31/02/2026') === null && date !== null && formatDate(date) === '05/09/2026');
  const min = new Date(2026, 0, 10);
  assert.ok(isDateDisabled(new Date(2026, 0, 5), { min }) === true && isDateDisabled(new Date(2026, 0, 15), { min }) === false);
});

test('Select renderiza trigger combobox fechado com listbox no Content', () => {
  const html = renderToStaticMarkup(createElement(Select, { defaultValue: 'a' },
    createElement(Select.Trigger, null, createElement(Select.Value, { placeholder: 'Selecione' })),
    createElement(Select.Content, null, createElement(Select.Item, { value: 'a' }, 'A'))));
  assert.ok(html.includes('role="combobox"') && html.includes('aria-expanded="false"') && html.includes('role="listbox"'));
});

test('Calendar renderiza grade role=grid com células de dia (role=gridcell)', () => {
  const html = renderToStaticMarkup(createElement(Calendar, { mode: 'single', defaultValue: new Date(2026, 0, 15) },
    createElement(Calendar.Grid, null, createElement(Calendar.GridHead), createElement(Calendar.GridBody))));
  assert.ok(html.includes('role="grid"') && html.includes('role="gridcell"'));
});
