# When to use Functions vs. Direct Firestore Calls

This guide helps you decide when to perform database operations from the client (e.g., in a state store) versus routing them through a Firebase Cloud Function.

Our app architecture already decouples the **Presentation Layer** (UI) from the **State Layer** (State Store) by handling operations asynchronously.

This guide addresses the next layer of decoupling: **decoupling the *Client* from your *Business Logic and Security*.**

## 🔑 The Core Question

The decision boils down to one question:

> **Does this operation require a trusted server environment?**

* **No:** The client (your state store) is fine. Use the Firestore SDK directly.
* **Yes:** The client *cannot* be trusted. Use a Cloud Function.

---

## 🛡️ When to Use a Cloud Function (Server-Side)

Use a Cloud Function when you need a secure, trusted environment. This includes:

### 1. Security & Data Integrity

This is the most critical reason. If you write directly from the client, your *only* defense is **Firestore Security Rules**.

Use a Function when:
* **Your security logic is complex.** If an "allow" rule needs to read 3+ other documents, check a user's role, or run other complex logic, it's safer and easier to put that logic in a function.
* **You want to abstract your database structure.** If the client writes directly, it *must* know the exact collection and document path (e.g., `users/uid/profile`). A function hides this; the client just calls `api.updateProfile()` and doesn't know *how* or *where* the data is stored.
* **You want maximum security.** The "gold standard" is to set your Firestore rules to `allow write: if false;`. This blocks *all* client-side writes. All data changes *must* go through your Cloud Functions, which use the Admin SDK to bypass security rules.

### 2. Complex Business Logic & Atomic Operations

A client (browser, mobile app) should not be trusted with business logic.

Use a Function when:
* **An action requires multiple, dependent database writes.** The classic example is a "purchase," which might need to:
    1.  Read product stock.
    2.  Create an `orders` document.
    3.  Decrement the `products` stock.
    A function can wrap all of these in a **Firestore Transaction** to ensure they *all* succeed or *all* fail together. You cannot guarantee this from a client.
* **You need complex data validation.** Security rules are great for simple checks (e.g., `is string`, `size < 100`). A function is required for complex validation (e.g., checking a username against a profanity API, validating data against a complex formula).

### 3. Third-Party Integrations

This is a non-negotiable.

Use a Function when:
* **You need to use secret API keys.** Any call to a service like **Stripe** (payments), **Twilio** (SMS), **SendGrid** (email), **Algolia** (search), or **OpenAI** (AI) must be made from a server. Exposing these keys on the client is a critical security breach.

### 4. Computationally Intensive Work

Offload heavy processing from the user's device.

Use a Function when:
* **You need to perform "fan-out" writes.** A user makes a post, and you need to update the feed for all 500 of their followers. Have the client do *one* write (to `posts`), and use a **background trigger function** to perform the 500 "fan-out" writes on the server.
* **You need to run a heavy calculation** before or after saving data (e.g., resizing images, generating reports).

---

## 📱 When to Use Direct Firestore Calls (Client-Side)

You can safely use the client-side SDK (from your state store) for simple operations where the client can be trusted.

Use a Direct Call when:
* The operation is **simple, non-critical CRUD** (Create, Read, Update, Delete) on a single document.
* **AND** the operation can be **100% secured with simple Firestore Security Rules**.

**The classic example:**
*A user updates their *own* display name.*
This is a perfect use case for a direct call because the security rule is simple and ironclad:

```js
match /users/{userId} {
  // Allow a user to read and update ONLY their own document
  allow read, update: if request.auth.uid == userId;
}
```

| Feature | Direct Client SDK (from State Store) | Cloud Function (Server) |
| :--- | :--- | :--- |
| **Environment** | ❌ Untrusted (Browser) | ✅ **Trusted (Server)** |
| **Primary Defense** | Firestore Security Rules | Your own code (plus IAM) |
| **Use for...** | Simple, secure CRUD | **All complex logic** |
| **API Keys** | ❌ **NEVER** | ✅ **ALWAYS** |
| **Transactions** | Limited | ✅ **Full Atomic Control** |
| **Example** | `user.update({ displayName: "..." })` | `purchaseItem({ itemId: "..." })` |