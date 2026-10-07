export interface InventoryLocation {
  id: string;
  name: string;
  description: string | null;
  bucket_count: number;
}

export interface InventoryBucket {
  id: string;
  location_id: string;
  location_name: string;
  description?: string | null;
  part_count: number;
}

export interface InventoryTag {
  id: string;
  label: string;
  count: number;
}

export interface InventoryPart {
  id: string;
  created_by: string;
  name: string;
  description: string;
  quantity: number;
  bucket_id: string;
  location_name: string;
  tags: string[];
  photo_url: string;
}

export interface BucketLocatorState {
  locations: InventoryLocation[];
  buckets: InventoryBucket[];
  tags: InventoryTag[];
  parts: InventoryPart[];
  searchText: string;
  selectedTags: string[];
  onlyMyBuckets: boolean;
  selectedLocationId: string;
  selectedBucketId: string;
  activeBucketId: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export interface BucketLocatorRuntimeConfig {
  backendOrigin: string;
}

declare global {
  interface Window {
    __DF_BUCKET_LOCATOR_CONFIG__?: BucketLocatorRuntimeConfig;
  }
}

export interface BucketLocatorApiSuccess {
  success: true;
}

export interface BucketCreateResponse extends BucketLocatorApiSuccess {
  bucket_id: string;
  location_name: string;
}

export interface PartIntakeResponse extends BucketLocatorApiSuccess {
  part_id: string;
}

export interface PartDecrementResponse extends BucketLocatorApiSuccess {
  remaining: number;
  deleted: boolean;
}

export interface PartUpdateResponse extends BucketLocatorApiSuccess {
  part_id?: string;
  deleted?: boolean;
}