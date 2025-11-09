# 🔒 Role-Based Access Control (RBAC) Guide


## 0. Functions Based

Code which implements RBAC or Role Based Access Contol is always found within firestore functions, and never deployed to the application layer, such as `packages/state` stores.


## 1. Philosophy and Standard

Our approach to authorization is not ad-hoc. It is a practical implementation of the official US national standard for Role-Based Access Control (RBAC), specifically **ANSI/INCITS 359-2004**, which is based on the model developed by **NIST** (National Institute of Standards and Technology).

This standard solves the exact granularity and hierarchy problems we often encounter. The key takeaway from this standard is to **decouple *who a user is* from *what they can do***.

Our system is built on two main components from this standard:
1.  **Core RBAC:** Defines the basic relationships between users, roles, and permissions.
2.  **Hierarchical RBAC:** Adds the concept of role inheritance (e.g., a "Supervisor" can inherit all permissions from an "Editor").

## 2. The Core Components

We do **not** assign permissions directly to users. Instead, we use a three-part model:

* **Users:** A `User` is an authenticated identity (e.g., a person, a service account).
    * **A user can have one or more Roles.** (This is our "array of roles".)
* **Roles:** A `Role` is a label for a job function or set of responsibilities (e.g., `editor`, `field_supervisor`, `admin`). A role is a collection of permissions.
    * **A role can have one or more Permissions.**
* **Permissions:** A `Permission` is a single, granular "can-do" action in the system. These should be named clearly and consistently.
    * **Format:** `resource:action` (e.g., `post:edit`, `timesheet:approve`, `user:delete`).

This many-to-many relationship is the key:
* User <-> Roles (Many-to-Many)
* Role <-> Permissions (Many-to-Many)



## 3. Data Model Example

This is how the relationships look in practice.

### Users
A user simply has an array of role identifiers.

```json
{
  "userId": "u-123",
  "name": "Alice",
  "roles": ["role_editor", "role_team_lead"]
},
{
  "userId": "u-456",
  "name": "Bob",
  "roles": ["role_field_supervisor"]
}

### Roles and Permissions

This is where the magic happens. We define what each role can do.

```json
{
  "roles": [
    {
      "id": "role_editor",
      "name": "Editor",
      "permissions": ["post:create", "post:edit", "post:read_all"]
    },
    {
      "id": "role_field_supervisor",
      "name": "Field Supervisor",
      "permissions": ["timesheet:approve", "timesheet:read_all", "post:read_all"]
    },
    {
      "id": "role_team_lead",
      "name": "Team Lead",
      "permissions": ["user:invite", "user:assign_role"]
    }
  ]
}
```

## 4\. How to Check Authorization

**Rule: Never check a user's role. ALWAYS check for a permission.**

### ❌ The Wrong Way (Brittle)

```javascript
// DON'T DO THIS
if (user.roles.includes('admin') || user.roles.includes('supervisor')) {
  // ... what if we add an 'editor_supervisor'? This code breaks.
}
```

### ✅ The Right Way (Flexible & Standard-Compliant)

Your application code should only ask one question: "Does this user have the required permission?"

Your auth system will handle the logic:

1.  Get the user (e.g., Alice).
2.  Get all her roles (e.g., `['role_editor', 'role_team_lead']`).
3.  Look up all permissions for those roles (e.g., `['post:create', 'post:edit', ..., 'user:invite', ...]`).
4.  Check if the required permission is in that final list.

<!-- end list -->

```javascript
// DO THIS
if (user.hasPermission('post:edit')) {
  // Alice can do this, because her 'role_editor' has this permission.
  // Bob CANNOT do this, even though he is a 'supervisor'.
}

if (user.hasPermission('timesheet:approve')) {
  // Alice CANNOT do this.
  // Bob CAN do this.
}
```

## 5\. Solving the Hierarchy Problem

Your "Supervisor" problem is solved perfectly by this model.

**Problem:** "A supervisor should be over editors, but a supervisor of field personnel might not be ideal if they had editor rights."

**Solution:** You create two distinct roles.

1.  **`field_supervisor`**: Gets `timesheet:approve`.
2.  **`editing_supervisor`**: Gets `post:approve` and `post:edit`.

Bob gets the `['field_supervisor']` role array. He cannot edit posts.
Carol gets the `['editing_supervisor']` role array. She can.

If you want an `editing_supervisor` to be able to do *everything* an `editor` can do, you use **Hierarchical RBAC**. In our system, this simply means you assign the `editing_supervisor` role *all permissions* that the `editor` role has, plus its own.

## 6\. Further Reading (Advanced)

The NIST standard also defines **Constrained RBAC**, which adds **Separation of Duties (SoD)**. This is a set of rules to prevent toxic combinations, e.g., "A user cannot have *both* the `auditor` role and the `cashier` role."

We do not implement this complexity for now, but the standard provides a clear path if we ever need it.

