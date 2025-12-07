import {expect, test} from 'playwright/test';

test('shows Firebase teaching workspace demos', async ({page}) => {
  await page.goto('/');

  const envBanner = await page.waitForSelector('df-environment-banner', {state: 'attached'});
  const authWrapper = await page.waitForSelector('df-auth-wrapper', {state: 'attached'});
  const firestoreDemo = await page.waitForSelector('df-firestore-demo', {state: 'attached'});

  expect(envBanner).not.toBeNull();
  expect(authWrapper).not.toBeNull();
  expect(firestoreDemo).not.toBeNull();
});
