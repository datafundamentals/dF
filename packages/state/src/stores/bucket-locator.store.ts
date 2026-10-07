import {computed, signal} from '@lit-labs/signals';
import type {
  BucketCreateResponse,
  BucketLocatorState,
  InventoryBucket,
  InventoryLocation,
  InventoryPart,
  InventoryTag,
  PartDecrementResponse,
  PartIntakeResponse,
  PartUpdateResponse,
} from '@df/types';
import {resolveBackendUrl} from '../utils/bucket-locator-backend-url.js';

const locationsSignal = signal<InventoryLocation[]>([]);
const bucketsSignal = signal<InventoryBucket[]>([]);
const tagsSignal = signal<InventoryTag[]>([]);
const partsSignal = signal<InventoryPart[]>([]);
const searchTextSignal = signal('');
const selectedTagsSignal = signal<string[]>([]);
const onlyMyBucketsSignal = signal(false);
const selectedLocationIdSignal = signal('');
const selectedBucketIdSignal = signal('');
const activeBucketIdSignal = signal('');
const loadingSignal = signal(false);
const savingSignal = signal(false);
const errorSignal = signal<string | null>(null);

export const bucketLocatorState = computed<BucketLocatorState>(() => ({
  locations: locationsSignal.get(),
  buckets: bucketsSignal.get(),
  tags: tagsSignal.get(),
  parts: partsSignal.get(),
  searchText: searchTextSignal.get(),
  selectedTags: selectedTagsSignal.get(),
  onlyMyBuckets: onlyMyBucketsSignal.get(),
  selectedLocationId: selectedLocationIdSignal.get(),
  selectedBucketId: selectedBucketIdSignal.get(),
  activeBucketId: activeBucketIdSignal.get(),
  loading: loadingSignal.get(),
  saving: savingSignal.get(),
  error: errorSignal.get(),
}));

export async function loadBucketLocator(): Promise<void> {
  loadingSignal.set(true);
  errorSignal.set(null);
  try {
    const [locations, buckets, tags] = await Promise.all([
      api<InventoryLocation[]>('/locations'),
      api<InventoryBucket[]>('/buckets'),
      api<InventoryTag[]>('/tags'),
    ]);
    locationsSignal.set(locations);
    bucketsSignal.set(buckets);
    tagsSignal.set(tags);
    const storedBucket = sessionStorage.getItem('df-bucket-locator-active-bucket');
    activeBucketIdSignal.set(
      storedBucket && buckets.some((bucket) => bucket.id === storedBucket)
        ? storedBucket
        : ''
    );
    await refreshParts();
  } catch (error) {
    errorSignal.set(toMessage(error));
  } finally {
    loadingSignal.set(false);
  }
}

export async function refreshParts(): Promise<void> {
  const params = new URLSearchParams();
  const query = searchTextSignal.get().trim();
  if (query) params.set('q', query);
  const bucketId = selectedBucketIdSignal.get();
  if (bucketId) params.set('bucket_id', bucketId);
  const locationId = selectedLocationIdSignal.get();
  if (locationId) params.set('location_id', locationId);
  for (const tag of selectedTagsSignal.get()) params.append('tag', tag);
  if (onlyMyBucketsSignal.get()) params.set('my_buckets', 'true');
  const suffix = params.size ? `?${params.toString()}` : '';
  try {
    partsSignal.set(await api<InventoryPart[]>(`/parts${suffix}`));
    errorSignal.set(null);
  } catch (error) {
    errorSignal.set(toMessage(error));
  }
}

export function setSearchText(value: string): void {
  searchTextSignal.set(value);
}

export function setSelectedLocationId(value: string): void {
  selectedLocationIdSignal.set(value);
  selectedBucketIdSignal.set('');
}

export function setSelectedBucketId(value: string): void {
  selectedBucketIdSignal.set(value);
}

export function setOnlyMyBuckets(value: boolean): void {
  onlyMyBucketsSignal.set(value);
}

export function setActiveBucketId(value: string): void {
  activeBucketIdSignal.set(value);
  if (value) sessionStorage.setItem('df-bucket-locator-active-bucket', value);
  else sessionStorage.removeItem('df-bucket-locator-active-bucket');
}

export function toggleSelectedTag(tagId: string): void {
  const current = selectedTagsSignal.get();
  selectedTagsSignal.set(
    current.includes(tagId)
      ? current.filter((tag) => tag !== tagId)
      : [...current, tagId]
  );
}

export async function createLocation(
  name: string,
  description: string
): Promise<void> {
  await withSaving(async () => {
    await api('/locations', {
      method: 'POST',
      body: JSON.stringify({name, description}),
    });
    locationsSignal.set(await api<InventoryLocation[]>('/locations'));
  });
}

export async function updateLocation(input: {
  id: string;
  name: string;
  description: string;
}): Promise<void> {
  await withSaving(async () => {
    await api(`/locations/${encodeURIComponent(input.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({name: input.name.trim(), description: input.description.trim()}),
    });
    await refreshAfterMutation();
  });
}

export async function deleteLocation(locationId: string): Promise<void> {
  await withSaving(async () => {
    await api(`/locations/${encodeURIComponent(locationId)}`, {method: 'DELETE'});
    await refreshAfterMutation();
  });
}

export async function createBucket(
  locationId: string,
  description: string
): Promise<BucketCreateResponse> {
  return withSaving(async () => {
    const result = await api<BucketCreateResponse>('/buckets', {
      method: 'POST',
      body: JSON.stringify({location_id: locationId, description}),
    });
    setActiveBucketId(result.bucket_id);
    await refreshManagementData();
    return result;
  });
}

export async function moveBucket(
  bucketId: string,
  locationId: string
): Promise<void> {
  await withSaving(async () => {
    await api(`/buckets/${encodeURIComponent(bucketId)}/location`, {
      method: 'PATCH',
      body: JSON.stringify({location_id: locationId}),
    });
    await refreshManagementData();
    await refreshParts();
  });
}

export async function updateBucket(input: {
  id: string;
  locationId: string;
  description: string;
}): Promise<void> {
  await withSaving(async () => {
    await api(`/buckets/${encodeURIComponent(input.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({location_id: input.locationId, description: input.description.trim()}),
    });
    await refreshAfterMutation();
  });
}

export async function deleteBucket(bucketId: string): Promise<void> {
  await withSaving(async () => {
    await api(`/buckets/${encodeURIComponent(bucketId)}`, {method: 'DELETE'});
    if (activeBucketIdSignal.get() === bucketId) setActiveBucketId('');
    await refreshAfterMutation();
  });
}

export async function createTag(label: string): Promise<void> {
  await withSaving(async () => {
    await api('/tags', {method: 'POST', body: JSON.stringify({label: label.trim()})});
    await refreshManagementData();
  });
}

export async function updateTag(tagId: string, label: string): Promise<void> {
  await withSaving(async () => {
    await api(`/tags/${encodeURIComponent(tagId)}`, {
      method: 'PATCH', body: JSON.stringify({label: label.trim()}),
    });
    await refreshManagementData();
    await refreshParts();
  });
}

export async function deleteTag(tagId: string): Promise<void> {
  await withSaving(async () => {
    await api(`/tags/${encodeURIComponent(tagId)}`, {method: 'DELETE'});
    if (selectedTagsSignal.get().includes(tagId)) toggleSelectedTag(tagId);
    await refreshManagementData();
    await refreshParts();
  });
}

export async function intakePart(input: {
  file: Blob;
  bucketId: string;
  name: string;
  description: string;
  quantity: number;
  tags: string[];
}): Promise<void> {
  await withSaving(async () => {
    const form = new FormData();
    form.set('file', input.file, 'part.jpg');
    form.set('bucket_id', input.bucketId);
    form.set('name', input.name.trim());
    form.set('description', input.description.trim());
    form.set('quantity', String(input.quantity));
    form.set('tags', JSON.stringify(input.tags));
    await api<PartIntakeResponse>('/parts/intake', {
      method: 'POST',
      body: form,
    });
    setActiveBucketId(input.bucketId);
    await refreshManagementData();
    await refreshParts();
  });
}

export async function decrementPart(
  partId: string,
  count = 1
): Promise<PartDecrementResponse> {
  return withSaving(async () => {
    const result = await api<PartDecrementResponse>(
      `/parts/${encodeURIComponent(partId)}/decrement`,
      {method: 'POST', body: JSON.stringify({count})}
    );
    await refreshManagementData();
    await refreshParts();
    return result;
  });
}

export async function updatePart(input: {
  id: string;
  name: string;
  description: string;
  quantity: number;
  bucketId: string;
  tags: string[];
}): Promise<PartUpdateResponse> {
  return withSaving(async () => {
    const result = await api<PartUpdateResponse>(
      `/parts/${encodeURIComponent(input.id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          name: input.name.trim(),
          description: input.description.trim(),
          quantity: input.quantity,
          bucket_id: input.bucketId,
          tags: input.tags,
        }),
      }
    );
    await refreshManagementData();
    await refreshParts();
    return result;
  });
}

export async function deletePart(partId: string): Promise<void> {
  await withSaving(async () => {
    await api(`/parts/${encodeURIComponent(partId)}`, {method: 'DELETE'});
    await refreshAfterMutation();
  });
}

async function refreshAfterMutation(): Promise<void> {
  await refreshManagementData();
  await refreshParts();
}

async function refreshManagementData(): Promise<void> {
  const [locations, buckets, tags] = await Promise.all([
    api<InventoryLocation[]>('/locations'),
    api<InventoryBucket[]>('/buckets'),
    api<InventoryTag[]>('/tags'),
  ]);
  locationsSignal.set(locations);
  bucketsSignal.set(buckets);
  tagsSignal.set(tags);
}

async function withSaving<T>(operation: () => Promise<T>): Promise<T> {
  savingSignal.set(true);
  errorSignal.set(null);
  try {
    return await operation();
  } catch (error) {
    errorSignal.set(toMessage(error));
    throw error;
  } finally {
    savingSignal.set(false);
  }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(resolveBackendUrl(`/api${path}`), {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body instanceof FormData
        ? {}
        : {'Content-Type': 'application/json'}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | {error?: string}
      | null;
    throw new Error(payload?.error ?? `Request failed (${response.status})`);
  }
  return (response.status === 204 ? undefined : response.json()) as Promise<T>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The request failed';
}