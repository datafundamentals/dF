import {expect, test} from 'playwright/test';

test('renders the auth wrapper shell', async ({page}) => {
  await page.goto('/');

  const wrapper = page.locator('df-auth-wrapper');
  await expect(wrapper).toBeVisible();
  await expect(wrapper).toHaveAttribute('emailpw', '');
});
