# Firebase Seed Data

**Version:** 1.0.0  
**Last Updated:** 2025-10-12  
**Purpose:** Provide comprehensive, pedagogically-sound seed data for Firebase Emulator development

## Philosophy

This seed data foundation embodies several key teaching principles:

### 1. **Emulator-First Development**
- All seed data is designed for offline development using Firebase Emulators
- Zero cloud dependencies required during development
- Complete feature testing without production Firebase project
- Safe experimentation without cost or quota concerns

### 2. **Pedagogically Neutral Domain**
Seed data uses familiar but not distracting domains:
- **Flowers** - Natural world, universally understood
- **Continents** - Geography, factual and stable
- **Chemical Elements** - Scientific, precise terminology
- **Musical Instruments** - Cultural but non-controversial

These domains strike a balance between:
- ❌ Too abstract (foo, bar, baz) - hard to relate to
- ❌ Too specific (todos, users) - implies business logic
- ✅ **Just right** - recognizable, non-distracting, teachable

### 3. **Comprehensive Coverage**
Seed data demonstrates:
- Authentication with diverse user states
- Firestore CRUD operations across multiple collections
- Storage uploads for various file types
- Relationships and edge cases
- Real-world data patterns

### 4. **Idempotent Design**
The seed script can run multiple times safely:
- Checks for existing data before creating
- Updates existing documents with merge strategy
- Skips duplicate authentication users
- Safe to run after partial failures

### 5. **Teaching Over Production**
This is NOT production-ready data:
- Simple, clear patterns over optimization
- Readable over clever
- Educational over performant
- All users share same password (never do this in production!)

## Directory Structure

```
scripts/seed-data/
├── README.md                    # This file
├── seed.ts                      # Main seeding script
├── auth-users.json              # 10 test users with diverse states
├── firestore-collections/       # Firestore collection seed data
│   ├── flowers.json             # 12 flower documents
│   ├── continents.json          # 7 continent documents
│   ├── chemicalElements.json    # 13 chemical element documents
│   ├── musicalInstruments.json  # 12 musical instrument documents
│   └── todos.json               # 12 teaching todo documents
└── storage-files/               # Files for Storage upload testing
    ├── README.md                # Storage files documentation
    ├── images/                  # Sample images (3-5 files)
    ├── documents/               # Sample PDFs/docs (2-3 files)
    └── avatars/                 # User avatar images (10 files)
```

## Seed Data Contents

### Authentication Users (`auth-users.json`)

**Count:** 10 users  
**Email pattern:** `firstname.lastname@example.com`  
**Password:** `password123` (all users - teaching only!)  
**States:**
- ✓ Verified emails (7 users)
- ✗ Unverified emails (3 users)
- All have display names
- All reference avatar photos in Storage

**Users:**
1. Alice Anderson - alice.anderson@example.com (verified)
2. Bob Builder - bob.builder@example.com (verified)
3. Carol Chen - carol.chen@example.com (unverified)
4. David Davis - david.davis@example.com (verified)
5. Emma Evans - emma.evans@example.com (unverified)
6. Frank Fisher - frank.fisher@example.com (verified)
7. Grace Garcia - grace.garcia@example.com (verified)
8. Henry Harris - henry.harris@example.com (unverified)
9. Iris Ikeda - iris.ikeda@example.com (verified)
10. Jack Johnson - jack.johnson@example.com (verified)

**Note on Roles:** This seed data intentionally does NOT include user roles or permissions. Role-based access control (RBAC) is a complex topic that deserves its own dedicated roadmap and tickets. For teaching purposes, all users have equal access. See Ticket 5 roadmap notes for future RBAC implementation.

### Firestore Collections

#### `flowers` Collection
**Count:** 12 documents  
**Fields:**
- `id` (string) - Document ID
- `commonName` (string) - Common English name
- `latinName` (string) - Scientific name
- `family` (string) - Taxonomic family
- `color` (string) - Primary color
- `nativeTo` (array) - Geographic origins
- `bloomingSeason` (string) - When it blooms
- `sunRequirement` (string) - Light needs

**Teaching use cases:**
- Simple CRUD operations
- String and array fields
- Query by single field (color, family)
- Filtering and sorting

#### `continents` Collection
**Count:** 7 documents  
**Fields:**
- `id` (string) - Document ID (kebab-case)
- `name` (string) - Continent name
- `area_sq_km` (number) - Area in square kilometers
- `population` (number) - Population estimate
- `countries` (number) - Number of countries
- `largestCity` (string) - Most populous city
- `highestPoint` (string) - Highest elevation point

**Teaching use cases:**
- Numeric queries and ranges
- Sorting by numbers
- Limited dataset (only 7 items)
- Demonstrates complete dataset listing

#### `chemicalElements` Collection
**Count:** 13 documents  
**Fields:**
- `id` (string) - Document ID (lowercase name)
- `name` (string) - Element name
- `symbol` (string) - Chemical symbol
- `atomicNumber` (number) - Atomic number
- `atomicMass` (number) - Atomic mass
- `group` (string) - Element group
- `period` (number) - Period in periodic table
- `state` (string) - State at room temperature

**Teaching use cases:**
- Compound queries (group AND period)
- Numeric sorting (by atomic number)
- Unique identifiers (symbol)
- Scientific data patterns

#### `musicalInstruments` Collection
**Count:** 12 documents  
**Fields:**
- `id` (string) - Document ID (kebab-case)
- `name` (string) - Instrument name
- `family` (string) - Instrument family
- `origin` (string) - Country of origin
- `isAcoustic` (boolean) - Acoustic vs electronic
- `yearInvented` (number) - Year invented (negative for BCE)
- `typicalRange` (string) - Musical range

**Teaching use cases:**
- Boolean field queries
- Historical data (negative years)
- Categorical grouping (by family)
- String contains/search patterns

#### `todos` Collection
**Count:** 12 documents  
**Fields:**
- `id` (string) - Document ID (kebab-case)
- `title` (string) - Task title (teaching scenario)
- `titleLower` (string) - Lowercase title for query range searches
- `description` (string) - Detailed task description
- `completed` (boolean) - Completion status
- `priority` (string) - `'low' | 'medium' | 'high'`
- `tags` (array) - Helpful categorisation keywords
- `createdAt` (timestamp) - Creation time
- `updatedAt` (timestamp) - Last update time
- `dueDate` (timestamp|null) - Optional due date

**Teaching use cases:**
- Demonstrates CRUD mutations with realistic fields
- Query filters (`completed`, `priority`, `tags`)
- Pagination against time-sorted data
- Offline writes retained via IndexedDB persistence
- Real-time listeners reacting to collaborative edits

### Storage Files

#### Images Directory
**Path:** `storage-files/images/`  
**Purpose:** General image upload testing  
**Recommended files:** 3-5 images  
**Types:** JPG, PNG, WebP  
**Use cases:**
- Image upload/download
- Progress tracking
- Preview generation
- File size validation

#### Documents Directory
**Path:** `storage-files/documents/`  
**Purpose:** Document storage testing  
**Recommended files:** 2-3 documents  
**Types:** PDF, CSV, TXT  
**Use cases:**
- Non-image file uploads
- MIME type handling
- Download links
- File metadata

#### Avatars Directory
**Path:** `storage-files/avatars/`  
**Purpose:** User avatar images  
**Recommended files:** 10 avatars (one per user)  
**Naming:** `{firstname}.jpg` (e.g., `alice.jpg`)  
**Use cases:**
- User profile integration
- Auth + Storage relationship
- Thumbnail generation
- Profile photo updates

**Current Status:** Placeholder `.gitkeep` files exist. See `storage-files/README.md` for instructions on adding actual binary files.

## Usage

### Prerequisites

1. **Firebase Emulators running:**
   ```bash
   pnpm --filter @df/df-firebase-teaching-app emulators:start
   ```

2. **Dependencies installed:**
   ```bash
   pnpm install
   ```

### Seeding Commands

#### Initial Seed
Populate emulators with seed data:
```bash
pnpm --filter @df/df-firebase-teaching-app seed
```

**What it does:**
- Creates 10 authentication users
- Populates 4 Firestore collections (44 total documents)
- Uploads Storage files (when available)
- Skips existing data (idempotent)

#### Reset and Reseed
Clear all data and repopulate:
```bash
pnpm --filter @df/df-firebase-teaching-app seed:reset
```

**What it does:**
1. Clears `emulator-data/` directory
2. Runs seed script from scratch
3. Creates fresh, clean state

#### View Seeded Data
Open the Firebase Emulator UI:
```bash
open http://127.0.0.1:5400
```

Navigate to:
- **Authentication** - View created users
- **Firestore** - Browse collections
- **Storage** - See uploaded files

### Export Seed Data
Save current emulator state for sharing:
```bash
pnpm --filter @df/df-firebase-teaching-app emulators:export
```

This exports to `emulator-data/` for version control.

## How the Seed Script Works

### Technology Stack
- **TypeScript** - Type-safe scripting
- **Firebase Client SDK** - Teaching client-side patterns (not Admin SDK)
- **tsx** - Run TypeScript directly without compilation
- **Node.js file system APIs** - Read JSON and binary files

### Safety Features

#### 1. Emulator-Only Check
```typescript
function isUsingEmulators(): boolean {
  return firebaseConfig.projectId.startsWith('demo-');
}
```
- Prevents accidental production runs
- Fails fast with clear error message
- No cloud dependencies

#### 2. Idempotent Design
```typescript
// Auth: Catches 'email-already-in-use' error
// Firestore: Uses setDoc with merge: true
// Storage: Overwrites existing files
```
- Safe to run multiple times
- Handles partial failures gracefully
- Clear console output of created vs skipped

#### 3. Error Handling
```typescript
try {
  // Seed operation
} catch (error) {
  console.error('Detailed error message');
  // Continue with next item
}
```
- Individual failures don't stop entire process
- Detailed error logging
- Summary statistics at end

### Implementation Details

**Authentication:**
- Uses `createUserWithEmailAndPassword()` from Client SDK
- Updates profile with `updateProfile()`
- References Storage avatars (if available)

**Firestore:**
- Reads JSON files with typed interfaces
- Uses document ID from JSON for consistency
- Merges data to allow updates

**Storage:**
- Scans directories for files
- Uploads as binary buffers
- Preserves directory structure

## Versioning

### Current Version: 1.0.0

**Versioning Strategy:**
- **Major version** - Breaking changes to data structure or script API
- **Minor version** - New collections or significant additions
- **Patch version** - Small fixes or additional documents

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-12 | Initial release with 4 collections, 10 auth users |

### Schema Stability
While seed data may evolve, we maintain backward compatibility:
- ✅ Adding new fields to documents - **Compatible**
- ✅ Adding new documents to collections - **Compatible**
- ✅ Adding new collections - **Compatible**
- ⚠️ Changing field types - **Breaking change**
- ⚠️ Renaming fields - **Breaking change**
- ⚠️ Removing collections - **Breaking change**

## Adding New Seed Data

### Adding a New User
1. Edit `auth-users.json`
2. Add user object with required fields
3. Create corresponding avatar in `storage-files/avatars/`
4. Run `pnpm seed`

### Adding a New Collection
1. Create `firestore-collections/{collectionName}.json`
2. Add array of documents with `id` field
3. Update `seed.ts` collections array:
   ```typescript
   const collections = [
     // ...existing
     {name: 'newCollection', file: 'newCollection.json'},
   ];
   ```
4. Run `pnpm seed`

### Adding Storage Files
1. Place files in appropriate directory:
   - `storage-files/images/` for images
   - `storage-files/documents/` for documents
   - `storage-files/avatars/` for user avatars
2. Run `pnpm seed` (auto-discovers new files)

## Best Practices

### ✅ DO
- Keep seed data pedagogically neutral
- Maintain 10+ examples per collection
- Use consistent naming conventions
- Document any special relationships
- Version control all seed data files
- Test seed script after changes

### ❌ DON'T
- Include sensitive or production data
- Use complex business logic
- Create dependencies between collections (keep simple)
- Add too many documents (keep under 20 per collection for teaching)
- Use seed data passwords in production
- Commit large binary files (keep under 10MB total)

## Troubleshooting

### Seed script fails with "Cannot find module"
**Solution:** Install dependencies:
```bash
pnpm install
```

### "Not connected to Firebase emulators" error
**Solution:** Start emulators first:
```bash
pnpm --filter @df/df-firebase-teaching-app emulators:start
```

### Users created but not visible in Emulator UI
**Solution:** 
1. Refresh Emulator UI (http://127.0.0.1:5400)
2. Check Authentication tab
3. Verify emulators are running on correct ports

### Storage files not uploading
**Solution:**
1. Check that actual binary files exist (not just `.gitkeep`)
2. See `storage-files/README.md` for file requirements
3. Ensure files are not corrupted

### "Email already in use" errors (normal!)
**This is expected behavior.** The script is idempotent and skips existing users. If you see this message, it means:
- Seed script ran successfully before
- Users already exist in emulator
- This is not an error!

To start fresh:
```bash
pnpm --filter @df/df-firebase-teaching-app seed:reset
```

## Related Documentation

- [Firebase Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite)
- [Firebase Teaching App README](../../README.md)
- [Ticket 4 Acceptance Criteria](../../../.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md#ticket-4-seed-data-foundation)
- [Storage Files README](./storage-files/README.md)

## Future Enhancements

Potential additions for future versions:

1. **JSON Schema Validation** - Validate seed data files against schemas
2. **Seed Data Generator** - CLI tool to generate additional seed data
3. **Relationships Demo** - Cross-collection references (user → favorite flower)
4. **Pagination Examples** - Large collections to demonstrate pagination
5. **Edge Cases** - Empty strings, very long text, special characters
6. **Performance Testing** - Large dataset variants for performance testing

## Contributing

When adding or modifying seed data:

1. Update the appropriate JSON file
2. Update this README with documentation
3. Test the seed script end-to-end
4. Increment version number if appropriate
5. Document in commit message

---

**Questions?** See the [main app README](../../README.md) or open an issue.
