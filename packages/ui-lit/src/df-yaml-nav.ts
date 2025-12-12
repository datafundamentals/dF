/**
 * DF YAML Navigation Component
 *
 * Navigation control for moving between YAML files in a directory.
 * Displays Up/Down buttons and current position indicator.
 *
 * ⚠️ STANDARDS COMPLIANCE NOTE ⚠️
 *
 * This component uses native <button> elements styled to match compact navigation
 * patterns in VSCode extensions. Material Web does not provide a compact navigation
 * button pattern suitable for tight space constraints (24px height, minimal padding).
 *
 * ✅ ALLOWED: Custom compact UI implementations for VSCode extension contexts where
 * Material Web components would be visually inappropriate or too large.
 * ❌ FORBIDDEN: Using native buttons in standard web app contexts where MD3 buttons
 * should be used.
 *
 * See: guides/STANDARDS_STYLES.md#md3-gaps
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('df-yaml-nav')
export class DfYamlNav extends LitElement {
  @property({ type: String }) currentFile = '';
  @property({ type: Array }) yamlFiles: string[] = [];

  static override styles = css`
    :host {
      display: inline-block;
      font-family: var(--vscode-font-family, var(--md-sys-typescale-body-medium-font, 'Roboto', sans-serif));
    }

    .container {
      display: flex;
      border: 1px solid var(--vscode-panel-border, var(--md-sys-color-outline, rgba(0, 0, 0, 0.12)));
      border-radius: 12px;
      overflow: hidden;
      height: 24px;
    }

    .button {
      flex: 1;
      padding: 2px 8px;
      text-align: center;
      cursor: pointer;
      background-color: var(--vscode-button-secondaryBackground, var(--md-sys-color-surface, #ffffff));
      color: var(--vscode-button-secondaryForeground, var(--md-sys-color-on-surface, #1c1b1f));
      border: none;
      outline: none;
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      transition: background-color 0.1s;
      white-space: nowrap;
    }

    .button:hover:not(.disabled) {
      background-color: var(--vscode-button-secondaryHoverBackground, var(--md-sys-color-surface-variant, #e7e0ec));
    }

    .button.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .button:not(:last-child) {
      border-right: 1px solid var(--vscode-panel-border, var(--md-sys-color-outline, rgba(0, 0, 0, 0.12)));
    }

    .position {
      flex: 0 0 auto;
      padding: 2px 8px;
      text-align: center;
      background-color: var(--vscode-editor-background, var(--md-sys-color-surface-variant, #e7e0ec));
      color: var(--vscode-foreground, var(--md-sys-color-on-surface-variant, #49454f));
      font-size: 0.7rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid var(--vscode-panel-border, var(--md-sys-color-outline, rgba(0, 0, 0, 0.12)));
      opacity: 0.6;
      min-width: 32px;
    }
  `;

  private _getCurrentIndex(): number {
    if (!this.currentFile || this.yamlFiles.length === 0) {
      return 0;
    }
    return this.yamlFiles.indexOf(this.currentFile);
  }

  private _handleUp() {
    const currentIndex = this._getCurrentIndex();
    if (currentIndex > 0) {
      const nextFile = this.yamlFiles[currentIndex - 1];
      this.dispatchEvent(new CustomEvent('navigate', {
        detail: { fileName: nextFile, direction: 'up' },
        bubbles: true,
        composed: true
      }));
    }
  }

  private _handleDown() {
    const currentIndex = this._getCurrentIndex();
    if (currentIndex < this.yamlFiles.length - 1) {
      const nextFile = this.yamlFiles[currentIndex + 1];
      this.dispatchEvent(new CustomEvent('navigate', {
        detail: { fileName: nextFile, direction: 'down' },
        bubbles: true,
        composed: true
      }));
    }
  }

  override render() {
    const currentIndex = this._getCurrentIndex();
    const position = this.yamlFiles.length > 0
      ? `${currentIndex + 1}/${this.yamlFiles.length}`
      : '0/0';

    const upDisabled = currentIndex <= 0;
    const downDisabled = currentIndex >= this.yamlFiles.length - 1;

    return html`
      <div class="container">
        <!-- md3-gap: compact navigation pattern for VSCode extensions, Material Web doesn't provide compact nav buttons -->
        <button
          class=${classMap({ button: true, disabled: upDisabled })}
          type="button"
          ?disabled=${upDisabled}
          @click=${this._handleUp}
          aria-label="Navigate to previous file">
          ↑ Up
        </button>
        <div class="position" aria-live="polite">${position}</div>
        <!-- md3-gap: compact navigation pattern for VSCode extensions, Material Web doesn't provide compact nav buttons -->
        <button
          class=${classMap({ button: true, disabled: downDisabled })}
          type="button"
          ?disabled=${downDisabled}
          @click=${this._handleDown}
          aria-label="Navigate to next file">
          Down ↓
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-yaml-nav': DfYamlNav;
  }
}
