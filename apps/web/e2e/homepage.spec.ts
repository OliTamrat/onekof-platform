import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with headline', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('text=project management')).toBeVisible();
  });

  test('has navigation bar with logo and links', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.locator('text=Onekof')).toBeVisible();
  });

  test('has sign in and sign up buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /start/i })).toBeVisible();
  });

  test('navigates to sign in page', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('has language selector', async ({ page }) => {
    const languageButton = page.locator('text=English').or(page.locator('text=EN'));
    await expect(languageButton.first()).toBeVisible();
  });

  test('displays feature sections on scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    // Sections should be present in the DOM
    const sections = page.locator('section');
    expect(await sections.count()).toBeGreaterThan(0);
  });

  test('has responsive layout', async ({ page }) => {
    // Desktop: nav should be visible
    await expect(page.getByRole('navigation')).toBeVisible();

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    // Page should still load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('CTA buttons are clickable', async ({ page }) => {
    const ctaButton = page.getByRole('link', { name: /start for free|get started|sign up/i }).first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });
});
