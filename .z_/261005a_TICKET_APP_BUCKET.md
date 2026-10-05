# Product & Technical Requirements Document: Bucket-Based Inventory System

## 0. PRE-REQUIREMENTS

This ticket requires the coding agent to reconcile three unresolved sets of work which are not complete and thus have not been reconciled, even before beginning the work outlined in this ticket. This reconciliation process should not be impossible, mathematically - but it may create some contradictory instructions. This section of the document shall attempt to outline how to resolve them, when that is possible - by unwinding the history of this repository.

a). The beginnings of this repository left a large set of "guides" for specific use cases as markdowns within `/guides/`. These were written sequentially and may contradict each other, but largely reflect the intent of this repository, most specifically how to keep out some standard vibe-coding practices from polluting the intent of this repository. The short recap is that this repository is intended to provide one standard approach to doing everything, and this approach is followed through the creation of each thing placed in the repository. This intent has not been followed perfectly, but in most respects it has been successful. This compliance is more true where it is more important, in the `/apps` and `/packages` where it is most important. `/tools` is kind of a free-for-all but since these are not considered reusable components more latitude is given, there. 

b). In recent weeks, a decision was made to migrate from Firebase as a back end, to Cloudflare as a back end. Yet, no previously written code was changed, yet. Neither were any of the guides, docs, or other references. Only `df-standard-pioneer-auth-wrapper` was created to this new standard, and even that was never code reviewed. So whereas you are required to follow this new `cloudflare as a back end` requirement, you will be constantly told in the docs to use firebase. This seems like a guarantee for disaster, but I am hoping you can stick to the new requirement for this project. For example you would still use signal in the state store and lit web components in the PWA but not firebase storage or functions or persistence.

c). There are still many holes left in the usage, such as example code for first usage of cloudflare for file storage. So you will be required to infer some generalized or implicit intent from some of the guides as far as hygiene and the like, but apply it to new stacks. Please do what you can to establish one very clean and maintainable approach for all coding within all new stack usages.

d). There is a mostly untested `df-standard-pioneer-auth-wrapper` authentication element which shall be required on the first deployment of this first new app within this monorepo which is migrating to cloudflare from firebase. Therefore you will be required to consume the cookie created by this element, in order to provide authorization for back end operations required by this first new cloudflare app. Like c) above, this requires you to blaze a new trail in terms of setting clean and maintainable standards, where possible, for this new security functionality within the state store and web component structures.

e). There may be confusion caused by conflicts between requirements as noted above. There should be absolutely zero confusion about git adds, commits, merges, and pushes. You are strictly forbidden to use these operations - because that is how i do code reviews - via git diffs. Do not ask, suggest, or otherwise prompt for permissions to execute such git operations.

## 1. System Overview & Objective

The Bucket-Based Inventory System is a multi-user, mobile-first web application designed to catalog, locate, and manage hundreds of loose physical parts stored across physical buckets.

Physical buckets are placed in defined storage locations and identified by randomly generated 4-character uppercase alphanumeric codes (e.g., `KGCT`). Users photograph each part at intake, input structured metadata and flexible tags, and store the records in a unified Cloudflare backend. Users can subsequently search for parts by keyword, bucket, or tags to immediately identify which bucket contains the item and where that bucket is physically located.

---

## 2. Infrastructure & Architectural Boundaries

```
+---------------------------------------------------------------------------------+
| Client Tier: Mobile-First Progressive Web App (Android / Desktop)               |
| - Standard HTML5 Camera Hardware Capture (`capture="environment"`)              |
| - Client-side Canvas Image Resizing & JPEG Compression                          |
| - Cloudflare Access Cookie (`CF_Authorization`) passed on all HTTPS requests    |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
| Compute Tier: Cloudflare Workers (Edge API Runtime)                             |
| - Validates Cloudflare Access JWT cookie / headers                              |
| - Manages multi-statement atomic transactions via D1 Batch API                  |
| - Directly streams binary image blobs to R2 Object Storage                      |
| - Serves static frontend assets                                                 |
+-----------------------------------+--------------------+------------------------+
                                    |                    |
                                    v                    v
+---------------------------------------+   +-------------------------------------+
| Database Tier: Cloudflare D1 (SQLite)  |   | Object Storage: Cloudflare R2       |
| - Relational entities & M:N tag joins |   | - Optimized part image files        |
| - Write-serialized global consistency |   | - Content-hashed keys (`parts/*.jpg`)|
| - Real-time multi-user state visibility|  +-------------------------------------+
+---------------------------------------+

```

### Core System Constraints

1. **Multi-User Consistency:** Database writes must route through a central, shared database engine (Cloudflare D1) so quantity changes, relocations, or new entries are visible in real time across all authenticated devices.
2. **Android Capture & Storage Handling:** Android devices route camera capture via native mechanisms. Photos must be intercepted in-memory by the browser as raw Blobs, downsampled client-side to conserve mobile bandwidth, and uploaded directly to Cloudflare R2.
3. **Authentication:** The application operates behind Cloudflare Access. Every incoming request to the API worker must be authenticated via the `CF_Authorization` cookie. The backend extracts user identity via the `Cf-Access-Authenticated-User-Email` header for audit attribution.
4. **Synchronous Intake Guard:** The intake UI must block record creation until a valid photo blob has been captured and all mandatory text fields are filled.

---

## 3. Database Schema (Cloudflare D1 / SQLite)

```sql
-- 1. Physical Locations
CREATE TABLE locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
);

-- 2. Physical Buckets
CREATE TABLE buckets (
    id TEXT PRIMARY KEY,               -- Fixed 4-character code (e.g., 'KGCT')
    location_id TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE
);

-- 3. Parts Inventory
CREATE TABLE parts (
    id TEXT PRIMARY KEY,               -- UUIDv4 or NanoID
    bucket_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_r2_key TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'CONSUMED'
    created_by TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (bucket_id) REFERENCES buckets(id) ON UPDATE CASCADE
);

-- 4. Tag Definitions
CREATE TABLE tags (
    id TEXT PRIMARY KEY,               -- Slugified key (e.g., 'paint-related')
    label TEXT NOT NULL UNIQUE,        -- Display label (e.g., 'Paint Related')
    created_at INTEGER DEFAULT (unixepoch())
);

-- 5. Part-Tag Association (M:N Mapping)
CREATE TABLE part_tags (
    part_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    PRIMARY KEY (part_id, tag_id),
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 6. Audit & History Trail
CREATE TABLE inventory_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,         -- 'PART' | 'BUCKET' | 'LOCATION'
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,              -- 'CREATE', 'UPDATE_METADATA', 'MOVE_LOCATION', 'MOVE_BUCKET', 'DECREMENT'
    details TEXT,                      -- JSON snapshot of changes
    user_id TEXT NOT NULL,
    timestamp INTEGER DEFAULT (unixepoch())
);

-- Indices for performance
CREATE INDEX idx_buckets_location ON buckets(location_id);
CREATE INDEX idx_parts_bucket ON parts(bucket_id);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_part_tags_tag ON part_tags(tag_id);

```

---

## 4. Backend Logic & API Specifications

### 4.1 Bucket Code Generation Algorithm

Bucket IDs must be 4 characters, uppercase, and drawn from an unambiguous 32-character Base32 character set omitting visually similar characters (`0`, `O`, `1`, `I`):

* **Alphabet:** `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`
* **Collision Handling:** Generation must employ cryptographic randomness and retry on primary key constraint collision (up to 5 attempts).

### 4.2 REST API Endpoints

All endpoints require a valid Cloudflare Access session.

| Method | Route | Description | Request Payload | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/locations` | List all active locations | None | `[ { id, name, description, bucket_count } ]` |
| `POST` | `/api/locations` | Create a new location | `{ name: string, description?: string }` | `{ id: string, name: string }` |
| `GET` | `/api/buckets` | List all buckets | None | `[ { id, location_id, location_name, part_count } ]` |
| `POST` | `/api/buckets` | Initialize bucket (generates 4-char ID) | `{ location_id: string, description?: string }` | `{ success: true, bucket_id: string, location_name: string }` |
| `PATCH` | `/api/buckets/:id/location` | Move physical bucket to new location | `{ location_id: string }` | `{ success: true, bucket_id: string, new_location: string }` |
| `GET` | `/api/tags` | List all tags with usage counts | None | `[ { id: string, label: string, count: number } ]` |
| `GET` | `/api/parts` | Search parts by text, bucket, or tags | Query params: `?q=&bucket_id=&tag=` | `[ { id, name, description, quantity, bucket_id, location_name, tags: string[], photo_url } ]` |
| `POST` | `/api/parts/intake` | Multipart intake (photo + metadata + tags) | `multipart/form-data`: `file`, `bucket_id`, `name`, `description`, `quantity`, `tags` (JSON array) | `{ success: true, part_id: string }` |
| `PATCH` | `/api/parts/:id` | Update part metadata, bucket, or tags | `{ name?: string, description?: string, quantity?: number, bucket_id?: string, tags?: string[] }` | `{ success: true, part_id: string }` |
| `POST` | `/api/parts/:id/decrement` | Decrement part quantity by count | `{ count: number }` | `{ success: true, remaining: number, status: string }` |
| `GET` | `/api/photos/:key` | Retrieve photo file stream from R2 | None | Binary image (`image/jpeg`) |

---

## 5. Client Requirements & User Workflows

### 5.1 Image Capture & Optimization Pipeline

* The client must use `<input type="file" accept="image/*" capture="environment">` to invoke the native rear camera on Android and mobile devices.
* Upon image selection:
1. The raw file is rendered into an offscreen HTML Canvas.
2. Canvas calculates scaled dimensions maintaining aspect ratio, capped at a maximum of `1600px` on the longest edge.
3. The canvas is exported to a Blob as `image/jpeg` at `0.80` to `0.85` compression quality.
4. The compressed Blob is held in memory and previewed in the UI.



### 5.2 Bucket Management Flows

* **Bucket Creation:**
1. User triggers "New Bucket".
2. The UI requires selecting a location from an enforced Location Chooser dropdown. The submit button is disabled until a valid `location_id` is selected.
3. On submit, the server generates the 4-character ID (e.g., `KGCT`).
4. The UI displays the assigned code prominently: **`KGCT`**, directing the user to write the code on the physical container and place it in the designated location.


* **Bucket Relocation:**
1. User selects a bucket or enters its 4-character ID.
2. UI displays current location and part count.
3. User selects "Move Bucket" and chooses a new destination from the Location Chooser.
4. Submitting updates the bucket's `location_id`. All parts inside automatically inherit the new location on future searches.



### 5.3 Enforced Intake Flow

1. **Bucket Context:** User selects or locks the active bucket ID (persisted in client session state to enable rapid sequential entry). Current location is shown as non-editable confirmation.
2. **Mandatory Photo Capture:** User taps camera button to capture the physical item.
3. **Validation Barrier:** The "Save Part" button remains disabled until all of the following conditions are met:
* Compressed photo blob is present in memory.
* `name` string contains $\ge 2$ characters.
* `description` string contains $\ge 3$ characters.
* `quantity` is an integer $\ge 1$.
* `bucket_id` is selected.


4. **Tag Assignment:** User can type custom tags or tap from a horizontal list of previously used tag chips (e.g., `paint related`, `low value`, `charlie`).
5. **Submission:** Sends a single `multipart/form-data` request. On success, the UI clears `name`, `description`, photo preview, and tags, but retains the active `bucket_id` so the user can immediately photograph the next part.

### 5.4 Search, Filter, and In-Place Part Editing

* **Multi-Criteria Search:**
* Real-time text search querying `parts.name` and `parts.description`.
* Filter chips for active tags; selecting multiple tags performs an intersection filter (AND match).
* Filter dropdown for specific Bucket IDs or Locations.


* **Result Cards:**
* Displays thumbnail, part name, short description, quantity, 4-character Bucket Badge (`KGCT`), Location Badge, and Tag Chips.


* **Quick Consumption:** A single-tap "Take 1" button calls `/api/parts/:id/decrement` and updates quantity locally without a full page reload.
* **Edit Part Modal:**
* Accessible from any search result card.
* Allows editing `name`, `description`, `quantity`, and target `bucket_id`.
* Provides an interactive tag manager allowing users to remove existing tag chips or add new tags to the item.
* Updates persist via `PATCH /api/parts/:id`.



---

## 6. Verification & Acceptance Criteria

1. **Bucket ID Uniqueness:** Creating 1,000 mock buckets consecutively produces valid 4-character codes using only the allowed Base32 character set, with zero primary key collisions surviving the retry mechanism.
2. **Location Enforcement:** The API rejects `POST /api/buckets` and `PATCH /api/buckets/:id/location` requests that supply missing or non-existent `location_id` values with an HTTP 400 status code.
3. **Intake Integrity:** The frontend intake form cannot be submitted when the photo, name, or description fields are empty. The backend independently validates and rejects incomplete multipart requests.
4. **Client Image Downsampling:** Android uploads originating from high-resolution sensors (e.g., 12MP to 50MP) are resized on canvas to $\le 1600\text{px}$ before transmission, resulting in uploaded payload sizes consistently under 600 KB.
5. **Tag Filtering Accuracy:** Searching with multiple tags (e.g., `tag=charlie` AND `tag=remove`) returns only parts associated with both tags.
6. **Multi-User State Propagation:** Updating a part's quantity or moving a bucket's location on Device A reflects immediately when Device B executes a search or refreshes its view.