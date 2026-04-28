# Firestore Collection Naming Convention

> **Tier:** 2 — Load when adding or renaming Firestore collections, or when auditing the data model.

---

## The Problem (WCPGW)

You open the Firestore console. You see these top-level collections:

```
activity
chatMessage
sessions
systemMetrics
todos
todoAnalytics
userProfiles
userStats
```

**What could go wrong?**

- **Which app owns `sessions`?** The OpenClaw chat? The auth system? Some Firebase SDK internal thing? You don't know without grepping 50,000 tokens of source code.
- **Is `chatMessage` the OpenClaw chat or the other chat widget?** Both exist. Both write messages. The name tells you nothing.
- **Can you safely delete `activity`?** Which feature breaks if you do? Unknown without investigation.
- **Which collections can share security rules?** Impossible to group them by owner when names carry no ownership signal.
- **A new developer joins.** They open Firestore. They have no mental model. They guess. They're wrong.

The root cause: **collection names were chosen for terseness, not for human legibility at a glance.** An LLM can read 20,000 tokens in milliseconds and reconstruct ownership from context. A human staring at the Firestore console has no such luxury.

This is not a theoretical risk. It has already caused confusion in this monorepo.

---

## The Convention

### Rule 1: Top-level collections must be prefixed with the feature or app name

The prefix must be recognizable without reading code. When in doubt, be more explicit, not less.

**Bad** — opaque, ownership unknown:
```
sessions/
chatMessage/
activity/
systemMetrics/
```

**Good** — self-documenting:
```
openclawWorkRequests/
monWedChat/
goldilocksActivity/
todoSystemMetrics/
```

### Rule 2: Subcollections do not need the prefix

They are already scoped under a named parent. The parent carries the ownership signal.

```
openclawWorkRequests/{requestId}/messages/{msgId}    ✅
openclawWorkRequests/{requestId}/attachments/{fileId} ✅
```

### Rule 3: Register every new collection in this document

When you add a collection, add it to the registry below. When you rename one, update the registry. This document is the authoritative map of what exists and why.

### Rule 4: Shared / cross-app collections are the exception, not the rule

Some collections are genuinely shared (e.g., `userProfiles`). These may omit a feature prefix, but must be marked **shared** in the registry and owned by a named team or system concern.

---

## Collection Registry

This is the living inventory of all Firestore collections in this project. Update it whenever a collection is added, renamed, or retired.

| Collection Path | Owner / App | Status | Notes |
|---|---|---|---|
| `sessions/` | `df-openclaw-chat` | ⚠️ Legacy — rename pending | Stores OpenClaw work request messages. Ambiguous name. Scheduled for rename to `openclawWorkRequests/` in a future data model migration ticket. |
| `sessions/{id}/messages/` | `df-openclaw-chat` | ⚠️ Legacy — rename pending | Messages subcollection for OpenClaw sessions. |
| `chatMessage/` | `df-teaching-app` (Mon/Wed chat widget) | ⚠️ Ambiguous name | Generic chat messages for the teaching app chat widget. Should be renamed `monWedChatMessages/` or similar. |
| `todos/` | `df-teaching-app` | ✅ Acceptable | Sufficiently scoped by context; low collision risk in this project. |
| `todoAnalytics/` | `df-teaching-app` | ✅ Good | Prefixed with feature name. |
| `userStats/` | `df-teaching-app` | ⚠️ Ambiguous name | Stores per-user todo statistics. Should be renamed `todoUserStats/`. |
| `activity/{uid}/activities/` | `goldilocks` app | ⚠️ Ambiguous name | Activity log entries scoped to a user. Root `activity/` name gives no ownership signal. |
| `activity/{uid}/activityTypes/` | `goldilocks` app | ⚠️ Ambiguous name | Activity type definitions. Same root as above. |
| `goldilocks/{uid}/goldilocksTypes/` | `goldilocks` app | ✅ Good | Prefixed with app name. |
| `goldilocks/{uid}/configurations/` | `goldilocks` app | ✅ Good | Prefixed with app name. |
| `systemMetrics/` | `services/functions` (todo cleanup) | ⚠️ Ambiguous name | Tracks cleanup job run statistics. Should be renamed `todoSystemMetrics/`. |
| `userProfiles/` | Shared — auth/user management | ✅ Acceptable | Cross-app user profile data. Intentionally generic because it is a shared system concern. |

### Planned (not yet created)

| Collection Path | Owner / App | Notes |
|---|---|---|
| `openclawWorkRequests/` | `df-openclaw-chat` | Replacement for `sessions/`. Pending data model migration ticket. See `guides/firebase-teaching/FIRESTORE_RULES_MANAGEMENT.md`. |
| `openclawWorkRequests/{id}/messages/` | `df-openclaw-chat` | Messages subcollection under the new name. |
| `openclawWorkRequests/{id}/attachments/` | `df-openclaw-chat` | File attachment references (future). |

---

## How to Add a New Collection

1. Choose a name that passes the "cold Firestore console" test: could a human who hasn't read the code in two months immediately know which feature owns this?
2. Add it to the registry table above before writing any code.
3. If the collection replaces an existing one, mark the old entry as **Legacy — rename pending** and add the new one to the Planned section, then move it to active once created.
4. Update Firestore security rules at the monorepo root (`firestore.rules`) to cover the new collection. See `guides/firebase-teaching/FIRESTORE_RULES_MANAGEMENT.md`.

---

## On the Legacy Collections

The collections marked ⚠️ above are not broken — they work. Renaming them is a considered migration, not an emergency. Each rename requires:
- Updating the Firestore trigger paths (if any Cloud Functions target them)
- Updating collection references in `@df/state` stores
- Updating `firestore.rules`
- Migrating or abandoning existing data
- Updating this registry

Do not rename opportunistically inside unrelated tickets. Plan renames as explicit data model migration tickets so the scope is clear.
