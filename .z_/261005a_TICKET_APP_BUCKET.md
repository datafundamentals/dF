# Product & Technical Requirements Document: Bucket-Based Parts Locator

## 0. PRE-REQUIREMENTS

### Decisions confirmed for this ticket

- **Code placement:** The browser application belongs under `apps/`, following the monorepo's app structure. Reusable canonical types and signals/state belong in `packages/types/` and `packages/state/` when applicable. The deployable Cloudflare API Worker belongs under `services/workers/`, alongside the existing Cloudflare auth Worker; it is server code, not a reusable package or a tool.
- **Authorization:** This application is for exactly two users: `pete.carapetyan@gmail.com` and `jeffcarapetyan11@gmail.com`. Use a Cloudflare Access allowlist and matching API Worker allowlist for these identities. Do not make the app publicly available to every authenticated Cloudflare Access user. `sahar.ayazian@gmail.com` is permitted only as a local Wrangler simulated identity, never in the production allowlist.
- **External host and backend origin:** The consuming Eleventy site is `https://btrg.org`; the page is `/demo/cloudflare/df-bucket-locator/`; static bundle assets are copied under `/static/wc/df-bucket-locator/`. Production browser requests and Access flows use the same origin, `https://btrg.org`.
- **Embedded authentication architecture:** Keep the app embedded directly in the Eleventy page/MPA iframe. Do not silently replace it with an app hosted on a separate backend hostname. Attach the Cloudflare API Worker to `btrg.org/api/*` and the pioneer auth Worker to `btrg.org/cf-auth/_protected/*`; use Cloudflare Access protection and the two-user allowlist on these paths. This is a Cloudflare edge route arrangement, not application proxy code in Eleventy. Same-origin requests avoid CORS and third-party-cookie dependencies, and preserve same-origin return validation and popup messaging.
- **Backend address configuration:** Centralize backend origin/path configuration in the public runtime setting `window.__DF_BUCKET_LOCATOR_CONFIG__.backendOrigin`. Local development sets this to `window.location.origin`, using Vite's local Worker proxies. The validated production profile's `siteOrigin` is compiled into the Rollup bundle, which initializes the runtime setting before registering the auth wrapper. Both inventory API calls and shared pioneer auth session/login/logout calls resolve through the same origin helper. Do not duplicate the origin in MPA HTML, scatter endpoint URLs, rely on Vite proxies in production, or include secrets/privileged credentials in browser configuration.
- **Shared backend default:** All consuming-site deployments use one shared production D1/R2 inventory by default. Moving the static app from `btrg.org` to another approved domain changes the public frontend origin and requires routes/Access setup on that domain, but preserves the same D1 database, R2 bucket, inventory, users, and data. Separate databases/storage are an explicit future choice, not an automatic consequence of publishing another site.
- **Configuration separation:** `services/workers/df-bucket-locator/deployment/production.json` is the versioned source of truth for the public site origin, same-origin Worker route paths, approved-user allowlist, local-only simulated identity, Worker names, and shared backend resource names/IDs. Public browser configuration (origin and paths only) may be compiled into the release or set before its bundle loads. Worker bindings, Access policies, and secrets remain server/deployment configuration and must never be copied into browser output. A domain change must update and validate the complete deployment set, not just replace a string in an already-built bundle.
- **Part lifecycle:** This is a practical locator for unwanted stored parts, not an inventory-control system. When a part's quantity reaches zero, remove it from the active application and delete its database record; it must no longer appear in searches.
- **Images:** Practicality and expedient implementation take priority over image fidelity. Keep client-side resizing/compression simple and reliable. The 1600 px maximum edge and 600 KB target are practical goals, not reasons to block intake or build elaborate compression machinery; reduce quality as needed when there is a conflict.
- **Unresolved engineering decisions:** Surface remaining security and deployment questions as they arise, explain the risk and a recommended option, and resolve decisions that affect production security before deployment. The target origin is `https://btrg.org`; do not assume its Cloudflare zone, Access policies, routes, D1 database, or R2 bucket are already provisioned.

This ticket requires the coding agent to reconcile three unresolved sets of work which are not complete and thus have not been reconciled, even before beginning the work outlined in this ticket. This reconciliation process should not be impossible, mathematically - but it may create some contradictory instructions. This section of the document shall attempt to outline how to resolve them, when that is possible - by unwinding the history of this repository.

a). The beginnings of this repository left a large set of "guides" for specific use cases as markdowns within `/guides/`. These were written sequentially and may contradict each other, but largely reflect the intent of this repository, most specifically how to keep out some standard vibe-coding practices from polluting the intent of this repository. The short recap is that this repository is intended to provide one standard approach to doing everything, and this approach is followed through the creation of each thing placed in the repository. This intent has not been followed perfectly, but in most respects it has been successful. This compliance is more true where it is more important, in the `/apps` and `/packages` where it is most important. `/tools` is kind of a free-for-all but since these are not considered reusable components more latitude is given, there. 

b). In recent weeks, a decision was made to migrate from Firebase as a back end, to Cloudflare as a back end. Yet, no previously written code was changed, yet. Neither were any of the guides, docs, or other references. Only `df-standard-pioneer-auth-wrapper` was created to this new standard, and even that was never code reviewed. So whereas you are required to follow this new `cloudflare as a back end` requirement, you will be constantly told in the docs to use firebase. This seems like a guarantee for disaster, but I am hoping you can stick to the new requirement for this project. For example you would still use signal in the state store and lit web components in the PWA but not firebase storage or functions or persistence.

c). There are still many holes left in the usage, such as example code for first usage of cloudflare for file storage. So you will be required to infer some generalized or implicit intent from some of the guides as far as hygiene and the like, but apply it to new stacks. Please do what you can to establish one very clean and maintainable approach for all coding within all new stack usages.

d). There is a mostly untested `df-standard-pioneer-auth-wrapper` authentication element which shall be required on the first deployment of this first new app within this monorepo which is migrating to cloudflare from firebase. Therefore you will be required to consume the cookie created by this element, in order to provide authorization for back end operations required by this first new cloudflare app. Like c) above, this requires you to blaze a new trail in terms of setting clean and maintainable standards, where possible, for this new security functionality within the state store and web component structures.

e). There may be confusion caused by conflicts between requirements as noted above. There should be absolutely zero confusion about git adds, commits, merges, and pushes. You are strictly forbidden to use these operations - because that is how i do code reviews - via git diffs. Do not ask, suggest, or otherwise prompt for permissions to execute such git operations.

## 1. System Overview & Objective

The Bucket-Based Parts Locator is a mobile-first web application for cataloging and finding loose physical parts stored across physical buckets. It is for locating otherwise unwanted stored items, not for formal inventory control.

Physical buckets are placed in defined storage locations and identified by randomly generated 4-character uppercase alphanumeric codes (e.g., `KGCT`). Users photograph each part at intake, input structured metadata and flexible tags, and store records in a Cloudflare backend. Users can search for parts by keyword, bucket, or tags to identify which bucket contains an item and where that bucket is physically located. A part is removed when its quantity reaches zero.

---

## 2. Infrastructure & Architectural Boundaries

```
+---------------------------------------------------------------------------------+
| Client Tier: Mobile-First Progressive Web App (Android / Desktop)               |
| - Standard HTML5 Camera Hardware Capture (`capture="environment"`)              |
| - Practical client-side Canvas Image Resizing & JPEG Compression               |
| - Same-origin Cloudflare Access session on `https://btrg.org`                   |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
| Compute Tier: Cloudflare Workers (Edge API Runtime)                             |
| - Exposes the API and enforces the two-user Cloudflare Access allowlist         |
| - API route: `btrg.org/api/*`; auth route: `btrg.org/cf-auth/_protected/*`       |
| - Manages multi-statement atomic transactions via D1 Batch API                  |
| - Directly streams binary image blobs to R2 Object Storage                      |
| - Workers attach to Cloudflare routes; Eleventy does not proxy or run backend code |
+-----------------------------------+--------------------+------------------------+
                                    |                    |
                                    v                    v
+---------------------------------------+   +-------------------------------------+
| Database Tier: Cloudflare D1 (SQLite)  |   | Object Storage: Cloudflare R2       |
| - Relational entities & M:N tag joins |   | - Optimized part image files        |
| - Shared database state                 |   | - Content-hashed keys (`parts/*.jpg`)|
| - Fresh reads on next search/refresh    |  +-------------------------------------+
+---------------------------------------+

```

### Core System Constraints

1. **Multi-User Consistency:** Database writes must route through a central, shared database engine (Cloudflare D1) so quantity changes, relocations, or new entries are visible when another device next searches or refreshes. Live push updates are not required.
2. **Android Capture & Storage Handling:** Android devices route camera capture via native mechanisms. Photos must be intercepted in-memory by the browser as raw Blobs, downsampled client-side to conserve mobile bandwidth, and uploaded directly to Cloudflare R2.
3. **Authentication and authorization:** The production UI, API, auth/session endpoints, and logout must use the `https://btrg.org` origin. Configure Cloudflare Access on the API and protected auth routes for only the two configured identities. The auth session check, sign-in redirect/callback, and logout must work from the embedded page and return safely to its original `btrg.org` page URL. Preserve strict same-origin popup `postMessage` validation. Every API request must be authenticated and rejected unless it satisfies the allowlist. Use only identity supplied by the trusted Access boundary for audit attribution and “My buckets only”; never trust a client-provided identity header or owner parameter.
4. **No cross-origin cookie dependency:** The chosen design must not require a third-party `CF_Authorization` cookie. Keeping the browser page and Worker routes on the same origin is a production requirement, not an optional optimization. Do not replace it with a different-origin backend/iframe architecture without first documenting the cookie/CORS implications and obtaining the owner's approval.
5. **Synchronous Intake Guard:** The intake UI must block record creation until a valid photo blob has been captured and all mandatory text fields are filled.

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
| `PATCH` | `/api/locations/:id` | Update location name and description | `{ name?: string, description?: string }` | `{ success: true, id: string, name: string }` |
| `DELETE` | `/api/locations/:id` | Delete an empty location | None | `{ success: true, deleted: true }`; `409` if it still contains buckets |
| `GET` | `/api/buckets` | List all buckets | None | `[ { id, location_id, location_name, part_count } ]` |
| `POST` | `/api/buckets` | Initialize bucket (generates 4-char ID) | `{ location_id: string, description?: string }` | `{ success: true, bucket_id: string, location_name: string }` |
| `PATCH` | `/api/buckets/:id` | Update bucket location and description | `{ location_id?: string, description?: string }` | `{ success: true, bucket_id: string, new_location: string }` |
| `PATCH` | `/api/buckets/:id/location` | Move physical bucket to new location | `{ location_id: string }` | `{ success: true, bucket_id: string, new_location: string }` |
| `DELETE` | `/api/buckets/:id` | Delete an empty bucket | None | `{ success: true, deleted: true }`; `409` if it still contains parts |
| `GET` | `/api/tags` | List all tags with usage counts | None | `[ { id: string, label: string, count: number } ]` |
| `POST` | `/api/tags` | Create a reusable tag | `{ label: string }` | `{ success: true, id: string, label: string }` |
| `PATCH` | `/api/tags/:id` | Rename a tag on all associated parts | `{ label: string }` | `{ success: true, id: string, label: string }` |
| `DELETE` | `/api/tags/:id` | Remove a tag and its part associations | None | `{ success: true, deleted: true }` |
| `GET` | `/api/parts` | Search parts by text, bucket, location, tags, or current user's buckets | Query params: `?q=&bucket_id=&location_id=&tag=&my_buckets=true` | `[ { id, name, description, quantity, bucket_id, location_name, tags: string[], photo_url } ]` |
| `POST` | `/api/parts/intake` | Multipart intake (photo + metadata + tags) | `multipart/form-data`: `file`, `bucket_id`, `name`, `description`, `quantity`, `tags` (JSON array) | `{ success: true, part_id: string }` |
| `PATCH` | `/api/parts/:id` | Update part metadata, bucket, or tags; delete the part if quantity is set to zero | `{ name?: string, description?: string, quantity?: number, bucket_id?: string, tags?: string[] }` | `{ success: true, part_id?: string, deleted?: boolean }` |
| `DELETE` | `/api/parts/:id` | Permanently delete a part and queue its photo for cleanup | None | `{ success: true, deleted: true }` |
| `POST` | `/api/parts/:id/decrement` | Decrement part quantity by count; delete the part when quantity reaches zero | `{ count: number }` | `{ success: true, remaining: number, deleted: boolean }` |
| `GET` | `/api/photos/:key` | Retrieve photo file stream from R2 | None | Binary image (`image/jpeg`) |

Whenever a part's resulting quantity reaches zero, whether through decrement or metadata editing, record the action in `inventory_logs`, delete the part row (and its `part_tags` through the foreign-key cascade), and remove its R2 photo object. Because D1 and R2 do not share an atomic transaction, choose and document a practical failure-handling strategy for photo cleanup so failed object deletion does not silently leave untracked storage indefinitely.

### CRUD and recovery expectations

- Locations, buckets, tags, and parts must each have usable create/read/update/delete operations in the application, not only API support. The audit log is intentionally append-only and read-only.
- Location deletion is allowed only when it contains no buckets. Bucket deletion is allowed only when it contains no parts. Return a clear conflict response and explain the dependency when deletion is blocked; do not cascade-delete child records.
- Direct part deletion is available independently of setting quantity to zero. It deletes the part and tag associations, records the audit event, and queues the R2 photo for cleanup.
- Tag rename updates the shared tag label without changing its ID or losing associations. Tag deletion removes only that tag and its associations; it does not delete parts.
- Editing and deleting existing locations, buckets, tags, and parts must be available from the management or all-parts views so intake mistakes can be corrected without database access.

---

## 5. Client Requirements & User Workflows

### 5.1 Image Capture & Optimization Pipeline

* The client must use `<input type="file" accept="image/*" capture="environment">` to invoke the native rear camera on Android and mobile devices.
* Upon image selection:
1. The raw file is rendered into an offscreen HTML Canvas.
2. Canvas calculates scaled dimensions maintaining aspect ratio, capped at a maximum of `1600px` on the longest edge.
3. The canvas is exported as a JPEG Blob using a straightforward quality setting. Image fidelity is low priority; reduce quality as needed to produce a practical upload without adding elaborate compression logic.
4. The compressed Blob is held in memory and previewed in the UI. A 600 KB upload size is a target when practical, not a hard barrier to saving a part.



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
* Optional **My buckets only** toggle limits results to buckets created by the currently authenticated user. The API derives the user from Cloudflare Access and does not accept a client-supplied owner identity.


* **All-Parts Table:**
* With no search terms or filters, show every part in a vertically scrolling table; do not silently cap the result set.
* Sort rows ascending by creator/user, location name, bucket code, then part name, with a stable ID tie-breaker.
* Display creator, location, bucket code, part name and description, quantity, tags, photo thumbnail, and edit/quick-removal actions.
* Keep the table as the default results view. A card view may remain available as an alternate presentation.


* **Result Cards:**
* Displays thumbnail, part name, short description, quantity, 4-character Bucket Badge (`KGCT`), Location Badge, and Tag Chips.


* **Quick Removal:** A single-tap "Take 1" button calls `/api/parts/:id/decrement` and updates the result locally without a full page reload. When the resulting quantity is zero, remove the part from search results because the backend deletes it.
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
4. **Practical Client Image Downsampling:** Android uploads from high-resolution sensors are resized on canvas to a longest edge of at most 1600 px before transmission. The implementation favors a simple, reliable upload and targets payloads under 600 KB where practical; image fidelity is secondary, and the size target must not block intake.
5. **Tag Filtering Accuracy:** Searching with multiple tags (e.g., `tag=charlie` AND `tag=remove`) returns only parts associated with both tags.
6. **Multi-User State Propagation:** Updating a part's quantity or moving a bucket's location on Device A is reflected when Device B next executes a search or refreshes its view; live push updates are not required.
7. **Two-User Access Control:** Requests from either allowlisted user can use the app and API; unauthenticated requests and authenticated identities outside the allowlist are rejected by the Cloudflare Access boundary.
8. **Delete at Zero:** Any operation that would leave a part at zero quantity, including decrement and metadata editing, removes it from subsequent searches, deletes its D1 record and tag associations, and initiates cleanup of its R2 photo object.
9. **Complete Parts Index:** An unfiltered search returns every stored part, including its creator identity, and the default table presents the full result set sorted by creator, location, bucket, and part name without a silent result limit.
10. **Entity CRUD and Recovery:** The app supports create/read/update/delete for locations, buckets, tags, and parts. It blocks deletion of non-empty locations/buckets without deleting children, allows direct part deletion with photo cleanup, and keeps audit history append-only.
11. **Current User Bucket Filter:** Enabling **My buckets only** limits part results to buckets whose `created_by` matches the authenticated Cloudflare Access identity; the client cannot select or impersonate another user.
12. **External MPA Release:** `pnpm bundle:release df-bucket-locator` creates the stable Rollup release bundle and manifest, and `pnpm deploy:copy-bundle df-bucket-locator <target>` accepts it and creates the standard Eleventy MPA layout.
13. **Public-Site Runtime:** From `https://btrg.org/demo/cloudflare/df-bucket-locator/`, the exported bundle uses its explicit production backend origin and requires no Vite proxy or Eleventy application proxy. Session check, sign-in/return, API CRUD, photos, and logout use Cloudflare routes on the same origin.
14. **Production Auth/Backend Verification:** Verify sign-out/sign-in, safe return to the consuming page, authenticated inventory reads/writes, photo upload/read, logout, and rejection of an identity outside the allowlist from the actual `btrg.org` origin. Local Wrangler simulated identity does not satisfy this criterion.
15. **Release Configuration Validation:** Before bundling, validate required public origin and route settings; require HTTPS and reject localhost, malformed origins, cross-origin backend settings, and disagreement between the site origin and Worker route hostname. Reject placeholder/missing production D1/R2 bindings and malformed/empty approved-user lists before deployment. Verify generated browser output contains only approved public config and no Worker secrets or privileged credentials.
16. **Domain Migration with Shared Data:** A deployment to another approved domain (for example `foo.com`) can be built from a new deployment configuration set, uses same-origin routes and Access on that domain, and retains the configured shared D1 database/R2 bucket. Existing inventory remains visible; the domain change does not create or silently select a separate database or bucket.

## 7. Security and Deployment Requirements

The public Eleventy site remains static. Cloudflare Workers supply the backend through routes on the same `btrg.org` origin; do not add backend code or an application proxy to Eleventy.

- Attach the inventory Worker to `btrg.org/api/*` and the pioneer auth Worker to `btrg.org/cf-auth/_protected/*`. Keep `/cdn-cgi/access/logout` on the same origin and handled by Cloudflare Access.
- Configure Cloudflare Access to admit only `pete.carapetyan@gmail.com` and `jeffcarapetyan11@gmail.com` for the protected Worker paths. Keep the API Worker allowlist in sync. Do not use browser-supplied identity for authorization.
- Production release config contains only the public backend origin `https://btrg.org`; no Cloudflare tokens, signing secrets, or privileged credentials may enter the bundle.
- The exported MPA inner page includes the existing wrapper/app markup and module script. The validated Rollup bundle initializes the runtime config before registering the custom elements; do not hardcode the origin a second time in HTML:
    ```html
    <df-standard-pioneer-auth-wrapper headless>
        <bucket-locator-app></bucket-locator-app>
    </df-standard-pioneer-auth-wrapper>
    <script type="module" src="./df-bucket-locator.js"></script>
    ```
- Provide one documented, versioned deployment configuration source for both bundle generation and Worker deployment. Validate its schema before either operation. Keep public browser values (site/backend origin and endpoint paths) distinct from Cloudflare-only values (zone, routes, Access policy, D1/R2 bindings, and secrets).
- The production profile path is `services/workers/df-bucket-locator/deployment/production.json`. `pnpm validate:bucket-locator-profile` validates its local schema; `pnpm --filter @df/bucket-locator-worker preflight` performs read-only checks against the configured Wrangler account for account ID, shared D1 UUID/name, and shared R2 bucket. Local and production Wrangler configs are generated from this profile, not maintained as separate hard-coded copies.
- Production Worker deployment must require successful resource preflight, an explicit Access-policy confirmation, and an explicit remote-migration confirmation. Local `dev` and local migrations use a generated local-only config with the simulated identity and must never alter the production profile or allowlist.
- For the default shared-backend topology, changing the consuming domain updates the public origin, Worker route hostnames, and Access applications/policies while retaining the existing D1 database and R2 bucket bindings. Any request to provision isolated data storage requires explicit owner approval.
- Domain/config validation can verify file values and generated output locally. Cloudflare account state (zone activation/proxy, Access policy actually deployed, Worker route attachment, D1/R2 resource existence/bindings, and production browser cookie behavior) must be verified against the actual account/environment before claiming deployment success; do not imply a local build can validate dashboard state.
- The local Vite entry sets `backendOrigin` to its own origin so existing `/api`, `/cf-auth`, and `/cdn-cgi` Vite proxies continue to work.
- Local development uses the existing local Worker proxies and Wrangler `access.dev` identity. Local simulated identity configuration must not replace or weaken the production allowlist.
- Production provisioning requires the `btrg.org` zone to be active/proxied through Cloudflare, production Worker routes, Cloudflare Access applications/policies, a real D1 database with migrations applied, and a real R2 bucket binding. Replace placeholder IDs/names before deployment.
- Verify in a real browser from the external `btrg.org` page. If the same-origin Worker routes or Access session cannot be configured as specified, stop and report the exact limitation and an alternative for owner approval; do not silently switch to cross-origin API cookies or a backend-hosted iframe.