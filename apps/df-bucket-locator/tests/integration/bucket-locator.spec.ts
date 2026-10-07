import {expect, test} from 'playwright/test';

test('loads behind Access and submits multi-tag search filters', async ({page}) => {
  const partSearches: URL[] = [];
  await page.route('**/cf-auth/_protected/whoami', async (route) => {
    await route.fulfill({json: {email: 'owner@example.com', sub: 'owner-1', name: 'Owner'}});
  });
  await page.route('**/api/locations', async (route) => {
    await route.fulfill({json: [{id: 'location-1', name: 'Workshop', description: null, bucket_count: 1}]});
  });
  await page.route('**/api/buckets', async (route) => {
    await route.fulfill({json: [{id: 'ABCD', location_id: 'location-1', location_name: 'Workshop', part_count: 0}]});
  });
  await page.route('**/api/tags', async (route) => {
    await route.fulfill({json: [{id: 'paint', label: 'paint', count: 0}, {id: 'remove', label: 'remove', count: 0}]});
  });
  await page.route('**/api/parts**', async (route) => {
    partSearches.push(new URL(route.request().url()));
    await route.fulfill({json: [
      {id: 'part-1', created_by: 'owner@example.com', name: 'Anchor', description: 'Steel anchor', quantity: 3, bucket_id: 'ABCD', location_name: 'Workshop', tags: ['hardware'], photo_url: '/photo-1'},
      {id: 'part-2', created_by: 'owner@example.com', name: 'Bolt', description: 'Short bolt', quantity: 8, bucket_id: 'ABCD', location_name: 'Workshop', tags: ['hardware'], photo_url: '/photo-2'},
    ]});
  });

  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Bucket Locator'})).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('row').nth(1)).toContainText('owner@example.com');
  await expect(page.getByRole('row').nth(1)).toContainText('Anchor');
  await expect(page.getByRole('row').nth(2)).toContainText('Bolt');

  const tagFilters = page.getByLabel('Filter by tags');
  await tagFilters.getByRole('button', {name: 'paint', exact: true}).click();
  await tagFilters.getByRole('button', {name: 'remove', exact: true}).click();
  await expect.poll(() => partSearches.at(-1)?.searchParams.getAll('tag')).toEqual(['paint', 'remove']);

  const myBucketsSwitch = page.getByRole('switch', {name: 'Show only buckets I created'});
  await myBucketsSwitch.click();
  await expect.poll(() => partSearches.at(-1)?.searchParams.get('my_buckets')).toBe('true');

  await page.setViewportSize({width: 390, height: 844});
  await expect(page.getByRole('heading', {name: 'Bucket Locator'})).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test('accepts a desktop image drop for part intake', async ({page}) => {
  await page.route('**/cf-auth/_protected/whoami', async (route) => {
    await route.fulfill({json: {email: 'owner@example.com', sub: 'owner-1'}});
  });
  await page.route('**/api/locations', async (route) => { await route.fulfill({json: []}); });
  await page.route('**/api/buckets', async (route) => { await route.fulfill({json: []}); });
  await page.route('**/api/tags', async (route) => { await route.fulfill({json: []}); });
  await page.route('**/api/parts**', async (route) => { await route.fulfill({json: []}); });

  await page.goto('/');
  await page.getByRole('heading', {name: 'Bucket Locator'}).waitFor();
  await page.locator('bucket-intake-panel').evaluate((panel) => {
    const target = panel.shadowRoot?.querySelector('.capture');
    if (!target) throw new Error('Photo drop target was not rendered');
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas was unavailable');
    context.fillStyle = '#174c3d';
    context.fillRect(0, 0, 2, 2);
    const bytes = Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]), (char) => char.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], 'part.png', {type: 'image/png'}));
    target.dispatchEvent(new DragEvent('dragover', {bubbles: true, cancelable: true, dataTransfer: transfer}));
    target.dispatchEvent(new DragEvent('drop', {bubbles: true, cancelable: true, dataTransfer: transfer}));
  });
  await expect(page.locator('bucket-intake-panel').locator('img[alt="Part photo preview"]')).toBeVisible();
});

test('edits storage records, manages tags, blocks unsafe deletes, and deletes a part', async ({page}) => {
  let locationName = 'Workshop';
  let bucketDescription = 'Initial description';
  let tagLabel = 'hardware';
  const tags = [{id: 'hardware', label: tagLabel, count: 1}];
  let parts = [{id: 'part-1', created_by: 'owner@example.com', name: 'Anchor', description: 'Steel anchor', quantity: 3, bucket_id: 'ABCD', location_name: locationName, tags: [tagLabel], photo_url: '/photo-1'}];
  const calls: string[] = [];
  page.on('dialog', (dialog) => dialog.accept());

  await page.route('**/cf-auth/_protected/whoami', async (route) => {
    await route.fulfill({json: {email: 'owner@example.com', sub: 'owner-1'}});
  });
  await page.route('**/api/locations', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({json: [{id: 'location-1', name: locationName, description: null, bucket_count: 1}]});
    } else {
      calls.push(`locations ${route.request().method()}`);
      await route.fulfill({status: 201, json: {id: 'location-2', name: 'Second'}});
    }
  });
  await page.route('**/api/locations/**', async (route) => {
    calls.push(`location ${route.request().method()}`);
    if (route.request().method() === 'PATCH') {
      locationName = (await route.request().postDataJSON()).name;
      await route.fulfill({json: {success: true, id: 'location-1', name: locationName}});
    } else {
      await route.fulfill({json: {success: true, deleted: true}});
    }
  });
  await page.route('**/api/buckets', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({json: [{id: 'ABCD', location_id: 'location-1', location_name: locationName, description: bucketDescription, part_count: parts.length}]});
    } else {
      await route.fulfill({status: 201, json: {success: true, bucket_id: 'WXYZ', location_name: locationName}});
    }
  });
  await page.route('**/api/buckets/**', async (route) => {
    calls.push(`bucket ${route.request().method()}`);
    if (route.request().method() === 'PATCH') {
      bucketDescription = (await route.request().postDataJSON()).description;
      await route.fulfill({json: {success: true, bucket_id: 'ABCD', new_location: locationName}});
    } else {
      await route.fulfill({json: {success: true, deleted: true}});
    }
  });
  await page.route('**/api/tags', async (route) => {
    if (route.request().method() === 'POST') {
      const label = (await route.request().postDataJSON()).label as string;
      calls.push('tag POST');
      tags.push({id: label.toLowerCase(), label, count: 0});
      await route.fulfill({status: 201, json: {success: true, id: label.toLowerCase(), label}});
      return;
    }
    await route.fulfill({json: tags});
  });
  await page.route('**/api/tags/**', async (route) => {
    calls.push(`tag ${route.request().method()}`);
    if (route.request().method() === 'PATCH') {
      tagLabel = (await route.request().postDataJSON()).label;
      tags[0].label = tagLabel;
      await route.fulfill({json: {success: true, id: 'hardware', label: tagLabel}});
    } else {
      await route.fulfill({json: {success: true, deleted: true}});
    }
  });
  await page.route('**/api/parts**', async (route) => {
    await route.fulfill({json: parts});
  });
  await page.route('**/api/parts/part-1', async (route) => {
    const method = route.request().method();
    calls.push(`part ${method}`);
    if (method === 'PATCH') {
      const update = await route.request().postDataJSON();
      parts = parts.map((part) => ({...part, name: update.name, description: update.description, quantity: update.quantity}));
      await route.fulfill({json: {success: true, part_id: 'part-1'}});
      return;
    }
    if (method === 'DELETE') {
      parts = [];
      await route.fulfill({json: {success: true, deleted: true}});
      return;
    }
    await route.continue();
  });

  await page.goto('/');
  const manager = page.locator('bucket-record-manager');
  await expect(page.getByRole('table')).toBeVisible();
  const locationRecord = manager.locator('.record').filter({hasText: 'Workshop'}).first();
  await locationRecord.getByRole('button', {name: 'Edit', exact: true}).click();
  await manager.getByLabel('Location name').fill('Repair Room');
  await manager.getByRole('button', {name: 'Save location'}).click();
  await expect.poll(() => calls).toContain('location PATCH');

  const bucketRecord = manager.locator('.record').filter({hasText: 'ABCD'}).first();
  await bucketRecord.getByRole('button', {name: 'Edit', exact: true}).click();
  await manager.getByLabel('Bucket description').fill('Sorted fasteners');
  await manager.getByRole('button', {name: 'Save bucket'}).click();
  await expect.poll(() => calls).toContain('bucket PATCH');
  await expect(bucketRecord.getByRole('button', {name: 'Delete', exact: true})).toBeDisabled();
  await expect(manager.locator('.record').filter({hasText: 'Repair Room'}).first().getByRole('button', {name: 'Delete', exact: true})).toBeDisabled();

  const tagRecord = manager.locator('.record').filter({hasText: 'hardware'}).first();
  await tagRecord.getByRole('button', {name: 'Edit', exact: true}).click();
  await manager.getByLabel('Tag label').fill('tools');
  await manager.getByRole('button', {name: 'Save tag'}).click();
  await expect.poll(() => calls).toContain('tag PATCH');
  await manager.getByRole('button', {name: 'New tag'}).click();
  await manager.getByLabel('Tag label').fill('spare');
  await manager.getByRole('button', {name: 'Create tag'}).click();
  await expect.poll(() => calls).toContain('tag POST');

  await page.getByRole('button', {name: 'Edit Anchor', exact: true}).click();
  const editor = page.locator('part-edit-dialog');
  await editor.getByLabel('Part name').fill('Anchor corrected');
  await editor.getByRole('button', {name: 'Save changes'}).click();
  await expect.poll(() => calls).toContain('part PATCH');
  await expect(page.getByText('Anchor corrected')).toBeVisible();

  await page.getByRole('button', {name: 'Delete Anchor corrected', exact: true}).click();
  await expect.poll(() => calls).toContain('part DELETE');
  await expect(page.getByText('No parts match these filters.')).toBeVisible();
});