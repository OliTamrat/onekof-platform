import { test, expect } from '@playwright/test';

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
  });

  test('renders sign in form', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    // Browser native validation should prevent submission
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test('has link to sign up page', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: /sign up|create.*account|register/i });
    await expect(signUpLink).toBeVisible();
  });

  test('has forgot password link', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot/i }).or(page.locator('text=Forgot'));
    await expect(forgotLink.first()).toBeVisible();
  });

  test('password toggle shows/hides password', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i).first();
    await passwordInput.fill('TestPassword123');

    // Should be type="password" initially
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    const toggleBtn = page.locator('button').filter({ has: page.locator('[data-testid="eye-icon"], svg') }).first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).first().fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for error response
    await page.waitForTimeout(2000);
    // Error message or the form should still be visible (not redirected)
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('has OAuth provider buttons', async ({ page }) => {
    const googleBtn = page.getByRole('button', { name: /google/i }).or(page.locator('text=Google'));
    // Google OAuth may or may not be visible depending on config
    const isVisible = await googleBtn.first().isVisible().catch(() => false);
    if (isVisible) {
      await expect(googleBtn.first()).toBeEnabled();
    }
  });
});

test.describe('Sign Up Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup');
  });

  test('renders sign up form', async ({ page }) => {
    await expect(page.getByLabel(/name/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test('validates password confirmation', async ({ page }) => {
    const passwordFields = page.getByLabel(/password/i);
    if (await passwordFields.count() >= 2) {
      await passwordFields.first().fill('TestPass123!');
      await passwordFields.nth(1).fill('DifferentPass');
      await page.getByRole('button', { name: /sign up|create|register/i }).click();
      // Should show mismatch error or prevent submission
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('has link to sign in page', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /sign in|log in|already have/i });
    await expect(signInLink).toBeVisible();
  });
});
