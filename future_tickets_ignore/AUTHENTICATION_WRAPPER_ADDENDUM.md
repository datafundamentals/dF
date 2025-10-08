# Authentication Wrapper Pattern - Coding Addendum

## Overview

This document formalizes the **Authentication Wrapper Pattern** - a fundamental architectural principle for building scalable web component applications with proper separation of concerns.

## The Problem

Web components that handle both **business logic** AND **authentication** violate the **Single Responsibility Principle** and create:

- ❌ **Tight Coupling** - Business logic mixed with auth logic
- ❌ **Code Duplication** - Every component reimplements auth UI
- ❌ **Testing Complexity** - Cannot test business logic without auth
- ❌ **Maintenance Burden** - Auth changes require updating every component

## The Solution: Authentication Wrapper Pattern

### **Core Principle**
> **Authentication is a cross-cutting concern that should be handled at the application boundary, not within business components.**

### **Pattern Structure**

```
🏗️ Layered Architecture
├── 📄 Static HTML Page (MPA entry point)
├── 🛡️ Authentication Wrapper (*-bundle-app.ts)
├── 🔀 Conditional Rendering (auth-gated)  
└── 🧩 Pure Business Components (auth-free)
```

## Pattern Implementation

### **1. Authentication Wrapper Component**

The wrapper component handles ALL authentication concerns:

```typescript
// ✅ GOOD: Authentication Wrapper Pattern
@customElement('app-bundle-wrapper')
export class AppBundleWrapper extends SignalWatcher(LitElement) {
  override render() {
    return html`
      <div class="app-container">
        ${this.renderAuthenticatedContent()}
      </div>
    `;
  }

  private renderAuthenticatedContent() {
    return isLoggedIn.get()
      ? this.renderBusinessComponents()
      : this.renderLoginPrompt();
  }

  private renderBusinessComponents() {
    return html`
      <div class="user-info">
        <span>Welcome, ${userSignal.get()?.displayName}</span>
        <md-filled-button @click="${signOut}">Sign Out</md-filled-button>
      </div>
      
      <!-- Pure business components - NO auth logic -->
      <business-component></business-component>
      <another-component></another-component>
    `;
  }

  private renderLoginPrompt() {
    return html`
      <div class="login-prompt">
        <h2>Authentication Required</h2>
        <p>Please sign in to access this application</p>
        <md-filled-button @click="${signInWithGoogle}">
          Sign in with Google
        </md-filled-button>
      </div>
    `;
  }
}
```

### **2. Pure Business Components**

Business components focus ONLY on their domain logic:

```typescript
// ✅ GOOD: Pure Business Component (No Auth Logic)
@customElement('business-component')
export class BusinessComponent extends SignalWatcher(LitElement) {
  override render() {
    return html`
      <div class="business-content">
        <h3>Business Feature</h3>
        <!-- Pure business logic here -->
        <!-- NO authentication code -->
      </div>
    `;
  }

  private handleBusinessAction() {
    // Pure business logic
    // Assumes authentication already handled by wrapper
  }
}
```

### **3. Static HTML Integration (MPA)**

Each page includes the appropriate wrapper:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Application Page</title>
</head>
<body>
  <!-- Single wrapper component handles auth -->
  <app-bundle-wrapper></app-bundle-wrapper>
  
  <script type="module" src="/ui/app-bundle-wrapper.js"></script>
</body>
</html>
```

## Current Implementation Examples

### **✅ Correct Pattern: PEG Bundle App**

```typescript
// src/ui/peg-bundle-app.ts - FOLLOWS PATTERN CORRECTLY
export class PegBundleApp extends SignalWatcher(LitElement) {
  override render() {
    return html`
      ${isLoggedIn.get()
        ? html`
            <p>Welcome, ${userSignal.get()?.displayName}</p>
            <button @click="${signOut}">Sign Out</button>
            <peg-player></peg-player>  <!-- Pure business component -->
          `
        : html`
            <button @click="${signInWithGoogle}">Sign in with Google</button>
          `
      }
    `;
  }
}
```

### **❌ Anti-Pattern: RAG Components**

```typescript
// src/ui/rag-query-interface.ts - VIOLATES PATTERN
export class RagQueryInterface extends SignalWatcher(LitElement) {
  override render() {
    return html`
      <!-- Auth logic mixed with business logic - BAD -->
      ${isLoggedIn.get() 
        ? html`<query-form></query-form>` 
        : html`<button @click="${signInWithGoogle}">Sign In</button>`
      }
    `;
  }
}
```

## Benefits of This Pattern

### **🔧 Technical Benefits**
- **Single Responsibility** - Each component has one job
- **Testability** - Business components can be tested without auth
- **Reusability** - Business components work in any auth context
- **Maintainability** - Auth changes in one place only

### **🏗️ Architectural Benefits**  
- **Clear Separation** - Auth concerns isolated from business logic
- **Consistent UX** - Standardized login/logout experience
- **Scalability** - Easy to add new business components
- **MPA Compatible** - Works perfectly with static site generation

### **👨‍💻 Developer Experience**
- **Less Cognitive Load** - Developers focus on business logic only  
- **Faster Development** - No auth boilerplate in every component
- **Easier Debugging** - Clear boundary between auth and business issues
- **Better Testing** - Test business logic in isolation

## Development Workflow Integration

### **Dev Folder Structure**
```
dev/
├── peg.html          # Uses peg-bundle-app wrapper
├── bwp.html          # Uses bwp-bundle-app wrapper  
├── rag-query.html    # Should use rag-bundle-app wrapper
└── rag-editor.html   # Should use rag-bundle-app wrapper
```

### **11ty Production Build**
```
_site/
├── peg/index.html    # Contains <peg-bundle-app>
├── bwp/index.html    # Contains <bwp-bundle-app>
└── rag/index.html    # Should contain <rag-bundle-app>
```

## Migration Strategy

### **Phase 1: Create RAG Authentication Wrapper**
1. Create `rag-bundle-app.ts` following the pattern
2. Extract auth logic from existing RAG components
3. Make RAG components pure business components

### **Phase 2: Update Dev Environment**
1. Update `dev/rag-*.html` to use `rag-bundle-app`
2. Test all functionality works through wrapper

### **Phase 3: Update Production Build**
1. Configure 11ty to use RAG wrapper
2. Update rollup bundling configuration
3. Verify production deployment

## Testing Strategy

### **Wrapper Testing**
```typescript
// Test authentication wrapper
describe('RagBundleApp', () => {
  test('shows login when not authenticated', () => {
    // Test auth wrapper behavior
  });
  
  test('shows business components when authenticated', () => {
    // Test conditional rendering
  });
});
```

### **Business Component Testing**
```typescript
// Test pure business components (no auth mocking needed)
describe('RagQueryComponent', () => {
  test('processes query correctly', () => {
    // Test pure business logic - no auth concerns
  });
});
```

## Naming Conventions

- **Authentication Wrappers**: `{domain}-bundle-app.ts`
  - `peg-bundle-app.ts` (PEG domain)
  - `bwp-bundle-app.ts` (BWP domain)
  - `rag-bundle-app.ts` (RAG domain)

- **Pure Business Components**: `{domain}-{feature}.ts`
  - `rag-query-component.ts`
  - `rag-document-editor.ts`
  - `peg-player.ts`

## Future Considerations

1. **Multi-Role Authentication** - Wrappers can handle role-based access
2. **Progressive Enhancement** - Graceful degradation for non-JS users
3. **Micro-Frontend Architecture** - Each domain gets its own wrapper
4. **Shared Auth Components** - Common login/logout UI components

---

This pattern ensures **clean architecture**, **better testing**, and **maintainable code** while supporting both **development workflows** and **production MPA deployment**.