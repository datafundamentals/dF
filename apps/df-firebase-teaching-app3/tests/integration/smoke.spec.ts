import {expect, test} from 'playwright/test';

test('shows emulator workspace landing page', async ({page}) => {
  await page.goto('/');

  // Verify the page loads successfully by checking for the auth wrapper
  const authWrapper = await page.waitForSelector('df-auth-wrapper', {timeout: 5000});
  expect(authWrapper).not.toBeNull();

  // Verify the app container exists in the DOM
  const container = await page.locator('rename-me-app-container');
  await expect(container).toBeAttached({timeout: 5000});
});
