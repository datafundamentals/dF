import './configure-backend.js';
import '@df/ui-lit/df-standard-pioneer-auth-wrapper';
import './bucket-locator-panels.js';
import './bucket-record-manager.js';
import './bucket-locator-app.js';

const globalStyles = document.createElement('style');
globalStyles.dataset.bucketLocatorGlobal = '';
globalStyles.textContent = `
	@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');
	:root {
		color-scheme: light;
		--md-sys-color-primary: #174c3d;
		--md-sys-color-on-primary: #ffffff;
		--md-sys-color-surface: #f5f5ed;
		--md-sys-color-on-surface: #202824;
		--md-sys-color-surface-container: #e9eee7;
		--md-sys-color-error: #812f22;
		font-family: 'DM Sans', 'Avenir Next', sans-serif;
		background-color: #f5f5ed;
		background-image: repeating-linear-gradient(0deg, transparent 0 31px, rgb(23 76 61 / 3%) 32px);
	}
	body { min-width: 320px; min-height: 100vh; margin: 0; }
	bucket-locator-app { display: block; }
`;
if (!document.head.querySelector('[data-bucket-locator-global]')) {
	document.head.append(globalStyles);
}