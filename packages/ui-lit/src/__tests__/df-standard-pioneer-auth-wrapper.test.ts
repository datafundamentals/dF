import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanupCfAuth} from '@df/state';
import '../material-design-init';
import {DfStandardPioneerAuthWrapper} from '../df-standard-pioneer-auth-wrapper';

async function settle(element: DfStandardPioneerAuthWrapper): Promise<void> {
  await element.updateComplete;
  await new Promise((resolve) => setTimeout(resolve, 0));
  await element.updateComplete;
}

describe('df-standard-pioneer-auth-wrapper', () => {
  afterEach(() => {
    document.body.replaceChildren();
    cleanupCfAuth();
    vi.unstubAllGlobals();
  });

  it('renders sign-in when there is no Access session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, {status: 401}))
    );
    const element = new DfStandardPioneerAuthWrapper();

    document.body.append(element);
    await settle(element);

    expect(
      element.shadowRoot?.querySelector('md-filled-button')?.textContent
    ).toContain('Sign in');
    expect(element.shadowRoot?.querySelector('slot')).toBeNull();
  });

  it('renders protected content and announces the authenticated user', async () => {
    const user = {
      email: 'user@example.com',
      name: 'Example User',
      sub: 'user-123',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(user), {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        })
      )
    );
    const element = new DfStandardPioneerAuthWrapper();
    const listener = vi.fn();
    element.addEventListener(
      'df-standard-pioneer-auth-wrapper-user-changed',
      listener
    );

    document.body.append(element);
    await settle(element);

    expect(element.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(
      element.shadowRoot?.querySelector('.user-name')?.textContent
    ).toContain('Example User');
    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      newValue: user,
    });
  });

  it('omits the built-in header in headless mode', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({email: 'user@example.com', sub: 'user-123'}),
          {
            status: 200,
          }
        )
      )
    );
    const element = new DfStandardPioneerAuthWrapper();
    element.headless = true;

    document.body.append(element);
    await settle(element);

    expect(element.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(element.shadowRoot?.querySelector('.full-width-div')).toBeNull();
  });
});
