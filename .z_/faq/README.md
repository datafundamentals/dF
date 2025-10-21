# FAQ: Optional Reference Materials

This folder contains **Frequently Asked Questions** and deep-dive analysis that's valuable but not required for daily development.

## When to Read These

- You're worried about something
- You want to understand WHY a pattern works
- You're investigating performance concerns
- You're curious about architecture decisions

## When to SKIP These

- You're implementing a feature
- You're reading context for a ticket
- You want to keep your mental context lean
- You trust that the guide pattern is correct

---

## Current FAQs

### Performance & Bundling

**[PERFORMANCE_AND_IMPORTS.md](./PERFORMANCE_AND_IMPORTS.md)**

*Question:* "If we centralize all Material Design imports, won't that waste memory and bloat our bundle?"

*Summary:* No. Modern bundlers (Vite + Rollup) use tree-shaking to remove unused imports during build. Identical bundle size and performance. Read this only if you're worried about memory overhead.

*Read if:* You're concerned about Lighthouse scores, bundle size, or memory footprint
*Skip if:* You trust modern bundlers

---

## How to Add New FAQs

1. Create a new markdown file in this folder
2. Add to this README with question, summary, and when to read
3. Link from relevant guide if applicable
4. Mark as optional in the guide
5. Reference in `.claude/CLAUDE.md` only if essential

---

## Relationship to Other Folders

- **`guides/`** - Active, required documentation
- **`.z_/WIP/`** - Session-specific scratch work
- **`.z_/faq/`** - Evergreen reference for curious minds
- **`.z_/future/`** - Planned work and deferred decisions
- **`.z_/historical/`** - Archive of old decisions

---

**Keep guides lean. Keep FAQs deep.**
