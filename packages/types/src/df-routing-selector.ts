/**
 * Canonical types for the routing selector: the host that composes a fork choice and a
 * position on a five-stop scale into a single identifier.
 *
 * The two steps are deliberately sequential rather than shown together. A visitor picks
 * a door, then places themselves within it.
 */

import type {PositionScaleValue} from './df-position-scale.js';

/** The two labelled anchors for one fork's scale. Stops 1, 3 and 5 stay unnamed. */
export interface ForkAnchors {
  /** Visible label for stop 2. */
  low: string;
  /** Visible label for stop 4. */
  high: string;
}

/** A completed selection: a door plus a position within it. */
export interface RoutingSelection {
  forkId: string;
  position: PositionScaleValue;
  /** `forkId` and position joined, e.g. `dev-4`. Stable and safe to persist. */
  category: string;
}

/** Payload of the `df-routing-selector-change` event. */
export type RoutingSelectorChangeDetail = RoutingSelection;
