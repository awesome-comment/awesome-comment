import EventEmitter3 from 'eventemitter3';
import { ResponseBody } from '@awesome-comment/core/types';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import isString from 'lodash-es/isString';

type DecodedToken = JwtPayload & {
  email?: string;
  picture?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
};

export type GoogleButtonOptions = {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'small' | 'medium' | 'large';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
};

export interface AwesomeAuthProps {
  googleId: string;
  prefix?: string;
  root?: string;
}
declare global {
  function onGoogleLibraryLoad(): void;
}

export enum AwesomeAuthEvent {
  INIT = 'init',
  VERIFYING = 'verifying',
  VERIFIED = 'verified',
  REFRESH = 'refresh',
  ERROR = 'error',
}

let intervalId: ReturnType<typeof setInterval>;

export class AwesomeAuth extends EventEmitter3 {
  #accessToken: string = '';
  #decoded: DecodedToken = {};
  #expired: number = 0;
  #googleId: string;
  #isSigningIn: boolean = false;
  #isVerifying: boolean = false;
  #isVerified: boolean = false;
  #hasInitialized: boolean = false;
  #now: number;
  #prefix: string;
  #root: string;

  constructor({ googleId, prefix = 'aAuth', root = '/api' }: AwesomeAuthProps) {
    super();

    this.#googleId = googleId;
    this.#prefix = prefix;
    this.#root = root;
    this.#now = (Date.now() / 1000) >> 0;
    this.setAccessToken(localStorage.getItem(this.localKey) || '', false);
    if (this.#accessToken) {
      this.verifyToken().then((isVerified) => {
        if (!isVerified) {
          this.initGoogleIdentity();
        }
      });
      return;
    }

    this.initGoogleIdentity();
  }

  get accessToken(): string {
    return this.#accessToken;
  }
  get expiredIn(): number {
    return !this.#expired ? this.#expired - this.#now : 0;
  }
  get isVerifying(): boolean {
    return this.#isVerifying;
  }
  get isVerified(): boolean {
    return this.#isVerified;
  }
  get localKey(): string {
    return `${this.#prefix}-token`;
  }
  get root(): string {
    return this.#root;
  }
  get user(): JwtPayload {
    return this.#decoded;
  }

  doSignIn(): void {
    this.initGoogleIdentity();
  }
  doSignOut(): void {
    const hint = this.getRevokeHint();
    this.setAccessToken('');
    this.#decoded = {};
    this.#isVerified = false;
    clearInterval(intervalId);
    this.emit(AwesomeAuthEvent.VERIFIED, false);
    if (hint && 'google' in globalThis && 'accounts' in globalThis.google) {
      google.accounts.id.revoke(hint);
    }
  }
  async store(key: string, value: unknown): Promise<void> {
    value = isString(value) ? value : JSON.stringify(value);
    await fetch(`${this.#root}/store`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${this.#accessToken}`,
      },
      body: JSON.stringify({
        key,
        value,
      }),
    });
  }
  async retrieve(key: string): Promise<unknown> {
    const response = await fetch(`${this.#root}/retrieve`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${this.#accessToken}`,
      },
      body: JSON.stringify({
        key,
      }),
    });
    const { data } = (await response.json()) as ResponseBody<{ value: unknown }>;
    return data?.value;
  }

  private initGoogleIdentity() {
    if (this.#isSigningIn) return;

    this.emit(AwesomeAuthEvent.INIT, true);
    this.#isSigningIn = true;
    this.ensureGoogleIdentityInitialized()
      .then(() => {
        google.accounts.id.prompt((notification) => {
          this.handlePromptMoment(notification);
        });
      })
      .catch((error) => {
        this.#isSigningIn = false;
        this.emit(AwesomeAuthEvent.INIT, false);
        this.emit(AwesomeAuthEvent.ERROR, (error as Error).message || String(error));
      });
  }
  async renderButton(target: HTMLElement, options?: GoogleButtonOptions): Promise<void> {
    if (!target) return;
    try {
      await this.ensureGoogleIdentityInitialized();
    } catch (error) {
      this.emit(AwesomeAuthEvent.ERROR, (error as Error).message || String(error));
      return;
    }
    if (!isGoogleIdentityReady()) {
      this.emit(AwesomeAuthEvent.ERROR, 'Google Identity Services 未加载完成');
      return;
    }
    google.accounts.id.renderButton(target, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      ...options,
    } as google.accounts.id.GsiButtonConfiguration);
  }
  private async ensureGoogleIdentityInitialized(): Promise<void> {
    await loadGoogleIdentityScript();
    if (!isGoogleIdentityReady()) {
      throw new Error('Google Identity Services 未加载完成');
    }
    if (this.#hasInitialized) return;
    google.accounts.id.initialize({
      client_id: this.#googleId,
      callback: (res) => this.onGoogleIdentityCallback(res),
      auto_select: true,
      ux_mode: 'popup',
    });
    this.#hasInitialized = true;
  }
  private handlePromptMoment(notification: google.accounts.id.PromptMomentNotification): void {
    if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
      this.#isSigningIn = false;
      this.emit(AwesomeAuthEvent.INIT, false);
    }
  }
  private refreshCountDown(): void {
    this.#now = (Date.now() / 1000) >> 0;
    if (this.expiredIn <= 60) {
      clearInterval(intervalId);
      this.refreshToken();
    }
  }
  private async refreshToken(): Promise<void> {
    this.emit(AwesomeAuthEvent.REFRESH, true);
    const response = await fetch(`${this.#root}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${this.#accessToken}`,
      },
    });
    const { data } = (await response.json()) as ResponseBody<{ token: string }>;
    const { token } = data as { token: string };
    this.setAccessToken(token);
    this.emit(AwesomeAuthEvent.REFRESH, false);
  }
  private setAccessToken(token: string, local = true) {
    this.#accessToken = token;
    local && localStorage.setItem(this.localKey, token);
    if (!token) {
      this.#decoded = {};
      this.#expired = 0;
      return;
    }

    try {
      this.#decoded = jwtDecode<DecodedToken>(token);
    } catch (error) {
      this.#decoded = {};
    }
    this.#expired = this.#decoded.exp || 0;
    if (this.expiredIn > 0) {
      clearInterval(intervalId);
      intervalId = setInterval(() => this.refreshCountDown(), 1000);
    }
  }
  private async verifyToken(): Promise<boolean> {
    this.emit(AwesomeAuthEvent.VERIFYING, true);
    this.#isVerifying = true;
    try {
      const response = await fetch(`${this.#root}/verify-auth`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${this.#accessToken}`,
        },
      });
      const { data } = (await response.json()) as ResponseBody<JwtPayload>;
      if (data) {
        this.#decoded = data;
        this.#isVerified = true;
        this.emit(AwesomeAuthEvent.VERIFIED, true);
      }
    } catch (e) {
      this.#isVerified = false;
      this.emit(AwesomeAuthEvent.ERROR, (e as Error).message || String(e));
    }
    this.emit(AwesomeAuthEvent.VERIFYING, false);
    this.#isVerifying = false;
    return this.#isVerified;
  }
  private async onGoogleIdentityCallback(res: { credential: string }) {
    this.emit(AwesomeAuthEvent.INIT, false);
    this.#isSigningIn = false;
    this.emit(AwesomeAuthEvent.VERIFYING, true);
    this.#isVerifying = true;
    const response = await fetch(`${this.#root}/google-auth`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        credential: res.credential,
      }),
    });
    const { data } = (await response.json()) as ResponseBody<{ token: string }>;
    if (!data) {
      this.emit(AwesomeAuthEvent.ERROR, 'Failed to validate user.');
    }
    const { token } = data as { token: string };
    this.setAccessToken(token);
    this.emit(AwesomeAuthEvent.VERIFYING, false);
    this.#isVerifying = false;
    this.emit(AwesomeAuthEvent.VERIFIED, true);
    this.#isVerified = true;
  }
  private getRevokeHint(): string {
    const email = this.#decoded.email;
    if (typeof email === 'string' && email.trim()) return email;
    const sub = this.#decoded.sub;
    if (typeof sub === 'string' && sub.trim()) return sub;
    return '';
  }
}

let googleIdentityScriptPromise: Promise<void> | null = null;

function isGoogleIdentityReady(): boolean {
  return 'google' in globalThis && 'accounts' in globalThis.google;
}

function loadGoogleIdentityScript(): Promise<void> {
  if (isGoogleIdentityReady()) return Promise.resolve();
  if (googleIdentityScriptPromise) return googleIdentityScriptPromise;

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const src = 'https://accounts.google.com/gsi/client';
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existingScript || document.createElement('script');

    function handleLoad() {
      resolve();
    }
    function handleError() {
      reject(new Error('Google Identity Services 加载失败'));
    }

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingScript) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  googleIdentityScriptPromise.catch(() => {
    googleIdentityScriptPromise = null;
  });

  return googleIdentityScriptPromise;
}

let _client: AwesomeAuth;
export function getInstance(params: AwesomeAuthProps) {
  _client = _client || new AwesomeAuth(params);
  return _client;
}
