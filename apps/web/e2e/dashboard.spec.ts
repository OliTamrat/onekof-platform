import { test, expect } from '@playwright/test';

test.describe('Dashboard (unauthenticated)', () => {
  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to signin
    await page.waitForURL(/\/(auth\/signin|select-organization)/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/(auth\/signin|select-organization)/);
  });
});

test.describe('API Health', () => {
  test('health endpoint returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
  });

  test('API docs endpoint returns OpenAPI spec', async ({ request }) => {
    const response = await request.get('/api/docs');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.openapi).toBe('3.0.3');
    expect(data.info.title).toContain('Onekof');
    expect(data.paths).toBeDefined();
  });
});

test.describe('Navigation', () => {
  test('404 page shows for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
  });

  test('help page loads', async ({ page }) => {
    await page.goto('/help');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('homepage has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('sign in page has form labels', async ({ page }) => {
    await page.goto('/auth/signin');
    // All inputs should have associated labels or aria-label
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.getAttribute('aria-label')
        || await input.getAttribute('aria-labelledby')
        || await input.getAttribute('id');
      expect(hasLabel).toBeTruthy();
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      const role = await images.nth(i).getAttribute('role');
      // Either has alt text or is decorative (role="presentation" or alt="")
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });
});

test.describe('PWA', () => {
  test('manifest.json is accessible', async ({ request }) => {
    const response = await request.get('/manifest.json');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toContain('Onekof');
    expect(manifest.theme_color).toBe('#1C8C7D');
    expect(manifest.icons).toBeDefined();
  });

  test('service worker is accessible', async ({ request }) => {
    const response = await request.get('/sw.js');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('CACHE_NAME');
  });
});
