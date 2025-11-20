import {expect, test} from 'playwright/test';

test.describe('User Admin App - Smoke Tests', () => {
  test('page loads and has correct title', async ({page}) => {
    await page.goto('/');

    // Check HTML title
    const title = await page.title();
    expect(title).toBe('User Administration');
  });

  test('auth wrapper is in DOM', async ({page}) => {
    await page.goto('/');

    // Verify the auth wrapper exists in the DOM (may be hidden in headless mode)
    const authWrapper = page.locator('df-auth-wrapper');
    await expect(authWrapper).toBeAttached({timeout: 5000});
  });

  test('app shell is in DOM', async ({page}) => {
    await page.goto('/');

    // Verify the user admin app shell exists in the DOM
    const shell = await page.locator('user-admin-app-shell');
    await expect(shell).toBeAttached({timeout: 5000});
  });

  test('environment banner is in DOM', async ({page}) => {
    await page.goto('/');

    // Environment banner should be present in the DOM
    const banner = await page.locator('df-environment-banner');
    await expect(banner).toBeAttached({timeout: 5000});
  });

});
