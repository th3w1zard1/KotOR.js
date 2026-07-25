import { installDevInputGuard, resetDevInputGuardForTests } from '@/dev/DevInputGuard';

function createWindowStub() {
  const listeners = new Map<string, Set<EventListener>>();
  return {
    __KOTOR_DEV_INPUT_GUARD__: undefined as boolean | undefined,
    addEventListener(type: string, listener: EventListener, capture?: boolean) {
      const key = capture ? `${type}:capture` : type;
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(listener);
    },
    dispatchKey(key: string): { defaultPrevented: boolean } {
      const event = {
        key,
        defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; },
      };
      listeners.get('keydown:capture')?.forEach(fn => fn(event as any));
      return event;
    },
    document: {
      body: { innerHTML: '', appendChild: jest.fn() },
      createElement: () => ({ setAttribute: jest.fn(), style: {}, textContent: '' }),
    },
    setTimeout: (fn: () => void) => { fn(); return 1; },
  };
}

beforeEach(() => {
  (globalThis as any).window = createWindowStub();
  (globalThis as any).document = (globalThis as any).window.document;
});

afterEach(() => {
  delete (globalThis as any).window;
  delete (globalThis as any).document;
});

describe('DevInputGuard', () => {
  it('prevents default on F5 in dev', () => {
    installDevInputGuard();
    const event = (window as any).dispatchKey('F5');
    expect(event.defaultPrevented).toBe(true);
  });

  it('does not prevent default on other keys', () => {
    installDevInputGuard();
    const event = (window as any).dispatchKey('F4');
    expect(event.defaultPrevented).toBe(false);
  });

  it('installs only once', () => {
    installDevInputGuard();
    installDevInputGuard();
    expect((window as any).__KOTOR_DEV_INPUT_GUARD__).toBe(true);
  });
});
