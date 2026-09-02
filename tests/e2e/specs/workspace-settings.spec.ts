import { test, expect } from '@playwright/test';

test.describe('Workspace Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should open workspace settings and update general info', async ({ page }) => {
    // Navigate to tasks or a page where workspace settings is accessible
    await page.goto('/tasks');
    
    // Assume there is a workspace settings button
    // It might be a gear icon or "Settings" text
    const settingsBtn = page.locator('button', { hasText: 'Settings' }).first();
    // If we don't have a direct button, we might need to open a dropdown first
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
    } else {
      // Find the workspace dropdown
      await page.click('[data-slot="dropdown-menu-trigger"]:has-text("Workspace")');
      await page.click('text=Workspace Settings');
    }
    
    // Check if dialog opened
    await expect(page.locator('h2', { hasText: 'Workspace Settings' })).toBeVisible();

    // Update name
    const nameInput = page.locator('input[placeholder="e.g. Personal, Work..."]');
    await nameInput.fill('Updated Workspace Name');
    
    // Save Changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success toast
    await expect(page.locator('text=Workspace updated successfully')).toBeVisible();
  });
});
