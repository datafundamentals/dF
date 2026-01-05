/**
 * ✅ MD3-Compliant Component
 * Goldilocks Configuration Creator - Interactive Venn diagram for "Pick 2" selections
 *
 * Animation Strategy (follows guides/ANIMATION_GUIDE.md):
 * - View Transitions API for high-level state changes
 * - Web Animations API (WAAPI) for fine-grained control
 * - SVG with viewBox="0 0 100 100" for predictable coordinates
 */

import {LitElement, html, css, nothing, type PropertyValues} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  goldilocksTypeCollectionState,
  saveGoldilocksConfiguration,
} from '@df/state';
import type {GoldilocksTypeDocument} from '@df/types';

interface Circle {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  labelX?: number;
  labelY?: number;
}

@customElement('df-goldilocks-configuration-creator')
export class DfGoldilocksConfigurationCreator extends SignalWatcher(LitElement) {
  @state() private selectedTypeId: string = '';
  @state() private selectedOptions: string[] = [];
  @state() private note = '';
  @state() private isSaving = false;
  @state() private saveMessage: {variant: 'success' | 'error'; text: string} | null = null;

  static override styles = css`
    :host {
      display: block;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .message {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.9rem;
    }

    .message.success {
      background: rgba(16, 185, 129, 0.15);
      color: #047857;
    }

    .message.error {
      background: rgba(248, 113, 113, 0.18);
      color: #b91c1c;
    }

    .diagram-container {
      position: relative;
      width: 100%;
      max-width: 500px;
      margin: 2rem auto;
      border: 1px dashed rgba(148, 163, 184, 0.5);
      border-radius: 12px;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .circle {
      cursor: pointer;
      transition: opacity 0.3s ease;
    }

    .circle.selected {
      stroke: #10b981;
      stroke-width: 2;
    }

    .circle.faded {
      opacity: 0.3;
    }

    .circle-label {
      font-weight: 600;
      fill: var(--md-sys-color-on-surface, #0f172a);
      text-anchor: middle;
      pointer-events: none;
      user-select: none;
    }

    .instruction {
      text-align: center;
      color: var(--md-sys-color-on-surface-variant, #64748b);
      font-size: 0.9rem;
      margin: 1rem 0;
    }

    .save-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .venn-overlap {
      fill: rgba(16, 185, 129, 0.3);
      pointer-events: none;
    }
  `;

  override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    const state = goldilocksTypeCollectionState.get();
    const types = state.documents;

    // Auto-select first type if none selected
    if (!this.selectedTypeId && types.length > 0) {
      this.selectedTypeId = types[0].id;
    }
  }

  override render() {
    const state = goldilocksTypeCollectionState.get();
    const types = state.documents;

    if (types.length === 0) {
      return html`<p class="instruction">No goldilocks types available. Create one below!</p>`;
    }

    const selectedType = types.find((t) => t.id === this.selectedTypeId);

    return html`
      <div class="controls">
        <md-filled-select
          label="Select Goldilocks Type"
          .value=${this.selectedTypeId}
          @change=${this.handleTypeChange}
        >
          ${types.map(
            (type) => html`
              <md-select-option .value=${type.id}>
                <div slot="headline">${type.name}</div>
              </md-select-option>
            `
          )}
        </md-filled-select>
      </div>

      ${this.saveMessage
        ? html`<div class="message ${this.saveMessage.variant}">${this.saveMessage.text}</div>`
        : nothing}

      ${selectedType ? this.renderDiagram(selectedType) : nothing}
    `;
  }

  private renderDiagram(type: GoldilocksTypeDocument) {
    const circles = this.getCirclePositions(type);
    const canSave = this.selectedOptions.length === 2;

    return html`
      <p class="instruction">
        ${this.selectedOptions.length === 0 ? 'Click to pick 2 options' : nothing}
        ${this.selectedOptions.length === 1 ? 'Pick 1 more option' : nothing}
        ${this.selectedOptions.length === 2
          ? html`<strong>Selected: ${this.selectedOptions.join(' + ')}</strong>`
          : nothing}
      </p>

      <div class="diagram-container">
        <svg viewBox="0 0 100 100">
          <circle
            class="circle"
            cx=${circles[0].x}
            cy=${circles[0].y}
            r=${circles[0].r}
            fill=${this.getCircleColor(circles[0].id)}
            opacity="0.7"
            stroke="black"
            stroke-width="1"
            @click=${() => this.handleCircleClick(circles[0].label)}
          />
          <text
            class="circle-label"
            x=${circles[0].labelX ?? circles[0].x}
            y=${circles[0].labelY ?? circles[0].y}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size=${this.getLabelFontSize(circles[0].label)}
          >
            ${circles[0].label}
          </text>

          <circle
            class="circle"
            cx=${circles[1].x}
            cy=${circles[1].y}
            r=${circles[1].r}
            fill=${this.getCircleColor(circles[1].id)}
            opacity="0.7"
            stroke="black"
            stroke-width="1"
            @click=${() => this.handleCircleClick(circles[1].label)}
          />
          <text
            class="circle-label"
            x=${circles[1].labelX ?? circles[1].x}
            y=${circles[1].labelY ?? circles[1].y}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size=${this.getLabelFontSize(circles[1].label)}
          >
            ${circles[1].label}
          </text>

          <circle
            class="circle"
            cx=${circles[2].x}
            cy=${circles[2].y}
            r=${circles[2].r}
            fill=${this.getCircleColor(circles[2].id)}
            opacity="0.7"
            stroke="black"
            stroke-width="1"
            @click=${() => this.handleCircleClick(circles[2].label)}
          />
          <text
            class="circle-label"
            x=${circles[2].labelX ?? circles[2].x}
            y=${circles[2].labelY ?? circles[2].y}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size=${this.getLabelFontSize(circles[2].label)}
          >
            ${circles[2].label}
          </text>

          <path class="venn-overlap" d=${this.getVennOverlapPath(circles)} />
        </svg>
      </div>

      ${canSave
        ? html`
            <div class="save-actions">
              <md-outlined-text-field
                label="Optional Note"
                .value=${this.note}
                @input=${(e: Event) => (this.note = (e.target as HTMLInputElement).value)}
                ?disabled=${this.isSaving}
              >
              </md-outlined-text-field>

              <md-filled-button @click=${this.handleSave} ?disabled=${this.isSaving}>
                Save Configuration
              </md-filled-button>
              <md-text-button @click=${this.handleReset} ?disabled=${this.isSaving}>
                Start Over
              </md-text-button>
            </div>
          `
        : nothing}
    `;
  }

  private getCirclePositions(type: GoldilocksTypeDocument): Circle[] {
    const options = [type.first, type.second, type.third];

    if (this.selectedOptions.length < 2) {
      // Initial layout: 3 circles in a triangle
      // For long labels, adjust positions to prevent overlap while keeping inside circles
      const bottomLeft = options[1].length > 6 ? 23 : 30;
      const bottomRight = options[2].length > 6 ? 77 : 70;

      return [
        {id: 'first', label: options[0], x: 50, y: 25, r: 15},
        {id: 'second', label: options[1], x: 30, y: 65, r: 15, labelX: bottomLeft, labelY: 65},
        {id: 'third', label: options[2], x: 70, y: 65, r: 15, labelX: bottomRight, labelY: 65},
      ];
    }

    // Venn diagram layout: 2 selected circles overlap, 1 faded to the side
    const selectedIndices = options
      .map((opt, idx) => (this.selectedOptions.includes(opt) ? idx : -1))
      .filter((idx) => idx !== -1);

    const fadedIndex = [0, 1, 2].find((idx) => !selectedIndices.includes(idx))!;

    const circles: Circle[] = [];
    selectedIndices.forEach((idx, position) => {
      const circleX = position === 0 ? 35 : 55;
      const circleY = 40;
      circles.push({
        id: ['first', 'second', 'third'][idx],
        label: options[idx],
        x: circleX,
        y: circleY,
        r: 18,
        // Move labels away from overlap but keep inside circles
        labelX: position === 0 ? circleX - 10 : circleX + 10,
        labelY: circleY,
      });
    });

    // Faded circle
    circles.push({
      id: ['first', 'second', 'third'][fadedIndex],
      label: options[fadedIndex],
      x: 85,
      y: 75,
      r: 10,
    });

    return circles;
  }

  private getVennOverlapPath(circles: Circle[]): string {
    if (this.selectedOptions.length !== 2 || circles.length < 2) {
      return '';
    }

    const [c1, c2] = circles.slice(0, 2);
    return this.calculateIntersectionPath(c1, c2);
  }

  private calculateIntersectionPath(c1: Circle, c2: Circle): string {
    const d = Math.sqrt(Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2));

    if (d >= c1.r + c2.r || d <= Math.abs(c1.r - c2.r)) {
      return '';
    }

    const a = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d);
    const h = Math.sqrt(c1.r * c1.r - a * a);

    const x2 = c1.x + (a * (c2.x - c1.x)) / d;
    const y2 = c1.y + (a * (c2.y - c1.y)) / d;

    const rx = (-(c2.y - c1.y) * h) / d;
    const ry = ((c2.x - c1.x) * h) / d;

    const p1x = x2 + rx;
    const p1y = y2 + ry;
    const p2x = x2 - rx;
    const p2y = y2 - ry;

    return `M ${p1x} ${p1y} A ${c1.r} ${c1.r} 0 0 1 ${p2x} ${p2y} A ${c2.r} ${c2.r} 0 0 1 ${p1x} ${p1y}`;
  }

  private getCircleColor(id: string): string {
    const colors = {
      first: '#3b82f6',
      second: '#10b981',
      third: '#f59e0b',
    };
    return colors[id as keyof typeof colors] || '#6b7280';
  }

  private getLabelFontSize(label: string): number {
    // Base font size for short labels (1-4 chars)
    const baseFontSize = 8;
    // Scale down for longer labels
    if (label.length <= 4) return baseFontSize;
    if (label.length <= 6) return 6;
    if (label.length <= 9) return 5;
    return 4; // For very long labels
  }

  private handleTypeChange(e: Event): void {
    const select = e.target as unknown as {value: string};
    this.selectedTypeId = select.value;
    this.selectedOptions = [];
    this.note = '';
    this.saveMessage = null;
    // Force re-render to update diagram with new type
    this.requestUpdate();
  }

  private handleCircleClick(label: string): void {
    if (this.selectedOptions.includes(label)) {
      // Deselect
      this.selectedOptions = this.selectedOptions.filter((opt) => opt !== label);
    } else if (this.selectedOptions.length < 2) {
      // Select
      this.selectedOptions = [...this.selectedOptions, label];
    }

    this.requestUpdate();
  }

  private handleReset(): void {
    this.selectedOptions = [];
    this.note = '';
    this.saveMessage = null;
  }

  private async handleSave(): Promise<void> {
    const state = goldilocksTypeCollectionState.get();
    const selectedType = state.documents.find((t) => t.id === this.selectedTypeId);

    if (!selectedType || this.selectedOptions.length !== 2) {
      this.saveMessage = {variant: 'error', text: 'Please select exactly 2 options.'};
      return;
    }

    this.isSaving = true;
    this.saveMessage = null;

    try {
      await saveGoldilocksConfiguration({
        goldilocksTypeName: selectedType.name,
        first: selectedType.first,
        second: selectedType.second,
        third: selectedType.third,
        selectedOptions: [this.selectedOptions[0], this.selectedOptions[1]],
        note: this.note || null,
      });

      this.saveMessage = {variant: 'success', text: 'Configuration saved successfully!'};
      this.handleReset();

      setTimeout(() => (this.saveMessage = null), 3000);
    } catch (error) {
      console.error('[df-goldilocks-configuration-creator] Save error', error);
      this.saveMessage = {
        variant: 'error',
        text: error instanceof Error ? error.message : 'Failed to save configuration.',
      };
    } finally {
      this.isSaving = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-goldilocks-configuration-creator': DfGoldilocksConfigurationCreator;
  }
}
