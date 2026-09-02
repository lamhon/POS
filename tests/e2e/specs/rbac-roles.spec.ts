import { test, expect } from '@playwright/test';

// Use a shared state or log in manually for each test depending on the strategy.
// Here we log in for each test in beforeEach.
test.describe('RBAC Role Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should create a custom role, edit permissions, and assign to user', async ({ page }) => {
    // 1. Navigate to roles
    await page.goto('/admin/roles');
    await expect(page.locator('h1')).toContainText('Role Management');

    // 2. Create new Role
    await page.click('button:has-text("New Role")');
    await expect(page.locator('h2')).toContainText('Create New Role');
    
    // Fill basic info
    const roleName = `E2E Tester ${Date.now()}`;
    await page.fill('input[placeholder="e.g. Content Manager"]', roleName);
    await page.fill('input[placeholder="Brief description of this role\'s purpose"]', 'Playwright automation role');
    
    // Grant a permission (e.g. task.task.create)
    // Find the create action for task resource
    // The matrix has modules, resources, and actions.
    // Assuming we have a "task" resource row and "create" action button
    // It's a bit complex to select by text if multiple "create" exist, 
    // so we will look for the specific ActionCell.
    
    // Let's just click the first "create" action available in the matrix for simplicity
    const createBtn = page.locator('button', { hasText: /^create$/ }).first();
    await createBtn.click();
    
    // Verify scope selector appears (default "All")
    const scopeBtn = page.locator('button', { hasText: /^All$/ }).first();
    await expect(scopeBtn).toBeVisible();
    
    // Save Role
    await page.click('button:has-text("Create Role")');
    
    // Expect to see the new role in the list
    await expect(page.locator('h3', { hasText: roleName })).toBeVisible();

    // 3. Edit Role Scope
    const roleCard = page.locator('div.group', { hasText: roleName });
    await roleCard.locator('button[data-slot="dropdown-menu-trigger"]').click();
    await page.click('text=Edit Role');
    
    // Wait for modal
    await expect(page.locator('h2')).toContainText(`Edit: ${roleName}`);
    
    // Change scope to Department
    const scopeDropdown = page.locator('button', { hasText: /^All$/ }).first();
    await scopeDropdown.click();
    await page.click('[data-slot="dropdown-menu-item"]:has-text("Department")');
    
    await page.click('button:has-text("Save Changes")');
    
    // Wait for close
    await expect(page.locator('h2', { hasText: `Edit: ${roleName}` })).toHaveCount(0);

    // 4. Assign to User
    await page.goto('/admin/users');
    
    // Find first user and click their row
    await page.locator('table tbody tr').first().click();
    
    // Go to Access Control tab
    await page.click('button:has-text("Access Control")');
    
    // Check the new role checkbox
    const newRoleLabel = page.locator('label', { hasText: roleName });
    // Click the checkbox inside the label
    await newRoleLabel.locator('button[role="checkbox"]').click();
    
    // Save assignments
    await page.click('button:has-text("Save")');
    
    // Verify toast or effect
    await expect(page.locator('text=Roles assigned successfully')).toBeVisible();
  });
});
