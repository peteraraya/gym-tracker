import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  const response = await page.goto('/');
  expect(response && response.status()).toBeGreaterThanOrEqual(200);
  expect(response && response.status()).toBeLessThan(400);
  // basic content check (body exists)
  const body = await page.locator('body').innerHTML();
  expect(body.length).toBeGreaterThan(0);
});
