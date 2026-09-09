/**
 * Canonical types for the fork toggle: an exclusive choice between a small number of
 * doors, each carrying a short label and a line of supporting text.
 *
 * Option ids are caller-defined and opaque to the component, so no consuming site's
 * vocabulary leaks into `@df/ui-lit`.
 */

/** One door of the fork. */
export interface ForkOption {
  /** Caller-defined, stable, and used verbatim when composing downstream identifiers. */
  id: string;
  label: string;
  /** Supporting line beneath the label. */
  sublabel: string;
}

/** Reactive state owned by the fork store. `null` means nothing is chosen yet. */
export interface ForkConfig {
  selectedId: string | null;
}

/** Payload of the `df-fork-toggle-change` event. */
export interface ForkChangeDetail {
  id: string;
}
