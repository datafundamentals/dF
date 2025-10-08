# New v Existing Web Components - an Coding Standards addendum

**TL;DR:** When in doubt, make a new UI component, rather than adding a widget inside your existing UI component.

Read further if the above statement doesn't make sense.

## UI Principle: Granular Componentization

Our standard is to **favor the creation of small, focused components over large, monolithic ones**. Even if a piece of UI is only used in one place initially, it should often be extracted into its own component file.

This practice moves us away from thinking "this is just a button *on the profile page*" and towards thinking "this is a `PrimaryCallToAction` button, which happens to be used on the profile page."

-----

### The "Why": Key Benefits 💡

Adopting this standard might seem like extra work upfront, but it pays significant dividends in the long run.

  * **Reusability:** The most obvious benefit. A component built for one context (`<FancyButton>`) can be immediately reused elsewhere, ensuring consistency and saving time.
  * **Maintainability & Readability:** When you need to fix a bug or update the logic of a specific UI element, you can go directly to its self-contained file. The parent component's code remains clean and declarative, describing *what* the UI is, not *how* every single part of it is built.
  * **Testability:** Small, focused components are dramatically easier to test in isolation. You can write unit tests for a button's states (disabled, loading, etc.) without needing to render an entire complex page. ✅
  * **Encapsulation & Predictability:** Styles and logic are scoped to the component. This prevents unintended side effects, where a style change in a parent component accidentally breaks a child element. It makes our UI more robust and predictable.
  * **Developer Velocity:** This approach reduces the cognitive load on developers. It's easier to understand, build, and debug a small component with a single purpose. It also enables teams to work in parallel more effectively; one developer can build a new component while another integrates it into a page.

-----

### Practical Example

Let's look at how this changes our code structure.

#### Before: Monolithic Approach

Here, the complex button logic, styling, and state are all mixed into the `UserProfile` component.

```javascript
// user-profile.js (Monolithic)

class UserProfile extends LitElement {
  
  // ... other user profile logic

  render() {
    return html`
      <div>
        <h1>${this.user.name}</h1>
        <p>Email: ${this.user.email}</p>
        
        <button 
          class="fancy-button" 
          @click=${this._handleFollow}
          ?disabled=${this.isSaving}
        >
          <svg>...</svg> ${this.isSaving ? 'Following...' : 'Follow User'}
        </button>
        <style>
          .fancy-button {
            background: blue;
            color: white;
            padding: 10px 15px;
            /* ... more styles ... */
          }
          .fancy-button:disabled {
            background: grey;
          }
        </style>
      </div>
    `;
  }
}
```

#### After: Component-Based Approach

We extract the button into its own file. The `UserProfile` component becomes much cleaner and easier to read.

```javascript
// user-profile.js (Component-Based)
import './fancy-button.js';

class UserProfile extends LitElement {

  // ... other user profile logic

  render() {
    return html`
      <div>
        <h1>${this.user.name}</h1>
        <p>Email: ${this.user.email}</p>
        
        <fancy-button
          label="Follow User"
          loadingLabel="Following..."
          ?loading=${this.isSaving}
          @click=${this._handleFollow}
        ></fancy-button>
      </div>
    `;
  }
}
```

```javascript
// fancy-button.js (New Component)

class FancyButton extends LitElement {
  static properties = {
    label: { type: String },
    loadingLabel: { type: String },
    loading: { type: Boolean, reflect: true }
  };

  render() {
    return html`
      <button ?disabled=${this.loading}>
        <svg>...</svg>
        ${this.loading ? this.loadingLabel : this.label}
      </button>
    `;
  }

  static styles = css`
    button {
      background: blue;
      color: white;
      padding: 10px 15px;
      /* ... more styles ... */
    }
    button:disabled {
      background: grey;
    }
  `;
}
customElements.define('fancy-button', FancyButton);
```

-----

### When to Create a New Component

Use these questions as a guide. If you answer "yes" to any of them, you should probably create a new component.

1.  **Could this be used again?** Even if it's a future, hypothetical use case, componentize it.
2.  **Does it have its own internal state?** (e.g., a `loading` or `toggled` state). This is a strong indicator it should be a separate component.
3.  **Is it a distinct, nameable concept?** If you can give it a clear name like `ModalHeader`, `StatusBadge`, or `SearchInput`, it deserves to be its own component.
4.  **Is its logic getting complex?** If a chunk of your `render()` method has multiple event handlers, conditional classes, and nested elements, it's time to extract it.

In short: **when in doubt, create a new component.** The initial effort is a small price to pay for a more scalable, maintainable, and professional codebase. 🔧