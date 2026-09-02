import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill the login form
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Expect navigation to dashboard
    await expect(page).toHaveURL('/');
    
    // Verify a logged in element exists (like a user menu or avatar)
    await expect(page.locator('button:has(svg.lucide-user)')).toBeVisible({ timeout: 10000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Expect error message to be visible
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('unauthorized users should be redirected to login', async ({ page }) => {
    // Navigate to a protected route without being logged in
    await page.goto('/admin/roles');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });
});
