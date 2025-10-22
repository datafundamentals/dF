# Firebase Teaching App - Pattern Guides

**Instructions for coding agents** When adding or changing the name of any guide within this folder, please make the appropriate changes below.

This directory contains comprehensive guides for building production-`ready Firebase applications using the patterns demonstrated in this teaching app.

## 📚 Available Guides

### [Migration Guide](./MIGRATION_GUIDE.md)
Step-by-step guide for migrating existing Firebase apps to the teaching app's signals-first architecture.

**Key Topics:**
- Converting from Firebase v8 compat API to v11 modular API
- Migrating from props/context to signals
- Moving business logic from components to stores
- Testing with mocks vs emulators
- Common migration challenges and solutions

**When to use:** When adopting this teaching app's patterns in an existing project, or when refactoring legacy Firebase code.

---

### [Composite Patterns](./COMPOSITE_PATTERNS.md)
Learn how to coordinate multiple Firebase services together to create powerful features.

**Key Topics:**
- User-owned data (Auth + Firestore)
- File uploads with metadata (Storage + Firestore)
- Triggered workflows (Firestore → Functions → Firestore)
- Multi-service coordination strategies

**When to use:** Building features that require data from multiple Firebase services or need to keep different services in sync.

---

### [Performance Patterns](./PERFORMANCE_PATTERNS.md)
Optimize your Firebase app for speed, efficiency, and excellent user experience.

**Key Topics:**
- Lazy initialization strategies
- Signal-based rendering (12.5x faster benchmarks)
- Real-time listener lifecycle management
- Batch operations (10-50x faster than individual writes)
- Optimistic updates with rollback
- Pagination and progressive loading

**When to use:** Any production Firebase app. These patterns prevent common performance pitfalls and ensure your app scales well.

---

### [Firebase Cookbook](./FIREBASE_COOKBOOK.md)
Copy-paste ready code examples for the most common Firebase patterns.

**What's Inside:**
- User-owned data CRUD operations (Auth + Firestore)
- File upload with metadata (Storage + Firestore)
- Paginated list with filters
- Filtered real-time updates
- Offline-first CRUD with sync
- Batch operations for performance
- Optimistic updates with rollback

**Relationship to other guides:** The Cookbook focuses on **ready-to-use code snippets** you can copy directly into your app, while the Pattern guides explain **why and when** to use these techniques. Use them together: read the patterns for understanding, then grab code from the cookbook for implementation.

---

### [Troubleshooting Guide](./TROUBLESHOOTING.md)
Comprehensive solutions for common Firebase errors and issues.

**What's Inside:**
- General setup and configuration issues
- Firebase Emulator connection problems
- Authentication errors (invalid credentials, permissions, etc.)
- Firestore query and permission errors
- Storage upload/download failures
- Cloud Functions debugging
- Signals and reactivity troubleshooting
- Build and TypeScript errors
- Testing issues

**When to use:** When you encounter an error and need a quick solution. Organized by error message and Firebase service for easy navigation.

---

## 🎯 How to Use These Guides

1. **Learning Path:** Start with **Composite Patterns** to understand how services work together, then move to **Performance Patterns** to optimize your implementation.

2. **Reference:** Use these guides as a reference when implementing specific features. Each pattern includes complete examples with actual code from this teaching app.

3. **Copy-Paste:** The **Firebase Cookbook** (coming soon) provides ready-to-use code snippets you can adapt for your own projects.

4. **Teaching:** These guides are designed to be shared with team members or used in educational settings. They include explanations of *why* patterns work, not just *how*.

## 🏗️ Architecture Context

All patterns in these guides are built on the teaching app's architecture:

- **Signals-first state management** (@lit-labs/signals)
- **Lit web components** for reactive UI
- **Firebase SDK v11** (modular API)
- **TypeScript** throughout
- **Emulator-first development** for rapid testing

## 📖 Related Documentation

- [Authentication Patterns](../AUTHENTICATION_PATTERNS.md) - User login and auth flows
- [Firestore Patterns](../FIRESTORE_PATTERNS.md) - Database queries and data modeling
- [Function Triggers](../functions/README.md) - Cloud Functions patterns and examples

## 🤝 Contributing

Found a pattern that should be documented? Open an issue or PR! These guides grow based on real-world usage and questions from the community.

---

**Last Updated:** October 2025  
**Teaching App Version:** 1.0  
**Firebase SDK Version:** 11.x
