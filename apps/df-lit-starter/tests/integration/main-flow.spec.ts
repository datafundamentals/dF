import {expect, test, Page} from 'playwright/test';

const DEMO_PATH = '/dev/index.html';

const INITIAL_NAME = 'World';
const UPDATED_NAME = 'Playwright';

const storeSnapshotLocator = '[aria-label="lit-starter-store-state"] pre';

function storeSnapshot(page: Page) {
  return page.locator(storeSnapshotLocator);
}

function counterButton(page: Page) {
  return page.getByRole('button', {name: /^Click Count:/});
}

test.describe('lit-starter shell', () => {
  test('edits name, increments count, and resets state', async ({page}) => {
    await page.goto(DEMO_PATH);

    await expect(page.getByRole('heading', {level: 1, name: 'Signal-driven Lit starter shell'})).toBeVisible();

    const nameInput = page.getByLabel('Display name');
    await expect(nameInput).toHaveValue(INITIAL_NAME);

    await nameInput.fill(UPDATED_NAME);
    await expect(page.getByRole('heading', {level: 1, name: `Hello, ${UPDATED_NAME}!`})).toBeVisible();
    await expect(storeSnapshot(page)).toContainText(`"name": "${UPDATED_NAME}"`);

    const incrementViaStore = page.getByRole('button', {name: 'Increment via store'});
    await incrementViaStore.click();
    await expect(counterButton(page)).toHaveText('Click Count: 1');
    await expect(storeSnapshot(page)).toContainText('"clickCount": 1');

    const sharedCounter = counterButton(page);
    await sharedCounter.click();
    await expect(counterButton(page)).toHaveText('Click Count: 2');
    await expect(storeSnapshot(page)).toContainText('"clickCount": 2');

    await page.getByRole('button', {name: 'Reset store'}).click();
    await expect(nameInput).toHaveValue(INITIAL_NAME);
    await expect(counterButton(page)).toHaveText('Click Count: 0');
    await expect(storeSnapshot(page)).toContainText(`"name": "${INITIAL_NAME}"`);
    await expect(storeSnapshot(page)).toContainText('"clickCount": 0');
    await expect(page.getByRole('heading', {level: 1, name: `Hello, ${INITIAL_NAME}!`})).toBeVisible();
  });
});
