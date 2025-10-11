# Firebase Teaching App Roadmap

**Last Updated:** 2025-10-11
**Status:** Planning Complete - Ready for Implementation
**Target App:** `apps/df-firebase-teaching-app`

## Overview

This roadmap defines the creation of `/apps/df-firebase-teaching-app` - a pattern-setting teaching application for all Firebase-dependent apps in this monorepo. As a teaching app, it must demonstrate best practices with extreme meticulousness, as patterns established here will multiply throughout the monorepo.

### Objectives

1. **Establish Firebase patterns** that comply with all existing monorepo standards
2. **Provide clear examples** for humans and coding agents
3. **Enable emulator-first development** for 100% offline capability
4. **Document every decision** to prevent ambiguity
5. **Create reusable patterns** for Auth, Firestore, Storage, Functions, and Hosting

### Success Criteria

- ✅ Works 100% offline with Firebase emulators
- ✅ Complies with all `/coding_docs/` standards
- ✅ Follows signals-first state management patterns
- ✅ Includes comprehensive seed data for all services
- ✅ Has complete test coverage (unit + integration)
- ✅ Provides Storybook stories for all UI components
- ✅ Contains detailed documentation for every pattern

### Scope

**In Scope:**
- Firebase Authentication
- Cloud Firestore (CRUD operations)
- Cloud Storage
- Cloud Functions
- Firebase Hosting

**Out of Scope (this iteration):**
- Firebase Admin SDK
- Realtime Database
- Cloud Messaging
- Analytics
- Performance Monitoring

## Key Principles

Every ticket must deliver:

1. **Working code** that runs in emulator
2. **Tests** (unit + integration)
3. **Documentation** (inline and in README)
4. **Storybook stories** for UI components
5. **Standards compliance** verification

### Development Philosophy

- **Emulator-first**: All features work offline before any real Firebase integration
- **Seed data**: 10+ examples for every feature (users, records, files)
- **Teaching-focused**: Prefer clarity over cleverness
- **Pattern-setting**: Code here becomes the template for all Firebase apps
- **Minimal legacy code**: Build fresh teaching examples rather than port messy legacy code

### Ancilary Configuration Source

You will find a non-compliant version of Firebase project in `/OUT_OF_SCOPE/approach/` that can be mined for a Firebase project configuration to be used where needed on the following tickets.

## Ticket Breakdown

### Phase 1: Foundation & Infrastructure

#### Ticket 1: Project Setup & Emulator Configuration

**Objective:** Establish the app structure and configure Firebase Emulator Suite for 100% offline development.

**Acceptance Criteria:**
- [ ] Create `apps/df-firebase-teaching-app` following `@df/df-lit-starter` patterns
- [ ] Install Firebase CLI and emulator suite
- [ ] Configure `firebase.json` with all services:
  - Auth (port 9099)
  - Firestore (port 8080)
  - Storage (port 9199)
  - Functions (port 5001)
  - Hosting (port 5000)
  - Emulator UI (port 4000)
- [ ] Add npm scripts to `package.json`:
  - `emulators:start` - start all emulators
  - `emulators:export` - export seed data
  - `emulators:import` - import seed data
  - `emulators:clear` - clear all data
- [ ] Create `emulator-data/` directory for seed data persistence
- [ ] Document emulator startup/shutdown procedures in app-specific README (`apps/df-firebase-teaching-app/README.md`)
- [ ] Verify no port conflicts with other monorepo apps
- [ ] Add emulator connection detection (warn if not running)

**Dependencies:** None

**Key Decisions to Document:**
- Port allocation strategy
- When to export/import seed data
- How to reset emulator state between dev sessions

**Testing Requirements:**
- [ ] Emulators start successfully
- [ ] All services accessible at expected ports
- [ ] Data persists across emulator restarts (when using export/import)
- [ ] Clear script successfully wipes all data

**Documentation Needs:**
- App README section: "Setting Up Firebase Emulators"
- App README section: "Working with Seed Data"
- Troubleshooting guide for common emulator issues

---

#### Ticket 2: Secrets Management & Environment Configuration

**Objective:** Establish secure patterns for Firebase configuration and secrets management.

**Development Philosophy: Emulator-First with Optional Production**

This teaching app demonstrates **emulator-first development** (100% offline) while establishing patterns for eventual production deployment (demonstrated in Ticket 13).

**Two-Track Environment Strategy:**

**Track 1: Local Development (PRIMARY - Required for Tickets 1-12)**
- Uses Firebase Emulators exclusively
- No real Firebase project needed
- Dummy/placeholder config values are sufficient
- `VITE_USE_EMULATOR=true` is the key differentiator
- All development work (Tickets 1-12) completes offline

**Track 2: Production Deployment (OPTIONAL - Demonstrated in Ticket 13)**
- Requires real Firebase project (created in Firebase Console)
- Real apiKey, authDomain, projectId, etc.
- Used for production hosting, CI/CD, bundled deployments
- Separate ticket (13) demonstrates this pattern
- Not required to complete the teaching app implementation

**For Ticket 2 Implementation:**
- Focus on establishing the configuration architecture
- Create `.env.emulator` with dummy values (sufficient for Tickets 1-12)
- Create `.env.example` as template showing all required variables
- Create `.env.production.example` to document production pattern (values not required until Ticket 13)
- Document how `src/config/firebase.config.ts` switches between emulator and production modes
- The `peg-2035` project config from `OUT_OF_SCOPE/approach/` can be used as placeholder/example values

**Acceptance Criteria:**
- [ ] Create `.env.example` template with all required variables:
  ```
  # Firebase Project Configuration (placeholder values for emulator dev)
  VITE_FIREBASE_API_KEY=demo-api-key
  VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=demo-firebase-teaching-app
  VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
  VITE_FIREBASE_APP_ID=1:000000000000:web:abc123def456

  # Environment Mode
  VITE_USE_EMULATOR=true

  # Emulator UI (optional override)
  VITE_FIREBASE_EMULATOR_UI=http://127.0.0.1:5400
  ```
- [ ] Create `.env.emulator` (copy of `.env.example`, used for local development)
- [ ] Create `.env.production.example` template for future production use:
  ```
  # Firebase Project Configuration (REPLACE WITH REAL VALUES FROM FIREBASE CONSOLE)
  VITE_FIREBASE_API_KEY=your-real-api-key
  VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your-project-id
  VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
  VITE_FIREBASE_APP_ID=your-app-id

  # Environment Mode
  VITE_USE_EMULATOR=false
  ```
- [ ] Update `.gitignore` to exclude all `.env.*` except `.env.example` and `.env.production.example`
- [ ] Create `src/config/firebase.config.ts` that:
  - Reads configuration from environment variables
  - Validates required variables are present
  - Exports typed config object
  - Documents that placeholder values work fine for emulator mode
- [ ] Document environment variable naming conventions (VITE_ prefix requirement)
- [ ] Add graceful error messages if required env vars are missing

**Dependencies:** Ticket 1 (project structure must exist)

**Key Decisions to Document:**
- Why `VITE_` prefix for environment variables
- When to use emulator vs real Firebase
- How to switch between environments
- Where secrets should never be committed

**Testing Requirements:**
- [ ] App fails gracefully with clear error if required env vars missing
- [ ] Emulator mode works with minimal configuration
- [ ] Config switches correctly between environments

**Documentation Needs:**
- README section: "Environment Configuration"
- README section: "Switching Between Emulator and Live Firebase"
- Security best practices document

---

#### Ticket 3: Firebase Package Structure

**Objective:** Create shared Firebase utilities package for monorepo-wide reuse.

**Acceptance Criteria:**
- [ ] Create `packages/firebase/` following package standards
- [ ] Set up `package.json` with proper exports:
  ```json
  {
    "name": "@df/firebase",
    "exports": {
      ".": "./src/index.ts",
      "./auth": "./src/auth/index.ts",
      "./firestore": "./src/firestore/index.ts",
      "./storage": "./src/storage/index.ts",
      "./functions": "./src/functions/index.ts"
    }
  }
  ```
- [ ] Create `src/firebase-app.ts` - singleton Firebase initialization
- [ ] Create `src/emulator-detection.ts` - detect and connect to emulators
- [ ] Create type definitions in `packages/types/src/firebase.types.ts`:
  - `FirebaseConfig`
  - `EmulatorConfig`
  - `FirebaseUser`
- [ ] Document when code belongs in `/packages/firebase` vs app-specific
- [ ] Add to monorepo build pipeline

**Dependencies:** Ticket 2 (needs config structure)

**Key Decisions to Document:**
- Firebase app initialization patterns (singleton)
- When to use shared utilities vs app-specific code
- How to extend Firebase types
- Emulator connection strategy

**Testing Requirements:**
- [ ] Firebase initializes correctly with test config
- [ ] Emulator detection works
- [ ] Singleton pattern prevents multiple initializations
- [ ] Package exports resolve correctly

**Documentation Needs:**
- Package README explaining architecture
- API documentation for all exports
- Examples of common usage patterns

---

#### Ticket 4: Seed Data Foundation

**Objective:** Create comprehensive seed data for all Firebase services.

**Acceptance Criteria:**
- [ ] Create `scripts/seed-data/` directory structure:
  ```
  scripts/seed-data/
  ├── auth-users.json          # 10 fake users with different roles
  ├── firestore-collections/   # Sample documents for each collection
  │   ├── todos.json
  │   ├── users.json
  │   └── settings.json
  ├── storage-files/           # Sample files for upload testing
  │   ├── images/
  │   ├── documents/
  │   └── avatars/
  └── seed.ts                  # Script to populate emulators
  ```
- [ ] Create 10 diverse auth users:
  - Various roles (admin, user, guest)
  - Different authentication states
  - Mix of verified/unverified emails
- [ ] Create sample Firestore data:
  - At least 10 documents per collection
  - Demonstrate relationships between documents
  - Include edge cases (empty fields, long text, numbers, dates)
- [ ] Create sample Storage files:
  - Various file types (images, PDFs, text)
  - Different sizes
  - Organized folder structure
- [ ] Create `pnpm seed` script to populate emulators
- [ ] Create `pnpm seed:reset` to clear and repopulate
- [ ] Document seed data structure and conventions

**Dependencies:** Ticket 3 (needs Firebase utilities)

**Key Decisions to Document:**
- Seed data organization strategy
- How to add new seed data
- When to regenerate seed data
- Seed data version control

**Testing Requirements:**
- [ ] Seed script populates all services successfully
- [ ] Reset script clears and repopulates correctly
- [ ] Seed data is valid and well-formed
- [ ] All edge cases represented

**Documentation Needs:**
- README section: "Working with Seed Data"
- Seed data schema documentation
- Instructions for adding new seed data

---

### Phase 2: Core Firebase Services (Teaching Implementations)

#### Ticket 5: Authentication Pattern

**Objective:** Implement complete authentication flow following signals-first architecture.

**Acceptance Criteria:**
- [ ] Create `packages/state/src/stores/firebase-auth.store.ts`:
  - `authUser` signal (current user or null)
  - `authState` signal (`idle|loading|authenticated|unauthenticated|error`)
  - `signIn()` function (email/password)
  - `signOut()` function
  - `signUp()` function
  - `resetPassword()` function
  - `onAuthStateChanged()` listener
- [ ] Create UI components in `packages/ui-lit/src/firebase/`:
  - `<df-sign-in>` - email/password sign-in form
  - `<df-sign-up>` - registration form
  - `<df-sign-out>` - sign-out button
  - `<df-user-profile>` - display current user info
  - `<df-password-reset>` - password reset form
- [ ] Implement auth guard pattern for protected routes
- [ ] Add auth status indicator component
- [ ] Create Storybook stories for all auth components
- [ ] Write integration tests with emulated auth:
  - Sign up new user
  - Sign in existing user
  - Sign out
  - Password reset flow
  - Auth state persistence

**Dependencies:** Ticket 4 (needs seed users)

**Key Decisions to Document:**
- Why signals for auth state (vs context or other patterns)
- Auth guard implementation approach
- Error handling strategy
- Session persistence strategy

**Testing Requirements:**
- [ ] All auth flows work end-to-end in emulator
- [ ] Auth state updates correctly trigger UI updates
- [ ] Error states handled gracefully
- [ ] Auth persistence works across page reloads

**Documentation Needs:**
- README section: "Authentication Patterns"
- API documentation for auth store
- Component usage examples
- Common auth scenarios guide

---

#### Ticket 6: Firestore CRUD Pattern

**Objective:** Demonstrate complete CRUD operations with Firestore following async state patterns.

**Acceptance Criteria:**
- [ ] Create `packages/state/src/stores/firestore-base.store.ts`:
  - Generic base store for Firestore collections
  - State: `idle|loading|ready|error`
  - `load()` - fetch documents
  - `create()` - add document
  - `update()` - modify document
  - `delete()` - remove document
  - Real-time listener support
- [ ] Create example store: `todos.store.ts` extending base
- [ ] Create UI components:
  - `<df-firestore-list>` - display collection
  - `<df-firestore-item>` - display single document
  - `<df-firestore-form>` - create/edit form
  - `<df-firestore-delete>` - delete confirmation
- [ ] Implement pagination pattern
- [ ] Implement query/filter examples
- [ ] Add offline persistence configuration
- [ ] Demonstrate real-time listener updates
- [ ] Create Storybook stories
- [ ] Write integration tests:
  - Create document
  - Read documents
  - Update document
  - Delete document
  - Real-time updates
  - Pagination

**Dependencies:** Ticket 5 (auth needed for security rules)

**Key Decisions to Document:**
- Base store pattern rationale
- Real-time vs one-time reads
- Pagination strategy
- Offline persistence configuration
- Query pattern best practices

**Testing Requirements:**
- [ ] All CRUD operations work in emulator
- [ ] Real-time updates reflect in UI
- [ ] Pagination works correctly
- [ ] Offline mode functions properly

**Documentation Needs:**
- README section: "Firestore Patterns"
- Base store API documentation
- Creating new Firestore stores guide
- Query patterns cookbook

---

#### Ticket 7: Storage Pattern

**Objective:** Implement file upload/download patterns with progress tracking.

**Acceptance Criteria:**
- [ ] Create `packages/state/src/stores/storage.store.ts`:
  - `uploadFile()` with progress tracking
  - `downloadFile()`
  - `deleteFile()`
  - `listFiles()` in directory
  - `getDownloadURL()`
  - Upload state: `idle|uploading|complete|error`
  - `uploadProgress` signal (0-100)
- [ ] Create UI components:
  - `<df-file-upload>` - file picker with drag-drop
  - `<df-upload-progress>` - progress bar
  - `<df-file-list>` - display uploaded files
  - `<df-file-preview>` - preview images/documents
  - `<df-file-delete>` - delete confirmation
- [ ] Implement file validation (size, type)
- [ ] Demonstrate reference path patterns
- [ ] Add thumbnail generation example
- [ ] Create Storybook stories
- [ ] Write integration tests:
  - Upload file
  - Track upload progress
  - Download file
  - List files
  - Delete file

**Dependencies:** Ticket 5 (auth for security), Ticket 6 (may store metadata in Firestore)

**Key Decisions to Document:**
- File naming conventions
- Storage reference organization
- Progress tracking implementation
- File validation strategy
- Metadata storage approach

**Testing Requirements:**
- [ ] Files upload successfully to emulator
- [ ] Progress tracking updates correctly
- [ ] Files download with correct content
- [ ] File listing works
- [ ] Deletion works

**Documentation Needs:**
- README section: "Storage Patterns"
- Storage store API documentation
- File organization conventions
- Common storage scenarios guide

---

#### Ticket 8: Security Rules Foundation

**Objective:** Implement and test Firebase security rules.

**Acceptance Criteria:**
- [ ] Create `firestore.rules` with patterns:
  - Authentication requirements
  - Role-based access (admin, user, guest)
  - Document ownership rules
  - Read vs write permissions
  - Field-level validation
- [ ] Create `storage.rules` with patterns:
  - File type restrictions
  - File size limits
  - Path-based permissions
  - User-specific directories
- [ ] Set up rules testing framework:
  - `@firebase/rules-unit-testing`
  - Test files in `tests/security-rules/`
- [ ] Create comprehensive test suite:
  - Authenticated vs unauthenticated access
  - Role-based permissions
  - Owner-only operations
  - Field validation
  - File upload restrictions
- [ ] Document security patterns and anti-patterns
- [ ] Create deployment scripts for rules

**Dependencies:** Ticket 5, 6, 7 (needs auth and data patterns established)

**Key Decisions to Document:**
- Security rule organization
- Role implementation approach
- When to validate in rules vs application
- Testing strategy for rules

**Testing Requirements:**
- [ ] All rules tests pass
- [ ] Unauthorized access blocked
- [ ] Authorized access succeeds
- [ ] Edge cases handled

**Documentation Needs:**
- README section: "Security Rules"
- Rules testing guide
- Common security patterns
- Security anti-patterns to avoid

---

### Phase 3: Advanced Patterns

#### Ticket 9: Cloud Functions Integration

**Objective:** Set up Cloud Functions with TypeScript and demonstrate common patterns.

**Acceptance Criteria:**
- [ ] Set up `functions/` directory:
  ```
  functions/
  ├── src/
  │   ├── index.ts              # Exports
  │   ├── callable/             # Callable functions
  │   ├── triggers/             # Database triggers
  │   └── scheduled/            # Scheduled functions
  ├── package.json
  ├── tsconfig.json
  └── .eslintrc.js
  ```
- [ ] Create example callable function:
  - Accepts typed parameters
  - Returns typed response
  - Includes error handling
  - Validates auth context
- [ ] Create example HTTP function:
  - Express-based
  - CORS configured
  - Request validation
- [ ] Create example Firestore trigger:
  - `onCreate` handler
  - `onUpdate` handler
  - `onDelete` handler
- [ ] Create example scheduled function
- [ ] Demonstrate calling functions from app using signals:
  - Loading state
  - Error handling
  - Response processing
- [ ] Add local function testing:
  - Unit tests for function logic
  - Integration tests calling emulated functions
- [ ] Document deployment workflow

**Dependencies:** Ticket 6 (for Firestore triggers)

**Key Decisions to Document:**
- Functions project structure
- When to use callable vs HTTP functions
- Trigger patterns and use cases
- Testing strategy for functions
- Deployment process

**Testing Requirements:**
- [ ] Functions deploy to emulator
- [ ] Callable functions work from app
- [ ] HTTP functions respond correctly
- [ ] Triggers fire on data changes
- [ ] Unit tests pass

**Documentation Needs:**
- README section: "Cloud Functions"
- Functions architecture guide
- Calling functions from app guide
- Functions testing guide
- Deployment instructions

---

#### Ticket 10: Composite Patterns & Best Practices

**Objective:** Demonstrate multiple Firebase services working together.

**Acceptance Criteria:**
- [ ] Create composite example: User Profile Management
  - Auth for user identity
  - Firestore for profile data
  - Storage for avatar image
  - Function for profile validation/processing
- [ ] Implement pagination pattern:
  - Cursor-based pagination
  - "Load more" functionality
  - State management for paginated data
- [ ] Implement search/query examples:
  - Simple queries (where, orderBy, limit)
  - Compound queries
  - Query caching strategy
- [ ] Implement caching strategy:
  - When to cache Firestore data
  - Cache invalidation patterns
  - Offline data handling
- [ ] Create performance optimization examples:
  - Lazy loading
  - Image optimization
  - Batch operations
- [ ] Document composite patterns

**Dependencies:** Tickets 5-9 (needs all core services)

**Key Decisions to Document:**
- When to use composite patterns
- Performance optimization strategies
- Caching approach
- Pagination implementation

**Testing Requirements:**
- [ ] Composite features work end-to-end
- [ ] Pagination performs well
- [ ] Caching works correctly
- [ ] Performance meets expectations

**Documentation Needs:**
- README section: "Composite Patterns"
- Performance optimization guide
- Caching strategy document
- Real-world examples cookbook

---

#### Ticket 11: Testing & Documentation Finalization

**Objective:** Complete test coverage and comprehensive documentation.

**Acceptance Criteria:**
- [ ] Achieve test coverage targets:
  - Stores: 90%+ coverage
  - Components: 80%+ coverage
  - Functions: 90%+ coverage
  - Security rules: 100% coverage
- [ ] Complete Storybook stories for all components:
  - All states demonstrated
  - Interactive controls
  - Documentation tabs
- [ ] Create comprehensive app README:
  - Quick start guide
  - Architecture overview
  - All feature documentation
  - Testing guide
  - Deployment guide
  - Troubleshooting
- [ ] Write migration guide:
  - Converting legacy Firebase code
  - Step-by-step process
  - Common gotchas
  - Before/after examples
- [ ] Create troubleshooting guide:
  - Common errors and solutions
  - Emulator issues
  - Auth problems
  - Firestore query issues
  - Storage upload problems
- [ ] Add code comments and JSDoc:
  - All public APIs documented
  - Complex logic explained
  - Examples provided

**Dependencies:** Tickets 1-10 (needs all features complete)

**Key Decisions to Document:**
- Documentation organization
- When to update docs
- How to contribute documentation

**Testing Requirements:**
- [ ] All tests pass
- [ ] Coverage meets targets
- [ ] Storybook builds successfully

**Documentation Needs:**
- Complete app README
- Migration guide
- Troubleshooting guide
- API documentation
- Contributing guide

---

### Phase 4: Validation & Polish

#### Ticket 12: Standards Compliance Audit

**Objective:** Verify complete compliance with all monorepo standards.

**Acceptance Criteria:**
- [ ] Run standardization audit against all `/coding_docs/`:
  - [ ] SHARED_WEB_COMPONENT_DEFAULTS.md compliance
  - [ ] State management patterns compliance
  - [ ] Testing standards met
  - [ ] Project organization compliance
  - [ ] Package sharing rules followed
- [ ] Verify MD3 compliance:
  - [ ] All components use Material Design 3
  - [ ] Theming works correctly
  - [ ] Accessibility standards met
- [ ] Validate signal/store patterns:
  - [ ] Match patterns from other teaching apps
  - [ ] Consistent API design
  - [ ] Proper state management
- [ ] Check test coverage:
  - [ ] Meets minimum thresholds
  - [ ] All critical paths tested
  - [ ] Edge cases covered
- [ ] Review documentation completeness:
  - [ ] All features documented
  - [ ] Examples provided
  - [ ] Clear and accurate
- [ ] Verify Storybook integration:
  - [ ] All components have stories
  - [ ] Stories demonstrate all states
  - [ ] Documentation tabs complete
- [ ] Run lint and format checks:
  - [ ] ESLint passes
  - [ ] Prettier formatted
  - [ ] TypeScript strict mode
- [ ] Create compliance checklist for future Firebase apps

**Dependencies:** Ticket 11 (needs complete implementation)

**Key Decisions to Document:**
- Compliance verification process
- What to do when standards conflict
- How to handle exceptions

**Testing Requirements:**
- [ ] All linting passes
- [ ] All tests pass
- [ ] Builds succeed
- [ ] Storybook builds

**Documentation Needs:**
- Compliance checklist document
- Standards verification guide
- Firebase app creation guide

---

#### Ticket 13: Production Deployment & Bundle Patterns

**Objective:** Demonstrate production deployment to Firebase Hosting and bundled deployment to alternative hosting (e.g., 11ty static sites, traditional web servers).

**Why This Matters:**
This ticket completes the teaching app by demonstrating the full lifecycle from emulator-first development to production deployment. It validates that all patterns established in Tickets 1-12 work identically in production, and shows how to bundle the app for non-Firebase hosting scenarios.

**Key Teaching Points:**
- Establishes complete environment configuration lifecycle (dev → prod)
- Teaches CI/CD trigger patterns (branch-based deployment)
- Demonstrates bundle portability for alternative hosting
- Documents the differences between emulator and production environments
- Shows that seed data stays in development, production starts clean

**Acceptance Criteria:**

**Part A: Firebase Hosting Production Deployment**
- [ ] Create real Firebase project in Firebase Console
  - Document the entire process with screenshots
  - Use free tier (sufficient for teaching purposes)
  - Document project naming conventions
- [ ] Create `.env.production` with actual project credentials:
  ```
  # Firebase Project Configuration (ACTUAL VALUES from Firebase Console)
  VITE_FIREBASE_API_KEY=<your-actual-key-from-console>
  VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=<your-project-id>
  VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
  VITE_FIREBASE_APP_ID=<your-app-id>

  # Environment Mode
  VITE_USE_EMULATOR=false
  ```
- [ ] Configure Vite for production builds:
  - Add `build:prod` script that loads `.env.production`
  - Verify bundle excludes emulator connection code when `VITE_USE_EMULATOR=false`
  - Document bundle size and optimization strategies
- [ ] Create deployment scripts in `package.json`:
  - `deploy:rules` - deploy security rules to production
  - `deploy:functions` - deploy Cloud Functions to production
  - `deploy:hosting` - build and deploy app to Firebase Hosting
  - `deploy:prod` - complete deployment (rules + functions + hosting)
- [ ] Document step-by-step production deployment process:
  - How to create Firebase project in console
  - How to obtain and securely store credentials
  - Initial Firebase project setup commands
  - Deploying security rules
  - Deploying functions
  - First hosting deployment
  - Verification steps

**Part B: CI/CD Pipeline Pattern (GitHub Actions)**
- [ ] Create `.github/workflows/deploy-production.yml`:
  ```yaml
  name: Deploy to Production
  on:
    push:
      branches: [main]  # or 'production' branch
  jobs:
    deploy:
      - Build with production config
      - Deploy security rules
      - Deploy functions
      - Deploy hosting
      - Post deployment URL to commit
  ```
- [ ] Document CI/CD setup guide:
  - How to add Firebase credentials to GitHub Secrets
  - Branch protection strategies
  - Environment-specific GitHub Actions
  - Deployment verification checks
  - Rollback procedures
- [ ] Create pre-deployment checklist:
  - Security rules tested and ready
  - Functions tested in emulator
  - All tests passing
  - Documentation updated
  - Environment variables validated

**Part C: Alternative Hosting - Bundled Deployment**
- [ ] Create `build:bundle` script:
  - Produces standalone bundle with all assets
  - Self-contained deployment artifact
  - No Firebase Hosting dependencies
  - Includes environment configuration documentation
- [ ] Document 11ty integration pattern:
  - How to include Firebase app bundle in 11ty site
  - Embedding the bundle in an 11ty page
  - Environment configuration for embedded app
  - Asset path management
  - CORS and security considerations
- [ ] Document generic static hosting deployment:
  - Nginx configuration example
  - Apache .htaccess example
  - Deploy to Netlify (steps)
  - Deploy to Vercel (steps)
  - CDN integration considerations

**Part D: Production Environment Differences**
- [ ] Document what changes in production vs emulators:
  - No emulator connections (connectFirestoreEmulator, etc. not called)
  - Real Firebase authentication flows
  - Actual security rules enforcement
  - Production Firebase quotas and limits
  - Billing and cost monitoring
  - Data persistence (real database, not emulator export)
- [ ] Create "Production Readiness Checklist":
  ```markdown
  - [ ] Security rules deployed and tested
  - [ ] Functions deployed to production region
  - [ ] Storage rules deployed
  - [ ] Environment variables configured
  - [ ] Custom domain configured (optional)
  - [ ] Monitoring/logging enabled
  - [ ] Backup strategy documented
  - [ ] Cost alerts configured
  ```

**Part E: NO Seed Data in Production**
- [ ] Document seed data exclusion from production:
  - Emulator exports (`emulator-data/`) are NEVER deployed
  - Production starts with empty database
  - Security rules prevent unauthorized seeding
  - First production users create real data
- [ ] Create production data initialization pattern (if needed):
  - Admin scripts for essential configuration data
  - User-driven data creation workflows
  - Migration patterns from legacy systems (if applicable)
  - Document when/if to pre-populate production data

**Dependencies:**
- Ticket 11 (needs complete, tested implementation)
- Ticket 12 (should pass standards compliance)
- Requires real Firebase project (free tier sufficient)

**Key Decisions to Document:**
- When to use Firebase Hosting vs alternative hosting
- Branch/tag strategy for triggering production deploys
- How to manage environment variables in CI/CD
- Bundle optimization and tree-shaking strategies
- Production monitoring and debugging approaches
- Cost monitoring and optimization

**Testing Requirements:**
- [ ] Production deployment succeeds end-to-end
- [ ] App works identically to emulator (minus seed data)
- [ ] Authentication works with production Firebase Auth
- [ ] Firestore CRUD operations work with production security rules
- [ ] Storage operations work with production security rules
- [ ] Cloud Functions callable from production app
- [ ] Bundled version deploys to Netlify successfully
- [ ] CI/CD pipeline completes without errors

**Documentation Needs:**
- README section: "Production Deployment"
- README section: "CI/CD Setup with GitHub Actions"
- README section: "Deploying to Alternative Hosting"
- Document: "Production Readiness Checklist"
- Document: "Troubleshooting Production Issues"
- Document: "Environment Configuration Reference" (complete table)
- Document: "Cost Monitoring and Optimization"

**Cost Considerations:**
- Document Firebase free tier limits (Spark plan)
- Provide usage estimates for typical teaching app
- Suggest Firebase usage monitoring tools
- Document how to set up billing alerts
- Recommend upgrade path if needed (Blaze plan)

**Security Considerations:**
- `.env.production` must NEVER be committed (verify `.gitignore`)
- Use GitHub Secrets or equivalent for CI/CD credentials
- Document credential rotation procedures
- Audit all security rules before first production deployment
- Document authentication configuration for production domain
- Set up Firebase App Check (optional but recommended)

**Success Criteria:**
- [ ] Can deploy from scratch to production Firebase in < 15 minutes
- [ ] Can deploy bundled version to Netlify in < 10 minutes
- [ ] CI/CD pipeline deploys automatically on merge to main
- [ ] Production app has zero seed data but full functionality
- [ ] Complete documentation enables replication by others
- [ ] All emulator patterns work identically in production

**Teaching Value:**
This ticket bridges "works offline with emulators" to "deployed in production." It validates that the emulator-first development approach produces production-ready code, and demonstrates bundle portability for various hosting scenarios (Firebase Hosting, 11ty sites, traditional web servers, Netlify, Vercel, etc.). It also teaches the critical distinction between development seed data and production data initialization.

---

## Cross-References

### Existing Standards Documents
- `/coding_docs/SHARED_WEB_COMPONENT_DEFAULTS.md` - Component standards
- `/coding_docs/TICKET_SESSION_CHECKLIST.md` - Ticket protocol
- `/coding_docs/README.md` - Overall coding standards
- `/coding_docs/testing/` - Testing standards and practices

### Reference Teaching Apps
- `@df/df-lit-starter` - Basic project structure template
- `@df/df-teaching-app` - General teaching patterns
- `@df/df-npm-info-app` - Signals-based state management example
- `@df/df-practice-app` - Component patterns and testing

### Related Packages
- `@df/state` - Signals-based state management
- `@df/types` - Shared TypeScript types
- `@df/ui-lit` - Shared UI components
- `@df/firebase` - (To be created) Shared Firebase utilities

## Success Metrics

### For the Teaching App
- ✅ 100% emulator functionality (no cloud dependencies for development)
- ✅ Complete seed data for all services
- ✅ 85%+ test coverage across all code
- ✅ All components have Storybook stories
- ✅ Comprehensive documentation (README + inline)
- ✅ Passes all standards compliance checks

### For Future Firebase Apps
- ✅ Can be created in < 1 day using teaching app patterns
- ✅ Developers/agents reference teaching app as source of truth
- ✅ Consistent patterns across all Firebase apps in monorepo
- ✅ Reduced Firebase-related bugs due to proven patterns
- ✅ Clear documentation reduces onboarding time

### For the Monorepo
- ✅ Firebase utilities reusable across multiple apps
- ✅ Shared types reduce duplication
- ✅ Security rules templates accelerate development
- ✅ Testing patterns applicable to all apps

## Implementation Notes

### Recommended Approach
1. **Start with Ticket 1** - Foundation is critical
2. **Follow sequence** - Each ticket builds on previous work
3. **Review at milestones** - After Phase 1, 2, 3, and 4
4. **Iterate on documentation** - Update as patterns emerge
5. **Test continuously** - Don't wait for Ticket 11

### Agent Mode Consideration
For implementation tickets (especially Ticket 1-4), Agent mode may accelerate development:
- Lots of file creation and configuration
- Multiple iterations to test emulator setup
- Seed data generation
- Less back-and-forth on configuration details

Standard mode better for:
- Architecture decisions
- Pattern establishment
- Documentation review
- Standards compliance

### Time Estimates (Rough)
- **Phase 1** (Tickets 1-4): 2-3 days - Foundation critical, take time
- **Phase 2** (Tickets 5-8): 4-5 days - Core services, most complex
- **Phase 3** (Tickets 9-10): 2-3 days - Integration and optimization
- **Phase 4** (Tickets 11-12): 2 days - Polish and validation
- **Phase 5** (Ticket 13): 1-2 days - Production deployment patterns

**Total: ~11-15 days** for complete, production-ready teaching app with deployment

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-09 | Initial roadmap created | CoPilot/Pete |
| 1.1 | 2025-10-11 | Amended Ticket 2 with emulator-first philosophy; Added Ticket 13 for production deployment & bundle patterns | Claude/Pete |

## Appendix: Firebase Resources

### Official Documentation
- [Firebase Docs](https://firebase.google.com/docs)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Security Rules](https://firebase.google.com/docs/rules)
- [Cloud Functions](https://firebase.google.com/docs/functions)

### Best Practices
- [Firebase Best Practices](https://firebase.google.com/support/guides/best-practices)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Security Rules Best Practices](https://firebase.google.com/docs/rules/rules-and-auth)

### Testing Resources
- [@firebase/rules-unit-testing](https://www.npmjs.com/package/@firebase/rules-unit-testing)
- [Testing Cloud Functions](https://firebase.google.com/docs/functions/unit-testing)
