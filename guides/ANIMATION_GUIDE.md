# ARCHITECTURE GUIDE: Standards-Based Animations in Lit (2026)

## 1. Core Philosophy

This project prioritizes **Web Standards** over third-party libraries. We utilize native browser capabilities to minimize bundle size, maximize performance, and ensure long-term maintainability.

* **Logic:** Managed via Lit's reactive properties and lifecycle.
* **Engine:** Web Animations API (WAAPI) for programmatic control.
* **Transitions:** View Transitions API for state-to-state morphing.
* **Styling:** CSS Custom Properties (Variables) for declarative state updates.

---

## 2. Animation Strategy Hierarchy

When implementing visual changes, follow this order of operations:

### A. View Transitions (State Morphing)

Use for high-level UI changes or adding/removing elements (e.g., adding a new circle to a Venn diagram).

* **Implementation:** Wrap property updates in `document.startViewTransition()`.
* **Requirement:** Assign `view-transition-name: [unique-name]` to elements that should "morph" between states.

### B. Web Animations API (WAAPI)

Use for fine-grained, imperative animations (e.g., precise movement, looping pulses, or sequenced pathing).

* **Implementation:** Access elements via Lit's `@query` or `@queryAll`.
* **Pros:** Native performance, interruptible, and composable in TypeScript.

### C. Declarative CSS Variables

Use for continuous values or simple transitions.

* **Implementation:** Bind Lit properties to CSS Variables in the `style` attribute of the SVG/HTML.

---

## 3. SVG Coordinate Systems & Math

When building complex diagrams like Venn Diagrams in Lit, follow these rules for coordinate management:

### ViewBox and Scaling

Always use a fixed `viewBox` (e.g., `0 0 100 100`) to decouple the internal coordinate system from the component's actual pixel size. This makes math predictable.

### Mathematical Utilities

For Venn diagrams or iterative geometry:

* **Calculations:** Perform trigonometry/geometry in getters or dedicated utility functions.
* **Path Data:** Use template literals for `d` attributes, but keep logic clean.

```typescript
// Example: Calculating intersection points for Venn circles
get circleStyles() {
  const overlap = this.calculateOverlap(this.radius, this.distance);
  return html`
    <circle cx="${50 - this.distance}" cy="50" r="${this.radius}" />
    <circle cx="${50 + this.distance}" cy="50" r="${this.radius}" />
  `;
}

```

---

## 4. Implementation Patterns for Coding Agents

### Pattern: The "Smooth State" Update

```typescript
async updateState(payload: Partial<MyComponent>) {
  if (!document.startViewTransition) {
    Object.assign(this, payload);
    return;
  }

  // Captures current state, updates properties, then animates to new state
  const transition = document.startViewTransition(() => {
    Object.assign(this, payload);
  });
  
  await transition.finished;
}

```

### Pattern: Reactive SVG Animation (WAAPI)

```typescript
@query('#indicator')
_indicator!: SVGPathElement;

protected updated(changedProperties: PropertyValues) {
  if (changedProperties.has('active')) {
    this._indicator.animate([
      { strokeDashoffset: '100' },
      { strokeDashoffset: '0' }
    ], { duration: 300, easing: 'ease-out', fill: 'forwards' });
  }
}

```

---

## 5. Constraint Checklist

Before adding a dependency (like GSAP or D3), the coding agent must verify:

1. **Can it be done with SVG `path()` interpolation?** 2.  **Can it be done with a `requestAnimationFrame` loop?** 3.  **Is the complexity strictly mathematical?** Use a math utility (like `d3-shape`) rather than a full animation framework.