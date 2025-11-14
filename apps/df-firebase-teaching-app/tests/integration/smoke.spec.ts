import {expect, test} from 'playwright/test';

test('shows Firebase teaching workspace landing page', async ({page}) => {
  await page.goto('/');

  const headingsHandle = await page.waitForFunction(() => {
    const host = document.querySelector('df-firebase-teaching-app');
    const shadow = host?.shadowRoot;
    const mainTitle = shadow?.querySelector('h1')?.textContent?.trim();
    const setupTitle = shadow?.querySelector('h2')?.textContent?.trim();
    return mainTitle && setupTitle ? {mainTitle, setupTitle} : null;
  });

  const headings = await headingsHandle.jsonValue();

  expect(headings?.mainTitle).toBe('Firebase Teaching Workspace');
  expect(headings?.setupTitle).toBe('Quick setup');
});
