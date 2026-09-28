import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, FEEDBACK_DEMOS } from './_render.mjs';

test('Angular Progress: progressbar com aria-valuenow clampado e aria-valuetext', async () => {
  const html = await renderComponent(FEEDBACK_DEMOS.progress);
  assert.match(html, /role="progressbar"[^>]*aria-valuemin="0"[^>]*aria-valuemax="100"[^>]*aria-valuenow="30"[^>]*aria-valuetext="30%"/);
});

test('Angular Alert: role=alert em danger, role=status nas demais tones', async () => {
  const html = await renderComponent(FEEDBACK_DEMOS.alert);
  assert.match(html, /role="status"[^>]*data-tone="success"/);
  assert.match(html, /role="alert"[^>]*data-tone="danger"/);
});

test('Angular Spinner: role=status', async () => {
  const html = await renderComponent(FEEDBACK_DEMOS.spinner);
  assert.match(html, /role="status"/);
});

test('Angular Badge: classe de tone e variante aplicadas', async () => {
  const html = await renderComponent(FEEDBACK_DEMOS.badge);
  assert.match(html, /<span[^>]*data-variant="solid"[^>]*class="[^"]*few-badge--solid[^"]*few-tone--success[^"]*"/);
});

test('Angular Tag: tag interativa com role=button e tabindex', async () => {
  const html = await renderComponent(FEEDBACK_DEMOS.tag);
  assert.match(html, /data-interactive=""[^>]*role="button"[^>]*tabindex="0"/);
});
