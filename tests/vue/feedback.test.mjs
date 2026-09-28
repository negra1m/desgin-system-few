import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, FEEDBACK_DEMOS } from './_render.mjs';

test('Vue Feedback: Alert (role status x alert), Badge (tone), Progress (clamp), Spinner (status)', async () => {
  const alertHtml = await renderComponent(FEEDBACK_DEMOS.alert);
  assert.match(alertHtml, /role="status"[^>]*data-tone="info"/, 'tone info usa role=status');
  assert.match(alertHtml, /role="alert"[^>]*data-tone="danger"/, 'tone danger usa role=alert');

  const badgeHtml = await renderComponent(FEEDBACK_DEMOS.badge);
  assert.match(badgeHtml, /class="[^"]*few-tone--success[^"]*"/, 'badge aplica a classe do tone');

  const progressHtml = await renderComponent(FEEDBACK_DEMOS.progress);
  assert.match(progressHtml, /role="progressbar"[^>]*aria-valuenow="100"/, 'value acima do max é clampado em aria-valuenow');

  const spinnerHtml = await renderComponent(FEEDBACK_DEMOS.spinner);
  assert.match(spinnerHtml, /role="status"/, 'spinner anuncia role=status');
});
