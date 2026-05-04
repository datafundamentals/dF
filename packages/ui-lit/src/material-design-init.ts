/**
 * Centralized Material Design 3 Component Registration (Shared UI Package)
 *
 * This file imports all MD3 components used by the shared @df/ui-lit components.
 * By importing them here ONCE, we prevent duplicate CustomElementRegistry errors
 * when multiple components in the same page need MD3 elements.
 *
 * Consumers should import this file early in their application initialization.
 */

// Buttons
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';

// Text Input
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/textfield/filled-text-field.js';

// Selection
import '@material/web/select/filled-select.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/switch/switch.js';

// Progress
import '@material/web/progress/circular-progress.js';
import '@material/web/progress/linear-progress.js';

// Icons
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';

// Other Components
import '@material/web/divider/divider.js';
import '@material/web/dialog/dialog.js';
