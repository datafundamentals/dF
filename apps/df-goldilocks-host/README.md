# Goldilocks Visualizer

Interactive "Pick 2" decision-making tool using Venn diagrams.

## Overview

The Goldilocks Visualizer helps users make decisions when they can only choose 2 out of 3 desirable options. Classic examples:
- **Project Management**: Fast, Cheap, Good (pick 2)
- **Work-Life Balance**: Career, Family, Health (pick 2)

## Features

- **Interactive Venn Diagrams**: Click circles to select 2 options and see them overlap
- **Goldilocks Type CRUD**: Create and manage decision scenarios with 3 options
- **Configuration History**: Save and track your "pick 2" decisions over time
- **User-Scoped Data**: All data is private to each authenticated user

## Development

### Local Development with Emulators

```bash
# Start emulators (from repo root)
pnpm emulators:start

# Run app in dev mode
pnpm --filter @df/df-goldilocks-host dev
```

The app uses the shared emulator ports from `packages/firebase/firebase.json`.

### Production Build

```bash
pnpm --filter @df/df-goldilocks-host build:prod
```

## Data Model

### Firestore Collections

```
goldilocks/{userId}/goldilocksTypes/{typeId}
  - name: string (e.g., "Project Management")
  - first: string (e.g., "Fast")
  - second: string (e.g., "Cheap")
  - third: string (e.g., "Good")
  - createdAt: timestamp
  - updatedAt: timestamp

goldilocks/{userId}/configurations/{configId}
  - goldilocksTypeName: string
  - first: string
  - second: string
  - third: string
  - selectedOptions: [string, string] (the 2 chosen options)
  - note: string | null
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Testing

### Security Rules Tests

```bash
pnpm --filter @df/df-goldilocks-host test:rules
```

### Integration Tests

```bash
pnpm --filter @df/df-goldilocks-host test
```

## Deployment

```bash
# Deploy rules and app
pnpm --filter @df/df-goldilocks-host deploy:prod

# Deploy only rules
pnpm --filter @df/df-goldilocks-host deploy:rules

# Deploy only functions
pnpm --filter @df/df-goldilocks-host deploy:functions
```

## Architecture

- **State Management**: Signals-first architecture with stores in `@df/state`
- **UI Components**: Lit 3 web components in `@df/ui-lit`
- **Styling**: Material Design 3 components from `@material/web`
- **Backend**: Firebase Firestore with user-scoped subcollections
- **Security**: Firestore rules enforce user ownership (see `firestore.rules`)

## Key Learnings

### SVG Rendering in Lit
Lit cannot render SVG elements from template expressions inside SVG containers. SVG elements must be rendered **directly in the template**, not from methods/conditionals that return `html` templates.

```typescript
// ❌ Doesn't work - SVG from template expression
${this.renderCircles()}  // Returns html`<circle.../>`

// ✅ Works - SVG directly in template
<circle cx=${x} cy=${y} r=${r} fill=${color}></circle>
```

Template expressions for **attribute values** work fine (`cx=${value}`), but the elements themselves must be direct.

## Resources

- [Firebase Emulator Workflow](../../guides/firebase-emulator-workflow.md)
- [Material Design 3 Standards](../../guides/STANDARDS_STYLES.md)
- [Firestore Security Rules](../../firestore.rules)
