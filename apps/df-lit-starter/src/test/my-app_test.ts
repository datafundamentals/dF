import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import {
  DEFAULT_LIT_STARTER_NAME,
  litStarterState,
  resetLitStarterState,
} from '@df/state';
import type {MyElement} from '@df/ui-lit/my-element.js';
import type {LitElement} from 'lit';
import '../my-app.js';

type MyAppElement = LitElement & HTMLElement;

type MyElementWidget = MyElement;

suite('my-app', () => {
  setup(() => {
    resetLitStarterState();
  });

  teardown(() => {
    resetLitStarterState();
  });

  test('is defined', () => {
    const el = document.createElement('my-app');
    assert.instanceOf(el, customElements.get('my-app')!);
  });

  test('renders default snapshot', async () => {
  const el = await fixture<MyAppElement>(html`<my-app></my-app>`);
    await el.updateComplete;

  const shadowRoot = el.shadowRoot!;
  const widget = shadowRoot.querySelector('my-element') as MyElementWidget | null;
    assert.exists(widget);
    assert.equal(widget?.name, DEFAULT_LIT_STARTER_NAME);
    assert.equal(widget?.count, 0);

    const snapshot = litStarterState.get();
    assert.equal(snapshot.name, DEFAULT_LIT_STARTER_NAME);
    assert.equal(snapshot.clickCount, 0);
  });

  test('updates name from text input', async () => {
  const el = await fixture<MyAppElement>(html`<my-app></my-app>`);
    await el.updateComplete;

  const input = el.shadowRoot!.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Signals';
    input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    await el.updateComplete;

    const snapshot = litStarterState.get();
    assert.equal(snapshot.name, 'Signals');
    assert.equal(snapshot.greeting, 'Hello, Signals!');
  });

  test('increments count via primary action', async () => {
  const el = await fixture<MyAppElement>(html`<my-app></my-app>`);
    await el.updateComplete;

  const primaryButton = el.shadowRoot!.querySelector('button.primary') as HTMLButtonElement;
    primaryButton.click();
    await el.updateComplete;

    assert.equal(litStarterState.get().clickCount, 1);

  const widget = el.shadowRoot!.querySelector('my-element') as MyElementWidget;
    assert.equal(widget.count, 1);
  });

  test('reset action restores defaults', async () => {
  const el = await fixture<MyAppElement>(html`<my-app></my-app>`);
    await el.updateComplete;

  const input = el.shadowRoot!.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Reset Me';
    input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));

  const primaryButton = el.shadowRoot!.querySelector('button.primary') as HTMLButtonElement;
    primaryButton.click();

    await el.updateComplete;

  const resetButton = el.shadowRoot!.querySelector('button.secondary') as HTMLButtonElement;
    resetButton.click();
    await el.updateComplete;

    const snapshot = litStarterState.get();
    assert.equal(snapshot.name, DEFAULT_LIT_STARTER_NAME);
    assert.equal(snapshot.clickCount, 0);
  });
});
