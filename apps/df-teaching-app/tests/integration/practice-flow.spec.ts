import {expect, test} from 'playwright/test';

const FAILURE_ALERT = 'Practice tasks fetch forced failure';

test.describe('df-practice-app integrations', () => {
  test('loads tasks on startup and supports resetting from the host shell', async ({page}) => {
    await page.goto('/');

    await expect(page.getByRole('heading', {level: 1, name: 'Practice runtime harness'})).toBeVisible();
    await expect(page.getByText('Loading tasks…')).toBeVisible();

    const taskItems = page.locator('df-practice-widget li');
    await expect(taskItems).toHaveCount(3);

    const storeSnapshot = page.locator('[aria-label="store-state"] pre');
    await expect(storeSnapshot).toContainText('"status": "ready"');

    await page.getByRole('button', {name: 'Reload from host', exact: true}).click();
    await expect(page.getByText('Loading tasks…')).toBeVisible();
    await expect(taskItems).toHaveCount(3);

    await page.getByRole('button', {name: 'Reset store', exact: true}).click();
    await expect(storeSnapshot).toContainText('"status": "idle"');
    await expect(taskItems).toHaveCount(0);
  });

  test('surfaces forced failures and recovers after retrying', async ({page}) => {
    await page.goto('/');

    const storeSnapshot = page.locator('[aria-label="store-state"] pre');

    await page.evaluate(() => {
      const target = window as {
        __dfPracticeForcePracticeError?: boolean;
        __dfPracticeForcePracticeErrorSetter?: (flag: boolean) => void;
      };
      target.__dfPracticeForcePracticeError = true;
      target.__dfPracticeForcePracticeErrorSetter?.(true);
    });

    await page.getByRole('button', {name: 'Refresh tasks', exact: true}).click();
    await expect(storeSnapshot).toContainText('"status": "error"');
    await expect(page.locator('df-practice-widget .error[role="alert"]')).toContainText(FAILURE_ALERT);

    // Clear the override and validate the happy path recovers.
    await page.evaluate(() => {
      const target = window as {
        __dfPracticeForcePracticeError?: boolean;
        __dfPracticeForcePracticeErrorSetter?: (flag: boolean) => void;
      };
      target.__dfPracticeForcePracticeError = false;
      target.__dfPracticeForcePracticeErrorSetter?.(false);
    });

    await page.getByRole('button', {name: 'Refresh tasks', exact: true}).click();
    await expect(page.locator('df-practice-widget .status')).toContainText('Loading tasks…');
    await expect(page.locator('df-practice-widget li')).toHaveCount(3);
    await expect(storeSnapshot).toContainText('"status": "ready"');
  });
});
