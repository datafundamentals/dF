/**
 * @df/ui-lit - Shared UI Components Library
 *
 * IMPORTANT: This module automatically imports Material Design 3 components
 * on load to prevent CustomElementRegistry duplicate registration errors.
 * See material-design-init.ts for details.
 */

// Import Material Design 3 components ONCE, before exporting any components
import './material-design-init.js';

export * from './remove-replace-me.js';
export * from './my-element.js';
export * from './df-segmented-button.js';
export * from './df-upload-link.js';
export * from './df-practice-widget.js';
export * from './df-npm-info-widget.js';
export * from './df-chat-widget.js';
export * from './df-markdown-codemirror.js';
export * from './df-google-signin.js';
export * from './df-auth-wrapper.js';
export * from './firebase/index.js';
