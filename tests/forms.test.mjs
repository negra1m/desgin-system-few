import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field, Input, Checkbox, Switch, Slider, RadioGroup, TagsInput } from '../packages/react/dist/index.js';

test('Field associa label, controle, aria-describedby e aria-invalid', () => {
  const html = renderToStaticMarkup(createElement(Field, { invalid: true },
    createElement(Field.Label, null, 'E-mail'),
    createElement(Field.Control, null, createElement(Input, { type: 'email' })),
    createElement(Field.Error, null, 'E-mail inválido'),
  ));
  const controlId = html.match(/<input[^>]*\sid="([^"]+)"/)[1];
  assert.ok(html.includes(`for="${controlId}"`));
  assert.match(html, /aria-invalid="true"/);
  const describedBy = html.match(/aria-describedby="([^"]+)"/)[1];
  assert.ok(describedBy.includes('-error'));
  assert.match(html, /role="alert"/);
});

test('Checkbox indeterminate expõe data-state e aria-checked="mixed"', () => {
  const html = renderToStaticMarkup(createElement(Checkbox.Root, { checked: 'indeterminate' }, createElement(Checkbox.Indicator)));
  assert.match(html, /data-state="indeterminate"/);
  assert.match(html, /aria-checked="mixed"/);
});

test('Switch usa role="switch" e reflete o estado marcado', () => {
  const html = renderToStaticMarkup(createElement(Switch.Root, { checked: true }, createElement(Switch.Thumb)));
  assert.match(html, /role="switch"/);
  assert.match(html, /data-state="checked"/);
});

test('Slider.Thumb expõe role="slider" e aria-valuenow dentro de min/max', () => {
  const html = renderToStaticMarkup(createElement(Slider, { value: [40], max: 100 },
    createElement(Slider.Track, null, createElement(Slider.Thumb, { index: 0 })),
  ));
  assert.match(html, /role="slider"/);
  assert.match(html, /aria-valuenow="40"/);
  assert.match(html, /aria-valuemax="100"/);
});

test('RadioGroup marca o item selecionado com data-state="checked"', () => {
  const html = renderToStaticMarkup(createElement(RadioGroup, { value: 'b' },
    createElement(RadioGroup.Item, { value: 'a' }, 'A'),
    createElement(RadioGroup.Item, { value: 'b' }, 'B'),
  ));
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /checked=""/);
});

test('TagsInput.Label aponta para o mesmo id de TagsInput.Input', () => {
  const html = renderToStaticMarkup(createElement(TagsInput, { value: ['few'] },
    createElement(TagsInput.Label, null, 'Tecnologias'),
    createElement(TagsInput.Item, { index: 0 }, 'few'),
    createElement(TagsInput.Input, null),
  ));
  const inputId = html.match(/<input[^>]*\sid="([^"]+)"/)[1];
  assert.ok(html.includes(`for="${inputId}"`));
});
