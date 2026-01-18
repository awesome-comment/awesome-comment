import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AwesomeAuth, AwesomeAuthEvent } from '../../src/auth';

type PromptCallback = (notification: google.accounts.id.PromptMomentNotification) => void;

type PromptState = 'not-displayed' | 'skipped' | 'dismissed' | 'displayed';

function createPromptNotification(state: PromptState): google.accounts.id.PromptMomentNotification {
  return {
    isDisplayMoment: () => state === 'displayed' || state === 'not-displayed',
    isDisplayed: () => state === 'displayed',
    isNotDisplayed: () => state === 'not-displayed',
    getNotDisplayedReason: () => 'suppressed_by_user',
    isSkippedMoment: () => state === 'skipped',
    getSkippedReason: () => 'user_cancel',
    isDismissedMoment: () => state === 'dismissed',
    getDismissedReason: () => 'cancel_called',
    getMomentType: () => {
      if (state === 'skipped') return 'skipped';
      if (state === 'dismissed') return 'dismissed';
      return 'display';
    },
  } as unknown as google.accounts.id.PromptMomentNotification;
}

describe('AwesomeAuth One Tap', () => {
  let promptCallbacks: PromptCallback[];
  let initialize: ReturnType<typeof vi.fn>;
  let prompt: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    promptCallbacks = [];
    initialize = vi.fn();
    prompt = vi.fn((callback?: PromptCallback) => {
      if (callback) {
        promptCallbacks.push(callback);
      }
    });

    const googleMock = {
      accounts: {
        id: {
          initialize,
          prompt,
        },
      },
    };

    (globalThis as typeof globalThis & { google: typeof google }).google = googleMock as unknown as typeof google;

    const storage = new Map<string, string>();
    const localStorageMock: Storage = {
      get length() {
        return storage.size;
      },
      clear() {
        storage.clear();
      },
      getItem(key: string) {
        return storage.get(key) ?? null;
      },
      key(index: number) {
        return Array.from(storage.keys())[index] ?? null;
      },
      removeItem(key: string) {
        storage.delete(key);
      },
      setItem(key: string, value: string) {
        storage.set(key, String(value));
      },
    };
    (globalThis as typeof globalThis & { localStorage: Storage }).localStorage = localStorageMock;
  });

  afterEach(() => {
    delete (globalThis as typeof globalThis & { google?: typeof google }).google;
    delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    promptCallbacks = [];
    vi.clearAllMocks();
  });

  it('在提示被关闭后重置初始化状态，并允许再次唤起', () => {
    const events: boolean[] = [];
    const auth = new AwesomeAuth({ googleId: 'test-client' });
    auth.on(AwesomeAuthEvent.INIT, (value: boolean) => {
      events.push(value);
    });

    expect(promptCallbacks).toHaveLength(1);
    promptCallbacks[0](createPromptNotification('dismissed'));

    expect(events).toEqual([false]);

    auth.doSignIn();
    expect(promptCallbacks).toHaveLength(2);
    expect(events[1]).toBe(true);
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('在提示未显示时结束初始化状态', () => {
    const events: boolean[] = [];
    const auth = new AwesomeAuth({ googleId: 'test-client' });
    auth.on(AwesomeAuthEvent.INIT, (value: boolean) => {
      events.push(value);
    });

    expect(promptCallbacks).toHaveLength(1);
    promptCallbacks[0](createPromptNotification('not-displayed'));

    expect(events).toEqual([false]);
  });
});
